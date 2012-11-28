#!/usr/bin/env ruby

require "java"
require "socket"

class JavaThread 
  include java.lang.Runnable

  def initialize(&block)
    @block = block
  end # def initialize

  def run
    @block.call
  end # def run
end

#acceptor = java.lang.Thread.new(JavaThread.new do
acceptor = Thread.new do
  a = TCPServer.new(0)
  p :a => a
  begin
    puts "Accepting"
    a.accept()
    puts "Done accepting"
  rescue Exception, java.lang.Exception => e
    puts "Exception: #{e.class}"
  end
end
#)

#acceptor.start
sleep 1
puts "Interrupting..."
acceptor.raise(Exception, "OKG")
puts "Waiting..."
acceptor.join
