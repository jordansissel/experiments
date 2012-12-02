require "thread"
require "java"

#queue = SizedQueue.new(20)
queue = java.util.concurrent.ArrayBlockingQueue.new(20)

writers = 500.times.collect do |i|
  Thread.new do 
    if queue.is_a?(SizedQueue)
      queue << [i, Time.now] while true
    else
      # ArrayBlockingQueue
      queue.put([i, Time.now]) while true
    end
  end
end

max_age = 10
start = Time.now
reader = Thread.new do
  while true
    now = Time.now
    if queue.is_a?(SizedQueue)
      id, time = queue.pop
    else
      # ArrayBlockingQueue
      id, time = queue.take
    end
    age = now - time
    if age > max_age
      puts "#{now - start}: Thread #{id} is behind by #{age} seconds"
    end
  end
end

reader.join
writers.each(&:join)
