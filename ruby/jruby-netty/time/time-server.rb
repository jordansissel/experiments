# This aims to be a more "rubyish" way of doing the discard server example
require "java"
require File.join(File.dirname(__FILE__), "..", "netty-3.2.4.Final.jar")


# Ruby block-friendly wrapper for ChannelFuture events
def On(future, method, &callback)
  
  # Create a new module with a single method given and the block.
  future.addListener(Module.new.class_eval do
    define_method(method, &callback)
  end)
end # class ChannelFutureHandler

class TimeServerHandler < org.jboss.netty.channel.SimpleChannelHandler

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
    future = channel.write(time)

    # Remember, writes are asynchronous. So any "when you are done writing"
    # things need to be scheduled. Close the connection after the write
    # finishes.
    On(future, :operationComplete) do
      channel.close
    end

    # Alternately, this works, too:
    #future.addListener(org.jboss.netty.channel.ChannelFutureListener::CLOSE)
  end # def channelConnected

  def exceptionCaught(context, exception)
    exception.getCause.printStackTrace
    exception.getChannel.close
  end # def exceptionCaught
end # class TimeServerHandler


class TimeServer

  def initialize
    factory = org.jboss.netty.channel.socket.nio.NioServerSocketChannelFactory.new(
      java.util.concurrent.Executors.newCachedThreadPool(),
      java.util.concurrent.Executors.newCachedThreadPool()
    )

    @bootstrap = org.jboss.netty.bootstrap.ServerBootstrap.new(factory)
    @bootstrap.setPipelineFactory(TimeServerHandler)
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
