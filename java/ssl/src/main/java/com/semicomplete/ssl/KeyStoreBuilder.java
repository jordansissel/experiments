package com.semicomplete.ssl;

import org.apache.logging.log4j.Logger;
import org.apache.logging.log4j.LogManager;
import java.util.Arrays;
import java.security.cert.CertificateFactory;
import java.io.FileInputStream;
import com.semicomplete.Bug;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;
import java.io.IOException;
import java.security.KeyStore;
import java.security.cert.CertificateException;
import java.security.cert.X509Certificate;
import java.security.cert.Certificate;
import java.io.FileNotFoundException;
import java.nio.file.Paths;

public class KeyStoreBuilder {
  private static final Logger logger = LogManager.getLogger();

  // Based on some quick research, this appears to be the default java trust store location
  private static final String defaultTrustStorePath = Paths.get(System.getProperty("java.home"), "lib", "security", "cacerts").toString();

  // Yeah, 'changeit' appears to be the default passphrase. I suppose it's ok. Or is it?!!!
  private static final char[] defaultTrustStorePassphrase = "changeit".toCharArray();

  private KeyStore keyStore;
  private boolean modified;

  public KeyStoreBuilder() throws NoSuchAlgorithmException, IOException, CertificateException, KeyStoreException {
    try {
      keyStore = KeyStore.getInstance(KeyStore.getDefaultType());
      try {
        keyStore.load(null, "hurray".toCharArray());
      } catch (NoSuchAlgorithmException|IOException|CertificateException e) {
        throw e;
      }
    } catch (KeyStoreException e) {
      throw e;
    }
  }

  public void useDefaultTrustStore() throws FileNotFoundException, IOException, CertificateException, NoSuchAlgorithmException {
    useKeyStore(defaultTrustStorePath, defaultTrustStorePassphrase);
    modified = true;
  }

  public void addCAPath(String path) throws CertificateException, FileNotFoundException, KeyStoreException {
    CertificateFactory cf = CertificateFactory.getInstance("X.509");

    FileInputStream in;
    try {
      in = new FileInputStream(path);
    } catch (FileNotFoundException e) {
      throw e;
    }

    int count = 0;
    try {
      for (Certificate cert : cf.generateCertificates(in)) {
        String alias = ((X509Certificate)cert).getSubjectX500Principal().toString();
        try {
          keyStore.setCertificateEntry(alias, cert);
        } catch (KeyStoreException e) {
          throw e;
        }
        count++;
      }
    } catch (CertificateException e) {
      throw e;
    }
    modified = true;
  }

  public void useKeyStore(String path) throws FileNotFoundException, IOException, CertificateException, NoSuchAlgorithmException {
    System.out.printf("Enter passphrase for keyStore %s: ", path);
    char[] passphrase = System.console().readPassword();
    useKeyStore(path, passphrase);

    // Blank the passphrase for a little bit of extra safety; hoping it won't
    // live long in memory.
    Arrays.fill(passphrase, (char)0);
  }
  
  public void useKeyStore(String path, char[] passphrase) throws FileNotFoundException, IOException, CertificateException, NoSuchAlgorithmException {
    FileInputStream fs;

    try {
      fs = new FileInputStream(path);
    } catch (FileNotFoundException e) {
      throw e;
    }

    try {
      keyStore.load(fs, passphrase);
    } catch (IOException|CertificateException|NoSuchAlgorithmException e) {
      throw e;
    }

    //logger.info("Loaded keyStore with {} certificates: {}", keyStoreTrustedCertificates(keyStore).size(), path);
    modified = true;
  }

  public KeyStore build() throws FileNotFoundException, IOException, CertificateException, NoSuchAlgorithmException {
    if (!modified) {
      useDefaultTrustStore();
    }
    return keyStore;
  }
}
