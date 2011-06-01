# This aims to be a more "rubyish" way of doing the discard server example
require "java"
require File.join(File.dirname(__FILE__), "..", "netty-3.2.4.Final.jar")

java_import org.jboss.netty.channel.socket.nio.NioServerSocketChannelFactory
java_import java.util.concurrent.Executors

class DiscardHandler < org.jboss.netty.channel.SimpleChannelHandler
  
  class << self
    include org.jboss.netty.channel.ChannelPipelineFactory
    def getPipeline
      return org.jboss.netty.channel.Channels.pipeline(self.new)
    end # def getPipeline
  end # class << self 

  def messageReceived(context, event)
    buf = event.getMessage
    while (buf.readable)
      # In the Java example, they do: (char) buf.readByte(), but you can't cast
      # an int to a char in ruby, so we'll use Array#pack
      $stdout.write [buf.readByte].pack("C")
      $stdout.flush
    end
  end # def messageReceived

  def exceptionCaught(context, exception)
    exception.getCause.printStackTrace
    exception.getChannel.close
  end # def exceptionCaught
end # class DiscardHandler


class DiscardServer

  def initialize
    factory = NioServerSocketChannelFactory.new(
      java.util.concurrent.Executors.newCachedThreadPool(),
      java.util.concurrent.Executors.newCachedThreadPool()
    )

    @bootstrap = org.jboss.netty.bootstrap.ServerBootstrap.new(factory)
    @bootstrap.setPipelineFactory(DiscardHandler)
    @bootstrap.setOption("child.tcpNoDelay", true);
    @bootstrap.setOption("child.keepAlive", true);
  end # def initialize

  def start
    @bootstrap.bind(java.net.InetSocketAddress.new(8080));
  end

  def self.main(args)
    DiscardServer.new.start
  end
end # class DiscardServer

if __FILE__ == $0
  DiscardServer.main(ARGV)
end
