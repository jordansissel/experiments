package com.semicomplete;
import static org.junit.Assert.assertEquals;
import org.junit.Test;
import java.net.URLConnection;
import java.net.URL;
import java.io.FileInputStream;
import javax.net.ssl.SSLPeerUnverifiedException;
import java.io.OutputStream;
import java.io.IOException;
import java.net.Socket;
import java.net.InetSocketAddress;
import java.net.InetAddress;
import java.net.UnknownHostException;
import java.security.cert.X509Certificate;
import java.security.KeyStore;
import java.security.NoSuchAlgorithmException;
import java.security.UnrecoverableKeyException;
import java.security.KeyManagementException;
import java.security.KeyStoreException;
import java.security.SecureRandom;
import java.util.Collection;
import java.util.List;
import java.io.FileNotFoundException;
import javax.net.ssl.HostnameVerifier;
import javax.net.ssl.HttpsURLConnection;
import javax.net.ssl.KeyManager;
import javax.net.ssl.KeyManagerFactory;
import javax.net.ssl.SSLContext;
import javax.net.ssl.SSLSession;
import javax.net.ssl.SSLSocket;
import javax.net.ssl.SSLSocketFactory;
import javax.net.ssl.TrustManager;
import javax.net.ssl.TrustManagerFactory;
import javax.net.ssl.X509ExtendedKeyManager;
import javax.net.ssl.X509ExtendedTrustManager;
import javax.security.auth.x500.X500Principal;
import java.security.cert.CertificateParsingException;
import java.security.cert.CertificateException;
import org.apache.http.conn.ssl.DefaultHostnameVerifier;
import org.apache.logging.log4j.Logger;
import com.semicomplete.SSL;

public class SSLTest {
  @Test
  public void hasFun() {
    String keystore_path = "./foo.jks";
    char[] passphrase = "foobar".toCharArray();
    String hostname = "127.0.0.1";
    int port = 8888;

    KeyStore ks;
    try { 
      ks = KeyStore.getInstance(KeyStore.getDefaultType());
    } catch (KeyStoreException e) {
      System.out.printf("BUG: %s\n", e);
      e.printStackTrace(System.out);
      return;
    }

    try (FileInputStream fs = new FileInputStream(keystore_path)) {
      ks.load(fs, passphrase);
    } catch (FileNotFoundException e) {
      System.out.printf("Could not find keystore file '%s'\n", keystore_path);
      return;
    } catch (IOException e) {
      System.out.printf("Failure trying to use keystore '%s'. Error: %s\n", keystore_path, e);
      return;
    } catch (NoSuchAlgorithmException e) {
      System.out.printf("BUG: %s\n", e);
      e.printStackTrace(System.out);
      return;
    } catch (CertificateException e) {
      System.out.printf("Something is wrong with the keystore '%s'. Error: %s\n", keystore_path, e);
      return;
    }

    try {
      SSL.check(ks, hostname, port);
    } catch (Exception e) {
      e.printStackTrace(System.out);
      Throwable cause = e;
      while ((cause = cause.getCause()) != null) {
        System.out.printf("Caused by: %s\n", cause);
      }
      throw e;
    }
  }
}

