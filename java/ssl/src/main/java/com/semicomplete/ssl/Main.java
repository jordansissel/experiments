package com.semicomplete.ssl;

import com.semicomplete.Resolver;
import com.semicomplete.Blame;
import com.semicomplete.ssl.SSLDiag;
import java.net.ConnectException;
import java.io.FileInputStream;
import java.io.InputStream;
import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.security.KeyStore;

public class Main {
  public static void main(String[] args) throws Exception {
    String keystore_path = "./foo.jks";
    char[] passphrase = "foobar".toCharArray();

    KeyStore ks = KeyStore.getInstance(KeyStore.getDefaultType());

    FileInputStream fs = new FileInputStream(keystore_path);
    ks.load(fs, passphrase);

    SSLDiag diag = new SSLDiag(ks, ks);

    String hostname = args[0];
    int port = Integer.parseInt(args[1]);

    for (InetAddress address : Resolver.SystemResolver.resolve(hostname)) {
      try {
        diag.tryssl(new InetSocketAddress(address, port), hostname);
      } catch (Exception e) {
        Throwable cause = Blame.get(e);
        if (cause instanceof ConnectException) {
          System.out.printf("Connection attempt failed to %s:%d (%s)\n", address, port, cause.getMessage());
        } else {
          System.err.printf("Failed: %s\n", cause);
          e.printStackTrace(System.out);
        }
      }
    }
  }
}
