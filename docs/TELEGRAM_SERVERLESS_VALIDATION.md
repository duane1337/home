# Telegram Serverless integration notes

Verified against Telegram Serverless documentation retrieved 2026-11-08.

## Confirmed platform model

- Project code is deployed from `tgcloud/schema.js`, `tgcloud/lib/*.js`, `tgcloud/handlers/*.js`, and `tgcloud/endpoints/*.js`.
- The Mini App frontend build is deployed together with the serverless project. Vite `dist` is the expected build output.
- Mini App calls serverless endpoints through `Telegram.WebApp.Serverless.call(endpointName, input, callback)`; the platform validates Mini App init data and exposes the validated user in endpoint context.
- Serverless modules execute on demand in short-lived V8 isolates. They have built-in SQLite, Bot API access, and outbound HTTP, but no persistent process or inbound socket listener.
- CLI workflow is `npm create @tgcloud/bot .`, then configure `tgcloud.jsonc`, build, and `npx tgcloud push` (or the generated deploy script). Database schema changes require `npx tgcloud migrate`.

## Implications for HomePilot

The current repository's backend modules are scaffolding only and must be validated against the actual CLI-generated SDK contract before deployment. In particular, do not assume generic ORM methods or import paths without checking the CLI's generated sample and SDK reference.

The platform does not provide a persistent socket from the cloud to a home Windows machine. For command delivery without frequent polling, the Windows agent needs a separate outbound persistent channel to a reachable relay. Telegram Serverless can call external HTTP services, but the relay is a distinct component and is not automatically supplied by Telegram Serverless.

## Next implementation sequence

1. Align the project with the official `tgcloud` CLI scaffold and config format.
2. Replace placeholder frontend API wiring with `Telegram.WebApp.Serverless.call`.
3. Validate SQLite schema and endpoint examples with the CLI's local `run` and `migrate` commands.
4. Decide on a minimal relay only after comparing the user's strict no-polling requirement with operational cost and complexity.
5. Implement agent authentication and acknowledgement before showing any command as executed.

## Security

- The validated `ctx.initData.user` is the identity source in an endpoint; do not trust client-supplied user IDs.
- Configure a single owner Telegram ID and fail closed until configured.
- Never expose bot tokens or agent credentials in Vite `VITE_*` variables.
- Commands remain allow-listed and must be acknowledged by the Windows agent before marked successful.
