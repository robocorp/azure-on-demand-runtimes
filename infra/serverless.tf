data "azurerm_subscription" "current" {

}

locals {
  subscription_id = data.azurerm_subscription.current.subscription_id
  image_id = "${azurerm_resource_group.main_resource_group.id}/providers/Microsoft.Compute/images/robocorpagentvm"
}
resource "azurerm_application_insights" "func_application_insights" {
  name                = "func-application-insights"
  location            = var.location
  resource_group_name = azurerm_resource_group.main_resource_group.name
  application_type    = "Node.JS"
}

resource "azurerm_storage_account" "serverless_storage_account" {
  name                     = "storage${random_id.storage_account_postfix.hex}"
  resource_group_name      = azurerm_resource_group.main_resource_group.name
  location                 = var.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
}


resource "azurerm_app_service_plan" "plan" {
  name                = "func-app-service-plan"
  location            = var.location
  resource_group_name = azurerm_resource_group.main_resource_group.name
  kind                = "FunctionApp"
  reserved = true
  sku {
    tier = "Dynamic"
    size = "Y1"
  }
}



resource "azurerm_function_app" "app" {
  name = "cluster-controller-${random_id.storage_account_postfix.hex}"
  location = azurerm_resource_group.main_resource_group.location
  resource_group_name = azurerm_resource_group.main_resource_group.name
  app_service_plan_id = azurerm_app_service_plan.plan.id
  os_type = "linux"
  app_settings = {
    FUNCTIONS_WORKER_RUNTIME = "node",
    WEBSITE_RUN_FROM_PACKAGE = "1"
    APPINSIGHTS_INSTRUMENTATIONKEY = azurerm_application_insights.func_application_insights.instrumentation_key
    SUBSCRIPTION_ID = local.subscription_id
    VM_RESOURCE_GROUP_NAME = azurerm_resource_group.main_resource_group.name
    REGION = var.location
    CUSTOM_IMAGE_RESOURCE_GROUP_NAME = azurerm_resource_group.main_resource_group.name
    CUSTOM_IMAGE_NAME = "robocorpagentvm"
    CUSTOM_IMAGE_ID = local.image_id
    SUBNET_ID = azurerm_subnet.subnet.id
    STORAGE_ACCOUNT_NAME = azurerm_storage_account.serverless_storage_account.name
    IDENTITY_ID = azurerm_user_assigned_identity.functions_identity.client_id
    VAULT_URI = azurerm_key_vault.cluster_controller_vault.vault_uri
    CONTROLROOM_SECRET_NAME = azurerm_key_vault_secret.trigger_secret.name
  }

  storage_account_name       = azurerm_storage_account.serverless_storage_account.name
  storage_account_access_key = azurerm_storage_account.serverless_storage_account.primary_access_key

  identity {
    type = "UserAssigned"
    identity_ids = [azurerm_user_assigned_identity.functions_identity.id]
  }

  lifecycle {
    ignore_changes = [
      app_settings["WEBSITE_RUN_FROM_PACKAGE"]
    ]
  }
}
