package main

import (
  "./cabin"
)

type Foo struct {
  a int
  b string
  c bool
}

func main() {
  logger := cabin.New()
  foo := new(Foo)

  foo.a = 123
  foo.b = "Hello world"
  foo.c = false

  logger.Log(foo)
}
