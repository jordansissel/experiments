require "metriks"
require "socket"
require "mocha/api"

#sample = (1..10000).collect { rand }

start = Time.now
metric = Metriks.timer("hello")
500.times.each do |i|
  #Time.stubs(:new).returns(Time.at(start + i))
  start = Time.now
  socket = TCPSocket.new("64.90.39.215", 80)
  socket.close
  value = Time.now - start
  metric.update(value)

  if i % 50 == 0
    p "5th" => metric.snapshot.value(0.05)
    p "95th" => metric.snapshot.value(0.95)
  end
  #Time.unstub(:new)
end

mean = sample.reduce(:+) / sample.count
puts metric.mean => mean

variance = (sample.collect { |v| (metric.mean - v) ** 2 }.reduce(:+) / sample.count)
# Bug right now makes Metriks::Timer#stddev just the variance in Metriks (I think)
puts metric.stddev**0.5 => variance ** 0.5

