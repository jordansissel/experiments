package com.semicomplete.ssl;
import javax.net.ssl.SSLSession;

public class HandshakeProblem extends Exception {
  public final SSLSession session;
  public final PeerCertificateDetails peerCertificateResult;

  public HandshakeProblem(String message, SSLSession session, PeerCertificateDetails peerCertificateResult) {
    super(message);
    this.session = session;
    this.peerCertificateResult = peerCertificateResult;
  }

}
