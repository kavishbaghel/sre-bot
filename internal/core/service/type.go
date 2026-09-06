package service

type Service struct {
	ID     string
	Name   string
	Labels map[string]string `default:"{}"`
}
