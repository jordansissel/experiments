require "stud/benchmark"

CELLULOID = ENV.include?("CELLULOID")
require "celluloid" if CELLULOID
require "insist"

class Calculator
  include Celluloid if CELLULOID

  def double(value)
    return value * 2
  end
end


def run
  calc = Calculator.new
  input = rand(100)
  expected = input * 2
  return Stud::Benchmark.run(50000) do
    result = calc.double(input)
    raise "failed: #{result} vs #{expected}" if result != expected
  end
end

# run once to activate any JIT or other warmup tasks.
run

# the recorded run
results = run

puts "Duration: #{results.sum} - Rate: #{results.count / results.sum}"
puts "Environment: #{results.environment}"
puts "Breakdown:"
results.pretty_print
