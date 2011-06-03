require "socket"

server = TCPServer.new(8080)

output = "hello world"
client = server.accept
loop do
  payload = [output.length, output].pack("NA*")
  client.write(payload)
end
