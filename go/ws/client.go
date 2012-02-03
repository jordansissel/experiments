package main

import (
  "fmt"
  "./cabin"
)

func main() {
  logger := cabin.New()
  logger.log("Hello")
}

