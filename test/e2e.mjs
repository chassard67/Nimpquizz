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
      if (name !== 'MJ' && m.s.phase === 'challenge' && ch && ch.q && (ch.q.a !== undefined || ch.q.f !== undefined)) leaks.push(`${name} voit la réponse (${ch.type})`);
      if (m.s.phase === 'challenge' && ch && ch.answers && m.s.me) for (const [id, a] of Object.entries(ch.answers)) if (id !== m.s.me.teamId && !a.hidden && !(ch.kind === 'open' && ch.stage === 'vote') && !(ch.kind === 'bac' && ch.stage === 'review')) leaks.push(`${name} voit la réponse d'une autre équipe (${ch.type})`);
      if (m.s.bmc || (ch && ch.kind === 'bmc' && (ch.picks || ch.players))) leaks.push(`${name} voit les mains des autres (Blanc Manger Coco)`);
      for (const f of m.s.feed) if (f.k === 'taunt' && !c.done.has('t' + f.id)) { c.done.add('t' + f.id); if (m.s.me && f.to === m.s.me.teamId) taunted.push(`${name} a reçu « ${f.text} »`); }
    }
    if (m.t === 'error') { c.errors.push(m.text); errors.push(`${name}: ${m.text}${process.env.DEBUG ? ' ← ' + c.last : ''}`); }
  });
  c.send = m => { c.last = JSON.stringify(m); c.ws.send(JSON.stringify(m)); };
  c.now = () => Date.now() + (c.offset || 0);
  return c;
}

const tv = client('TV', { role: 'tv', hostKey: 'cle-secrete-test' });
await tv.ready; await sleep(300); // la télé qui crée la partie se connecte en premier
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

// maître du jeu (code secret par défaut) : il envoie le pion sur les nouvelles cases pour être sûr de les voir passer
const gmc = client('MJ', { role: 'gm', pin: process.env.GM_PIN || '1234' });
await gmc.ready; await sleep(300);
gmc.send({ t: 'host', action: 'setNsfw', on: true });
await sleep(200);
const forced = { 1: 'bmc', 3: 'titredebile', 5: 'culture' };
const forcedDone = new Set();

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
  if (s.phase !== 'challenge' || !ch || ch.held) return;
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
  if (ch.kind === 'dcc' && ch.stage === 'mode' && !ch.modes[my]) once(c, 'm' + k, () => c.send({ t: 'mode', mode: ['duo', 'carre', 'cash'][Math.floor(Math.random() * 3)] }));
  // Emojis / Réplique : cash direct ou carré
  if (ch.kind === 'dcc' && ch.emo && ch.stage === 'q' && !answered && !ch.modes[my]) { once(c, 'e' + k, () => Math.random() < 0.5 ? c.send({ t: 'mode', mode: 'carre' }) : c.send({ t: 'answer', value: 'Titanic' })); }
  else if (ch.kind === 'dcc' && ch.stage === 'q' && !answered) once(c, 'a' + k, () => c.send({ t: 'answer', value: ch.modes[my] === 'cash' ? 'Paris' : ch.modes[my] === 'duo' ? ch.duo[my][0] : Math.floor(Math.random() * 4) }));
  if (ch.kind === 'series' && ch.stage === 'theme' && ch.teamId === my) once(c, 'th' + k, () => c.send({ t: 'theme', i: Math.floor(Math.random() * 3) }));
  if (ch.kind === 'series' && ch.stage === 'q' && !answered) once(c, 'a' + k + ch.i, () => c.send({ t: 'answer', value: ch.q.isNumber ? 100 : Math.floor(Math.random() * ch.q.o.length) }));
  if (ch.kind === 'millions' && ch.teamId === my && ch.stage === 'q' && !answered) once(c, 'a' + k + ch.level, () => c.send({ t: 'answer', value: Math.floor(Math.random() * 4) }));
  if (ch.kind === 'millions' && ch.teamId === my && ch.stage === 'decide') once(c, 'd' + k + ch.level, () => c.send({ t: 'decide', go: Math.random() < .6 }));
  if (ch.kind === 'affiche' && !answered) once(c, 'a' + k, () => setTimeout(() => c.send({ t: 'answer', value: Math.floor(Math.random() * 4) }), Math.random() * 9000));
  if (ch.kind === 'number' && !answered) once(c, 'a' + k, () => c.send({ t: 'answer', value: String(Math.floor(Math.random() * 2000)) }));
  if (ch.kind === 'open' && ch.stage === 'write' && ch.inGame && !ch.mine) once(c, 'a' + k, () => c.send({ t: 'answer', value: ch.q.words ? { pos: Math.floor(Math.random() * (ch.q.words.length + 1)), word: 'Saucisse' } : `${c.name} propose : une saucisse en tutu` }));
  if ((ch.kind === 'open' || ch.kind === 'bmc') && ch.stage === 'vote' && ch.canVote && ch.myVote === null) once(c, 'v' + k, () => { if (ch.entries.some(e => e.teamId)) leaks.push(`${c.name} voit les auteurs pendant le vote`); const o = ch.entries.filter(e => !e.own); if (o.length) setTimeout(() => c.send({ t: 'vote', i: o[Math.floor(Math.random() * o.length)].i }), 200 + Math.random() * 1500); });
  if (ch.kind === 'bac' && ch.stage === 'write' && !answered) once(c, 'a' + k, () => c.send({ t: 'answer', value: ch.cats.map((_, i) => i % 2 ? ch.letter + 'ouette' : '') }));
  if (ch.kind === 'bmc' && ch.stage === 'write' && ch.inGame && !ch.mine && s.bmcHand) once(c, 'bmc' + k, () => setTimeout(() => c.send({ t: 'bmc', cards: s.bmcHand.slice(0, ch.black.n).map(x => x.i) }), 300 + Math.random() * 1500));
  if (ch.kind === 'buzz10' && ch.goAt && ch.taps[my] === undefined && now >= ch.goAt) once(c, 'b' + k, () => setTimeout(() => c.send({ t: 'buzz' }), 9000 + Math.random() * 2000));
  if ((ch.kind === 'duel' || ch.kind === 'target') && ch.stage === 'pick' && ch.teamId === my) once(c, 'p' + k, () => c.send({ t: 'pick', teamId: pickOther(s, my) }));
  if (ch.kind === 'media' && ch.stage === 'play') once(c, 'bz' + k, () => c.send({ t: 'buzz' }));
}

function animateur() {
  const s = tv.s; if (!s) return;
  const key = (s.move ? s.move.n : 'x') + s.phase + (s.ch ? s.ch.stage : '') + (s.ch && s.ch.held ? 'H' : '');
  if (s.phase === 'reveal') {
    once(tv, 'n' + key, () => { seenTypes.add(s.ch.fallback ? s.ch.type + '*' : s.ch.type); console.log(`  [${s.teams.find(t => t.id === s.ch.teamId).name}] ${s.ch.fallback ? s.ch.type + ' (consolation)' : s.ch.label} → ${s.ch.summary}`); setTimeout(() => tv.send({ t: 'host', action: 'next' }), 400); });
  }
  // le maître du jeu (ici l'écran télé) lance chaque épreuve, puis le décompte du Buzzer 10 s
  if (s.phase === 'challenge' && s.ch.held) once(tv, 'L' + key, () => setTimeout(() => tv.send({ t: 'host', action: 'launch' }), 300));
  if (s.phase === 'challenge' && !s.ch.held && s.ch.kind === 'buzz10' && s.ch.stage === 'ready' && !s.ch.goAt) once(tv, 'G' + key, () => setTimeout(() => tv.send({ t: 'host', action: 'go' }), 300));
  // question bonus d'un blind test
  if (s.phase === 'challenge' && s.ch.kind === 'bac' && s.ch.stage === 'review') once(tv, 'bv' + key, () => { tv.send({ t: 'host', action: 'bacToggle', teamId: s.teams[0].id, i: 1 }); setTimeout(() => tv.send({ t: 'host', action: 'bacValidate' }), 300); });
  if (s.phase === 'challenge' && s.ch.kind === 'media' && s.ch.stage === 'answer') once(tv, 'j' + key, () => tv.send({ t: 'host', action: 'judge', ok: true }));
  if (s.phase === 'challenge' && (s.ch.kind === 'bmc' || s.ch.kind === 'open') && s.ch.stage === 'vote') once(tv, 'vt' + key, () => { if (s.ch.entries.some(e => e.teamId || e.name)) leaks.push('propositions pas anonymes pendant le vote'); });
  if (s.phase === 'challenge' && (s.ch.kind === 'bmc' || s.ch.kind === 'open') && s.ch.stage === 'tie') once(tv, 'tie' + key, () => setTimeout(() => tv.send({ t: 'host', action: 'tieBreak', teamId: s.ch.tied[0] }), 500));
}

// ── forçage de quelques cases pour être sûr de tout voir passer : on ne triche pas sur le serveur,
// on laisse le hasard du dé faire, sur suffisamment de tours.
let turnsPlayed = 0, lastN = null, extraDone = false;
const t0 = Date.now();
while (turnsPlayed < TURNS && Date.now() - t0 < 6 * 60 * 1000) {
  phones.forEach(bot); animateur();
  const s = tv.s;
  if (s.phase === 'roll' && s.move === null && lastN !== s.round + '-' + s.turn) { lastN = s.round + '-' + s.turn; turnsPlayed++; }
  if (s.phase === 'roll' && forced[turnsPlayed] && !forcedDone.has(turnsPlayed)) {
    forcedDone.add(turnsPlayed);
    gmc.send({ t: 'host', action: 'goto', cell: s.meta.board.findIndex(c => c.type === forced[turnsPlayed]) });
  }
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
const expected = /Pas maintenant|pas le moment|Trop tard|Déjà|déjà|Pas de question en cours|Rien à buzzer|Pas de vote|Pas de cible|Pas encore de question|Pas de thème|Vous ne participez pas|Attendez|éliminée|déjà pris le carré/i;
const unexpected = errors.filter(e => !expected.test(e) && !e.startsWith('TV-espion'));
console.log('Écran espion refusé comme animateur :', spyRefused ? 'oui ✅' : 'NON ❌');
console.log('Fuites de réponses :', leaks.length ? [...new Set(leaks)].join(' | ') : 'aucune ✅');
console.log('Erreurs inattendues :', unexpected.length ? unexpected.join(' | ') : 'aucune ✅');
const ok = s.phase === 'end' && spyRefused && !leaks.length && !unexpected.length && turnsPlayed >= TURNS && taunted.length >= 2;
console.log(ok ? '\n✅ Partie de bout en bout OK' : '\n❌ Problème détecté');
console.log('Mode NSFW vu par le MJ :', gmc.s && gmc.s.nsfw ? 'oui' : 'non');
for (const c of [tv, spy, gmc, ...phones]) c.ws.close();
process.exit(ok ? 0 : 1);
