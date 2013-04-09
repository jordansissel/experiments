#!/usr/bin/env ruby
#


io = IO.popen(ARGV)

log = File.new("log", "w+")

start = Time.now
io.each do |line|
  puts "%.06f %s" % [Time.now - start, line.chomp]
  log.puts "%.06f %s" % [Time.now - start, line.chomp]
end

