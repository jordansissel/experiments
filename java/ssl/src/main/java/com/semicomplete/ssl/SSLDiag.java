package com.semicomplete.ssl;

import com.semicomplete.Resolver;
import java.security.cert.X509Certificate;
import java.security.cert.CertificateException;
import com.semicomplete.Blame;
import java.io.IOException;
import java.net.ConnectException;
import java.net.InetAddress;
import javax.net.ssl.SSLHandshakeException;
import java.net.InetSocketAddress;
import java.net.Socket;
import java.net.UnknownHostException;
import java.security.KeyManagementException;
import java.security.KeyStore;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;
import java.security.UnrecoverableKeyException;
import java.util.Arrays;
import java.util.List;
import javax.net.ssl.SSLContext;
import javax.net.ssl.SSLSession;
import javax.net.ssl.SSLSocket;
import javax.net.ssl.SSLSocketFactory;
import org.apache.logging.log4j.Logger;
import org.apache.logging.log4j.LogManager;

public class SSLDiag {
  /* Diagnose SSL problems
   * 1) TCP connect
   * 2) TLS/SSL protocol negotiation
   * 3) (low priority) TLS/SSL cipher negotiation
   * 4) Certificate trust problems
   * 5) Hostname verification (RFC6125?)
   */

  private KeyStore trustStore;
  private KeyStore keyStore;
  private Resolver resolver = Resolver.SystemResolver;
  private Logger logger = LogManager.getLogger();

  private SSLContext ctx;

  private PeerCertificateDetails peerCertificateDetails;

  public SSLDiag(SSLContextBuilder cb) throws KeyManagementException, KeyStoreException, NoSuchAlgorithmException, UnrecoverableKeyException {
    cb.setTracker(this::setPeerCertificateDetails);
    ctx = cb.build();
  }

  public SSLDiag(KeyStore keyStore, KeyStore trustStore) throws UnknownHostException, KeyManagementException, KeyStoreException, NoSuchAlgorithmException, UnrecoverableKeyException, IOException {
    this.trustStore = trustStore;
    this.keyStore = keyStore;

    SSLContextBuilder ctxbuilder = new SSLContextBuilder();
    ctxbuilder.setTrustStore(trustStore);
    ctxbuilder.setKeyStore(keyStore);
    ctxbuilder.setTracker(this::setPeerCertificateDetails);

    ctx = ctxbuilder.build();
  }

  public void setPeerCertificateDetails(X509Certificate[] chain, String authType, Throwable exception) {
    peerCertificateDetails = new PeerCertificateDetails(chain, authType, exception);
  }

  public void check(String hostname, int port) throws UnknownHostException, KeyManagementException, KeyStoreException, NoSuchAlgorithmException, UnrecoverableKeyException, IOException {
    for (InetAddress address : this.resolver.resolve(hostname)) {
      check(new InetSocketAddress(address, port), hostname);
    }
  }

  public SSLReport check(InetSocketAddress address, String name) {
    return check(address, name, 1000); // 1-second connect timeout
  } 
  
  public SSLReport check(InetSocketAddress address, String name, int timeout) {
    SSLReport sslReport = new SSLReport();
    sslReport.setSSLContext(ctx);
    sslReport.setHostname(name);
    sslReport.setAddress(address);

    logger.debug("Trying {} (expected hostname {})", address, name);
    Socket socket = new Socket();
    checkConnect(sslReport, socket, timeout);
    if (sslReport.getException() != null) {
      return sslReport;
    }

    checkHandshake(sslReport, socket);
    return sslReport;
  }

  private void checkConnect(SSLReport sslReport, Socket socket, int timeout) {
    final InetSocketAddress address = sslReport.getAddress();
    try {
      logger.trace("Connecting to {}", address);
      socket.connect(address, timeout);
    } catch (ConnectException e) {
      logger.debug("Connection failed to {}: {}", address, e);
      sslReport.setFailed(e);
      return;
    } catch (IOException e) {
      logger.error("Failed connecting to {}: {}", address, e);
      sslReport.setFailed(e);
      return;
    }

    logger.debug("Connection successful to {}", address);
  }

  private void checkHandshake(SSLReport sslReport, Socket socket) {
    final InetSocketAddress address = sslReport.getAddress();
    final String name = sslReport.getHostname();
    SSLSocketFactory socket_factory = ctx.getSocketFactory();
    
    SSLSocket ssl_socket;

    try {
      ssl_socket = (SSLSocket)socket_factory.createSocket(socket, name, address.getPort(), true);
    } catch (IOException e) {
      sslReport.setFailed(e);
      return;
    }
    try {
      ssl_socket.startHandshake();
      logger.info("SSL Handshake successful to {}", address);
    } catch (SSLHandshakeException e) {
      sslReport.setFailed(e);
      sslReport.setSSLSession(ssl_socket.getHandshakeSession());
      sslReport.setPeerCertificateDetails(peerCertificateDetails);
      Throwable cause = Blame.get(e);
      logger.warn("SSL Handshake failed: [{}] {}", cause.getClass(), cause.getMessage());
    } catch (IOException e) {
      logger.warn("Failed in SSL handshake to {}: {}", address, e);
      sslReport.setFailed(e);
    }

    return;
  }
}
