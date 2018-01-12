package main

import (
	"container/ring"
	"encoding/xml"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/jacobsa/go-serial/serial"
)

func CostEstimate(w Watts, p Price, d time.Duration) float64 {
	hourly := (float64(w.Value) / 1000.0) * float64(p.Value)
	return d.Hours() * hourly
}

func openSerial() io.ReadCloser {
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
	return port
}

func main() {
	// How long to keep history
	MAX_AGE := int((7 * 24 * time.Hour).Seconds())
	watts_history := ring.New(MAX_AGE / 10) // generally one update per 10 seconds
	price_history := ring.New(MAX_AGE / 30) // generally one update per 30 seconds

	go func() {
		var reader io.ReadCloser
		var err error
		if len(os.Args) > 1 && os.Args[1] == "test" {
			reader, err = os.Open("testdata/sample.xml")
			if err != nil {
				log.Fatalf("Failed to open test data")
			}
		} else {
			log.Printf("Opening serial port.")
			reader = openSerial()
		}
		defer reader.Close()
		decoder := xml.NewDecoder(NullTrimmer{reader})

		for {
			n, err := Handle(decoder)
			if err != nil {
				log.Printf("Error reading RAVEn data: %s", err)
				return
			}
			switch v := n.(type) {
			case Watts:
				log.Printf("Watts: %.0f", v)
				watts_history.Value = v
				watts_history = watts_history.Prev() // Store items in reverse-chronological order.
			case Price:
				log.Printf("Price: $%.4f", v)
				price_history.Value = v
				price_history = price_history.Prev() // Store items in reverse-chronological order.
			}
		}
	}()

	http.Handle("/public/", http.FileServer(http.Dir(".")))

	http.HandleFunc("/txt", func(w http.ResponseWriter, r *http.Request) {
		if watts_history.Next() == nil || price_history.Next() == nil {
			fmt.Fprintf(w, "Missing one or both of power and price readings. Try again later.")
			return
		}
		watts := watts_history.Next().Value.(Watts)
		price := price_history.Next().Value.(Price)
		last := watts_history.Next().Value.(Watts).Time
		if t := price_history.Next().Value.(Price).Time; t.After(last) {
			last = t
		}
		fmt.Fprintf(w, "Watts: %.0f @ $%.2f per kWh\n", watts, price)
		fmt.Fprintf(w, "Hourly cost: $%.2f\n", CostEstimate(watts, price, 1*time.Hour))
		fmt.Fprintf(w, "Daily cost: $%.2f\n", CostEstimate(watts, price, 24*time.Hour))
		fmt.Fprintf(w, "Monthly cost: $%.2f\n", CostEstimate(watts, price, 30*24*time.Hour))
		fmt.Fprintf(w, "Last read: %s\n", time.Since(last))
	})

	http.HandleFunc("/api/usage", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		fmt.Fprintln(w, "[")
		first := true
		watts_history.Do(func(v interface{}) {
			if v == nil {
				return
			}
			if first {
				first = false
			} else {
				fmt.Fprintf(w, ",")
			}
			//t, _ := v.(Event).t.MarshalJSON()
			//time.Format("2006-01-02T15:04:05.000-0700")
			fmt.Fprintf(w, "{\"timestamp\":\"%s\",\"usage\":%f}", v.(Watts).Time.Format("2006-01-02T15:04:05.000-0700"), v.(Watts).Value)
		})
		fmt.Fprintln(w, "]")
	})

	http.HandleFunc("/api/price", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		fmt.Fprintln(w, "[")
		first := true
		price_history.Do(func(v interface{}) {
			if v == nil {
				return
			}
			if first {
				first = false
			} else {
				fmt.Fprintf(w, ",")
			}
			fmt.Fprintf(w, "{\"timestamp\":\"%s\",\"price\":%.04f}", v.(Watts).Time.Format("2006-01-02T15:04:05.000-0700"), v.(Price).Value)
		})
		fmt.Fprintln(w, "]")
	})

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "public/index.html")
	})
	http.ListenAndServe(":8080", nil)

}
