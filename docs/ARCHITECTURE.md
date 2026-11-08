# Architecture

## Components

1. **Telegram Mini App** — React UI opened inside Telegram.
2. **Backend** — validates Telegram identity, authorizes requests, stores app configuration, and routes commands.
3. **Windows Agent** — runs in the signed-in Windows user session and performs a fixed set of allow-listed actions.
4. **Wake-on-LAN** — backend sends a magic packet to the configured PC when requested.

## Connectivity

The Windows agent establishes an outbound authenticated connection to the backend. The home router does not need inbound port forwarding.

The Mini App never connects directly to the Windows PC.

## Security requirements

- Validate Telegram Mini App init data on the backend using Telegram's documented signature procedure.
- Bind the account to an explicitly configured Telegram user ID.
- Authenticate the Windows agent with a per-installation secret; store secrets outside the repository.
- Use TLS for production traffic.
- Use a strict command allow-list. Never expose arbitrary PowerShell, cmd.exe, or shell execution.
- Validate every command payload on the backend and agent.
- Require confirmation for destructive power actions.
- Rate-limit commands and reject replayed or expired requests.
- Do not log bot tokens, agent secrets, or Telegram init data.

## Initial command groups

- App launch: fixed application identifiers mapped to local executable paths on the PC.
- Media: play/pause, next, previous.
- Volume: set or adjust system volume, mute.
- Power: lock, sleep, restart, shutdown.
- Monitoring: CPU, memory, disk, GPU where available, uptime.
- Wake: Wake-on-LAN via backend.

## Important Windows detail

The agent must run in the interactive user's session to launch desktop applications and control media sessions. It should be installed as a user-level startup task, not as a non-interactive Windows service.
