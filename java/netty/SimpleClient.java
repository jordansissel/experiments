import org.jboss.netty.channel.SimpleChannelHandler;
import org.jboss.netty.channel.Channels;
import org.jboss.netty.channel.ChannelPipelineFactory;
import org.jboss.netty.channel.Channel;
import org.jboss.netty.channel.ChannelPipeline;
import org.jboss.netty.buffer.ChannelBuffers;
import org.jboss.netty.buffer.ChannelBuffer;
import org.jboss.netty.channel.ExceptionEvent;
import org.jboss.netty.channel.ChannelStateEvent;
import org.jboss.netty.channel.ChannelHandlerContext;
import java.net.InetSocketAddress;
import org.jboss.netty.channel.socket.nio.NioClientSocketChannelFactory;
import java.util.concurrent.Executors;
import org.jboss.netty.bootstrap.ClientBootstrap;

public class SimpleClient {
  public class SimpleClientHandler extends SimpleChannelHandler {
    @Override
    public void channelConnected(ChannelHandlerContext context, ChannelStateEvent event) {
      final ChannelStateEvent event_ = event;

      /* Run the flooder in a separate thread */
      Thread flooder = new Thread(new Runnable() {
        public void run() {
          flood(event_.getChannel());
        }
      });

      flooder.start();
    } /* def channelConnected */

    public void exceptionCaught(ChannelHandlerContext context, ExceptionEvent event) {
      event.getCause().printStackTrace();
      event.getChannel().close();
    }

    public void flood(Channel channel) {
      ChannelBuffer input = ChannelBuffers.copiedBuffer(
        "<13>May 19 18:30:17 snack jls: foo bar 32\n".getBytes()
      );

      int count = 0;
      int bytes = 0;
      long sleeptime_ms;

      System.out.println("Ready");
      while (true) {
        sleeptime_ms = 1;
        while (!channel.isWritable()) {
          System.out.println("busy... " + sleeptime_ms + " sleep_ms, " + bytes + " bytes written");
          try {
            Thread.sleep(sleeptime_ms);
          } catch (InterruptedException e) {
            // ignore it
          }
          sleeptime_ms = Math.min(sleeptime_ms + sleeptime_ms, 10000);
        }

        channel.write(input);
        input.readerIndex(0);
        count += 1;
        bytes += input.readableBytes();
        if (count % 100000 == 0) {
          System.out.println(count);
        }
      } /* while true */
    } /* void flood() */
  } /* class SimpleClientHandler */

  private NioClientSocketChannelFactory factory;
  private ClientBootstrap bootstrap;
  private int port;
  private String host;

  public SimpleClient(String host, int port) {
    this.host = host;
    this.port = port;
    this.factory = new NioClientSocketChannelFactory(
      Executors.newCachedThreadPool(), 
      Executors.newCachedThreadPool()
    );

    this.bootstrap = new ClientBootstrap(factory);
    this.bootstrap.setPipelineFactory(new ChannelPipelineFactory() {
      public ChannelPipeline getPipeline() {
        return Channels.pipeline(new SimpleClientHandler());
      }
    });
  }

  public void start() {
    this.bootstrap.connect(new InetSocketAddress(this.host, this.port));
  }

  public static void main(String[] args) {
    String host;
    int port;
    host = args[0];
    port = Integer.parseInt(args[1]);
    SimpleClient client = new SimpleClient(host, port);
    client.start();
  }
}

