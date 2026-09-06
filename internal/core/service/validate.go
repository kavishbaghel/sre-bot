package service

import "errors"

func ValidateService(s Service) error {
	if s.ID == "" {
		return errors.New("service ID is required")
	}
	if s.Name == "" {
		return errors.New("service name is required")
	}
	return nil
}
