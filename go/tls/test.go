package main

import (
  "fmt"
  "crypto/tls"
  "crypto/x509"
  "encoding/pem"
  "io/ioutil"
  "os"
  "io"
)

func main() {

  // Pass in the cacert.pem (or server.crt, or whatver pem-formatted list of
  // certs you trust
  pemblock, err := ioutil.ReadFile(os.Args[1])
  fmt.Printf("readfile: %v\n", err)

  capool := x509.NewCertPool()

  for {
    derblock, x := pem.Decode(pemblock)
    pemblock = x
    if derblock == nil {
      break
    }

    cert, err := x509.ParseCertificate(derblock.Bytes)
    fmt.Printf("ParseCertificate: %v\n", err)
    if err == nil {
      capool.AddCert(cert)
    }
  }

  tlsconf := &tls.Config{RootCAs: capool}
  
  conn, err := tls.Dial("tcp", "google.com:443", tlsconf)
  fmt.Printf("dial: %v\n", err)
  fmt.Printf("dial conn: %v\n", conn)
  if err != nil {
    return
  }

  io.WriteString(conn, "GET / HTTP/1.1\r\nHost: google.com\r\n\r\n")
  io.Copy(os.Stdout, conn)
}
