// ─────────────────────────────────────────────────────────────
//  LE GRAND N'IMPORTE QUIZ — moteur de jeu (pur, sans réseau)
//  L'état est un objet JSON. handle() applique un message, tick() gère les chronos.
// ─────────────────────────────────────────────────────────────
import { QCM, NUMBERS, OPEN, BAC, FAMILLE, CURSES, MEDIA, TAUNTS, TEAM_NAMES, CULTURE_THEMES, CONTRARIO, AFFICHES, BURGER, MILLIONS, DOUBLESENS, TITRES } from './content.js';

// 32 cases : 10 en haut, 6 à droite, 10 en bas, 6 à gauche
export const BOARD = [
  'depart', 'culture', 'bt_actuel', 'emojis', 'vol', 'bt_films', 'plusoumoins', 'millions', 'buzz10', 'pochette',
  'paroles', 'malediction', 'burger', 'mensonge', 'bt_intemporel', 'video',
  'famille', 'duel', 'affiche', 'bt_series', 'contrario', 'bac', 'envers', 'echange', 'culture', 'unenote',
  'replique', 'sansreponse', 'instruments', 'doublesens', 'noix', 'titredebile'
];

export const TYPES = {
  depart:        { label: 'Départ', group: 'dep', kind: 'info' },
  culture:       { label: 'Culture G', group: 'q', kind: 'dcc', rule: 'Duo, carré ou cash ? Choisissez avant de voir les réponses : duo 1 pt, carré 2 pts, cash 4 pts. +1 pour l\'équipe qui joue.' },
  contrario:     { label: 'A contrario', group: 'q', kind: 'qcm', rule: 'Titre ou expression à l\'envers : retrouvez l\'original. 2 pts pour l\'équipe qui joue, 1 pt pour les autres.' },
  burger:        { label: 'Burger Quiz', group: 'q', kind: 'series', rule: 'L\'équipe qui joue choisit un thème parmi 3. Trois questions, tout le monde répond : 2 pts / 1 pt chacune.' },
  millions:      { label: 'Millionnaire', group: 'q', kind: 'millions', rule: 'Cinq questions de plus en plus dures, seule l\'équipe qui joue répond. 1, 2, 3, 5 puis 8 pts. On peut s\'arrêter à tout moment ; palier assuré à 2 pts.' },
  affiche:       { label: 'Affiche mystère', group: 'v', kind: 'affiche', rule: 'Les indices de l\'affiche tombent un par un. Répondez tôt : 4 pts au 1er indice, 3, 2, puis 1. +1 pour l\'équipe qui joue.' },
  video:         { label: 'Vidéo culte', group: 'v', kind: 'series', media: 'video', rule: 'Regardez bien… La vidéo s\'arrête, puis les questions tombent. 2 pts / 1 pt, question bonus 1 pt.' },
  unenote:       { label: 'Une seule note', group: 'bt', kind: 'media', media: 'audio', rule: 'Une note. Une seule. Buzzez si vous reconnaissez : 3 pts.' },
  instruments:   { label: 'Couche par couche', group: 'bt', kind: 'media', media: 'layers', rule: 'Batterie, puis basse, puis le reste… Buzzez tôt : 4 pts, puis 3, 2, 1.' },
  noix:          { label: 'À la noix', group: 'q', kind: 'qcm', rule: 'Question absurde, mais vraie réponse. 2 pts pour l\'équipe qui joue, 1 pt pour les autres.' },
  emojis:        { label: 'Emojis', group: 'q', kind: 'qcm', rule: 'Devinez le titre ou l\'expression. 2 pts pour l\'équipe qui joue, 1 pt pour les autres.' },
  mensonge:      { label: 'Grand mensonge', group: 'q', kind: 'qcm', rule: 'Deux affirmations sont vraies. Trouvez le mensonge. 2 pts / 1 pt.' },
  plusoumoins:   { label: 'Plus ou moins', group: 'q', kind: 'number', rule: 'Donnez un nombre. L\'équipe la plus proche prend 2 pts, +1 si pile poil.' },
  doublesens:    { label: 'Double sens', group: 'q', kind: 'open', rule: 'Une phrase qui marche dans les deux situations. Écrivez, puis votez pour la meilleure des autres équipes : 2 pts.' },
  titredebile:   { label: 'Titre débile', group: 'q', kind: 'open', rule: 'Ajoutez UN mot au titre pour le rendre débile. Écrivez, puis votez pour le meilleur des autres : 2 pts.' },
  sansreponse:   { label: 'Sans réponse', group: 'q', kind: 'open', rule: 'Pas de bonne réponse : écrivez la plus drôle, puis votez. La plus votée prend 2 pts.' },
  bac:           { label: 'Le Bac', group: 'q', kind: 'bac', rule: 'Une lettre, 5 catégories. 1 pt par mot validé, +1 si personne d\'autre ne l\'a.' },
  bt_actuel:     { label: 'BT Actuel', group: 'bt', kind: 'media', media: 'audio', rule: 'Buzzez dès que vous reconnaissez. Bonne réponse : 2 pts.' },
  bt_intemporel: { label: 'BT Intemporel', group: 'bt', kind: 'media', media: 'audio', rule: 'Buzzez dès que vous reconnaissez. Bonne réponse : 2 pts.' },
  bt_series:     { label: 'BT Séries', group: 'bt', kind: 'media', media: 'audio', rule: 'Buzzez dès que vous reconnaissez le générique. 2 pts.' },
  bt_films:      { label: 'BT Films', group: 'bt', kind: 'media', media: 'audio', rule: 'Buzzez dès que vous reconnaissez le film. 2 pts.' },
  paroles:       { label: "N'oubliez pas les paroles", group: 'bt', kind: 'media', media: 'audio', rule: 'La musique coupe : chantez la suite. 2 pts.' },
  envers:        { label: "À l'envers", group: 'bt', kind: 'media', media: 'audio', rule: 'Le morceau passe à l\'envers. Buzzez ! 2 pts.' },
  replique:      { label: 'Réplique culte', group: 'bt', kind: 'media', media: 'audio', rule: 'Une réplique, trouvez le film. 2 pts.' },
  pochette:      { label: 'Pochette floutée', group: 'v', kind: 'media', media: 'image', rule: 'L\'image se défloute. Buzzez dès que vous savez. 2 pts.' },
  buzz10:        { label: 'Buzzer 10 s', group: 'bz', kind: 'buzz10', rule: 'Au GO, comptez 10 secondes dans votre tête et appuyez. Le plus proche prend 2 pts.' },
  famille:       { label: 'Famille en or', group: 'bz', kind: 'famille', rule: 'Trouvez les réponses du sondage. 3 pts pour la 1re, 2 pour les 2e et 3e, 1 pour les autres.' },
  duel:          { label: 'Duel', group: 's', kind: 'duel', rule: 'Choisissez un adversaire. Le premier qui trouve gagne 3 pts.' },
  vol:           { label: 'Vol de points', group: 's', kind: 'target', rule: 'Choisissez une victime : vous lui volez 3 pts.' },
  echange:       { label: 'Échange de place', group: 's', kind: 'target', rule: 'Choisissez une équipe : vous échangez vos places sur le plateau.' },
  malediction:   { label: 'Malédiction', group: 's', kind: 'curse', rule: 'Le sort s\'abat sur vous.' }
};

export const JOKERS = {
  double:   { label: 'Points ×2', icon: '💥', desc: 'Vos prochains points gagnés sont doublés.' },
  relance:  { label: 'Relancer le dé', icon: '🎲', desc: 'Après un lancer, relancez le dé.' },
  vol:      { label: 'Voleur', icon: '🦹', desc: 'Volez 3 points à l\'équipe de votre choix.' },
  blocage:  { label: 'Blocage', icon: '⛔', desc: 'Une équipe passe son prochain tour.' },
  bouclier: { label: 'Bouclier', icon: '🛡️', desc: 'Vous protège du prochain vol, blocage ou échange.' },
  fifty:    { label: '50/50', icon: '✂️', desc: 'Retire deux mauvaises réponses à un QCM à 4 choix.' }
};

export const COLORS = ['#FF5A36', '#2EC4FF', '#F15BFF', '#9BE564', '#FFB020', '#00E0C6'];

export const T = {
  grace: 2500, rolled: 12000, qcm: 25000, duel: 20000, number: 30000, write: 60000, vote: 30000,
  bac: 75000, review: 120000, famille: 45000, pick: 20000, buzzReady: 3000, buzzMax: 20000,
  media: 45000, mediaAnswer: 15000, reveal: 120000,
  mode: 15000, series: 20000, millions: 40000, decide: 25000, clue: 7000, layer: 8000, video: 90000
};

export const LADDER = [1, 2, 3, 5, 8];   // gains du Millionnaire
const LADDER_SAFE = 1;                  // palier assuré : après la 2e question
const DCC_PTS = { duo: 1, carre: 2, cash: 4 };

const MAX_TEAMS = 6;

// Infos fixes envoyées aux écrans (plateau, règles, jokers, vannes)
const META = {
  board: BOARD.map(type => ({ type, label: TYPES[type].label, group: TYPES[type].group })),
  jokers: JOKERS, colors: COLORS, taunts: TAUNTS, teamNames: TEAM_NAMES,
  timers: { media: 45000, buzzMax: 20000, clue: 7000, layer: 8000 },
  ladder: LADDER, dcc: DCC_PTS,
  cultureThemes: { gen: 'Général', ...Object.fromEntries(Object.entries(CULTURE_THEMES).map(([k, v]) => [k, v.label])) }
};

// Banques de questions à choix multiples par type de case
const POOLS = {
  noix: QCM.noix, emojis: QCM.emojis, mensonge: QCM.mensonge, contrario: CONTRARIO
};
// Épreuves où l'on écrit puis l'on vote
const OPEN_POOLS = {
  sansreponse: OPEN.map(q => ({ q })),
  doublesens: DOUBLESENS.map(d => ({ q: `Une phrase qui marche aussi bien à ${d.a} qu'à ${d.b}`, sub: d.ex ? `Exemple : ${d.ex}` : '' })),
  titredebile: TITRES.map(t => ({ q: `« ${t} »`, sub: 'Ajoutez UN seul mot pour le rendre débile. Ex. : Star Wars → Star Wars Zazat' }))
};
const CULTURE_ALL = { gen: QCM.culture, ...Object.fromEntries(Object.entries(CULTURE_THEMES).map(([k, v]) => [k, v.q])) };

// ─── utilitaires ─────────────────────────────────────────────
export function norm(s) {
  return String(s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
}
const clampText = (s, n) => String(s ?? '').replace(/\s+/g, ' ').trim().slice(0, n);
const team = (s, id) => s.teams.find(t => t.id === id);
const active = s => s.teams[s.turn];
const others = (s, id) => s.teams.filter(t => t.id !== id);

function pickIndex(s, key, len, rng) {
  if (!len) return -1;
  let used = s.used[key] || [];
  if (used.length >= len) used = [];
  const free = [];
  for (let i = 0; i < len; i++) if (!used.includes(i)) free.push(i);
  const i = free[Math.floor(rng() * free.length)];
  s.used[key] = [...used, i];
  return i;
}

// Mélange les propositions d'une question (la bonne réponse peut être écrite en premier dans content.js)
function shuffleQ(q, rng) {
  if (!q || !Array.isArray(q.o)) return { ...q };
  const idx = q.o.map((_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
  return { ...q, o: idx.map(i => q.o[i]), a: idx.indexOf(q.a) };
}

// Culture G : on fait tourner les thèmes (pas deux fois le même d'affilée)
function culturePick(s, rng) {
  const themes = Object.keys(CULTURE_ALL).filter(k => CULTURE_ALL[k].length);
  const recent = s.used.cultRecent || [];
  let cand = themes.filter(k => !recent.includes(k));
  if (!cand.length) cand = themes;
  const th = cand[Math.floor(rng() * cand.length)];
  s.used.cultRecent = [...recent, th].slice(-Math.min(3, themes.length - 1));
  const i = pickIndex(s, 'c_' + th, CULTURE_ALL[th].length, rng);
  return { ...shuffleQ(CULTURE_ALL[th][i], rng), theme: th };
}

// Réponse libre (cash) : tolère les fautes de frappe et les articles
function lev(a, b) {
  const m = a.length, n = b.length, d = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 1; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[m][n];
}
const STOP = /^(le|la|les|l|un|une|des|du|de|d|the) /;
export function cashMatch(given, q) {
  const g = norm(given).replace(STOP, '');
  if (!g) return false;
  const targets = [q.o[q.a], ...(q.k || [])].map(x => norm(x).replace(STOP, ''));
  return targets.some(c => g === c || (c.length >= 4 && g.length >= 3 && (g.includes(c) || (c.includes(g) && g.length >= c.length * 0.6))) || lev(g, c) <= Math.floor(c.length / 5));
}

function feed(s, k, text, extra = {}) {
  s.feed.push({ id: ++s.seq, k, text, at: s._now, ...extra });
  if (s.feed.length > 40) s.feed.splice(0, s.feed.length - 40);
}

// Ajoute des points en appliquant ×2 et ÷2. Retourne les points réellement gagnés.
function award(s, t, pts) {
  let p = pts;
  if (p > 0 && t.armed.halve) { p = Math.ceil(p / 2); t.armed.halve = false; feed(s, 'curse', `${t.name} : malédiction, points divisés par deux 🪓`); }
  if (p > 0 && t.armed.double) { p *= 2; t.armed.double = false; feed(s, 'joker', `${t.name} : joker ×2 déclenché 💥`); }
  const before = t.score;
  t.score = Math.max(0, t.score + p);
  const real = t.score - before;
  if (s.ch) s.ch.gains[t.id] = (s.ch.gains[t.id] || 0) + real;
  return real;
}

function transfer(s, from, to, n) {
  const k = Math.min(n, from.score);
  from.score -= k; to.score += k;
  if (s.ch) {
    s.ch.gains[from.id] = (s.ch.gains[from.id] || 0) - k;
    s.ch.gains[to.id] = (s.ch.gains[to.id] || 0) + k;
  }
  return k;
}

function shielded(s, victim, attacker, what) {
  if (!victim.armed.shield) return false;
  victim.armed.shield = false;
  feed(s, 'joker', `🛡️ ${victim.name} sort le bouclier ! ${attacker.name} se prend un mur (${what} annulé).`);
  return true;
}

// ─── création ────────────────────────────────────────────────
export function createGame(code, now) {
  return {
    v: 1, code, createdAt: now, hostKey: null, phase: 'lobby', durationMin: 120,
    teams: [], players: {}, turn: 0, round: 1, move: null, moveSeq: 0, ch: null,
    used: {}, feed: [], seq: 0, startedAt: null, endAt: null, deadline: null, lastTaunt: {}
  };
}

function newTeam(s, name, color) {
  return {
    id: 't' + (s.seq + 1) + Math.random().toString(36).slice(2, 6), name, color, pos: 0, score: 0,
    jokers: Object.fromEntries(Object.keys(JOKERS).map(k => [k, 1])),
    armed: { double: false, shield: false, halve: false }, skip: 0, curses: []
  };
}

// ─── point d'entrée des messages ─────────────────────────────
// ctx = { now, rng, pid, host }  → retourne un message d'erreur ou null
export function handle(s, msg, ctx) {
  s._now = ctx.now;
  const rng = ctx.rng || Math.random;
  const me = ctx.pid ? s.players[ctx.pid] : null;
  const myTeam = me ? team(s, me.teamId) : null;
  const t = msg && msg.t;

  // ── animateur (écran TV)
  if (t === 'host') {
    if (!ctx.host) return "Seul l'écran principal peut faire ça.";
    return hostAction(s, msg, ctx, rng);
  }

  // ── lobby
  if (t === 'createTeam') {
    if (s.teams.length >= MAX_TEAMS) return 'Trop d\'équipes ! 6 maximum.';
    const name = clampText(msg.name, 28) || 'Équipe sans nom (et sans talent)';
    if (s.teams.some(x => norm(x.name) === norm(name))) return 'Ce nom est déjà pris.';
    const color = COLORS.includes(msg.color) && !s.teams.some(x => x.color === msg.color)
      ? msg.color : COLORS.find(c => !s.teams.some(x => x.color === c));
    const nt = newTeam(s, name, color);
    if (s.phase !== 'lobby') nt.pos = 0;
    s.teams.push(nt);
    s.players[ctx.pid] = { teamId: nt.id, name: clampText(msg.player, 20) };
    feed(s, 'info', `Nouvelle équipe : ${name} 🎉`);
    return null;
  }
  if (t === 'joinTeam') {
    const tm = team(s, msg.teamId);
    if (!tm) return 'Équipe introuvable.';
    s.players[ctx.pid] = { teamId: tm.id, name: clampText(msg.player, 20) };
    return null;
  }
  if (t === 'leaveTeam') { delete s.players[ctx.pid]; return null; }

  if (!myTeam) return 'Rejoignez d\'abord une équipe.';

  if (t === 'taunt') {
    const last = s.lastTaunt[ctx.pid] || 0;
    if (ctx.now - last < 4000) return 'Doucement sur les vannes, une toutes les 4 secondes.';
    const text = clampText(msg.text, 120);
    if (!text) return 'Message vide.';
    const to = msg.to === 'all' ? null : team(s, msg.to);
    if (msg.to !== 'all' && !to) return 'Destinataire inconnu.';
    s.lastTaunt[ctx.pid] = ctx.now;
    feed(s, 'taunt', text, { from: myTeam.id, to: to ? to.id : 'all' });
    return null;
  }

  if (t === 'joker') return useJoker(s, myTeam, msg, ctx, rng);

  if (s.phase === 'lobby' || s.phase === 'end') return 'Pas maintenant.';

  if (t === 'roll') {
    if (s.phase !== 'roll') return 'Pas le moment de lancer.';
    if (active(s).id !== myTeam.id) return 'Ce n\'est pas votre tour, petits malins.';
    doRoll(s, myTeam, rng, ctx.now);
    return null;
  }
  if (t === 'go') {
    if (s.phase !== 'rolled' || active(s).id !== myTeam.id) return 'Pas maintenant.';
    applyMove(s, ctx, rng);
    return null;
  }
  if (t === 'pick') return pickTarget(s, myTeam, msg.teamId, ctx, rng);
  if (t === 'answer') return answer(s, myTeam, msg.value, ctx, rng);
  if (t === 'vote') return vote(s, myTeam, msg.teamId, ctx, rng);
  if (t === 'buzz') return buzz(s, myTeam, ctx, rng);
  if (t === 'mode') return chooseMode(s, myTeam, msg.mode, ctx, rng);
  if (t === 'theme') return chooseTheme(s, myTeam, Number(msg.i), ctx, rng);
  if (t === 'decide') return millionsDecide(s, myTeam, !!msg.go, ctx, rng);
  return 'Message inconnu.';
}

function hostAction(s, msg, ctx, rng) {
  const a = msg.action;
  if (a === 'setDuration') { s.durationMin = Math.max(15, Math.min(300, Number(msg.min) || 120)); return null; }
  if (a === 'removeTeam') {
    if (s.phase !== 'lobby') return 'Impossible en cours de partie.';
    s.teams = s.teams.filter(x => x.id !== msg.teamId);
    for (const p in s.players) if (s.players[p].teamId === msg.teamId) delete s.players[p];
    return null;
  }
  if (a === 'start') {
    if (s.phase !== 'lobby') return 'Déjà commencée.';
    if (s.teams.length < 2) return 'Il faut au moins 2 équipes.';
    // ordre de passage au hasard
    for (let i = s.teams.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [s.teams[i], s.teams[j]] = [s.teams[j], s.teams[i]]; }
    s.phase = 'roll'; s.turn = 0; s.round = 1; s.startedAt = ctx.now; s.endAt = ctx.now + s.durationMin * 60000;
    s.deadline = null;
    feed(s, 'info', `C'est parti ! ${active(s).name} ouvre le bal.`);
    return null;
  }
  if (a === 'adjust') {
    const tm = team(s, msg.teamId); if (!tm) return 'Équipe inconnue.';
    const d = Math.trunc(Number(msg.delta) || 0);
    tm.score = Math.max(0, tm.score + d);
    feed(s, 'points', `L'animateur ${d > 0 ? 'offre' : 'retire'} ${Math.abs(d)} pt${Math.abs(d) > 1 ? 's' : ''} ${d > 0 ? 'à' : 'aux'} ${tm.name}. ${d > 0 ? 'Corruption ?' : 'Sanction divine.'}`);
    return null;
  }
  if (a === 'end') { endGame(s); return null; }
  if (s.phase === 'lobby' || s.phase === 'end') return 'Pas maintenant.';
  // Commande cachée (tests / animateur tricheur) : choisir la case d'arrivée après un lancer
  if (a === 'forceCell') {
    if (s.phase !== 'rolled') return 'Seulement juste après un lancer.';
    const i = Number(msg.cell);
    if (!(i >= 0 && i < BOARD.length)) return 'Case inconnue.';
    s.move.to = i; s.move.passed = false;
    return null;
  }
  if (a === 'next') {
    if (s.phase === 'reveal') { nextTurn(s, ctx); return null; }
    if (s.phase === 'rolled') { applyMove(s, ctx, rng); return null; }
    if (s.phase === 'challenge') { timeout(s, ctx, rng); return null; }
    return 'Rien à passer.';
  }
  if (a === 'skip') {
    if (s.phase === 'challenge') { s.ch.skipped = true; toReveal(s, ctx, 'Épreuve passée par l\'animateur. Personne ne marque, tout le monde boude.'); return null; }
    if (s.phase === 'reveal') { nextTurn(s, ctx); return null; }
    return 'Rien à passer.';
  }
  if (a === 'bacToggle') {
    const ch = s.ch;
    if (s.phase !== 'challenge' || !ch || ch.kind !== 'bac' || ch.stage !== 'review') return 'Pas maintenant.';
    const row = ch.valid[msg.teamId]; if (!row) return 'Équipe inconnue.';
    const i = Number(msg.i); if (!(i >= 0 && i < row.length)) return 'Case inconnue.';
    row[i] = !row[i];
    return null;
  }
  if (a === 'bacValidate') {
    if (s.phase !== 'challenge' || !s.ch || s.ch.kind !== 'bac' || s.ch.stage !== 'review') return 'Pas maintenant.';
    resolve(s, ctx, rng); return null;
  }
  if (a === 'judge') {
    const ch = s.ch;
    if (s.phase !== 'challenge' || !ch || ch.kind !== 'media' || ch.stage !== 'answer') return 'Personne n\'a buzzé.';
    ch.bonus = !!msg.bonus;
    judgeMedia(s, !!msg.ok, ctx, rng); return null;
  }
  if (a === 'mediaDone') {
    const ch = s.ch;
    if (s.phase !== 'challenge' || !ch || ch.stage !== 'video') return null;
    startSeriesQ(s, 0, ctx); return null;
  }
  if (a === 'cashToggle') {
    const ch = s.ch;
    if (s.phase !== 'reveal' || !ch || ch.kind !== 'dcc' || !ch.ok || ch.modes[msg.teamId] !== 'cash' || !ch.answers[msg.teamId]) return 'Rien à corriger.';
    const tm = team(s, msg.teamId);
    const pts = DCC_PTS.cash + (tm.id === ch.teamId ? 1 : 0);
    ch.ok[tm.id] = !ch.ok[tm.id];
    const d = ch.ok[tm.id] ? pts : -Math.min(pts, tm.score);
    tm.score += d; ch.gains[tm.id] = (ch.gains[tm.id] || 0) + d;
    feed(s, 'points', `L'animateur ${ch.ok[tm.id] ? 'accepte' : 'refuse'} la réponse cash de ${tm.name} (${d > 0 ? '+' : ''}${d}).`);
    return null;
  }
  return 'Action inconnue.';
}

// ─── dé et déplacement ───────────────────────────────────────
function doRoll(s, tm, rng, now) {
  const r = 1 + Math.floor(rng() * 6);
  const from = tm.pos;
  s.move = { teamId: tm.id, from, roll: r, to: (from + r) % BOARD.length, passed: from + r >= BOARD.length, n: ++s.moveSeq, rerolled: !!(s.move && s.move.teamId === tm.id && s.phase === 'rolled') };
  s.phase = 'rolled';
  s.deadline = now + T.rolled;
}

function applyMove(s, ctx, rng) {
  const tm = team(s, s.move.teamId);
  tm.pos = s.move.to;
  s.move.done = true;
  s.ch = null;
  if (s.move.passed) {
    s.ch = { gains: {} };
    const p = award(s, tm, 2);
    feed(s, 'points', `${tm.name} fait un tour complet : +${p} pts 🏁`);
  }
  startCell(s, BOARD[tm.pos], ctx, rng, s.ch ? s.ch.gains : {});
}

// ─── démarrage d'une case ────────────────────────────────────
function startCell(s, type, ctx, rng, gains = {}) {
  const now = ctx.now;
  const meta = TYPES[type];
  const tm = active(s);
  const base = { type, kind: meta.kind, label: meta.label, group: meta.group, rule: meta.rule || '', teamId: tm.id, gains, startsAt: now + T.grace, cell: tm.pos };
  const all = s.teams.map(x => x.id);

  if (meta.kind === 'info') {
    s.ch = { ...base, text: 'Pause pipi ! Il ne se passe rien. Profitez-en pour remplir les verres. 🍻' };
    return toReveal(s, ctx, s.ch.text);
  }
  if (meta.media) {
    const pool = (MEDIA[type] || []).filter(x => x.src || x.img || (Array.isArray(x.layers) && x.layers.length));
    if (!pool.length) {
      s.ch = { ...base, kind: 'qcm', fallback: type, q: culturePick(s, rng), participants: all, answers: {}, fifty: {}, deadline: now + T.grace + T.qcm,
        rule: 'Le contenu de cette case n\'est pas encore chargé. Question de consolation, 2 pts / 1 pt.' };
      s.phase = 'challenge'; s.deadline = s.ch.deadline; return;
    }
    const i = pickIndex(s, 'm_' + type, pool.length, rng);
    const item = JSON.parse(JSON.stringify(pool[i]));
    if (meta.kind === 'series') {
      // vidéo culte : la vidéo d'abord, les questions ensuite
      const dur = item.stop != null ? Math.max(3000, (item.stop - (item.start || 0)) * 1000 + 1500) : T.video;
      s.ch = { ...base, media: 'video', item, qs: (item.qs || []).map(q => shuffleQ(q, rng)), res: [], stage: 'video', deadline: now + T.grace + dur };
      s.phase = 'challenge'; s.deadline = s.ch.deadline; return;
    }
    s.ch = { ...base, media: meta.media, item, stage: 'play', buzzer: null, excluded: [], deadline: now + T.grace + (meta.media === 'layers' ? Math.max(T.media, item.layers.length * T.layer + 15000) : T.media) };
    s.phase = 'challenge'; s.deadline = s.ch.deadline; return;
  }
  if (meta.kind === 'qcm') {
    const pool = POOLS[type];
    const i = pickIndex(s, type, pool.length, rng);
    s.ch = { ...base, q: shuffleQ(pool[i], rng), participants: all, answers: {}, fifty: {}, deadline: now + T.grace + T.qcm };
  } else if (meta.kind === 'dcc') {
    s.ch = { ...base, q: culturePick(s, rng), stage: 'mode', modes: {}, duo: {}, participants: all, answers: {}, fifty: {}, deadline: now + T.grace + T.mode };
  } else if (meta.kind === 'series') {
    // Burger Quiz : 2 thèmes normaux + 1 taré, dans le désordre
    const normal = BURGER.map((b, i) => i).filter(i => !BURGER[i].taré);
    const tare = BURGER.map((b, i) => i).filter(i => BURGER[i].taré);
    const pickFrom = (arr, key) => { const used = s.used[key] || []; let free = arr.filter(i => !used.includes(i)); if (!free.length) { free = arr; s.used[key] = []; } const i = free[Math.floor(rng() * free.length)]; s.used[key] = [...(s.used[key] || []), i]; return i; };
    const a = pickFrom(normal, 'burgerN'); let b = pickFrom(normal, 'burgerN'); if (b === a) b = normal.find(i => i !== a);
    const themes = [a, b, pickFrom(tare, 'burgerT')].sort(() => rng() - 0.5);
    s.ch = { ...base, stage: 'theme', themes: themes.map(i => ({ i, name: BURGER[i].name, taré: !!BURGER[i].taré })), res: [], deadline: now + T.grace + T.pick };
  } else if (meta.kind === 'millions') {
    const ladder = MILLIONS.map((lvl, k) => shuffleQ(lvl[pickIndex(s, 'mil' + k, lvl.length, rng)], rng));
    s.ch = { ...base, ladder, level: 0, bank: 0, hist: [], q: ladder[0], stage: 'q', participants: [tm.id], answers: {}, fifty: {}, deadline: now + T.grace + T.millions };
  } else if (meta.kind === 'affiche') {
    const i = pickIndex(s, type, AFFICHES.length, rng);
    s.ch = { ...base, q: shuffleQ(AFFICHES[i], rng), participants: all, answers: {}, fifty: {}, deadline: now + T.grace + AFFICHES[i].clues.length * T.clue + 8000 };
  } else if (meta.kind === 'number') {
    const i = pickIndex(s, type, NUMBERS.length, rng);
    s.ch = { ...base, q: { ...NUMBERS[i] }, participants: all, answers: {}, deadline: now + T.grace + T.number };
  } else if (meta.kind === 'open') {
    const pool = OPEN_POOLS[type];
    const i = pickIndex(s, type, pool.length, rng);
    s.ch = { ...base, q: { ...pool[i] }, stage: 'write', participants: all, answers: {}, votes: {}, deadline: now + T.grace + T.write };
  } else if (meta.kind === 'bac') {
    const letter = BAC.letters[Math.floor(rng() * BAC.letters.length)];
    const cats = [...BAC.cats].sort(() => rng() - 0.5).slice(0, 5);
    s.ch = { ...base, letter, cats, stage: 'write', participants: all, answers: {}, valid: {}, deadline: now + T.grace + T.bac };
  } else if (meta.kind === 'famille') {
    const i = pickIndex(s, type, FAMILLE.length, rng);
    const f = FAMILLE[i];
    s.ch = { ...base, q: { q: f.q, r: f.r.map(x => ({ ...x })) }, participants: all, answers: {}, deadline: now + T.grace + T.famille };
  } else if (meta.kind === 'buzz10') {
    const go = now + T.grace + T.buzzReady;
    s.ch = { ...base, stage: 'ready', goAt: go, participants: all, taps: {}, deadline: go + T.buzzMax };
  } else if (meta.kind === 'duel' || meta.kind === 'target') {
    s.ch = { ...base, stage: 'pick', target: null, deadline: now + T.grace + T.pick };
  } else if (meta.kind === 'curse') {
    s.ch = base;
    return applyCurse(s, tm, ctx, rng);
  }
  s.phase = 'challenge';
  s.deadline = s.ch.deadline;
}

// ─── actions des équipes ─────────────────────────────────────
function isParticipant(ch, id) { return ch.participants && ch.participants.includes(id); }

function answer(s, tm, value, ctx, rng) {
  const ch = s.ch;
  if (s.phase !== 'challenge' || !ch) return 'Pas de question en cours.';
  if (ctx.now < ch.startsAt) return 'Attendez que la question s\'affiche !';
  if (!isParticipant(ch, tm.id)) return 'Vous ne participez pas à celle-là.';
  if (ch.answers[tm.id] !== undefined) return 'Votre équipe a déjà répondu.';

  if (ch.kind === 'dcc') {
    if (ch.stage !== 'q') return 'Choisissez d\'abord duo, carré ou cash.';
    if (ch.modes[tm.id] === 'cash') {
      const v = clampText(value, 60);
      if (!v) return 'Tapez une réponse.';
      ch.answers[tm.id] = { v, cash: true };
    } else {
      const v = Number(value);
      const allowed = ch.modes[tm.id] === 'duo' ? ch.duo[tm.id] : [0, 1, 2, 3];
      if (!allowed.includes(v)) return 'Réponse invalide.';
      if (ch.fifty[tm.id] && ch.fifty[tm.id].includes(v)) return 'Cette réponse a été éliminée.';
      ch.answers[tm.id] = { v };
    }
  } else if ((ch.kind === 'series' || ch.kind === 'millions') && ch.stage !== 'q') {
    return 'Pas encore de question.';
  } else if (ch.kind === 'series' && ch.q.n !== undefined) {
    const v = Number(String(value).replace(/\s/g, '').replace(',', '.'));
    if (!Number.isFinite(v)) return 'Il faut un nombre.';
    ch.answers[tm.id] = { v };
  } else if (ch.kind === 'qcm' || ch.kind === 'series' || ch.kind === 'millions' || ch.kind === 'affiche' || (ch.kind === 'duel' && ch.stage === 'q')) {
    const v = Number(value);
    if (!(v >= 0 && v < ch.q.o.length)) return 'Réponse invalide.';
    if (ch.fifty && ch.fifty[tm.id] && ch.fifty[tm.id].includes(v)) return 'Cette réponse a été éliminée.';
    ch.answers[tm.id] = { v, at: ctx.now - ch.startsAt };
    if (ch.kind === 'duel' && v === ch.q.a) return resolve(s, ctx, rng), null;
  } else if (ch.kind === 'number') {
    const v = Number(String(value).replace(/\s/g, '').replace(',', '.'));
    if (!Number.isFinite(v)) return 'Il faut un nombre.';
    ch.answers[tm.id] = { v };
  } else if (ch.kind === 'open') {
    if (ch.stage !== 'write') return 'Trop tard pour écrire, place au vote.';
    const v = clampText(value, 140);
    if (!v) return 'Écrivez quelque chose, même une bêtise.';
    ch.answers[tm.id] = { v };
  } else if (ch.kind === 'bac') {
    if (ch.stage !== 'write') return 'Trop tard, stylos posés !';
    const arr = Array.isArray(value) ? value : [];
    ch.answers[tm.id] = { v: ch.cats.map((_, i) => clampText(arr[i], 40)) };
  } else if (ch.kind === 'famille') {
    const arr = (Array.isArray(value) ? value : [value]).map(x => clampText(x, 40)).filter(Boolean).slice(0, 3);
    if (!arr.length) return 'Donnez au moins une réponse.';
    ch.answers[tm.id] = { v: arr };
  } else {
    return 'On ne répond pas comme ça à cette épreuve.';
  }
  if (ch.participants.every(id => ch.answers[id] !== undefined)) closeAnswers(s, ctx, rng);
  return null;
}

function closeAnswers(s, ctx, rng) {
  const ch = s.ch;
  if (ch.kind === 'series') return closeSeriesQ(s, ctx, rng);
  if (ch.kind === 'millions') return millionsAnswered(s, ctx, rng);
  if (ch.kind === 'open' && ch.stage === 'write') {
    const n = Object.keys(ch.answers).length;
    if (n >= 2) { ch.stage = 'vote'; ch.deadline = ctx.now + T.vote; s.deadline = ch.deadline; return; }
    return resolve(s, ctx, rng);
  }
  if (ch.kind === 'bac' && ch.stage === 'write') {
    ch.stage = 'review';
    for (const id of ch.participants) {
      const a = ch.answers[id] ? ch.answers[id].v : ch.cats.map(() => '');
      if (!ch.answers[id]) ch.answers[id] = { v: a };
      ch.valid[id] = a.map(w => norm(w).startsWith(ch.letter.toLowerCase()));
    }
    ch.deadline = ctx.now + T.review; s.deadline = ch.deadline;
    return;
  }
  resolve(s, ctx, rng);
}

function vote(s, tm, target, ctx, rng) {
  const ch = s.ch;
  if (s.phase !== 'challenge' || !ch || ch.kind !== 'open' || ch.stage !== 'vote') return 'Pas de vote en cours.';
  if (target === tm.id) return 'Voter pour soi-même ? La honte. Refusé.';
  if (!ch.answers[target]) return 'Cette équipe n\'a rien proposé.';
  if (ch.votes[tm.id]) return 'Déjà voté.';
  ch.votes[tm.id] = target;
  const voters = s.teams.filter(x => Object.keys(ch.answers).some(id => id !== x.id));
  if (voters.every(x => ch.votes[x.id])) resolve(s, ctx, rng);
  return null;
}

// ─── Duo, carré ou cash ──────────────────────────────────────
function chooseMode(s, tm, mode, ctx, rng) {
  const ch = s.ch;
  if (s.phase !== 'challenge' || !ch || ch.kind !== 'dcc' || ch.stage !== 'mode') return 'Trop tard pour choisir.';
  if (!DCC_PTS[mode]) return 'Duo, carré ou cash, rien d\'autre.';
  if (ch.modes[tm.id]) return 'Déjà choisi.';
  ch.modes[tm.id] = mode;
  if (ch.participants.every(id => ch.modes[id])) dccToQuestion(s, ctx, rng);
  return null;
}
function dccToQuestion(s, ctx, rng) {
  const ch = s.ch;
  for (const id of ch.participants) {
    if (!ch.modes[id]) ch.modes[id] = 'carre';
    if (ch.modes[id] === 'duo') {
      const wrong = [0, 1, 2, 3].filter(i => i !== ch.q.a);
      const pair = [ch.q.a, wrong[Math.floor(rng() * wrong.length)]];
      ch.duo[id] = rng() < 0.5 ? pair : pair.reverse();
    }
  }
  ch.stage = 'q'; ch.startsAt = ctx.now; ch.deadline = ctx.now + T.qcm; s.deadline = ch.deadline;
}

// ─── Burger Quiz et vidéo culte : plusieurs questions à la suite ───
function chooseTheme(s, tm, i, ctx, rng) {
  const ch = s.ch;
  if (s.phase !== 'challenge' || !ch || ch.kind !== 'series' || ch.stage !== 'theme') return 'Pas de thème à choisir.';
  if (ch.teamId !== tm.id) return 'C\'est l\'équipe qui joue qui choisit.';
  const th = ch.themes[i]; if (!th) return 'Thème inconnu.';
  doTheme(s, th, ctx, rng);
  return null;
}
function doTheme(s, th, ctx, rng) {
  const ch = s.ch;
  ch.theme = th.name; ch.themeTare = th.taré;
  ch.qs = BURGER[th.i].qs.map(q => shuffleQ(q, rng));
  feed(s, 'info', `🍔 ${team(s, ch.teamId).name} choisit « ${th.name} »`);
  startSeriesQ(s, 0, ctx);
}
function startSeriesQ(s, i, ctx) {
  const ch = s.ch;
  if (!ch.qs || i >= ch.qs.length) return toRevealSeries(s, ctx);
  ch.i = i; ch.q = ch.qs[i]; ch.stage = 'q';
  ch.participants = s.teams.map(x => x.id); ch.answers = {}; ch.fifty = {};
  ch.startsAt = ctx.now + (i ? 1200 : T.grace);
  ch.deadline = ch.startsAt + (ch.q.n !== undefined ? T.number : T.series); s.deadline = ch.deadline;
}
function closeSeriesQ(s, ctx) {
  const ch = s.ch, q = ch.q;
  const isBonus = ch.type === 'video' && ch.i > 0;
  const r = { q, answers: ch.answers, ok: [], gains: {} };
  const give = (id, p) => { const real = award(s, team(s, id), p); r.gains[id] = real; };
  if (q.n !== undefined) {
    const e = Object.entries(ch.answers).map(([id, a]) => [id, Math.abs(a.v - q.n)]);
    if (e.length) { const best = Math.min(...e.map(x => x[1])); r.ok = e.filter(x => x[1] === best).map(x => x[0]); r.ok.forEach(id => give(id, isBonus ? 1 : best === 0 ? 3 : 2)); }
  } else {
    r.ok = Object.entries(ch.answers).filter(([, a]) => a.v === q.a).map(([id]) => id);
    r.ok.forEach(id => give(id, isBonus ? 1 : id === ch.teamId ? 2 : 1));
  }
  ch.res.push(r);
  startSeriesQ(s, ch.i + 1, ctx);
}
function toRevealSeries(s, ctx) {
  const ch = s.ch;
  const tot = {};
  ch.res.forEach(r => r.ok.forEach(id => { tot[id] = (tot[id] || 0) + 1; }));
  const best = Object.entries(tot).sort((a, b) => b[1] - a[1])[0];
  ch.q = null;
  toReveal(s, ctx, best ? `${team(s, best[0]).name} s'en sort le mieux (${best[1]}/${ch.res.length}).` : 'Zéro bonne réponse. Collectivement. Bravo.');
}

// ─── Qui veut gagner des millions ────────────────────────────
function millionsAnswered(s, ctx) {
  const ch = s.ch;
  const a = ch.answers[ch.teamId];
  const ok = a && a.v === ch.q.a;
  ch.hist.push({ q: ch.q, v: a ? a.v : null, ok, level: ch.level });
  if (ok) {
    ch.bank = LADDER[ch.level];
    ch.level += 1;
    if (ch.level >= LADDER.length) return millionsEnd(s, ctx, 'top');
    ch.stage = 'decide'; ch.deadline = ctx.now + T.decide; s.deadline = ch.deadline;
    return;
  }
  ch.bank = ch.level > LADDER_SAFE ? LADDER[LADDER_SAFE] : 0;
  millionsEnd(s, ctx, a ? 'wrong' : 'time');
}
function millionsDecide(s, tm, go, ctx) {
  const ch = s.ch;
  if (s.phase !== 'challenge' || !ch || ch.kind !== 'millions' || ch.stage !== 'decide') return 'Pas maintenant.';
  if (ch.teamId !== tm.id) return 'Ce n\'est pas votre partie.';
  if (!go) return millionsEnd(s, ctx, 'stop'), null;
  ch.q = ch.ladder[ch.level]; ch.answers = {}; ch.fifty = {}; ch.stage = 'q';
  ch.startsAt = ctx.now + 1000; ch.deadline = ch.startsAt + T.millions; s.deadline = ch.deadline;
  return null;
}
function millionsEnd(s, ctx, why) {
  const ch = s.ch, tm = team(s, ch.teamId);
  ch.end = why;
  if (ch.bank) award(s, tm, ch.bank);
  const msg = {
    top: `${tm.name} va au bout ! 8 points, Jean-Pierre en pleure. 🏆`,
    stop: `${tm.name} s'arrête et repart avec ${ch.bank} pt${ch.bank > 1 ? 's' : ''}. Prudent… ou lâche.`,
    wrong: `Mauvaise réponse ! ${tm.name} ${ch.bank ? `retombe au palier : ${ch.bank} pts` : 'repart avec rien du tout'}.`,
    time: `Trop lent ! ${tm.name} ${ch.bank ? `garde le palier : ${ch.bank} pts` : 'repart les mains vides'}.`
  }[why];
  toReveal(s, ctx, msg);
}

function buzz(s, tm, ctx, rng) {
  const ch = s.ch;
  if (s.phase !== 'challenge' || !ch) return 'Rien à buzzer.';
  if (ch.kind === 'buzz10') {
    if (ch.taps[tm.id] !== undefined) return 'Déjà buzzé.';
    if (ctx.now < ch.goAt) { ch.taps[tm.id] = -1; feed(s, 'info', `${tm.name} a buzzé avant le GO. Faux départ, éliminés. 🤦`); }
    else ch.taps[tm.id] = ctx.now - ch.goAt;
    if (ch.participants.every(id => ch.taps[id] !== undefined)) resolve(s, ctx, rng);
    return null;
  }
  if (ch.kind === 'media') {
    if (ctx.now < ch.startsAt) return 'Attendez le début !';
    if (ch.stage !== 'play') return 'Trop tard, quelqu\'un a buzzé.';
    if (ch.excluded.includes(tm.id)) return 'Vous êtes grillés pour celle-là.';
    ch.stage = 'answer'; ch.buzzer = tm.id; ch.buzzAt = ctx.now;
    ch.remaining = Math.max(5000, ch.deadline - ctx.now);
    ch.deadline = ctx.now + T.mediaAnswer; s.deadline = ch.deadline;
    feed(s, 'info', `BUZZ ! ${tm.name} 🔔`);
    return null;
  }
  return 'Pas de buzzer sur cette épreuve.';
}

function judgeMedia(s, ok, ctx, rng) {
  const ch = s.ch;
  const tm = team(s, ch.buzzer);
  if (ok) { ch.winner = tm.id; return resolve(s, ctx, rng); }
  ch.excluded.push(tm.id);
  feed(s, 'info', `${tm.name} se plante. Les autres peuvent buzzer !`);
  ch.buzzer = null; ch.stage = 'play';
  if (s.teams.every(x => ch.excluded.includes(x.id))) return resolve(s, ctx, rng);
  ch.deadline = ctx.now + (ch.remaining || 15000); s.deadline = ch.deadline;
}

function pickTarget(s, tm, targetId, ctx, rng) {
  const ch = s.ch;
  if (s.phase !== 'challenge' || !ch || ch.stage !== 'pick') return 'Pas de cible à choisir.';
  if (ch.teamId !== tm.id) return 'Ce n\'est pas à vous de choisir.';
  const target = team(s, targetId);
  if (!target || target.id === tm.id) return 'Cible invalide.';
  doPick(s, target, ctx, rng);
  return null;
}

function doPick(s, target, ctx, rng) {
  const ch = s.ch;
  const tm = active(s);
  ch.target = target.id;
  if (ch.type === 'duel') {
    ch.stage = 'q'; ch.q = culturePick(s, rng); ch.participants = [tm.id, target.id]; ch.answers = {}; ch.fifty = {};
    ch.startsAt = ctx.now + T.grace; ch.deadline = ch.startsAt + T.duel; s.deadline = ch.deadline;
    feed(s, 'info', `⚔️ DUEL : ${tm.name} défie ${target.name} !`);
    return;
  }
  if (ch.type === 'vol') {
    if (shielded(s, target, tm, 'vol')) return toReveal(s, ctx, `${target.name} était protégée par un bouclier. Vol raté !`);
    const k = transfer(s, target, tm, 3);
    return toReveal(s, ctx, k ? `${tm.name} dépouille ${target.name} de ${k} pt${k > 1 ? 's' : ''}. Sans vergogne. 🦹` : `${tm.name} tente de voler ${target.name}… qui n'a pas un seul point. Gênant.`);
  }
  if (ch.type === 'echange') {
    if (shielded(s, target, tm, 'échange')) return toReveal(s, ctx, `${target.name} avait un bouclier. Personne ne bouge.`);
    const a = tm.pos; tm.pos = target.pos; target.pos = a;
    return toReveal(s, ctx, `${tm.name} et ${target.name} échangent leurs places. Chacun chez l'autre !`);
  }
}

// ─── malédictions ────────────────────────────────────────────
function applyCurse(s, tm, ctx, rng) {
  const total = CURSES.reduce((a, c) => a + (c.w || 1), 0);
  let r = rng() * total, c = CURSES[0];
  for (const x of CURSES) { r -= (x.w || 1); if (r < 0) { c = x; break; } }
  const fx = c.fx || {};
  const notes = [];
  if (fx.move) { tm.pos = Math.max(0, tm.pos + fx.move); notes.push(`Retour case ${tm.pos}.`); }
  if (fx.home) tm.pos = 0;
  if (fx.points) { const b = tm.score; tm.score = Math.max(0, tm.score + fx.points); s.ch.gains[tm.id] = (s.ch.gains[tm.id] || 0) + tm.score - b; }
  if (fx.skip) tm.skip += fx.skip;
  if (fx.halve) tm.armed.halve = true;
  if (fx.robin) {
    const poor = others(s, tm.id).sort((a, b) => a.score - b.score)[0];
    if (poor) { const k = transfer(s, tm, poor, fx.robin); notes.push(`${poor.name} récupère ${k} pt${k > 1 ? 's' : ''}.`); }
  }
  if (fx.loseJoker) {
    const avail = Object.keys(tm.jokers).filter(k => tm.jokers[k]);
    if (avail.length) { const k = avail[Math.floor(rng() * avail.length)]; tm.jokers[k] = 0; notes.push(`Joker perdu : ${JOKERS[k].label}.`); }
    else notes.push('Ah, vous n\'aviez plus de joker. Bien joué, en fait.');
  }
  if (c.turns) tm.curses.push({ t: c.t, left: c.turns + 1 });
  s.ch.curse = c.t;
  feed(s, 'curse', `💀 ${tm.name} : ${c.t}`);
  toReveal(s, ctx, [c.t, ...notes].join(' '));
}

// ─── jokers ──────────────────────────────────────────────────
function useJoker(s, tm, msg, ctx, rng) {
  const k = msg.kind;
  if (!JOKERS[k]) return 'Joker inconnu.';
  if (!tm.jokers[k]) return 'Joker déjà utilisé.';
  if (s.phase === 'lobby' || s.phase === 'end') return 'Pas maintenant.';
  const ch = s.ch;
  if (k === 'double') {
    if (tm.armed.double) return 'Déjà armé.';
    tm.armed.double = true; feed(s, 'joker', `${tm.name} active ×2 sur ses prochains points 💥`);
  } else if (k === 'bouclier') {
    if (tm.armed.shield) return 'Bouclier déjà levé.';
    tm.armed.shield = true; feed(s, 'joker', `${tm.name} lève son bouclier 🛡️`);
  } else if (k === 'relance') {
    if (s.phase !== 'rolled' || active(s).id !== tm.id) return 'Utilisable juste après votre lancer de dé.';
    const old = s.move.roll;
    tm.jokers[k] = 0;
    doRoll(s, tm, rng, ctx.now);
    s.move.rerolled = true; s.move.oldRoll = old;
    feed(s, 'joker', `${tm.name} relance le dé : ${old} → ${s.move.roll} 🎲`);
    return null;
  } else if (k === 'vol' || k === 'blocage') {
    const target = team(s, msg.target);
    if (!target || target.id === tm.id) return 'Choisissez une autre équipe.';
    if (k === 'vol') {
      if (!shielded(s, target, tm, 'vol')) {
        const kk = Math.min(3, target.score); target.score -= kk; tm.score += kk;
        feed(s, 'joker', kk ? `🦹 ${tm.name} vole ${kk} pt${kk > 1 ? 's' : ''} à ${target.name}. Pas de pitié.` : `🦹 ${tm.name} tente de voler ${target.name}… qui n'a pas un seul point. Joker gâché, bravo.`);
      }
    } else {
      if (!shielded(s, target, tm, 'blocage')) {
        target.skip += 1;
        feed(s, 'joker', `⛔ ${tm.name} bloque ${target.name} : prochain tour sauté !`);
      }
    }
  } else if (k === 'fifty') {
    if (s.phase !== 'challenge' || !ch || !ch.q || !ch.q.o || ch.q.o.length !== 4 || !isParticipant(ch, tm.id)) return 'Seulement pendant un QCM à 4 choix.';
    if (ch.kind === 'dcc' && (ch.stage !== 'q' || ch.modes[tm.id] !== 'carre')) return 'En duo ou cash, le 50/50 ne sert à rien. Choisissez carré.';
    if ((ch.kind === 'series' || ch.kind === 'millions') && ch.stage !== 'q') return 'Attendez la question.';
    if (ch.answers[tm.id] !== undefined) return 'Vous avez déjà répondu.';
    const wrong = [0, 1, 2, 3].filter(i => i !== ch.q.a).sort(() => rng() - 0.5).slice(0, 2);
    ch.fifty[tm.id] = wrong;
    feed(s, 'joker', `${tm.name} utilise le 50/50 ✂️ (faible, mais efficace)`);
  }
  tm.jokers[k] = 0;
  return null;
}

// ─── résolution et points ────────────────────────────────────
function resolve(s, ctx, rng) {
  const ch = s.ch;
  const tm = active(s);
  let summary = '';

  if (ch.kind === 'dcc') {
    ch.ok = {};
    for (const [id, a] of Object.entries(ch.answers)) {
      ch.ok[id] = a.cash ? cashMatch(a.v, ch.q) : a.v === ch.q.a;
      if (ch.ok[id]) award(s, team(s, id), DCC_PTS[ch.modes[id]] + (id === tm.id ? 1 : 0));
    }
    const ok = Object.keys(ch.ok).filter(id => ch.ok[id]);
    const cashers = ok.filter(id => ch.modes[id] === 'cash');
    summary = cashers.length ? `CASH ! ${cashers.map(id => team(s, id).name).join(', ')} ${cashers.length > 1 ? 'ont' : 'a'} tout misé et gagné. 💰` : ok.length ? `Bonne réponse pour ${ok.map(id => team(s, id).name).join(', ')}.` : 'Personne n\'a trouvé. Ni en duo, ni en carré, ni en rien.';
  } else if (ch.kind === 'affiche') {
    const n = ch.q.clues.length;
    const ok = Object.entries(ch.answers).filter(([, a]) => a.v === ch.q.a);
    ch.seen = {};
    for (const [id, a] of Object.entries(ch.answers)) ch.seen[id] = Math.min(n, 1 + Math.floor(Math.max(0, a.at) / T.clue));
    for (const [id] of ok) award(s, team(s, id), Math.max(1, n + 1 - ch.seen[id]) + (id === tm.id ? 1 : 0));
    const fast = ok.sort((x, y) => x[1].at - y[1].at)[0];
    summary = fast ? `${team(s, fast[0]).name} a trouvé dès le ${ch.seen[fast[0]] === 1 ? '1er' : ch.seen[fast[0]] + 'e'} indice !` : 'Personne n\'a reconnu l\'affiche. Allez au cinéma, de temps en temps.';
  } else if (ch.kind === 'qcm') {
    const ok = Object.entries(ch.answers).filter(([, a]) => a.v === ch.q.a).map(([id]) => id);
    for (const id of ok) award(s, team(s, id), id === tm.id ? 2 : 1);
    summary = ok.length ? `Bonne réponse pour ${ok.map(id => team(s, id).name).join(', ')}.` : 'Personne n\'a trouvé. Magnifique.';
  } else if (ch.kind === 'duel') {
    const ok = Object.entries(ch.answers).filter(([, a]) => a.v === ch.q.a).sort((a, b) => a[1].at - b[1].at);
    if (ok.length) {
      const w = team(s, ok[0][0]); ch.winner = w.id; award(s, w, 3);
      const l = team(s, ch.participants.find(id => id !== w.id));
      summary = `${w.name} gagne le duel et humilie ${l.name}. ⚔️`;
    } else summary = 'Duel nul : personne n\'a trouvé. Un spectacle navrant.';
  } else if (ch.kind === 'number') {
    const entries = Object.entries(ch.answers).map(([id, a]) => [id, Math.abs(a.v - ch.q.a)]);
    if (entries.length) {
      const best = Math.min(...entries.map(e => e[1]));
      ch.closest = entries.filter(e => e[1] === best).map(e => e[0]);
      for (const id of ch.closest) award(s, team(s, id), best === 0 ? 3 : 2);
      summary = `${ch.closest.map(id => team(s, id).name).join(' et ')} ${ch.closest.length > 1 ? 'sont' : 'est'} le plus proche${best === 0 ? ' — PILE POIL !' : '.'}`;
    } else summary = 'Aucune réponse. Les maths, ce n\'est pas pour tout le monde.';
  } else if (ch.kind === 'open') {
    const tally = {};
    for (const v of Object.values(ch.votes)) tally[v] = (tally[v] || 0) + 1;
    ch.tally = tally;
    const ids = Object.keys(ch.answers);
    if (ids.length === 1 && !Object.keys(tally).length) {
      award(s, team(s, ids[0]), 1); ch.winners = ids;
      summary = `Seule ${team(s, ids[0]).name} a osé répondre : 1 pt pour le courage.`;
    } else {
      const max = Math.max(0, ...Object.values(tally));
      ch.winners = max ? Object.keys(tally).filter(id => tally[id] === max) : [];
      for (const id of ch.winners) award(s, team(s, id), 2);
      summary = ch.winners.length ? `Le public a parlé : ${ch.winners.map(id => team(s, id).name).join(' et ')}.` : 'Aucun vote. Vous êtes tous des lâches.';
    }
  } else if (ch.kind === 'bac') {
    ch.unique = {};
    for (const id of ch.participants) {
      let pts = 0; ch.unique[id] = [];
      ch.cats.forEach((_, i) => {
        const w = norm(ch.answers[id].v[i]);
        const valid = ch.valid[id][i] && w;
        const dup = ch.participants.some(o => o !== id && ch.valid[o][i] && norm(ch.answers[o].v[i]) === w);
        ch.unique[id][i] = valid && !dup;
        if (valid) pts += dup ? 1 : 2;
      });
      if (pts) award(s, team(s, id), pts);
    }
    summary = 'Les copies sont corrigées. Certaines sont gênantes.';
  } else if (ch.kind === 'famille') {
    const RANK = [3, 2, 2, 1, 1, 1];
    ch.matches = {};
    ch.found = ch.q.r.map(() => []);
    for (const [id, a] of Object.entries(ch.answers)) {
      ch.matches[id] = [];
      let pts = 0;
      for (const txt of a.v) {
        const n = ' ' + norm(txt) + ' ';
        const idx = ch.q.r.findIndex((r, i) => !ch.found[i].includes(id) && r.k.some(k => n.includes(k.length <= 3 ? ' ' + k + ' ' : k)));
        ch.matches[id].push({ text: txt, idx });
        if (idx >= 0) { ch.found[idx].push(id); pts += RANK[idx] || 1; }
      }
      if (pts) award(s, team(s, id), pts);
    }
    summary = 'Révélation du sondage (100 % scientifique, 0 % vérifié).';
  } else if (ch.kind === 'buzz10') {
    const valid = Object.entries(ch.taps).filter(([, ms]) => ms >= 0).map(([id, ms]) => [id, Math.abs(ms - 10000)]);
    if (valid.length) {
      const best = Math.min(...valid.map(v => v[1]));
      ch.winners = valid.filter(v => v[1] === best).map(v => v[0]);
      for (const id of ch.winners) award(s, team(s, id), best <= 150 ? 3 : 2);
      summary = `${ch.winners.map(id => team(s, id).name).join(' et ')} ${best <= 150 ? '— une horloge suisse !' : 'a le meilleur métronome interne.'}`;
    } else summary = 'Personne n\'a buzzé correctement. Le temps, c\'est relatif.';
  } else if (ch.kind === 'media') {
    if (ch.winner) {
      const w = team(s, ch.winner);
      let pts = ch.type === 'unenote' ? 3 : 2;
      if (ch.media === 'layers') { const n = ch.item.layers.length; ch.layerAt = Math.min(n, 1 + Math.floor((ch.buzzAt - ch.startsAt) / T.layer)); pts = Math.max(1, n + 1 - ch.layerAt); }
      award(s, w, pts + (ch.bonus ? 1 : 0));
      summary = `${w.name} a trouvé${ch.bonus ? ', avec le bonus en prime' : ''} !`;
    }
    else summary = 'Personne n\'a trouvé. Vous n\'avez aucune culture.';
  }
  toReveal(s, ctx, summary);
}

function toReveal(s, ctx, summary) {
  s.phase = 'reveal';
  s.ch.summary = summary;
  s.ch.revealedAt = ctx.now;
  s.deadline = ctx.now + T.reveal;
  const g = Object.entries(s.ch.gains || {}).filter(([, v]) => v);
  if (g.length) feed(s, 'points', g.map(([id, v]) => `${team(s, id).name} ${v > 0 ? '+' : ''}${v}`).join(' · '));
}

// ─── fin de tour ─────────────────────────────────────────────
function nextTurn(s, ctx) {
  const cur = active(s);
  cur.curses = cur.curses.map(c => ({ ...c, left: c.left - 1 })).filter(c => c.left > 0);
  s.ch = null; s.move = null; s.deadline = null;
  const n = s.teams.length;
  for (let guard = 0; guard < n * 3; guard++) {
    s.turn = (s.turn + 1) % n;
    if (s.turn === 0) {
      s.round += 1;
      if (s.endAt && ctx.now >= s.endAt) return endGame(s);
    }
    const t = active(s);
    if (t.skip > 0) { t.skip -= 1; feed(s, 'info', `${t.name} passe son tour. Coin, au piquet. ⛔`); continue; }
    break;
  }
  s.phase = 'roll';
  feed(s, 'info', `Au tour de ${active(s).name} 🎲`);
}

function endGame(s) {
  s.phase = 'end'; s.deadline = null; s.ch = null; s.move = null;
  const ranking = [...s.teams].sort((a, b) => b.score - a.score);
  s.ranking = ranking.map(t => t.id);
  feed(s, 'info', `🏆 Victoire de ${ranking[0] ? ranking[0].name : 'personne'} !`);
}

// ─── chronos ─────────────────────────────────────────────────
function timeout(s, ctx, rng) {
  const ch = s.ch;
  if (s.phase === 'rolled') return applyMove(s, ctx, rng);
  if (s.phase === 'reveal') return nextTurn(s, ctx);
  if (s.phase !== 'challenge' || !ch) return;
  if (ch.stage === 'pick') {
    const opts = others(s, ch.teamId);
    feed(s, 'info', 'Trop lent ! Le hasard choisit la cible.');
    return doPick(s, opts[Math.floor(rng() * opts.length)], ctx, rng);
  }
  if (ch.kind === 'buzz10' && ch.stage === 'ready') { ch.stage = 'running'; s.deadline = ch.deadline; return; }
  if (ch.kind === 'dcc' && ch.stage === 'mode') return dccToQuestion(s, ctx, rng);
  if (ch.kind === 'series' && ch.stage === 'theme') { feed(s, 'info', 'Trop lent ! Le hasard choisit le thème.'); return doTheme(s, ch.themes[Math.floor(rng() * ch.themes.length)], ctx, rng); }
  if (ch.kind === 'series' && ch.stage === 'video') return startSeriesQ(s, 0, ctx);
  if (ch.kind === 'series') return closeSeriesQ(s, ctx, rng);
  if (ch.kind === 'millions' && ch.stage === 'decide') return millionsEnd(s, ctx, 'stop');
  if (ch.kind === 'millions') return millionsAnswered(s, ctx, rng);
  if (ch.kind === 'media' && ch.stage === 'answer') return judgeMedia(s, false, ctx, rng);
  if (ch.kind === 'open' && ch.stage === 'write') return closeAnswers(s, ctx, rng);
  if (ch.kind === 'bac' && ch.stage === 'write') return closeAnswers(s, ctx, rng);
  return resolve(s, ctx, rng);
}

export function nextDeadline(s) {
  if (s.phase === 'challenge' && s.ch && s.ch.kind === 'buzz10' && s.ch.stage === 'ready') return s.ch.goAt;
  return s.deadline;
}

export function tick(s, now, rng = Math.random) {
  s._now = now;
  const ctx = { now };
  let changed = false;
  for (let i = 0; i < 6; i++) {
    const d = nextDeadline(s);
    if (!d || now < d) break;
    if (s.phase === 'challenge' && s.ch && s.ch.kind === 'buzz10' && s.ch.stage === 'ready') { s.ch.stage = 'running'; s.deadline = s.ch.deadline; }
    else timeout(s, ctx, rng);
    changed = true;
  }
  return changed;
}

// ─── vue envoyée aux écrans (on cache les réponses avant la révélation) ───
export function view(s, viewer = {}) {
  const v = JSON.parse(JSON.stringify(s));
  delete v.hostKey; delete v.lastTaunt; delete v.used; delete v._now;
  const me = viewer.pid ? s.players[viewer.pid] : null;
  v.me = me ? { pid: viewer.pid, teamId: me.teamId, name: me.name } : null;
  v.host = !!viewer.host;
  v.players = Object.values(s.players).reduce((acc, p) => { acc[p.teamId] = (acc[p.teamId] || 0) + 1; return acc; }, {});
  const ch = v.ch;
  if (ch && s.phase === 'challenge') {
    if (ch.q) { delete ch.q.a; delete ch.q.f; delete ch.q.k; delete ch.q.n; if (ch.q.r) ch.q.r = ch.q.r.map(() => null); }
    if (ch.q && s.ch.q && s.ch.q.n !== undefined) ch.q.isNumber = true;
    delete ch.qs; delete ch.ladder;
    if (ch.q && ch.q.clues && viewer.role !== 'tv') delete ch.q.clues;
    if (ch.item) ch.item = { src: ch.item.src, img: ch.item.img, start: ch.item.start, stop: ch.item.stop, layers: ch.item.layers, label: ch.item.label };
    if (ch.duo && me) ch.duo = { [me.teamId]: ch.duo[me.teamId] }; else if (ch.duo) ch.duo = {};
    const hideOthers = ch.kind !== 'bac' || ch.stage === 'write';
    if (ch.answers && !(ch.kind === 'open' && ch.stage === 'vote') && hideOthers) {
      for (const id of Object.keys(ch.answers)) if (!me || me.teamId !== id) ch.answers[id] = { hidden: true };
    }
    if (ch.taps) for (const id of Object.keys(ch.taps)) if (!me || me.teamId !== id) ch.taps[id] = ch.taps[id] === -1 ? -1 : 0;
    if (ch.fifty && me) ch.fifty = { [me.teamId]: ch.fifty[me.teamId] }; else if (ch.fifty) ch.fifty = {};
  }
  v.now = s._now || Date.now();
  v.meta = META;
  return v;
}
