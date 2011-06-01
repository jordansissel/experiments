#!/usr/bin/env ruby
#
# The "1.8/1.9" section in the netty guide for Time Client
#   Handles safe shutdown and cleanup
#   Uses objects instead of direct message decoding

require "java"
require File.join(File.dirname(__FILE__), "..", "netty-3.2.4.Final.jar")

class TimeDecoder < org.jboss.netty.handler.codec.frame.FrameDecoder
  def decode(context, channel, buffer)
    return if buffer.readableBytes < 4

    #return buffer.readBytes(4) # from example 1.7.3
    return Time.at(buffer.readInt)
  end # def decode
end # class TimeDecoder

class TimeClientHandler < org.jboss.netty.channel.SimpleChannelHandler
  class << self
    include org.jboss.netty.channel.ChannelPipelineFactory
    def getPipeline
      return org.jboss.netty.channel.Channels.pipeline(TimeDecoder.new, self.new)
    end # def getPipeline
  end # class << self 

  def initialize
    super()
    @buffer = org.jboss.netty.buffer.ChannelBuffers.dynamicBuffer
  end # def initialize

  def messageReceived(context, event)
    time = event.getMessage
    puts time
    event.getChannel.close
  end # def messageReceived

  def exceptionCaught(context, exception)
    exception.getCause.printStackTrace
    exception.getChannel.close
  end # def exceptionCaught
end # class TimeClientHandler

class TimeClient

  def initialize(host, port)
    @factory = org.jboss.netty.channel.socket.nio.NioClientSocketChannelFactory.new(
      java.util.concurrent.Executors.newCachedThreadPool(),
      java.util.concurrent.Executors.newCachedThreadPool()
    )

    @bootstrap = org.jboss.netty.bootstrap.ClientBootstrap.new(@factory)
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

  def run
    future = start

    future.awaitUninterruptibly
    if !future.isSuccess
      future.getCause().printStackTrace()
    end

    # Clean up
    future.getChannel().getCloseFuture().awaitUninterruptibly();
    @factory.releaseExternalResources();
  end # def run

  def self.main(args)
    host = args[0]
    port = args[1].to_i
    TimeClient.new(host, port).run
  end # def self.main
end # class TimeClient

if __FILE__ == $0
  TimeClient.main(ARGV)
end
