# HomePilot

A Telegram Mini App for controlling a Windows PC remotely.

## Project status

Early development. See [docs/ROADMAP.md](docs/ROADMAP.md).

## Planned architecture

- `apps/web`: Telegram Mini App (React + TypeScript)
- `apps/api`: backend API and Telegram integration
- `apps/agent`: Windows desktop agent
- `packages/shared`: shared types and protocol definitions
- `docs`: architecture, setup, and security documentation

## Core principles

- No arbitrary shell execution from the Mini App.
- Every action is authenticated and allow-listed.
- The Windows agent initiates outbound connections; no router port-forwarding required.
- Sensitive configuration stays out of Git.
