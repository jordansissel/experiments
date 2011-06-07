package com.loggly.syslog;

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
import org.jboss.netty.channel.socket.nio.NioServerSocketChannelFactory;
import org.jboss.netty.handler.codec.replay.ReplayingDecoder;
import com.loggly.syslog.Range;
import com.loggly.syslog.SyslogEvent;
import com.loggly.syslog.SyslogParserState;

public class SyslogDecoder extends ReplayingDecoder<SyslogParserState> {

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
          /* Invalid pri header, first field could be a date, or a message. */
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
            this.checkpoint(SyslogParserState.START_MESSAGE);
          } else {
            /* valid pri, handle it. Next field is the date. */
            this.event.setPriorityFromBuffer(this.cumulator.slice(this.pri.start, this.pri.length()));
            this.date.start = this.message.start = this.cumulator.writerIndex();
            this.checkpoint(SyslogParserState.START_DATE);
          }
        } else {
          /* Invalid pri value */
          /* The entire line is a message, then */
          this.message.start = this.cumulator.readerIndex();
          this.checkpoint(SyslogParserState.START_MESSAGE);
        }
        break;
      case START_DATE:
        /* I don't really care about parsing the date right now,
         * so let's just read 3 space-delimited things and move on. */
        this.checkpoint(SyslogParserState.READ_MONTH);
        /* fall through */
      case READ_MONTH:
        while ((b = buffer.readByte()) != ' ') {
          this.cumulator.writeByte(b);
        }
        /* read up to the first space, now */
        this.checkpoint(SyslogParserState.READ_DAY);
        /* fall through */
      case READ_DAY:
        this.cumulator.writeByte(buffer.readByte()); /* first digit or space */
        this.cumulator.writeByte(buffer.readByte()); /* second digit */
        this.cumulator.writeByte(buffer.readByte()); /* space */
        this.checkpoint(SyslogParserState.READ_HOUR);
        /* fall through */
      case READ_HOUR:
        this.cumulator.writeByte(buffer.readByte()); /* first digit */
        this.cumulator.writeByte(buffer.readByte()); /* second digit */
        this.cumulator.writeByte(buffer.readByte()); /* ':' */
        this.checkpoint(SyslogParserState.READ_MINUTE);
        /* fall through */
      case READ_MINUTE:
        this.cumulator.writeByte(buffer.readByte()); /* first digit */
        this.cumulator.writeByte(buffer.readByte()); /* second digit */
        this.cumulator.writeByte(buffer.readByte()); /* ':' */
        this.checkpoint(SyslogParserState.READ_SECOND);
        /* fall through */
      case READ_SECOND:
        this.cumulator.writeByte(buffer.readByte()); /* first digit */
        this.cumulator.writeByte(buffer.readByte()); /* second digit */
        this.cumulator.writeByte(buffer.readByte()); /* space */
        this.message.start = this.cumulator.writerIndex();
        /* fall through */
      case START_MESSAGE:
        this.checkpoint(SyslogParserState.READ_MESSAGE);
        /* fall through */
      case READ_MESSAGE:
        while ((b = buffer.readByte()) != '\n') {
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

