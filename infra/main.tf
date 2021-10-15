provider "azurerm" {
  features {

  }
}

resource  "azurerm_resource_group" "main_resource_group" {
  name = "${var.installation_name}"
  location = var.location
}

resource "random_id" "storage_account_postfix" {
  byte_length = 6
}