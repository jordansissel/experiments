# Regexp benchmark using syslog rfc 3164 patterns.

require "test/unit/assertions"
include Test::Unit::Assertions
require "rubygems"
gem "jls-grok"
require "grok"

grok = Grok.new

pri = "(?:<(?:[0-9]{1,3})>)"
month = "(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)"
day = "(?: [1-9]|[12][0-9]|3[01])"
hour = "(?:[01][0-9]|2[0-4])"
minute = "(?:[0-5][0-9])"
second = "(?:[0-5][0-9])"

hostname = "(?:[A-Za-z0-9_.:]+)"
message = "(?:[ -~]+)"

grok.add_pattern("PRI", pri)
grok.add_pattern("MONTH", month)
grok.add_pattern("DAY", day)
grok.add_pattern("HOUR", hour)
grok.add_pattern("MINUTE", minute)
grok.add_pattern("SECOND", second)

grok.add_pattern("TIME", "%{HOUR}:%{MINUTE}:%{SECOND}")
grok.add_pattern("TIMESTAMP", "%{MONTH} %{DAY} %{TIME}")
grok.add_pattern("HOSTNAME", hostname)
grok.add_pattern("HEADER", "%{TIMESTAMP} %{HOSTNAME}")
grok.add_pattern("MESSAGE", message)

grok.compile("%{PRI}%{HEADER} %{MESSAGE}")

m = grok.match("<12>Mar  1 15:43:35 snack kernel: Kernel logging (proc) stopped.")

# Verify our pattern matches at least once successfully (for correctness)
captures = m.captures
assert_equal("<12>", captures["PRI"].first, "pri")
assert_equal("Mar  1 15:43:35", captures["TIMESTAMP"].first, "timestamp")
assert_equal("snack", captures["HOSTNAME"].first, "hostname")
assert_equal("kernel: Kernel logging (proc) stopped.", captures["MESSAGE"].first, "message")

# Now that we've verified functionality, let's speed test it.
start = Time.now
count = 1000000

input = "<12>Mar  1 15:43:35 snack kernel: Kernel logging (proc) stopped."
count.times do |i|
  begin
    m = grok.match(input)

    # Force new object?
    input = input + ""
  rescue => e
    puts "Error on attempt #{i + 1}"
    raise e
  end
end

duration = Time.now - start
version = "#{RUBY_PLATFORM}/#{RUBY_VERSION}"
version += "/#{JRUBY_VERSION}" if RUBY_PLATFORM == "java"
puts "#{version}: duration: #{duration} / rate: #{count / duration} / iterations: #{count}"
#m = syslog3164_re.match(data)
