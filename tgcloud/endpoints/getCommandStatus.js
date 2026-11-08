import { db } from 'sdk';
import { eq, and } from 'sdk/db';
import { assertOwner } from '../lib/config.js';
import { commands } from '../schema.js';
export default async function(input,ctx) {
 const user=ctx.initData?.user; assertOwner(user);
 if(typeof input?.id!=='string') throw new Error('Command ID required');
 const row=await db.select().from(commands).where(and(eq(commands.id,input.id),eq(commands.ownerId,user.id))).get();
 if(!row) throw new Error('Command not found');
 return {id:row.id,action:row.action,status:row.status,createdAt:row.createdAt,completedAt:row.completedAt,result:row.result?JSON.parse(row.result):null};
}
