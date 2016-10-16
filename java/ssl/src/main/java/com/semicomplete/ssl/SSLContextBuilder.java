package com.semicomplete.ssl;

import java.io.IOException;
import java.security.cert.Certificate;
import java.security.cert.X509Certificate;
import java.security.KeyManagementException;
import java.security.KeyStore;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.security.UnrecoverableKeyException;
import java.util.Arrays;
import java.util.Enumeration;
import javax.net.ssl.KeyManager;
import javax.net.ssl.KeyManagerFactory;
import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.TrustManagerFactory;
import javax.net.ssl.X509TrustManager;
import org.apache.logging.log4j.Logger;
import org.apache.logging.log4j.LogManager;

public class SSLContextBuilder {
  private KeyStore trustStore;
  private KeyStore keyStore;
  private SecureRandom random = new SecureRandom();
  private String keyManagerAlgorithm = KeyManagerFactory.getDefaultAlgorithm();
  private String trustManagerAlgorithm = TrustManagerFactory.getDefaultAlgorithm();
  private final Logger logger = LogManager.getLogger();
  private SSLCertificateVerificationTracker tracker;

  public interface SSLCertificateVerificationTracker {
    void track(X509Certificate[] chain, String authType, Throwable exception);
  }

  public SSLContextBuilder setTracker(SSLCertificateVerificationTracker tracker) {
    this.tracker = tracker;
    return this;
  }


  public SSLContextBuilder setKeyStore(KeyStore keyStore) {
    this.keyStore = keyStore;
    return this;
  }

  public SSLContextBuilder setTrustStore(KeyStore trustStore) {
    this.trustStore = trustStore;
    return this;
  }

  public SSLContext build() throws KeyManagementException, KeyStoreException, NoSuchAlgorithmException, UnrecoverableKeyException {
    SSLContext ctx = SSLContext.getInstance("TLS");
    KeyManager[] kms = null;
    TrustManager[] tms = null;

    if (keyStore != null) {
      KeyManagerFactory kmf = null;
      kmf = KeyManagerFactory.getInstance(keyManagerAlgorithm);
      kmf.init(keyStore, null);
      kms = kmf.getKeyManagers();
    }

    if (trustStore != null) {
      TrustManagerFactory tmf = null;
      tmf = TrustManagerFactory.getInstance(trustManagerAlgorithm);
      tmf.init(trustStore);
      tms = Arrays.asList(tmf.getTrustManagers())
        .stream()
        .map((tm) -> new TrackingTrustManager((X509TrustManager)tm))
        .map((tm) -> { tm.setTracker(tracker); return tm; })
        .toArray(size -> new TrustManager[size]);
    }

    logger.trace("Building SSLContext with trust: key:{}, trust:{}", kms, tms);

    ctx.init(kms, tms, random);
    return ctx;
  }
} // SSLContextBuilder
