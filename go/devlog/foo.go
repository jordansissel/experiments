package main

import (
  "fmt"
  "os"
  "net"
)

func main() {
  addr, err := net.ResolveUnixAddr("unixgram", "/dev/log")
  fmt.Println(err)
  conn, err := net.ListenUnixgram("unixgram", addr)
  fmt.Println(err)

  // Ensure world writable access
  os.Chmod("/dev/log", 0666)

  data := make([]byte, 4096)
  len, _, err := conn.ReadFrom(data)
  fmt.Printf("Got: %d bytes\n", len)
}
