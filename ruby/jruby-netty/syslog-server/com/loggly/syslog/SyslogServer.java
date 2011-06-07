package com.loggly.syslog;

import java.net.InetSocketAddress;
import java.util.concurrent.Executors;
import org.jboss.netty.bootstrap.ServerBootstrap;
import java.nio.charset.Charset;
import org.jboss.netty.buffer.ChannelBuffer;
import org.jboss.netty.buffer.ChannelBufferIndexFinder;
import org.jboss.netty.buffer.ChannelBuffers;
import org.jboss.netty.channel.Channel;
import org.jboss.netty.channel.ChannelHandlerContext;
import org.jboss.netty.channel.ChannelPipeline;
import org.jboss.netty.channel.ChannelPipelineFactory;
import org.jboss.netty.channel.Channels;
import org.jboss.netty.channel.ChannelStateEvent;
import org.jboss.netty.channel.ExceptionEvent;
import org.jboss.netty.channel.MessageEvent;
import org.jboss.netty.channel.SimpleChannelHandler;
import org.jboss.netty.channel.socket.nio.NioServerSocketChannelFactory;
import org.jboss.netty.handler.codec.replay.ReplayingDecoder;
import com.loggly.syslog.SyslogDecoder;

public class SyslogServer {
  public class SyslogHandler extends SimpleChannelHandler {
    public int count;
    public long start;

    public SyslogHandler() {
      super();
      this.count = 0;
      this.start = System.currentTimeMillis();
    }

    public void messageReceived(ChannelHandlerContext context, MessageEvent event) {
      count += 1;
      if (count % 100000 == 0) {
        //ChannelBuffer buffer = (ChannelBuffer) event.getMessage();
        //System.out.println(buffer.toString(Charset.defaultCharset()));
        System.out.println(event.getMessage());
        double rate = (double)this.count / (((double)System.currentTimeMillis() - this.start) / 1000.);
        System.out.println("Rate: " + rate + " (total: " + this.count);
      }
    }

    public void exceptionCaught(ChannelHandlerContext context, ExceptionEvent event) {
      event.getCause().printStackTrace();
      event.getChannel().close();
    }
  } /* class SyslogHandler */

  private NioServerSocketChannelFactory factory;
  private ServerBootstrap bootstrap;
  private int port;
  private String host;

  public SyslogServer(String host, int port) {
    this.host = host;
    this.port = port;
    this.factory = new NioServerSocketChannelFactory(
      Executors.newCachedThreadPool(), 
      Executors.newCachedThreadPool()
    );

    this.bootstrap = new ServerBootstrap(factory);
    this.bootstrap.setPipelineFactory(new ChannelPipelineFactory() {
      public ChannelPipeline getPipeline() {
        return Channels.pipeline(new SyslogDecoder(), new SyslogHandler());
      }
    });
  }

  public void start() {
    this.bootstrap.bind(new InetSocketAddress(this.host, this.port));
  }

  public static void main(String[] args) {
    String host;
    int port;
    host = args[0];
    port = Integer.parseInt(args[1]);
    SyslogServer server = new SyslogServer(host, port);
    server.start();
  }
}
