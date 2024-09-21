resource "azurerm_resource_group" "rg" {
  location = var.resource_group_location
  name     = var.resource_group_name
}

resource "random_pet" "azurerm_kubernetes_cluster_name" {
  prefix = "cluster"
}

resource "random_pet" "azurerm_kubernetes_cluster_dns_prefix" {
  prefix = "dns"
}

resource "random_string" "container_name" {
  length  = 25
  lower   = true
  upper   = false
  special = false
}

# Container register set up
resource "azurerm_container_registry" "acr" {
  name                = var.container_registry_name
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  sku                 = "Basic"
  admin_enabled       = true
}

# Kubernets set up
resource "azurerm_kubernetes_cluster" "k8s" {
  location            = azurerm_resource_group.rg.location
  name                = random_pet.azurerm_kubernetes_cluster_name.id
  resource_group_name = azurerm_resource_group.rg.name
  dns_prefix          = random_pet.azurerm_kubernetes_cluster_dns_prefix.id

  identity {
    type = "SystemAssigned"
  }

  key_vault_secrets_provider {
   secret_rotation_enabled = true
 }

  default_node_pool {
    name       = "agentpool"
    vm_size    = "Standard_D2_v2"
    node_count = var.node_count
  }
  linux_profile {
    admin_username = var.username

    ssh_key {
      key_data = azapi_resource_action.ssh_public_key_gen.output.publicKey
    }
  }
  network_profile {
    network_plugin    = "kubenet"
    load_balancer_sku = "standard"
  }
}

# Attach container registry to kubernetes cluster
resource "azurerm_role_assignment" "ara" {
  principal_id                     = azurerm_kubernetes_cluster.k8s.kubelet_identity[0].object_id
  role_definition_name             = "AcrPull"
  scope                            = azurerm_container_registry.acr.id
  skip_service_principal_aad_check = true
}

# Set up blob storage
resource "azurerm_storage_account" "asa" {
  name                     = var.storage_name
  resource_group_name      = azurerm_resource_group.rg.name
  location                 = azurerm_resource_group.rg.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
}

resource "azurerm_storage_container" "asc" {
  name                  = var.azurerm_storage_container_name
  storage_account_name  = azurerm_storage_account.asa.name
  container_access_type = "private"
}

# Genereate database usernames and passwords
resource "random_pet" "db_username" {
  prefix = var.db_username_prefix
}

resource "random_password" "db_password" {
  length           = 16
  special          = true
  override_special = "!#$%&*()-_=+[]{}<>:?"
}

resource "random_password" "db_root_password" {
  length           = 16
  special          = true
  override_special = "!#$%&*()-_=+[]{}<>:?"
}

# Set up azure key vault
data "azurerm_client_config" "current" {}

resource "azurerm_key_vault" "akv" {
  name                        = var.key_vault_name
  location                    = azurerm_resource_group.rg.location
  resource_group_name         = azurerm_resource_group.rg.name
  enabled_for_disk_encryption = true
  tenant_id                   = data.azurerm_client_config.current.tenant_id
  purge_protection_enabled    = false

  sku_name = "standard"

  access_policy {
    tenant_id = data.azurerm_client_config.current.tenant_id
    object_id = data.azurerm_client_config.current.object_id

    key_permissions = [
      "Create",
      "Get",
      "List",
    ]

    secret_permissions = [
      "Set",
      "List",
      "Get",
      "Delete",
      "Purge",
      "Recover"
    ]

    storage_permissions = [
      "Get",
      "List",
    ]
  }
}

# Set secrets
resource "azurerm_key_vault_secret" "storage_name_secret" {
  name         = var.storage_account_name_secret
  value        = azurerm_storage_account.asa.name
  key_vault_id = azurerm_key_vault.akv.id
}

resource "azurerm_key_vault_secret" "storage_key_secret" {
  name         = var.storage_account_key_secret
  value        = azurerm_storage_account.asa.primary_access_key
  key_vault_id = azurerm_key_vault.akv.id
}

resource "azurerm_key_vault_secret" "storage_container_secret" {
  name         = var.storage_container_name_secret
  value        = azurerm_storage_container.asc.name
  key_vault_id = azurerm_key_vault.akv.id
}

resource "azurerm_key_vault_secret" "db_host_secret" {
  name         = var.db_host_secret
  value        = var.db_host
  key_vault_id = azurerm_key_vault.akv.id
}

resource "azurerm_key_vault_secret" "db_table_secret" {
  name         = var.db_table_secret
  value        = var.db_table
  key_vault_id = azurerm_key_vault.akv.id
}

resource "azurerm_key_vault_secret" "db_username_secret" {
  name         = var.db_username_secret
  value        = random_pet.db_username.id
  key_vault_id = azurerm_key_vault.akv.id
}

resource "azurerm_key_vault_secret" "db_password_secret" {
  name         = var.db_password_secret
  value        = random_password.db_password.result
  key_vault_id = azurerm_key_vault.akv.id
}

resource "azurerm_key_vault_secret" "db_root_password_secret" {
  name         = var.db_root_password_secret
  value        = random_password.db_root_password.result
  key_vault_id = azurerm_key_vault.akv.id
}

resource "azurerm_key_vault_access_policy" "vaultaccess" {
 key_vault_id = azurerm_key_vault.akv.id
 tenant_id    = data.azurerm_client_config.current.tenant_id
 object_id    = azurerm_kubernetes_cluster.k8s.key_vault_secrets_provider[0].secret_identity[0].object_id
 secret_permissions = [
   "Get", "List"
 ]
}

resource "azurerm_role_assignment" "akv_kubelet" {
  scope                = azurerm_key_vault.akv.id
  role_definition_name = "Key Vault Secrets Officer"
  principal_id         = azurerm_kubernetes_cluster.k8s.key_vault_secrets_provider[0].secret_identity[0].object_id
}
