package main

import (
	"bytes"
	"crypto/tls"
	"crypto/x509"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
)

func main() {
	base := os.Args[1]
	user := os.Args[2]
	pass := os.Args[3]

	trust, _ := x509.SystemCertPool()
	if trust == nil {
		trust = x509.NewCertPool()
	}

	// Currently hardcoded certificate path
	// You can fetch this with
	// `openssl s_client -connect yourhost:9200 | sed -ne '/BEGIN/,/END CERT/p' > cert`
	certs, err := ioutil.ReadFile("cert")
	if err != nil {
		log.Printf("Failed to read cert file: %s\n", err)
		return
	}

	if ok := trust.AppendCertsFromPEM(certs); !ok {
		log.Println("Failed to add certs")
		return
	}

	body := map[string]interface{}{
		"size": 1000,
		"query": map[string]interface{}{
			// TODO: Don't hardcode the query
			"range": map[string]interface{}{
				"@timestamp": map[string]interface{}{
					"gte": "now-7d",
				},
			},
		},
	}

	b := new(bytes.Buffer)
	json.NewEncoder(b).Encode(body)

	client := http.Client{
		Transport: &http.Transport{
			TLSClientConfig: &tls.Config{
				RootCAs: trust,
			},
		},
	}

	// TODO: don't hardcode the index.
	req, err := http.NewRequest("POST", base+"filebeat-*/_search?scroll=5m", b)
	req.SetBasicAuth(user, pass)
	req.Header.Add("Content-Type", "application/json")

	for {
		resp, err := client.Do(req)
		if err != nil {
			log.Printf("Request failed: %s\n", err)
			return
		}

		var results map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&results)

		scrollId := results["_scroll_id"]

		for k, _ := range results {
			fmt.Printf("k: %s\n", k)
		}

		if results["error"] != nil {
			fmt.Printf("error: %s\n", results["error"])
			return
		}
		fmt.Printf("[hits]: %T\n", results["hits"])
		fmt.Printf("[hits]: %T\n", results["hits"].(map[string]interface{})["hits"])
		hits := results["hits"].(map[string]interface{})["hits"].([]interface{})

		if len(hits) == 0 {
			log.Printf("Reached end of logs...")
			break
		}

		printer := json.NewEncoder(os.Stdout)
		for _, hit := range hits {
			doc := hit.(map[string]interface{})["_source"]
			printer.Encode(doc)
		}

		body := map[string]interface{}{
			"scroll":    "5m",
			"scroll_id": scrollId,
		}

		b := new(bytes.Buffer)
		json.NewEncoder(b).Encode(body)

		req, _ = http.NewRequest("POST", base+"_search/scroll", b)
		req.SetBasicAuth(user, pass)
		req.Header.Add("Content-Type", "application/json")
	}
}
