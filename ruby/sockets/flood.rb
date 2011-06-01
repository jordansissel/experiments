

require "socket"

sock = TCPSocket.new("127.0.0.1", 19384)
while true
  sock.write("<13>May 19 18:30:17 snack jls: foo bar 32\n")
end

#sock = UDPSocket.new
#while true
  #sock.send("<13>May 19 18:30:17 snack jls: foo bar 32\n", 0, "127.0.0.1", 45498)
#end
