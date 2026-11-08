import { db, fetch } from 'sdk';
import { eq } from 'sdk/db';
import { assertOwner, RELAY_URL, RELAY_SECRET } from '../lib/config.js';
import { commands } from '../schema.js';

const ALLOWED = new Set([
  'app.launch',
  'media.playPause',
  'media.next',
  'media.previous',
  'media.volume.mute',
  'system.lock',
  'system.sleep',
  'system.hibernate',
]);

export default async function(input, ctx) {
  const user = ctx.initData?.user;
  assertOwner(user);
  if (!input || typeof input.action !== 'string' || !ALLOWED.has(input.action)) {
    throw new Error('Unsupported command');
  }
  const payload = input.payload ?? {};
  if (typeof payload !== 'object' || payload === null || Array.isArray(payload)) {
    throw new Error('Invalid payload');
  }
  if (input.action === 'app.launch' && (typeof payload.app_id !== 'string' || !/^[a-z0-9_-]{1,40}$/i.test(payload.app_id))) {
    throw new Error('Invalid application ID');
  }

  const id = crypto.randomUUID();
  const now = Math.floor(Date.now() / 1000);
  await db.insert(commands).values({
    id, ownerId: user.id, action: input.action,
    payload: JSON.stringify(payload), status: 'queued', createdAt: now,
  }).run();

  if (RELAY_URL.includes('REPLACE_') || RELAY_SECRET.startsWith('CONFIGURE_')) {
    return { id, status: 'queued', delivered: false, reason: 'RELAY_NOT_CONFIGURED' };
  }
  try {
    const response = await fetch(RELAY_URL + '/command', {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: 'Bearer ' + RELAY_SECRET },
      body: JSON.stringify({ id, action: input.action, payload, issued_at: now, expires_at: now + 60 }),
    });
    if (!response.ok) {
      return { id, status: 'queued', delivered: false, reason: response.status === 503 ? 'AGENT_OFFLINE' : 'RELAY_REJECTED' };
    }
    await db.update(commands).set({ status: 'sent' }).where(eq(commands.id, id)).run();
    return { id, status: 'sent', delivered: true };
  } catch {
    return { id, status: 'queued', delivered: false, reason: 'RELAY_UNAVAILABLE' };
  }
}
