# Deployment

HomePilot has two deploy targets: the Telegram Mini App/backend and a small Cloudflare relay. The Windows agent connects outbound to the relay over WebSocket. No router port forwarding is required.

## 1. Prepare Telegram

1. Create a bot with @BotFather.
2. Enable Telegram Serverless for the bot and obtain its **Serverless CLI access token**. Do not use the ordinary Bot API token as the CLI token.
3. Open the project folder in PowerShell and run:

```powershell
npm install
npx tgcloud login
```

4. Get your numeric Telegram user ID from a trusted ID bot or Telegram client.
5. In `tgcloud/lib/config.js`, set `OWNER_TELEGRAM_ID` to that numeric ID. This is an owner-only personal control panel, not a multi-user service.

## 2. Deploy the relay

Requires a Cloudflare account and Node.js 18+.

```powershell
cd relay
npx wrangler login
npx wrangler secret put AGENT_SECRET
npx wrangler secret put RELAY_SECRET
npx wrangler deploy
```

When prompted, enter two different random secrets, each at least 32 characters. Save them temporarily in a password manager. Cloudflare prints the deployed Worker URL, for example `https://homepilot-relay.<your-subdomain>.workers.dev`.

## 3. Connect Telegram backend to relay

Edit `tgcloud/lib/config.js`:

- `RELAY_URL`: the Worker base URL, without a trailing slash.
- `RELAY_SECRET`: the exact value entered for the Cloudflare `RELAY_SECRET`.
- `OWNER_TELEGRAM_ID`: your numeric Telegram user ID.

These are server-side values, never frontend values. Keep the GitHub repository private if you store the relay secret in this file. Do not paste secrets into chats or screenshots.

## 4. Deploy Mini App and backend

From the project root:

```powershell
npm run build
npx tgcloud status
npx tgcloud diff
npx tgcloud push
npx tgcloud migrate
```

Review the migration plan before confirming it. Use the Mini App URL printed by the CLI in @BotFather to configure the bot's Mini App.

## 5. Install Windows agent

On the Windows PC:

1. Copy `agent/config.example.json` to `agent/config.json`.
2. Set `relay_url` to `wss://<your-worker-host>/agent`.
3. Set `agent_secret` to the exact value entered for Cloudflare `AGENT_SECRET`.
4. Copy `agent/apps.example.json` to `agent/apps.json` and correct any executable paths.
5. Run `agent/start-agent.bat`. Leave it running while testing.
6. Once confirmed, run `agent/install-autostart.ps1` in PowerShell to start at Windows login.

Check relay health by opening `https://<your-worker-host>/health`. It should return JSON with `connected: true` while the agent is running.

## Current implementation limits

Implemented: owner-authenticated Telegram endpoints, command queue, Cloudflare WebSocket relay, Windows outbound agent, allow-listed app launch, media hotkeys, lock, sleep and hibernate.

Not implemented: restart/shutdown, process close/focus, exact volume adjustment, live CPU/RAM/temperature telemetry, multiple PCs, and pairing UI. The app's volume slider and some display elements remain visual placeholders.

This repository has not been built or deployed in the user's environment. Run the build and CLI checks above before applying migrations or exposing the Mini App. Telegram Serverless SDK behavior and Cloudflare Durable Object runtime compatibility still need a real deployment smoke test.
