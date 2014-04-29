package clago

import (
  "testing"
  //"reflect"
)

func TestDefaultParser(t *testing.T) {
  p := String
  str := "hello"
  v, err := p.Parse(str)
  if err != nil {
    t.Errorf("String failed to parse")
  }
  if str != v {
    t.Errorf("Strings didn't match")
  }
}

func TestNumberParsers(t *testing.T) {
  parsers := [...]Parser{ Uint8, Uint16, Uint32, Uint64, Int8, Int16, Int32, Int64, Float32, Float64 }

  for _, p := range parsers {
    testSpecificParser(t, p)
  }
}

func testSpecificParser(t *testing.T, p Parser) {
  v, err := p.Parse("100")
  if err != nil {
    t.Errorf("'100' failed to parse")
  }

  var ok bool
  var equal bool
  switch p {
  case Uint8:
    var i uint8
    i, ok = v.(uint8)
    equal = i == uint8(100)
  case Uint16:
    var i uint16
    i, ok = v.(uint16)
    equal = i == uint16(100)
  case Uint32:
    var i uint32
    i, ok = v.(uint32)
    equal = i == uint32(100)
  case Uint64:
    var i uint64
    i, ok = v.(uint64)
    equal = i == uint64(100)
  case Int8:
    var i int8
    i, ok = v.(int8)
    equal = i == int8(100)
  case Int16:
    var i int16
    i, ok = v.(int16)
    equal = i == int16(100)
  case Int32:
    var i int32
    i, ok = v.(int32)
    equal = i == int32(100)
  case Int64:
    var i int64
    i, ok = v.(int64)
    equal = i == int64(100)
  case Float32:
    var i float32
    i, ok = v.(float32)
    equal = i == float32(100)
  case Float64:
    var i float64
    i, ok = v.(float64)
    equal = i == float64(100)
  case String:
    ok = true
    equal = v == "100"
  }
  if !ok {
    t.Errorf("Parse %#v expected to return correct type. Got %t", p, v)
  }
  if !equal {
    t.Errorf("Expected %s == %s", v, "100")
  }
}
