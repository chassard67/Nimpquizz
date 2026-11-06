// A contrario : buzz + réponse orale validée par le maître du jeu, indices à 10 s et 20 s, 3/2/1 pts
import * as G from '../src/game.js';
import { CONTRARIO } from '../src/content.js';

let now = 1_700_000_000_000, seed = 5, ok = 0;
const rng = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
const fails = [];
const check = (c, m) => { if (c) ok++; else { fails.push(m); console.log('  ❌ ' + m); } };
const cell = G.BOARD.indexOf('contrario');

function setup() {
  const s = G.createGame('CTRA', now);
  const send = (pid, msg) => G.handle(s, msg, { now, pid, rng });
  const gm = msg => G.handle(s, { t: 'host', ...msg }, { now, host: true, gm: true, rng });
  send('a', { t: 'createTeam', name: 'Alpha', player: 'A' });
  send('b', { t: 'createTeam', name: 'Bravo', player: 'B' });
  gm({ action: 'start' });
  gm({ action: 'goto', cell });
  gm({ action: 'launch' });
  now = s.ch.startsAt;
  const pts = id => s.teams.find(t => t.id === id).score;
  const idOf = pid => s.players[pid].teamId;
  return { s, send, gm, pts, idOf };
}

check(CONTRARIO.length === 26 && CONTRARIO.every(c => c.q && c.answer && c.hints.length === 2), '26 phrases avec réponse et 2 indices');
check(cell >= 0, 'case A contrario présente sur le plateau');

// 1) buzz sans indice : 3 pts
{
  const { s, send, gm, pts, idOf } = setup();
  check(s.ch.kind === 'media' && s.ch.media === 'text' && s.ch.item.q, 'épreuve au buzzer avec une phrase');
  const vp = G.view(s, { pid: 'a' }), vt = G.view(s, { role: 'tv', host: true }), vg = G.view(s, { role: 'gm', host: true });
  check(vp.ch.item.q && !vp.ch.item.answer && !vp.ch.item.hints && vp.ch.item.nh === 2, 'téléphone : la phrase, ni réponse ni indices');
  check(vt.ch.item.hints && vt.ch.item.hints.length === 2 && !vt.ch.item.answer, 'télé : les indices, pas la réponse');
  check(vg.ch.item.answer && vg.ch.item.hints, 'maître du jeu : réponse et indices');
  now += 4000;
  send('a', { t: 'buzz' });
  check(gm({ action: 'judge', ok: true }) === null && pts(idOf('a')) === 3, 'trouvé sans indice : 3 pts');
}
// 2) après le 1er indice : 2 pts
{
  const { s, send, gm, pts, idOf } = setup();
  now += 12000; send('b', { t: 'buzz' }); gm({ action: 'judge', ok: true });
  check(pts(idOf('b')) === 2 && /1 indice/.test(s.ch.summary), 'après le 1er indice : 2 pts');
}
// 3) mauvaise réponse : le temps de réponse ne fait pas apparaître d'indice, puis 1 pt après le 2e
{
  const { s, send, gm, pts, idOf } = setup();
  now += 8000; send('a', { t: 'buzz' });
  now += 14000;                       // Alpha cherche pendant 14 s
  gm({ action: 'judge', ok: false });
  const k = Math.floor((now - s.ch.startsAt) / G.T.hint);
  check(k === 0, 'le temps de réponse d\'un buzz raté ne compte pas pour les indices');
  check(send('a', { t: 'buzz' }) !== null, 'équipe grillée ne rebuzze pas');
  now += 13000; send('b', { t: 'buzz' }); gm({ action: 'judge', ok: true });
  check(pts(idOf('b')) === 1, 'Bravo trouve après 21 s d\'écoute (hors temps de réponse) : 2 indices vus, 1 pt');
}
// 4) après les 2 indices : 1 pt ; personne : 0
{
  const { s, send, gm, pts, idOf } = setup();
  now += 25000; send('a', { t: 'buzz' }); gm({ action: 'judge', ok: true });
  check(pts(idOf('a')) === 1, 'après les 2 indices : 1 pt');
}
{
  const { s, gm } = setup();
  now += 60000; G.tick(s, now, rng);
  check(s.phase === 'reveal' && !s.ch.winner && s.teams.every(t => t.score === 0), 'personne ne buzze : 0 pt, révélation');
  check(G.view(s, { pid: 'a' }).ch.item.answer, 'à la révélation, la réponse est visible partout');
}

console.log(fails.length ? `❌ A contrario : ${fails.length} échec(s)` : `✅ A contrario : ${ok} vérifications OK`);
if (fails.length) process.exit(1);
