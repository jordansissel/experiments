package main

import (
	"encoding/xml"
	"io"
	"log"
	"os"
	"reflect"
	"testing"
)

func TestFoo(t *testing.T) {
	reader, err := os.Open("testdata/sample.xml")
	decoder := xml.NewDecoder(reader)
	if err != nil {
		t.Error(err)
	}

	watts_count := 0
	price_count := 0
	expected_watts_count := 99 // grep -c '^<Instantaneous' testdata/sample.xml
	expected_price_count := 18 // grep -c '^<Price' testdata/sample.xml
	for {
		n, err := Handle(decoder)
		if err != nil {
			if err == io.EOF {
				break
			}
			log.Printf("::: err: %v (%#v)\n", err, reflect.TypeOf(err))
		}

		switch n.(type) {
		case Watts:
			watts_count += 1
		case Price:
			price_count += 1
		}
	}

	if watts_count != expected_watts_count {
		t.Errorf("Expected %d power usage (watts) notifications, but got %d.", expected_watts_count, watts_count)
	}
	if price_count != expected_price_count {
		t.Errorf("Expected %d price notifications, but got %d.", expected_price_count, price_count)
	}
}
