require "thread"

q = Queue.new

iterations = 1000000

Thread.new {
  iterations.times { |i| q << i }
}

start = Time.now
popper = Thread.new { 
  iterations.times { q.pop }
}
popper.join
duration = Time.now - start
rate = iterations / duration
puts "Rate: #{rate}"
