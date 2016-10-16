package com.semicomplete.ssl;

import java.security.cert.X509Certificate;

public class PeerCertificateDetails {
  private final X509Certificate[] chain;
  private final String authType;
  private final Throwable exception;

  public PeerCertificateDetails(X509Certificate[] chain, String authType, Throwable exception) {
    this.chain = chain;
    this.authType = authType;
    this.exception = exception;
  }

  public X509Certificate[] getChain() {
    return chain;
  }

  public String getAuthType() {
    return authType;
  }

  public Throwable getException() {
    return exception;
  }
}
