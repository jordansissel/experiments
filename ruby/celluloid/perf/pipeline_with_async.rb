require "celluloid"
require "insist"
require "stud/benchmark"

module Linkable
  def next=(obj)
    @next = obj
  end
end

class Input
  include Celluloid
  include Linkable

  def tick
    @next.async.receive("message" => "hello world")
  end
end

class Filter
  include Celluloid
  include Linkable

  def receive(event)
    event["filtered"] = true
    @next.async.receive(event)
  end
end

class Output
  include Celluloid
  include Linkable

  def receive(event)
    insist { event["filtered"] } == true
    insist { event["message"] } == "hello world"
  end
end

i = Input.new
f = Filter.new
o = Output.new

i.next = f
f.next = o

results = Stud::Benchmark.run(10000) do
  i.tick
end

puts "Duration: #{results.sum} - Rate: #{results.count / results.sum}"
puts "Environment: #{results.environment}"
puts "Breakdown:"
results.pretty_print
