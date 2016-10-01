package com.semicomplete;

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

import org.apache.logging.log4j.Logger;

public class SSL {

  public static void main(String[] args) {
    String keystore_path = args[0];
    char[] passphrase = args[1].toCharArray();
    String hostname = args[2];
    int port = Integer.parseInt(args[3]);

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
      check(ks, hostname, port);
    } catch (Exception e) {
      e.printStackTrace(System.out);
      Throwable cause = e;
      while ((cause = cause.getCause()) != null) {
        System.out.printf("Caused by: %s\n", cause);
      }
    }
  }

  static SSLContext createSSLContext(KeyStore ks) throws NoSuchAlgorithmException, KeyStoreException, UnrecoverableKeyException, KeyManagementException {
    SSLContext ctx = SSLContext.getInstance("TLS");
    KeyManagerFactory kmf = KeyManagerFactory.getInstance(KeyManagerFactory.getDefaultAlgorithm());

    TrustManagerFactory tmf = TrustManagerFactory.getInstance(TrustManagerFactory.getDefaultAlgorithm());

    kmf.init(ks, null);
    KeyManager[] km = kmf.getKeyManagers();

    tmf.init(ks);
    TrustManager[] tm = tmf.getTrustManagers();

    SecureRandom random = new SecureRandom();
    ctx.init(km, tm, random);
    return ctx;
  } // createSSLContext

  static SSLSocket createSSLSocket(Socket socket, String hostname, int port, SSLContext ctx) throws IOException {
    SSLSocketFactory socket_factory = ctx.getSocketFactory();
    return (SSLSocket)socket_factory.createSocket(socket, hostname, port, true);
  } // createSSLSocket

  static void verifyHostname(SSLSession session, String hostname) {
    //System.out.printf("Let's do hostname verification, now.\n");
    HostnameVerifier hv = HttpsURLConnection.getDefaultHostnameVerifier();

    for (String n : session.getValueNames()) {
      System.out.printf("session[%s] = %s\n", n, session.getValue(n));
    }

    if (hv.verify(hostname, session)) {
      System.out.printf("Hostname verification OK\n");
    } else {
      System.out.printf("Hostname verification failed\n");
      diagnoseHostnameVerification(session, hostname);
    }
  } // verifyHostname

  static void diagnoseHostnameVerification(SSLSession session, String hostname) {
    X509Certificate peercert;
    try {
      peercert = (X509Certificate)session.getPeerCertificates()[0];
    } catch (SSLPeerUnverifiedException e) {
      System.out.printf("Couldn't verify the connection: %s\n", e);
      return;
    }

    String subject = peercert.getSubjectX500Principal().getName(X500Principal.CANONICAL);
    System.out.printf("Peer certificate subject is: '%s'\n", subject);

    Collection<List<?>> subjectAlts;

    try {
      subjectAlts = peercert.getSubjectAlternativeNames();
    } catch (CertificateParsingException e) {
      System.out.printf("Failed parsing peer certificate when looking for subjectAltNames: %s\n", e);
      return;
    }

    if (subjectAlts != null) {
      for (List<?> altEntry : subjectAlts) {
        Integer type = (Integer)altEntry.get(0);
        String name = (String)altEntry.get(1);
        switch (type.intValue()) {
          case 2: // dNSName 
            System.out.printf("SubjectAltName DNS=%s ", (String)name);

            // Only do this check if the hostname is a DNS name.
            if (name.equals(hostname)) {
              System.out.printf("Match! :)!\n");
            } else {
              System.out.printf("Nope.\n");
            }
          case 7: // iPAddress
            System.out.printf("SubjectAltName IP=%s ", (String)name);

            // Only do this check if the hostname is an IP address.
            if (name.equals(hostname)) {
              System.out.printf("Match! :)!\n");
            } else {
              System.out.printf("Nope.\n");
            }
            break;
          default:
            System.out.printf("Ignoring subjectAltName [%d]:%s\n", type, name);
        }
      }
    }
  }

  static void checkIfURLWillWork(String hostname, int port, SSLContext ctx) {
    HttpsURLConnection.setDefaultSSLSocketFactory(ctx.getSocketFactory());

    try {
      URL u = new URL("https://" + hostname + ":" + port + "/");
      URLConnection uc = u.openConnection();
      uc.setConnectTimeout(2000);
      uc.setReadTimeout(2000);
      uc.connect();
      System.out.println(uc.getContent());
    } catch (Exception e) {
      System.out.printf("Error: %s\n", e);
    }
  } // checkIfURLWillWork

  public static void check(KeyStore ks, String hostname, int port) {
    SSLContext ctx;
    
    try {
      ctx = createSSLContext(ks);
    } catch (NoSuchAlgorithmException e) {
      System.out.printf("BUG: %s\n", e);
      e.printStackTrace(System.out);
      return;
    } catch (KeyStoreException e) {
      System.out.printf("Failed trying to use keystore: %s\n", e);
      e.printStackTrace(System.out);
      return;
    } catch (KeyManagementException e) {
      System.out.printf("Something is wrong with the keystore: (KeyManagementException) %s", e);
      e.printStackTrace(System.out);
      return;
    } catch (UnrecoverableKeyException e) {
      System.out.printf("Failed to recover a key from the keystore: %s\n", e);
      e.printStackTrace(System.out);
      return;
    }

    checkIfURLWillWork(hostname, port, ctx);

    InetAddress[] addresses;
    try {
      addresses = InetAddress.getAllByName(hostname);
    } catch (UnknownHostException e) {
      System.out.printf("Unknown host: %s (error: %s)\n", hostname, e);
      return;
    }

    for (InetAddress a : addresses) {
      checkAddress(ctx, a, port);
    }
  } // check

  static void checkAddress(SSLContext ctx, InetAddress address, int port) {
    System.out.printf("Checking address: %s\n", address);

    Socket socket;
    String hostname = address.getHostName();
    try {
      socket = new Socket();
      socket.connect(new InetSocketAddress(address, port), 1000);
    } catch (IOException e) {
      System.out.printf("Problem connection to host: %s[hostname=%s] (error: %s)\n", address, hostname, e);
      return;
    }

    try (Socket ssl_socket = createSSLSocket(socket, hostname, port, ctx)) {
      //System.out.printf("SSL/TLS handshake to %s:%d was successful :)\n", hostname, port);
      SSLSession session = ((SSLSocket)ssl_socket).getSession();

      verifyHostname(session, hostname);
      ssl_socket.close();
    } catch (Throwable e){
      System.out.printf("O_o: %s\n", e);
      // Something went wrong with the SSL handshake or a connection problem.
    } 
  }
}
