package main

import "time"

type ScrapeResult struct {
	Target    string    `json:"Target"`
	Body      string    `json:"Body"`
	Success   bool      `json:"Success"`
	Error     string    `json:"Error"`
	ScrapedAt time.Time `json:"ScrapedAt"`
}
