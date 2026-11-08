# HomePilot command transport

## Implemented

The Telegram Serverless backend can authenticate a Mini App caller, validate an allow-listed command, persist it in SQLite, and return a command ID. The Mini App can read that command status.

## Critical transport constraint

Telegram Serverless modules execute on demand in short-lived V8 isolates. They are not a daemon and cannot keep a permanent socket open to a home PC. Mini App endpoints are invoked through Telegram's authenticated Mini App RPC mechanism; they are not a general public endpoint for an arbitrary Windows agent.

A Windows PC behind a home NAT cannot receive an unsolicited inbound connection without a reachable relay or an outbound connection initiated by the agent. Telegram Serverless alone does not provide a documented persistent agent channel.

## Delivery options

1. Small external relay (recommended): a minimal WebSocket/queue relay. The Windows agent maintains one outbound connection. Telegram Serverless enqueues commands to the relay using authenticated outbound HTTP. No router port forwarding and no frequent polling.
2. Long polling against a dedicated relay endpoint: the agent holds one HTTPS request open. This still requires a reachable endpoint that supports long-running requests.
3. Periodic polling: simplest, but not selected because the owner asked to avoid continuous polling.

A command must remain queued until the agent acknowledges it. Inserting it into the database is not execution.

## Current status

- Owner authentication scaffolded; owner ID is unset (0), so calls fail closed.
- Command allow-list and queue persistence implemented.
- Command status lookup implemented.
- Agent delivery and acknowledgement intentionally deferred until transport is selected.
- Do not deploy until owner ID is configured and runtime tests pass.
