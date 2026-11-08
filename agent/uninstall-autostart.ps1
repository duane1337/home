$ErrorActionPreference = "Stop"
Unregister-ScheduledTask -TaskName "HomePilot Agent" -Confirm:$false -ErrorAction SilentlyContinue
Write-Host "HomePilot Agent autostart removed."
