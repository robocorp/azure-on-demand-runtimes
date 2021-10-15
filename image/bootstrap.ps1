# install chrome
# taken from https://www.snel.com/support/install-chrome-in-windows-server/
$LocalTempDir = $env:TEMP; $ChromeInstaller = "ChromeInstaller.exe"; (new-object    System.Net.WebClient).DownloadFile('http://dl.google.com/chrome/install/375.126/chrome_installer.exe', "$LocalTempDir\$ChromeInstaller"); & "$LocalTempDir\$ChromeInstaller" /silent /install; $Process2Monitor =  "ChromeInstaller"; Do { $ProcessesFound = Get-Process | ?{$Process2Monitor -contains $_.Name} | Select-Object -ExpandProperty Name; If ($ProcessesFound) { "Still running: $($ProcessesFound -join ', ')" | Write-Host; Start-Sleep -Seconds 2 } else { rm "$LocalTempDir\$ChromeInstaller" -ErrorAction SilentlyContinue -Verbose } } Until (!$ProcessesFound)

# allow long paths, needed for RCC to function
Set-ItemProperty 'HKLM:\System\CurrentControlSet\Control\FileSystem' -Name 'LongPathsEnabled' -value 1

# download the agent
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
cd C:\robocorp
Invoke-WebRequest -Uri https://downloads.robocorp.com/workforce-agent-core/releases/latest/windows64/robocorp-workforce-agent-core.exe -OutFile agent.exe

# run agent initialization
# this downloads RCC among other things
.\agent.exe init

.\rcc.exe holotree variables --space workforce --controller agent.core.container --liveonly --timeline .\default_conda.yaml