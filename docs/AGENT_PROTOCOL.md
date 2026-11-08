# Windows Agent Protocol

## Goal

Deliver commands from the Telegram Serverless Mini App to one Windows PC without inbound router ports and without a tight periodic polling loop.

## Proposed transport

Use a small outbound WebSocket relay as a separate, minimal component:

- Windows Agent opens one outbound WSS connection to the relay after Windows user logon.
- Agent authenticates using a per-device secret and receives a server-issued short-lived session.
- Telegram Serverless endpoint validates the Mini App user and command, then sends the command to the relay over HTTPS.
- Relay forwards the command over the existing WebSocket.
- Agent validates the command schema and allow-listed action, executes it, and acknowledges with the command ID.
- Relay stores the acknowledgement briefly; the Mini App asks Telegram Serverless for the final command state.

No port forwarding is needed. The relay is not a full application backend: no user UI, no business logic, and no long-term user database.

## Message envelope

```json
{
  "id": "uuid",
  "issued_at": 1794140000,
  "expires_at": 1794140060,
  "action": "app.launch",
  "payload": { "app_id": "spotify" }
}
```

Agent acknowledgement:

```json
{
  "id": "same-command-uuid",
  "status": "succeeded",
  "result": { "message": "Application launched" }
}
```

## Reliability and safety

- Commands expire quickly (default 60 seconds).
- Agent rejects unknown actions and malformed payloads.
- Destructive power actions require explicit UI confirmation.
- Relay authenticates both the Telegram Serverless caller and the Windows agent.
- Agent secret is stored outside the repository and can be rotated.
- Duplicate command IDs are idempotent; do not execute twice.
- A command is not marked successful until the agent acknowledges it.
- WebSocket reconnect uses exponential backoff with jitter, not rapid polling.

## Why a relay is required

Telegram Serverless functions run on demand and finish after returning. They cannot maintain an always-open connection to the home PC. A home PC behind NAT also cannot accept unsolicited inbound connections. An outbound persistent connection from the agent to a reachable relay resolves both constraints without a continuously repeated polling request.
