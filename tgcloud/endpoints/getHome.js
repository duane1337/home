import { fetch } from 'sdk';
import { assertOwner, RELAY_URL } from '../lib/config.js';

export default async function (_input, ctx) {
  assertOwner(ctx.initData?.user);
  let online = false;
  if (!RELAY_URL.includes('REPLACE_')) {
    try {
      const response = await fetch(RELAY_URL + '/health');
      if (response.ok) online = Boolean((await response.json()).connected);
    } catch {}
  }
  return {
    product: 'HomePilot',
    version: '0.1.0',
    agent: { status: online ? 'online' : 'offline' },
    capabilities: { applications: true, media: true, power: true, monitoring: false },
  };
}
