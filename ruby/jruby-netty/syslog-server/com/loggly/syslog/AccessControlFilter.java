package com.loggly.syslog;

import com.loggly.syslog.Range;
import com.loggly.syslog.SyslogEvent;
import com.loggly.syslog.SyslogParserState;
import java.net.InetSocketAddress;
import java.nio.charset.Charset;
import java.util.concurrent.Executors;
import org.jboss.netty.bootstrap.ServerBootstrap;
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
import org.jboss.netty.channel.SimpleChannelUpstreamHandler
import org.jboss.netty.channel.socket.nio.NioServerSocketChannelFactory;
import org.jboss.netty.handler.codec.replay.ReplayingDecoder;
import java.util.Set;
import java.util.HashSet;

public class AccessControlFilter extends SimpleChannelUpstreamHandler {
  private Set<InetAddress> acl;

  public AccessControlFilter() {
    acl = new HashSet<InetAddress>();
  }

  public void channelConnected(ChannelHandlerContext context,
                               ChannelStateEvent event) throws Exception {
    Channel channel = context.getChannel();
    InetSocketAddress client = channel.getRemoteAddress();
    InetAddress address = client.getAddress();

    /* Check client.getAddress() as being in the access list */
    if (!this.allows(address)) {
      System.out.println("Got connection from unauthorized address: " + address);
      channel.close();
    }
  } /* channelConnected */

  public void setACL(Set<InetAddress> newacl) {
    this.acl = newacl;
  } /* setACL */

  public boolean allows(InetAddress address) {
    return this.acl.contains(address);
  } /* allows */
} /* class SyslogDecoder */

