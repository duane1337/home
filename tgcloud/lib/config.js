// Set these values before deployment. Never put secrets in frontend code.
export const OWNER_TELEGRAM_ID = 0;
export const RELAY_URL = 'https://REPLACE_WITH_YOUR_WORKER.workers.dev';
export const RELAY_SECRET = 'CONFIGURE_A_LONG_RANDOM_RELAY_SECRET';

export function assertOwner(user) {
  if (!user || !Number.isSafeInteger(user.id) || OWNER_TELEGRAM_ID === 0 || user.id !== OWNER_TELEGRAM_ID) {
    const error = new Error('HomePilot is not configured for this Telegram account');
    error.code = 'OWNER_NOT_CONFIGURED';
    throw error;
  }
}
