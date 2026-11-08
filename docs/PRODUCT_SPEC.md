# HomePilot — Product Specification

## Product goal

A private Telegram Mini App used as a remote control panel for one Windows PC. The primary use case is opening the app on an iPhone while away from home and launching or controlling desktop applications.

## UX direction

- Dark Minimalism.
- Near-black background, graphite surfaces, muted gray text, restrained burgundy accent.
- Mobile-first layout, optimized for Telegram on iPhone.
- Practical information hierarchy and large touch targets.
- Moderate customization only: accent color and font selection.
- Suggested navigation: Home, Apps, Media, System, Settings.

## Functional scope

### Applications
- Preconfigured app catalog with Spotify, Steam, Discord, Chrome, Telegram, File Explorer and user-added apps.
- User can add an app with display name, executable path and optional icon.
- Favorites appear on the Home screen.
- Actions: launch/focus, close, restart.
- Launch behavior: if app is not running, launch it; if running, try to focus its window. Avoid duplicate launches where practical.
- App status is queried on demand when the Apps view is opened or refreshed, not continuously.

### Media
- Play/pause, next, previous.
- System volume up/down/set and mute.
- Read current media session metadata and artwork when Windows exposes it.
- Support the active Windows media session first; session selection can be added if needed.

### Power
- Lock, sleep, hibernate, restart and shutdown.
- Destructive actions require confirmation in the Mini App.
- All actions are allow-listed; no arbitrary shell command execution.

### Monitoring
- Deferred. No continuous collection or polling in the initial release.
- Consider on-demand status later.

### Wake-on-LAN
- User already has Wake-on-LAN configured.
- Integration can be considered after core controls. If the PC is fully off, a local agent cannot receive commands; WOL requires a separate reachable sender or existing external mechanism.

## Architecture constraints and open validation

- Mini App frontend: React + TypeScript, hosted at an HTTPS origin and opened through Telegram.
- Windows agent: Python, starts at user logon and runs in the interactive user session.
- Cloud-side bot/API logic: use the serverless platform shown by the user, subject to verifying its exact product name, deployment model, storage and networking capabilities.
- The phrase "Telegram servers" must not be treated as proof that Telegram itself hosts arbitrary backend code. Telegram Mini Apps are the client surface; the actual hosting/runtime provider must be identified.
- Remote command delivery must work through NAT without router port forwarding.
- Preferred command delivery: event-driven long-poll request held open by the Windows agent, or a supported push channel if the selected platform supports it. Do not implement a tight one-second polling loop.
- Agent makes outbound HTTPS requests only. Commands are authenticated, short-lived, uniquely identified and acknowledged.
- If the cloud platform cannot expose a durable queue or long-poll endpoint, revise the transport before implementation.

## Security
- Verify Telegram Mini App init data on the trusted backend.
- Bind access to the owner's Telegram user ID.
- Authenticate each Windows agent installation with a revocable per-device secret.
- Keep bot tokens and agent secrets out of Git and frontend bundles.
- Strict command allow-list and schema validation.
- No arbitrary PowerShell, cmd.exe or shell endpoint.
- Confirmation for shutdown/restart.
- Rate limits, expiry timestamps, unique command IDs and replay protection.
- TLS for all public network traffic.

## Initial release acceptance criteria
- Mini App opens inside Telegram on iPhone.
- Owner-only access is enforced.
- Windows agent starts automatically after user logon.
- User can launch, focus, close and restart configured apps.
- User can control media playback and system volume.
- User can lock, sleep, hibernate, restart and shut down with appropriate confirmation.
- Agent performs no continuous hardware-statistics collection.
- No inbound router port forwarding is required.
- Setup and recovery steps are documented.
