package cabin

import (
  "fmt"
  "reflect"
  "io"
  "time"
  "bytes"
  "strings"
)

func formatTimestamp(timestamp time.Time) string {
  return timestamp.Format(time.RFC3339Nano)
}

func emit(writer io.Writer, event *Event) {
  /* TODO(sissel): Improve map support */
  type_ := reflect.TypeOf(event.Object)
  value := reflect.ValueOf(event.Object)
  buffer := &bytes.Buffer{}

  /* Dereference reflected pointer values */
  if type_.Kind() == reflect.Ptr {
    type_ = type_.Elem()
  }
  if value.Kind() == reflect.Ptr {
    value = value.Elem()
  }

  switch type_.Kind() {
    case reflect.Map:
      log_map(buffer, event, type_, value)
    case reflect.Int:
      log_int(buffer, event, type_, value)
    case reflect.String:
      log_string(buffer, event, type_, value)
    case reflect.Struct:
      /* Do special handling for the Event struct */
      if type_.Name() == "Event" {
        e := event.Object.(*Event)
        e.Timestamp = event.Timestamp
        log_event(buffer, e)
      } else {
        log_struct(buffer, event, type_, value)
      }
    default:
      fmt.Fprintf(buffer, "Unsupported type: %s\n", type_.Kind())
  }

  buffer.WriteTo(writer)
} /* emit */

func log_string(writer io.Writer, event *Event, type_ reflect.Type, value reflect.Value) {
  event.Message = value.String()

  fmt.Fprintf(writer, "%s: %s\n", formatTimestamp(event.Timestamp), value.String())
} /* log_string */

func log_int(writer io.Writer, event *Event, type_ reflect.Type, value reflect.Value) {
  fmt.Fprintf(writer, "%s: %d\n", formatTimestamp(event.Timestamp), value.Int())
} /* log_string */

func log_map(writer io.Writer, event *Event, type_ reflect.Type, value reflect.Value) {
  fmt.Fprintf(writer, "%s: ", formatTimestamp(event.Timestamp))
  for _, key := range value.MapKeys() {
    fmt.Fprintf(writer, "%s=%s", key, value.MapIndex(key))
  }
  fmt.Fprintf(writer, "\n")
} /* log_map */

func log_struct(writer io.Writer, event *Event, type_ reflect.Type, value reflect.Value) {
  fmt.Fprintf(writer, "%s: ", formatTimestamp(event.Timestamp))

  fmt.Fprintf(writer, "<%s.%s ", type_.PkgPath(), type_.Name())
  /* For every field in this object, emit the name, type_, and current value */
  for i := 0; i < type_.NumField(); i++ {
    field := type_.Field(i)
    if field.Anonymous {
      continue;
    }

    /* Skip this field if it is not exported.
     * This is identifiable as fieldnames with first letter being lowercase. */
    if strings.ToUpper(field.Name[0:1]) != field.Name[0:1] {
      continue;
    }

    switch field.Type.Kind() {
      case reflect.Int:
        fmt.Fprintf(writer, "%s(%s)=%d", field.Name, field.Type, value.Field(i).Int())
      case reflect.Float32, reflect.Float64:
        fmt.Fprintf(writer, "%s(%s)=%f", field.Name, field.Type, value.Field(i).Float())
      case reflect.String:
        fmt.Fprintf(writer, "%s(%s)=\"%s\"", field.Name, field.Type, value.Field(i).String())
      case reflect.Interface:
        fmt.Fprintf(writer, "%s(%s)=%s", field.Name, field.Type, value.Field(i).Interface())
      case reflect.Bool:
        fmt.Fprintf(writer, "%s(%s)=%s", field.Name, field.Type, value.Field(i).Bool())
    }

    if i < (type_.NumField() - 1) {
      fmt.Fprintf(writer, ", ")
    }
  }
  fmt.Fprintf(writer, ">\n")
} /* log_struct */

func log_event(writer io.Writer, event *Event) {
  fmt.Fprintf(writer, "%s: ", formatTimestamp(event.Timestamp))
  if len(event.Message) > 0 {
    fmt.Fprintf(writer, "%s", event.Message)
  }

  if event.Object != nil {
    
  }
  fmt.Fprintf(writer, "\n")
} /* log_event */
