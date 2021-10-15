variable "installation_name" {
  type = string
  default = "rcr-custom-cluster"
}

variable "location" {
  type = string
  default = "eastus"
}

variable "agent_image_name" {
  type = string
  default = "robocorpagentvm"
}

variable "client_id" {
  type = string
}

variable "client_secret" {
  type = string
}

variable "subscription_id" {
  type = string
}

variable "tenant_id" {
  type = string
}