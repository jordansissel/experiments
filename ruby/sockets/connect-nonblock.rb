require "socket"

def connect(host, port)
  socket = Socket.new(Socket::AF_INET, Socket::SOCK_STREAM, 0)
  sockaddr = Socket.sockaddr_in(port, host)
  begin
    socket.connect_nonblock(sockaddr)
  rescue Errno::EINPROGRESS
    timeout = nil # block until connected-or-error
    reader, writer, error = IO.select(nil, [socket], nil, timeout)
    if writer.nil?
      #$stderr.puts("IO.select returned nil for writer? That's not right")
      #$stderr.puts([reader,writer,error].inspect)
      return nil
    end
    begin
      socket.connect_nonblock(sockaddr) # check connection failure
    rescue Errno::EISCONN
    end
  end

  return socket
end

version = RUBY_VERSION
platform = case RUBY_PLATFORM
  when "java"; "jruby-#{JRUBY_VERSION}"
  else "ruby"
end

p :version => [version, platform].join(" @ "), :socket => connect("google.com", 80)
