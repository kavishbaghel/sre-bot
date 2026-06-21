package main

import (
	"context"
	"log"

	"github.com/ClickHouse/clickhouse-go/v2"
	"github.com/ClickHouse/clickhouse-go/v2/lib/driver"
)

type Store struct {
	conn driver.Conn
}

func NewStore(host string) (*Store, error) {
	conn, err := clickhouse.Open(&clickhouse.Options{
		Addr: []string{host + ":9000"},
		Auth: clickhouse.Auth{
			Database: "default",
		},
	})

	if err != nil {
		log.Printf("Error occurred while making db connection - %v", err)
		return nil, err
	}
	return &Store{conn: conn}, nil
}

func (s *Store) SetupTable(ctx context.Context) {
	err := s.conn.Exec(ctx, "CREATE TABLE IF NOT EXISTS metrics (target String, body String, success UInt8, error String, scraped_at DateTime) ENGINE = MergeTree() ORDER BY scraped_at")
	if err != nil {
		log.Printf("Error while creating table - %v", err)
	}
}

func (s *Store) Insert(ctx context.Context, result ScrapeResult) error {
	batch, err := s.conn.PrepareBatch(ctx, "INSERT INTO metrics")
	if err != nil {
		log.Printf("Error creating batch - %v", err)
		return err
	}
	var success uint8
	if result.Success {
		success = 1
	}
	batch.Append(result.Target, result.Body, success, result.Error, result.ScrapedAt)
	return batch.Send()
}
