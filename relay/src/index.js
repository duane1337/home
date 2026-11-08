export class AgentRoom {
  constructor(ctx, env) { this.ctx=ctx; this.env=env; this.sessions=new Set(); }
  async fetch(request) {
    const url=new URL(request.url);
    if(url.pathname==='/agent') {
      if(request.headers.get('authorization')!==`Bearer ${this.env.AGENT_SECRET}`) return new Response('Unauthorized',{status:401});
      if(request.headers.get('Upgrade')!=='websocket') return new Response('WebSocket required',{status:426});
      const pair=new WebSocketPair(); const client=pair[0], server=pair[1]; server.accept(); this.sessions.add(server);
      server.addEventListener('close',()=>this.sessions.delete(server)); server.addEventListener('error',()=>this.sessions.delete(server));
      server.addEventListener('message',event=>{ try { const data=JSON.parse(event.data); if(data.type==='ack') this.ctx.storage.put(`ack:${data.id}`,data); } catch {} });
      return new Response(null,{status:101,webSocket:client});
    }
    if(url.pathname==='/command' && request.method==='POST') {
      if(request.headers.get('authorization')!==`Bearer ${this.env.RELAY_SECRET}`) return new Response('Unauthorized',{status:401});
      const command=await request.json();
      if(!command || typeof command.id!=='string' || typeof command.action!=='string') return new Response('Invalid command',{status:400});
      if(!Number.isInteger(command.expires_at) || command.expires_at<Math.floor(Date.now()/1000)) return new Response('Expired',{status:410});
      if(!this.sessions.size) return new Response('Agent offline',{status:503});
      const message=JSON.stringify({type:'command',...command});
      for(const socket of this.sessions){try{socket.send(message)}catch{this.sessions.delete(socket)}}
      return Response.json({accepted:true,id:command.id});
    }
    if(url.pathname==='/ack' && request.method==='GET') {
      if(request.headers.get('authorization')!==`Bearer ${this.env.RELAY_SECRET}`) return new Response('Unauthorized',{status:401});
      const id=url.searchParams.get('id'); if(!id) return new Response('Missing id',{status:400});
      const ack=await this.ctx.storage.get(`ack:${id}`); return ack?Response.json(ack):new Response('Pending',{status:404});
    }
    if(url.pathname==='/health') return Response.json({ok:true,connected:this.sessions.size>0});
    return new Response('Not found',{status:404});
  }
}
export default { async fetch(request,env) { const id=env.AGENTS.idFromName('home'); return env.AGENTS.get(id).fetch(request); } };
