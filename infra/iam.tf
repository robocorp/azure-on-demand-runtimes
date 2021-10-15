resource "azurerm_user_assigned_identity" "functions_identity" {
  resource_group_name = azurerm_resource_group.main_resource_group.name
  location            = azurerm_resource_group.main_resource_group.location
  name = "custom-cluster-identity"
}

resource "azurerm_role_assignment" "assignment" {
  scope                = azurerm_resource_group.main_resource_group.id
  role_definition_name = "Contributor"
  principal_id         = azurerm_user_assigned_identity.functions_identity.principal_id
}