package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
)

func main() {

	log.Print("Starting Dashboard server...")
	// Fetch variables for environment
	CLICKHOUSE_HOST := os.Getenv("CLICKHOUSE_HOST")
	if CLICKHOUSE_HOST == "" {
		CLICKHOUSE_HOST = "localhost"
	}
	LLM_HOST := os.Getenv("LLM_HOST")
	if LLM_HOST == "" {
		LLM_HOST = "http://localhost:11434"
	}
	LLM_MODEL := os.Getenv("LLM_MODEL")
	if LLM_MODEL == "" {
		LLM_MODEL = "llama3.2:3b"
	}
	LISTEN_PORT := os.Getenv("LISTEN_PORT")
	if LISTEN_PORT == "" {
		LISTEN_PORT = "8081"
	}

	// Create clickhouse db connection
	db, err := NewDB(CLICKHOUSE_HOST)
	if err != nil {
		log.Fatalf("Could not connect to database - %v", err)
	}

	// Create hub
	hub := NewHub()

	// Create Chat Handler
	ch := NewChatHandler(db, LLM_HOST, LLM_MODEL)

	// Create handler
	handler := NewHandlers(db, hub, ch)

	// Create hub goroutine
	go hub.Run()

	// Register routes for Handlers
	http.HandleFunc("/api/health", handler.HealthHandler)
	http.HandleFunc("/api/metrics", handler.MetricsHandler)
	http.HandleFunc("/api/chat", handler.ChatAPIHandler)
	http.HandleFunc("/ws", handler.WSHandler)

	if err := http.ListenAndServe(fmt.Sprintf(":%s", LISTEN_PORT), nil); err != nil {
		log.Fatalf("Error while starting http server - %v", err)
	}

}
