package main

import (
	"encoding/xml"
	"log"
	"time"
	//"github.com/coreos/go-systemd/daemon"
)

type Notification interface {
	Notification() // marker
}

type Watts struct {
	Value float64
	Time  time.Time
}

func (Watts) Notification() {} // marker

type Price struct {
	Value float64
	Time  time.Time
}

func (Price) Notification() {} // marker

//func Handle(reader io.Reader) (Notification, error) {
func Handle(decoder *xml.Decoder) (Notification, error) {
	for {
		t, err := decoder.Token()
		if err != nil {
			return nil, err
		}

		switch t := t.(type) {
		case xml.StartElement:
			switch t.Name.Local {
			case "InstantaneousDemand":
				var e InstantaneousDemand
				if err = decoder.DecodeElement(&e, &t); err != nil {
					return nil, err
				}
				return e.ToWatts(), nil
			case "PriceCluster":
				var e PriceCluster
				if err = decoder.DecodeElement(&e, &t); err != nil {
					return nil, err
				}
				return e.ToPrice(), nil
			case "CurrentSummationDelivered":
				var e CurrentSummationDelivered
				if err = decoder.DecodeElement(&e, &t); err != nil {
					return nil, err
				}
				// Nothing to do here...
				log.Printf("Unsupported right now: %s: %#v\n", t.Name.Local, e)
			case "TimeCluster":
				var e TimeCluster
				if err = decoder.DecodeElement(&e, &t); err != nil {
					return nil, err
				}
				log.Printf("Unsupported right now: %s: %#v\n", t.Name.Local, e)
			case "ConnectionStatus":
				var e ConnectionStatus
				if err = decoder.DecodeElement(&e, &t); err != nil {
					return nil, err
				}
				log.Printf("Unsupported right now: %s: %#v\n", t.Name.Local, e)
			default:
				log.Printf("Unknown element: %#v\n", t)
			}
		}
	}

	panic("Should not get here")
}
