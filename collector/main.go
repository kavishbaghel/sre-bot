package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
)

func main() {
	cfg := DefaultConfig()

	if os.Getenv("LISTEN_PORT") != "" {
		cfg.ListenPort = os.Getenv("LISTEN_PORT")
	}
	if os.Getenv("SCRAPE_TARGET") != "" {
		cfg.ScrapeTarget = os.Getenv("SCRAPE_TARGET")
	}
	if os.Getenv("KAFKA_BROKER") != "" {
		cfg.KafkaBroker = os.Getenv("KAFKA_BROKER")
	}
	if os.Getenv("KAFKA_TOPIC") != "" {
		cfg.KafkaTopic = os.Getenv("KAFKA_TOPIC")
	}
	scraper := NewScraper()
	publisher := NewPublisher(cfg.KafkaBroker, cfg.KafkaTopic)

	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		_ = json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
	})

	http.HandleFunc("/metrics", func(w http.ResponseWriter, r *http.Request) {
		result := scraper.Scrape(cfg.ScrapeTarget)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		_ = json.NewEncoder(w).Encode(result)
		if err := publisher.Publish(result); err != nil {
			log.Printf("Error while publishing result - %v", err)
		}
	})
	if err := http.ListenAndServe(fmt.Sprintf(":%s", cfg.ListenPort), nil); err != nil {
		log.Fatalf("Error while running http server - %v", err)
	}
}
