require 'socket'

# Pull down Google's web page
class FancySocket
  include Socket::Constants

  def initialize(host, port)
    @host = host
    @port = port
  end

  def connect(timeout=nil)
    @socket = Socket.new(AF_INET, SOCK_STREAM, 0)
    sockaddr = Socket.sockaddr_in(@port, @host)
    begin
      @socket.connect_nonblock(sockaddr)
    rescue IO::WaitWritable, Errno::EINPROGRESS
      # wait until the connect succeeds or 
      timeout = nil
      reader, writer, error = IO.select(nil, [@socket], [@socket], timeout)
      if writer.nil?
        $stderr.puts("IO.select returned nil for writer? That's not right")
        $stderr.puts([reader,writer,error].inspect)
        return
      end
      begin
        @socket.connect_nonblock(sockaddr) # check connection failure
      rescue Errno::EISCONN
      end
    end

    return :connected
  end
end 

# A socket connection to google port 80 probably should work, right?
sock = FancySocket.new("google.com", 80)
p sock.connect
