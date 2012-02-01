package main

import (
  "http"
  "io"
  "websocket"
  "os"
  "fmt"
  "strings"
)

// Echo the data received on the Web Socket.
func EchoServer(ws *websocket.Conn) {

  io.Copy(ws, ws);
}

func getenv(name, default_value string) string {
  /* os.Environ() is an  array of strings in 'key=value' form */
  for _, value := range os.Environ() {
    /* Search for 'name=' */
    if strings.HasPrefix(value, name + "=") {
      return value[len(name) + 1:]
    }
  }
  return default_value
}

func main() {
  c := make(chan int)
  address := ":" + getenv("PORT", "8080")

  fmt.Printf("Address: %s\n", address)

  go func() {
    http.Handle("/echo", websocket.Handler(EchoServer));
    error := http.ListenAndServe(address, nil);
    if error != nil {
      panic("ListenAndServe: " + error.String())
    }
    c <- 0
  }()

  go func() {
    url := "ws://localhost" + address + "/echo"
    ws, error := websocket.Dial(url, "", "http://localhost/")
    if error != nil {
      panic("Dial:" + error.String())
    }

    if _, error := ws.Write([]byte("Hello world")); error != nil {
      panic("Write: " + error.String())
    }

    var msg = make([]byte, 16384)
    n, error := ws.Read(msg)
    if error != nil {
      panic("Read: " + error.String())
    }

    fmt.Printf("%s\n", msg[0:n])
  }()

  /* Rough equivalent to 'thread.join' waiting for the server to terminate, if
  ever */
  <-c
}

