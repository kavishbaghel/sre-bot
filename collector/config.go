package main

type Config struct {
	ScrapeTarget string
	ListenPort   string
}

func DefaultConfig() Config {
	return Config{
		ScrapeTarget: "http://localhost:9090/metrics",
		ListenPort:   "8080",
	}
}
