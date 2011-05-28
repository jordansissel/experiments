require "rubygems"
require "ruby-prof"

def str(time)
  return "#{time.year}/#{time.month}/#{time.mday}T#{time.hour}:#{time.min}:#{time.sec}"
end

def strftime(time)
  return time.strftime("%Y/%m/%dT%H:%M:%S")
end

t = Time.now
RubyProf.start
100000.times do
  str(t)
  strftime(t)
end
result = RubyProf.stop

printer = RubyProf::FlatPrinter.new(result)
printer.print(STDOUT, 0)

