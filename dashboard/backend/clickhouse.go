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
			errMsg     string
			scraped_at time.Time
		)
		if err := rows.Scan(&target, &success, &errMsg, &scraped_at); err != nil {
			log.Printf("Error while scanning rows - %v", err)
			return nil, err
		}
		row := map[string]interface{}{
			"target":     target,
			"success":    success,
			"error":      errMsg,
			"scraped_at": scraped_at,
		}
		results = append(results, row)
	}
	return results, nil
}

func (db *DB) GetFailureSummary(ctx context.Context, minutes int) ([]map[string]interface{}, error) {
	failures_query := "SELECT error, count(*) as count FROM metrics WHERE success = 0 AND scraped_at >= now() - INTERVAL ? MINUTE GROUP BY error ORDER BY count DESC"
	rows, err := db.conn.Query(ctx, failures_query)
	if err != nil {
		log.Printf("Error while fetching failures - %v", err)
		return nil, err
	}
	errors := []map[string]interface{}{}
	for rows.Next() {
		var (
			errMsg string
			count  uint32
		)
		if err := rows.Scan(&errMsg, &count); err != nil {
			log.Printf("Could not scan rows for error details and count - %v", err)
			return nil, err
		}
		row := map[string]interface{}{
			"error": errMsg,
			"count": count,
		}
		errors = append(errors, row)
	}
	return errors, nil
}

func (db *DB) GetHealthStatus(ctx context.Context) (map[string]interface{}, error) {
	metrics_count_query := "SELECT count(*) FROM metrics WHERE scraped_at >= now() - INTERVAL 5 MINUTE"
	failure_count_query := "SELECT count(*) FROM metrics WHERE success = 0 AND scraped_at >= now() - INTERVAL 5 MINUTE"

	// Fetch metrics count
	rows, err := db.conn.Query(ctx, metrics_count_query)
	if err != nil {
		log.Printf("Error while fetching metrics count - %v", err)
		return nil, err
	}
	var metrics_count uint32
	for rows.Next() {
		var count uint32
		if err := rows.Scan(&count); err != nil {
			log.Printf("Error while scanning metrics count row - %v", err)
			return nil, err
		}
		metrics_count = count
	}

	// Fetch failures count
	failure_rows, err := db.conn.Query(ctx, failure_count_query)
	if err != nil {
		log.Printf("Error while fetching failures count - %v", err)
		return nil, err
	}
	var failures_count uint32
	for failure_rows.Next() {
		var count uint32
		if err := failure_rows.Scan(&count); err != nil {
			log.Printf("Error while scanning metrics count row - %v", err)
			return nil, err
		}
		failures_count = count
	}

	// Calculate failure rate
	var failure_rate float32
	if metrics_count == 0 {
		failure_rate = 0
	} else {
		failure_rate = float32(failures_count) / float32(metrics_count)
	}

	var healthy bool = true

	//calculate if healthy or not
	if failure_rate >= 0.5 {
		healthy = false
	}

	// Create map and return
	healthStatus := map[string]interface{}{
		"total":        metrics_count,
		"failures":     failures_count,
		"failure_rate": failure_rate,
		"healthy":      healthy,
	}
	return healthStatus, nil
}
