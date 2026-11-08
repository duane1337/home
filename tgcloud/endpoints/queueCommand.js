import { db } from 'sdk';
import { assertOwner } from '../lib/config.js';
import { commands } from '../schema.js';

const ALLOWED_ACTIONS = new Set([
  'app.launch', 'app.focus', 'app.close', 'app.restart',
  'media.playPause', 'media.next', 'media.previous',
  'media.volume.set', 'media.volume.mute',
  'system.lock', 'system.sleep', 'system.hibernate',
  'system.restart', 'system.shutdown',
]);

export default async function (input, ctx) {
  const user = ctx.initData?.user;
  assertOwner(user);
  if (!input || typeof input.action !== 'string' || !ALLOWED_ACTIONS.has(input.action)) {
    const error = new Error('Unsupported command'); error.code = 'INVALID_COMMAND'; throw error;
  }
  const payload = input.payload ?? {};
  if (typeof payload !== 'object' || payload === null || Array.isArray(payload)) {
    const error = new Error('Command payload must be an object'); error.code = 'INVALID_PAYLOAD'; throw error;
  }
  const id = crypto.randomUUID();
  await db.insert(commands).values({
    id, ownerId: user.id, action: input.action, payload: JSON.stringify(payload),
    status: 'queued', createdAt: Math.floor(Date.now() / 1000),
  }).run();
  return { id, status: 'queued', delivered: false };
}
