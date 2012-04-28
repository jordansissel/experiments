package main

import (
  "fmt"
  "os"
  "code.google.com/p/x-go-binding/xgb"
  "cabin"
)

func main() {
  logger := cabin.New()
  output := make(chan *cabin.Event)
  logger.Subscribe(output)
  go cabin.StdoutLogger(output)

  conn, err := xgb.Dial(os.Getenv("DISPLAY"))
  if err != nil {
    fmt.Printf("Failed to connect to the X Server (%s)\n", os.Getenv("DISPLAY"))
    os.Exit(1)
  }

  logger.Log("OK")
  logger.Log(conn)
}
