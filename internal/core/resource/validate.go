package resource

import "errors"

func ValidateResource(r Resource) error {
	if r.ID == "" {
		return errors.New("resource ID is required")
	}
	if r.Name == "" {
		return errors.New("resource name is required")
	}
	if r.Type == "" {
		return errors.New("resource type is required")
	}
	if r.Provider == "" {
		return errors.New("resource provider is required")
	}
	return nil
}
