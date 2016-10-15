package com.semicomplete.ssl;

import javax.net.ssl.SSLContext;
import java.net.InetSocketAddress;

public class SSLReportBuilder {
  private boolean success;
  private Throwable exception;
  private SSLContext sslContext;

  private InetSocketAddress address;
  private String hostname;

  public SSLReportBuilder() { 
    // nothing
  }

  public void setAddress(InetSocketAddress address) {
    this.address = address;
  }

  public void setHostname(String hostname) {
    this.hostname = hostname;
  }

  public String getHostname() {
    return hostname;
  }

  public InetSocketAddress getAddress() {
    return address;
  }

  public void setFailed(Throwable e) {
    exception = e;
    success = false;
  }

  public void setSSLContext(SSLContext ctx) {
    sslContext = ctx;
  }

  public Throwable getException() {
    return exception;
  }

  public boolean success() {
    return exception == null;
  }
}
