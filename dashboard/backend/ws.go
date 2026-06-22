package main

import (
	"sync"

	"github.com/gorilla/websocket"
)

type Hub struct {
	clients   map[*websocket.Conn]bool
	broadcast chan []byte
	mu        sync.Mutex
}

func NewHub() *Hub {
	return &Hub{
		clients:   make(map[*websocket.Conn]bool),
		broadcast: make(chan []byte, 256),
	}
}

func (hub *Hub) Run() {
	for {
		msg := <-hub.broadcast
		hub.mu.Lock()
		for conn := range hub.clients {
			if err := conn.WriteMessage(websocket.TextMessage, msg); err != nil {
				conn.Close()
				delete(hub.clients, conn)
			}
		}
		hub.mu.Unlock()
	}
}

func (hub *Hub) AddClient(conn *websocket.Conn) {
	hub.mu.Lock()
	hub.clients[conn] = true
	hub.mu.Unlock()
}

func (hub *Hub) RemoveClient(conn *websocket.Conn) {
	hub.mu.Lock()
	delete(hub.clients, conn)
	hub.mu.Unlock()
}

func (hub *Hub) Broadcast(msg []byte) {
	hub.broadcast <- msg
}
