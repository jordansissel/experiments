package main

import (
	"encoding/xml"
	"github.com/jacobsa/go-serial/serial"
"fmt"
	"io"
	"log"
	//"github.com/coreos/go-systemd/daemon"
"net/http"
"time"
)

type PowerState struct {
	Watts float64
	Cost float64
	Timestamp time.Time
}

func powerReader(state *PowerState) {
	options := serial.OpenOptions{
		PortName:        "/dev/ttyUSB0",
		BaudRate:        115200,
		DataBits:        8,
		StopBits:        1,
		MinimumReadSize: 1,
	}

	port, err := serial.Open(options)
	if err != nil {
		log.Fatalf("serial.Open: %v", err)
	}

	// Make sure to close it later.
	defer port.Close()

	decoder := xml.NewDecoder(NullTrimmer{port})

  var cost float64
	for {
		t, err := decoder.Token()
		if err != nil {
			if err == io.EOF {
				break
			}
			log.Printf("xml err: %s\n", err)
			return
		}

		switch t := t.(type) {
		case xml.StartElement:
			switch t.Name.Local {
			case "InstantaneousDemand":
				var e InstantaneousDemand
				if err = decoder.DecodeElement(&e, &t); err != nil {
					log.Printf("xml err2: %s\n", err)
					return
				}
				state.Watts = e.Watts()
				state.Timestamp = time.Now()
        if cost > 0 {
          estimate := (e.Watts() / 1000.0) * cost
          log.Printf("Watts: %.0f (per hour: $%.2f)\n", e.Watts(), estimate)
        } else {
          log.Printf("Watts: %.0f (no cost rate known yet)\n", e.Watts())
        }
			case "PriceCluster":
				var e PriceCluster
				if err = decoder.DecodeElement(&e, &t); err != nil {
					log.Printf("xml err2: %s\n", err)
					return
				}
        cost = e.Cost();
				state.Cost = cost
				state.Timestamp = time.Now()
        log.Printf("kWh rate: %f\n", cost);
			case "CurrentSummationDelivered":
        var e map[string]string
				if err = decoder.DecodeElement(&e, &t); err != nil {
					log.Printf("xml err3: %s\n", err)
					return
				}
        log.Printf("Unsupported right now: %s: %#v\n", t.Name.Local, e)
			case "TimeCluster":
				log.Printf("Unsupported right now: %s\n", t.Name.Local)
			default:
				log.Printf("Unknown element: %#v\n", t)
				return
			}
		}
	}
}

func main() {
	var state PowerState
	go powerReader(&state)

	http.HandleFunc("/", func (w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "Watts: %.0f @ $%.2f per kWh\n", state.Watts, state.Cost)
		hourly := (state.Watts / 1000) * state.Cost
		fmt.Fprintf(w, "Hourly cost: $%.2f\n", hourly) 
		fmt.Fprintf(w, "Daily cost: $%.2f\n", hourly * 24) 
		fmt.Fprintf(w, "Monthly cost: $%.2f\n", hourly * 24 * 30) 
		fmt.Fprintf(w, "Last read: %s\n", time.Since(state.Timestamp))
	})

	http.ListenAndServe(":8080", nil)

}
