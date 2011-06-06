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
import java.util.Date;

public class SyslogServer {
  class SyslogEvent {
    public Date timestamp;
    public int priority;
    public String message;

    public SyslogEvent() {
      this.timestamp = new Date();
      this.priority = 13;
    }

    public String toString() {
      return "pri:" + priority + " timestamp:" + timestamp + " message:" + message;
    }

    public void setPriorityFromBuffer(ChannelBuffer buffer) {
      this.priority = Integer.parseInt(buffer.toString(Charset.forName("US-ASCII")));
    }
  } /* class SyslogEvent */

  enum SyslogParserState {
    START,
    READ_PRI,
    READ_PRI_START,
    READ_PRI_END,
    READ_DATE, /* NOT CURRENTLY SUPPORTED */
    READ_MESSAGE,
  }

  class SyslogDecoder extends ReplayingDecoder<SyslogParserState> {
    private ChannelBuffer cumulator;
    private SyslogEvent event;

    private int pri_start;
    private int date_start;
    private int message_start;

    public SyslogDecoder() {
      super(SyslogParserState.START);
      cumulator = ChannelBuffers.dynamicBuffer();
    }

    protected Object decode(ChannelHandlerContext context, Channel channel, 
                            ChannelBuffer buffer,
                            SyslogParserState state) throws Exception {
      byte b;

      switch (state) {
        case START:
          this.cumulator.clear();
          this.event = new SyslogEvent();
          /* fall through */
        case READ_PRI_START:
          b = buffer.readByte();
          this.cumulator.writeByte(b);
          if (b != '<') { /* is not '<' (for <123> priority header */
            this.checkpoint(SyslogParserState.READ_MESSAGE);
            break;
          }
          this.checkpoint(SyslogParserState.READ_PRI);
          /* fall through */
        case READ_PRI:
          b = buffer.readByte();

          if (b >= '0' && b <= '9') {  /* [0-9] */
            this.cumulator.writeByte(b);
            if (this.cumulator.readableBytes() - this.pri_start == 3) {
              /* max length of a <134> pri value is 3 digits (RFC3164) */
              this.checkpoint(SyslogParserState.READ_PRI_END);
            }
          } else if (b == '>') {
            /* Back up to reprocess the '>' */
            buffer.readerIndex(buffer.readerIndex() - 1);
            this.checkpoint(SyslogParserState.READ_PRI_END);
          } else {
            /* Invalid pri value */
            ChannelBuffer copy = this.cumulator.copy();
            this.cumulator.clear();
            this.cumulator.writeByte('<');
            this.cumulator.writeBytes(copy);
            this.cumulator.writeByte(b);
            this.checkpoint(SyslogParserState.READ_MESSAGE);
          }
          break;
        case READ_PRI_END:
          b = buffer.readByte();
          if (b == '>') {
            this.event.setPriorityFromBuffer(this.cumulator);
            this.cumulator.clear();
          } else {
            /* Invalid message, expected '>' from '<123>' but got something else. */
            ChannelBuffer copy = this.cumulator.copy();
            this.cumulator.clear();
            this.cumulator.writeByte('<');
            this.cumulator.writeBytes(copy);
            this.cumulator.writeByte(b);
          }
          this.checkpoint(SyslogParserState.READ_MESSAGE);
          /* fall through */
        case READ_MESSAGE:
          while ((b = buffer.readByte()) != 10) {
            this.cumulator.writeByte(b);
            /* TODO(sissel): Check with Brian why longer than 64k is too long? */
            if (this.cumulator.readableBytes() > 65536) {
              /* message too long, cut it now. */
              /* TODO(sissel): log that we have a long line */
              break;
            }
          } /* read until newline */
          this.event.message = cumulator.toString(Charset.defaultCharset());
          this.checkpoint(SyslogParserState.START);
          return this.event;
      } /* switch (state) */
      return null;
    } /* decode */
  } /* class SyslogDecoder */

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
      if (count % 10000 == 0) {
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
