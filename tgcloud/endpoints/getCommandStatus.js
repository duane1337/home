import { db, fetch } from 'sdk';
import { eq, and } from 'sdk/db';
import { assertOwner, RELAY_URL, RELAY_SECRET } from '../lib/config.js';
import { commands } from '../schema.js';

export default async function(input, ctx) {
  const user = ctx.initData?.user;
  assertOwner(user);
  if (typeof input?.id !== 'string') throw new Error('Command ID required');
  const row = await db.select().from(commands)
    .where(and(eq(commands.id, input.id), eq(commands.ownerId, user.id))).get();
  if (!row) throw new Error('Command not found');

  if (row.status === 'sent' && !RELAY_URL.includes('REPLACE_') && !RELAY_SECRET.startsWith('CONFIGURE_')) {
    try {
      const response = await fetch(RELAY_URL + '/ack?id=' + encodeURIComponent(row.id), {
        headers: { authorization: 'Bearer ' + RELAY_SECRET },
      });
      if (response.ok) {
        const ack = await response.json();
        await db.update(commands).set({
          status: ack.status === 'completed' ? 'completed' : 'failed',
          completedAt: ack.completed_at || Math.floor(Date.now() / 1000),
          result: JSON.stringify(ack.result || { error: ack.error || null }),
        }).where(eq(commands.id, row.id)).run();
        return { id: row.id, action: row.action, status: ack.status, createdAt: row.createdAt, completedAt: ack.completed_at || null, result: ack.result || null, error: ack.error || null };
      }
    } catch {}
  }
  return { id: row.id, action: row.action, status: row.status, createdAt: row.createdAt, completedAt: row.completedAt, result: row.result ? JSON.parse(row.result) : null };
}
