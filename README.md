# HomePilot

Telegram Mini App for controlling one Windows PC through a lightweight local server.

## Architecture
- React/Vite Telegram Mini App hosted by Telegram Serverless static hosting.
- FastAPI server runs on the Windows PC and listens only on 127.0.0.1:8765.
- Cloudflare Quick Tunnel provides an HTTPS route to the local server. No router port forwarding.
- Every API request includes Telegram Mini App initData. The server verifies its HMAC signature using the BotFather Bot API token and checks the configured owner Telegram ID.

## Windows setup
See [agent/README.md](agent/README.md). In short: configure agent/config.json with the Bot API token and owner ID, start the local server, start cloudflared, then paste the trycloudflare URL into HomePilot Settings.

## Security
- Never bind the API to 0.0.0.0 or expose port 8765 directly.
- Keep agent/config.json and agent/apps.json private.
- The API only supports allow-listed app launches, media keys/volume, lock, sleep and hibernate. It has no arbitrary shell endpoint.
- Quick Tunnel URLs change after restart; update the URL in Mini App Settings.

## Performance
The server is event-driven and idle between requests. It does not poll or keep a WebSocket open. Actual RAM/CPU usage depends on Python and Windows audio libraries and should be measured on the target PC.
