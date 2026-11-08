import { assertOwner } from '../lib/config.js';

export default async function (_input, ctx) {
  assertOwner(ctx.initData?.user);
  return {
    product: 'HomePilot',
    version: '0.1.0',
    agent: { status: 'offline' },
    capabilities: { applications: true, media: true, power: true, monitoring: false },
  };
}
