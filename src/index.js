import { GameRoom } from './room.js';
export { GameRoom };

const LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // sans I ni O, on n'est pas des sauvages

function roomStub(env, code) {
  return env.ROOMS.get(env.ROOMS.idFromName(code));
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const path = url.pathname;

    // Nouvelle partie : un code à 4 lettres libre
    if (path === '/api/new') {
      for (let i = 0; i < 10; i++) {
        const code = Array.from({ length: 4 }, () => LETTERS[Math.floor(Math.random() * LETTERS.length)]).join('');
        const r = await roomStub(env, code).fetch(`https://room/${code}?exists=1`);
        if ((await r.text()) === '0') return Response.json({ code });
      }
      return Response.json({ error: 'Plus de codes libres, revenez plus tard.' }, { status: 503 });
    }

    // WebSocket vers la partie
    const ws = path.match(/^\/ws\/([A-Z]{4})$/i);
    if (ws) return roomStub(env, ws[1].toUpperCase()).fetch(new Request(`https://room/${ws[1].toUpperCase()}`, req));

    // Lien court du QR code : /ABCD → page téléphone
    // (majuscules uniquement, pour ne jamais confondre avec /play)
    const short = path.match(/^\/([A-Z]{4})\/?$/);
    if (short) return Response.redirect(`${url.origin}/play?room=${short[1].toUpperCase()}`, 302);

    return env.ASSETS.fetch(req);
  }
};
