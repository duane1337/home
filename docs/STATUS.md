# HomePilot development status

Last updated: 2026-11-08

## Implemented in repository

- React/Vite Telegram Mini App with Home, Apps, Media, System and Settings.
- Telegram Serverless RPC bridge using the documented promise-based endpoint call.
- Owner-authenticated endpoints and SQLite command queue.
- Cloudflare Worker + Durable Object WebSocket relay with agent authentication and acknowledgement lookup.
- Python Windows agent with reconnect/backoff, allow-listed app launch, media hotkeys, master volume, lock, sleep and hibernate.
- Windows first-run batch launcher and Task Scheduler install/uninstall scripts.
- Deployment guide for Telegram, Cloudflare and Windows.

## Required before deployment

- Set the owner Telegram numeric ID in `tgcloud/lib/config.js`.
- Deploy the Cloudflare Worker and create separate `AGENT_SECRET` and `RELAY_SECRET` secrets.
- Set `RELAY_URL` and `RELAY_SECRET` in the server-side `tgcloud/lib/config.js`.
- Configure local `agent/config.json` and `agent/apps.json`.
- Run `npm run build`, inspect `npx tgcloud diff`, then deploy and migrate.
- Perform a real Telegram-to-Windows smoke test.

## Not implemented

Restart/shutdown, process focus/close, live CPU/RAM/temperature telemetry, multiple PCs, a guided pairing UI, and robust confirmation flows for destructive actions.

No production credentials or deployment have been created from this repository. The repository changes have not been built or runtime-tested in the user's environment.
