package com.semicomplete.ssl;

import java.security.cert.X509Certificate;
import java.security.cert.CertificateException;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;

public class TrackingTrustManager implements X509TrustManager {
  private final X509TrustManager tm;
  private SSLContextBuilder.SSLCertificateVerificationTracker tracker;

  public TrackingTrustManager(X509TrustManager tm) {
    this.tm = tm;
  }

  public void setTracker(SSLContextBuilder.SSLCertificateVerificationTracker tracker) {
    this.tracker = tracker;
  }

  public void checkServerTrusted(X509Certificate[] chain, String authType) throws CertificateException {
    try {
      tm.checkServerTrusted(chain, authType);
    } catch (CertificateException e) {
      if (tracker != null) {
        this.tracker.track(chain, authType, e);
      }
      throw e;
    }
    if (tracker != null) {
      this.tracker.track(chain, authType, null);
    }
  }

  public void checkClientTrusted(X509Certificate[] chain, String authType) throws CertificateException {
    tm.checkClientTrusted(chain, authType);
  }

  public X509Certificate[] getAcceptedIssuers() {
    return tm.getAcceptedIssuers();
  }


}
