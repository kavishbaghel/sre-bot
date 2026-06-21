package main

import (
	"context"
	"log"
	"time"

	"github.com/ClickHouse/clickhouse-go/v2"
	"github.com/ClickHouse/clickhouse-go/v2/lib/driver"
)

type DB struct {
	conn driver.Conn
}

func NewDB(host string) (*DB, error) {
	conn, err := clickhouse.Open(&clickhouse.Options{
		Addr: []string{host + ":9000"},
		Auth: clickhouse.Auth{
			Database: "default",
		},
	})
	if err != nil {
		log.Printf("Error while connecting to database - %v", err)
		return nil, err
	}
	return &DB{conn: conn}, nil
}

func (db *DB) GetRecentMetrics(ctx context.Context, minutes int) ([]map[string]interface{}, error) {
	metrics_query := "SELECT target, success, error, scraped_at FROM metrics WHERE scraped_at >= now() - INTERVAL ? MINUTE ORDER BY scraped_at DESC LIMIT 50"
	rows, err := db.conn.Query(ctx, metrics_query)
	if err != nil {
		log.Printf("Could not fetch recent metrics from db - %v", err)
		return nil, err
	}
	results := []map[string]interface{}{}
	for rows.Next() {
		var (
			target     string
			success    uint8
			error      string
			scraped_at time.Time
		)
		if err := rows.Scan(&target, &success, &error, &scraped_at); err != nil {
			log.Printf("Error while scanning rows - %v", err)
			return nil, err
		}
		row := map[string]interface{}{
			"target":     target,
			"success":    success,
			"error":      error,
			"scraped_at": scraped_at,
		}
		results = append(results, row)
	}
	return results, nil
}
