# This aims to be a more "rubyish" way of doing the discard server example
require "java"
require "./netty-3.2.4.Final.jar"

java_import org.jboss.netty.channel.socket.nio.NioServerSocketChannelFactory
java_import java.util.concurrent.Executors

class TimeHandler < org.jboss.netty.channel.SimpleChannelHandler
  class << self
    include org.jboss.netty.channel.ChannelPipelineFactory
    def getPipeline
      return org.jboss.netty.channel.Channels.pipeline(self.new)
    end # def getPipeline
  end # class << self 

  def channelConnected(context, event)
    # event is a ChannelStateEvent
    channel = event.channel
    time = org.jboss.netty.buffer.ChannelBuffers.buffer(4)
    time.writeInt(Time.now.to_i)
    write_future = channel.write(time)

    # Close the connection after the write finishes.
    write_future.addListener(Module.new do
      def self.operationComplete(future)
        future.getChannel.close
      end
    end)
  end # def channelConnected

  def exceptionCaught(context, exception)
    exception.getCause.printStackTrace
    exception.getChannel.close
  end # def exceptionCaught
end # class TimeHandler


class TimeServer

  def initialize
    factory = NioServerSocketChannelFactory.new(
      java.util.concurrent.Executors.newCachedThreadPool(),
      java.util.concurrent.Executors.newCachedThreadPool()
    )

    @bootstrap = org.jboss.netty.bootstrap.ServerBootstrap.new(factory)
    @bootstrap.setPipelineFactory(TimeHandler)
    @bootstrap.setOption("child.tcpNoDelay", true);
    @bootstrap.setOption("child.keepAlive", true);
  end # def initialize

  def start
    @bootstrap.bind(java.net.InetSocketAddress.new(8080));
  end

  def self.main(args)
    TimeServer.new.start
  end
end # class TimeServer

if __FILE__ == $0
  TimeServer.main(ARGV)
end
