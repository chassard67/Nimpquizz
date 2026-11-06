// ─────────────────────────────────────────────────────────────
//  LE GRAND N'IMPORTE QUIZ — moteur de jeu (pur, sans réseau)
//  L'état est un objet JSON. handle() applique un message, tick() gère les chronos.
// ─────────────────────────────────────────────────────────────
import { MEDIA_INDEX } from './media-index.js';
import { QCM, NUMBERS, BAC, MEDIA, TAUNTS, TEAM_NAMES, CULTURE_THEMES, CONTRARIO, AFFICHES, BURGER, MILLIONS, DOUBLESENS, TITRES, INVENTE, BMC } from './content.js';

// 32 cases : 10 en haut, 6 à droite, 10 en bas, 6 à gauche
export const BOARD = [
  // une case sur deux est une question (bleue) : jamais deux couleurs identiques côte à côte
  'depart', 'culture', 'bt_musique', 'emojis', 'vol', 'plusoumoins', 'pochette', 'contrario', 'bt_ecrans', 'millions',
  'buzz10', 'culture', 'bmc', 'mensonge', 'bt_musique', 'expression',
  'video', 'burger', 'duel', 'noix', 'bt_jeux', 'contrario', 'echange', 'bac', 'replique', 'culture',
  'bmc', 'emojis', 'unenote', 'titredebile', 'bt_ecrans', 'expression'
];

export const TYPES = {
  depart:        { label: 'Départ', group: 'dep', kind: 'info' },
  culture:       { label: 'Culture G', group: 'q', kind: 'dcc', rule: 'Duo, carré ou cash ? Choisissez avant de voir les réponses : duo 1 pt, carré 2 pts, cash 4 pts. +1 pour l\'équipe qui joue.' },
  contrario:     { label: 'A contrario', group: 'q', kind: 'media', media: 'text', rule: 'Tout est à l\'envers : retrouvez l\'original ! Buzzez et répondez à voix haute. 3 pts sans indice, 2 après le 1er, 1 après le 2e.' },
  burger:        { label: 'Burger Quiz', group: 'q', kind: 'series', rule: 'L\'équipe qui joue choisit un thème parmi 3. Trois questions, tout le monde répond : 2 pts / 1 pt chacune.' },
  millions:      { label: 'Millionnaire', group: 'q', kind: 'millions', rule: 'Cinq questions de plus en plus dures, seule l\'équipe qui joue répond. 1, 2, 3, 5 puis 8 pts. On peut s\'arrêter à tout moment ; palier assuré à 2 pts.' },
  affiche:       { label: 'Affiche mystère', group: 'v', kind: 'affiche', rule: 'Les indices de l\'affiche tombent un par un. Répondez tôt : 4 pts au 1er indice, 3, 2, puis 1. +1 pour l\'équipe qui joue.' },
  video:         { label: 'Vidéo culte', group: 'v', kind: 'series', media: 'video', rule: 'Regardez bien… La vidéo s\'arrête, puis les questions tombent. 2 pts / 1 pt, question bonus 1 pt.' },
  unenote:       { label: 'Une seule note', group: 'bt', kind: 'media', media: 'audio', rule: 'Une note. Une seule. Buzzez si vous reconnaissez : 3 pts.' },
  instruments:   { label: 'Couche par couche', group: 'bt', kind: 'media', media: 'layers', rule: 'Batterie, puis basse, puis le reste… Buzzez tôt : 4 pts, puis 3, 2, 1.' },
  noix:          { label: 'À la noix', group: 'q', kind: 'qcm', rule: 'Question absurde, mais vraie réponse. 2 pts pour l\'équipe qui joue, 1 pt pour les autres.' },
  emojis:        { label: 'Emojis', group: 'q', kind: 'dcc', emo: true, rule: 'Tapez le titre en CASH (4 pts), ou prenez le carré pour voir 4 propositions (2 pts). +1 pour l\'équipe qui joue.' },
  mensonge:      { label: 'Grand mensonge', group: 'q', kind: 'qcm', rule: 'Deux affirmations sont vraies. Trouvez le mensonge. 2 pts / 1 pt.' },
  plusoumoins:   { label: 'Plus ou moins', group: 'q', kind: 'number', rule: 'Donnez un nombre. L\'équipe la plus proche prend 2 pts, +1 si pile poil.' },
  expression:    { label: 'Double Sens', group: 'q', kind: 'open', rule: 'Une phrase qui marche dans deux situations opposées. Chaque joueur écrit la sienne, puis vote pour celle d\'une autre équipe. Les votes s\'additionnent : l\'équipe la plus votée prend 2 pts.' },
  titredebile:   { label: 'Titre débile', group: 'q', kind: 'open', rule: 'Glissez UN mot n\'importe où dans le titre pour le rendre débile. Chaque joueur écrit, puis vote pour le titre d\'une autre équipe. L\'équipe la plus votée prend 2 pts.' },
  bac:           { label: 'Le Bac', group: 'q', kind: 'bac', rule: 'Une lettre, 5 catégories. 1 pt par mot validé, +1 si personne d\'autre ne l\'a.' },
  bmc:           { label: 'Blanc Manger Coco', group: 'cm', kind: 'bmc', rule: 'Complétez la carte noire avec une de vos cartes blanches. Puis chacun vote pour la plus drôle d\'une autre équipe. L\'équipe la plus votée prend 2 pts.' },
  bt_musique:    { label: 'BT Musique', group: 'bt', kind: 'media', media: 'audio', rule: 'Buzzez dès que vous reconnaissez. Bonne réponse : 2 pts (+1 avec le bonus).' },
  bt_jeux:       { label: 'BT Jeux vidéo', group: 'bt', kind: 'media', media: 'audio', rule: 'Une musique de jeu vidéo : buzzez dès que vous reconnaissez le jeu. 2 pts (+1 avec le bonus).' },
  bt_ecrans:     { label: 'BT Séries & films', group: 'bt', kind: 'media', media: 'audio', rule: 'Générique de série ou musique de film : buzzez dès que vous reconnaissez. 2 pts.' },
  replique:      { label: 'Réplique culte', group: 'v', kind: 'dcc', emo: true, rule: 'De quel film vient cette réplique ? Tapez le titre en CASH (4 pts), ou prenez le carré (2 pts). +1 pour l\'équipe qui joue.' },
  pochette:      { label: 'Pochette floutée', group: 'v', kind: 'media', media: 'image', rule: 'La pochette se défloute petit à petit : buzzez dès que vous reconnaissez l\'artiste. 2 pts.' },
  buzz10:        { label: 'Buzzer 10 s', group: 'bz', kind: 'buzz10', rule: 'Au GO, comptez 10 secondes dans votre tête et appuyez. Le plus proche prend 2 pts.' },
  duel:          { label: 'Duel', group: 's', kind: 'duel', rule: 'Choisissez un adversaire. Le premier qui trouve gagne 3 pts.' },
  vol:           { label: 'Vol de points', group: 's', kind: 'target', rule: 'Choisissez une victime : vous lui volez 3 pts.' },
  echange:       { label: 'Échange de place', group: 's', kind: 'target', rule: 'Choisissez une équipe : vous échangez vos places sur le plateau.' }
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
  grace: 2500, rolled: 14000, qcm: 25000, duel: 20000, number: 30000, write: 60000, vote: 45000,
  bac: 75000, review: 120000, pick: 20000, buzzReady: 3000, buzzMax: 20000,
  media: 45000, mediaAnswer: 15000, reveal: 120000, hint: 10000, b10cd: 3000,
  audio: 30000,              // blind test musical : 30 s d'écoute maximum
  image: 20000,              // pochette floutée : 20 s maximum
  mode: 15000, emo: 35000, series: 20000, millions: 40000, decide: 25000, clue: 7000, layer: 8000, video: 90000,
  cd: 2200,                  // décompte « bip bip bip » (2 s) avant une question qui s'enchaîne
  bmcWrite: 60000, bmcJudge: 120000, bmcVote: 45000
};
export const CD_MS = 2000;   // durée du décompte affiché avant chaque question ou épreuve
export const BMC_HAND = 5;   // cartes blanches en main par joueur
const BMC_PTS = 2;

export const HOP_MS = 450;               // durée d'un saut de pion sur la télé
export const ROLL_ANIM_MS = 2800;        // durée de l'animation du dé
export const LADDER = [1, 2, 3, 5, 8];   // gains du Millionnaire
const LADDER_SAFE = 1;                  // palier assuré : après la 2e question
const DCC_PTS = { duo: 1, carre: 2, cash: 4 };

const MAX_TEAMS = 6;

// Infos fixes envoyées aux écrans (plateau, règles, jokers, vannes)
const META = {
  board: BOARD.map(type => ({ type, label: TYPES[type].label, group: TYPES[type].group })),
  jokers: JOKERS, colors: COLORS, taunts: TAUNTS, teamNames: TEAM_NAMES,
  timers: { media: 45000, audio: 30000, image: 20000, b10cd: 3000, buzzMax: 20000, clue: 7000, layer: 8000, hint: 10000, hop: HOP_MS, roll: ROLL_ANIM_MS, cd: CD_MS },
  ladder: LADDER, dcc: DCC_PTS, bmcPts: BMC_PTS,
  cultureThemes: { gen: 'Général', ...Object.fromEntries(Object.entries(CULTURE_THEMES).map(([k, v]) => [k, v.label])) }
};

// Banques de questions à choix multiples par type de case
const POOLS = {
  noix: QCM.noix, emojis: QCM.emojis, mensonge: QCM.mensonge, replique: QCM.replique
};
// Épreuves où l'on écrit puis l'on vote
const OPEN_POOLS = {
  // les deux sortes de sujets en alternance
  // Double Sens : une phrase qui marche dans deux situations opposées
  expression: DOUBLESENS.map(d => ({ q: `Une phrase qui marche aussi bien à ${d.a} qu'à ${d.b}`, sub: d.ex ? `Exemple : ${d.ex}` : '' })),
  // le titre est découpé en mots : le joueur glisse son mot entre deux mots, au début ou à la fin
  titredebile: TITRES.map(t => ({ q: `« ${t} »`, words: t.split(/\s+/).filter(Boolean), sub: 'Glissez UN seul mot où vous voulez. Ex. : Star Wars → Star Wars Zazat · Le Parrain → Le Parrain Charcutier' }))
};

// ─── Blanc Manger Coco ───────────────────────────────────────
// Les mains (cartes blanches) sont gardées par joueur pour toute la partie : s.bmc.hands[pid] = [index de carte]
const BLANK = /-{3,}/;
const bmcBlanks = t => Math.max(1, String(t).split(BLANK).length - 1);
const bmcOk = (s, card) => !card.nsfw || !!s.nsfw;
function bmcState(s) { return (s.bmc = s.bmc || { hands: {}, played: [] }); }
// Tire une carte blanche : d'abord une jamais jouée et dans aucune main, puis on remélange la défausse
function bmcDraw(s, rng, mine = [], onlyNsfw = false) {
  const st = bmcState(s);
  let all = BMC.blanches.map((c, i) => i).filter(i => bmcOk(s, BMC.blanches[i]));
  // mode NSFW : une carte sur deux tirée parmi les cartes NSFW (sinon elles se noient dans les gentilles)
  if (s.nsfw && (onlyNsfw || rng() < 0.5)) {
    const inHands = new Set(Object.values(st.hands).flat());
    const x = all.filter(i => BMC.blanches[i].nsfw && !inHands.has(i) && !st.played.includes(i));
    if (x.length) all = x; else if (onlyNsfw) { const y = all.filter(i => BMC.blanches[i].nsfw && !mine.includes(i)); if (y.length) all = y; }
  }
  if (!all.length) return -1;
  const inHands = new Set(Object.values(st.hands).flat());
  let free = all.filter(i => !inHands.has(i) && !st.played.includes(i));
  if (!free.length) { st.played = []; free = all.filter(i => !inHands.has(i)); }
  if (!free.length) free = all.filter(i => !mine.includes(i)); // plus de joueurs que de cartes : on accepte les doublons
  if (!free.length) free = all;
  return free[Math.floor(rng() * free.length)];
}
// Carte noire : jamais la même dans une partie (tant qu'il en reste) ; en NSFW, les cartes NSFW passent en priorité
function bmcBlack(s, rng) {
  const used = s.used.bmcB = s.used.bmcB || [];
  let pool = BMC.noires.map((c, i) => i).filter(i => bmcOk(s, BMC.noires[i]) && !used.includes(i));
  if (!pool.length) { s.used.bmcB = []; return bmcBlack(s, rng); }
  if (s.nsfw && rng() < 0.6) { const x = pool.filter(i => BMC.noires[i].nsfw); if (x.length) pool = x; }
  const i = pool[Math.floor(rng() * pool.length)];
  used.push(i);
  return i;
}
// En passant en NSFW : chaque main reçoit au moins 2 cartes NSFW tout de suite
function bmcSpice(s, pid, rng) {
  const st = bmcState(s), hand = st.hands[pid] || [];
  for (let guard = 0; guard < 6 && hand.filter(i => BMC.blanches[i].nsfw).length < 2; guard++) {
    const soft = hand.filter(i => !BMC.blanches[i].nsfw);
    const i = bmcDraw(s, rng, hand, true);
    if (i < 0 || !BMC.blanches[i].nsfw) break;
    if (hand.length >= BMC_HAND && soft.length) { const k = soft[Math.floor(rng() * soft.length)]; hand.splice(hand.indexOf(k), 1); st.played.push(k); }
    hand.push(i);
  }
  st.hands[pid] = hand;
}
// Complète la main d'un joueur à 5 cartes (et retire les cartes NSFW si le mode n'est plus actif)
function bmcFill(s, pid, rng) {
  const st = bmcState(s);
  const hand = (st.hands[pid] || []).filter(i => BMC.blanches[i] && bmcOk(s, BMC.blanches[i]));
  st.hands[pid] = hand;
  for (let guard = 0; hand.length < BMC_HAND && guard < 20; guard++) {
    const i = bmcDraw(s, rng, hand);
    if (i < 0) break;
    hand.push(i);
  }
}
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

// Jamais deux fois la même question dans une partie : une banque épuisée lève EXHAUSTED
// (la case donne alors une question de consolation), sauf la Culture G qui se remélange.
const EXHAUSTED = new Error('banque épuisée');
function pickIndex(s, key, len, rng, reuse = false) {
  if (!len) throw EXHAUSTED;
  let used = s.used[key] || [];
  if (used.length >= len) { if (!reuse) throw EXHAUSTED; used = []; }
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
  const i = pickIndex(s, 'c_' + th, CULTURE_ALL[th].length, rng, true);
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
    used: {}, feed: [], seq: 0, startedAt: null, endAt: null, deadline: null, lastTaunt: {},
    nsfw: false, bmc: { hands: {}, played: [] }
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
// ctx = { now, rng, pid, host, gm }  → retourne un message d'erreur ou null
// Chaque étape importante (et chaque correction du maître du jeu) est mémorisée pour pouvoir revenir en arrière.
export function handle(s, msg, ctx) {
  const a = msg && msg.t === 'host' ? msg.action : null;
  if (s.phase === 'lobby' || NO_HIST.has(a)) return handleInner(s, msg, ctx);
  const before = snap(s), k0 = stageKey(s), label0 = describe(s);
  const err = handleInner(s, msg, ctx);
  if (err || s.phase === 'lobby') return err;
  const edit = a && EDIT_LABEL[a];
  if (edit) pushHist(s, 'Avant : ' + edit(msg, s), before, ctx.now);
  else if (stageKey(s) !== k0) pushHist(s, label0, before, ctx.now);
  return err;
}

function handleInner(s, msg, ctx) {
  s._now = ctx.now;
  const rng = ctx.rng || Math.random;
  const me = ctx.pid ? s.players[ctx.pid] : null;
  const myTeam = me ? team(s, me.teamId) : null;
  const t = msg && msg.t;

  // ── animateur (écran TV)
  if (t === 'host') {
    if (!ctx.host) return "Seul l'écran principal ou le maître du jeu peut faire ça.";
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
  if (s.paused && t !== 'taunt') return '⏸ Pause ! On attend le maître du jeu.';
  if (s.phase === 'challenge' && s.ch && s.ch.held && ['answer', 'buzz', 'mode', 'theme', 'decide', 'pick', 'vote', 'bmc'].includes(t)) return 'Patience : le maître du jeu va lancer l\'épreuve.';

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
  if (t === 'vote') return vote(s, ctx.pid, msg.i, ctx, rng);
  if (t === 'buzz') return buzz(s, myTeam, ctx, rng);
  if (t === 'mode') return chooseMode(s, myTeam, msg.mode, ctx, rng);
  if (t === 'theme') return chooseTheme(s, myTeam, Number(msg.i), ctx, rng);
  if (t === 'decide') return millionsDecide(s, myTeam, !!msg.go, ctx, rng);
  if (t === 'bmc') return bmcPlay(s, ctx.pid, msg.cards, ctx, rng);
  return 'Message inconnu.';
}

function hostAction(s, msg, ctx, rng) {
  const a = msg.action;
  if (a === 'setDuration') { s.durationMin = Math.max(15, Math.min(300, Number(msg.min) || 120)); return null; }
  // Option NSFW (téléphone du maître du jeu) : ajoute les cartes de cul, de religion et l'humour limite
  if (a === 'setNsfw') {
    const on = !!msg.on;
    if (on === !!s.nsfw) return null;
    s.nsfw = on;
    const st = bmcState(s);
    // en cours de partie : les mains reçoivent tout de suite des cartes NSFW (ou les perdent)
    for (const pid of Object.keys(st.hands)) { bmcFill(s, pid, rng); if (on) bmcSpice(s, pid, rng); }
    if (!on) s.rabbi = null;
    feed(s, 'info', s.nsfw ? '🔞 Mode NSFW activé : on ne répond plus de rien.' : '😇 Mode NSFW désactivé : retour aux cartes gentilles.');
    return null;
  }
  if (a === 'removeTeam') {
    if (s.phase !== 'lobby') return 'Impossible en cours de partie.';
    s.teams = s.teams.filter(x => x.id !== msg.teamId);
    for (const p in s.players) if (s.players[p].teamId === msg.teamId) delete s.players[p];
    return null;
  }
  if (a === 'start') {
    if (s.phase !== 'lobby') return 'Déjà commencée.';
    // Mode test : on peut lancer avec une seule équipe, ou aucune (une équipe test est créée)
    if (!s.teams.length) { s.teams.push(newTeam(s, 'Équipe Test', COLORS[0])); feed(s, 'info', 'Mode test : une équipe fictive est créée. Lancez le dé depuis la télé.'); }
    s.test = s.teams.length < 2;
    // ordre de passage au hasard
    for (let i = s.teams.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [s.teams[i], s.teams[j]] = [s.teams[j], s.teams[i]]; }
    s.phase = 'roll'; s.turn = 0; s.round = 1; s.startedAt = ctx.now; s.endAt = ctx.now + s.durationMin * 60000;
    s.deadline = null;
    feed(s, 'info', `C'est parti ! ${active(s).name} ouvre le bal.`);
    return null;
  }
  if (a === 'adjust') {
    const tm = team(s, msg.teamId); if (!tm) return 'Équipe inconnue.';
    const before = tm.score;
    tm.score = Math.max(0, tm.score + Math.trunc(Number(msg.delta) || 0));
    const d = tm.score - before;
    if (!d) return null;
    if (s.ch && s.ch.gains && (s.phase === 'challenge' || s.phase === 'reveal')) s.ch.gains[tm.id] = (s.ch.gains[tm.id] || 0) + d;
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
  // Mode test : l'animateur envoie le pion directement sur n'importe quelle case
  if (a === 'goto') {
    if (!s.test && !ctx.gm) return 'Réservé au mode test ou au maître du jeu.';
    const i = Number(msg.cell);
    if (!Number.isInteger(i) || i < 0 || i >= BOARD.length) return 'Case inconnue.';
    const tm = active(s);
    s.ch = null;
    s.move = { at: ctx.now - ROLL_ANIM_MS, teamId: tm.id, from: tm.pos, roll: 0, to: i, passed: false, n: ++s.moveSeq, test: true };
    feed(s, 'info', `Mode test : ${tm.name} est téléportée sur « ${TYPES[BOARD[i]].label} ».`);
    applyMove(s, ctx, rng);
    return null;
  }
  // ── le maître du jeu lance l'épreuve (question, chrono, son : tout démarre maintenant)
  if (a === 'launch' || (a === 'next' && s.phase === 'challenge' && s.ch && s.ch.held)) {
    const ch = s.ch;
    if (s.phase !== 'challenge' || !ch || !ch.held) return 'Pas d\'épreuve en attente.';
    const d = Math.max(0, ctx.now - (ch.heldAt || ctx.now));
    delete ch.held; delete ch.heldAt;
    shiftTimes(ch, d);
    s.deadline = ch.deadline || null;
    return null;
  }
  // ── Buzzer 10 s : décompte 3, 2, 1 puis GO
  if (a === 'go') {
    const ch = s.ch;
    if (s.phase !== 'challenge' || !ch || ch.kind !== 'buzz10' || ch.held || ch.stage !== 'ready') return 'Pas de décompte à lancer.';
    if (ch.goAt) return 'Décompte déjà lancé.';
    ch.goAt = ctx.now + T.b10cd; ch.deadline = ch.goAt + T.buzzMax; s.deadline = ch.deadline;
    return null;
  }
  // ── blind test trouvé : la suite de la chanson (la télé ou le téléphone du maître du jeu)
  if (a === 'outro') {
    const ch = s.ch;
    if (s.phase !== 'reveal' || !ch || !ch.item || !ch.item.src) return 'Pas de chanson à écouter.';
    ch.outro = !ch.outro; ch.outroN = (ch.outroN || 0) + 1;
    return null;
  }
  // ── 🔞 le rabbin danse (mode NSFW) ; deuxième appui : il s'assoit et la musique s'arrête
  if (a === 'rabbi') {
    if (!s.nsfw) return 'Seulement en mode NSFW.';
    s.rabbi = s.rabbi && s.rabbi.mode === 'dance' ? { mode: 'sit', at: ctx.now } : { mode: 'dance', at: ctx.now };
    return null;
  }
  if (a === 'roll') {
    if (s.phase !== 'roll') return 'Pas le moment de lancer.';
    doRoll(s, active(s), rng, ctx.now);
    if (msg.value) setRollValue(s, msg.value);
    return null;
  }
  const gmErr = gmAction(s, a, msg, ctx, rng);
  if (gmErr !== undefined) return gmErr;
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
  // égalité au vote (Double Sens, Titre débile, Blanc Manger Coco) : le maître du jeu choisit l'équipe gagnante
  if (a === 'tieBreak' || a === 'bmcPick') {
    const ch = s.ch;
    if (s.phase !== 'challenge' || !ch || (ch.kind !== 'open' && ch.kind !== 'bmc') || (ch.stage !== 'tie' && ch.stage !== 'vote')) return 'Pas d\'égalité à départager.';
    const id = a === 'bmcPick' ? (ch.entries[Number(msg.i)] || {}).teamId : msg.teamId;
    if (!id || !team(s, id)) return 'Équipe inconnue.';
    if (ch.stage === 'tie' && !ch.tied.includes(id)) return 'Cette équipe n\'est pas à égalité.';
    if (ch.stage === 'vote') countVotesOnly(ch);
    ch.winnerTeam = id; ch.tieBroken = ch.stage === 'tie';
    resolve(s, ctx, rng); return null;
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

// ─── maître du jeu : historique, pause, corrections ──────────
const HIST_MAX = 25;
// Actions qui gèrent elles-mêmes l'historique (ou n'ont pas à y figurer)
const NO_HIST = new Set(['undo', 'restoreTo', 'restart', 'newQuestion', 'pause', 'resume', 'replay', 'addTime', 'addGameTime', 'renameTeam', 'movePlayer', 'kick', 'setDuration']);
const tn = (s, id) => (team(s, id) || {}).name || '?';
// Corrections qui méritent un point de retour, avec leur libellé
const EDIT_LABEL = {
  adjust: (m, s) => `${tn(s, m.teamId)} ${Number(m.delta) > 0 ? '+' : ''}${Math.trunc(Number(m.delta) || 0)} pt`,
  setScore: (m, s) => `score de ${tn(s, m.teamId)} → ${m.value}`,
  setSkip: (m, s) => Number(m.n) ? `${tn(s, m.teamId)} bloquée ${m.n} tour(s)` : `${tn(s, m.teamId)} débloquée`,
  setJoker: (m, s) => `joker ${JOKERS[m.kind] ? JOKERS[m.kind].label : m.kind} de ${tn(s, m.teamId)} ${m.on ? 'rendu' : 'retiré'}`,
  setArmed: (m, s) => `${tn(s, m.teamId)} : ${ARMED[m.key] || m.key} ${m.on ? 'activé' : 'désactivé'}`,
  clearCurses: (m, s) => `malédictions de ${tn(s, m.teamId)} levées`,
  setPos: (m, s) => `${tn(s, m.teamId)} déplacée case ${m.cell}`,
  setTurn: (m, s) => `la main passe à ${tn(s, m.teamId)}`,
  judge: m => (m.ok ? 'réponse validée' : 'réponse refusée'),
  bacToggle: (m, s) => `mot du Bac de ${tn(s, m.teamId)} corrigé`,
  cashToggle: (m, s) => `réponse cash de ${tn(s, m.teamId)} corrigée`,
  clearAnswer: (m, s) => `réponse de ${tn(s, m.teamId)} effacée`,
  blockTeam: (m, s) => `${tn(s, m.teamId)} ${m.on ? 'écartée' : 'réintégrée'} de l'épreuve`,
  unbuzz: () => 'buzz annulé',
  setRoll: m => `dé forcé à ${m.value}`,
  reroll: () => 'dé relancé',
  forceCell: m => `case d'arrivée forcée (${m.cell})`,
  goto: m => `envoi direct sur la case ${m.cell}`,
  pick: (m, s) => `cible choisie : ${tn(s, m.teamId)}`,
  theme: () => 'thème choisi par le maître du jeu',
  decide: m => (m.go ? 'on continue (Millionnaire)' : 'on s\'arrête (Millionnaire)'),
  bmcPick: () => 'carte la plus drôle choisie',
  tieBreak: (m, s) => `égalité départagée : ${tn(s, m.teamId)}`,
  setNsfw: m => `mode NSFW ${m.on ? 'activé' : 'désactivé'}`
};
const ARMED = { double: 'Points ×2', shield: 'Bouclier', halve: 'Points ÷2 (malédiction)' };
const STAGE_LBL = { mode: 'choix duo/carré/cash', q: 'question', pick: 'choix de la cible', theme: 'choix du thème', video: 'vidéo', write: 'écriture', vote: 'vote', review: 'correction', play: 'écoute', answer: 'réponse au buzz', ready: 'prêts', running: 'compte', decide: 'on continue ?', judge: 'choix de la plus drôle', tie: 'départage du maître du jeu' };

// État sans l'historique ni le fil d'actu (ce qu'on restaure)
function snap(s) {
  const { hist, chSnap, feed, lastTaunt, _now, ...rest } = s;
  return JSON.stringify(rest);
}
function stageKey(s) {
  const ch = s.ch;
  return [s.phase, s.turn, s.move && s.move.n, ch && ch.cell, ch && ch.stage, ch && ch.i, ch && ch.level, ch && ch.held ? 'H' : ''].join('|');
}
function describe(s) {
  const tm = active(s), n = tm ? tm.name : '?';
  const ch = s.ch;
  if (s.phase === 'roll') return `Tour de ${n} : avant le lancer de dé`;
  if (s.phase === 'rolled' && s.move) return `${n} a fait ${s.move.roll} → case ${s.move.to} (${TYPES[BOARD[s.move.to]].label})`;
  if (s.phase === 'challenge' && ch && ch.held) return `${ch.label} (case ${ch.cell}) : avant le lancement`;
  if (s.phase === 'challenge' && ch) return `${ch.label} (case ${ch.cell}) en cours${STAGE_LBL[ch.stage] ? ' · ' + STAGE_LBL[ch.stage] : ''}${ch.i ? ' · question ' + (ch.i + 1) : ''}`;
  if (s.phase === 'reveal' && ch) return `Résultat : ${ch.label || 'épreuve'} (case ${ch.cell ?? '?'})`;
  return s.phase;
}
function pushHist(s, label, data, at) {
  s.hist = s.hist || [];
  s.histSeq = (s.histSeq || 0) + 1;
  s.hist.push({ id: s.histSeq, label, at, data });
  if (s.hist.length > HIST_MAX) s.hist.splice(0, s.hist.length - HIST_MAX);
}
// Décale toutes les dates (en ms depuis 1970) d'un objet : sert à la pause et aux retours en arrière
function shiftTimes(o, d) {
  if (!o || typeof o !== 'object' || !d) return;
  for (const k of Object.keys(o)) {
    const v = o[k];
    if (typeof v === 'number' && v > 1e12) o[k] = v + d;
    else if (v && typeof v === 'object') shiftTimes(v, d);
  }
}
// Remet le jeu dans un état mémorisé, comme si on y était à l'instant
function restore(s, data, at, now) {
  const old = s;
  const keep = { feed: old.feed, seq: old.seq, players: old.players, lastTaunt: old.lastTaunt, hist: old.hist, histSeq: old.histSeq, chSnap: old.chSnap, hostKey: old.hostKey,
    // questions déjà tirées et réglages de soirée : on ne revient pas dessus
    used: old.used, nsfw: old.nsfw, bmc: old.bmc, rabbi: old.rabbi, pausedMs: old.pausedMs };
  const extraTeams = old.teams;
  const st = JSON.parse(data);
  for (const k of Object.keys(s)) delete s[k];
  Object.assign(s, st, keep);
  // une équipe créée après le point de retour est conservée
  for (const t of extraTeams) if (!s.teams.some(x => x.id === t.id)) s.teams.push({ ...t, pos: t.pos });
  // les noms et couleurs actuels sont gardés (un renommage n'est pas une étape de jeu)
  for (const t of s.teams) { const cur = extraTeams.find(x => x.id === t.id); if (cur) { t.name = cur.name; t.color = cur.color; } }
  s.paused = null;
  const d = now - at;
  shiftTimes(s.ch, d); shiftTimes(s.move, d);
  if (s.deadline) s.deadline += d;
}
function setRollValue(s, value) {
  const r = Math.max(1, Math.min(6, Math.trunc(Number(value)) || 1));
  const m = s.move;
  m.roll = r; m.to = (m.from + r) % BOARD.length; m.passed = m.from + r >= BOARD.length;
}
function videoDur(item) { return item && item.stop != null ? Math.max(3000, (item.stop - (item.start || 0)) * 1000 + 1500) : T.video; }

// Actions du maître du jeu. Retourne undefined si l'action n'est pas d'ici.
function gmAction(s, a, msg, ctx, rng) {
  const now = ctx.now, ch = s.ch;
  const tm = msg.teamId ? team(s, msg.teamId) : null;
  const needTeam = () => tm ? null : 'Équipe inconnue.';
  switch (a) {
    case 'pause':
      if (s.paused) return 'Déjà en pause.';
      s.paused = { at: now }; feed(s, 'info', '⏸ Pause ! Personne ne bouge.');
      return null;
    case 'resume': {
      if (!s.paused) return 'Le jeu n\'est pas en pause.';
      const d = now - s.paused.at;
      s.paused = null;
      shiftTimes(s.ch, d); shiftTimes(s.move, d);
      if (s.deadline) s.deadline += d;
      if (s.endAt) s.endAt += d;
      s.pausedMs = (s.pausedMs || 0) + d;   // temps de pause cumulé (pour proposer une pause toutes les heures de jeu)
      feed(s, 'info', '▶️ On reprend !');
      return null;
    }
    case 'undo': case 'restoreTo': {
      const h = s.hist || [];
      const idx = a === 'undo' ? h.length - 1 : h.findIndex(x => x.id === Number(msg.id));
      if (idx < 0) return 'Rien à annuler.';
      const e = h[idx];
      restore(s, e.data, e.at, now);
      s.hist = h.slice(0, idx);
      feed(s, 'info', `↩️ Retour en arrière : ${e.label.replace(/^Avant : /, 'avant « ') + (e.label.startsWith('Avant : ') ? ' »' : '')}`);
      return null;
    }
    case 'restart': case 'newQuestion': {
      const cs = s.chSnap;
      if (!cs || !ch || !s.move || cs.n !== s.move.n) return 'Pas d\'épreuve à relancer.';
      pushHist(s, describe(s), snap(s), now);
      const used = s.used;
      restore(s, cs.data, cs.at, now);
      if (a === 'newQuestion') {
        s.used = used;
        s.ch = null;
        startCell(s, BOARD[active(s).pos], { ...ctx, now }, rng, {});
        s.chSnap = { at: now, n: s.move.n, data: snap(s) };
        feed(s, 'info', '🔀 Le maître du jeu change de question.');
      } else {
        // on repart avec le délai d'affichage normal
        if (s.ch && s.ch.startsAt) { const d = now + T.grace - s.ch.startsAt; shiftTimes(s.ch, d); if (s.deadline) s.deadline += d; }
        feed(s, 'info', '🔄 L\'épreuve recommence à zéro.');
      }
      return null;
    }
    case 'setScore': {
      if (needTeam()) return needTeam();
      const v = Math.max(0, Math.trunc(Number(msg.value)) || 0), d = v - tm.score;
      tm.score = v;
      if (d && s.ch && s.ch.gains && (s.phase === 'challenge' || s.phase === 'reveal')) s.ch.gains[tm.id] = (s.ch.gains[tm.id] || 0) + d;
      feed(s, 'points', `Le maître du jeu fixe le score de ${tm.name} à ${v}.`);
      return null;
    }
    case 'setSkip':
      if (needTeam()) return needTeam();
      tm.skip = Math.max(0, Math.min(5, Math.trunc(Number(msg.n)) || 0));
      feed(s, 'info', tm.skip ? `⛔ ${tm.name} passera ${tm.skip > 1 ? 'ses ' + tm.skip + ' prochains tours' : 'son prochain tour'}.` : `✅ ${tm.name} est débloquée.`);
      return null;
    case 'setJoker':
      if (needTeam()) return needTeam();
      if (!JOKERS[msg.kind]) return 'Joker inconnu.';
      tm.jokers[msg.kind] = msg.on ? 1 : 0;
      return null;
    case 'setArmed':
      if (needTeam()) return needTeam();
      if (!ARMED[msg.key]) return 'Effet inconnu.';
      tm.armed[msg.key] = !!msg.on;
      return null;
    case 'clearCurses':
      if (needTeam()) return needTeam();
      tm.curses = []; tm.armed.halve = false;
      return null;
    case 'setPos': {
      if (needTeam()) return needTeam();
      const c = Number(msg.cell);
      if (!Number.isInteger(c) || c < 0 || c >= BOARD.length) return 'Case inconnue.';
      tm.pos = c;
      return null;
    }
    case 'setTurn': {
      if (needTeam()) return needTeam();
      s.turn = s.teams.indexOf(tm);
      s.ch = null; s.move = null; s.chSnap = null; s.phase = 'roll'; s.deadline = null;
      feed(s, 'info', `Le maître du jeu donne la main à ${tm.name} 🎲`);
      return null;
    }
    case 'setRoll':
      if (s.phase !== 'rolled') return 'Seulement juste après un lancer.';
      setRollValue(s, msg.value);
      return null;
    case 'reroll': {
      if (s.phase !== 'rolled') return 'Seulement juste après un lancer.';
      const old = s.move.roll;
      doRoll(s, team(s, s.move.teamId), rng, now);
      feed(s, 'info', `🎲 Le maître du jeu relance le dé : ${old} → ${s.move.roll}`);
      return null;
    }
    case 'renameTeam': {
      if (needTeam()) return needTeam();
      const name = clampText(msg.name, 28);
      if (!name) return 'Nom vide.';
      if (s.teams.some(x => x !== tm && norm(x.name) === norm(name))) return 'Ce nom est déjà pris.';
      tm.name = name;
      return null;
    }
    case 'movePlayer': {
      const p = s.players[msg.pid];
      if (!p) return 'Joueur inconnu.';
      if (needTeam()) return needTeam();
      p.teamId = tm.id;
      return null;
    }
    case 'kick':
      if (!s.players[msg.pid]) return 'Joueur inconnu.';
      delete s.players[msg.pid];
      return null;
    case 'addGameTime': {
      const m = Math.max(-120, Math.min(120, Math.trunc(Number(msg.min)) || 0));
      s.durationMin = Math.max(5, s.durationMin + m);
      if (s.startedAt) s.endAt = s.startedAt + s.durationMin * 60000;
      return null;
    }
  }
  // ── pendant une épreuve
  if (a === 'addTime') {
    const add = Math.max(-120, Math.min(300, Math.trunc(Number(msg.sec)) || 15)) * 1000;
    if (!s.deadline) return 'Pas de chrono en cours.';
    if (s.phase === 'challenge' && ch && ch.kind === 'buzz10') return 'Pas de rallonge sur le Buzzer 10 s.';
    s.deadline = Math.max(now + 3000, s.deadline + add);
    if (ch && ch.deadline) ch.deadline = s.deadline;
    return null;
  }
  if (a === 'replay') {
    if (!ch || (!ch.item && ch.kind !== 'media')) return 'Pas d\'extrait à relancer.';
    ch.replay = (ch.replay || 0) + 1;
    if (s.phase === 'challenge' && ch.stage === 'play') {
      ch.startsAt = now + 300;
      ch.deadline = Math.max(ch.deadline, now + (ch.playMs || playDuration(ch.media, ch.item)));
      s.deadline = ch.deadline;
    } else if (s.phase === 'challenge' && ch.stage === 'video') {
      ch.startsAt = now + 300;
      ch.deadline = now + 300 + videoDur(ch.item); s.deadline = ch.deadline;
    }
    return null;
  }
  if (s.phase !== 'challenge' || !ch) return undefined;
  if (a === 'unbuzz') {
    if (ch.kind !== 'media' || ch.stage !== 'answer') return 'Personne n\'a buzzé.';
    feed(s, 'info', `Buzz de ${tn(s, ch.buzzer)} annulé, on reprend !`);
    ch.buzzer = null; ch.stage = 'play';
    resumePlay(s, ch, now);
    return null;
  }
  if (a === 'pick') {
    if (ch.stage !== 'pick') return 'Pas de cible à choisir.';
    if (!tm || tm.id === ch.teamId) return 'Cible invalide.';
    doPick(s, tm, ctx, rng); return null;
  }
  if (a === 'theme') {
    if (ch.kind !== 'series' || ch.stage !== 'theme') return 'Pas de thème à choisir.';
    const th = ch.themes[Number(msg.i)]; if (!th) return 'Thème inconnu.';
    doTheme(s, th, ctx, rng); return null;
  }
  if (a === 'decide') {
    if (ch.kind !== 'millions' || ch.stage !== 'decide') return 'Pas de décision à prendre.';
    return millionsDecide(s, team(s, ch.teamId), !!msg.go, ctx);
  }
  if (a === 'clearAnswer') {
    if (needTeam()) return needTeam();
    const id = tm.id;
    let done = false;
    if (ch.answers && ch.answers[id] !== undefined && !(ch.kind === 'bac' && ch.stage === 'review')) { delete ch.answers[id]; done = true; }
    if (ch.kind === 'dcc' && ch.stage === 'mode' && ch.modes[id]) { delete ch.modes[id]; done = true; }
    // vote par joueur : on efface ce qu'ont écrit (ou voté) les joueurs de l'équipe
    if (ch.kind === 'open' && ch.stage === 'write') for (const p of Object.keys(ch.texts)) if (s.players[p] && s.players[p].teamId === id) { delete ch.texts[p]; done = true; }
    if ((ch.kind === 'open' || ch.kind === 'bmc') && ch.stage === 'vote') for (const p of Object.keys(ch.pv)) if (s.players[p] && s.players[p].teamId === id) { delete ch.pv[p]; done = true; }
    if (ch.taps && ch.taps[id] !== undefined) { delete ch.taps[id]; done = true; }
    if (ch.fifty && ch.fifty[id]) delete ch.fifty[id];
    return done ? null : 'Cette équipe n\'a rien à effacer.';
  }
  if (a === 'blockTeam') {
    if (needTeam()) return needTeam();
    const id = tm.id;
    ch.blocked = ch.blocked || [];
    if (msg.on) {
      if (ch.blocked.includes(id)) return null;
      ch.blocked.push(id);
      if (ch.kind === 'media') {
        if (!ch.excluded.includes(id)) ch.excluded.push(id);
        if (ch.stage === 'answer' && ch.buzzer === id) { ch.buzzer = null; ch.stage = 'play'; resumePlay(s, ch, now); }
        if (s.teams.every(x => ch.excluded.includes(x.id))) resolve(s, ctx, rng);
      } else if (ch.participants) {
        ch.participants = ch.participants.filter(x => x !== id);
        if (ch.answers) delete ch.answers[id];
        if (ch.taps) delete ch.taps[id];
        if (ch.participants.length && ch.stage !== 'review' && (ch.kind === 'buzz10' ? ch.participants.every(x => ch.taps[x] !== undefined) : ch.answers && ch.participants.every(x => ch.answers[x] !== undefined))) {
          if (ch.kind === 'buzz10') resolve(s, ctx, rng); else closeAnswers(s, ctx, rng);
        }
      } else return 'Impossible d\'écarter une équipe de cette épreuve.';
      feed(s, 'info', `🚫 ${tm.name} est écartée de l'épreuve.`);
      return null;
    }
    if (!ch.blocked.includes(id)) return null;
    ch.blocked = ch.blocked.filter(x => x !== id);
    if (ch.kind === 'media') ch.excluded = ch.excluded.filter(x => x !== id);
    else if (ch.participants && !ch.participants.includes(id)) ch.participants.push(id);
    feed(s, 'info', `✅ ${tm.name} peut de nouveau jouer.`);
    return null;
  }
  return undefined;
}

// ─── dé et déplacement ───────────────────────────────────────
function doRoll(s, tm, rng, now) {
  const r = 1 + Math.floor(rng() * 6);
  const from = tm.pos;
  s.move = { at: now, teamId: tm.id, from, roll: r, to: (from + r) % BOARD.length, passed: from + r >= BOARD.length, n: ++s.moveSeq, rerolled: !!(s.move && s.move.teamId === tm.id && s.phase === 'rolled') };
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
  const hops = Math.min(12, s.move.roll || 0);
  const animLeft = Math.max(0, (s.move.at || 0) + ROLL_ANIM_MS - ctx.now);
  startCell(s, BOARD[tm.pos], { ...ctx, now: ctx.now + animLeft + hops * HOP_MS + 400 }, rng, s.ch ? s.ch.gains : {});
  s.chSnap = { at: ctx.now, n: s.move.n, data: snap(s) };
}

// Durée d'écoute / d'affichage d'une épreuve au buzzer
function playDuration(media, item) {
  if (media === 'layers') return Math.max(T.media, item.layers.length * T.layer + 15000);
  if (media === 'audio') return T.audio;
  if (media === 'image') return T.image;
  return T.media;
}
// Question par défaut d'une fiche QCM sans « question : »
const QCM_Q = { bt_musique: 'Quel est ce morceau ?', bt_ecrans: 'De quelle série ou de quel film vient cette musique ?', bt_jeux: 'De quel jeu vidéo vient cette musique ?', replique: 'De quel film vient cette réplique ?', pochette: 'Quel est cet artiste ?' };

// ─── démarrage d'une case ────────────────────────────────────
function startCell(s, type, ctx, rng, gains = {}) {
  const usedBefore = JSON.stringify(s.used);
  try { startCellInner(s, type, ctx, rng, gains); }
  catch (e) {
    if (e !== EXHAUSTED) throw e;
    // toutes les questions de cette case ont déjà servi : question de Culture G à la place
    s.used = JSON.parse(usedBefore);
    const meta = TYPES[type], tm = active(s), now = ctx.now;
    s.ch = { type, kind: 'qcm', label: meta.label, group: meta.group, teamId: tm.id, gains, startsAt: now + T.grace, cell: tm.pos,
      fallback: type, q: culturePick(s, rng), participants: s.teams.map(x => x.id), answers: {}, fifty: {}, deadline: now + T.grace + T.qcm,
      rule: 'Toutes les questions de cette case ont déjà été jouées. Question de consolation, 2 pts / 1 pt.' };
    s.phase = 'challenge'; s.deadline = s.ch.deadline;
  }
  // chaque épreuve attend que le maître du jeu la lance (il a déjà la question et la réponse sur son téléphone)
  if (s.phase === 'challenge' && s.ch && !s.ch.held) {
    s.ch.held = true; s.ch.heldAt = (s.ch.startsAt || ctx.now) - T.grace; s.deadline = null;
  }
}
function startCellInner(s, type, ctx, rng, gains = {}) {
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
    // fichiers déposés dans public/media/<dossier>/ (index généré) + entrées écrites dans content.js
    const pool = meta.media === 'text' ? CONTRARIO
      : [...(MEDIA_INDEX[type] || []), ...(MEDIA[type] || []).filter(x => x.src || x.img || (Array.isArray(x.layers) && x.layers.length))];
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
    const playMs = playDuration(meta.media, item);
    s.ch = { ...base, media: meta.media, item, playMs, stage: 'play', buzzer: null, excluded: [], deadline: now + T.grace + playMs };
    s.phase = 'challenge'; s.deadline = s.ch.deadline; return;
  }
  if (meta.kind === 'qcm') {
    const pool = POOLS[type];
    const i = pickIndex(s, type, pool.length, rng);
    s.ch = { ...base, q: shuffleQ(pool[i], rng), participants: all, answers: {}, fifty: {}, deadline: now + T.grace + T.qcm };
  } else if (meta.emo) {
    // Emojis : pas de propositions au départ. Chaque équipe tape la réponse (cash) ou prend le carré.
    const pool = POOLS[type];
    const i = pickIndex(s, type, pool.length, rng);
    s.ch = { ...base, emo: true, q: shuffleQ(pool[i], rng), stage: 'q', modes: {}, duo: {}, participants: all, answers: {}, fifty: {}, deadline: now + T.grace + T.emo };
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
    // chaque joueur connecté écrit sa proposition (ch.texts[pid]), puis vote (voir toVote)
    s.ch = { ...base, q: { ...pool[i] }, stage: 'write', participants: all, players: onlinePids(s, ctx), texts: {}, answers: {}, deadline: now + T.grace + T.write };
    if (!s.ch.players.length) return toReveal(s, ctx, 'Aucun joueur connecté : on passe.');
  } else if (meta.kind === 'bac') {
    const letter = BAC.letters[Math.floor(rng() * BAC.letters.length)];
    const cats = [...BAC.cats].sort(() => rng() - 0.5).slice(0, 5);
    s.ch = { ...base, letter, cats, stage: 'write', participants: all, answers: {}, valid: {}, deadline: now + T.grace + T.bac };
  } else if (meta.kind === 'bmc') {
    // carte noire tirée parmi celles autorisées (gentilles, ou toutes en mode NSFW)
    const black = BMC.noires[bmcBlack(s, rng)];
    // joueurs : ceux qui sont connectés (ou tous les inscrits si on ne sait pas)
    const pids = onlinePids(s, ctx);
    for (const p of pids) bmcFill(s, p, rng);
    s.ch = { ...base, black: { t: black.t, n: bmcBlanks(black.t) }, stage: 'write', players: pids, picks: {}, deadline: null };
    if (!pids.length) { s.ch.entries = []; return toReveal(s, ctx, 'Personne n\'a de cartes en main (aucun joueur connecté). On passe.'); }
  } else if (meta.kind === 'buzz10') {
    // pas de GO automatique : le maître du jeu déclenche le décompte 3, 2, 1 (action « go »)
    s.ch = { ...base, stage: 'ready', goAt: null, participants: all, taps: {}, deadline: null };
  } else if (meta.kind === 'duel' || meta.kind === 'target') {
    if (!others(s, tm.id).length) { s.ch = base; return toReveal(s, ctx, 'Pas d\'adversaire à cette table (mode test) : on passe. Allez, au suivant.'); }
    s.ch = { ...base, stage: 'pick', target: null, deadline: now + T.grace + T.pick };
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
    // Emojis : une réponse tapée sans avoir pris le carré, c'est du cash
    if (ch.emo && !ch.modes[tm.id] && typeof value === 'string' && !/^\d$/.test(value)) ch.modes[tm.id] = 'cash';
    if (ch.emo && !ch.modes[tm.id]) return 'Tapez la réponse ou prenez le carré.';
    if (ch.emo && ch.modes[tm.id] === 'carre' && typeof value === 'string' && !/^\d$/.test(value)) return 'Votre équipe a déjà pris le carré : choisissez une des 4 propositions.';
    if (ch.modes[tm.id] === 'cash') {
      const v = clampText(value, 60);
      if (!v) return 'Tapez une réponse.';
      ch.answers[tm.id] = { v, cash: true };
    } else {
      const v = Number(value);
      const allowed = ch.modes[tm.id] === 'duo' ? ch.duo[tm.id] : ch.q.o.map((_, i) => i);
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
    // une proposition par JOUEUR
    if (ch.stage !== 'write') return 'Trop tard pour écrire, place au vote.';
    const pid = ctx.pid;
    if (!pid || !ch.players.includes(pid)) return 'Arrivé en cours de route : pas de proposition pour celle-là. Profitez du spectacle 🍿';
    if (ch.texts[pid]) return 'Vous avez déjà envoyé votre proposition.';
    if (ch.q.words && value && typeof value === 'object') {
      // Titre débile : { pos, word } = le mot glissé à la position pos (0 = avant le premier mot)
      const words = ch.q.words, pos = Number(value.pos);
      const w = clampText(value.word, 30);
      if (!w) return 'Écrivez votre mot dans un des trous.';
      if (!Number.isInteger(pos) || pos < 0 || pos > words.length) return 'Position invalide.';
      ch.texts[pid] = { v: [...words.slice(0, pos), w, ...words.slice(pos)].join(' '), ins: pos, w };
    } else {
      const v = clampText(value, 140);
      if (!v) return 'Écrivez quelque chose, même une bêtise.';
      ch.texts[pid] = { v };
    }
    if (livePlayers(s, ch).every(p => ch.texts[p] || !isParticipant(ch, s.players[p].teamId))) toVote(s, ctx, rng);
    return null;
  } else if (ch.kind === 'bac') {
    if (ch.stage !== 'write') return 'Trop tard, stylos posés !';
    const arr = Array.isArray(value) ? value : [];
    ch.answers[tm.id] = { v: ch.cats.map((_, i) => clampText(arr[i], 40)) };
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
  if (ch.kind === 'open' && ch.stage === 'write') return toVote(s, ctx, rng);
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

// ─── Vote par joueur : Double Sens, Titre débile, Blanc Manger Coco ───
// Chaque joueur propose, puis vote pour UNE proposition d'une AUTRE équipe (les siennes ne lui sont pas montrées).
// Les votes s'additionnent par équipe ; l'équipe la plus votée gagne. Égalité (ou aucun vote) : le maître du jeu départage.
function onlinePids(s, ctx) {
  const online = Array.isArray(ctx.online) ? ctx.online : null;
  return Object.keys(s.players).filter(p => !online || online.includes(p));
}
const livePlayers = (s, ch) => (ch.players || []).filter(p => s.players[p]);
function toVote(s, ctx, rng = Math.random) {
  const ch = s.ch;
  const bmc = ch.kind === 'bmc';
  const src = (bmc ? ch.picks : ch.texts) || {};
  const entries = Object.entries(src).filter(([pid]) => s.players[pid] && isParticipantTeam(ch, s.players[pid].teamId)).map(([pid, x]) => ({
    pid, teamId: s.players[pid].teamId, name: s.players[pid].name || '', ...(bmc ? { parts: x.map(i => BMC.blanches[i].t) } : x)
  }));
  for (let i = entries.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [entries[i], entries[j]] = [entries[j], entries[i]]; }
  ch.entries = entries; ch.pv = {}; ch.ev = entries.map(() => 0); ch.tally = {};
  if (!entries.length) return toReveal(s, ctx, bmc ? 'Personne n\'a joué de carte. Un grand moment de solitude.' : 'Personne n\'a rien écrit. L\'inspiration a pris des vacances.');
  // votants : les joueurs du départ qui ont au moins une proposition d'une autre équipe à lire
  ch.voters = livePlayers(s, ch).filter(p => isParticipantTeam(ch, s.players[p].teamId) && entries.some(e => e.teamId !== s.players[p].teamId));
  if (!ch.voters.length) {
    const teams = [...new Set(entries.map(e => e.teamId))];
    if (!bmc && teams.length === 1) { ch.courage = teams[0]; return resolve(s, ctx, rng); }
    return toTie(s, teams);
  }
  ch.stage = 'vote'; ch.deadline = ctx.now + (bmc ? T.bmcVote : T.vote); s.deadline = ch.deadline;
}
const isParticipantTeam = (ch, id) => !ch.participants || ch.participants.includes(id);
function toTie(s, teams) {
  const ch = s.ch;
  ch.tied = teams; ch.stage = 'tie'; ch.deadline = null; s.deadline = null;   // pas de chrono : le maître du jeu tranche
}
function vote(s, pid, i, ctx, rng) {
  const ch = s.ch;
  if (s.phase !== 'challenge' || !ch || (ch.kind !== 'open' && ch.kind !== 'bmc') || ch.stage !== 'vote') return 'Pas de vote en cours.';
  if (!pid || !ch.voters.includes(pid)) return 'Vous ne votez pas pour celle-là.';
  const k = Number(i), e = ch.entries[k];
  if (!Number.isInteger(k) || !e) return 'Proposition inconnue.';
  if (e.teamId === s.players[pid].teamId) return 'Voter pour son équipe ? La honte. Refusé.';
  if (ch.pv[pid] !== undefined) return 'Déjà voté.';
  ch.pv[pid] = k;
  if (ch.voters.every(p => ch.pv[p] !== undefined || !s.players[p])) countVotes(s, ctx, rng);
  return null;
}
function countVotesOnly(ch) {
  const tally = {}; ch.ev = ch.entries.map(() => 0);
  for (const k of Object.values(ch.pv)) { ch.ev[k]++; const t = ch.entries[k].teamId; tally[t] = (tally[t] || 0) + 1; }
  ch.tally = tally;
}
function countVotes(s, ctx, rng) {
  const ch = s.ch;
  countVotesOnly(ch);
  const tally = ch.tally;
  const max = Math.max(0, ...Object.values(tally));
  const top = (max ? Object.keys(tally).filter(id => tally[id] === max) : [...new Set(ch.entries.map(e => e.teamId))]).filter(id => team(s, id));
  if (top.length === 1) { ch.winnerTeam = top[0]; return resolve(s, ctx, rng); }
  if (!top.length) return resolve(s, ctx, rng);
  feed(s, 'info', max ? `⚖️ Égalité (${max} vote${max > 1 ? 's' : ''}) : le maître du jeu départage.` : '⚖️ Aucun vote : le maître du jeu tranche.');
  toTie(s, top);
}

// ─── Blanc Manger Coco : chacun joue ses cartes, puis le maître du jeu choisit ───
function bmcPlay(s, pid, cards, ctx, rng) {
  const ch = s.ch;
  if (s.phase !== 'challenge' || !ch || ch.kind !== 'bmc') return 'Pas de Blanc Manger Coco en cours.';
  if (ch.stage !== 'write') return 'Trop tard, on est déjà au vote.';
  if (ctx.now < ch.startsAt) return 'Attendez que la carte noire s\'affiche !';
  if (!ch.players.includes(pid)) return 'Vous n\'avez pas de cartes pour celle-là (arrivé en cours de route ?).';
  if (ch.picks[pid]) return 'Vous avez déjà joué.';
  const hand = bmcState(s).hands[pid] || [];
  const arr = (Array.isArray(cards) ? cards : [cards]).map(Number);
  if (arr.length !== ch.black.n) return ch.black.n > 1 ? `Il faut ${ch.black.n} cartes, dans l'ordre.` : 'Choisissez une carte.';
  if (new Set(arr).size !== arr.length || !arr.every(i => hand.includes(i))) return 'Ces cartes ne sont pas dans votre main.';
  ch.picks[pid] = arr;
  // les cartes jouées partent à la défausse, la main est complétée à 5
  const st = bmcState(s);
  st.hands[pid] = hand.filter(i => !arr.includes(i));
  st.played.push(...arr);
  bmcFill(s, pid, rng);
  if (ch.players.every(p => ch.picks[p] || !s.players[p] || !isParticipantTeam(ch, s.players[p].teamId))) toVote(s, ctx, rng);
  return null;
}
// Points et phrase de fin d'un vote par joueur
function voteSummary(s, ch) {
  const bmc = ch.kind === 'bmc';
  if (ch.courage && team(s, ch.courage)) {
    award(s, team(s, ch.courage), 1); ch.winners = [ch.courage];
    return `Seule ${team(s, ch.courage).name} a osé répondre : 1 pt pour le courage.`;
  }
  const wt = ch.winnerTeam && team(s, ch.winnerTeam);
  if (!wt) { ch.winners = []; return bmc ? 'Personne ne marque. Tout le monde est vexé.' : 'Personne ne marque. Vous êtes tous des lâches.'; }
  award(s, wt, bmc ? BMC_PTS : 2); ch.winners = [wt.id];
  // la proposition gagnante mise en avant : la plus votée de l'équipe gagnante
  let best = -1;
  (ch.entries || []).forEach((e, i) => { if (e.teamId === wt.id && (best < 0 || (ch.ev[i] || 0) > (ch.ev[best] || 0))) best = i; });
  ch.winner = best >= 0 ? best : undefined;
  const n = (ch.tally || {})[wt.id] || 0;
  const e = ch.entries[best];
  const who = bmc && e && e.name ? `${e.name} (${wt.name})` : wt.name;
  if (ch.tieBroken) return `Égalité, le maître du jeu a tranché : ${who} ! ${bmc ? '🃏' : ''}`;
  return bmc ? `La plus drôle selon vous : ${who}, avec ${n} vote${n > 1 ? 's' : ''}. Vous avez mauvais goût. 🃏` : `Le public a parlé : ${who}, avec ${n} vote${n > 1 ? 's' : ''}.`;
}

// ─── Duo, carré ou cash ──────────────────────────────────────
function chooseMode(s, tm, mode, ctx, rng) {
  const ch = s.ch;
  if (s.phase === 'challenge' && ch && ch.emo && ch.stage === 'q') {
    // Emojis : on peut passer du cash au carré tant qu'on n'a pas répondu
    if (mode !== 'carre') return 'Tapez la réponse, ou prenez le carré.';
    if (!isParticipant(ch, tm.id)) return 'Ce n\'est pas votre question.';
    if (ctx.now < ch.startsAt) return 'Attendez que les emojis s\'affichent !';
    if (ch.modes[tm.id] || ch.answers[tm.id] !== undefined) return 'Déjà choisi.';
    ch.modes[tm.id] = 'carre';
    return null;
  }
  if (s.phase !== 'challenge' || !ch || ch.kind !== 'dcc' || ch.stage !== 'mode') return 'Trop tard pour choisir.';
  if (!DCC_PTS[mode]) return 'Duo, carré ou cash, rien d\'autre.';
  if (!isParticipant(ch, tm.id)) return 'Ce n\'est pas votre question.';
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
      const wrong = ch.q.o.map((_, i) => i).filter(i => i !== ch.q.a);
      const pair = [ch.q.a, wrong[Math.floor(rng() * wrong.length)]];
      ch.duo[id] = rng() < 0.5 ? pair : pair.reverse();
    }
  }
  ch.stage = 'q'; ch.startsAt = ctx.now + T.cd; ch.deadline = ch.startsAt + T.qcm; s.deadline = ch.deadline;
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
  ch.startsAt = ctx.now + (i ? T.cd : T.grace);
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
  ch.startsAt = ctx.now + T.cd; ch.deadline = ch.startsAt + T.millions; s.deadline = ch.deadline;
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
    if (!ch.goAt) return 'Attendez le décompte du maître du jeu !';
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
  if (ok) {
    ch.winner = tm.id;
    const q = ch.item && ch.item.qcm;
    if (q && q.o && q.o.length >= 2) return startBonusQcm(s, ctx, rng);
    return resolve(s, ctx, rng);
  }
  ch.excluded.push(tm.id);
  feed(s, 'info', `${tm.name} se plante. Les autres peuvent buzzer !`);
  ch.buzzer = null; ch.stage = 'play';
  if (s.teams.every(x => ch.excluded.includes(x.id))) return resolve(s, ctx, rng);
  resumePlay(s, ch, ctx.now);
}
// Question bonus (fiche QCM) : après la bonne réponse validée par le maître du jeu,
// l'équipe qui a trouvé choisit duo, carré ou cash. Les points du blind test sont acquis tout de suite.
function startBonusQcm(s, ctx, rng) {
  const ch = s.ch, w = team(s, ch.winner), it = ch.item, now = ctx.now;
  ch.basePts = award(s, w, mediaPoints(ch));
  feed(s, 'points', `${w.name} a trouvé : +${ch.basePts} pt${ch.basePts > 1 ? 's' : ''}. Question bonus ! 🎁`);
  ch.kind = 'dcc'; ch.bonusQcm = true; ch.stage = 'mode';
  ch.q = shuffleQ({ q: it.qcm.q || QCM_Q[ch.type] || 'Question bonus', o: it.qcm.o, a: it.qcm.a || 0, k: it.qcm.k, f: it.info }, rng);
  ch.modes = {}; ch.duo = {}; ch.answers = {}; ch.fifty = {}; ch.participants = [w.id];
  ch.rule = `Question bonus pour ${w.name} : duo 1 pt, carré 2 pts, cash 4 pts.`;
  ch.buzzer = null;
  ch.startsAt = now + 1200; ch.deadline = ch.startsAt + T.mode; s.deadline = ch.deadline;
}
// Points d'une bonne réponse au buzzer
function mediaPoints(ch) {
  let pts = ch.type === 'unenote' ? 3 : 2;
  if (ch.media === 'layers') { const n = ch.item.layers.length; ch.layerAt = Math.min(n, 1 + Math.floor((ch.buzzAt - ch.startsAt) / T.layer)); pts = Math.max(1, n + 1 - ch.layerAt); }
  if (ch.media === 'text') { ch.hintsSeen = Math.min((ch.item.hints || []).length, Math.floor(Math.max(0, ch.buzzAt - ch.startsAt) / T.hint)); pts = Math.max(1, 3 - ch.hintsSeen); }
  return pts + (ch.bonus ? 1 : 0);
}
// Reprise après un buzz : le temps passé à répondre ne compte pas (indices, couches, floutage)
function resumePlay(s, ch, now) {
  if (ch.buzzAt && ch.buzzAt >= ch.startsAt) ch.startsAt += now - ch.buzzAt;
  ch.buzzAt = null;
  ch.deadline = now + (ch.remaining || 15000); s.deadline = ch.deadline;
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
      if (ch.ok[id]) award(s, team(s, id), DCC_PTS[ch.modes[id]] + (id === tm.id && !ch.bonusQcm ? 1 : 0));
    }
    const ok = Object.keys(ch.ok).filter(id => ch.ok[id]);
    const cashers = ok.filter(id => ch.modes[id] === 'cash');
    if (ch.bonusQcm) {
      const w = team(s, ch.winner), good = ok.length > 0;
      summary = `${w.name} a trouvé « ${ch.item.answer} » (+${ch.basePts}) ${good ? `et réussit la question bonus${ch.modes[w.id] === 'cash' ? ' en CASH 💰' : ''} !` : 'mais rate la question bonus.'}`;
    } else
    summary = cashers.length ? `CASH ! ${cashers.map(id => team(s, id).name).join(', ')} ${cashers.length > 1 ? 'ont' : 'a'} tout misé et gagné. 💰` : ok.length ? `Bonne réponse pour ${ok.map(id => team(s, id).name).join(', ')}.` : ch.emo ? 'Personne n\'a trouvé. Les emojis, c\'est pas votre langue maternelle.' : 'Personne n\'a trouvé. Ni en duo, ni en carré, ni en rien.';
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
  } else if (ch.kind === 'open' || ch.kind === 'bmc') {
    summary = voteSummary(s, ch);
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
      const pts = mediaPoints(ch) - (ch.bonus ? 1 : 0);
      award(s, w, pts + (ch.bonus ? 1 : 0));
      summary = ch.media === 'text' ? `${w.name} a trouvé ${ch.hintsSeen ? `avec ${ch.hintsSeen} indice${ch.hintsSeen > 1 ? 's' : ''}` : 'sans aucun indice'} : ${pts} pt${pts > 1 ? 's' : ''} !`
        : `${w.name} a trouvé${ch.bonus ? ', avec le bonus en prime' : ''} !`;
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
  s.ch = null; s.move = null; s.deadline = null; s.chSnap = null;
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
  if (ch.kind === 'bmc' && ch.stage === 'write') return toVote(s, ctx, rng);
  if ((ch.kind === 'open' || ch.kind === 'bmc') && ch.stage === 'vote') return countVotes(s, ctx, rng);
  return resolve(s, ctx, rng);
}

export function nextDeadline(s) {
  if (s.paused) return null;
  if (s.phase === 'challenge' && s.ch && s.ch.kind === 'buzz10' && s.ch.stage === 'ready') return s.ch.held ? null : s.ch.goAt;
  return s.deadline;
}

// online = joueurs connectés (facultatif, sert à savoir qui reçoit des cartes au Blanc Manger Coco)
export function tick(s, now, rng = Math.random, online) {
  const d0 = nextDeadline(s);
  if (!d0 || now < d0) return false;
  const before = snap(s), k0 = stageKey(s), label0 = describe(s);
  const changed = tickInner(s, now, rng, online);
  if (changed && stageKey(s) !== k0 && s.phase !== 'lobby') pushHist(s, label0, before, now);
  return changed;
}
function tickInner(s, now, rng, online) {
  s._now = now;
  const ctx = { now, online };
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
export function view(s, viewer = {}, extra = {}) {
  const { hist, chSnap, ...rest } = s;
  const v = JSON.parse(JSON.stringify(rest));
  delete v.hostKey; delete v.lastTaunt; delete v.used; delete v._now;
  const gm = viewer.role === 'gm';
  v.gm = gm;
  v.gmOnline = extra.gmOnline || 0;
  if (gm) {
    // le maître du jeu voit tout : réponses attendues, réponses des équipes, historique, joueurs
    v.hist = (hist || []).map(h => ({ id: h.id, label: h.label, at: h.at })).reverse();
    v.canRestart = !!(chSnap && s.ch && s.move && chSnap.n === s.move.n);
    v.roster = Object.entries(s.players).map(([pid, p]) => ({ pid, name: p.name, teamId: p.teamId }));
  }
  const me = viewer.pid ? s.players[viewer.pid] : null;
  v.me = me ? { pid: viewer.pid, teamId: me.teamId, name: me.name } : null;
  v.host = !!viewer.host;
  v.players = Object.values(s.players).reduce((acc, p) => { acc[p.teamId] = (acc[p.teamId] || 0) + 1; return acc; }, {});
  // épreuve pas encore lancée : la télé et les joueurs ne voient que le nom de la case et la règle
  if (v.ch && s.phase === 'challenge' && s.ch.held && !gm) {
    const c = v.ch;
    v.ch = { type: c.type, kind: c.kind, label: c.label, group: c.group, rule: c.rule, teamId: c.teamId, cell: c.cell, gains: c.gains || {}, fallback: c.fallback, held: true };
  }
  const ch = v.ch;
  if (ch && s.phase === 'challenge' && !gm && !ch.held) {
    if (ch.q) { delete ch.q.a; delete ch.q.f; delete ch.q.k; delete ch.q.n; if (ch.q.r) ch.q.r = ch.q.r.map(() => null); }
    if (ch.q && s.ch.q && s.ch.q.n !== undefined) ch.q.isNumber = true;
    delete ch.qs; delete ch.ladder;
    if (ch.q && ch.q.clues && viewer.role !== 'tv') delete ch.q.clues;
    // le nom du fichier contient la réponse (« Artiste - Titre.mp3 ») : seuls la télé et le MJ reçoivent l'adresse
    const fileOk = viewer.role === 'tv' || gm;
    if (ch.item) ch.item = { src: fileOk ? ch.item.src : undefined, img: fileOk ? ch.item.img : undefined,
      // question bonus : la chanson est déjà trouvée, on peut montrer son titre et sa pochette (jamais la fiche QCM)
      cover: ch.bonusQcm ? ch.item.cover : undefined, answer: ch.bonusQcm ? ch.item.answer : undefined, start: ch.item.start, stop: ch.item.stop, layers: ch.item.layers, label: ch.item.label,
      // A contrario : la phrase pour tout le monde, les indices seulement pour la télé (elle les affiche à 10 s et 20 s)
      q: ch.item.q, nh: ch.item.hints ? ch.item.hints.length : undefined, hints: viewer.role === 'tv' ? ch.item.hints : undefined };
    if (ch.duo && me) ch.duo = { [me.teamId]: ch.duo[me.teamId] }; else if (ch.duo) ch.duo = {};
    // Emojis : les 4 propositions ne partent que vers le téléphone d'une équipe qui a pris le carré
    if (ch.emo && ch.q && s.phase === 'challenge' && !(me && s.ch.modes[me.teamId] === 'carre')) delete ch.q.o;
    const hideOthers = ch.kind !== 'bac' || ch.stage === 'write';
    if (ch.answers && !(ch.kind === 'open' && ch.stage === 'vote') && hideOthers) {
      for (const id of Object.keys(ch.answers)) if (!me || me.teamId !== id) ch.answers[id] = { hidden: true };
    }
    if (ch.taps) for (const id of Object.keys(ch.taps)) if (!me || me.teamId !== id) ch.taps[id] = ch.taps[id] === -1 ? -1 : 0;
    if (ch.fifty && me) ch.fifty = { [me.teamId]: ch.fifty[me.teamId] }; else if (ch.fifty) ch.fifty = {};
  }
  // Blanc Manger Coco : chacun ne voit que sa main ; les identifiants des joueurs ne sortent jamais ;
  // les cartes jouées restent anonymes jusqu'à la révélation (même pour le maître du jeu, c'est plus juste)
  delete v.bmc;
  const hand = viewer.pid && s.bmc && s.bmc.hands[viewer.pid];
  if (me && hand) v.bmcHand = hand.map(i => ({ i, t: BMC.blanches[i].t, nsfw: !!BMC.blanches[i].nsfw }));
  // Vote par joueur (Double Sens, Titre débile, Blanc Manger Coco) : les identifiants des joueurs ne sortent jamais ;
  // pendant le vote, les propositions sont anonymes, chaque téléphone sait seulement lesquelles sont de son équipe (« own »)
  if (ch && (ch.kind === 'open' || ch.kind === 'bmc')) {
    const sc = s.ch, bmc = sc.kind === 'bmc';
    const live = livePlayers(s, sc), src = (bmc ? sc.picks : sc.texts) || {};
    ch.total = live.length;
    ch.done = live.filter(p => src[p]).length;
    ch.teamDone = {};
    for (const p of live) { const tid = s.players[p].teamId; const r = ch.teamDone[tid] = ch.teamDone[tid] || [0, 0]; r[1]++; if (src[p]) r[0]++; }
    ch.inGame = !!(viewer.pid && live.includes(viewer.pid));
    const mine = viewer.pid && src[viewer.pid];
    ch.mine = mine ? (bmc ? mine.map(i => BMC.blanches[i].t) : mine) : null;
    if (sc.stage === 'vote') {
      const voters = (sc.voters || []).filter(p => s.players[p]);
      ch.nVoters = voters.length; ch.nVoted = voters.filter(p => sc.pv[p] !== undefined).length;
      ch.teamVoted = {};
      for (const p of voters) { const tid = s.players[p].teamId; const r = ch.teamVoted[tid] = ch.teamVoted[tid] || [0, 0]; r[1]++; if (sc.pv[p] !== undefined) r[0]++; }
      ch.canVote = !!(viewer.pid && voters.includes(viewer.pid));
      ch.myVote = viewer.pid && sc.pv[viewer.pid] !== undefined ? sc.pv[viewer.pid] : null;
    }
    const open = s.phase === 'reveal' || sc.stage === 'tie';
    if (sc.entries) ch.entries = sc.entries.map((e, i) => ({
      i, parts: e.parts, v: e.v, ins: e.ins, w: e.w,
      own: !!(me && e.teamId === me.teamId), me: !!viewer.pid && e.pid === viewer.pid,
      ...(open ? { teamId: e.teamId, votes: (sc.ev || [])[i] || 0 } : {}), ...(s.phase === 'reveal' ? { name: e.name } : {})
    }));
    if (!open) delete ch.tally;
    delete ch.players; delete ch.picks; delete ch.texts; delete ch.voters; delete ch.pv; delete ch.ev;
  }
  v.now = s._now || Date.now();
  v.meta = META;
  return v;
}
