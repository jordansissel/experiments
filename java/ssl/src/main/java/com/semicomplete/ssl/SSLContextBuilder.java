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

public class SSLContextBuilder {
  private KeyStore trustStore;
  private KeyStore keyStore;
  private SecureRandom random = new SecureRandom();
  private String keyManagerAlgorithm = KeyManagerFactory.getDefaultAlgorithm();
  private String trustManagerAlgorithm = TrustManagerFactory.getDefaultAlgorithm();

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
    KeyManagerFactory kmf = KeyManagerFactory.getInstance(keyManagerAlgorithm);
    TrustManagerFactory tmf = TrustManagerFactory.getInstance(trustManagerAlgorithm);

    //System.out.printf("build(): ks: %s; ts: %s\n", keyStore, trustStore);
    //for (Enumeration<String> e = trustStore.aliases(); e.hasMoreElements();) {
      //X509Certificate cert = (X509Certificate) trustStore.getCertificate(e.nextElement());
      //System.out.printf("trust: %s\n", cert);
    //}
    kmf.init(keyStore, null);
    tmf.init(trustStore);
    ctx.init(kmf.getKeyManagers(), tmf.getTrustManagers(), random);
    return ctx;
  }
} // SSLContextBuilder
