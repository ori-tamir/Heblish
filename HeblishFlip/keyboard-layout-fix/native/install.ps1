# Install HeblishFlip native messaging host (Windows keyboard layout switch)
# Run once in PowerShell AS YOUR USER (not necessarily admin):
#   .\install.ps1 -ExtensionId "YOUR_EXTENSION_ID"

param(
    [Parameter(Mandatory = $true)]
    [string]$ExtensionId
)

$HostName = "com.heblish.layout"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$CmdPath = Join-Path $ScriptDir "switch-layout.cmd"
$CmdPath = $CmdPath -replace '\\', '\\'

$Manifest = @{
    name = $HostName
    description = "HeblishFlip keyboard layout switcher"
    path = (Join-Path $ScriptDir "switch-layout.cmd")
    type = "stdio"
    allowed_origins = @(
        "chrome-extension://$ExtensionId/"
    )
} | ConvertTo-Json -Depth 4

$ManifestPath = Join-Path $ScriptDir "host-manifest.json"
$Manifest | Set-Content -Path $ManifestPath -Encoding UTF8

$RegPath = "HKCU:\Software\Google\Chrome\NativeMessagingHosts\$HostName"
New-Item -Path $RegPath -Force | Out-Null
Set-ItemProperty -Path $RegPath -Name "(default)" -Value $ManifestPath

$EdgeRegPath = "HKCU:\Software\Microsoft\Edge\NativeMessagingHosts\$HostName"
New-Item -Path $EdgeRegPath -Force | Out-Null
Set-ItemProperty -Path $EdgeRegPath -Name "(default)" -Value $ManifestPath

Write-Host "Installed native host for extension ID: $ExtensionId"
Write-Host "Manifest: $ManifestPath"
Write-Host ""
Write-Host "Extension ID: open edge://extensions , enable Developer mode, copy ID under HeblishFlip."
Write-Host "Then reload the extension and test Alt+; after converting text."
