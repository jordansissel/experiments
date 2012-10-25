require "celluloid"
require "insist"
require "stud/benchmark"

class Input
  include Celluloid
  def next
    return "message" => "hello world"
  end
end

class Filter
  include Celluloid
  def receive(event_future)
    event = event_future.value
    event["filtered"] = true
    return event
  end
end

class Output
  include Celluloid

  def initialize
    @count = 0
    @start = Time.now
  end

  def receive(event_future)
    event = event_future.value
    insist { event["filtered"] } == true
    insist { event["message"] } == "hello world"
    @count += 1
    if @count % 10000 == 0
      puts "Rate: #{@count / (Time.now - @start)}"
    end
  end
end

i = Input.new
f = Filter.new
o = Output.new

results = Stud::Benchmark.run(10000) do
  # This is probably not the best way to do it...
  o.receive(f.future.receive(i.future.next))
end

puts "Duration: #{results.sum} - Rate: #{results.count / results.sum}"
puts "Environment: #{results.environment}"
puts "Breakdown:"
results.pretty_print
