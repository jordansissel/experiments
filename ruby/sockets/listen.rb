require "socket"

ip = "127.0.0.1"
port = 12345
family = ip.include?(":") ? Socket::AF_INET6 : Socket::AF_INET
socket = Socket.new(family, Socket::SOCK_STREAM, 0)
sockaddr = Socket.pack_sockaddr_in(port, ip)
socket.setsockopt(Socket::SOL_SOCKET, Socket::SO_REUSEADDR, true)
socket.bind(sockaddr)
socket.listen(30)

version = RUBY_VERSION
platform = case RUBY_PLATFORM
  when "java"; "jruby-#{JRUBY_VERSION}"
  else "ruby"
end
p :version => [version, platform].join(" @ "), :has_accept? => socket.respond_to?(:accept)

# Try calling it anyway
#socket.accept
