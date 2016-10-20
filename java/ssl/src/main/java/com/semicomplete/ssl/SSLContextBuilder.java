package com.semicomplete.ssl;

import java.security.cert.X509Certificate;
import java.security.KeyManagementException;
import java.security.KeyStore;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.security.UnrecoverableKeyException;
import java.util.Arrays;
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
  private final SecureRandom random = new SecureRandom();
  private final String keyManagerAlgorithm = KeyManagerFactory.getDefaultAlgorithm();
  private final String trustManagerAlgorithm = TrustManagerFactory.getDefaultAlgorithm();
  private final Logger logger = LogManager.getLogger();
  private SSLCertificateVerificationTracker tracker;

  public interface SSLCertificateVerificationTracker {
    void track(X509Certificate[] chain, String authType, Throwable exception);
  }

  public void setTracker(SSLCertificateVerificationTracker tracker) {
    this.tracker = tracker;
  }


  public void setKeyStore(KeyStore keyStore) {
    this.keyStore = keyStore;
  }

  public void setTrustStore(KeyStore trustStore) {
    this.trustStore = trustStore;
  }

  public SSLContext build() throws KeyManagementException, KeyStoreException, NoSuchAlgorithmException, UnrecoverableKeyException {
    SSLContext ctx = SSLContext.getInstance("TLS");
    KeyManager[] kms = null;
    TrustManager[] tms = null;

    //logger.info("Trusting {} certificates", keystoreTrustedCertificates(keystore).size());
    if (keyStore != null) {
      KeyManagerFactory kmf;
      kmf = KeyManagerFactory.getInstance(keyManagerAlgorithm);
      kmf.init(keyStore, null);
      kms = kmf.getKeyManagers();
    }

    if (trustStore != null) {
      TrustManagerFactory tmf;
      tmf = TrustManagerFactory.getInstance(trustManagerAlgorithm);
      tmf.init(trustStore);
      tms = Arrays.stream(tmf.getTrustManagers())
        .map((tm) -> new TrackingTrustManager((X509TrustManager)tm))
        .map((tm) -> { tm.setTracker(tracker); return tm; })
        .toArray(TrustManager[]::new);
    }

    logger.trace("Building SSLContext with trust: key:{}, trust:{}", kms, tms);

    ctx.init(kms, tms, random);
    return ctx;
  }
} // SSLContextBuilder
