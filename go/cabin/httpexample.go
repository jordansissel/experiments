package main

import (
  "cabin"
  "http"
  "bytes"
  "reflect"
  "json"
  "fmt"
)

func main() {
  logger := cabin.New()
  client := new(http.Client)
  response, error := client.Get("http://www.google.com/")
  if error != nil {
    logger.Log(error)
    return
  }

  channel := make(chan *cabin.Event)
  logger.Subscribe(channel)
  go JSONLogger(channel)

  //logger.Log(response)
  //logger.Log("Hello world")
  logger.Log(response.Header)
  //logger.Log(&cabin.Event{Message: "Hello world", Object: response})
}


func JSONLogger(channel chan *cabin.Event) {
  for {
    event := <- channel
    data, _ := json.MarshalIndent(event, "", "  ")
    fmt.Println(bytes.NewBuffer(data).String())
  }
}
