package clago

import (
  "github.com/Sirupsen/logrus"
)

var log = logrus.New()

func init() {
  log.Formatter = new(logrus.JSONFormatter)
  log.Level = logrus.Debug
}

type Validator func(interface{}) error
type Option struct {
  Name string
  Description string
  Parser Parser

  validators []Validator
  value interface{}
}

func (o *Option) Set(str string) {
  logger := log.WithFields(logrus.Fields{"option": o.Name, "value": str})
  var err error

  logger.Debug("Parsing")
  o.value, err = o.Parser.Parse(str)
  if err != nil { panic("parse failure") }
  logger.WithFields(logrus.Fields{"parsed": o.value}).Debug("Parsed")

  logger.Debug("Validating")
  for _, validator := range o.validators {
    if err = validator(o.value); err != nil { panic("validate failure") }
  }
}

func (o *Option) Value() interface{} {
  return o.value
}

func (o *Option) AddValidation(v Validator) {
  o.validators = append(o.validators, v)
}
