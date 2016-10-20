package com.semicomplete.ssl;

import com.semicomplete.Resolver;

import java.io.InputStream;
import java.io.OutputStream;
import java.net.*;
import java.nio.ByteBuffer;
import java.nio.channels.SelectionKey;
import java.nio.channels.Selector;
import java.nio.channels.SocketChannel;
import java.security.cert.X509Certificate;

import com.semicomplete.Blame;
import java.io.IOException;
import javax.net.ssl.*;
import javax.net.ssl.SSLEngineResult.HandshakeStatus;
import java.security.KeyManagementException;
import java.security.KeyStore;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;
import java.security.UnrecoverableKeyException;

import org.apache.logging.log4j.Logger;
import org.apache.logging.log4j.LogManager;

import static javax.net.ssl.SSLEngineResult.HandshakeStatus.*;

public class SSLChecker {
  /* Diagnose SSL problems
   * 1) TCP connect
   * 2) TLS/SSL protocol negotiation
   * 3) (low priority) TLS/SSL cipher negotiation
   * 4) Certificate trust problems
   * 5) Hostname verification (RFC6125?)
   */

  private static final long defaultTimeout = 1000;

  private KeyStore trustStore;
  private KeyStore keyStore;
  private final Resolver resolver = Resolver.SystemResolver;
  private final Logger logger = LogManager.getLogger();

  private SSLContext ctx;

  private PeerCertificateDetails peerCertificateDetails;

  public SSLChecker(SSLContextBuilder cb) throws KeyManagementException, KeyStoreException, NoSuchAlgorithmException, UnrecoverableKeyException {
    cb.setTracker(this::setPeerCertificateDetails);
    ctx = cb.build();
  }

  public SSLChecker(KeyStore keyStore, KeyStore trustStore) throws KeyManagementException, KeyStoreException, NoSuchAlgorithmException, UnrecoverableKeyException {
    this.trustStore = trustStore;
    this.keyStore = keyStore;

    SSLContextBuilder ctxbuilder = new SSLContextBuilder();
    ctxbuilder.setTrustStore(trustStore);
    ctxbuilder.setKeyStore(keyStore);
    ctxbuilder.setTracker(this::setPeerCertificateDetails);

    ctx = ctxbuilder.build();
  }

  private void setPeerCertificateDetails(X509Certificate[] chain, String authType, Throwable exception) {
    peerCertificateDetails = new PeerCertificateDetails(chain, authType, exception);
  }

  public void check(String hostname, int port) throws IOException {
    for (InetAddress address : this.resolver.resolve(hostname)) {
      check(new InetSocketAddress(address, port), hostname);
    }
  }

  public SSLReport check(InetSocketAddress address, String name) {
    return check(address, name, defaultTimeout);
  }

  public SSLReport check(InetSocketAddress address, String name, long timeout) {
    SSLReport sslReport = new SSLReport();
    sslReport.setSSLContext(ctx);
    sslReport.setHostname(name);
    sslReport.setAddress(address);

    logger.debug("Trying {} (expected hostname {})", address, name);
    SocketChannel socket;
    try {
      socket = SocketChannel.open();
      socket.configureBlocking(false);
    } catch (IOException e) {
      sslReport.setFailed(e);
      return sslReport;
    }


    checkConnect(sslReport, socket, timeout);
    if (sslReport.getException() != null) {
      return sslReport;
    }

    checkHandshake(sslReport, socket);
    return sslReport;
  }

  private void checkConnect(SSLReport sslReport, SocketChannel socket, long timeout) {
    final InetSocketAddress address = sslReport.getAddress();
    try {
      logger.trace("Connecting to {}", address);
      Selector selector = Selector.open();
      SelectionKey sk = socket.register(selector, SelectionKey.OP_CONNECT);
      socket.connect(address);
      System.out.println("Select:" + selector.select(timeout));
      System.out.println("connectable:" + sk.isConnectable());
      if (!sk.isConnectable()) {
        sslReport.setFailed(new SocketTimeoutException());
        return;
      }
      if (socket.isConnectionPending()) {
        socket.finishConnect();
      }
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

  private void checkHandshake(SSLReport sslReport, SocketChannel socket) {
    final InetSocketAddress address = sslReport.getAddress();
    final String name = sslReport.getHostname();
    SSLEngine sslEngine = ctx.createSSLEngine(name, address.getPort());
    sslEngine.setUseClientMode(true);

    try {
      sslEngine.beginHandshake();
    } catch (SSLException e) {
      sslReport.setFailed(e);
      Throwable cause = Blame.get(e);
      logger.warn("beginHandshake failed: [{}] {}", cause.getClass(), cause.getMessage());
    }

    // TODO: Is this enough bytes?
    ByteBuffer plainText = ByteBuffer.allocate(100);
    plainText.put("SSL TEST. HELLO.".getBytes());
    plainText.flip();

    ByteBuffer in = ByteBuffer.allocate(sslEngine.getSession().getApplicationBufferSize() * 200);
    ByteBuffer out = ByteBuffer.allocate(sslEngine.getSession().getApplicationBufferSize() * 200);

    SSLEngineResult result = null;
    try {
      SSLEngineResult.HandshakeStatus state;
      state = sslEngine.getHandshakeStatus();
      while (state != FINISHED) {
        System.out.println("state: " + state + " || " + sslEngine.getHandshakeStatus());
        try {
          Thread.sleep(250);
        } catch (InterruptedException e) {}
        switch (state) {
          case NEED_TASK:
            sslEngine.getDelegatedTask().run();
            state = sslEngine.getHandshakeStatus();
            break;
          case NEED_WRAP:
            out.clear();
            result = sslEngine.wrap(plainText, out);
            state = result.getHandshakeStatus();
            System.out.println("wrap result: " + result);
            out.flip();
            while (out.hasRemaining()) {
              int bytes = socket.write(out);
              System.out.println("Wrote bytes: " + bytes);
            }
            out.clear();
            System.out.println("Out buffer: " + out);
            break;
          case NEED_UNWRAP:
            int bytes = socket.read(in);
            System.out.println("Read bytes " + bytes);
            System.out.println("Buffer state: " + in);
            if (bytes > 0) {
              in.flip();
            }
            result = sslEngine.unwrap(in, out);
            System.out.println("unwrap result: " + result);
            state = result.getHandshakeStatus();
            break;
        }
      }
    } catch (IOException e) {
      System.out.println("Exception result was: " + result);
      sslReport.setFailed(e);
      Throwable cause = Blame.get(e);
      logger.error("beginHandshake failed", cause);

    }
    //sslReport.setSSLSession(ssl_socket.getHandshakeSession());
    //sslReport.setPeerCertificateDetails(peerCertificateDetails);
    //Throwable cause = Blame.get(e);
  }
}
