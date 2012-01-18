package main

import "fmt"
import "net"

func main() {
  addr, err := net.ResolveUnixAddr("unixgram", "/dev/log")
  fmt.Println(err)
  //conn, err := net.DialUnix("unixgram", nil, addr)
  conn, err := net.ListenUnixgram("unixgram", addr)
  fmt.Println(err)

  data := make([]byte, 4096)
  len, _, err := conn.ReadFrom(data)
  fmt.Printf("Got: %d bytes\n", len)
}
