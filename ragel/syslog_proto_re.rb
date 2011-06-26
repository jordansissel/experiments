# Regexp benchmark using syslog rfc 3164 patterns.

require "test/unit/assertions"
include Test::Unit::Assertions

pri = "(?:<(?<pri>[0-9]{1,3})>)"
month = "(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)"
day = "(?: [1-9]|[12][0-9]|3[01])"
hour = "(?:[01][0-9]|2[0-4])"
minute = "(?:[0-5][0-9])"
second = "(?:[0-5][0-9])"

time = [hour, minute, second].join(":")

timestamp = "(?<timestamp>#{month} #{day} #{time})"
hostname = "(?<hostname>[A-Za-z0-9_.:]+)"
header = timestamp + " " + hostname
message = "(?<message>[ -~]+)"

syslog3164_re = Regexp.new("#{pri}#{header} #{message}")
m = syslog3164_re.match("<12>Mar  1 15:43:35 snack kernel: Kernel logging (proc) stopped.")

# Verify our pattern matches at least once successfully (for correctness)
#captures = {}
##m.names.zip(m.captures) do |name, value|
  #captures[name] = value
##end

captures = Hash[m.names.zip(m.captures)]

assert_equal("12", captures["pri"], "pri")
assert_equal("Mar  1 15:43:35", captures["timestamp"], "timestamp")
assert_equal("snack", captures["hostname"], "hostname")
assert_equal("kernel: Kernel logging (proc) stopped.", captures["message"], "message")

# Now that we've verified functionality, let's speed test it.
start = Time.now
count = 1000000

input = "<12>Mar  1 15:43:35 snack kernel: Kernel logging (proc) stopped."
count.times do |i|
  begin
    m = syslog3164_re.match(input)

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
