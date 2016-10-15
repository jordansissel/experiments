package com.semicomplete.ssl;
import java.security.SecureRandom;
import java.security.NoSuchAlgorithmException;
import java.security.KeyStoreException;
import java.security.UnrecoverableKeyException;
import java.security.KeyStore;
import javax.net.ssl.SSLContext;
import java.security.KeyManagementException;
import javax.net.ssl.TrustManager;
import javax.net.ssl.KeyManager;
import java.io.IOException;
import javax.net.ssl.KeyManagerFactory;
import javax.net.ssl.TrustManagerFactory;

import java.security.cert.X509Certificate;
import java.security.cert.Certificate;
import java.util.Enumeration;

import org.apache.logging.log4j.Logger;
import org.apache.logging.log4j.LogManager;

public class SSLContextBuilder {
  private KeyStore trustStore;
  private KeyStore keyStore;
  private SecureRandom random = new SecureRandom();
  private String keyManagerAlgorithm = KeyManagerFactory.getDefaultAlgorithm();
  private String trustManagerAlgorithm = TrustManagerFactory.getDefaultAlgorithm();
  private final Logger logger = LogManager.getLogger();

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
      tms = tmf.getTrustManagers();
      // TODO(sissel): Wrap `tms` entries with a custom trust manager so we can log the certificate chain.
      // Seems like basically we can just do delegation + logging
      // https://docs.oracle.com/javase/7/docs/api/javax/net/ssl/X509TrustManager.html
    }

    logger.trace("Building SSLContext with trust: key:{}, trust:{}", kms, tms);

    ctx.init(kms, tms, random);
    return ctx;
  }
} // SSLContextBuilder
