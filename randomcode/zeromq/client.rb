
require "rubygems"
require "zmq"

context = ZMQ::Context.new

client = context.socket(ZMQ::REQ)
p :connecting
client.connect("tcp://192.168.0.97:8888/testing")
p :sending
client.send("Hello")

while true
  p :reading
  msg = client.recv()
  p :message => msg
end
