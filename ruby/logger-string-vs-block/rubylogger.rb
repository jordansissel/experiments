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
logger.level = Logger::WARN

2.times do |i|
  data = "testing 234"
  iterations = 1000000
  time_string = time(iterations) do
    logger.info([ "Hello #{data}", { "foo" => "bar", "baz" => "fizz" }])
  end

  time_stringif = time(iterations) do
    logger.info([ "Hello #{data}", { "foo" => "bar", "baz" => "fizz" }]) if logger.info?
  end

  time_controlif = time(iterations) do
    nil if logger.info?
  end

  time_block = time(iterations) do
    logger.info { [ "Hello #{data}", { "foo" => "bar", "baz" => "fizz" }] }
  end

  time_doubleblock = time(iterations) do
    logger.info { (lambda { [ "Hello #{data}", { "foo" => "bar", "baz" => "fizz" }] }).call }
  end

  # Only print results on the 2nd run
  next if i == 0

  ruby = RUBY_ENGINE rescue "ruby"
  printf("%15.15s | %5s/%7s | %8.2f\n", "string", ruby, RUBY_VERSION, time_string)
  printf("%15.15s | %5s/%7s | %8.2f\n", "string_if", ruby, RUBY_VERSION, time_stringif)
  printf("%15.15s | %5s/%7s | %8.2f\n", "control_if", ruby, RUBY_VERSION, time_controlif)
  printf("%15.15s | %5s/%7s | %8.2f\n", "block", ruby, RUBY_VERSION, time_block)
  printf("%15.15s | %5s/%7s | %8.2f\n", "doubleblock", ruby, RUBY_VERSION, time_doubleblock)
end
