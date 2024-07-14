# Octopus Variable Spreader

A limitation when serializing a space to a Terraform module with octoterra is that sensitive variables are not exposed via the API, meaning there is no way to extract and embed sensitive variables in the Terraform module. 

A common workaround to this limitation is to embed an Octostache variable template as the default value for a sensitive variable. For example:

```hcl
variable "my_secret" {
  type = string
  default = "#{MySecretVariable}"
}
```

When Octopus deploys this Terraform module it can replace the Octostache template with the value of the sensitive variable.

However, this means that all sensitive variables must be able to be read via a unique variable name. If a sensitive variable is scoped in any way it may not be available to be passed to the Terraform module. This typically manifests as many sensitive variables with unique environment scopes sharing the same name, which is presented in the UI as a single variable with many values.

This tool will spread such variables so that each sensitive variable has a unique name, while recreating the original grouped variable as text variables using Octostache templates to reference the new uniquely named variables.