package main

import (
	"io"
	"net/http"
	"time"
)

type ScrapeResult struct {
	Target    string
	Body      string
	Success   bool
	Error     string
	ScrapedAt time.Time
}

type Scraper struct {
	client *http.Client
}

func NewScraper() *Scraper {
	return &Scraper{
		client: &http.Client{Timeout: 10 * time.Second},
	}
}

func (s *Scraper) Scrape(target string) ScrapeResult {
	resp, err := s.client.Get(target)
	if err != nil {
		return ScrapeResult{
			Target:    target,
			Success:   false,
			Error:     err.Error(),
			ScrapedAt: time.Now(),
		}
	}

	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)

	if err != nil {
		return ScrapeResult{
			Target:    target,
			Success:   false,
			Error:     err.Error(),
			ScrapedAt: time.Now(),
		}
	}

	return ScrapeResult{
		Target:    target,
		Body:      string(body),
		Success:   true,
		ScrapedAt: time.Now(),
	}
}
