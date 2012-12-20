package main

import (
  "fmt"
  "net"
  "crypto/tls"
)

func (l *Lumberjack) connected() bool {
  return l.conn != nil
}

func (l *Lumberjack) connect_once() (err error) {
  if l.connected() { l.disconnect() }

  if l.tlsconf == nil {
    l.tlsconf, err = configureTLS(l.CAPath)
    if err != nil {
      return
    }
  }

  l.conn, err = net.Dial("tcp", l.Addresses[0])
  if err != nil { return }

  l.tls = tls.Client(l.conn, l.tlsconf)
  err = l.tls.Handshake()
  if err != nil { return }
  return
}

func (l *Lumberjack) connect() {
  for !l.connected() {
    err := l.connect_once()
    if err != nil {
      fmt.Printf("Error connecting: %s\n", err)
    }
  }
}

func (l *Lumberjack) disconnect() {

}

func (l *Lumberjack) publish(event map[string]string) {
  if !l.connected() { l.connect() }
}

func main() {
  l := Lumberjack{Addresses: []string{"localhost:4000"}, CAPath: "/home/jls/projects/logstash/server.crt"}

  l.connect()
  fmt.Printf("Connected!\n");
}
