// Simulation complète du moteur : 3 équipes, chaque type de case, jokers, vannes, fin de partie.
import * as G from '../src/game.js';
import { QCM } from '../src/content.js';

let now = 1_700_000_000_000;
let seed = 42;
const rng = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
const fails = [];
const check = (cond, msg) => { if (!cond) { fails.push(msg); console.log('  ❌ ' + msg); } };
const s = G.createGame('TEST', now);
const send = (pid, msg, host = false) => G.handle(s, msg, { now, pid, host, rng });
const host = msg => send(null, { t: 'host', ...msg }, true);
const wait = ms => { now += ms; G.tick(s, now, rng); };

// ── lobby
check(send('p1', { t: 'createTeam', name: 'Les Moules', color: '#FF5A36', player: 'Nico' }) === null, 'création équipe 1');
check(send('p2', { t: 'createTeam', name: 'Les Castors', player: 'Ju' }) === null, 'création équipe 2');
check(send('p3', { t: 'createTeam', name: 'Les Licornes', player: 'Max' }) === null, 'création équipe 3');
check(send('p4', { t: 'joinTeam', teamId: s.teams[0].id, player: 'Léa' }) === null, 'rejoindre une équipe');
check(send('p9', { t: 'createTeam', name: 'les moules' }) !== null, 'nom en double refusé');
check(host({ action: 'start' }) === null, 'démarrage');
check(s.phase === 'roll', 'phase roll après start');

const pidOf = id => Object.entries(s.players).find(([, p]) => p.teamId === id)[0];
const seen = new Set();
let turns = 0;

function playChallenge() {
  const ch = s.ch;
  if (!ch || s.phase !== 'challenge') return;
  seen.add(ch.fallback ? ch.type + '(fallback)' : ch.type);
  now = Math.max(now, ch.startsAt || now);
  // la vue téléphone ne doit jamais contenir la réponse
  const v = G.view(s, { pid: 'p2' });
  if (v.ch && v.ch.q) check(v.ch.q.a === undefined, `réponse cachée (${ch.type})`);
  const ids = s.teams.map(t => t.id);

  if (ch.kind === 'qcm') {
    // une équipe utilise le 50/50 si elle l'a encore
    const t0 = s.teams[1];
    if (ch.q.o.length === 4 && t0.jokers.fifty) check(send(pidOf(t0.id), { t: 'joker', kind: 'fifty' }) === null, '50/50');
    for (const id of ids) {
      const banned = (s.ch.fifty[id] || []);
      let a = Math.floor(rng() * ch.q.o.length); while (banned.includes(a)) a = (a + 1) % ch.q.o.length;
      if (s.phase === 'challenge') send(pidOf(id), { t: 'answer', value: a });
    }
  } else if (ch.kind === 'number') {
    for (const id of ids) send(pidOf(id), { t: 'answer', value: String(Math.round(ch.q.a * (0.5 + rng()))) });
  } else if (ch.kind === 'open') {
    for (const id of ids) send(pidOf(id), { t: 'answer', value: 'Une blague nulle de ' + id });
    check(s.ch.stage === 'vote', 'passage au vote');
    const own = send(pidOf(ids[0]), { t: 'vote', teamId: ids[0] });
    check(own !== null, 'vote pour soi refusé');
    ids.forEach((id, i) => send(pidOf(id), { t: 'vote', teamId: ids[(i + 1) % ids.length] }));
  } else if (ch.kind === 'bac') {
    for (const id of ids) send(pidOf(id), { t: 'answer', value: ch.cats.map((_, i) => i % 2 ? ch.letter + 'truc' : 'zzz') });
    check(s.ch.stage === 'review', 'bac en correction');
    host({ action: 'bacToggle', teamId: ids[0], i: 0 });
    check(host({ action: 'bacValidate' }) === null, 'bac validé');
  } else if (ch.kind === 'famille') {
    ids.forEach((id, i) => send(pidOf(id), { t: 'answer', value: i === 0 ? ['téléphone', 'pieds', 'merde'] : ['n\'importe quoi', 'putain'] }));
  } else if (ch.kind === 'buzz10') {
    send(pidOf(ids[0]), { t: 'buzz' }); // faux départ
    now = ch.goAt; G.tick(s, now, rng);
    now += 9800; send(pidOf(ids[1]), { t: 'buzz' });
    now += 900; send(pidOf(ids[2]), { t: 'buzz' });
  } else if (ch.kind === 'duel' || ch.kind === 'target') {
    const me = ch.teamId; const other = ids.find(i => i !== me);
    check(send(pidOf(other), { t: 'pick', teamId: me }) !== null, 'seule l\'équipe active choisit');
    send(pidOf(me), { t: 'pick', teamId: other });
    if (s.ch && s.ch.stage === 'q') {
      now = s.ch.startsAt;
      send(pidOf(other), { t: 'answer', value: (s.ch.q.a + 1) % s.ch.q.o.length });
      send(pidOf(me), { t: 'answer', value: s.ch.q.a });
    }
  } else if (ch.kind === 'media') {
    send(pidOf(ids[1]), { t: 'buzz' });
    host({ action: 'judge', ok: false });
    send(pidOf(ids[2]), { t: 'buzz' });
    host({ action: 'judge', ok: true });
  }
  if (s.phase === 'challenge') wait(200000); // le chrono tranche
}

function playTurn(forceType) {
  const t = s.teams[s.turn];
  if (forceType) {
    // on place le pion juste avant une case du type voulu
    const target = G.BOARD.indexOf(forceType);
    t.pos = (target - 3 + G.BOARD.length) % G.BOARD.length;
    seed = 7; // le dé fait 3 avec cette graine ? on force plutôt :
  }
  check(send(pidOf(s.teams[(s.turn + 1) % 3].id), { t: 'roll' }) !== null, 'mauvaise équipe ne peut pas lancer');
  check(send(pidOf(t.id), { t: 'roll' }) === null, 'lancer du dé');
  check(s.phase === 'rolled', 'phase rolled');
  if (forceType) { s.move.roll = 3; s.move.to = (s.move.from + 3) % G.BOARD.length; s.move.passed = s.move.from + 3 >= G.BOARD.length; }
  if (t.jokers.relance && turns === 2) check(send(pidOf(t.id), { t: 'joker', kind: 'relance' }) === null, 'joker relance');
  if (turns % 2) send(pidOf(t.id), { t: 'go' }); else wait(13000);
  check(s.phase === 'challenge' || s.phase === 'reveal', 'case jouée après le déplacement (' + s.phase + ')');
  playChallenge();
  check(s.phase === 'reveal', 'révélation (' + (s.ch && s.ch.type) + ')');
  if (turns % 3 === 0) host({ action: 'next' }); else wait(130000);
  turns++;
  for (const x of s.teams) check(x.score >= 0, 'score jamais négatif');
}

// ── chaque type de case au moins une fois
const types = [...new Set(G.BOARD)].filter(x => x !== 'depart');
for (const ty of types) { if (s.phase !== 'roll') break; playTurn(ty); }

// ── jokers hors tour
const [A, B, C] = s.teams;
check(send(pidOf(C.id), { t: 'joker', kind: 'bouclier' }) === null, 'bouclier');
const before = C.score;
check(send(pidOf(A.id), { t: 'joker', kind: 'vol', target: C.id }) === null, 'joker vol (bloqué par bouclier)');
check(C.score === before, 'le bouclier protège du vol');
check(send(pidOf(A.id), { t: 'joker', kind: 'vol', target: C.id }) !== null, 'un joker ne sert qu\'une fois');
check(send(pidOf(B.id), { t: 'joker', kind: 'blocage', target: A.id }) === null, 'joker blocage');
check(send(pidOf(B.id), { t: 'joker', kind: 'double' }) === null, 'joker double');
check(send(pidOf(A.id), { t: 'taunt', to: B.id, text: 'Vous êtes nuls' }) === null, 'vanne');
check(send(pidOf(A.id), { t: 'taunt', to: B.id, text: 'Encore' }) !== null, 'anti-spam vannes');
check(s.feed.some(f => f.k === 'taunt'), 'vanne dans le fil');

// ── partie libre jusqu'à la fin du temps
now = s.endAt + 1;
let guard = 0;
while (s.phase !== 'end' && guard++ < 50) {
  if (s.phase === 'roll') playTurn(); else wait(200000);
}
check(s.phase === 'end', 'la partie se termine quand le temps est écoulé');
check(Array.isArray(s.ranking) && s.ranking.length === 3, 'classement final');

console.log('\nTypes joués :', [...seen].sort().join(', '));
console.log('Scores :', s.teams.map(t => `${t.name} ${t.score}`).join(' | '), `| ${turns} tours, ${s.round} manches`);
console.log('Fil :', s.feed.slice(-6).map(f => f.text).join('\n      '));
console.log(fails.length ? `\n${fails.length} ÉCHEC(S)` : '\n✅ Moteur : tout est vert');
process.exit(fails.length ? 1 : 0);
