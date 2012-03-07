require "thread"

mutex = Mutex.new
cv = ConditionVariable.new

threads = 10.times.collect do
  Thread.new do
    mutex.synchronize do
      cv.wait(mutex)
      require "rubygems"
      require "redis"
    end

    Redis::Client
  end
end

puts "Notifying all"
mutex.synchronize do
  cv.broadcast
end

threads.each(&:join)
