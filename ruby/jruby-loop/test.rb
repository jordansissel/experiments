require "benchmark"

COUNT = 100_000_000
def looper
  c = COUNT
  loop do
    c -= 1
    break if c == 0
  end
end

def whiler
  c = COUNT
  while true
    c -= 1
    break if c == 0
  end
end

Benchmark.bmbm(30) do |b|
  b.report("loop do") { looper }
  b.report("while true") { whiler }
end
