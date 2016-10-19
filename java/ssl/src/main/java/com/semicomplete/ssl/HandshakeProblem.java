package com.semicomplete.ssl;
import javax.net.ssl.SSLSession;

public class HandshakeProblem extends Exception {
  public final SSLSession session;
  public final PeerCertificateDetails peerCertificateDetails;

  public HandshakeProblem(String message, SSLSession session, PeerCertificateDetails peerCertificateDetails) {
    super(message);
    this.session = session;
    this.peerCertificateDetails = peerCertificateDetails;
  }

}
