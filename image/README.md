az group create -n robocorp-agent -l eastus
az ad sp create-for-rbac --query "{ client_id: appId, client_secret: password, tenant_id: tenant }"
