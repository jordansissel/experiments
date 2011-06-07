package com.loggly.syslog;

import java.nio.charset.Charset;
import java.util.Date;
import org.jboss.netty.buffer.ChannelBuffer;

public class SyslogEvent {
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

