require "rubygems"
require "ffi-rzmq"

context = ZMQ::Context.new
socket = context.socket(ZMQ::PUSH)

case ARGV.shift
when "bind"
  p :bind => socket.bind(ARGV.shift)
when "connect"
  sleep 1
  p :connect => socket.connect(ARGV.shift)
end

while true
  p :send => socket.send_string("Hello")
  sleep 1
end

