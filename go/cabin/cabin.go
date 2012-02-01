package cabin

import (
  "fmt"
  "reflect"
)

type Cabin struct {

}

func New() *Cabin {
  return new(Cabin)
}

func (cabin *Cabin) Log(object interface{}) {
  type_ := reflect.TypeOf(object)
  value := reflect.ValueOf(object)

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

  for i := 0; i < type_.NumField(); i++ {
    field := type_.Field(i)
    if field.Anonymous {
      continue;
    }

    fmt.Printf("%s => %s\n", field.Name, field.Type)
    switch field.Type.Kind() {
      case reflect.Int:
        fmt.Printf("  => %d\n", value.Field(i).Int())
      case reflect.Float32, reflect.Float64:
        fmt.Printf("  => %f\n", value.Field(i).Float())
      case reflect.String:
        fmt.Printf("  => %s\n", value.Field(i).String())
      case reflect.Interface:
        fmt.Printf("  => %s\n", value.Field(i).Interface())
      case reflect.Bool:
        fmt.Printf("  => %s\n", value.Field(i).Bool())
    }
  }
}
