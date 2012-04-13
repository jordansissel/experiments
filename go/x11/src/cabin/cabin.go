package cabin

import (
  "time"
)

/* Make a new struct, but for now it has no members.
 * Later I will add channels and such for subscription stuff
 */
type Cabin struct {
  /* Channels receive Event structs */
  channels []chan *Event
}

/* A cabin event. Simply a timestamp + an object */
type Event struct {
  Timestamp time.Time
  Message string
  Object interface{}
}

/* Create a new Cabin instance */
func New() *Cabin {
  cabin := new(Cabin)
  cabin.channels = make([] chan *Event, 0)
  return cabin
}

func (cabin *Cabin) Subscribe(channel chan *Event) {
  cabin.channels = append(cabin.channels, channel)
}

/* Log an object */
func (cabin *Cabin) Log(object interface{}) {
  event := &Event{Timestamp: time.Now().UTC(), Object: object}

  for _, channel := range cabin.channels {
    channel <- event
  }
}
