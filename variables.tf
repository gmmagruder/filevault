# Kubernets config
variable "resource_group_location" {
  type        = string
  default     = "uksouth"
  description = "Location of the resource group."
}

variable "resource_group_name" {
  type        = string
  default     = "filevaultTerraform"
  description = "Prefix of the resource group name that's combined with a random ID so name is unique in your Azure subscription."
}

variable "node_count" {
  type        = number
  description = "The initial quantity of nodes for the node pool."
  default     = 1
}

variable "msi_id" {
  type        = string
  description = "The Managed Service Identity ID. Set this value if you're running this example using Managed Identity as the authentication method."
  default     = null
}

variable "username" {
  type        = string
  description = "The admin username for the new cluster."
  default     = "azureadmin"
}

variable "storage_name" {
  type        = string
  default     = "gmmfilevaultterraform"
  description = "Storage name"
}

variable "container_registry_name" {
  type        = string
  default     = "filevaultTerraform"
  description = "Container name"
}

variable "db_username_prefix" {
  type        = string
  default     = "azureuser"
  description = "Prefix of db username"
}

variable "azurerm_storage_container_name" {
  type        = string
  description = "Name of storage container"
  default     = "files"
}

variable "key_vault_name" {
  type        = string
  description = "Name of keyvault"
  default     = "filevaultKeyvault"
}

# Secrets names
variable "storage_account_name_secret" {
  type        = string
  description = "Name storage account name secret"
  default     = "storage-account-name"
}

variable "storage_account_key_secret" {
  type        = string
  description = "Name storage account key secret"
  default     = "storage-account-key"
}

variable "storage_container_name_secret" {
  type        = string
  description = "Name storage container name secret"
  default     = "storage-container-name"
}

variable "db_host_secret" {
  type        = string
  description = "Name db host secret"
  default     = "db-host"
}

variable "db_host" {
  type        = string
  description = "DB host"
  default     = "db"
}

variable "db_table_secret" {
  type        = string
  description = "Name db host secret"
  default     = "db-table"
}

variable "db_table" {
  type        = string
  description = "DB table"
  default     = "filevault"
}

variable "db_username_secret" {
  type        = string
  description = "Name db username secret"
  default     = "db-username"
}

variable "db_password_secret" {
  type        = string
  description = "Name db password secret"
  default     = "db-password"
}

variable "db_root_password_secret" {
  type        = string
  description = "Name db root password secret"
  default     = "db-root-password"
}