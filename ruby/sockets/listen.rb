require "socket"

ip = "127.0.0.1"
port = 12345
family = ip.include?(":") ? Socket::AF_INET6 : Socket::AF_INET
socket = Socket.new(family, Socket::SOCK_STREAM, 0)
sockaddr = Socket.pack_sockaddr_in(port, ip)
socket.setsockopt(Socket::SOL_SOCKET, Socket::SO_REUSEADDR, true)
socket.bind(sockaddr)
socket.listen(30)

client, peer = socket.accept
p client
