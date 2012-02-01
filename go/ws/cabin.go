package cabin

import (
  "time"
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
