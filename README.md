# HomePilot

Telegram Mini App for controlling one Windows PC remotely.

The project uses Telegram Serverless for the Mini App/backend, a Cloudflare Worker + Durable Object as a WebSocket relay, and a Python agent running in the logged-in Windows session. The PC agent connects outbound, so no router port forwarding is needed.

## Implemented

- Dark responsive Telegram Mini App: Home, Apps, Media, System and Settings.
- Telegram-authenticated owner-only endpoints and SQLite command queue.
- Cloudflare relay with authenticated agent WebSocket and command acknowledgements.
- Windows agent: allow-listed app launch, media hotkeys, master volume, lock, sleep and hibernate.
- Windows startup task scripts.

## Quick setup

Follow [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) in order. You need Node.js 18+, a Telegram bot with Serverless enabled, a Cloudflare account, Python 3.11+ on the Windows PC, and two separate random secrets.

## Security

- The backend checks the Telegram user ID against the configured owner ID.
- The agent accepts only explicit actions; arbitrary shell execution is not supported.
- Keep the GitHub repository private if you place the relay shared secret in `tgcloud/lib/config.js`.
- Never commit `agent/config.json`, `agent/apps.json`, Cloudflare credentials or Telegram credentials.

## Known limits

Restart/shutdown, process focus/close, telemetry, multi-PC support and a pairing UI are not implemented. The app has not been built or deployed in the user's environment yet. Run the documented build and smoke tests before relying on it.
