package main

import (
	"io"
	"log"
	"os"
	"reflect"
	"testing"
)

func TestFoo(t *testing.T) {
	reader, err := os.Open("testdata/sample.xml")
	if err != nil {
		t.Error(err)
	}

	for {
		n, err := Handle(reader)
		if err != nil {
			if err == io.EOF {
				break
			}
			log.Printf("::: err: %v (%#v)\n", err, reflect.TypeOf(err))
		}
		log.Printf("::: %v (%#v)\n", n, reflect.TypeOf(n))
	}
}
