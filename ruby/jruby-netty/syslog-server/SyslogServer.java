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
    START_MESSAGE,
    READ_MESSAGE,
  }

  class Range {
    public int start;
    public int end;

    public void clear() {
      this.start = this.end = 0;
    }

    public int length() {
      return this.end - this.start;
    }

    public String toString() {
      return "[" + this.start + " .. " + this.end + "]";
    }
  } /* class Range */

  class SyslogDecoder extends ReplayingDecoder<SyslogParserState> {
    private ChannelBuffer cumulator;
    private SyslogEvent event;

    private Range pri;
    private Range date;
    private Range message;

    public SyslogDecoder() {
      super(SyslogParserState.START);
      cumulator = ChannelBuffers.dynamicBuffer();
      pri = new Range();
      date = new Range();
      message = new Range();
    }

    protected Object decode(ChannelHandlerContext context, Channel channel, 
                            ChannelBuffer buffer,
                            SyslogParserState state) throws Exception {
      byte b;

      switch (state) {
        case START:
          this.cumulator.clear();
          this.event = new SyslogEvent();
          this.pri.clear();
          this.date.clear();
          this.message.clear();
          /* fall through */
        case READ_PRI_START:
          b = buffer.readByte();
          this.cumulator.writeByte(b);
          if (b != '<') { /* is not '<' (for <123> priority header */
            /* Invalid pri header, entire line is the message */
            this.message.start = this.cumulator.readerIndex();
            this.checkpoint(SyslogParserState.START_MESSAGE);
            break;
          }
          this.pri.start = this.cumulator.writerIndex(); /* start after '<' */
          this.checkpoint(SyslogParserState.READ_PRI);
          /* fall through */
        case READ_PRI:
          b = buffer.readByte();
          this.cumulator.writeByte(b);

          if (b >= '0' && b <= '9') {  /* [0-9] */
            if (this.cumulator.readableBytes() - this.pri.start > 3) {
              /* invalid pri value, max length of pri is 3 digits, "<123>" */
              /* The entire line is a message, then */
              this.message.start = this.cumulator.readerIndex();
              this.checkpoint(SyslogParserState.START_MESSAGE);
            }
          } else if (b == '>') {
            this.pri.end = this.cumulator.writerIndex() - 1;
            if (this.pri.length() == 0) {
              /* invalid pri, got "<>" */
              this.message.start = this.cumulator.readerIndex();
            } else {
              this.event.setPriorityFromBuffer(this.cumulator.slice(this.pri.start, this.pri.length()));
              this.message.start = this.cumulator.writerIndex();
            }
            this.checkpoint(SyslogParserState.START_MESSAGE);
          } else {
            /* Invalid pri value */
            /* The entire line is a message, then */
            this.message.start = this.cumulator.readerIndex();
            this.checkpoint(SyslogParserState.START_MESSAGE);
          }
          break;
        case START_MESSAGE:
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
          this.message.end = cumulator.writerIndex();
          //System.out.println("Range: " + this.message);
          this.event.message = cumulator.slice(this.message.start, this.message.length()).
            toString(Charset.defaultCharset());
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
