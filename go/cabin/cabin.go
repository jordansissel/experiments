package cabin

import (
  "fmt"
  "reflect"
  "time"
)

type Cabin struct {}

type Event struct {
  timestamp *time.Time
  object *interface{}
}

func New() *Cabin {
  return new(Cabin)
}

func (cabin *Cabin) Log(object interface{}) {
  type_ := reflect.TypeOf(object)
  value := reflect.ValueOf(object)

  event := &Event{time.UTC(), &object}

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

  fmt.Printf("%s: ", event.timestamp)
  for i := 0; i < type_.NumField(); i++ {
    field := type_.Field(i)
    if field.Anonymous {
      continue;
    }

    //fmt.Printf("%s: %s => %s\n", event.timestamp, field.Name, field.Type)
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
