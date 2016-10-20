package com.semicomplete;
import java.net.InetAddress;
import java.net.InetSocketAddress;
import com.semicomplete.ssl.SSLChecker;

import java.security.KeyStore;

public class SSLTest {
  //@Test
  public void hasFun() throws Exception {
    String keystore_path = "./foo.jks";
    char[] passphrase = "foobar".toCharArray();

    KeyStore ks = KeyStore.getInstance(KeyStore.getDefaultType());

    //FileInputStream fs = new FileInputStream(keystore_path);
    //ks.load(fs, passphrase);

    SSLChecker diag = new SSLChecker(ks, ks);

    String hostname = "www.semicomplete.com";

    for (InetAddress address : Resolver.SystemResolver.resolve(hostname)) {
      try {
        diag.check(new InetSocketAddress(address, 443), hostname);
      } catch (Exception e) {
        System.err.printf("Failed: {}\n", e);
      }
    }
  }
}

