$ErrorActionPreference = "Stop"
$Repo = "INCONNU-BOY-SENSEI/skyhost"
$Ref = if ($env:SKYHOST_VERSION) { $env:SKYHOST_VERSION } else { "main" }
$Dir = if ($env:SKYHOST_INSTALL_DIR) { $env:SKYHOST_INSTALL_DIR } else { Join-Path $HOME ".skyhost\bin" }
$Url = "https://raw.githubusercontent.com/$Repo/$Ref/cli/dist/skyhost.js"

Write-Host "SKYHOST CLI installer" -ForegroundColor DarkYellow

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  throw "Node.js 18 or newer is required. Install it from https://nodejs.org and run this again."
}
$major = [int](node -p "process.versions.node.split('.')[0]")
if ($major -lt 18) { throw "Node.js 18 or newer is required (found $(node -v))." }

New-Item -ItemType Directory -Force -Path $Dir | Out-Null
$Js = Join-Path $Dir "skyhost.js"
Invoke-WebRequest -UseBasicParsing -Uri $Url -OutFile $Js
Set-Content -Path (Join-Path $Dir "skyhost.cmd") -Value "@echo off`r`nnode `"%~dp0skyhost.js`" %*" -Encoding ASCII

$userPath = [Environment]::GetEnvironmentVariable("Path", "User")
if (-not ($userPath -split ";" | Where-Object { $_ -eq $Dir })) {
  [Environment]::SetEnvironmentVariable("Path", "$userPath;$Dir", "User")
  $env:Path = "$env:Path;$Dir"
  Write-Host "Added $Dir to your PATH (open a new terminal to use it everywhere)."
}

$version = node $Js --version
Write-Host "Installed skyhost $version to $Dir" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:"
Write-Host "  skyhost login      # approve this device in your browser"
Write-Host "  skyhost init       # deploy the current folder"
Write-Host ""
Write-Host "Docs: https://github.com/$Repo  ·  Dashboard: https://skyhost.tech"
