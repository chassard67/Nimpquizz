// Simulation complète du moteur : 3 équipes, chaque type de case, jokers, vannes, fin de partie.
import * as G from '../src/game.js';
import { QCM, BMC } from '../src/content.js';

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
  if (!s.ch || s.phase !== 'challenge') return;
  // l'épreuve attend le maître du jeu
  if (s.ch.held) {
    check(G.view(s, { pid: 'p2' }).ch.held && !G.view(s, { pid: 'p2' }).ch.q, `épreuve en attente : rien de visible sur les téléphones (${s.ch.type})`);
    check(G.view(s, { role: 'gm', host: true, gm: true }).ch.held !== undefined, 'le MJ voit l\'épreuve en attente');
    check(host({ action: 'launch' }) === null && !s.ch.held, `lancement (${s.ch.type})`);
  }
  const ch = s.ch;
  seen.add(ch.fallback ? ch.type + '(fallback)' : ch.type);
  now = Math.max(now, ch.startsAt || now);
  // la vue téléphone ne doit jamais contenir la réponse
  const v = G.view(s, { pid: 'p2' });
  if (v.ch && v.ch.q) check(v.ch.q.a === undefined, `réponse cachée (${ch.type})`);
  if (v.ch && v.ch.item) check(!v.ch.item.src && !v.ch.item.img, `nom du fichier (= la réponse) caché aux téléphones (${ch.type})`);
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
  } else if (ch.kind === 'dcc' && ch.emo) {
    // Emojis : pas de propositions au départ ; cash direct ou carré
    const v0 = G.view(s, { pid: pidOf(ids[0]), role: 'phone' }), vt = G.view(s, { role: 'tv' });
    check(ch.stage === 'q' && !v0.ch.q.o && !vt.ch.q.o && v0.ch.q.q, 'emojis : les emojis sans les propositions');
    check(send(pidOf(ids[0]), { t: 'mode', mode: 'duo' }) !== null, 'emojis : pas de duo');
    check(send(pidOf(ids[0]), { t: 'answer', value: 0 }) !== null, 'emojis : pas de choix sans carré');
    check(send(pidOf(ids[0]), { t: 'mode', mode: 'carre' }) === null && G.view(s, { pid: pidOf(ids[0]), role: 'phone' }).ch.q.o.length === 4, 'emojis : le carré montre les 4 propositions');
    check(!G.view(s, { pid: pidOf(ids[1]), role: 'phone' }).ch.q.o, 'emojis : seulement pour l\'équipe qui a pris le carré');
    const sc = id => s.teams.find(t => t.id === id).score, b = Object.fromEntries(ids.map(id => [id, sc(id)]));
    send(pidOf(ids[0]), { t: 'answer', value: s.ch.q.a });
    send(pidOf(ids[1]), { t: 'answer', value: s.ch.q.o[s.ch.q.a].toLowerCase() });
    send(pidOf(ids[2]), { t: 'answer', value: 'Les Bronzés font du ski en Laponie' });
    const pts = id => (id === ch.teamId ? 1 : 0);
    check(s.phase === 'reveal' && s.ch.modes[ids[1]] === 'cash' && s.ch.ok[ids[1]] && !s.ch.ok[ids[2]], 'emojis : cash tapé directement');
    check(sc(ids[0]) - b[ids[0]] >= 2 + pts(ids[0]) && sc(ids[1]) - b[ids[1]] >= 4 + pts(ids[1]) && sc(ids[2]) === b[ids[2]], 'emojis : carré 2 pts, cash 4 pts');
  } else if (ch.kind === 'dcc') {
    const modes = ['duo', 'carre', 'cash'];
    ids.forEach((id, i) => check(send(pidOf(id), { t: 'mode', mode: modes[i % 3] }) === null, 'choix duo/carré/cash'));
    check(s.ch.stage === 'q', 'dcc : passage à la question');
    check(s.ch.startsAt - now >= 2000 && send(pidOf(ids[1]), { t: 'answer', value: 0 }) !== null, 'dcc : décompte de 2 s avant la question');
    now = s.ch.startsAt;
    const v = G.view(s, { pid: pidOf(ids[0]), role: 'phone' });
    check(v.ch.duo[ids[0]] && v.ch.duo[ids[0]].length === 2 && Object.keys(v.ch.duo).length === 1, 'duo : 2 propositions, visibles seulement par l\'équipe');
    send(pidOf(ids[0]), { t: 'answer', value: s.ch.duo[ids[0]][0] });
    send(pidOf(ids[1]), { t: 'answer', value: s.ch.q.a });
    send(pidOf(ids[2]), { t: 'answer', value: s.ch.q.o[s.ch.q.a].toUpperCase() + (s.ch.q.o[s.ch.q.a].length >= 5 ? 's' : '') });
    check(s.phase === 'reveal' && s.ch.ok[ids[2]] === true, 'cash : réponse tapée approximative acceptée');
    const before = s.teams.find(t => t.id === ids[2]).score;
    check(host({ action: 'cashToggle', teamId: ids[2] }) === null && s.teams.find(t => t.id === ids[2]).score < before, 'animateur peut refuser un cash');
  } else if (ch.kind === 'series') {
    if (ch.stage === 'theme') {
      check(send(pidOf(ids.find(i => i !== ch.teamId)), { t: 'theme', i: 0 }) !== null, 'seule l\'équipe qui joue choisit le thème');
      check(ch.themes.length === 3 && ch.themes.filter(t => t.taré).length === 1, 'burger : 3 thèmes dont 1 taré');
      send(pidOf(ch.teamId), { t: 'theme', i: 2 });
    }
    let guard = 0;
    while (s.phase === 'challenge' && guard++ < 6) {
      now = s.ch.startsAt;
      const v = G.view(s, { pid: 'p2', role: 'phone' });
      check(!v.ch.qs && v.ch.q && v.ch.q.a === undefined, 'série : questions suivantes et réponse cachées');
      for (const id of ids) send(pidOf(id), { t: 'answer', value: s.ch.q.n !== undefined ? 100 : Math.floor(rng() * s.ch.q.o.length) });
    }
    check(s.ch.res.length === 3, 'burger : 3 questions jouées');
  } else if (ch.kind === 'millions') {
    check(send(pidOf(ids.find(i => i !== ch.teamId)), { t: 'answer', value: 0 }) !== null, 'millionnaire : seule l\'équipe qui joue répond');
    let lvl = 0;
    while (s.phase === 'challenge' && lvl < 3) {
      now = s.ch.startsAt;
      send(pidOf(ch.teamId), { t: 'answer', value: s.ch.q.a }); lvl++;
      if (s.ch.stage === 'decide') send(pidOf(ch.teamId), { t: 'decide', go: lvl < 3 });
    }
    check(s.phase === 'reveal' && s.ch.bank === 3 && s.ch.end === 'stop', 'millionnaire : arrêt après 3 bonnes réponses = 3 pts');
  } else if (ch.kind === 'affiche') {
    const vp = G.view(s, { pid: 'p2', role: 'phone' }), vt = G.view(s, { role: 'tv', host: true });
    check(!vp.ch.q.clues && vt.ch.q.clues, 'affiche : indices visibles seulement sur la télé');
    send(pidOf(ids[0]), { t: 'answer', value: ch.q.a });
    now += 15000; send(pidOf(ids[1]), { t: 'answer', value: ch.q.a });
    now += 15000; send(pidOf(ids[2]), { t: 'answer', value: (ch.q.a + 1) % 4 });
    check(s.ch.seen[ids[0]] === 1 && s.ch.seen[ids[1]] === 3, 'affiche : nombre d\'indices vus');
  } else if (ch.kind === 'number') {
    for (const id of ids) send(pidOf(id), { t: 'answer', value: String(Math.round(ch.q.a * (0.5 + rng()))) });
  } else if (ch.kind === 'open') {
    // une proposition par joueur, puis chacun vote pour une proposition d'une autre équipe
    const pids = Object.keys(s.players);
    check(ch.players.length === pids.length, 'vote par joueur : tous les joueurs écrivent');
    if (ch.q.words) {
      // Titre débile : le mot est glissé n'importe où dans le titre
      check(send('p1', { t: 'answer', value: { pos: 0, word: '' } }) !== null, 'titre débile : mot vide refusé');
      check(send('p1', { t: 'answer', value: { pos: 99, word: 'Zazat' } }) !== null, 'titre débile : position hors du titre refusée');
      check(send('p1', { t: 'answer', value: { pos: 1, word: 'Zazat' } }) === null, 'titre débile : mot inséré');
      const w = ch.q.words;
      check(s.ch.texts.p1.v === [w[0], 'Zazat', ...w.slice(1)].join(' ') && s.ch.texts.p1.ins === 1, 'titre débile : mot au bon endroit');
      send('p2', { t: 'answer', value: { pos: 0, word: 'Mega' } });
      send('p3', { t: 'answer', value: { pos: w.length, word: 'Zizi' } });
      check(s.ch.texts.p3.v.endsWith(' Zizi'), 'titre débile : mot à la fin');
      check(s.ch.stage === 'write', 'on attend tous les joueurs, pas une réponse par équipe');
      send('p4', { t: 'answer', value: { pos: 2, word: 'Prout' } });
    } else {
      for (const p of pids.slice(0, -1)) send(p, { t: 'answer', value: 'Une blague nulle de ' + p });
      check(send('p1', { t: 'answer', value: 'encore' }) !== null && s.ch.stage === 'write', 'une seule proposition par joueur');
      send(pids[pids.length - 1], { t: 'answer', value: 'La dernière' });
    }
    check(s.ch.stage === 'vote' && s.ch.entries.length === pids.length, 'passage au vote');
    const vp = G.view(s, { pid: 'p1', role: 'phone' }), vt = G.view(s, { role: 'tv' });
    check(vp.ch.entries.filter(e => e.own).length === 2 && vp.ch.entries.every(e => !e.teamId && !e.pid && !e.name) && vp.ch.canVote, 'vote : propositions anonymes, celles de son équipe repérées');
    check(vt.ch.entries.length === pids.length && vt.ch.entries.every(e => !e.teamId && !e.own), 'vote : la télé affiche toutes les propositions, anonymes');
    check(send('p1', { t: 'vote', i: vp.ch.entries.find(e => e.own).i }) !== null, 'vote pour son équipe refusé');
    const idx = tid => s.ch.entries.findIndex(e => e.teamId === tid);
    // Castors : 3 votes (p1, p3, p4) · Licornes : 1 vote (p2) → Castors gagne
    for (const p of pids) send(p, { t: 'vote', i: idx(s.players[p].teamId === ids[1] ? ids[2] : ids[1]) });
    check(s.phase === 'reveal' && s.ch.winners[0] === ids[1] && s.ch.tally[ids[1]] === 3, 'vote : les votes s\'additionnent, l\'équipe la plus votée gagne');
    const vr = G.view(s, { role: 'tv' });
    check(vr.ch.entries.every(e => e.teamId && e.votes !== undefined && !e.pid), 'révélation : auteurs et votes dévoilés, sans identifiant');
  } else if (ch.kind === 'bac') {
    for (const id of ids) send(pidOf(id), { t: 'answer', value: ch.cats.map((_, i) => i % 2 ? ch.letter + 'truc' : 'zzz') });
    check(s.ch.stage === 'review', 'bac en correction');
    host({ action: 'bacToggle', teamId: ids[0], i: 0 });
    check(host({ action: 'bacValidate' }) === null, 'bac validé');
  } else if (ch.kind === 'bmc') {
    const pids = Object.keys(s.players);
    check(ch.stage === 'write' && ch.players.length === pids.length, 'bmc : tous les joueurs ont des cartes');
    check(!s.nsfw && !BMC.noires.find(c => c.t === ch.black.t).nsfw, 'bmc : carte noire gentille par défaut');
    for (const p of pids) {
      const h = s.bmc.hands[p];
      check(h.length === 5 && h.every(i => !BMC.blanches[i].nsfw), 'bmc : 5 cartes gentilles en main');
      const v = G.view(s, { pid: p, role: 'phone' });
      check(v.bmcHand && v.bmcHand.length === 5 && !v.bmc && !v.ch.picks && !v.ch.players, 'bmc : chacun ne voit que sa main');
    }
    const p0 = pids[0], hand0 = [...s.bmc.hands[p0]];
    check(send(p0, { t: 'bmc', cards: [999] }) !== null, 'bmc : carte hors de la main refusée');
    const pick = hand0.slice(0, ch.black.n);
    check(send(p0, { t: 'bmc', cards: pick }) === null, 'bmc : carte jouée');
    check(send(p0, { t: 'bmc', cards: pick }) !== null, 'bmc : on ne joue qu\'une fois');
    check(s.bmc.hands[p0].length === 5 && pick.every(i => !s.bmc.hands[p0].includes(i)), 'bmc : la main est complétée à 5');
    for (const p of pids.slice(1)) send(p, { t: 'bmc', cards: s.bmc.hands[p].slice(0, ch.black.n) });
    check(s.ch.stage === 'vote' && s.ch.entries.length === pids.length, 'bmc : toutes les cartes jouées, place au vote');
    const vj = G.view(s, { role: 'tv', host: true }), vg = G.view(s, { role: 'gm', host: true, gm: true }, {}), vp = G.view(s, { pid: 'p1', role: 'phone' });
    check(vj.ch.entries.every(e => !e.teamId && !e.pid && !e.name) && vg.ch.entries.every(e => !e.teamId && !e.pid), 'bmc : cartes anonymes pendant le vote');
    check(vp.ch.entries.filter(e => e.own).length === 2, 'bmc : le téléphone sait quelles cartes sont de son équipe (pour les cacher)');
    check(host({ action: 'tieBreak', teamId: 'zzz' }) !== null, 'bmc : équipe inconnue refusée');
    const idx = tid => s.ch.entries.findIndex(e => e.teamId === tid);
    const wt = s.teams.find(t => t.id === ids[2]), before = wt.score;
    for (const p of pids) send(p, { t: 'vote', i: idx(s.players[p].teamId === ids[2] ? ids[1] : ids[2]) });
    check(s.phase === 'reveal' && s.ch.winners[0] === ids[2], 'bmc : la plus votée gagne');
    check(wt.score > before, 'bmc : points pour l\'équipe du gagnant');
    const vr = G.view(s, { role: 'tv' });
    check(vr.ch.entries[s.ch.winner].teamId === ids[2] && !vr.ch.entries[s.ch.winner].pid, 'bmc : auteurs dévoilés à la révélation, sans identifiant');
  } else if (ch.kind === 'buzz10') {
    check(send(pidOf(ids[0]), { t: 'buzz' }) !== null && ch.taps[ids[0]] === undefined, 'buzzer 10 s : pas de buzz avant le décompte');
    check(host({ action: 'go' }) === null && ch.goAt === now + G.T.b10cd, 'buzzer 10 s : le MJ lance le décompte 3-2-1');
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
    // fiche avec QCM : question bonus pour l'équipe qui a trouvé
    if (s.ch.kind === 'dcc' && s.ch.bonusQcm) {
      seen.add(ch.type + '+bonus');
      const w = s.ch.participants[0];
      check(send(pidOf(w), { t: 'mode', mode: 'carre' }) === null, 'question bonus : choix du mode');
      now = Math.max(now, s.ch.startsAt);
      check(send(pidOf(w), { t: 'answer', value: s.ch.q.a }) === null && s.phase === 'reveal', 'question bonus : réponse');
    }
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
  if (turns % 2) send(pidOf(t.id), { t: 'go' }); else wait(15000);
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
for (let k = 0; k < 4 && !seen.has('emojis') && s.phase === 'roll'; k++) playTurn('emojis');
check(seen.has('emojis'), 'case emojis jouée');

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

// ── option NSFW (téléphone du maître du jeu)
check(Object.values(s.bmc.hands).flat().every(i => !BMC.blanches[i].nsfw), 'mains gentilles tant que le NSFW est coupé');
check(host({ action: 'setNsfw', on: true }) === null && s.nsfw === true, 'NSFW activé');
for (let k = 0; k < 6; k++) { const p = Object.keys(s.bmc.hands)[0]; s.bmc.played.push(...s.bmc.hands[p].splice(0, 5)); G.handle(s, { t: 'host', action: 'setNsfw', on: false }, { now, host: true, rng }); G.handle(s, { t: 'host', action: 'setNsfw', on: true }, { now, host: true, rng }); }
check(Object.values(s.bmc.hands).flat().some(i => BMC.blanches[i].nsfw), 'NSFW : des cartes limites arrivent dans les mains');
check(host({ action: 'setNsfw', on: false }) === null && Object.values(s.bmc.hands).flat().every(i => !BMC.blanches[i].nsfw) && Object.values(s.bmc.hands).every(h => h.length === 5), 'NSFW coupé : cartes limites retirées, mains complètes');

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
