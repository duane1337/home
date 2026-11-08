# Development and deployment

## Local frontend

Requires Node.js 18 or newer.

```bash
npm install
npm run dev
npm run build
```

## Telegram Serverless

1. Create a bot with @BotFather.
2. In @BotFather, open the bot's Serverless section and enable Serverless.
3. Use the separate Serverless CLI Access token (not the Bot API token).
4. From the project folder, run `npx tgcloud login`.
5. Review `npx tgcloud status` and `npx tgcloud diff`.
6. Build and deploy with `npm run deploy`.
7. Apply reviewed database changes with `npx tgcloud migrate`.
8. Set the resulting Mini App URL in @BotFather.

Never commit the CLI access token, bot token, relay secret, or Windows agent secret. CLI credentials belong in the ignored `.tgcloud/` directory.

## Current blockers

- The owner Telegram numeric ID must be configured in the server-side owner configuration.
- The Windows agent relay has not yet been deployed.
- No production deployment has been performed from this repository.
- The endpoint SDK examples must be validated with the tgcloud CLI version installed locally before production migration.
