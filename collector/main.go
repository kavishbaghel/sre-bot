package main

import (
	"encoding/json"
	"fmt"
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
	scraper := NewScraper()

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
	})
	http.ListenAndServe(fmt.Sprintf(":%s", cfg.ListenPort), nil)
}
