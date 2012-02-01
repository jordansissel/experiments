package main

import (
  "./cabin"
  "http"
)

func main() {
  logger := cabin.New()
  client := new(http.Client)
  response, error := client.Get("http://www.google.com/")
  if error != nil {
    logger.Log(error)
    return
  }

  logger.Log(response)
}
