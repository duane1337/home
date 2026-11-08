export const OWNER_TELEGRAM_ID = 0; // Configure with the owner's numeric Telegram ID before deployment.

export function assertOwner(user) {
  if (!user || !Number.isSafeInteger(user.id) || OWNER_TELEGRAM_ID === 0 || user.id !== OWNER_TELEGRAM_ID) {
    const error = new Error('HomePilot is not configured for this Telegram account');
    error.code = 'OWNER_NOT_CONFIGURED';
    throw error;
  }
}
