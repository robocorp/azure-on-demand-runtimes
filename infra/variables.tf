variable "location" {
  type = string
  default = "eastus"
}

variable "installation_name" {
  type = string
  default = "rcr-custom-cluster"
}

variable "agent_image_name" {
  type = string
  default = "robocorpagentvm"
}

variable "show_secret" {
  type = bool
  default = true
}