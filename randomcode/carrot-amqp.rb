require 'rubygems'
require 'carrot'

q = Carrot.queue('name')
10.times do |num|
    q.publish(num.to_s)
end

puts "Queued #{q.message_count} messages"
puts

loop do
  msg = q.pop(:ack => true)
  p msg
  q.ack if msg
end
Carrot.stop

