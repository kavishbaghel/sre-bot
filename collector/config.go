package main

import "log"

type Config struct {
	ScrapeTarget string
	ListenPort   string
	KafkaBroker  string
	KafkaTopic   string
}

func DefaultConfig() Config {
	log.Printf("<<<<<< Generating default config >>>>>> \n")
	return Config{
		ScrapeTarget: "http://localhost:9090/metrics",
		ListenPort:   "8080",
		KafkaBroker:  "localhost:9092",
		KafkaTopic:   "metrics",
	}
}
