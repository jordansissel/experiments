package com.semicomplete.ssl;
import javax.net.ssl.SSLSession;

public class HandshakeProblem extends Exception {
  public final SSLSession session;

  public HandshakeProblem(String message, SSLSession session) {
    super(message);
    this.session = session;
  }

}
