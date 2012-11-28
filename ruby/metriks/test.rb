
require "metriks"
require "stud/benchmark"

meter = Metriks.meter("hello")

results = Stud::Benchmark.run(1000000) do
  meter.mark
end

puts "Duration: #{results.sum} - Rate: #{results.count / results.sum}"
puts "Environment: #{results.environment}"
puts "Breakdown:"
results.pretty_print

