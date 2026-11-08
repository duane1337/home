# HomePilot Relay
Cloudflare Worker + Durable Object transport relay. It holds one outbound WebSocket from the Windows agent and forwards allow-listed commands from Telegram Serverless.

## Configure and deploy
```bash
npm install -g wrangler
npx wrangler login
npx wrangler secret put AGENT_SECRET
npx wrangler secret put RELAY_SECRET
npx wrangler deploy
```
Use separate long random values for both secrets. Set the same agent secret in the agent's local config and the relay secret in the Serverless endpoint. Never commit secrets.

Routes: `GET /health`, `GET /agent` (authenticated WebSocket), `POST /command` (authenticated command ingress), `GET /ack?id=...` (authenticated acknowledgement lookup).
