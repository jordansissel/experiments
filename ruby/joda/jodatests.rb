require "benchmark"
require "java"

def bench(&block)
  count = 500000
  start = Time.now
  count.times(&block)
  duration = Time.now - start
  rate = count / duration
  return rate
end

format = "MMM dd HH:mm:ss"
parser = org.joda.time.format.DateTimeFormat.forPattern(format).withOffsetParsed
input = "Nov 14 12:23:34"

simpleparser = java.text.SimpleDateFormat.new(format)
simpleformatter = java.text.SimpleDateFormat.new("YYYY-MM-dd'T'HH:mm:ss.SSSSSSZ")

JDate = java.util.Date
JodaDateTime = org.joda.time.DateTime
JodaInstant = org.joda.time.Instant

puts; puts "Parsing a syslog time into IS8601 time"
Benchmark.bmbm(35) do |r|
  r.report("Joda parseDateTime") { bench { parser.parseDateTime(input).to_s } }
  r.report("SimpleDateFormat parse") { bench { simpleformatter.format(simpleparser.parse(input)) } }
end

ISO8601_STRFTIME = "%04d-%02d-%02dT%02d:%02d:%02d.%06d%+03d:00" 
puts; puts "Getting 'now' in ISO8601 time"
Benchmark.bmbm(35) do |r|
  r.report("SimpleDateFormat") { bench { simpleformatter.format(JDate.new) } }
  r.report("Joda Instant") { bench { JodaInstant.new.to_s } }
  r.report("Joda DateTime") { bench { JodaDateTime.new.to_s } }
  # Fastest I could find based on research here: 
  # https://github.com/jordansissel/experiments/blob/master/ruby/time-formatting-is-slow
  r.report("Ruby sprintf+Time.now") { bench { t = Time.now; ISO8601_STRFTIME % [t.year, t.month, t.day, t.hour, t.min, t.sec, t.tv_usec, t.utc_offset / 3600] } }
end
