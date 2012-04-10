require "socket"
require "cabin" # rubygem 'cabin'

version = RUBY_VERSION
platform = case RUBY_PLATFORM
  when "java"; "jruby-#{JRUBY_VERSION}"
  else "ruby"
end

environment = [version, platform].join(" @ ")
$logger = Cabin::Channel.get
$logger.subscribe(STDOUT)
$logger.level = $DEBUG ? :debug : :info
$logger[:platform] = environment

def connect(host, port, options={})
  timeout = options[:timeout]
  socket = Socket.new(Socket::AF_INET, Socket::SOCK_STREAM, 0)
  sockaddr = Socket.sockaddr_in(port, host)
  tries = 10
  start = Time.now
  begin
    $logger.debug("trying to connect")
    socket.connect_nonblock(sockaddr)
  rescue Errno::EINPROGRESS
    # Block until the socket is ready, then try again
    reader, writer, error = IO.select([socket], [socket], [socket], timeout)
    $logger.debug("IO.select", :return => [reader, writer, error])

    # JRuby (at least as of 1.6.7) returns [nil,nil,nil] on IO.select when the
    # socket is finished connecting *and* on timeout, so let's hack around this
    # and try to find out if we're really connected or not.
    if RUBY_PLATFORM == "java"
      begin
        socket.connect_nonblock(sockaddr)
      rescue Errno::EISCONN
        # Already connected, do nothing
        $logger.debug("Already connected!")
      rescue Errno::EINPROGRESS
        # Connection still in progress, this means we timed out given
        # our IO.select has returned.
        $logger.debug("Still in progress after timeout, aborting...")
        socket.close
        return nil
      end
    end
  end

  return socket
end

if ARGV.size != 3
  $logger.error("Usage: #{$PROGRAM_NAME} host port timeout")
  exit 1
end
  
host, port, timeout = ARGV[0..2]
$logger.time("Connect") do
  socket = connect(host, port, :timeout => timeout.to_f)
  $logger.info("Socket?", :socket => socket)
end
