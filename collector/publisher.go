package main

import (
	"context"
	"encoding/json"

	"log"

	"github.com/segmentio/kafka-go"
)

type Publisher struct {
	writer *kafka.Writer
	topic  string
}

func NewPublisher(brokerAddr, topic string) *Publisher {
	Writer := kafka.NewWriter(kafka.WriterConfig{
		Brokers:  []string{brokerAddr},
		Topic:    topic,
		Balancer: &kafka.LeastBytes{},
	})

	return &Publisher{
		writer: Writer,
		topic:  topic,
	}

}

func (p *Publisher) Publish(result ScrapeResult) error {
	r, err := json.Marshal(result)

	if err != nil {
		log.Printf("Error while fetching result - %v", err)
		return err
	}

	message := kafka.Message{Value: r}

	err = p.writer.WriteMessages(context.Background(), message)

	if err != nil {
		log.Printf("Error while publish message to kafka topic - %v", err)
		return err
	}
	return nil
}
