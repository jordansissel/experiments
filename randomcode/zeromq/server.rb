
require "rubygems"
require "zmq"

context = ZMQ::Context.new

server = context.socket(ZMQ::REP)
server.bind("tcp://eth0:8888")

#p :read
#msg = server.recv()
#p :message => msg

stream = context.socket(ZMQ::PUB)
while true
  port = rand(40000) + 1000
  begin
    stream.bind("tcp://*:#{port}")
    p :port => port
    break
  rescue => e
    p e
    sleep 0.1
  end
end

    
