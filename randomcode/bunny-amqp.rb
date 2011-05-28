require 'rubygems'
require 'bunny'
require 'ap'

b = Bunny.new(:logging => true)

# start a communication session with the amqp server
b.start

# declare a queue
q = b.queue('test1')

# publish a message to the queue
q.publish('Hello everybody!')

# get message from the queue
loop do
  msg = q.pop[:payload]
  ap msg
  #puts 'This is the message: ' + msg + "\n\n"
end

# close the connection
b.stop

