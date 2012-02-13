package main

import (
  "./cabin"
)

func main() {
  logger := cabin.New()
  logger.Log("Hello")
}

