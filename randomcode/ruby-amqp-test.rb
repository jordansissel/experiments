#!/usr/bin/env ruby

require "rubygems"
require "amqp"
require "mq"

#AMQP.logging = true
$start = Time.now
def timestamp
  now = Time.now - $start
  return now.to_f.to_s
end

AMQP.start(:host => "localhost") do
  mq = MQ.queue("test-1234queue")
  mq.subscribe do |hdr, msg|
    #sendtime = msg.to_f
    #delay = Time.now.to_f - sendtime
    puts
    puts hdr.inspect
    puts hdr.consumer_tag.inspect
    puts msg.inspect
    #puts "#{timestamp} got message. #{delay.to_s[0..4]} delay"
  end

  sender = proc do
    1.upto(300) do |x| 
      puts "#{timestamp} sending message"
      mq.publish(Time.now.to_f)
      sleep 1
    end
  end
  EventMachine::defer(sender)
end


