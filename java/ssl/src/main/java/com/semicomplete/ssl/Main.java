package com.semicomplete.ssl;

import com.semicomplete.Blame;
import com.semicomplete.Bug;
import com.semicomplete.Resolver;
import org.apache.logging.log4j.Level;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.apache.logging.log4j.core.LoggerContext;

import javax.net.ssl.SSLParameters;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.net.UnknownHostException;
import java.security.*;
import java.security.cert.*;
import java.util.*;
import java.util.stream.Collectors;

public class Main {
  private static class SubjectAlternative {
    static final int DNS = 2;
    static final int IPAddress = 7;
  }

  private static class ConfigurationProblem extends Exception {
    ConfigurationProblem(String message) {
      super(message);
    }

    ConfigurationProblem(String message, Throwable cause) {
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

  private Main(String[] args) {
    this.args = args;
  }

  private void run() throws ConfigurationProblem, Bug {
    SSLContextBuilder cb = new SSLContextBuilder();
    Iterator<String> i = Arrays.asList(args).iterator();

    KeyStoreBuilder keys, trust;
    try {
      keys = new KeyStoreBuilder();
      trust = new KeyStoreBuilder();
    } catch (IOException|CertificateException|KeyStoreException|NoSuchAlgorithmException e) {
      throw new Bug("Failed to new KeyStoreBuilder failed", e);
    }

    List<String> remainder = parseFlags(keys, trust, i);

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

    SSLChecker diag;
    try {
      diag = new SSLChecker(cb);
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

    List<SSLReport> successful = reports.stream().filter(SSLReport::success).collect(Collectors.toList());

    if (successful.size() > 0) {
      successful.forEach(r -> System.out.printf("SUCCESS %s\n", r.getAddress()));
    } else {
      System.out.println("All SSL/TLS connections failed.");
    }

    Map<Class<? extends Throwable>, List<SSLReport>> failureGroups = reports.stream().filter(r -> !r.success()).collect(Collectors.groupingBy(r -> Blame.get(r.getException()).getClass()));
    for (Map.Entry<Class<? extends Throwable>, List<SSLReport>> entry : failureGroups.entrySet()) {
      Class<? extends Throwable> blame = entry.getKey();
      List<SSLReport> failures = entry.getValue();
      System.out.printf("Failure: %s\n", blame);
      for (SSLReport r : failures) {
        System.out.printf("  %s\n", r.getAddress());
      }

      if (blame == sun.security.provider.certpath.SunCertPathBuilderException.class) {
        System.out.printf("  Analysis: Certificate problem: %s\n", failures.get(0).getException());
      } else if (blame == java.security.cert.CertPathValidatorException.class) {
        System.out.printf("  Analysis: Certificate problem2: %s\n", failures.get(0).getException());
      } else if (blame == java.io.EOFException.class) {
        System.out.println("  Analysis: This can occur for a few different reasons. ");
        System.out.println("  * Maybe: The server rejected our SSL/TLS version.");
        System.out.println("  * Maybe: The address targeted is not an SSL/TLS server and closed the connection when we said 'Hello'");
        System.out.println("");
        System.out.println("  I used the following TLS/SSL settings:");
        SSLParameters parameters = failures.get(0).getSSLContext().getDefaultSSLParameters();
        System.out.printf("  My protocols: %s\n", String.join(", ", Arrays.asList(parameters.getProtocols())));

      } else if (blame == javax.net.ssl.SSLHandshakeException.class) {
        System.out.println("  Analysis: SSL handshake was rejected by the server.");
        System.out.printf("  Error message: %s\n", failures.get(0).getException().getMessage());
        System.out.println("  * Maybe: Check the server's logs to see if it can tell you why it's rejected our handshake.");
        System.out.println("  * Maybe: Check if the server can accept any of the ciphers listed below.");
        System.out.println("  ");

        SSLParameters parameters = failures.get(0).getSSLContext().getDefaultSSLParameters();
        System.out.println("  I used the following TLS/SSL settings:");
        System.out.printf("  Protocols: %s\n", String.join(", ", Arrays.asList(parameters.getProtocols())));
        System.out.printf("  Cipher suites: %s\n", String.join(",", Arrays.asList(parameters.getCipherSuites())));

        //failures.get(0).getException().printStackTrace(System.out);
      }
    }
  }

  private static List<String> parseFlags(KeyStoreBuilder keys, KeyStoreBuilder trust, Iterator<String> i) throws ConfigurationProblem, Bug {
    List<String> parameters = new LinkedList<>();

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
