package main

import (
	"container/ring"
	"encoding/xml"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/jacobsa/go-serial/serial"
)

func CostEstimate(w Watts, p Price, d time.Duration) float64 {
	hourly := (float64(w) / 1000.0) * float64(p)
	return d.Hours() * hourly
}

type Event struct {
	n Notification
	t time.Time
}

func main() {
	watts_history := ring.New(86400 / 10) // generally one update per 10 seconds
	price_history := ring.New(86400 / 30) // generally one update per 30 seconds

	go func() {
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

		for {
			n, err := Handle(decoder)
			if err != nil {
				log.Printf("Error reading RAVEn data: %s", err)
				return
			}
			switch v := n.(type) {
			case Watts:
				log.Printf("Watts: %.0f", v)
				watts_history.Value = &Event{v, time.Now()}
				watts_history = watts_history.Prev() // Store items in reverse-chronological order.
			case Price:
				log.Printf("Price: $%.4f", v)
				price_history.Value = &Event{v, time.Now()}
				price_history = watts_history.Prev() // Store items in reverse-chronological order.
			}
		}
	}()

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		watts := watts_history.Value.(Event).n.(Watts)
		price := price_history.Value.(Event).n.(Price)
		last := watts_history.Value.(Event).t
		if t := price_history.Value.(Event).t; t.After(last) {
			last = t
		}
		fmt.Fprintf(w, "Watts: %.0f @ $%.2f per kWh\n", watts, price)
		fmt.Fprintf(w, "Hourly cost: $%.2f\n", CostEstimate(watts, price, 1*time.Hour))
		fmt.Fprintf(w, "Daily cost: $%.2f\n", CostEstimate(watts, price, 24*time.Hour))
		fmt.Fprintf(w, "Monthly cost: $%.2f\n", CostEstimate(watts, price, 30*24*time.Hour))
		fmt.Fprintf(w, "Last read: %s\n", time.Since(last))
	})

	http.ListenAndServe(":8080", nil)

}
