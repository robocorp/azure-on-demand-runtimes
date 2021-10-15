# Azure custom cluster example

This example runs on demand runtimes in azure infra for robocorp control room. Using this setup, one can have their robots run in any azure account in a manner where every robot step execution gets it's own virtual machine.
The example consists of three parts, all within their own folder.

- Infrastructure
- Azure VM image
- Controller

To install the whole example succesfully, the components must be installed in this order.

## installation

### Prerequisites

There's some prerequisites to installing this setup. The technology stack is very opinnionated and some amount of tooling needs to be installed.

1. [azure cli](https://docs.microsoft.com/en-us/cli/azure/)
2. [terraform cli](https://learn.hashicorp.com/tutorials/terraform/install-cli)
3. [azure core tools](https://docs.microsoft.com/en-us/azure/azure-functions/functions-run-local)
4. [node and npm](https://nodejs.org/en/download/)
5. [packer](https://learn.hashicorp.com/tutorials/packer/get-started-install-cli)

### overview

All the subfolder installations are documented separately. There's order to follow here though, the infrastructure is the first thing that needs to be run as both the controller and the image depend on that.

The order of installations should therefore be

1. infra
2. image
3. controller

The installation will work independently without any input from the infrastructure setup. The controller setup however does need and input from what the infrastrature installation outputs. The functions application name needs to be passed on from that step to the controller installation.

## Infrastructure

The example has some static resources as well. Those are provided with infrastructure-as-code, using the terraform framework by hashicorp. For the sake of the example, there is no storage configuration for the terraform state, so whenever
`terraform apply` is used to generate the resources, terraform will save the state in local files. For cases where many people would want to operate terraform, a remote state backend is recommended.

### installation

1. run `terraform init`
2. run `terraform apply`

The output of the last command will be useful later and would look something like this:

```
Outputs:

app_name = "cluster-controller-2a7510949e04"
secret = "<random generated password>"
trigger_url = "https://cluster-controller-2a7510949e04.azurewebsites.net/api/trigger"
```

The `app_name` will be needed in this example for installing the controller component.
The `secret` and `trigger_url` will be needed to connect this example to robocorp control room as on demand runtime.

Displaying the secret here is for the convinience of the example and this behavior can be disabled by setting the `show_secret` variable to false either in `variables.tf` or via command line on `terraform apply`.
The secret can be manually changed in the azure vault for maximum security, just make sure that the secret entered into robocorp control room matches what is in the vault.

## Image

The controller provisions virtual machines from a custom azure vm image. This folder contains the setup for constructing that. [Packer](https://www.packer.io/) is used to achieve that here. Basically the folder contains instructions for the packer tool to build the virtual machine image with robocorp agent and chrome installed, the image could be further extended to install custom windows software that is needed for the automation project.

For customization, another option would be to spin this image into a virtual machine up manually, RDP into the machine to install dependencies and then snapshot the VM into a new image and configure the controller to use that instead.

### installation

To build the image

1. replicate example.pkvars.hcl file
2. create azure service principal
   `az ad sp create-for-rbac --query "{ client_id: appId, client_secret: password, tenant_id: tenant }"`
   and fill the <your-file>.pkvars.hcl client_id, client_secret and tenant_id fields according to the response
3. run `az account show --query "{ subscription_id: id }"` and fill the subscription id in the same file
4. run `packer build . -vars <your-file>.pkvars.hcl`

Note that the details in this file are sensitive now, ideally one would not push those into git.

## Controller

The example consists of an azure functions - application, written with typescript, that receives webhook events from control room, for robot lifecycle events. Based on these, the controller will start up and teardown virtual machines and link those into the control room as ephemeral runtimes. The webhook protocol itself is secured with an hmac - signature, based on a secret that this example generates and stores into azure vault.

The basis for the state machine that handles the whole lifecycle between startup and teardown is implemented here using azure durable function. Each robot step run gets it's own orchestration.

The virtual machines themselves are somewhat tricky to get actually running in a fashion where a real user session is available for UI automation.

This example takes the path of first starting the vm and then manipulating windows registry to enable autostart as admin, this allows for UI based automation here. One caveat with this is that the windows user password is saved in registry for the machine, the robot itself can just read it.
The password is randomly generated for each instance run though so it will be rendered useless after the completion.

On another security note, this example does not have a security group tied to the network configuration. Adding one with inbound / outbound networking rules should be doable by terraforming one in and configuring the controller application to associate the dynamically generated Network Interface Cards with this.

### installation

To install the application

1. run `npm install`
2. run `npm run build:production`
3. run `func azure functionapp publish <app_name from terraform installation>`

## Connecting to robocorp control room

Once the three components have been installed, this example can be connected into robocorp control room via **environments** > **on demand runtimes** > **add**
See the robocorp [documentation site](https://docs.robocorp.com) for more details
