package main

import (
	"context"
	"encoding/json"
	"log"

	"github.com/segmentio/kafka-go"
)

type Consumer struct {
	reader *kafka.Reader
	store  *Store
	topic  string
}

func NewConsumer(broker, topic string, store *Store) *Consumer {
	kafkaReaderConfig := kafka.ReaderConfig{
		Brokers:  []string{broker},
		GroupID:  "sre-bot-aggregator",
		Topic:    topic,
		MinBytes: 1,
		MaxBytes: 10e6,
	}
	kafkaReader := kafka.NewReader(kafkaReaderConfig)
	return &Consumer{
		reader: kafkaReader,
		store:  store,
		topic:  topic,
	}
}

func (consumer *Consumer) Consume(ctx context.Context) error {
	for {

		message, err := consumer.reader.ReadMessage(ctx)
		if err != nil {
			log.Printf("Error while reading message - %v", err)
			return err
		}
		var result ScrapeResult
		if err := json.Unmarshal(message.Value, &result); err != nil {
			log.Printf("Error while unmarshalling values - %v", err)
			continue
		}
		err = consumer.store.Insert(ctx, result)
		if err != nil {
			log.Printf("Error while inserting results - %v", err)
			continue
		}
		log.Printf("Result inserted successfully for Target %s scraped at %v", result.Target, result.ScrapedAt)
	}
}

func (consumer *Consumer) Close() error {
	err := consumer.reader.Close()
	if err != nil {
		log.Printf("Error while closing reader - %v", err)
		return err
	}
	log.Print("Successfully closed reader.")
	return nil
}
