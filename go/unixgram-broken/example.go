package main

import (
  "fmt"
  "os"
  "net"
)

func main() {
  path := "/tmp/example.sock"
  addr, err := net.ResolveUnixAddr("unixgram", path)
  if err != nil { fmt.Printf("ResolveUnixAddr err: %s\n", err); return }
  conn, err := net.ListenUnixgram("unixgram", addr)
  if err != nil { fmt.Printf("ListenUnixgram err: %s\n", err); return }

  // Ensure world writable access
  os.Chmod(path, 0666)

  data := make([]byte, 4096)

  length, _, err := conn.ReadFrom(data)
  if err != nil {
    fmt.Printf("conn.ReadFrom error: %s\n", err)
    return
  }

  fmt.Printf("Got: %d bytes\n", length)
}
