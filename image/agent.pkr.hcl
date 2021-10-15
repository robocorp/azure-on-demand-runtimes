source "azure-arm" "agent-source" {
  location                          = var.location
  client_id                         = var.client_id
  client_secret                     = var.client_secret
  communicator                      = "winrm"
  image_offer                       = "WindowsServer"
  image_publisher                   = "MicrosoftWindowsServer"
  image_sku                         = "2019-Datacenter"
  managed_image_name                = var.agent_image_name
  managed_image_resource_group_name = var.installation_name
  os_type                           = "Windows"
  subscription_id                   = var.subscription_id
  tenant_id                         = var.tenant_id
  vm_size                           = "Standard_D2_v2"
  winrm_insecure                    = true
  winrm_timeout                     = "5m"
  winrm_use_ssl                     = true
  winrm_username                    = "packer"
}


build {
  sources = ["source.azure-arm.agent-source"]

  # this script is run on start of the VM lifecycle to ensure robocorp agent is running
  provisioner "file" {
    source = "startup.ps1"
    destination = "C:\\robocorp\\"
  }

  provisioner "file" {
    source = "default_conda.yaml"
    destination = "C:\\robocorp\\"
  }

  # this script provisions the vm image with robocorp agent and related dependencies
  provisioner "powershell" {
    script = "bootstrap.ps1"
  }

  # deprovisioning, this always comes last
  provisioner "powershell" {
    inline = ["Add-WindowsFeature Web-Server", "while ((Get-Service RdAgent).Status -ne 'Running') { Start-Sleep -s 5 }", "while ((Get-Service WindowsAzureGuestAgent).Status -ne 'Running') { Start-Sleep -s 5 }", "& $env:SystemRoot\\System32\\Sysprep\\Sysprep.exe /oobe /generalize /quiet /quit", "while($true) { $imageState = Get-ItemProperty HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Setup\\State | Select ImageState; if($imageState.ImageState -ne 'IMAGE_STATE_GENERALIZE_RESEAL_TO_OOBE') { Write-Output $imageState.ImageState; Start-Sleep -s 10  } else { break } }"]
  }

}
