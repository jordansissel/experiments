#!/usr/bin/env ruby
#


io = IO.popen(ARGV)

start = Time.now
io.each do |line|
  puts "%.06f %s" % [Time.now - start, line.chomp]
end

