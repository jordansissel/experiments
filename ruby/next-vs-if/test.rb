require "stud/benchmark"

def even?(value)
  return value & 1 == 0
end

count = 30000000

results = {}

(RUBY_ENGINE == "jruby" ? 2 : 1).times do
  results["next unless even?"] = Stud::Benchmark.run(1) do
    count.times do |value|
      next unless even?(value)
      a = value + 1
    end
  end

  results["if even?"] = Stud::Benchmark.run(1) do
    count.times do |value|
      if even?(value)
        a = value + 1
      end
    end
  end

  results["select { even? }"] = Stud::Benchmark.run(1) do
    count.times.select { |value| even?(value) }.each do |value|
      a = value + 1
    end
  end
end

results.each do |name, result|
  puts "---"
  puts "#{name}: count: #{count} rate: #{count / result.sum}"
  puts "#{name}: Environment: #{result.environment}"
  puts "Breakdown"
  result.pretty_print
end
