package main

import (
	"embed"
	"fmt"
	"io/fs"
	"log"
	"net/http"
	"os"
)

//go:embed static/*
var staticFiles embed.FS

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

	// Serve the embedded React frontend
	frontendFS, err := fs.Sub(staticFiles, "static")
	if err != nil {
		log.Fatalf("Failed to load frontend files: %v", err)
	}
	fileServer := http.FileServer(http.FS(frontendFS))

	// Custom handler: API routes first, then static files
	mux := http.NewServeMux()
	mux.HandleFunc("/api/health", handler.HealthHandler)
	mux.HandleFunc("/api/metrics", handler.MetricsHandler)
	mux.HandleFunc("/api/chat", handler.ChatAPIHandler)
	mux.HandleFunc("/ws", handler.WSHandler)
	mux.Handle("/", fileServer)

	fs.WalkDir(staticFiles, ".", func(path string, d fs.DirEntry, err error) error {
		if err != nil {
			return err
		}
		log.Printf("Embedded file: %s", path)
		return nil
	})

	if err := http.ListenAndServe(fmt.Sprintf(":%s", LISTEN_PORT), mux); err != nil {
		log.Fatalf("Error while starting http server - %v", err)
	}
}
