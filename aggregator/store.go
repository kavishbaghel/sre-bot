package main

import (
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
