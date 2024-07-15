package args

// Args represent the program arguments
type Args struct {
	Server                          string
	SpaceId                         string
	ApiKey                          string
	LibraryVariableSet              string
	HaveDoneBackup                  bool
	HaveVerifiedBackup              bool
	AllLibraryVariableSets          bool
	AcknowledgeSecurityImplications bool
}
