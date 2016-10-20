package com.semicomplete.ssl;

import javax.net.ssl.SSLSession;
import javax.net.ssl.SSLContext;
import java.net.InetSocketAddress;

class SSLReport {
  private Throwable exception;
  private SSLContext sslContext;
  private SSLSession sslSession;
  private InetSocketAddress address;
  private PeerCertificateDetails peerCertificateDetails;
  private String hostname;

  SSLReport() {
    // Nothing
  }

  void setAddress(InetSocketAddress address) {
    this.address = address;
  }

  void setHostname(String hostname) {
    this.hostname = hostname;
  }

  String getHostname() {
    return hostname;
  }

  InetSocketAddress getAddress() {
    return address;
  }

  void setFailed(Throwable e) {
    exception = e;
  }

  void setSSLContext(SSLContext ctx) {
    sslContext = ctx;
  }

  SSLContext getSSLContext() {
    return sslContext;
  }

  void setSSLSession(SSLSession s) {
    sslSession = s;
  }

  SSLSession getSSLSession() {
    return sslSession;
  }

  void setPeerCertificateDetails(PeerCertificateDetails details) {
    peerCertificateDetails = details;
  }

  Throwable getException() {
    return exception;
  }

  boolean success() {
    return exception == null;
  }
}
