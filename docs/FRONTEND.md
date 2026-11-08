# Frontend

The initial Mini App is a mobile-first React + TypeScript + Vite shell.

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Current state

The UI currently uses local mock state. Buttons intentionally report that the Windows agent is not connected. No real Windows commands are sent yet.

Telegram WebApp initialization is wired through `@twa-dev/sdk`. Production deployment requires an HTTPS origin configured in the Telegram Mini App settings.

## Next integration steps

1. Confirm the exact serverless provider and its CLI/runtime documentation.
2. Implement authenticated backend endpoints and command queue.
3. Implement Windows agent pairing and outbound command retrieval.
4. Replace mock actions with typed API calls.
