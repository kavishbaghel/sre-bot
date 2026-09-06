package resource

type ResourceType string
type ResourceProvider string

const (
	// Resource types
	Compute  ResourceType = "compute"
	Storage  ResourceType = "storage"
	Network  ResourceType = "network"
	Database ResourceType = "database"

	// Resource providers
	AWS        ResourceProvider = "aws"
	GCP        ResourceProvider = "gcp"
	Azure      ResourceProvider = "azure"
	Kubernetes ResourceProvider = "kubernetes"
)

type Resource struct {
	ID       string
	Name     string
	Labels   map[string]string `default:"{}"`
	Type     ResourceType
	Provider ResourceProvider
}
