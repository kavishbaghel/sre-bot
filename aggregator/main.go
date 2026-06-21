package main

import (
	"context"
	"log"
	"os"
)

func main() {
	log.Printf("main.go: Starting aggregator service...")
	// Read values from env for Kafka Broker Endpoint, Kafka Topic, and Clickhouse DB host
	KAFKA_BROKER := os.Getenv("KAFKA_BROKER")
	if KAFKA_BROKER == "" {
		KAFKA_BROKER = "localhost:9092"
	}
	KAFKA_TOPIC := os.Getenv("KAFKA_TOPIC")
	if KAFKA_TOPIC == "" {
		KAFKA_TOPIC = "metrics"
	}
	CLICKHOUSE_HOST := os.Getenv("CLICKHOUSE_HOST")
	if CLICKHOUSE_HOST == "" {
		CLICKHOUSE_HOST = "localhost"
	}

	ctx := context.Background()
	// Create a db store config
	log.Printf("main.go: Creating db store config...")
	store, err := NewStore(CLICKHOUSE_HOST)
	if err != nil {
		log.Fatalf("main.go: error occurred while creating db store config - %v", err)
	}
	store.SetupTable(ctx)

	// Create consumer
	log.Printf("main.go: Creating consumer config...")
	consumer := NewConsumer(KAFKA_BROKER, KAFKA_TOPIC, store)
	defer consumer.Close()
	err = consumer.Consume(ctx)
	if err != nil {
		log.Fatalf("Error occured while consuming messages - %v", err)
	}
}
