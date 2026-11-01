// Partie simulée de bout en bout contre le serveur (wrangler dev) :
// 1 écran TV + 3 équipes (4 téléphones), en WebSocket, avec vrais chronos.
// Usage : npx wrangler dev   puis   node test/e2e.mjs [http://127.0.0.1:8787] [nb_tours]
const BASE = process.argv[2] || 'http://127.0.0.1:8787';
const TURNS = Number(process.argv[3] || 14);
const WS = BASE.replace(/^http/, 'ws');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const errors = [], leaks = [], seenTypes = new Set(), taunted = [];

const { code } = await fetch(BASE + '/api/new').then(r => r.json());
console.log('Partie', code);

function client(name, hello) {
  const c = { name, s: null, errors: [], done: new Set(), states: 0 };
  c.ws = new WebSocket(`${WS}/ws/${code}`);
  c.ready = new Promise(r => c.ws.addEventListener('open', r));
  c.ws.addEventListener('open', () => c.ws.send(JSON.stringify({ t: 'hello', ...hello })));
  c.ws.addEventListener('message', e => {
    const m = JSON.parse(e.data);
    if (m.t === 'state') {
      c.s = m.s; c.states++; c.offset = m.s.now - Date.now();
      const ch = m.s.ch;
      if (m.s.phase === 'challenge' && ch && ch.q && (ch.q.a !== undefined || ch.q.f !== undefined)) leaks.push(`${name} voit la réponse (${ch.type})`);
      if (m.s.phase === 'challenge' && ch && ch.answers && m.s.me) for (const [id, a] of Object.entries(ch.answers)) if (id !== m.s.me.teamId && !a.hidden && !(ch.kind === 'open' && ch.stage === 'vote') && !(ch.kind === 'bac' && ch.stage === 'review')) leaks.push(`${name} voit la réponse d'une autre équipe (${ch.type})`);
      for (const f of m.s.feed) if (f.k === 'taunt' && !c.done.has('t' + f.id)) { c.done.add('t' + f.id); if (m.s.me && f.to === m.s.me.teamId) taunted.push(`${name} a reçu « ${f.text} »`); }
    }
    if (m.t === 'error') { c.errors.push(m.text); errors.push(`${name}: ${m.text}`); }
  });
  c.send = m => c.ws.send(JSON.stringify(m));
  c.now = () => Date.now() + (c.offset || 0);
  return c;
}

const tv = client('TV', { role: 'tv', hostKey: 'cle-secrete-test' });
const spy = client('TV-espion', { role: 'tv', hostKey: 'pas-la-bonne' });
const phones = ['Moules', 'Castors', 'Licornes', 'Castors-bis'].map((n, i) => client(n, { role: 'phone', pid: 'pid-' + i }));
await Promise.all([tv.ready, spy.ready, ...phones.map(p => p.ready)]);
await sleep(400);

// ── équipes
phones[0].send({ t: 'createTeam', name: 'Les Moules à Frites', player: 'Nico' });
await sleep(150);
phones[1].send({ t: 'createTeam', name: 'Les Castors Juniors', player: 'Julie' });
await sleep(150);
phones[2].send({ t: 'createTeam', name: 'Les Licornes Alcooliques', player: 'Max' });
await sleep(300);
phones[3].send({ t: 'joinTeam', teamId: tv.s.teams.find(t => t.name.includes('Castors')).id, player: 'Léo' });
await sleep(300);
spy.send({ t: 'host', action: 'start' });
await sleep(300);
const spyRefused = spy.errors.length > 0 && tv.s.phase === 'lobby';
tv.send({ t: 'host', action: 'setDuration', min: 45 });
tv.send({ t: 'host', action: 'start' });
await sleep(500);
console.log('Équipes :', tv.s.teams.map(t => t.name).join(' / '), '— phase', tv.s.phase);

const pickOther = (s, myId) => { const o = s.teams.filter(t => t.id !== myId); return o[Math.floor(Math.random() * o.length)].id; };
const once = (c, key, fn) => { if (!c.done.has(key)) { c.done.add(key); fn(); } };

// ── un joueur robot (un peu nul, comme dans la vraie vie)
function bot(c) {
  const s = c.s; if (!s || !s.me) return;
  const my = s.me.teamId, ch = s.ch, turnKey = s.move ? s.move.n : 'x';
  const myTurn = s.teams[s.turn].id === my;
  const now = c.now();
  if (s.phase === 'roll' && myTurn) once(c, 'roll' + s.round + '-' + s.turn + '-' + turnKey, () => c.send({ t: 'roll' }));
  if (s.phase === 'rolled' && myTurn) {
    const t = s.teams.find(x => x.id === my);
    if (t.jokers.relance && Math.random() < .3) once(c, 'rel' + turnKey, () => c.send({ t: 'joker', kind: 'relance' }));
    else once(c, 'go' + turnKey, () => setTimeout(() => c.send({ t: 'go' }), 300));
  }
  if (s.phase !== 'challenge' || !ch) return;
  const k = turnKey + ch.type + ch.stage;
  if (now < (ch.startsAt || 0)) return;
  const part = !ch.participants || ch.participants.includes(my);
  const answered = ch.answers && ch.answers[my] !== undefined;
  if ((ch.kind === 'qcm' || (ch.kind === 'duel' && ch.stage === 'q')) && part && !answered) {
    const banned = (ch.fifty && ch.fifty[my]) || [];
    const t = s.teams.find(x => x.id === my);
    if (!c.done.has('a' + k) && ch.q.o.length === 4 && t.jokers.fifty && !banned.length && Math.random() < .3) return once(c, 'ff' + k, () => c.send({ t: 'joker', kind: 'fifty' }));
    let a = Math.floor(Math.random() * ch.q.o.length); while (banned.includes(a)) a = (a + 1) % ch.q.o.length;
    once(c, 'a' + k, () => setTimeout(() => c.send({ t: 'answer', value: a }), 200 + Math.random() * 1500));
  }
  if (ch.kind === 'number' && !answered) once(c, 'a' + k, () => c.send({ t: 'answer', value: String(Math.floor(Math.random() * 2000)) }));
  if (ch.kind === 'open' && ch.stage === 'write' && !answered) once(c, 'a' + k, () => c.send({ t: 'answer', value: `${c.name} propose : une saucisse en tutu` }));
  if (ch.kind === 'open' && ch.stage === 'vote' && !ch.votes[my]) once(c, 'v' + k, () => { const o = Object.keys(ch.answers).filter(id => id !== my); if (o.length) c.send({ t: 'vote', teamId: o[0] }); });
  if (ch.kind === 'bac' && ch.stage === 'write' && !answered) once(c, 'a' + k, () => c.send({ t: 'answer', value: ch.cats.map((_, i) => i % 2 ? ch.letter + 'ouette' : '') }));
  if (ch.kind === 'famille' && !answered) once(c, 'a' + k, () => c.send({ t: 'answer', value: ['téléphone', 'les pieds', 'putain'] }));
  if (ch.kind === 'buzz10' && ch.taps[my] === undefined && now >= ch.goAt) once(c, 'b' + k, () => setTimeout(() => c.send({ t: 'buzz' }), 9000 + Math.random() * 2000));
  if ((ch.kind === 'duel' || ch.kind === 'target') && ch.stage === 'pick' && ch.teamId === my) once(c, 'p' + k, () => c.send({ t: 'pick', teamId: pickOther(s, my) }));
  if (ch.kind === 'media' && ch.stage === 'play') once(c, 'bz' + k, () => c.send({ t: 'buzz' }));
}

function animateur() {
  const s = tv.s; if (!s) return;
  const key = (s.move ? s.move.n : 'x') + s.phase + (s.ch ? s.ch.stage : '');
  if (s.phase === 'reveal') {
    once(tv, 'n' + key, () => { seenTypes.add(s.ch.fallback ? s.ch.type + '*' : s.ch.type); console.log(`  [${s.teams.find(t => t.id === s.ch.teamId).name}] ${s.ch.fallback ? s.ch.type + ' (consolation)' : s.ch.label} → ${s.ch.summary}`); setTimeout(() => tv.send({ t: 'host', action: 'next' }), 400); });
  }
  if (s.phase === 'challenge' && s.ch.kind === 'bac' && s.ch.stage === 'review') once(tv, 'bv' + key, () => { tv.send({ t: 'host', action: 'bacToggle', teamId: s.teams[0].id, i: 1 }); setTimeout(() => tv.send({ t: 'host', action: 'bacValidate' }), 300); });
  if (s.phase === 'challenge' && s.ch.kind === 'media' && s.ch.stage === 'answer') once(tv, 'j' + key, () => tv.send({ t: 'host', action: 'judge', ok: true }));
}

// ── forçage de quelques cases pour être sûr de tout voir passer : on ne triche pas sur le serveur,
// on laisse le hasard du dé faire, sur suffisamment de tours.
let turnsPlayed = 0, lastN = null, extraDone = false;
const t0 = Date.now();
while (turnsPlayed < TURNS && Date.now() - t0 < 6 * 60 * 1000) {
  phones.forEach(bot); animateur();
  const s = tv.s;
  if (s.phase === 'roll' && s.move === null && lastN !== s.round + '-' + s.turn) { lastN = s.round + '-' + s.turn; turnsPlayed++; }
  if (!extraDone && turnsPlayed === 4) {
    extraDone = true;
    const [a, b, c] = phones;
    a.send({ t: 'taunt', to: b.s.me.teamId, text: 'Votre QI cumulé ne fait pas une température normale. 🤒' });
    c.send({ t: 'taunt', to: 'all', text: 'On vous laisse gagner par pitié. Profitez.' });
    b.send({ t: 'joker', kind: 'bouclier' });
    setTimeout(() => a.send({ t: 'joker', kind: 'vol', target: b.s.me.teamId }), 300);
    setTimeout(() => c.send({ t: 'joker', kind: 'blocage', target: a.s.me.teamId }), 600);
    setTimeout(() => a.send({ t: 'joker', kind: 'double' }), 900);
  }
  await sleep(120);
}
tv.send({ t: 'host', action: 'end' });
await sleep(800);

const s = tv.s;
console.log('\n── Résultat ──');
console.log('Phase finale :', s.phase, '| tours joués :', turnsPlayed);
console.log('Classement :', (s.ranking || []).map((id, i) => `${i + 1}. ${s.teams.find(t => t.id === id).name} (${s.teams.find(t => t.id === id).score})`).join('  '));
console.log('Types vus :', [...seenTypes].join(', '));
console.log('Vannes reçues :', taunted.length ? taunted.join(' | ') : 'aucune');
console.log('Fil (extrait) :\n   ' + s.feed.filter(f => f.k !== 'info').slice(-8).map(f => f.text).join('\n   '));
console.log('États reçus par téléphone :', phones.map(p => `${p.name}=${p.states}`).join(' '));
// courses normales : deux téléphones d'une même équipe, ou une réponse qui arrive après la clôture
const expected = /Pas maintenant|pas le moment|Trop tard|Déjà|déjà|Pas de question en cours|Rien à buzzer|Pas de vote|Pas de cible/i;
const unexpected = errors.filter(e => !expected.test(e) && !e.startsWith('TV-espion'));
console.log('Écran espion refusé comme animateur :', spyRefused ? 'oui ✅' : 'NON ❌');
console.log('Fuites de réponses :', leaks.length ? [...new Set(leaks)].join(' | ') : 'aucune ✅');
console.log('Erreurs inattendues :', unexpected.length ? unexpected.join(' | ') : 'aucune ✅');
const ok = s.phase === 'end' && spyRefused && !leaks.length && !unexpected.length && turnsPlayed >= TURNS && taunted.length >= 2;
console.log(ok ? '\n✅ Partie de bout en bout OK' : '\n❌ Problème détecté');
for (const c of [tv, spy, ...phones]) c.ws.close();
process.exit(ok ? 0 : 1);
