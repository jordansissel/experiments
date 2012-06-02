require "benchmark"
require "thread"
require "./blocking-ring"

ITERATIONS = 10_000_000
Benchmark.bmbm(20) do |x|
  10.times do |s|
    size = (s+1) * 50
    x.report("SizedQueue(#{size})") do
      q = SizedQueue.new(size)
      Thread.new(q) { |q| ITERATIONS.times { |i| q.push i } }
      ITERATIONS.times { q.pop }
    end

    x.report("Channel(#{size})")  do
      q = Channel.new(size)
      Thread.new(q) { |q| ITERATIONS.times { |i| q.push i } }
      ITERATIONS.times { q.pop }
    end
  end
end
