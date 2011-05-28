#!/usr/bin/env ruby
#
# Simple 'tail -f' example.
# Usage example:
#   tail.rb /var/log/messages

require "rubygems"
require "eventmachine"
require "eventmachine-tail"

class Reader < EventMachine::FileTail
  def initialize(path, startpos=0)
    super(path, startpos)
    @buffer = BufferedTokenizer.new
  end

  def receive_data(data)
    @buffer.extract(data).each do |line|
      puts "#{path}: #{line}"
    end
  end
end

def main(args)
  if args.length == 0
    puts "Usage: #{$0} <path> [path2] [...]"
    return 1
  end

  handler = class << EventMachine::FileTail.new
  end
  EventMachine.run do
    args.each do |path|
      EventMachine::file_tail(path, handler)
    end
  end
end # def main

exit(main(ARGV))
