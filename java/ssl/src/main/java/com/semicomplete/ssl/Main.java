package com.semicomplete.ssl;
import javax.net.ssl.SSLPeerUnverifiedException;
import java.security.UnrecoverableKeyException;
import java.security.KeyManagementException;
import javax.net.ssl.SSLSession;
import java.security.NoSuchAlgorithmException;
import javax.security.cert.X509Certificate;
import java.security.cert.Certificate;

import java.security.cert.CertificateException;
import java.util.List;
import java.util.LinkedList;
import java.net.UnknownHostException;
import java.io.IOException;
import java.util.Collection;
import java.io.FileNotFoundException;
import com.semicomplete.Resolver;
import com.semicomplete.Blame;
import com.semicomplete.ssl.SSLDiag;
import java.net.ConnectException;
import java.io.FileInputStream;
import org.apache.logging.log4j.Logger;
import org.apache.logging.log4j.LogManager;
import java.security.KeyStoreException;
import java.io.Console;
import java.io.InputStream;
import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.security.KeyStore;
import java.util.Arrays;
import java.util.Iterator;

public class Main {
  public class Bug extends Exception {
    public Bug(String message, Throwable cause) {
      super(message, cause);
    }
  }

  public class ConfigurationProblem extends Exception {
    public ConfigurationProblem(String message) {
      super(message);
    }

    public ConfigurationProblem(String message, Throwable cause) {
      super(message, cause);
    }
  }

  public static void main(String[] args) throws Exception {
    try {
      (new Main(args)).run();
    } catch (Bug e) {
      System.out.printf("Bug: %s\n", e.getMessage());
      e.printStackTrace(System.out);
    } catch (ConfigurationProblem e) {
      String message;
      if (e.getCause() != null) {
        message = String.format("Configuration error: %s. Reason: %s", e.getMessage(), e.getCause().getMessage());
        System.out.println(e.getCause().getMessage());
      } else {
        message = String.format("Configuration error: %s.", e.getMessage());
        System.out.println("2");
      }
      System.out.println(message);
      System.exit(1);
    }
  }

  private final String[] args;
  private static final Logger logger = LogManager.getLogger();

  public Main(String[] args) {
    this.args = args;
  }

  public void run() throws ConfigurationProblem, Bug {
    SSLContextBuilder cb = new SSLContextBuilder();
    Iterator<String> i = Arrays.asList(args).iterator();
    List<String> remainder = parseFlags(cb, i);

    if (remainder.size() == 0) {
      throw new ConfigurationProblem("Usage: ssl [flags] <address> [port]");
    }

    String hostname = remainder.get(0);
    int port = 443;

    if (remainder.size() == 2) {
      port = Integer.parseInt(args[1]);
    }

    SSLDiag diag;
    try {
      diag = new SSLDiag(cb.build());
    } catch (KeyManagementException|KeyStoreException|NoSuchAlgorithmException|UnrecoverableKeyException e) {
      throw new ConfigurationProblem("Failed to build ssl context.", e);
    }

    Collection<InetAddress> addresses;
    try {
      logger.trace("Doing name resolution on {}", hostname); 
      addresses = Resolver.SystemResolver.resolve(hostname);
    } catch (UnknownHostException e) {
      throw new ConfigurationProblem("Unknown host", e);
    }

    System.out.printf("%s resolved to %d addresses\n", hostname, addresses.size());
    for (InetAddress address : addresses) {
      SSLReportBuilder srb = diag.tryssl(new InetSocketAddress(address, port), hostname);
      report(srb);
    }
  }

  public static void report(SSLReportBuilder srb) {
    System.out.printf("%s %s:%d[%s]\n", srb.success() ? "GOOD" : "FAIL", srb.getHostname(), srb.getAddress().getPort(), srb.getAddress().getAddress().getHostAddress());

    if (!srb.success()) {
      reportFailure(srb);
    }
  }

  public static void reportFailure(SSLReportBuilder srb) {
    Throwable e = srb.getException();
    if (e instanceof HandshakeProblem) {
      reportFailure(srb, (HandshakeProblem)e);
    } else {
      System.out.printf("  Error: [%s] %s\n", e.getClass(), e.getMessage());
      System.out.printf("  No other diagnostic information available.\n");
    }
  }

  public static void reportFailure(SSLReportBuilder srb, HandshakeProblem e) {
    System.out.println("Certificate path failure");
    SSLSession s = e.session;

    System.out.printf("Protocol: %s\n", s.getProtocol());

    System.out.printf("Certificates provided by the remote server\n");
    X509Certificate[] peerCerts;
    try {
      peerCerts = s.getPeerCertificateChain();
    } catch (SSLPeerUnverifiedException oops) {
      System.out.printf("!!! Server did not provide any certificates: %s\n", e.getMessage());
      return;
    }

    for (X509Certificate cert : peerCerts) {
      System.out.printf("  %s", ((X509Certificate)cert).getSubjectDN());
    }
  }

  public List<String> parseFlags(SSLContextBuilder cb, Iterator<String> i) throws ConfigurationProblem, Bug {
    List<String> parameters = new LinkedList();

flagIteration:
    while (i.hasNext()) {
      String entry = i.next();
      switch (entry) {
        case "--keystore":
          String path = i.next();
          parseKeyStore(cb, path);
          break;
        case "--":
          break flagIteration;
        default:
          parameters.add(entry); // not a flag, the first non-flag parameter
          break flagIteration;
      }
    }

    while (i.hasNext()) {
      parameters.add(i.next());
    }

    return parameters;
  }

  public void parseKeyStore(SSLContextBuilder cb, String path) throws ConfigurationProblem, Bug {
    KeyStore ks;

    try {
      ks = KeyStore.getInstance(KeyStore.getDefaultType());
    } catch (KeyStoreException e) {
      throw new Bug("Something went wrong getting a KeyStore instance", e);
    }

    FileInputStream fs;
    try {
      fs = new FileInputStream(path);
    } catch (FileNotFoundException e) {
      throw new ConfigurationProblem("Keystore file not found", e);
    }

    System.out.printf("Enter passphrase for keystore %s: ", path);
    char [] passphrase = System.console().readPassword();

    try {
      ks.load(fs, passphrase);
    } catch (IOException|CertificateException e) {
      throw new ConfigurationProblem("Loading keystore failed", e);
    } catch (NoSuchAlgorithmException e) {
      throw new Bug("Loading keystore failed", e);
    }

    cb.setTrustStore(ks);
    cb.setKeyStore(ks);
    Arrays.fill(passphrase, (char)0);
  }
}
