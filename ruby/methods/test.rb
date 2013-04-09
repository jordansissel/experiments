require "stud/benchmark"

class Standalone
  def initialize
    @count = 0
  end

  def mark
    @count += 1
  end
end

class Parent
  def initialize
    @count = 0
  end

  def mark
    @count += 1
  end
end

class Child < Parent; end

module Marker
  def marker_initialize
    @count = 0
  end
  def mark
    @count += 1
  end
end

class Includer
  include Marker
  def initialize
    marker_initialize
  end
end

standalone = Standalone.new
child = Child.new
includer = Includer.new

2.times do
  puts "standalone: #{Stud::Benchmark.run(100000) { standalone.mark }.rate}"
  puts "child: #{Stud::Benchmark.run(100000) { child.mark }.rate}"
  puts "includer: #{Stud::Benchmark.run(100000) { includer.mark }.rate}"
end
