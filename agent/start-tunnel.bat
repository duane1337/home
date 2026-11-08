@echo off
cd /d "%~dp0"
where cloudflared >nul 2>&1
if errorlevel 1 (
  echo cloudflared is not installed. Install it with: winget install --id Cloudflare.cloudflared
  pause
  exit /b 1
)
cloudflared tunnel --url http://127.0.0.1:8765
pause
