require "logger"

def time(iterations, &block)
  start= Time.now
  1.upto(iterations) do
    block.call
  end
  duration = Time.now - start
  return duration
end

devnull = File.open("/dev/null", "w")
logger = Logger.new(devnull)
logger.level = Logger::INFO

data = "testing 234"
time_string = time(100000) do
  logger.info([ "Hello #{data}", { "foo" => "bar", "baz" => "fizz" }])
end

time_block = time(100000) do
  logger.info { [ "Hello #{data}", { "foo" => "bar", "baz" => "fizz" }] }
end

printf("%15.15s | %5s/%7s | %8.2f\n", "string", RUBY_ENGINE, RUBY_VERSION, time_string)
printf("%15.15s | %5s/%7s | %8.2f\n", "block", RUBY_ENGINE, RUBY_VERSION, time_block)
