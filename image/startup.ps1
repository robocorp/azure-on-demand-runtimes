$customData = Get-Content c:\AzureData\CustomData.bin | ConvertFrom-Json
cd c:\robocorp
$token = $customData.RC_WORKER_LINK_TOKEN
$name = $customData.RC_WORKER_NAME
echo "Linking the Agent with name $name"
.\agent.exe link $token --name $name
echo "Linking succeeded"
echo "Starting the Agent..."
.\agent.exe start --log-level TRACE --run-once