package cabin

import (
  "time"
  "fmt"
)

type Logger struct {
  subscriptions []chan Event
}

type Event struct {
  timestamp time.Time
  message string
}

func New() *Logger {
  return new(Logger)
}

func (logger *Logger) Log(message string) {
  fmt.Println(message)
}
