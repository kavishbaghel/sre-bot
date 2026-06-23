package main

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"

	"github.com/gorilla/websocket"
)

type Handlers struct {
	db   *DB
	hub  *Hub
	chat *ChatHandler
}

func NewHandlers(db *DB, hub *Hub, chat *ChatHandler) *Handlers {
	return &Handlers{
		db:   db,
		hub:  hub,
		chat: chat,
	}
}

func (h *Handlers) HealthHandler(w http.ResponseWriter, r *http.Request) {
	healthStatus, err := h.db.GetHealthStatus(r.Context())
	if err != nil {
		log.Printf("Not able to read health status - %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(healthStatus)
}

func (h *Handlers) MetricsHandler(w http.ResponseWriter, r *http.Request) {
	minutes, err := strconv.Atoi(r.URL.Query().Get("minutes"))
	if err != nil {
		log.Printf("Error fetching minutes for query params - %v", err)
		minutes = 5
	}

	recentMetrics, err := h.db.GetRecentMetrics(r.Context(), minutes)
	if err != nil {
		log.Printf("Could not fetch recent metrics for %d minutes - %v", minutes, err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(recentMetrics)
}

func (h *Handlers) ChatAPIHandler(w http.ResponseWriter, r *http.Request) {
	var msg struct {
		Message string `json:"message"`
	}
	if err := json.NewDecoder(r.Body).Decode(&msg); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}
	chatResponse, err := h.chat.Chat(r.Context(), msg.Message)
	if err != nil {
		log.Printf("Could not get chat resposne - %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"response": chatResponse,
	})

}

func (h *Handlers) WSHandler(w http.ResponseWriter, r *http.Request) {
	upgrader := websocket.Upgrader{CheckOrigin: func(r *http.Request) bool { return true }}
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("Could not upgrade websocket connection - %v", err)
		return
	}
	h.hub.AddClient(conn)
	defer h.hub.RemoveClient(conn)
	for {
		_, _, err := conn.ReadMessage()
		if err != nil {
			break
		}
	}
}
