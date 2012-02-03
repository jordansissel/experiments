package main

import (
  "./cabin"
  "http"
  "bytes"
  "reflect"
  "json"
  "fmt"
)

func main() {
  logger := cabin.New()
  client := new(http.Client)
  response, error := client.Get("http://www.google.com/")
  if error != nil {
    logger.Log(error)
    return
  }

  channel := make(chan *cabin.Event)
  logger.Subscribe(channel)
  go JSONLogger(channel)

  //logger.Log(response)
  //logger.Log("Hello world")
  logger.Log(response.Header)
  //logger.Log(&cabin.Event{Message: "Hello world", Object: response})
}

func StdoutLogger(channel chan *cabin.Event) {
  for {
    event := <- channel
    emit(event)
  }
}

func emit(event *cabin.Event) {
  /* TODO(sissel): Improve map support */
  type_ := reflect.TypeOf(event.Object)
  value := reflect.ValueOf(event.Object)

  /* Dereference reflected pointer values */
  if type_.Kind() == reflect.Ptr {
    type_ = type_.Elem()
  }
  if value.Kind() == reflect.Ptr {
    value = value.Elem()
  }

  switch type_.Kind() {
    case reflect.Map:
      log_map(event, type_, value)
    case reflect.String:
      log_string(event, type_, value)
    case reflect.Struct:
      /* Do special handling for the cabin.Event struct */
      fmt.Println(type_.Name())
      if type_.Name() == "Event" {
        e := event.Object.(*cabin.Event)
        e.Timestamp = event.Timestamp
        log_event(e)
      } else {
        log_struct(event, type_, value)
      }
    default:
      fmt.Printf("Unsupported type: %s\n", type_.Kind())
  }
}

func log_string(event *cabin.Event, type_ reflect.Type, value reflect.Value) {
  event.Message = value.String()

  fmt.Printf("%s: %s\n", event.Timestamp, value.String())
}

func log_map(event *cabin.Event, type_ reflect.Type, value reflect.Value) {
  fmt.Printf("%s: ", event.Timestamp)
  for _, key := range value.MapKeys() {
    fmt.Printf("%s=%s", key, value.MapIndex(key))
  }
  fmt.Printf("\n")
}

func log_struct(event *cabin.Event, type_ reflect.Type, value reflect.Value) {
  fmt.Printf("%s: ", event.Timestamp)
  /* For every field in this object, emit the name, type_, and current value */
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

func log_event(event *cabin.Event) {
  fmt.Printf("%s: ", event.Timestamp)
  if len(event.Message) > 0 {
    fmt.Printf("%s", event.Message)
  }

  if event.Object != nil {
    
  }
  fmt.Printf("\n")
}

func JSONLogger(channel chan *cabin.Event) {
  for {
    event := <- channel
    data, _ := json.MarshalIndent(event, "", "  ")
    fmt.Println(bytes.NewBuffer(data).String())
  }
}
