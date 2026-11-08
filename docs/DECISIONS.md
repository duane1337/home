# Architecture Decisions

## 2026-11-08: Initial direction

- Product: private personal Telegram Mini App for controlling one Windows PC.
- UI: React + TypeScript.
- Backend: Node.js service.
- Windows agent: Python, running in the logged-in user's session.
- Communication: outbound persistent connection from agent to backend.
- Initial features: app launch, media controls, volume, power actions, system monitoring, Wake-on-LAN.
- Security: allow-listed operations only; no arbitrary command execution.
