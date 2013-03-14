require "thread"

class Oops < StandardError; end

queue = Queue.new

thread = Thread.new(queue) do |queue|
  begin
    sleep
  rescue Oops
    puts "Thread oops!"
  end
  queue << :done
end

trap("INT") { thread.raise(Oops) }
puts queue.pop
