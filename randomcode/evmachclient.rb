#!/usr/bin/env ruby 

require "rubygems"
require "eventmachine"

$count = 0
$ack = 0
$start = Time.now.to_f
class Connection < EventMachine::Connection

  def post_init
    puts "Ready!"
    @recv = 0
    set_comm_inactivity_timeout(5)
  end

  def receive_data(data)
    @recv += 1
    $ack += data.length

    if recv % 100 == 0
      puts "Count: " + ($count / (Time.now.to_f - $start)).to_s
      puts "Ack: " + ($ack / (Time.now.to_f - $start)).to_s
      puts
    end
  end

  def unbind
    puts "Connection lost..."
    exit 1
  end
end

def backoff_while(&block)
  sleeptime = 0.1
  while (block.call) 
    puts "Backing off..."
    sleep(sleeptime)
    sleeptime = [sleeptime * 2, 1].min
  end
end


data = "x" * 4096
writer = proc do

  loop do
    if $c
      $c.send_data(data)
      $count += data.length
      backoff_while { ($count - $ack) > (10 << 20) }
    end
  end
end

EventMachine.epoll
EventMachine::run do
  EventMachine::defer(writer, nil)
  $c = EventMachine::connect "localhost", 3005, Connection
  puts $c
end

