import { db } from 'sdk';
import { eq, and } from 'sdk/db';
import { assertOwner } from '../lib/config.js';
import { commands } from '../schema.js';

export default async function (input, ctx) {
  const user = ctx.initData?.user;
  assertOwner(user);
  if (typeof input?.id !== 'string') { const error = new Error('Command ID is required'); error.code = 'INVALID_INPUT'; throw error; }
  const row = await db.select().from(commands).where(and(eq(commands.id, input.id), eq(commands.ownerId, user.id))).get();
  if (!row) { const error = new Error('Command not found'); error.code = 'NOT_FOUND'; throw error; }
  return { id: row.id, action: row.action, status: row.status, createdAt: row.createdAt, completedAt: row.completedAt, result: row.result ? JSON.parse(row.result) : null };
}
