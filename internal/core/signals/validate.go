package signals

import "errors"

func ValidateSignal(s Signal) error {
	if s.ID == "" {
		return errors.New("signal ID is required")
	}
	if s.Type == "" {
		return errors.New("signal type is required")
	}
	if s.Source == "" {
		return errors.New("signal source is required")
	}
	if s.Timestamp.IsZero() {
		return errors.New("signal timestamp is required")
	}
	if err := ValidateSignalType(s.Type); err != nil {
		return err
	}
	if err := ValidateSeverity(s.Severity); err != nil {
		return err
	}
	if err := ValidateServiceRef(s.Service); err != nil {
		return err
	}
	if err := ValidateResourceRef(s.Resource); err != nil {
		return err
	}
	return nil
}

func ValidateSignalType(st SignalType) error {
	if st == "" {
		return errors.New("signal type is required")
	}
	// validate the signal type against known types
	switch st {
	case SignalMetric, SignalLog, SignalTrace, SignalAlert, SignalEvent, SignalChange:
		return nil
	default:
		return errors.New("invalid signal type")
	}
}

func ValidateSeverity(sev Severity) error {
	if sev == "" {
		return errors.New("severity is required")
	}

	// validate the severity against known severities
	switch sev {
	case SeverityCritical, SeverityError, SeverityWarning, SeverityInfo:
		return nil
	default:
		return errors.New("invalid severity")
	}
}

func ValidateServiceRef(sr ServiceRef) error {
	if sr.Name == "" {
		return errors.New("service name is required")
	}
	if sr.Component == "" {
		return errors.New("service component is required")
	}
	if sr.ServiceType == "" {
		return errors.New("service type is required")
	}
	return nil
}

func ValidateResourceRef(rr ResourceRef) error {
	if rr.Name == "" {
		return errors.New("resource name is required")
	}
	if rr.Component == "" {
		return errors.New("resource component is required")
	}
	if rr.ResourceType == "" {
		return errors.New("resource type is required")
	}
	return nil
}
