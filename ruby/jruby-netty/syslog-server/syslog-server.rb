#!/usr/bin/env ruby

require "java"
require File.join(File.dirname(__FILE__), "..", "netty-3.2.4.Final.jar")
java_import "com.loggly.syslog.SyslogDecoder"

class SyslogServerHandler < org.jboss.netty.channel.SimpleChannelHandler
  class << self
    include org.jboss.netty.channel.ChannelPipelineFactory
    def getPipeline
      return org.jboss.netty.channel.Channels.pipeline(SyslogDecoder.new, self.new)
    end # def getPipeline
  end # class << self 

  def initialize
    super
    @count = 0
    @start = Time.now
  end # def initialize

  def messageReceived(context, event)
    @count += 1
    if (@count % 100000 == 0)
      now = Time.now
      puts event.getMessage.toString
      rate = @count / (now - @start);
      puts("Rate: #{rate} (total: #{@count})");
    end
  end # def messageReceived

  def exceptionCaught(context, exception)
    exception.getCause.printStackTrace
    exception.getChannel.close
  end # def exceptionCaught
end # class SyslogServerHandler

class RubySyslogServer
  def initialize(host, port)
    @factory = org.jboss.netty.channel.socket.nio.NioServerSocketChannelFactory.new(
      java.util.concurrent.Executors.newCachedThreadPool(),
      java.util.concurrent.Executors.newCachedThreadPool()
    )

    @bootstrap = org.jboss.netty.bootstrap.ServerBootstrap.new(@factory)
    @bootstrap.setPipelineFactory(SyslogServerHandler)
    @bootstrap.setOption("child.tcpNoDelay", true);
    @bootstrap.setOption("child.keepAlive", true);

    @host = host
    @port = port
  end # def initialize

  def start
    address = java.net.InetSocketAddress.new(@host, @port)
    return @bootstrap.bind(address)
  end # def start

  def run
    future = start
  end # def run

  def self.main(args)
    host = args[0]
    port = args[1].to_i
    RubySyslogServer.new(host, port).run
  end # def self.main
end # class SyslogServer

if __FILE__ == $0
  RubySyslogServer.main(ARGV)
end
