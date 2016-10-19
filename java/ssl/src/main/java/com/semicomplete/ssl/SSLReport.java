package com.semicomplete.ssl;

import javax.net.ssl.SSLSession;
import javax.net.ssl.SSLContext;
import java.net.InetSocketAddress;

public class SSLReport {
  private Throwable exception;
  private SSLContext sslContext;
  private SSLSession sslSession;
  private InetSocketAddress address;
  private PeerCertificateDetails peerCertificateDetails;
  private String hostname;
  private boolean success;

  public SSLReport() { 
    // Nothing
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

  public void setSSLSession(SSLSession s) {
    sslSession = s;
  }

  public void setPeerCertificateDetails(PeerCertificateDetails details) {
    peerCertificateDetails = details;
  }

  public Throwable getException() {
    return exception;
  }

  public boolean success() {
    return exception == null;
  }
}
