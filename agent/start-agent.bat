@echo off
cd /d "%~dp0"
if not exist ".venv\Scripts\python.exe" (
  py -3 -m venv .venv
  if errorlevel 1 exit /b 1
  ".venv\Scripts\python.exe" -m pip install --upgrade pip
  ".venv\Scripts\python.exe" -m pip install -r requirements.txt
  if errorlevel 1 exit /b 1
)
start "HomePilot Local Server" /min ".venv\Scripts\python.exe" -m uvicorn homepilot_server:app --host 127.0.0.1 --port 8765 --no-access-log
