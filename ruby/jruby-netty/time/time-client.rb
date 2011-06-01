#!/usr/bin/env ruby
#
# The "1.7.2 - First Solution" in the netty guide for Time Client

require "java"
require File.join(File.dirname(__FILE__), "..", "netty-3.2.4.Final.jar")

class TimeClientHandler < org.jboss.netty.channel.SimpleChannelHandler
  class << self
    include org.jboss.netty.channel.ChannelPipelineFactory
    def getPipeline
      return org.jboss.netty.channel.Channels.pipeline(self.new)
    end # def getPipeline
  end # class << self 

  def initialize
    super()
    @buffer = org.jboss.netty.buffer.ChannelBuffers.dynamicBuffer
  end # def initialize

  def messageReceived(context, event)
    @buffer.writeBytes(event.getMessage)

    if @buffer.readableBytes >= 4
      value = @buffer.readInt
      time = Time.at(value)
      #time = java.util.Date.new(value * 1000)   # alternative
      puts time
      event.getChannel.close
    end
  end # def messageReceived

  def exceptionCaught(context, exception)
    exception.getCause.printStackTrace
    exception.getChannel.close
  end # def exceptionCaught
end # class TimeClientHandler


class TimeClient

  def initialize(host, port)
    factory = org.jboss.netty.channel.socket.nio.NioClientSocketChannelFactory.new(
      java.util.concurrent.Executors.newCachedThreadPool(),
      java.util.concurrent.Executors.newCachedThreadPool()
    )

    @bootstrap = org.jboss.netty.bootstrap.ClientBootstrap.new(factory)
    @bootstrap.setPipelineFactory(TimeClientHandler)
    @bootstrap.setOption("child.tcpNoDelay", true);
    @bootstrap.setOption("child.keepAlive", true);

    @host = host
    @port = port
  end # def initialize

  def start
    address = java.net.InetSocketAddress.new(@host, @port)
    return @bootstrap.connect(address)
  end # def start

  def self.main(args)
    host = args[0]
    port = args[1].to_i
    TimeClient.new(host, port).start
  end # def self.main
end # class TimeClient

if __FILE__ == $0
  TimeClient.main(ARGV)
end
