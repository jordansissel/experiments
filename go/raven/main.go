package main

import (
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

func main() {
	var watts Watts
	var last time.Time
	var price Price
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

		for {
			n, err := Handle(port)
			if err != nil {
				log.Printf("Error reading RAVEn data: %s", err)
				return
			}
			last = time.Now()
			switch v := n.(type) {
			case Watts:
				log.Printf("Watts: %.0f", v)
				watts = v
			case Price:
				log.Printf("Price: $%.4f", v)
				price = v
			}
		}
	}()

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "Watts: %.0f @ $%.2f per kWh\n", watts, price)
		fmt.Fprintf(w, "Hourly cost: $%.2f\n", CostEstimate(watts, price, 1*time.Hour))
		fmt.Fprintf(w, "Daily cost: $%.2f\n", CostEstimate(watts, price, 24*time.Hour))
		fmt.Fprintf(w, "Monthly cost: $%.2f\n", CostEstimate(watts, price, 30*24*time.Hour))
		fmt.Fprintf(w, "Last read: %s\n", time.Since(last))
	})

	http.ListenAndServe(":8080", nil)

}
