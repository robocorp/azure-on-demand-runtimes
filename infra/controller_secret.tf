
data "azurerm_client_config" "current" {}


resource "azurerm_key_vault" "cluster_controller_vault" {
  name                        = "vault-${random_id.storage_account_postfix.hex}"
  location                    = azurerm_resource_group.main_resource_group.location
  resource_group_name         = azurerm_resource_group.main_resource_group.name
  enabled_for_disk_encryption = true
  tenant_id                   = data.azurerm_client_config.current.tenant_id
  soft_delete_retention_days  = 7
  purge_protection_enabled    = false
  # could use premium here to get hardware protected HSM (Hardware Security Model) protected keys
  sku_name = "standard"
}

resource "azurerm_key_vault_access_policy" "manual_permissions" {
  key_vault_id = azurerm_key_vault.cluster_controller_vault.id
  tenant_id = data.azurerm_client_config.current.tenant_id
  object_id = data.azurerm_client_config.current.object_id

  key_permissions = [
    "create",
    "get",
    "list"
  ]

  secret_permissions = [
    "set",
    "get",
    "delete",
    "purge",
    "recover",
    "list",
  ]
}

resource "azurerm_key_vault_access_policy" "functions_app_permissions" {
  key_vault_id = azurerm_key_vault.cluster_controller_vault.id
  tenant_id = data.azurerm_client_config.current.tenant_id
  object_id = azurerm_user_assigned_identity.functions_identity.principal_id
  secret_permissions = [
    "get"
  ]
}

resource "azurerm_key_vault_secret" "trigger_secret" {
  name         = "trigger-secret"
  value        = "password1"
  key_vault_id = azurerm_key_vault.cluster_controller_vault.id

  lifecycle {
    ignore_changes = [
      value,
      version
    ]
  }
  
  depends_on = [
    azurerm_key_vault_access_policy.manual_permissions
  ]
}

