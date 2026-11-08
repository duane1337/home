import { table, integer, text } from 'sdk/db';

export const commands = table('commands', {
  id: text('id').primaryKey(),
  ownerId: integer('owner_id').notNull(),
  action: text('action').notNull(),
  payload: text('payload').notNull(),
  status: text('status').notNull().default('queued'),
  createdAt: integer('created_at').notNull(),
  completedAt: integer('completed_at'),
  result: text('result'),
});
