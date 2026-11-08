import { db, EndpointError, fetch } from 'sdk';
import { assertOwner } from '../lib/config.js';
import { commands } from '../schema.js';
const ALLOWED_ACTIONS = new Set(['app.launch','app.focus','app.close','app.restart','media.playPause','media.next','media.previous','media.volume.set','media.volume.mute','system.lock','system.sleep','system.hibernate','system.restart','system.shutdown']);
export default async function (input, ctx) {
  const user = ctx.initData?.user;
  assertOwner(user);
  if (!input || typeof input.action !== 'string' || !ALLOWED_ACTIONS.has(input.action)) throw new EndpointError('Unsupported command', { code: 'INVALID_COMMAND' });
  const payload = input.payload ?? {};
  if (typeof payload !== 'object' || payload === null || Array.isArray(payload)) throw new EndpointError('Invalid payload', { code: 'INVALID_PAYLOAD' });
  if (input.action.startsWith('app.') && (typeof payload.app_id !== 'string' || !/^[a-z0-9_-]{1,40}$/i.test(payload.app_id))) throw new EndpointError('Invalid application identifier', { code: 'INVALID_APP_ID' });
  if (input.action === 'media.volume.set' && (!Number.isInteger(payload.value) || payload.value < 0 || payload.value > 100)) throw new EndpointError('Volume must be 0-100', { code: 'INVALID_VOLUME' });
  const id = crypto.randomUUID(), now = Math.floor(Date.now()/1000);
  await db.insert(commands).values({ id, ownerId:user.id, action:input.action, payload:JSON.stringify(payload), status:'queued', createdAt:now }).run();
  const relayUrl = 'https://REPLACE_WITH_YOUR_WORKER.workers.dev/command';
  const relaySecret = 'CONFIGURE_SERVER_SIDE_SECRET';
  if (relayUrl.includes('REPLACE_') || relaySecret.startsWith('CONFIGURE_')) return { id, status:'queued', delivered:false, reason:'RELAY_NOT_CONFIGURED' };
  try {
    const response = await fetch(relayUrl, { method:'POST', headers:{'content-type':'application/json',authorization:`Bearer ${relaySecret}`}, body:JSON.stringify({id,action:input.action,payload,issued_at:now,expires_at:now+60}) });
    return response.ok ? {id,status:'sent',delivered:true} : {id,status:'queued',delivered:false,reason:'AGENT_OFFLINE'};
  } catch { return {id,status:'queued',delivered:false,reason:'RELAY_UNAVAILABLE'}; }
}
