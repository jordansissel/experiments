package main

import (
	"encoding/xml"
	"io"
	"log"
	//"github.com/coreos/go-systemd/daemon"
)

type Notification interface {
	Notification() // marker
}

type Watts float64

func (Watts) Notification() {} // marker

type Price float64

func (Price) Notification() {} // marker

func Handle(reader io.Reader) (Notification, error) {
	decoder := xml.NewDecoder(reader)
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
				return Watts(e.Watts()), nil
			case "PriceCluster":
				var e PriceCluster
				if err = decoder.DecodeElement(&e, &t); err != nil {
					return nil, err
				}
				return Price(e.Cost()), nil
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
