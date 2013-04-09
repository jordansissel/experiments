require "ffi-rzmq"

# Give me a singleton context.
class ZMQ::Context
  def self.get
    @context ||= ZMQ::Context.new
    return @context
  end
end

# A StemCell is a remote process that can become anything
class StemCell < BasicObject
  class RPCError < ::StandardError; end
  class Timeout < RPCError; end
  class InvalidCall < RPCError; end

  attr_reader :pid

  private
  def initialize(address)
    @address = address
    spawn
  end
 
  def terminate(timeout_ms=nil)
    ::Kernel.puts :term => @pid
    ::Process.kill("TERM", @pid)

    return ::Process.waitpid(@pid) if timeout_ms.nil?

    expire = ::Time.now + (timeout_ms / 1000)
    result = nil
    while ::Time.now < expire
      result = ::Process.waitpid(@pid, ::Process::WNOHANG)
      # Sleep so we don't spin cpu waiting for reaping.
      ::Kernel.sleep(0.050)
    end
    if result.nil?
      # Still not dead, kill it hard.
      ::Process.kill("KILL", @pid)
      result = ::Process.waitpid(@pid, ::Process::WNOHANG)
    end
    return result
  end

  def call_block(method, *args)
    return call_timeout(method, -1, *args)
  end # def call

  def call(method, timeout_ms, *args)
    ensure_connected(timeout_ms)

    msg = ::Marshal.dump([method, *args])
    poller = ::ZMQ::Poller.new
    poller.register(@socket, ::ZMQ::POLLOUT)
    ::Kernel.raise Timeout, method if poller.poll(timeout_ms) == 0
    @socket.send_string(msg)

    poller = ::ZMQ::Poller.new
    poller.register(@socket, ::ZMQ::POLLIN)
    ::Kernel.raise Timeout, method if poller.poll(timeout_ms) == 0
    reply = ""
    @socket.recv_string(reply, ::ZMQ::NonBlocking)
    result = ::Marshal.load(reply)
    return result
  end # def call

  def ensure_connected(timeout_ms=-1)
    return unless @socket.nil?
    @socket = ::ZMQ::Context.get.socket(::ZMQ::REQ)
    start = ::Time.now
    timeout_secs = timeout_ms * 1000
    while true
      Kernel.raise Timeout, "zmq connect(#{@address})" if ::Time.now - start > timeout_secs
      rc = @socket.connect(@address)
      break if rc == 0
    end
  end

  # Spawn the worker as a subprocess
  def spawn
    # TODO(sissel): Do this in a platform-safe way (ruby, jruby, etc)
    @pid = ::Process.fork do
      begin
        run 
      rescue => e
        puts :CHILDERR => e
      end
      exit 0
    end
  end # def spawn

  # This process is intended to execute in the subprocess.
  def run
    @is_inside_cell = true
    z = ::ZMQ::Context.get.socket(::ZMQ::REP)
    rc = z.bind(@address)
    if !::ZMQ::Util.resultcode_ok?(rc)
      puts :zmq_bind_failed => ::ZMQ::Util.error_string
    end

    request = ""
    while true
      rc = z.recv_string(request)
      if !::ZMQ::Util.resultcode_ok?(rc)
        puts "$$: recv_string failed: #{::ZMQ::Util.error_string}. Aborting"
        exit 1
      end

      method, *args = ::Marshal.load(request)

      begin
        #::Kernel.puts("call(#{method}, #{args})")
        result = case method
          when :differentiate
            __send__(method, *args)
          else
            @cell.send(method, *args)
        end
        z.send_string(::Marshal.dump(result))
      rescue => e
        # TODO(sissel): improve protocol for indicating exceptions
        ::Kernel.puts("call(#{method}, #{args}) => Exception: #{e}")
        z.send_string(::Marshal.dump(e))
      end
    end
  end # def run

  def differentiate(klass, *args)
    if @is_inside_cell
      @cell = klass.new(*args)
      ::Kernel.puts("New cell type: #{@cell}")
    else
      return call(:differentiate, 4000, klass, *args)
    end
  end # def differentiate

  public(:initialize, :call, :call_block, :terminate, :differentiate)
end
