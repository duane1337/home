# Architecture Decisions

## 2026-11-08: Initial direction

- Product: private personal Telegram Mini App for controlling one Windows PC.
- UI: React + TypeScript.
- Backend: Node.js service.
- Windows agent: Python, running in the logged-in user's session.
- Communication: outbound persistent connection from agent to backend.
- Initial features: app launch, media controls, volume, power actions, system monitoring, Wake-on-LAN.
- Security: allow-listed operations only; no arbitrary command execution.


## 2026-11-08: Command transport boundary

Telegram Serverless endpoints are authenticated Mini App RPC functions, not general public sockets. Serverless invocations are short-lived. A home PC behind NAT needs an outbound agent connection to a reachable relay or a polling channel. The pure-Serverless-only design has no documented persistent agent transport, so command persistence is implemented separately from delivery. No fake success state will be shown before agent acknowledgement.

Recommended next decision: add a minimal external WebSocket/queue relay, or explicitly accept periodic polling. Current product preference is no periodic polling, so relay is technically sound.
