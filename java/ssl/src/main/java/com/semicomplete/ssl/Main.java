package com.semicomplete.ssl;
import javax.net.ssl.SSLPeerUnverifiedException;
import java.util.Collections;
import java.security.UnrecoverableKeyException;
import java.nio.file.Paths;
import java.security.KeyManagementException;
import java.security.cert.CertificateFactory;
import java.security.cert.CertificateNotYetValidException;
import java.security.cert.CertificateExpiredException;
import java.security.cert.CertificateParsingException;
import javax.net.ssl.SSLSession;
import java.security.NoSuchAlgorithmException;
import java.security.cert.X509Certificate;
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
import org.apache.logging.log4j.core.LoggerContext;
import org.apache.logging.log4j.Level;
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
  static class SubjectAlternative {
    public static final int DNS = 2;
    public static final int IPAddress = 7;
  }

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
  private KeyStore keystore;

  private static final String defaultKeyStorePath = Paths.get(System.getProperty("java.home"), "lib", "security", "cacerts").toString();

  // Yeah, 'changeit' appears to be the default passphrase. I suppose it's ok. Or is it?!!!
  private static final char[] defaultKeyStorePassphrase = "changeit".toCharArray();

  public Main(String[] args) {
    this.args = args;
  }

  public void run() throws ConfigurationProblem, Bug {
    SSLContextBuilder cb = new SSLContextBuilder();
    Iterator<String> i = Arrays.asList(args).iterator();
    List<String> remainder = parseFlags(cb, i);

    if (keystore == null) {
      loadDefaultKeyStore(cb);
    }

    logger.info("Trusting {} certificates", keystoreTrustedCertificates(keystore).size());
    cb.setTrustStore(keystore);
    //cb.setKeyStore(keystore);


    if (remainder.size() == 0) {
      throw new ConfigurationProblem("Usage: ssl [flags] <address> [port]");
    }

    String hostname = remainder.get(0);
    final int port;

    if (remainder.size() == 2) {
      port = Integer.parseInt(remainder.get(1));
    } else {
      port = 443;
    }

    SSLDiag diag;
    try {
      diag = new SSLDiag(cb);
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
    addresses.stream()
      .map(address -> diag.tryssl(new InetSocketAddress(address, port), hostname))
      .forEach(this::report);
  }

  public void report(SSLReportBuilder srb) {
    System.out.printf("%s %s:%d[%s]\n", srb.success() ? "GOOD" : "FAIL", srb.getHostname(), srb.getAddress().getPort(), srb.getAddress().getAddress().getHostAddress());

    if (!srb.success()) {
      reportFailure(srb);
    }
  }

  public void reportFailure(SSLReportBuilder srb) {
    Throwable e = srb.getException();
    if (e instanceof HandshakeProblem) {
      reportFailure(srb, (HandshakeProblem)e);
    } else {
      System.out.printf("  Error: [%s] %s\n", e.getClass(), e.getMessage());
      System.out.printf("  No other diagnostic information available.\n");
    }
  }

  public void reportFailure(SSLReportBuilder srb, HandshakeProblem problem) {
    System.out.printf(" * Failure during SSL/TLS handshake\n");
    logger.debug("TLS handshake failure", problem);

    List<Certificate> trusted = keystoreTrustedCertificates(keystore);
    X509Certificate[] chain = problem.peerCertificateResult.getChain();

    System.out.printf("  Certificate Diagnostic\n");
    System.out.printf("  Summary: My keystore has %d trusted certificates, but none of them allow this server to be trusted.\n", trusted.size());
    System.out.printf("\n");
    System.out.printf("  Server presented me with a chain of %d certs.\n", chain.length);

    for (X509Certificate cert : chain) {
      System.out.printf("  subject: %s\n", cert.getSubjectX500Principal());

      // Show subject alternatives
      try {
        Collection<List<?>> subjectAlts = cert.getSubjectAlternativeNames();
        if (subjectAlts != null) {
          String[] dnsNames = subjectAlts.stream().filter(san -> (Integer)san.get(0) == SubjectAlternative.DNS).map(san -> san.get(1)).sorted().toArray(size -> new String[size]);

          for (String name : dnsNames) {
            logger.info("dNSName: {}", name);
          }

          String[] ipAddresses = subjectAlts.stream().filter(san -> (Integer)san.get(0) == SubjectAlternative.IPAddress).map(san -> san.get(1)).sorted().toArray(size -> new String[size]);
          for (String name : ipAddresses) {
            logger.info("iPAddress: {}", name);
          }
        }
      } catch (CertificateParsingException e) {

      }

      try {
        cert.checkValidity();
      } catch (CertificateExpiredException e) {
        System.out.printf("    -> Certificate is expired (expired at %s)\n", cert.getNotAfter());
      } catch (CertificateNotYetValidException e) {
        System.out.printf("    -> Certificate is not yet valid (valid only after %s)\n", cert.getNotBefore());
      }
    }
  }

  public List<String> parseFlags(SSLContextBuilder cb, Iterator<String> i) throws ConfigurationProblem, Bug {
    List<String> parameters = new LinkedList();

flagIteration:
    while (i.hasNext()) {
      String entry = i.next();
      String arg;
      switch (entry) {
        case "--capath":
          arg = i.next();
          parseCAPath(cb, arg);
          break;
        case "--keystore":
          arg = i.next();
          parseKeyStore(cb, arg);
          break;
        case "--log-level":
          arg = i.next();
          LoggerContext ctx = (LoggerContext) LogManager.getContext(false);
          ctx.getConfiguration().getLoggerConfig("com.semicomplete").setLevel(Level.valueOf(arg));
          ctx.updateLoggers();
          break;
        case "--":
          break flagIteration;
        default:
          if (entry.startsWith("-")) {
            throw new ConfigurationProblem("Invalid flag: " + entry);
          }
          parameters.add(entry); // not a flag, the first non-flag parameter
          break flagIteration;
      }
    }

    while (i.hasNext()) {
      parameters.add(i.next());
    }

    return parameters;
  }

  public void loadDefaultKeyStore(SSLContextBuilder cb) throws ConfigurationProblem, Bug {
    System.out.println("Loading default keystore: " + defaultKeyStorePath);
    loadKeyStore(cb, defaultKeyStorePath, defaultKeyStorePassphrase);
  }

  public void parseCAPath(SSLContextBuilder cb, String path) throws ConfigurationProblem, Bug {
    logger.debug("Loading CA certs: {}", path);
    CertificateFactory cf;

    if (keystore == null) {
      initKeystore();
    }
    
    try {
      cf = CertificateFactory.getInstance("X.509");
    } catch (CertificateException e) {
      throw new Bug("CertificateFactory.getInstance failed", e);
    }

    FileInputStream in;
    try {
      in = new FileInputStream(path);
    } catch (FileNotFoundException e) {
      throw new ConfigurationProblem("Cannot load CA certs from " + path, e);
    }

    int count = 0;
    try {
      for (Certificate cert : cf.generateCertificates(in)) {
        String alias = ((X509Certificate)cert).getSubjectX500Principal().toString();
        try {
          keystore.setCertificateEntry(alias, cert);
        } catch (KeyStoreException e) {
          logger.fatal("Failed adding certificate to truststore: " + alias, e);
        }
        count++;
      }
    } catch (CertificateException e) {
      throw new ConfigurationProblem("Failure while reading certs from " + path + ": " + e.getMessage(), e);
    }
    logger.info("Loaded capath with {} certificates: {}", count, path);
  }

  public void parseKeyStore(SSLContextBuilder cb, String path) throws ConfigurationProblem, Bug {
    System.out.printf("Enter passphrase for keystore %s: ", path);
    char[] passphrase = System.console().readPassword();
    loadKeyStore(cb, path, passphrase);

    // Blank the passphrase for a little bit of extra safety; hoping it won't
    // live long in memory.
    Arrays.fill(passphrase, (char)0);
  }
  
  private void initKeystore() throws Bug{
    try {
      keystore = KeyStore.getInstance(KeyStore.getDefaultType());
      try {
        keystore.load(null, "hurray".toCharArray());
      } catch (NoSuchAlgorithmException|IOException|CertificateException e) {
        throw new Bug("Something went wrong initializing the keystore", e);
      }
    } catch (KeyStoreException e) {
      throw new Bug("Something went wrong getting a KeyStore instance", e);
    }
  }

  public void loadKeyStore(SSLContextBuilder cb, String path, char[] passphrase) throws Bug, ConfigurationProblem {
    if (keystore == null) {
      initKeystore();
    }

    FileInputStream fs;
    try {
      fs = new FileInputStream(path);
    } catch (FileNotFoundException e) {
      throw new ConfigurationProblem("Keystore file not found", e);
    }


    try {
      keystore.load(fs, passphrase);
    } catch (IOException|CertificateException e) {
      throw new ConfigurationProblem("Loading keystore failed", e);
    } catch (NoSuchAlgorithmException e) {
      throw new Bug("Loading keystore failed", e);
    }

    logger.info("Loaded keystore with {} certificates: {}", keystoreTrustedCertificates(keystore).size(), path);
  }

  private static List<Certificate> keystoreTrustedCertificates(KeyStore keystore) {
    List<Certificate> trusted = new LinkedList<Certificate>();
    try {
      for (String alias : Collections.list(keystore.aliases())) {
        trusted.add(keystore.getCertificate(alias));
      }
    } catch (KeyStoreException e) {
      logger.fatal("Failure to use keystore");
    }
    return trusted;
  }
}
