# Cabin in Go

Go lets you use reflection to inspect the structure of an object. This means we
can log structured with great ease.

* cabin.Log() takes an interface{} (roughly equivalent to "Object" Java, meaning any object)
* cabin then uses the 'reflect' package to inspect the structure and emits the
  name, type, and current value

The output:

    % ./foo         
    Wed Feb  1 08:37:08 UTC 2012: a(int)=123, b(string)=Hello world, c(bool)=%!s(bool=false), 

The code:

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


## HTTP Example

How about an object we didn't define, like http response?

### Output

    Wed Feb  1 21:32:31 UTC 2012: Status(string)=200 OK, StatusCode(int)=200, Proto(string)=HTTP/1.1, ProtoMajor(int)=1, ProtoMinor(int)=1, Body(io.ReadCloser)=&{0xf840035cc0 0xf84008ecc0 %!s(bool=false)}, Close(bool)=%!s(bool=false), 

### Code

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
