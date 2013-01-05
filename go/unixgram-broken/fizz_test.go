// Copyright 2012 Jordan Sissel.  All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

// Usage: rm /tmp/example.sock; go test unixgram_test.go

package main

import (
  "net" // remove if run from the 'net' pkg
  "runtime"
  "testing"
)

func TestListenUnixgramReadFrom(t *testing.T) {
  switch runtime.GOOS {
  case "linux": // run this on linux.
  default:
    t.Logf("skipping test on %q", runtime.GOOS)
    return
  }

  // TODO: use mktmp to create this file.
  path := "/tmp/example.sock"
  addr, err := net.ResolveUnixAddr("unixgram", path)
  if err != nil {
    t.Fatalf("ResolveUnixAddr failed on %v: %v", path, err)
    return
  }

  //var reader *net.UnixConn
  reader, err := net.ListenUnix("unixgram", addr)
  if err != nil {
    t.Fatalf("ListenUnix failed on %v: %v", path, err)
    return
  }
  defer reader.Close()

  // Make something that writes to it.
  writer, err := net.DialUnix("unixgram", nil, addr)
  if err != nil {
    t.Fatalf("DialUnix failed: %v", err)
    return
  }
  defer writer.Close()

  expected := "Hello world"
  writer.Write([]byte(expected))

  actual := make([]byte, 100)

  conn, err := reader.AcceptUnix()
  if err != nil {
    t.Fatalf("UnixConn.ReadFromfailed: %v", err)
  }
  length, _, err := conn.ReadFrom(actual)
  if err != nil {
    t.Fatalf("UnixConn.ReadFromfailed: %v", err)
  }
  if string(actual[0 : length]) != expected {
    t.Fatalf("Expected %v, got %v", expected, actual)
  }
}
