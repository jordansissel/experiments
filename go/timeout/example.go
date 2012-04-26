package main

/* This is a generalized 'timeout' example.
 * The original idea for this is here:
 *   http://blog.golang.org/2010/09/go-concurrency-patterns-timing-out-and.html
 * The goal is to make a generalized 'timeout' function that returns a channel
 *   that can be selected on for timeout purposes.
 */


import (
  "fmt"
  "time"
  "strconv"
  "os"
)

func timeout(duration time.Duration) chan bool {
  timeout_channel := make(chan bool, 1)
  go func() {
    time.Sleep(duration)
    timeout_channel <- true
  }()
  return timeout_channel
}

func slow_function(c chan int) {
  time.Sleep(2 * time.Second)
  c <- 1
}

func main() {
  timeout_secs, _ := strconv.Atoi(os.Args[1])
  fmt.Printf("Will timeout in: %s\n", timeout_secs)
  foo := make(chan int, 1)
  go slow_function(foo)
  select {
    case <- foo: 
      fmt.Println("slow_function returned")
    /* Rather than predeclaring a timeout channel, etc, the
     * timeout function here will do exactly that, returning
     * a channel that can be selected on. */
    case <- timeout(time.Duration(timeout_secs) * time.Second):
      fmt.Println("Timeout!")
  }
}

