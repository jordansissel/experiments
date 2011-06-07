package com.loggly.syslog;

public class Range {
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

