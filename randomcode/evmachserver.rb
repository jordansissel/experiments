#!/usr/bin/env ruby 

require "rubygems"
require "eventmachine"

$count = 0
$start = Time.now.to_f
class Connection < EventMachine::Connection
  def post_init
    @sent = 0
    puts "Ready!"
    set_comm_inactivity_timeout(5)
  end

  def receive_data(data)
    @sent += 1
    $count += data.length
    send_data(data)

    if @sent % 100 == 0
      puts ($count / (Time.now.to_f - $start))
    end
  end
end

EventMachine.epoll
EventMachine::run do
  EventMachine::start_server "0.0.0.0", 3005, Connection
end

