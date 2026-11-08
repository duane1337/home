# HomePilot Local Deployment

## 1. Update the Mini App
From the project root:
```powershell
npm install
npm run build
npx tgcloud push
```
The Telegram Serverless backend and Cloudflare Worker relay are no longer used. Telegram hosting is only used for the static Mini App files.

## 2. Configure the Windows server
Install Python 3.11+ and cloudflared:
```powershell
winget install --id Cloudflare.cloudflared
```
Copy `agent/config.example.json` to `agent/config.json`. Set:
- `bot_token`: the ordinary Bot API token from @BotFather (not the Serverless CLI token).
- `owner_id`: your numeric Telegram user ID.

Copy `agent/apps.example.json` to `agent/apps.json` and verify the executable paths.

Run `agent/start-agent.bat`. It installs the small Python dependencies on first run and starts the server minimized on 127.0.0.1:8765.

## 3. Start the HTTPS tunnel
Run `agent/start-tunnel.bat` in a second terminal. Copy the HTTPS URL ending in `.trycloudflare.com`.

In Telegram, open HomePilot -> Settings -> HomePilot server URL. Paste the URL and leave the field (blur) to save and test the connection.

Quick Tunnel URLs are temporary and change when the tunnel is restarted. Update the URL in Settings after each restart. For a permanent URL, configure a named Cloudflare Tunnel with a domain you control.

## Security model
The local server validates Telegram initData cryptographically on every request, checks its age and restricts access to the owner ID. The server binds only to loopback. Do not share the Bot API token or config.json. Do not expose port 8765 directly.

## Supported commands
Allow-listed app launch, media play/pause/next/previous/mute, master volume, Windows lock, sleep and hibernate. Restart/shutdown and arbitrary shell execution are intentionally not exposed.
