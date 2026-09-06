package signals

import (
	"encoding/json"
	"time"
)

type SignalType string

const (
	SignalMetric SignalType = "metric"
	SignalLog    SignalType = "log"
	SignalTrace  SignalType = "trace"
	SignalAlert  SignalType = "alert"
	SignalEvent  SignalType = "event"
	SignalChange SignalType = "change"
)

type Severity string

const (
	SeverityCritical Severity = "critical"
	SeverityError    Severity = "error"
	SeverityWarning  Severity = "warning"
	SeverityInfo     Severity = "info"
)

type ServiceRef struct {
	Name   string
	Labels map[string]string
}

type ResourceRef struct {
	Name   string
	Labels map[string]string
}

type Signal struct {
	ID     string
	Type   SignalType
	Source string

	Timestamp time.Time

	Severity Severity

	Service  ServiceRef
	Resource ResourceRef

	Environment string

	Attributes map[string]string

	Value any

	Raw json.RawMessage
}
