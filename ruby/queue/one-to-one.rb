require "thread"

FINISH = :end

def emitter(q)
  5000000.times { q.put 1 }
end

def consumer(q)
  while true
    v = q.take
    break if v == FINISH
  end
end

#q = SizedQueue.new(16)
q = java.util.concurrent.ArrayBlockingQueue.new(16)

emitters = (ARGV[0] || 1).to_i 
consumers = (ARGV[1] || 1).to_i

threads = {}
threads[:emitters] = emitters.times.collect { Thread.new(q) { emitter(q) } }
threads[:consumers] = consumers.times.collect { Thread.new(q) { consumer(q) } }
threads[:emitters].each(&:join)
consumers.times { q << FINISH }
threads[:consumers].each(&:join)
