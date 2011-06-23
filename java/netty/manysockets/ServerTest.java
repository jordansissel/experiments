import java.net.InetSocketAddress;
import java.nio.charset.Charset;
import java.util.concurrent.Executors;
import java.util.Map;
import org.jboss.netty.bootstrap.Bootstrap;
import org.jboss.netty.bootstrap.ServerBootstrap;
import org.jboss.netty.channel.Channel;
import org.jboss.netty.channel.ChannelHandlerContext;
import org.jboss.netty.channel.ChannelPipeline;
import org.jboss.netty.channel.ChannelPipelineFactory;
import org.jboss.netty.channel.Channels;
import org.jboss.netty.channel.socket.nio.NioServerSocketChannelFactory;
import org.jboss.netty.channel.ChannelStateEvent;
import org.jboss.netty.channel.ExceptionEvent;
import org.jboss.netty.channel.MessageEvent;
import org.jboss.netty.channel.SimpleChannelHandler;
import org.jboss.netty.channel.ChannelFactory;
import org.jboss.netty.handler.codec.replay.ReplayingDecoder;
import org.jboss.netty.handler.ssl.SslHandler;

public class ServerTest {
  public class Handler extends SimpleChannelHandler {
    public int count;
    public long start;

    public Handler() {
      super();
      this.count = 0;
      this.start = System.currentTimeMillis();
    }

    public void channelConnected(ChannelHandlerContext context, ChannelStateEvent event) {
      System.out.println("New connection");
    }

    public void messageReceived(ChannelHandlerContext context, MessageEvent event) {
      count += 1;
      //if (count % 100000 == 0) {
        System.out.println(event.getMessage());
        double rate = (double)this.count / (((double)System.currentTimeMillis() - this.start) / 1000.);
        System.out.println("Rate: " + rate + " (total: " + this.count);
      //}
      //context.sendUpstream(event);
    }

    public void exceptionCaught(ChannelHandlerContext context, ExceptionEvent event) {
      event.getCause().printStackTrace();
      event.getChannel().close();
    }
  } /* class Handler */

  public String host;
  public int port;
  public ChannelFactory factory;

  public ServerTest(ChannelFactory factory, int port) {
    this.factory = factory;
    this.host = "0.0.0.0";
    this.port = port;
  } /* constructor */

  public void start() {
    System.out.println("Starting tcp server on port " + this.port);
    Bootstrap bootstrap = new ServerBootstrap(factory);
    bootstrap.setPipelineFactory(new ChannelPipelineFactory() {
      public ChannelPipeline getPipeline() {
        ChannelPipeline pipeline =  Channels.pipeline();
        pipeline.addLast("handler", new Handler());
        return pipeline;
      }
    });

    InetSocketAddress address = new InetSocketAddress(this.host, this.port);
    ((ServerBootstrap)bootstrap).bind(address);
  } /* start_tcp */

  public static void main(String[] args) {
    int start_port = 5000;
    ChannelFactory factory = new NioServerSocketChannelFactory(
      Executors.newCachedThreadPool(), 
      Executors.newCachedThreadPool()
    );

    /* Listen on lots of ports */
    for (int port = start_port; port < (start_port + 10000); port++) {
      ServerTest server = new ServerTest(factory, port);
      server.start();
    }
  } /* main */
}
