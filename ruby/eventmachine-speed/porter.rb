#!/usr/bin/env ruby
# This benchmark aims to test both eventmachine and regexp speeds
#
# The original problem was trying to write a syslog server here at Loggly
# that was easily debuggable, scaled to our needs, and was high-throughput.
#
# This uses 'logporter' - a syslog eventmachine server.

$: << File.join(File.dirname(__FILE__), "lib")
require "rubygems"
require "optparse"

ENGINE = (RUBY_ENGINE rescue "ruby")

options = OptionParser.new
wire_format = :syslog
use_netty = false
$iterations = 2_000_000
options.on("--netty", "Use netty-eventmachine") do 
  use_netty = true
end

options.on("--iterations ITERATIONS", "Iterations to run") do |val|
  $iterations = val.to_i
end

options.on("--wire WIRE",
           "What wire format to parse (raw, syslog, syslog_no_parse_time)") do |val|
  wire_format = val.to_sym
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

require "logporter/server"

# I declare this class after the option parsing in so we can conditionally use
# netty or plain EM.
class SyslogHandler

  def initialize(iterations=$iterations)
    @count = 0
    @buffer = BufferedTokenizer.new
    @start = Time.now
    @iterations = iterations
  end # def initialize

  def receive_event(event, server, address, port)
    @count += 1

    # Die after many lines.
    if @count == @iterations
      # I haven't implemented 'stop_event_loop' yet in netty-eventmachine
      duration = Time.now - @start
      printf("%15.15s | %5s/%7s | %8.2f | %.2f\n", NAME, ENGINE, RUBY_VERSION,
                        duration, @iterations / duration)

      if RUBY_PLATFORM == "java"
        java.lang.System.exit(0)
      else
        EventMachine.stop_event_loop
      end
    end
  end # def receive_event
end # class SyslogHandler

EventMachine::run do
  input = LogPorter::Server.new(:port => 3334, :net => :tcp, :wire => wire_format,
                                :handler => SyslogHandler.new)
  input.start
end # EventMachine::run
