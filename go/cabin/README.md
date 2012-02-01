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
