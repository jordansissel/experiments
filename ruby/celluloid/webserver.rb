require "http/parser"
require "benchmark"
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

class HTTPConnection < ServerConnection
  def run
    loop do
      parser = HTTP::Parser.new
      headers_done = false
      parser.on_headers_complete = proc { headers_done = true; :stop }

      benchmark_header = Benchmark.measure do
        remainder = ""
        while !headers_done
          begin
            data = read
            offset = (parser << data)
            remainder = data[offset..-1]
            headers_done = (data =~ /\r\n\r\n/)
          rescue EOFError, EOF
            close
            return
          end
        end
      end
      puts benchmark_header

      p parser.headers
      write([
        "HTTP/1.1 200 OK",
        "Content-Length: 4",
        "",
        "OK\r\n"
      ].join("\r\n"))
      #@socket.flush
    end
  ensure
    close
  end
end

# Run this server. Each connection is handled by the 'HTTPConnection' class.
server = Server.new(HTTPConnection)
server.run
