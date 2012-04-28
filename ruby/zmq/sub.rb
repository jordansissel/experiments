require "rubygems"
require "ffi-rzmq"

context = ZMQ::Context.new
socket = context.socket(ZMQ::PULL)

case ARGV.shift
when "bind"
  p :bind => socket.bind(ARGV.shift)
when "connect"
  sleep 1
  p :connect => socket.connect(ARGV.shift)
end

socket.setsockopt(ZMQ::SUBSCRIBE, "")

while true
  msg = ""
  p :recv => socket.recv_string(msg)
  p msg
  sleep 1
end

