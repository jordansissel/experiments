require "thread"
require "java"

class JSizedQueue < java.util.concurrent.ArrayBlockingQueue
  alias_method :<<, :put
  alias_method :push, :put
  alias_method :pop, :take
end

#queue = SizedQueue.new(20)
queue = JSizedQueue.new(20)

writers = 500.times.collect do |i|
  Thread.new do 
    queue << [i, Time.now] while true
  end
end

puts "Queue implementation: #{queue.class} / #{queue.class.ancestors}"

max_age = 10
lifestart = start = Time.now
count = 0
reader = Thread.new do
  ages = {}
  while true
    id, time = queue.pop
    now = Time.now
    ages[id] = time
    count += 1
    # Report every 5 seconds
    if now - start > 5
      behind = ages.select { |id, time| now - time > 5 }
      puts "#{now - lifestart} (count: #{count}): behind > 5 seconds = #{behind.count}"
      if ages.count < 500
        puts "Missing: #{500 - ages.cout}"
      end
      start = now
    end
  end
end

reader.join
writers.each(&:join)
