require "celluloid"
require "socket"

class Server
  include Celluloid
  def initialize(connection_handler)
    @server = TCPServer.new(12345)
    @connection_handler = connection_handler
  end

  def run
    Java::java.lang.Thread.currentThread.setName(self.inspect) if RUBY_ENGINE == "jruby"
    loop do
      socket = @server.accept
      connection = @connection_handler.new(socket)
      # Invoking the '!' of 'run!' makes Celluloid run this in a separate thread.
      connection.run!
    end
  end
end

class ServerConnection
  include Celluloid

  class EOF < StandardError; end
  class Error < StandardError; end

  def initialize(socket)
    @socket = socket
    @buffer = ""
    @buffer.force_encoding("BINARY")
  end

  def read(length=4096)
    data = @socket.sysread(length, @buffer)
  end

  def write(data)
    bytes = @socket.syswrite(data)
  end

  def close
    @socket.close
  end

  def run
    raise NotImplementedError.new
  end
end

class Echo < ServerConnection
  def run
    loop do
      begin
        data = read
        write(data)
      rescue EOFError, EOF
        close
        return
      end
    end
  end
end

# Run this server. Each connection is handled by the 'Echo' class.
server = Server.new(Echo)
server.run
