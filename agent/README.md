# HomePilot Local Server

HomePilot now uses a small FastAPI server on the Windows PC. It has no polling loop and listens only on 127.0.0.1:8765. Use Cloudflare Tunnel for HTTPS access; never expose port 8765 directly to the internet.

## Setup
1. Install Python 3.11+ and cloudflared (winget install --id Cloudflare.cloudflared).
2. Copy config.example.json to config.json. Set the BotFather Bot API token and your numeric Telegram user ID.
3. Copy apps.example.json to apps.json and verify executable paths.
4. Run start-agent.bat. This starts the API minimized in the background.
5. In another terminal run start-tunnel.bat. Copy the https://*.trycloudflare.com URL it prints.
6. Open HomePilot in Telegram, go to Settings, paste that URL into HomePilot server URL, and blur/save the field.

## Security
The server validates Telegram Mini App initData with the Bot API token and enforces the configured owner ID. Keep config.json private. The API binds to localhost only; Cloudflare Tunnel provides the public HTTPS route. Quick Tunnel URLs change when restarted, so update the URL in Settings after each restart.

## Commands
Allow-listed app launch, media hotkeys, master volume, lock, sleep and hibernate. No arbitrary shell command endpoint exists.
