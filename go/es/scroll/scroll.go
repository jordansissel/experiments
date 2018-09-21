package main

import (
	"bytes"
	"crypto/tls"
	"crypto/x509"
	"encoding/json"
	"flag"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"time"
)

var url = flag.String("url", "", "Elasticsearch URL (must have trailing /)")
var user = flag.String("user", "", "Elasticsearch username")
var pass = flag.String("pass", "", "Elasticsearch password")
var query = flag.String("query", "", "Elasticsearch Query (JSON) DSL")
var index = flag.String("index", "", "Elasticsearch index pattern")

func main() {

	flag.Parse()

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

	var body map[string]interface{}
	json.Unmarshal([]byte(*query), &body)

	log.Printf("Query: %v\n", body)
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
	path := *url + "/" + *index + "/_search?scroll=5m"
	req, err := http.NewRequest("POST", path, b)
	req.SetBasicAuth(*user, *pass)
	req.Header.Add("Content-Type", "application/json")

	for {
		log.Printf("Path: %s\n", path)
		start := time.Now()
		resp, err := client.Do(req)
		if err != nil {
			log.Printf("Request failed: %s\n", err)
			return
		}
		log.Printf("Duration: %s\n", time.Since(start))

		var results map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&results)

		scrollId := results["_scroll_id"]

		for k, _ := range results {
			fmt.Printf("k: %s\n", k)
		}

		if results["error"] != nil {
			log.Printf("error: %s\n", results["error"])
			return
		}
		hits := results["hits"].(map[string]interface{})["hits"].([]interface{})

		if len(hits) == 0 {
			log.Printf("Reached end of logs...")
			break
		}
		log.Printf("hits: %d\n", len(hits))

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

		path = *url + "/_search/scroll"
		req, _ = http.NewRequest("POST", path, b)
		req.SetBasicAuth(*user, *pass)
		req.Header.Add("Content-Type", "application/json")
	}
}
