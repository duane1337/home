$ErrorActionPreference = "Stop"
$AgentDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$Python = Join-Path $AgentDir ".venv\Scripts\pythonw.exe"
if (-not (Test-Path $Python)) {
  Write-Host "Run start-agent.bat once first so the virtual environment and dependencies are installed."
  exit 1
}
$Script = Join-Path $AgentDir "homepilot_agent.py"
$Action = New-ScheduledTaskAction -Execute $Python -Argument ('"' + $Script + '"') -WorkingDirectory $AgentDir
$Trigger = New-ScheduledTaskTrigger -AtLogOn
$Settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -ExecutionTimeLimit (New-TimeSpan -Days 0)
Register-ScheduledTask -TaskName "HomePilot Agent" -Action $Action -Trigger $Trigger -Settings $Settings -Description "HomePilot Windows control agent" -Force | Out-Null
Write-Host "HomePilot Agent will start when this Windows user logs in."
