package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"github.com/OctopusDeploy/go-octopusdeploy/v2/pkg/client"
	"github.com/OctopusDeploy/go-octopusdeploy/v2/pkg/variables"
	"github.com/mcasperson/OctopusVariableSpreader/internal/args"
	"github.com/spf13/pflag"
	"github.com/spf13/viper"
	"net/url"
	"slices"
)

func initConfig() (*args.Args, error) {
	viper.AutomaticEnv() // Automatically use environment variables where available

	pflag.String("server", "", "Octopus Server address")
	pflag.String("spaceId", "", "Octopus Space ID")
	pflag.String("apiKey", "", "Octopus API Key")
	pflag.String("libraryVariableSet", "", "Octopus Library Variable Set")
	pflag.Bool("allLibraryVariableSets", false, "Spread all library variable sets")
	pflag.Bool("haveDoneBackup", false, "Confirm that a backup has been done")
	pflag.Bool("haveVerifiedBackup", false, "Confirm that a backup has been verified")
	pflag.Bool("acknowledgeSecurityImplications", false, "I understand the security implications of secret variables being altered to remove their scope")
	pflag.Parse()

	err := viper.BindPFlags(pflag.CommandLine)
	if err != nil {
		return nil, err
	}

	var parsedArgs args.Args
	err = viper.Unmarshal(&parsedArgs)
	if err != nil {
		return nil, err
	}

	return &parsedArgs, nil
}

func main() {
	parsedArgs, err := initConfig()
	if err != nil {
		fmt.Printf("Error initializing parsedArgs: %v\n", err)
		return
	}

	if !parsedArgs.HaveDoneBackup {
		fmt.Println("Pass the --haveDoneBackup argument to confirm you have performed a backup before running this program. Use the -haveDoneBackup flag to confirm that you have performed a backup of your Octopus instance.")
		return
	}

	if !parsedArgs.HaveVerifiedBackup {
		fmt.Println("Pass the --haveVerifiedBackup argument to confirm you have verified that any backup you have of the Octopus instance can be successfully used to restore your Octopus instance. Use the -haveVerifiedBackup flag to confirm that you have verified your backup of your Octopus instance.")
		return
	}

	if !parsedArgs.AcknowledgeSecurityImplications {
		fmt.Println("Pass the --acknowledgeSecurityImplications argument to confirm you understand and accept the security implications of secret variables being modified to remove any scope.")
		return
	}

	fmt.Printf("Server: %s\n", parsedArgs.Server)
	fmt.Printf("SpaceId: %s\n", parsedArgs.SpaceId)
	fmt.Printf("ApiKey: %s\n", parsedArgs.ApiKey)

	client, err := createClient(parsedArgs)

	if err != nil {
		handleError(err)
		return
	}

	if parsedArgs.AllLibraryVariableSets {
		libraryVariableSets, err := client.LibraryVariableSets.GetAll()

		if err != nil {
			handleError(err)
			return
		}

		for _, libraryVariableSet := range libraryVariableSets {
			variableSet, err := variables.GetVariableSet(client, client.GetSpaceID(), libraryVariableSet.VariableSetID)

			if err != nil {
				handleError(err)
				return
			}

			err = spreadVariables(client, libraryVariableSet, variableSet)

			if err != nil {
				handleError(err)
				return
			}
		}
	} else {
		libraryVariableSet, err := getExactLibraryVariableSet(client, parsedArgs)

		if err != nil {
			handleError(err)
			return
		}

		variableSet, err := variables.GetVariableSet(client, client.GetSpaceID(), libraryVariableSet.VariableSetID)

		if err != nil {
			handleError(err)
			return
		}

		err = spreadVariables(client, libraryVariableSet, variableSet)

		if err != nil {
			handleError(err)
			return
		}
	}
}

func handleError(err error) {
	fmt.Printf("Error creating client: %v\n", err)
}

func createClient(parsedArgs *args.Args) (*client.Client, error) {
	apiURL, err := url.Parse(parsedArgs.Server)
	if err != nil {
		_ = fmt.Errorf("error parsing URL for Octopus API: %v", err)
		return nil, err
	}

	// the first parameter for NewClient can accept a http.Client if you wish to
	// override the default; also, the spaceID may be an empty string (i.e. "") if
	// you wish to load the default space
	octopusClient, err := client.NewClient(nil, apiURL, parsedArgs.ApiKey, parsedArgs.SpaceId)
	if err != nil {
		_ = fmt.Errorf("error creating API client: %v", err)
		return nil, err
	}

	return octopusClient, nil
}

func getExactLibraryVariableSet(client *client.Client, parsedArgs *args.Args) (*variables.LibraryVariableSet, error) {
	libraryVariableSets, err := client.LibraryVariableSets.GetByPartialName(parsedArgs.LibraryVariableSet)

	if err != nil {
		return nil, err
	}

	for _, libraryVariableSet := range libraryVariableSets {
		if libraryVariableSet.Name == parsedArgs.LibraryVariableSet {
			return libraryVariableSet, nil
		}
	}

	return nil, errors.New("Library variable set not found")
}

func findSecretVariablesWithSharedNameAndScoped(variableSet *variables.VariableSet) ([]string, error) {
	groupedVariables := []string{}
	for _, variable := range variableSet.Variables {
		if !variable.IsSensitive {
			continue
		}

		if variable.Type != "Sensitive" {
			continue
		}

		if len(variable.Scope.Environments) == 0 &&
			len(variable.Scope.Machines) == 0 &&
			len(variable.Scope.Roles) == 0 &&
			len(variable.Scope.Actions) == 0 &&
			len(variable.Scope.TenantTags) == 0 &&
			len(variable.Scope.ProcessOwners) == 0 &&
			len(variable.Scope.Channels) == 0 {
			continue
		}

		groupedVariables = append(groupedVariables, variable.Name)
	}

	return groupedVariables, nil
}

func buildUniqueVariableName(variable *variables.Variable, usedNamed []string) string {
	name := variable.Name

	if len(variable.Scope.Environments) > 0 {
		name += fmt.Sprintf("_%s", variable.Scope.Environments[0])
	}

	if len(variable.Scope.Machines) > 0 {
		name += fmt.Sprintf("_%s", variable.Scope.Machines[0])
	}

	if len(variable.Scope.Roles) > 0 {
		name += fmt.Sprintf("_%s", variable.Scope.Roles[0])
	}

	if len(variable.Scope.Actions) > 0 {
		name += fmt.Sprintf("_%s", variable.Scope.Actions[0])
	}

	if len(variable.Scope.TenantTags) > 0 {
		name += fmt.Sprintf("_%s", variable.Scope.TenantTags[0])
	}

	if len(variable.Scope.Channels) > 0 {
		name += fmt.Sprintf("_%s", variable.Scope.Channels[0])
	}

	if len(variable.Scope.ProcessOwners) > 0 {
		name += fmt.Sprintf("_%s", variable.Scope.ProcessOwners[0])
	}

	startingName := name
	index := 1
	for slices.Index(usedNamed, name) != -1 {
		name = startingName + "_" + fmt.Sprint(index)
		index++
	}

	return name
}

func spreadVariables(client *client.Client, libraryVariableSet *variables.LibraryVariableSet, variableSet *variables.VariableSet) error {
	groupedVariables, err := findSecretVariablesWithSharedNameAndScoped(variableSet)

	if err != nil {
		return err
	}

	usedNames := []string{}
	for _, groupedVariable := range groupedVariables {
		for _, variable := range variableSet.Variables {
			if groupedVariable != variable.Name {
				continue
			}

			// Copy the original variable
			originalVar := *variable

			// Get a unique name
			uniqueName := buildUniqueVariableName(variable, usedNames)

			// Create a new variable with the original name and scopes referencing the new unscoped variable
			referenceVar := originalVar

			jsonData, err := json.Marshal(referenceVar.Scope)
			if err != nil {
				return err
			}

			// Note the original scope of this variable
			referenceVar.Description += "\n\nReplaced variable ID\n\n" + referenceVar.ID
			referenceVar.Description += "\n\nOriginal Scope\n\n" + string(jsonData)

			referenceVar.IsSensitive = false
			referenceVar.Type = "String"
			referenceVar.ID = ""
			reference := "#{" + uniqueName + "}"
			referenceVar.Value = &reference

			fmt.Println("Recreating " + referenceVar.Name + " referencing " + reference)

			_, err = variables.AddSingle(client, client.GetSpaceID(), libraryVariableSet.ID, &referenceVar)

			if err != nil {
				return err
			}

			// Update the original variable with the new name and no scopes
			originalName := variable.Name
			usedNames = append(usedNames, uniqueName)

			if variable.Value != nil {
				panic("The value of the variable must be nil here, otherwise we may be overriding sensitive values")
			}

			fmt.Println("Renaming " + originalName + " to " + uniqueName + " and removing scopes")

			jsonData, err = json.Marshal(variable.Scope)
			if err != nil {
				return err
			}

			// Note the original scope of this variable
			referenceVar.Description += "\n\nOriginal Name\n\n" + variable.Name
			// Note the original scope of this variable
			referenceVar.Description += "\n\nOriginal Scope\n\n" + string(jsonData)

			variable.Name = uniqueName
			variable.Scope = variables.VariableScope{}

			_, err = variables.UpdateSingle(client, client.GetSpaceID(), libraryVariableSet.ID, variable)

			if err != nil {
				return err
			}
		}
	}

	return nil
}
