require "java"
require File.join(File.dirname(__FILE__), "..", "netty-3.2.4.Final.jar")

java_import org.jboss.netty.channel.socket.nio.NioServerSocketChannelFactory
java_import java.util.concurrent.Executors

class DiscardHandler < org.jboss.netty.channel.SimpleChannelHandler
  def messageReceived(context, event)
    # Do nothing
  end # def messageReceived

  def exceptionCaught(context, exception)
    exception.getCause.printStackTrace
    exception.getChannel.close
  end # def exceptionCaught
end # class DiscardHandler


class DiscardServer
  include org.jboss.netty.channel.ChannelPipelineFactory

  def initialize
    factory = NioServerSocketChannelFactory.new(
      java.util.concurrent.Executors.newCachedThreadPool(),
      java.util.concurrent.Executors.newCachedThreadPool()
    )

    bootstrap = org.jboss.netty.bootstrap.ServerBootstrap.new(factory)
    bootstrap.setPipelineFactory(Class.new do
      include org.jboss.netty.channel.ChannelPipelineFactory

      def getPipeline
        return org.jboss.netty.channel.Channels.pipeline(DiscardHandler.new)
      end # def getPipeline
    end.new)

    bootstrap.setOption("child.tcpNoDelay", true);
    bootstrap.setOption("child.keepAlive", true);
    bootstrap.bind(java.net.InetSocketAddress.new(8080));
  end # def initialize

  def self.main(args)
    DiscardServer.new
  end
end # class DiscardServer

if __FILE__ == $0
  DiscardServer.main(ARGV)
end
