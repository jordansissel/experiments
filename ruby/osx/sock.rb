

require "socket"

def listen(port)
  server = TCPServer.new("0.0.0.0", port)
  loop do
    Thread.new(server.accept) { |client| read(client) }
  end
rescue => e
  puts "Listener died"
ensure
  server.close rescue nil
end

def read(socket)
  puts "New client connection #{socket.peeraddr}"
  loop do
    puts socket.sysread(1)
  end
rescue => e
  puts "Server socket died (#{socket.peeraddr}): #{e}"
ensure
  socket.close rescue nil
end

def talk(port)
  socket = TCPSocket.new("localhost", port)
  loop do
    socket.syswrite(".")
    sleep(1)
  end
rescue => e
  puts "Client socket died: #{socket.peeraddr}"
ensure
  socket.close rescue nil
end

port = 3333
Thread.new do
  loop do
    listen(port)
  end
end

loop do
  talk(port)
end
