package clago

import (
  "strconv"
)

type Parser int
const (
  String Parser = iota // default parser
  Bool
  Uint8
  Uint16
  Uint32
  Uint64
  Int8
  Int16
  Int32
  Int64
  Float32
  Float64

  // Not really sure this is needed yet? ;)
  //Complex64
  //Complex128
)

func (p Parser) Parse(value string) (interface{}, error) {
  switch p {
  case Bool:
    switch value {
      case "true", "yes", "1": return true, nil
      default: return false, nil
    }
  case Uint8:
    conv, err := strconv.ParseUint(value, 0, 8)
    return uint8(conv), err
  case Uint16:
    conv, err := strconv.ParseUint(value, 0, 16)
    return uint16(conv), err
  case Uint32:
    conv, err := strconv.ParseUint(value, 0, 32)
    return uint32(conv), err
  case Uint64:
    conv, err := strconv.ParseUint(value, 0, 64)
    return uint64(conv), err
  case Int8:
    conv, err := strconv.ParseInt(value, 0, 8)
    return int8(conv), err
  case Int16:
    conv, err := strconv.ParseInt(value, 0, 16)
    return int16(conv), err
  case Int32:
    conv, err := strconv.ParseInt(value, 0, 32)
    return int32(conv), err
  case Int64:
    conv, err := strconv.ParseInt(value, 0, 64)
    return int64(conv), err
  case Float32:
    conv, err := strconv.ParseFloat(value, 32)
    return float32(conv), err
  case Float64:
    conv, err := strconv.ParseFloat(value, 64)
    return float64(conv), err
  //case Complex64:
  //case Complex128:
  case String:
    return value, nil
  }
  return nil, nil
}
