package com.semicomplete.ssl;

import com.semicomplete.Blame;
import java.util.Map;
import java.util.stream.Stream;
import com.semicomplete.Bug;
import com.semicomplete.Resolver;
import com.semicomplete.ssl.SSLDiag;
import java.io.Console;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.InputStream;
import java.io.IOException;
import java.net.ConnectException;
import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.net.UnknownHostException;
import java.nio.file.Paths;
import java.security.cert.Certificate;
import java.security.cert.CertificateException;
import java.security.cert.CertificateExpiredException;
import java.security.cert.CertificateFactory;
import java.security.cert.CertificateNotYetValidException;
import java.security.cert.CertificateParsingException;
import java.security.cert.X509Certificate;
import java.security.InvalidKeyException;
import java.security.KeyManagementException;
import java.security.KeyStore;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;
import java.security.NoSuchProviderException;
import java.security.SignatureException;
import java.security.UnrecoverableKeyException;
import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;
import java.util.stream.Collectors;
import javax.net.ssl.SSLPeerUnverifiedException;
import javax.net.ssl.SSLSession;
import org.apache.logging.log4j.core.LoggerContext;
import org.apache.logging.log4j.Level;
import org.apache.logging.log4j.Logger;
import org.apache.logging.log4j.LogManager;

public class Main {
  static class SubjectAlternative {
    public static final int DNS = 2;
    public static final int IPAddress = 7;
  }

  public static class ConfigurationProblem extends Exception {
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

  public Main(String[] args) {
    this.args = args;
  }

  public void run() throws ConfigurationProblem, Bug {
    SSLContextBuilder cb = new SSLContextBuilder();
    Iterator<String> i = Arrays.asList(args).iterator();

    KeyStoreBuilder keys, trust;
    try {
      keys = new KeyStoreBuilder();
      trust = new KeyStoreBuilder();
    } catch (IOException|CertificateException|KeyStoreException|NoSuchAlgorithmException e) {
      throw new Bug("Failed to new KeyStoreBuilder failed", e);
    }

    List<String> remainder = parseFlags(cb, keys, trust, i);

    try {
      cb.setTrustStore(trust.build());
      cb.setKeyStore(keys.build());
    } catch (IOException|CertificateException|NoSuchAlgorithmException e) {
      throw new Bug("Failed building keystores", e);
    }

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
    List<SSLReport> reports = addresses.stream()
      .map(address -> diag.check(new InetSocketAddress(address, port), hostname))
      .collect(Collectors.toList());

    List<SSLReport> successful = reports.stream().filter(r -> r.success()).collect(Collectors.toList());

    if (successful.size() > 0) {
      successful.stream().forEach(r -> System.out.printf("SUCCESS %s\n", r.getAddress()));
    } else {
      System.out.println("All SSL/TLS connections failed.");
    }

    Map<Throwable, List<SSLReport>> failureGroups = reports.stream().filter(r -> !r.success()).collect(Collectors.groupingBy(SSLReport::getException));
    for (Map.Entry<Throwable, List<SSLReport>> entry : failureGroups.entrySet()) {
      List<SSLReport> failures = (List<SSLReport>)entry.getValue();
      Throwable error = entry.getKey();
      System.out.printf("Failure: %s\n", error);
      for (SSLReport r : failures) {
        System.out.printf("  %s\n", r.getAddress()); 
      }

      if (Blame.on(error, sun.security.provider.certpath.SunCertPathBuilderException.class)) {
        System.out.printf("  Analysis: Certificate problem\n");
      } 
    }
  }

  public void report(SSLReport sslReport) {
    System.out.printf("%s %s:%d[%s]\n", sslReport.success() ? "GOOD" : "FAIL", sslReport.getHostname(), sslReport.getAddress().getPort(), sslReport.getAddress().getAddress().getHostAddress());

    if (!sslReport.success()) {
      try {
        reportFailure(sslReport);
      } catch (Bug e) {
        logger.fatal("Encountered a bug somehow during failure reporting.", e);
      }
    }
  }

  public void reportFailure(SSLReport sslReport) throws Bug {
    Throwable e = sslReport.getException();
    if (e instanceof HandshakeProblem) {
      reportFailure(sslReport, (HandshakeProblem)e);
    } else {
      System.out.printf("  Error: [%s] %s\n", e.getClass(), e.getMessage());
      System.out.printf("  No other diagnostic information available.\n");
    }
  }

  public void reportFailure(SSLReport sslReport, HandshakeProblem problem) throws Bug {
    System.out.printf(" * Failure during SSL/TLS handshake\n");
    logger.debug("TLS handshake failure", problem);

    List<Certificate> trusted = KeyStoreUtils.getTrustedCertificates(keystore);
    X509Certificate[] chain = problem.peerCertificateDetails.getChain();

    System.out.printf("  Certificate Diagnostic\n");
    System.out.printf("  Summary: My keystore has %d trusted certificates, but none of them allow this server to be trusted.\n", trusted.size());
    System.out.printf("\n");

    if (chain.length == 1) { // Self-signed
      //System.out.println(chain[0].getSubjectX500Principal());
      //System.out.println(chain[0].getIssuerX500Principal());
      //try {
        //chain[0].verify(chain[0].getPublicKey());
      //} catch (CertificateException|NoSuchAlgorithmException|InvalidKeyException|NoSuchProviderException|SignatureException e) {
        //System.out.printf("  Certificate signature failed?\n");
      //}

      if (chain[0].getSubjectX500Principal().equals(chain[0].getIssuerX500Principal())) {
        System.out.printf("  Server identified itself with a self-signed certificate\n");
      }
    } else {
      System.out.printf("  Server identified itself with a chain of %d certs.\n", chain.length);
    }

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

  public static List<String> parseFlags(SSLContextBuilder cb, KeyStoreBuilder keys, KeyStoreBuilder trust, Iterator<String> i) throws ConfigurationProblem, Bug {
    List<String> parameters = new LinkedList();

flagIteration:
    while (i.hasNext()) {
      String entry = i.next();
      String arg;
      switch (entry) {
        case "--capath":
          arg = i.next();
          try {
            trust.addCAPath(arg);
          } catch (CertificateException|FileNotFoundException|KeyStoreException e) {
            throw new Bug("Failed adding certificate authorities from file " + arg, e);
          }
          break;
        case "--truststore":
          arg = i.next();
          try {
            trust.useKeyStore(arg);
          } catch (CertificateException|IOException|NoSuchAlgorithmException e) {
            throw new Bug("Failed trying to trust keystore " + arg, e);
          }
          break;
        case "--keystore":
          arg = i.next();
          try {
            keys.useKeyStore(arg);
          } catch (CertificateException|IOException|NoSuchAlgorithmException e) {
            throw new Bug("Failed trying to use keystore " + arg, e);
          }
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
}
