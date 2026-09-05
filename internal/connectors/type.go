package connectors

import "context"

type MetricsProvider interface {
	Query(ctx context.Context, query MetricsQuery) ([]Metric, error)
}
