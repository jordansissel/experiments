package cabin

import (
  "fmt"
  "reflect"
  "time"
)

/* Make a new struct, but for now it has no members.
 * Later I will add channels and such for subscription stuff
 */
type Cabin struct {}

/* A cabin event. Simply a timestamp + an object */
type Event struct {
  timestamp *time.Time
  object *interface{}
}

/* Create a new Cabin instance */
func New() *Cabin {
  return new(Cabin)
}

/* Log an object */
func (cabin *Cabin) Log(object interface{}) {
  type_ := reflect.TypeOf(object)
  value := reflect.ValueOf(object)

  event := &Event{time.UTC(), &object}

  /* Dereference reflected pointer values */
  if type_.Kind() == reflect.Ptr {
    type_ = type_.Elem()
  }
  if value.Kind() == reflect.Ptr {
    value = value.Elem()
  }

  if type_.Kind() != reflect.Struct {
    // this isn't a Struct
    // TODO(sissel): Support this.
    return
  }

  /* Print the timestamp */
  fmt.Printf("%s: ", event.timestamp)

  /* For every field in this object, emit the name, type, and current value */
  for i := 0; i < type_.NumField(); i++ {
    field := type_.Field(i)
    if field.Anonymous {
      continue;
    }

    switch field.Type.Kind() {
      case reflect.Int:
        fmt.Printf("%s(%s)=%d, ", field.Name, field.Type, value.Field(i).Int())
      case reflect.Float32, reflect.Float64:
        fmt.Printf("%s(%s)=%f, ", field.Name, field.Type, value.Field(i).Float())
      case reflect.String:
        fmt.Printf("%s(%s)=%s, ", field.Name, field.Type, value.Field(i).String())
      case reflect.Interface:
        fmt.Printf("%s(%s)=%s, ", field.Name, field.Type, value.Field(i).Interface())
      case reflect.Bool:
        fmt.Printf("%s(%s)=%s, ", field.Name, field.Type, value.Field(i).Bool())
    }
  }
  fmt.Printf("\n")
}
