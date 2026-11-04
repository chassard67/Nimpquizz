// Une partie = un Durable Object. Il garde l'état, parle aux écrans en WebSocket
// et réveille le jeu à chaque fin de chrono grâce aux alarmes.
import { DurableObject } from 'cloudflare:workers';
import * as G from './game.js';

export class GameRoom extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.s = null;
    ctx.blockConcurrencyWhile(async () => { this.s = (await ctx.storage.get('state')) || null; });
  }

  async fetch(req) {
    const url = new URL(req.url);
    const code = (url.pathname.split('/').pop() || '').toUpperCase();
    if (url.searchParams.has('exists')) return new Response(this.s ? '1' : '0');
    if (req.headers.get('Upgrade') !== 'websocket') return new Response('WebSocket attendu', { status: 426 });
    if (!this.s) { this.s = G.createGame(code, Date.now()); await this.save(); }
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    this.ctx.acceptWebSocket(server);
    server.serializeAttachment({ role: 'anon' });
    return new Response(null, { status: 101, webSocket: client });
  }

  async webSocketMessage(ws, raw) {
    let msg;
    try { msg = JSON.parse(raw); } catch { return; }
    if (!msg || typeof msg !== 'object') return;
    const now = Date.now();
    this.s._now = now;

    if (msg.t === 'ping') { ws.send(JSON.stringify({ t: 'pong', now })); return; }

    if (msg.t === 'hello') {
      const pid = String(msg.pid || '').slice(0, 40);
      let att;
      if (msg.role === 'gm') {
        // Maître du jeu : code secret (variable GM_PIN dans Cloudflare, 1234 par défaut)
        const prev = ws.deserializeAttachment() || {};
        if (prev.lockUntil && now < prev.lockUntil) {
          ws.send(JSON.stringify({ t: 'denied', text: `Trop d'essais. Réessayez dans ${Math.ceil((prev.lockUntil - now) / 1000)} s.` }));
          return;
        }
        const pin = String((this.env && this.env.GM_PIN) || '1234');
        if (String(msg.pin || '') !== pin) {
          const fails = (prev.fails || 0) + 1;
          ws.serializeAttachment({ role: 'anon', fails, lockUntil: fails >= 5 ? now + 60000 : 0 });
          ws.send(JSON.stringify({ t: 'denied', text: fails >= 5 ? 'Trop d\'essais. Bloqué 1 minute.' : 'Code incorrect.' }));
          return;
        }
        att = { role: 'gm', host: true, gm: true };
        ws.serializeAttachment(att);
        this.sendState(ws, att);
        this.broadcast(); // la télé sait qu'un maître du jeu est là
        return;
      }
      if (msg.role === 'tv') {
        if (!this.s.hostKey && msg.hostKey) { this.s.hostKey = String(msg.hostKey).slice(0, 64); await this.save(); }
        att = { role: 'tv', host: !!msg.hostKey && msg.hostKey === this.s.hostKey };
      } else {
        att = { role: 'phone', pid };
      }
      ws.serializeAttachment(att);
      this.sendState(ws, att);
      return;
    }

    const att = ws.deserializeAttachment() || {};
    const err = G.handle(this.s, msg, { now, pid: att.pid, host: !!att.host, gm: !!att.gm, rng: Math.random, online: this.onlinePids() });
    if (err) { ws.send(JSON.stringify({ t: 'error', text: err })); }
    else {
      await this.save();
      this.broadcast();
    }
  }

  async alarm() {
    if (!this.s) return;
    if (G.tick(this.s, Date.now(), Math.random, this.onlinePids())) { await this.save(); this.broadcast(); }
    else await this.schedule();
  }

  async webSocketClose(ws, code) {
    const att = ws.deserializeAttachment() || {};
    try { ws.close(code, 'bye'); } catch {}
    if (att.role === 'gm' && this.s) this.broadcast();
  }
  async webSocketError() {}

  async save() {
    await this.ctx.storage.put('state', this.s);
    await this.schedule();
  }

  async schedule() {
    const d = G.nextDeadline(this.s);
    if (d) await this.ctx.storage.setAlarm(Math.max(d, Date.now() + 50));
    else await this.ctx.storage.deleteAlarm();
  }

  // téléphones de joueurs actuellement connectés (pour distribuer les cartes du Blanc Manger Coco)
  onlinePids() {
    const out = [];
    for (const w of this.ctx.getWebSockets()) { if (w.readyState !== 1) continue; const a = w.deserializeAttachment() || {}; if (a.role === 'phone' && a.pid) out.push(a.pid); }
    return out;
  }

  gmCount() {
    let n = 0;
    for (const w of this.ctx.getWebSockets()) { if (w.readyState !== 1) continue; const a = w.deserializeAttachment() || {}; if (a.role === 'gm') n++; }
    return n;
  }

  sendState(ws, att, gmOnline = this.gmCount()) {
    try { ws.send(JSON.stringify({ t: 'state', s: G.view(this.s, att, { gmOnline }) })); } catch {}
  }

  broadcast() {
    const gmOnline = this.gmCount();
    for (const ws of this.ctx.getWebSockets()) {
      const att = ws.deserializeAttachment() || {};
      if (att.role === 'anon' || !att.role) continue;
      this.sendState(ws, att, gmOnline);
    }
  }
}
