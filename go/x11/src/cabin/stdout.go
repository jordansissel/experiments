package cabin

import (
  "os"
)

func StdoutLogger(channel chan *Event) {
  for {
    event := <- channel
    emit(os.Stdout, event)
  }
}

