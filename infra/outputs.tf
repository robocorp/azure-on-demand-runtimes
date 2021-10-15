output "app_name" {
  value = azurerm_function_app.app.name
}

output "trigger_url" {
  value = "https://${azurerm_function_app.app.default_hostname}/api/trigger"
}

output "secret" {
  value = var.show_secret ? nonsensitive(azurerm_key_vault_secret.trigger_secret.value) : "<redacted>"
}