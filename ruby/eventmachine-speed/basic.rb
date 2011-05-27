#!/usr/bin/env ruby
# This benchmark aims to test both eventmachine and regexp speeds
#
# The original problem was trying to write a syslog server here at Loggly
# that was easily debuggable, scaled to our needs, and was high-throughput.

$: << File.join(File.dirname(__FILE__), "lib")
require "rubygems"
require "optparse"

ENGINE = (RUBY_ENGINE rescue "ruby")
ITERATIONS = 10_000_000

options = OptionParser.new
use_netty = false
options.on("--netty", "Use netty-eventmachine") do 
  use_netty = true
end

options.parse(ARGV)

if use_netty
  require "netty-eventmachine/em_api" # rubygem 'netty-eventmachine'
  require "em/buftok"
  NAME="netty-em"
  puts "Using netty-eventmachine"
else
  require "eventmachine"
  NAME="eventmachine"
  puts "Using normal eventmachine"
end

# I declare this class after the option parsing in so we can conditionally use
# netty or plain EM.
class SyslogHandler < EventMachine::Connection

  def initialize
    @count = 0
    @buffer = BufferedTokenizer.new
    @start = Time.now

    # The syslog parsing stuff here taken from the 'logporter' gem.
    pri = "(?:<(?<pri>[0-9]{1,3})>)?"
    month = "(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)"
    day = "(?: [1-9]|[12][0-9]|3[01])"
    hour = "(?:[01][0-9]|2[0-4])"
    minute = "(?:[0-5][0-9])"
    second = "(?:[0-5][0-9])"
    time = [hour, minute, second].join(":")
    timestamp = "(?<timestamp>#{month} #{day} #{time})"
    hostname = "(?<hostname>[A-Za-z0-9_.:]+)"
    header = timestamp + " " + hostname
    message = "(?<message>[ -~]+)"  # ascii 32 to 126
    re = "^#{pri}#{header} #{message}$"

    if RUBY_VERSION =~ /^1\.8/
      # Ruby 1.8 doesn't support named captures
      # replace (?<foo> with (
      re = re.gsub(/\(\?<[^>]+>/, "(")
    end

    @syslog3164_re = Regexp.new(re)
  end # def initialize

  def receive_data(data)
    # In jruby+netty, we probaby should use the DelimiterBasedFrameDecoder
    # But for the sake of simplicity, we'll use EM's BufferedTokenizer for
    # all implementations.
    @buffer.extract(data).each do |line|
      receive_line(line.chomp)
    end
  end # def receive_event

  def receive_line(line)
    @count += 1

    # Just try matching, don't need to do anything with it for this benchmark.
    m = @syslog3164_re.match(line)

    #if @count % 50000 == 0
      #rate = @count / (Time.now - @start)
      #puts "Rate: #{rate}"
    #end

    # Die after many lines.
    if @count == ITERATIONS
      # I haven't implemented 'stop_event_loop' yet in netty-eventmachine
      duration = Time.now - @start
      printf("%15.15s | %5s/%7s | %8.2f | %.2f\n", NAME, ENGINE, RUBY_VERSION,
                        duration, ITERATIONS / duration)

      if RUBY_PLATFORM == "java"
        java.lang.System.exit(0)
      else
        EventMachine.stop_event_loop
      end
    end
  end
end # class SyslogHandler

EventMachine::run do
  EventMachine.start_server("0.0.0.0", 3333, SyslogHandler)
end # EventMachine::run
