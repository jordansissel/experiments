#!/usr/bin/env ruby
#
# The "1.8/1.9" section in the netty guide for Time Client
#   Handles safe shutdown and cleanup
#   Uses objects instead of direct message decoding

require "java"
require File.join(File.dirname(__FILE__), "..", "netty-3.2.4.Final.jar")

class StringDecoder < org.jboss.netty.handler.codec.replay.ReplayingDecoder

  # States in ReplayingDecoder must be Enums, so let's create some enums now.
  # We have to create subclasses because the Enum constructor is protected.
  READ_LENGTH = Class.new(java.lang.Enum) { def initialize; super("READ_LENGTH", 1); end; }.new
  READ_STRING = Class.new(java.lang.Enum) { def initialize; super("READ_STRING", 2); end; }.new

  def initialize
    # Set initial state to READ_LENGTH
    super(READ_LENGTH)
    @charset = java.nio.charset.Charset.defaultCharset
  end # def initialize

  def decode(context, channel, buffer, state)
    case state
      when READ_LENGTH
        @length = buffer.readInt() 
        checkpoint(READ_STRING)
        return nil
      when READ_STRING
        string = buffer.readBytes(@length).toString(@charset)
        checkpoint(READ_LENGTH)
        return string
    end
  end # def decode
end # class StringDecoder

class StringClientHandler < org.jboss.netty.channel.SimpleChannelHandler
  class << self
    include org.jboss.netty.channel.ChannelPipelineFactory
    def getPipeline
      return org.jboss.netty.channel.Channels.pipeline(StringDecoder.new, self.new)
    end # def getPipeline
  end # class << self 

  def messageReceived(context, event)
    string = event.getMessage
    p :string => string
  end # def messageReceived

  def exceptionCaught(context, exception)
    exception.getCause.printStackTrace
    exception.getChannel.close
  end # def exceptionCaught
end # class TimeClientHandler

class StringClient
  def initialize(host, port)
    @factory = org.jboss.netty.channel.socket.nio.NioClientSocketChannelFactory.new(
      java.util.concurrent.Executors.newCachedThreadPool(),
      java.util.concurrent.Executors.newCachedThreadPool()
    )

    @bootstrap = org.jboss.netty.bootstrap.ClientBootstrap.new(@factory)
    @bootstrap.setPipelineFactory(StringClientHandler)
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
    StringClient.new(host, port).run
  end # def self.main
end # class StringClient

if __FILE__ == $0
  StringClient.main(ARGV)
end
