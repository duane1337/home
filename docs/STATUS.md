# HomePilot development status

Last updated: 2026-11-08

## Implemented in repository

- React/Vite Mini App UI scaffold with Home, Apps, Media, System, Settings.
- Typed Telegram Serverless frontend bridge.
- Telegram Serverless endpoint modules and SQLite command queue.
- Cloudflare Worker + Durable Object WebSocket relay prototype.
- Python Windows Agent prototype with allow-listed app launch, media keys, lock, sleep and hibernate.
- Setup documentation and example configuration files.

## Not yet ready for deployment

- Validate all endpoint/schema modules with the official CLI.
- Owner Telegram numeric ID is intentionally unset; backend fails closed.
- Relay needs Cloudflare account deployment and two secrets configured.
- Relay URL and relay secret must be set in the Serverless endpoint.
- Agent needs local config and application paths.
- Agent acknowledgements must be written back to the Serverless database.
- UI actions are not all wired to the API yet.
- Installer, Task Scheduler autostart, Windows process focus/close/restart, exact volume, and safe confirmation flow are pending.

No production credentials or deployments have been created from this repository.
