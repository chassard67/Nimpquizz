import { $, esc, uid, connect, serverNow, gameNow, dieHTML, toast, fmtSec, LETTERS, OPT_COLORS, audioUnlock, sfx, keepAwake, countdown, bmcSentence } from './common.js';

// ── Salle et clé d'animateur ─────────────────────────────────
const params = new URLSearchParams(location.search);
let room = (params.get('room') || '').toUpperCase();
if (!/^[A-Z]{4}$/.test(room)) {
  const r = await fetch('/api/new').then(r => r.json());
  room = r.code;
  history.replaceState(null, '', `?room=${room}`);
}
const hostKey = localStorage.getItem('nq_host_' + room) || (() => { const k = uid(); localStorage.setItem('nq_host_' + room, k); return k; })();

// ── Mise à l'échelle 1920×1080 ───────────────────────────────
const stage = $('#stage');
function fit() {
  const k = Math.min(innerWidth / 1920, innerHeight / 1080);
  stage.style.transform = `translate(${(innerWidth - 1920 * k) / 2}px, ${(innerHeight - 1080 * k) / 2}px) scale(${k})`;
}
addEventListener('resize', fit); fit();

let S = null;
let lastFeed = -1;
const taunts = [];            // vannes récentes, affichées sur le plateau
const disp = {};          // position affichée de chaque pion
let animating = null;
let lastMoveN = 0, rollAnimUntil = 0;
let lastSec = null;
const audio = new Audio(); audio.preload = 'auto';
let lastOverlayKey = '';

const net = connect(room, () => ({ role: 'tv', hostKey }), {
  onState: st => { const first = !S; S = st; onState(first); },
  onError: txt => toast($('#toasts'), { k: 'curse', text: txt }, 3500),
  onStatus: ok => $('#conn').classList.toggle('hidden', ok)
});
const host = (action, extra = {}) => net.send({ t: 'host', action, ...extra });

const team = id => S.teams.find(t => t.id === id);
const dot = (c, size) => `<span class="dot" style="background:${c}${size ? `;width:${size}px;height:${size}px` : ''}"></span>`;
const activeTeam = () => S.teams[S.turn];

// ── Réception d'un nouvel état ───────────────────────────────
function onState(first) {
  document.body.classList.toggle('host', S.host);
  // un maître du jeu au téléphone : la barre de commandes télé se fait discrète
  document.body.classList.toggle('gmon', S.gmOnline > 0);
  $('#pauseTv').classList.toggle('hidden', !S.paused);
  $('#notHost').classList.toggle('hidden', S.host);
  // fil d'actu → toasts
  if (first) lastFeed = S.feed.length ? S.feed[S.feed.length - 1].id : 0;
  for (const f of S.feed) if (f.id > lastFeed) {
    lastFeed = f.id;
    if (f.k === 'taunt') {
      const from = team(f.from), to = f.to === 'all' ? null : team(f.to);
      taunts.push({ id: f.id, at: Date.now(), color: from ? from.color : '#888', from: from ? from.name : '?', to: to ? to.name : 'tout le monde', text: f.text });
      if (!first) sfx.taunt();
    } else if (f.k === 'joker' || f.k === 'curse') { toast($('#toasts'), { k: f.k, text: f.text }, 6000); if (f.k === 'curse') sfx.curse(); }
  }
  for (const id of ['lobby', 'game', 'end']) $('#' + id).classList.add('hidden');
  if (S.phase === 'lobby') return renderLobby();
  if (S.phase === 'end') return renderEnd();
  $('#game').classList.remove('hidden');
  if (S.move && S.move.n !== lastMoveN) { lastMoveN = S.move.n; if (!first && !S.move.test) { rollAnimUntil = Date.now() + S.meta.timers.roll; sfx.dice(); } }
  syncPawns(first);
  document.body.classList.toggle('testmode', !!(S.host && S.test && S.phase !== 'lobby' && S.phase !== 'end'));
  renderBoard(); renderSide(); renderHostbar(); renderOverlay(true); syncAudio();
}

// ── LOBBY ────────────────────────────────────────────────────
let qrDone = false;
function renderLobby() {
  $('#lobby').classList.remove('hidden');
  const url = `${location.origin}/${room}`;
  if (!qrDone) {
    const qr = qrcode(0, 'M'); qr.addData(url); qr.make();
    $('#qr').innerHTML = qr.createSvgTag({ cellSize: 8, margin: 1, scalable: true });
    $('#joinUrl').textContent = url.replace(/^https?:\/\//, '');
    $('#roomCode').textContent = room;
    $('#gmUrl').textContent = `${location.host}/gm?room=${room}`;
    qrDone = true;
  }
  $('#lobbyTeams').innerHTML = S.teams.length ? S.teams.map(t => `
    <div class="lteam">${dot(t.color)}<span>${esc(t.name)}</span>
      <span class="n">${S.players[t.id] || 0} joueur${(S.players[t.id] || 0) > 1 ? 's' : ''}</span>
      ${S.host ? `<button class="x" data-rm="${t.id}" title="Retirer">✕</button>` : ''}</div>`).join('')
    : `<div class="empty">Personne ? Allez, sortez vos téléphones, bande de mollusques.</div>`;
  $('#duration').value = String(S.durationMin);
  $('#startBtn').disabled = false;
  $('#startBtn').textContent = !S.teams.length ? 'Tester le plateau (sans équipe)' : S.teams.length === 1 ? 'Lancer en mode test (1 équipe)' : 'Lancer la partie';
}
$('#lobbyTeams').addEventListener('click', e => { const b = e.target.closest('[data-rm]'); if (b && confirm('Retirer cette équipe ?')) host('removeTeam', { teamId: b.dataset.rm }); });
$('#duration').addEventListener('change', e => host('setDuration', { min: Number(e.target.value) }));
$('#startBtn').addEventListener('click', () => { audioUnlock(); sfx.win(); host('start'); });
$('#fsBtn').addEventListener('click', () => { audioUnlock(); document.documentElement.requestFullscreen?.(); });
addEventListener('click', audioUnlock, { once: true });
keepAwake(); // la télé non plus ne doit pas se mettre en veille

// ── PLATEAU ──────────────────────────────────────────────────
// Plateau 32 cases sur une grille 10 × 8 : haut (0-9), droite (10-15), bas (16-25), gauche (26-31)
const posToGrid = i => i <= 9 ? [i + 1, 1] : i <= 15 ? [10, i - 8] : i <= 25 ? [26 - i, 8] : [1, 33 - i];
const N = () => S.meta.board.length;
let boardBuilt = false;
function buildBoard() {
  const b = $('#board');
  b.innerHTML = S.meta.board.map((c, i) => {
    const [col, row] = posToGrid(i);
    return `<div class="cell g-${c.group} ${c.type === 'depart' ? 'dep' : ''}" data-i="${i}" style="grid-column:${col};grid-row:${row}">
      <span class="num">${i || ''}</span><span class="lab">${esc(c.label)}</span><div class="pawns"></div></div>`;
  }).join('') + `<div id="center"></div><div id="flyer" class="hidden"><i></i></div>`;
  boardBuilt = true;
}

function syncPawns(first) {
  for (const t of S.teams) {
    if (disp[t.id] === undefined || first) { disp[t.id] = t.pos; continue; }
    if (disp[t.id] === t.pos) continue;
    const fwd = (t.pos - disp[t.id] + N()) % N();
    // pas de sauts pour un pion téléporté (mode test / maître du jeu) : l'épreuve et son décompte démarrent tout de suite
    if (S.move && S.move.done && !S.move.test && S.move.teamId === t.id && fwd > 0 && fwd <= 12) animatePawn(t.id, t.pos);
    else disp[t.id] = t.pos;
  }
}
// Le pion saute de case en case, une fois l'animation du dé terminée
let flying = null;
function cellCenter(i) {
  const c = document.querySelector(`.cell[data-i="${i}"]`);
  return [c.offsetLeft + c.offsetWidth / 2, c.offsetTop + c.offsetHeight / 2];
}
function animatePawn(id, to) {
  clearTimeout(animating);
  const t = team(id), fl = $('#flyer');
  const place = (i, smooth) => { const [x, y] = cellCenter(i); fl.style.transition = smooth ? `left ${S.meta.timers.hop - 60}ms ease-in-out, top ${S.meta.timers.hop - 60}ms ease-in-out` : 'none'; fl.style.left = x + 'px'; fl.style.top = y + 'px'; };
  const start = () => {
    flying = id; renderPawns();
    fl.querySelector('i').style.background = t.color;
    place(disp[id], false); fl.classList.remove('hidden');
    const step = () => {
      if (disp[id] === to) { fl.classList.add('hidden'); flying = null; animating = null; renderPawns(); renderOverlay(true); return; }
      const next = (disp[id] + 1) % N();
      void fl.offsetWidth; place(next, true);
      const i = fl.querySelector('i'); i.classList.remove('jump'); void i.offsetWidth; i.classList.add('jump');
      animating = setTimeout(() => { disp[id] = next; sfx.tick(); renderPawns(); step(); }, S.meta.timers.hop);
    };
    step();
  };
  // on attend la fin de l'animation du dé
  animating = setTimeout(start, Math.max(0, rollAnimUntil - Date.now()) + 200);
}
function renderPawns() {
  document.querySelectorAll('.cell').forEach(c => {
    const i = Number(c.dataset.i);
    const here = S.teams.filter(t => disp[t.id] === i && t.id !== flying);
    c.querySelector('.pawns').innerHTML = here.map(t => `<span class="pawn" style="background:${t.color}" title="${esc(t.name)}"></span>`).join('');
    const act = activeTeam();
    c.classList.toggle('here', !!act && disp[act.id] === i && S.phase === 'roll');
    c.classList.toggle('dest', !!S.move && S.move.to === i && Date.now() > rollAnimUntil && (S.phase === 'rolled' || !!flying));
  });
}

// Le dé tourne pendant ROLL_ANIM_MS en changeant de face, puis se pose
let rollTimer = null;
function scheduleRollFrame() {
  if (rollTimer) return;
  rollTimer = setTimeout(() => {
    rollTimer = null;
    if (!S || S.phase === 'lobby' || S.phase === 'end') return;
    renderBoard();
    if (Date.now() >= rollAnimUntil) sfx.ding(); else sfx.tick();
  }, 140);
}
function renderBoard() {
  if (!boardBuilt) buildBoard();
  renderPawns();
  const t = activeTeam();
  const c = $('#center');
  const legend = `<div class="legend">${[['q', 'Questions'], ['cm', 'Cartes'], ['bt', 'Blind tests'], ['v', 'Visuel'], ['bz', 'Buzzer'], ['s', 'Pièges']].map(([g, l]) => `<span><i class="g-${g}"></i>${l}</span>`).join('')}</div>`;
  let box;
  if (S.phase === 'roll') {
    box = `<div class="turnbox">${dieHTML(0)}<div class="txt"><span class="what">Au tour de</span><span class="who" style="color:${t.color}">${esc(t.name)}</span><span class="what">Lancez le dé sur votre téléphone 📱</span></div></div>`;
  } else if (S.move) {
    const rolling = Date.now() < rollAnimUntil;
    const cell = S.meta.board[S.move.to];
    box = `<div class="turnbox">${dieHTML(rolling ? 1 + Math.floor(Math.random() * 6) : S.move.roll, rolling ? 'rolling' : '')}
      <div class="txt"><span class="what">${esc(team(S.move.teamId).name)} ${S.move.test ? 'est téléportée 🧪' : rolling ? 'lance…' : `fait <b style="color:var(--yellow)">${S.move.roll}</b>${S.move.rerolled ? ' (relancé !)' : ''}`}</span>
      ${rolling ? '' : `<span class="dest-l">→ Case ${S.move.to} · <span class="c-${cell.group}">${esc(cell.label)}</span></span>`}
      ${!rolling && S.phase === 'rolled' ? `<span class="what">On y va ? (ou joker relance…) <b data-dl="${S.deadline}" class="cd"></b></span>` : ''}</div></div>`;
    if (rolling) scheduleRollFrame();
  } else box = '';
  c.innerHTML = `<div class="logo"><span>Le grand</span><b>N'importe Quiz</b></div>${box}${legend}<div class="taunts" id="tauntsBoard"></div>`;
  renderTaunts(true);
}

// ── BARRE LATÉRALE ───────────────────────────────────────────
let prevScores = {};
function renderSide() {
  const ranked = [...S.teams].sort((a, b) => b.score - a.score);
  const ch = S.phase === 'challenge' ? S.ch : null;
  $('#scores').innerHTML = ranked.map((t, i) => {
    const jokers = Object.entries(S.meta.jokers).map(([k, j]) => `<span class="jk ${t.jokers[k] ? '' : 'used'}" title="${esc(j.label)}">${j.icon}</span>`).join('');
    const tags = [
      t.armed.double ? '<span class="tag good">×2 armé</span>' : '',
      t.armed.shield ? '<span class="tag good">🛡️</span>' : '',
      t.armed.halve ? '<span class="tag bad">÷2</span>' : '',
      t.skip ? `<span class="tag bad">⛔ bloquée</span>` : '',
      ...t.curses.map(c => `<span class="tag bad" title="${esc(c.t)}">💀 ${esc(c.t.slice(0, 26))}…</span>`)
    ].join('');
    let status = '';
    if (ch && ch.answers && ch.participants && ch.participants.includes(t.id)) status = ch.answers[t.id] ? '<span class="status" style="color:var(--ok)">✓ répondu</span>' : '<span class="status muted">réfléchit…</span>';
    if (ch && ch.kind === 'open' && ch.stage === 'vote') status = ch.votes[t.id] ? '<span class="status" style="color:var(--ok)">✓ voté</span>' : '<span class="status muted">vote…</span>';
    if (ch && ch.kind === 'bmc' && ch.stage === 'write' && ch.teamDone && ch.teamDone[t.id]) { const [d, n] = ch.teamDone[t.id]; status = `<span class="status" style="color:${d === n ? 'var(--ok)' : 'var(--muted)'}">🃏 ${d}/${n}</span>`; }
    if (ch && ch.taps) status = ch.taps[t.id] === -1 ? '<span class="status" style="color:var(--ko)">faux départ</span>' : ch.taps[t.id] !== undefined ? '<span class="status" style="color:var(--ok)">✓ buzzé</span>' : '';
    const bump = prevScores[t.id] !== undefined && prevScores[t.id] !== t.score;
    return `<div class="score ${S.teams[S.turn] && S.teams[S.turn].id === t.id && S.phase !== 'end' ? 'active' : ''}">
      <div class="row"><span class="rank">${i + 1}</span>${dot(t.color)}<span class="name">${esc(t.name)}</span>
        <span class="adj"><button data-adj="${t.id}" data-d="-1">−1</button><button data-adj="${t.id}" data-d="1">+1</button></span>
        <span class="pts ${bump ? 'bump' : ''}">${t.score}</span></div>
      <div class="sub">${jokers}${tags}${status}</div></div>`;
  }).join('');
  prevScores = Object.fromEntries(S.teams.map(t => [t.id, t.score]));
  const items = S.feed.filter(f => f.k === 'info' || f.k === 'points' || f.k === 'taunt').slice(-7);
  $('#ticker').innerHTML = items.map(f => `<div class="${f.k}">${f.k === 'taunt' ? `${esc(team(f.from)?.name || '?')} 💬 ` : ''}${esc(f.text)}</div>`).join('');
}
$('#scores').addEventListener('click', e => { const b = e.target.closest('[data-adj]'); if (b) host('adjust', { teamId: b.dataset.adj, delta: Number(b.dataset.d) }); });

let lastHostbar = '';
function renderHostbar() {
  if (!S.host) return;
  const ch = S.ch, b = [];
  if (S.phase === 'roll') b.push(`<button class="main" data-h="roll">🎲 Lancer le dé pour ${esc(activeTeam().name)}</button><span class="hint">…ou attendre qu'ils lancent depuis leur téléphone.</span>`);
  if (S.phase === 'rolled') b.push(`<button class="main" data-h="next">Avancer le pion ▶</button>`);
  if (S.phase === 'challenge' && ch.held) b.push(`<button class="main" data-h="launch">▶ Lancer l'épreuve</button><span class="hint">La question et la réponse sont déjà sur le téléphone du maître du jeu.</span>`);
  else if (S.phase === 'challenge' && ch.kind === 'buzz10' && ch.stage === 'ready' && !ch.goAt) b.push(`<button class="main" data-h="go">🔔 Décompte 3, 2, 1… GO</button>`);
  else if (S.phase === 'challenge') {
    if (ch.kind === 'bac' && ch.stage === 'review') b.push(`<button class="main" data-h="bacValidate">Valider les points ✓</button><span class="hint">Cliquez sur un mot pour le valider / refuser.</span>`);
    else if (ch.kind === 'media' && ch.stage === 'answer') b.push(`<button class="ok" data-h="judge" data-ok="1">✓ Bonne réponse</button><button class="ok" data-h="judge" data-ok="1" data-bonus="1">✓ + bonus</button><button class="ko" data-h="judge" data-ok="0">✗ Raté</button><span class="hint">Bonus +1 : l'année ou le réalisateur en plus.</span>`);
    else if (ch.stage === 'video') b.push(`<button class="main" data-h="mediaDone">Questions ! ▶</button>`);
    else if (ch.kind === 'bmc' && ch.stage === 'judge') b.push(`<span class="hint">🃏 Cliquez sur la carte la plus drôle.</span><button data-h="next">Personne ne gagne ⏭</button>`);
    else if (ch.kind === 'bmc') b.push(`<button class="main" data-h="next">Stop, on passe au choix ▶</button>`);
    else b.push(`<button class="main" data-h="next">Stop, on révèle ⏱</button>`);
    b.push(`<button data-h="skip">Passer l'épreuve ⏭</button>`);
  }
  if (S.phase === 'reveal') {
    b.push(`<button class="main" data-h="next">Tour suivant ▶</button>`);
    if (ch && ch.item && ch.item.src) b.push(`<button data-h="outro">${ch.outro ? '⏸ Couper la chanson' : '🎵 La suite de la chanson'}</button>`);
    if (ch && ch.kind === 'dcc' && Object.values(ch.modes || {}).includes('cash')) b.push(`<span class="hint">Cliquez sur une réponse cash pour l'accepter ou la refuser.</span>`);
  }
  if (S.test) b.push(`<select id="gotoSel" title="Mode test : aller directement sur une case"><option value="">🧪 Aller à la case…</option>${S.meta.board.map((c, i) => `<option value="${i}">${i} · ${esc(c.label)}</option>`).join('')}</select>`);
  b.push(`<button data-h="end">Fin de partie 🏁</button>`);
  b.push(`<span class="hint">Espace = action principale · survol d'une équipe = ±1 pt</span>`);
  const html = b.join('');
  if (html !== lastHostbar) { $('#hostbar').innerHTML = html; lastHostbar = html; } // évite de refermer la liste « Aller à la case » à chaque mise à jour
}
$('#hostbar').addEventListener('click', e => {
  const btn = e.target.closest('[data-h]'); if (!btn) return;
  const a = btn.dataset.h;
  if (a === 'end' && !confirm('Terminer la partie maintenant ?')) return;
  host(a, a === 'judge' ? { ok: btn.dataset.ok === '1', bonus: btn.dataset.bonus === '1' } : {});
});
// Mode test : choisir une case dans la liste, ou cliquer une case du plateau
$('#hostbar').addEventListener('change', e => {
  if (e.target.id !== 'gotoSel' || e.target.value === '') return;
  host('goto', { cell: Number(e.target.value) });
  e.target.value = '';
});
$('#board').addEventListener('click', e => {
  if (!S || !S.host || !S.test || S.phase === 'lobby' || S.phase === 'end') return;
  const c = e.target.closest('.cell[data-i]'); if (!c) return;
  host('goto', { cell: Number(c.dataset.i) });
});
addEventListener('keydown', e => {
  if (!S || !S.host || e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
  if (e.code === 'Space' || e.code === 'Enter') {
    e.preventDefault();
    const main = $('#hostbar .main'); if (main) main.click();
  }
});

// ── ÉPREUVES ─────────────────────────────────────────────────
const gainsHTML = ch => {
  const g = S.teams.map(t => [t, ch.gains[t.id] || 0]).filter(([, v]) => v !== 0);
  if (!g.length) return '';
  return `<div class="gains">${g.map(([t, v]) => `<div class="gain">${dot(t.color)}${esc(t.name)} <span class="p ${v > 0 ? 'pos' : 'neg'}">${v > 0 ? '+' : ''}${v}</span></div>`).join('')}</div>`;
};
const ring = (deadline, total) => `<div class="ring" data-ring="${deadline}" data-total="${total}"><div><b></b><span>secondes</span></div></div>`;
const statusList = (ids, isDone, title = 'Sur les téléphones') => `<div class="status-list"><span class="h">${title}</span>${ids.map(id => { const t = team(id); return `<div class="r">${dot(t.color)}<span>${esc(t.name)}</span><span class="s ${isDone(id) ? 'ok' : 'muted'}">${isDone(id) ? '✓' : '…'}</span></div>`; }).join('')}</div>`;

function renderOverlay(stateChanged) {
  const ov = $('#overlay');
  const ch = S.ch;
  const show = ch && (S.phase === 'challenge' || S.phase === 'reveal') && ch.kind && (lastOverlayKey !== '' || gameNow(S) >= (ch.startsAt || 0) - 300) && !animating;
  if (!show) { ov.classList.add('hidden'); lastOverlayKey = ''; return; }
  const key = JSON.stringify([S.phase, ch.type, ch.stage, ch.cell, S.move && S.move.n, ch.i, ch.level, ch.buzzer, (ch.excluded || []).length, JSON.stringify(ch.ok || null), !!ch.held, ch.goAt || 0, !!ch.outro, ch.done || 0]);
  if (!stateChanged && key === lastOverlayKey) return;
  const appearing = lastOverlayKey === '' || key.split(',')[0] !== lastOverlayKey.split(',')[0];
  if (lastOverlayKey !== key && S.phase === 'reveal') { const gain = Object.values(ch.gains || {}).some(v => v > 0); (gain ? sfx.win : sfx.fail)(); }
  lastOverlayKey = key;
  ov.classList.remove('hidden');
  if (appearing) { ov.style.animation = 'none'; void ov.offsetWidth; ov.style.animation = ''; }
  const rev = S.phase === 'reveal';
  const t = team(ch.teamId);
  const themeLbl = ch.q && ch.q.theme && ch.q.theme !== 'gen' ? ` · ${S.meta.cultureThemes[ch.q.theme]}` : '';
  const pill = ch.fallback ? `Contenu pas encore chargé · question de consolation${themeLbl}` : `Case ${ch.cell}${themeLbl}`;
  const banner = `<div class="banner g-${ch.group}"><span class="t">${esc(ch.fallback ? 'Culture G' : ch.label)}</span><span class="pill c-${ch.group}">${esc(pill)}</span><span class="who">${dot(t.color)}${esc(t.name)} joue</span></div>`;
  let main = '', side = '';
  const R = ch.held ? RENDER.held : (RENDER[ch.kind] || RENDER.info);
  [main, side] = R(ch, rev);
  // à la révélation d'un blind test : bouton « la suite de la chanson », cliquable sur la télé
  if (rev && ch.item && ch.item.src && S.host) main += `<button class="outro-btn" data-h="outro">${ch.outro ? '⏸ Couper la chanson' : '🎵 La suite de la chanson'}</button>`;
  main += `<div class="taunts strip" id="tauntsOv"></div>`;
  ov.innerHTML = banner + `<div class="ov-body"><div class="ov-main">${main}</div>${side ? `<div class="ov-side">${side}</div>` : ''}</div>`;
  tickTimers();
  renderTaunts(true);
}

// Vannes des équipes : au centre du plateau, sous la légende (ou en bas de l'épreuve en cours)
let tauntsShown = '';
function renderTaunts(force) {
  const now = Date.now();
  while (taunts.length && (taunts.length > 4 || now - taunts[0].at > 25000)) taunts.shift();
  const html = taunts.map(t => `<div class="taunt"><span class="from" style="color:${t.color}">${esc(t.from)} → ${esc(t.to)}</span>${esc(t.text)}</div>`).join('');
  if (!force && html === tauntsShown) return;
  tauntsShown = html;
  for (const id of ['tauntsBoard', 'tauntsOv']) { const el = document.getElementById(id); if (el) el.innerHTML = id === 'tauntsOv' ? taunts.slice(-2).map(t => `<div class="taunt"><span class="from" style="color:${t.color}">${esc(t.from)} → ${esc(t.to)}</span>${esc(t.text)}</div>`).join('') : html; }
}

function qcmBlock(ch, rev) {
  const q = ch.q;
  const qtext = ch.type === 'mensonge' || (!q.q && q.o.length === 3) ? 'Deux sont vraies. Laquelle est un gros mensonge ?' : ch.type === 'contrario' ? `« ${q.q} »` : q.q;
  const isEmoji = ch.type === 'emojis';
  const opts = q.o.map((o, i) => {
    const who = rev ? S.teams.filter(t => ch.answers[t.id] && ch.answers[t.id].v === i).map(t => dot(t.color)).join('') : '';
    const cls = rev ? (i === q.a ? 'good' : 'bad') : '';
    return `<div class="opt ${cls}"><span class="L" style="background:${OPT_COLORS[i]}">${LETTERS[i]}</span><span>${esc(o)}</span><span class="who">${who}</span></div>`;
  }).join('');
  return `${rev ? '' : `<div class="rule">${esc(ch.rule)}</div>`}
    <div class="question ${isEmoji ? 'emoji' : ''}">${esc(isEmoji ? q.q : qtext)}</div>
    ${isEmoji ? `<div class="rule" style="text-align:center">C'est quel film / quelle expression ?</div>` : ''}
    ${ch.type === 'contrario' ? `<div class="rule">Remettez-le à l'endroit : c'est quoi, l'original ?</div>` : ''}
    <div class="opts ${q.o.length === 3 ? 'three' : ''}">${opts}</div>
    ${rev && q.f ? `<div class="fun"><b>Le saviez-vous ?</b>${esc(q.f)}</div>` : ''}`;
}
const revFooter = ch => `<div class="summary">${esc(ch.summary || '')}</div>${gainsHTML(ch)}`;
const answeredSide = ch => [ring(ch.deadline, ch.deadline - ch.startsAt), statusList(ch.participants, id => !!ch.answers[id])];

const RENDER = {
  held(ch) {
    return [`<div class="big-center"><div class="huge">${{ q: '❓', bt: '🎵', v: '🖼️', bz: '🔔', s: '😈', cm: '🃏' }[ch.group] || '🎲'}</div>
      <div class="mid" style="max-width:1100px">${esc(ch.rule || '')}</div>
      <div class="rule">⏳ Le maître du jeu va lancer l'épreuve…</div></div>`, ''];
  },
  qcm(ch, rev) {
    return [qcmBlock(ch, rev) + (rev ? revFooter(ch) : ''), rev ? '' : answeredSide(ch).join('')];
  },
  duel(ch, rev) {
    const a = team(ch.teamId), b = ch.target ? team(ch.target) : null;
    if (ch.stage === 'pick' && !rev) return [`<div class="big-center"><div class="mid">${dot(a.color, 50)} ${esc(a.name)}</div><div class="huge">⚔️</div><div class="mid">choisit son adversaire…</div><div class="rule">${esc(ch.rule)}</div></div>`, ring(ch.deadline, ch.deadline - ch.startsAt)];
    const vs = b ? `<div class="vs"><span style="color:${a.color}">${esc(a.name)}</span><em>VS</em><span style="color:${b.color}">${esc(b.name)}</span></div>` : '';
    if (!ch.q) return [vs + revFooter(ch), ''];
    return [vs + qcmBlock(ch, rev) + (rev ? revFooter(ch) : ''), rev ? '' : answeredSide(ch).join('')];
  },
  number(ch, rev) {
    const q = ch.q;
    if (!rev) return [`<div class="rule">${esc(ch.rule)}</div><div class="question">${esc(q.q)}</div><div class="rule">Réponse en ${esc(q.u || 'nombre')} sur vos téléphones.</div>`, answeredSide(ch).join('')];
    const rows = Object.entries(ch.answers).map(([id, a]) => [team(id), a.v, Math.abs(a.v - q.a)]).sort((x, y) => x[2] - y[2]);
    return [`<div class="question" style="font-size:36px">${esc(q.q)}</div>
      <div style="display:flex;align-items:baseline;gap:20px"><span class="huge">${q.a.toLocaleString('fr-FR')}</span><span class="mid">${esc(q.u)}</span></div>
      <div class="numrows">${rows.map(([t, v, d]) => `<div class="numrow ${(ch.closest || []).includes(t.id) ? 'best' : ''}">${dot(t.color)}${esc(t.name)}<span class="v">${v.toLocaleString('fr-FR')}</span><span class="d">${d === 0 ? 'PILE !' : 'écart ' + d.toLocaleString('fr-FR')}</span></div>`).join('')}</div>
      ${q.f ? `<div class="fun"><b>Le saviez-vous ?</b>${esc(q.f)}</div>` : ''}${revFooter(ch)}`, ''];
  },
  open(ch, rev) {
    const words = ch.q.words;
    // Titre débile : le titre mot par mot, avec un trou entre chaque mot
    const titleHTML = words ? `<div class="title-slots">${words.map(w => `<i></i><span>${esc(w)}</span>`).join('')}<i></i></div>` : '';
    const q = words && !rev && ch.stage === 'write' ? titleHTML : `<div class="question" style="font-size:${words ? 64 : 42}px">${esc(ch.q.q)}</div>`;
    const sub = ch.q.sub && !rev ? `<div class="rule" style="font-size:26px">${esc(ch.q.sub)}</div>` : '';
    if (!rev && ch.stage === 'write') return [`<div class="rule">${esc(ch.rule)}</div>${q}${sub}<div class="big-center"><div class="mid">✍️ ${words ? 'Glissez votre mot dans un des trous, sur les téléphones' : 'Écrivez votre meilleure connerie sur les téléphones'}</div></div>`, answeredSide(ch).join('')];
    const ids = Object.keys(ch.answers);
    const order = [...ids].sort((a, b) => (ch.answers[a].v || '').length - (ch.answers[b].v || '').length);
    const cards = order.map((id, i) => {
      const t = team(id), votes = rev && ch.tally ? ch.tally[id] || 0 : null;
      const a = ch.answers[id];
      const txt = words && a.w !== undefined ? [...words.slice(0, a.ins).map(esc), `<mark>${esc(a.w)}</mark>`, ...words.slice(a.ins).map(esc)].join(' ') : esc(a.v);
      return `<div class="card ${rev && (ch.winners || []).includes(id) ? 'win' : ''}" style="--r:${(i % 2 ? 1 : -1) * (1 + i % 3)}deg">${txt}
        ${rev ? `<div class="by">${dot(t.color)}${esc(t.name)}</div>` : ''}${votes !== null ? `<span class="votes">${votes} vote${votes > 1 ? 's' : ''}</span>` : ''}</div>`;
    }).join('');
    if (!rev) return [`${q}${sub}<div class="rule">Votez pour la meilleure sur votre téléphone. Pas pour vous-mêmes, tricheurs.</div><div class="cards">${cards}</div>`,
      [ring(ch.deadline, 30000), statusList(S.teams.map(t => t.id), id => !!ch.votes[id], 'Votes')].join('')];
    return [`${q}<div class="cards">${cards}</div>${revFooter(ch)}`, ''];
  },
  bac(ch, rev) {
    if (!rev && ch.stage === 'write') return [`<div class="rule">${esc(ch.rule)}</div><div class="big-center"><div class="mid">Lettre</div><div class="bac-letter">${esc(ch.letter)}</div><div class="bac-cats">${ch.cats.map(c => `<span>${esc(c)}</span>`).join('')}</div></div>`, answeredSide(ch).join('')];
    const head = `<tr><th></th>${ch.cats.map(c => `<th>${esc(c)}</th>`).join('')}${rev ? '<th>Pts</th>' : ''}</tr>`;
    const rows = ch.participants.map(id => {
      const t = team(id), a = ch.answers[id] ? ch.answers[id].v : [];
      return `<tr><td class="tn">${dot(t.color)} ${esc(t.name)}</td>${ch.cats.map((_, i) => {
        const ok = ch.valid[id] && ch.valid[id][i] && a[i];
        const u = rev && ch.unique && ch.unique[id][i];
        return `<td class="${ok ? 'v' : 'x'} ${u ? 'u' : ''} ${!rev && S.host ? 'toggle' : ''}" data-bt="${id}" data-bi="${i}">${esc(a[i] || '—')}</td>`;
      }).join('')}${rev ? `<td class="display" style="color:var(--yellow)">+${ch.gains[id] || 0}</td>` : ''}</tr>`;
    }).join('');
    return [`<div style="display:flex;align-items:center;gap:30px"><span class="bac-letter" style="font-size:120px">${esc(ch.letter)}</span><span class="rule">${rev ? 'Vert = validé · ★ = mot unique (2 pts)' : "L'animateur corrige. Contestations acceptées, mais ignorées."}</span></div>
      <table class="bac">${head}${rows}</table>${rev ? revFooter(ch) : ''}`, ''];
  },
  buzz10(ch, rev) {
    if (!rev) {
      const now = gameNow(S);
      if (!ch.goAt) return [`<div class="rule">${esc(ch.rule)}</div><div class="big-center"><div class="huge">⏱️</div><div class="mid">Le maître du jeu va lancer le décompte… Doigts prêts !</div></div>`,
        statusList(ch.participants, id => ch.taps[id] !== undefined, 'Buzzers')];
      const before = now < ch.goAt;
      return [`<div class="rule">${esc(ch.rule)}</div><div class="big-center" id="b10">
        <div class="huge" data-go="${ch.goAt}">${before ? fmtSec(ch.goAt - now) : 'GO !'}</div>
        <div class="mid" id="b10t">${before ? 'Préparez-vous…' : 'Comptez dans votre tête… pas à voix haute, bande de tricheurs 🤫'}</div></div>`,
        statusList(ch.participants, id => ch.taps[id] !== undefined, 'Buzzers')];
    }
    const rows = ch.participants.map(id => [team(id), ch.taps[id]]).sort((a, b) => (a[1] >= 0 ? Math.abs(a[1] - 10000) : 1e9) - (b[1] >= 0 ? Math.abs(b[1] - 10000) : 1e9));
    return [`<div class="mid">Objectif : 10,00 secondes</div><div class="numrows">${rows.map(([t, ms]) => `<div class="numrow ${(ch.winners || []).includes(t.id) ? 'best' : ''}">${dot(t.color)}${esc(t.name)}
      <span class="v">${ms === undefined ? 'N\'a pas buzzé 😴' : ms < 0 ? 'Faux départ 🤦' : (ms / 1000).toFixed(2).replace('.', ',') + ' s'}</span>
      <span class="d">${ms >= 0 ? (ms > 10000 ? '+' : '−') + (Math.abs(ms - 10000) / 1000).toFixed(2).replace('.', ',') : ''}</span></div>`).join('')}</div>${revFooter(ch)}`, ''];
  },
  target(ch, rev) {
    const a = team(ch.teamId);
    if (!rev) return [`<div class="big-center"><div class="mid">${dot(a.color, 50)} ${esc(a.name)}</div><div class="huge">${ch.type === 'vol' ? '🦹' : '🔄'}</div><div class="mid">choisit sa victime…</div><div class="rule">${esc(ch.rule)}</div></div>`, ring(ch.deadline, ch.deadline - ch.startsAt)];
    return [`<div class="big-center"><div class="huge">${ch.type === 'vol' ? '🦹' : '🔄'}</div><div class="mid" style="max-width:1100px">${esc(ch.summary)}</div>${gainsHTML(ch)}</div>`, ''];
  },
  info(ch) {
    return [`<div class="big-center"><div class="huge">🚽</div><div class="mid" style="max-width:1100px">${esc(ch.summary || ch.text || '')}</div>${gainsHTML(ch)}</div>`, ''];
  },
  media(ch, rev) {
    const bars = Array.from({ length: 30 }, (_, i) => `<i style="background:${OPT_COLORS[i % 4]};animation-delay:${-(i * 137 % 900)}ms"></i>`).join('');
    const layerNames = ['🥁 Batterie', '🎸 Basse', '🎹 Le reste', '🎤 Voix', '➕', '➕'];
    const layers = ch.media === 'layers' ? `<div class="layers">${(ch.item.layers || []).map((_, i) => `<span data-layer="${i}" class="${rev ? 'on' : ''}">${layerNames[i] || '➕'}</span>`).join('')}</div>` : '';
    // A contrario : la phrase à l'envers, puis 2 indices qui tombent à 10 s et 20 s
    const hints = ch.media === 'text' ? `<div class="ctr-hints">${(ch.item.hints || Array(ch.item.nh || 0).fill('')).map((h, i) => `<div class="ctr-hint ${rev ? 'on' : ''}" data-hint="${i}"><span>Indice ${i + 1}</span><b>${rev ? esc(h) : ''}</b></div>`).join('')}</div>` : '';
    const visual = ch.media === 'image'
      ? `<img class="pochette" id="poch" src="${esc(ch.item.img)}" alt="" style="filter:blur(${rev ? 0 : 40}px)">`
      : ch.media === 'text'
      ? `<div class="ctr-q">« ${esc(ch.item.q || '')} »</div>${hints}`
      : `<div class="media-vis ${ch.stage === 'answer' ? 'paused' : ''}">${bars}</div>${layers}`;
    // à la réponse : l'image du dossier (pochette, affiche…) à la place des barres de son, et l'anecdote
    const revVisual = ch.media === 'audio' && ch.item.cover ? `<img class="pochette" src="${esc(ch.item.cover)}" alt="">` : visual;
    if (rev) return [`<div class="big-center">${revVisual}<div class="mid" style="color:var(--yellow)">${esc(ch.item.answer || '')}</div>${ch.item.bonus ? `<div class="rule">${esc(ch.item.bonus)}</div>` : ''}${ch.item.info ? `<div class="fun"><b>Le saviez-vous ?</b>${esc(ch.item.info)}</div>` : ''}${ch.item.joke ? `<div class="joke">😜 ${esc(ch.item.joke)}</div>` : ''}${revFooter(ch)}</div>`, ''];
    const buzzer = ch.stage === 'answer' ? team(ch.buzzer) : null;
    const excl = ch.excluded.length ? `<div class="rule">Grillés : ${ch.excluded.map(id => esc(team(id).name)).join(', ')}</div>` : '';
    return [`<div class="rule">${esc(ch.rule)}</div><div class="big-center">${visual}${excl}</div>
      ${buzzer ? `<div class="buzzed"><div class="b" style="background:${buzzer.color}"><div class="x">BUZZ !</div><div class="n">${esc(buzzer.name)}</div><div class="s">On vous écoute… 15 secondes</div></div></div>` : ''}`,
      ring(ch.deadline, ch.stage === 'answer' ? 15000 : Math.max(ch.playMs || S.meta.timers.media, ch.deadline - ch.startsAt))];
  }
};

// ── Blanc Manger Coco
RENDER.bmc = (ch, rev) => {
  const black = ch.black ? ch.black.t : '';
  if (!rev && ch.stage === 'write') {
    const teams = Object.keys(ch.teamDone || {}).map(id => { const t = team(id), [d, n] = ch.teamDone[id]; return t ? `<div class="r">${dot(t.color)}<span>${esc(t.name)}</span><span class="s ${d === n ? 'ok' : 'muted'}">${d}/${n}</span></div>` : ''; }).join('');
    return [`<div class="rule">${esc(ch.rule)}</div><div class="bmc-black bmc-big">${bmcSentence(black, [])}</div>
      <div class="big-center"><div class="mid">🃏 Choisissez ${ch.black && ch.black.n > 1 ? `${ch.black.n} cartes (dans l'ordre)` : 'votre carte'} sur votre téléphone</div><div class="rule">${ch.done} / ${ch.total} joueur${ch.total > 1 ? 's ont' : ' a'} joué</div></div>`,
      `<div class="status-list"><span class="h">Cartes jouées</span>${teams}</div>`];
  }
  const entries = ch.entries || [];
  const cards = entries.map((e, i) => {
    const t = rev && e.teamId ? team(e.teamId) : null;
    const win = rev && ch.winner === i;
    return `<div class="bmc-black bmc-entry ${win ? 'win' : ''} ${!rev && S.host ? 'toggle' : ''}" data-bmc="${i}" style="--r:${(i % 2 ? 1 : -1) * (0.5 + i % 3 * .6)}deg">
      ${rev ? '' : `<span class="no">${i + 1}</span>`}${bmcSentence(black, e.parts)}
      ${t ? `<div class="by">${dot(t.color)}${esc(e.name ? e.name + ' · ' : '')}${esc(t.name)}${win ? ' 🏆' : ''}</div>` : ''}</div>`;
  }).join('');
  const grid = `<div class="bmc-grid ${entries.length > 6 ? 'many' : ''}">${cards}</div>`;
  if (!rev) return [`<div class="rule">Le maître du jeu choisit la plus drôle… (c'est anonyme, pas de favoritisme. En théorie.)</div>${grid}`, ''];
  return [`${grid}${revFooter(ch)}`, ''];
};

// ── Duo, carré ou cash
// Son ou image d'une fiche QCM (dossiers public/media)
function dccMedia(ch, rev) {
  if (!ch.item || !ch.media) return '';
  if (ch.media === 'image') return `<img class="pochette mini" id="poch" src="${esc(ch.item.img)}" alt="" style="filter:blur(${rev ? 0 : 40}px)">`;
  if (rev && ch.item.cover) return `<img class="pochette mini" src="${esc(ch.item.cover)}" alt="">`;
  return `<div class="media-vis mini">${Array.from({ length: 24 }, (_, i) => `<i style="background:${OPT_COLORS[i % 4]};animation-delay:${-(i * 137 % 900)}ms"></i>`).join('')}</div>`;
}
RENDER.dcc = (ch, rev) => {
  const q = ch.q;
  // question bonus d'un blind test : la chanson est trouvée, on l'affiche avec sa pochette
  const med = ch.bonusQcm && !rev ? `${ch.item.cover ? `<img class="pochette mini" src="${esc(ch.item.cover)}" alt="">` : ''}<div class="mid" style="color:var(--yellow);text-align:center">🎵 ${esc(ch.item.answer)} · 🎁 Question bonus pour ${esc(team(ch.participants[0]).name)}</div>` : dccMedia(ch, rev);
  const MODE = { duo: 'Duo', carre: 'Carré', cash: 'Cash' };
  if (!rev && ch.stage === 'mode') {
    return [`<div class="rule">${esc(ch.rule)}</div>${med}<div class="question">${esc(q.q)}</div>
      <div class="dcc-modes"><div><b>Duo</b><span>2 propositions</span><em>1 pt</em></div><div><b>Carré</b><span>4 propositions</span><em>2 pts</em></div><div class="cash"><b>Cash</b><span>sans propositions</span><em>4 pts</em></div></div>`,
      [ring(ch.deadline, ch.deadline - ch.startsAt), statusList(ch.participants, id => !!ch.modes[id], 'Choix des équipes')].join('')];
  }
  const modes = `<div class="dcc-who">${ch.participants.map(id => { const t = team(id), m = ch.modes[id]; const a = ch.answers[id];
    const ans = rev && a ? (a.cash ? `« ${esc(a.v)} »` : esc(q.o[a.v])) : '';
    const ok = rev && ch.ok ? (ch.ok[id] ? 'ok' : 'ko') : '';
    return `<div class="dw ${ok} ${rev && m === 'cash' && S.host ? 'toggle' : ''}" data-cash="${rev && m === 'cash' ? id : ''}">${dot(t.color)}<span>${esc(t.name)}</span><b class="m-${m}">${MODE[m] || '…'}</b>${ans ? `<i>${ans}</i>` : ''}</div>`; }).join('')}</div>`;
  if (!rev && ch.emo) return [`${ch.type === 'replique' ? '<div class="rule" style="text-align:center">🎬 De quel film vient cette réplique ?</div>' : ''}<div class="question ${ch.type === 'replique' ? 'quote' : 'emoji'}">${esc(q.q)}</div>${modes}<div class="rule">Tapez le titre en <b>cash (4 pts)</b>, ou prenez le <b>carré (2 pts)</b> pour voir 4 propositions. +1 pour l'équipe qui joue.</div>`, answeredSide(ch).join('')];
  if (!rev) return [`${med}<div class="question">${esc(q.q)}</div>${modes}<div class="rule">Les propositions sont sur vos téléphones (sauf pour les fous du cash).</div>`, answeredSide(ch).join('')];
  // fiche d'un dossier média : le titre de la chanson et la blague éventuelle
  const song = ch.item && ch.item.answer ? `<div class="mid" style="color:var(--yellow);text-align:center">🎵 ${esc(ch.item.answer)}</div>` : '';
  const joke = ch.item && ch.item.joke ? `<div class="joke">😜 ${esc(ch.item.joke)}</div>` : '';
  return [med + song + qcmBlock(ch, true) + joke + modes + revFooter(ch), ''];
};

// ── Burger Quiz / vidéo culte : questions en série
RENDER.series = (ch, rev) => {
  if (!rev && ch.stage === 'theme') {
    return [`<div class="rule">${esc(ch.rule)}</div><div class="mid">${esc(team(ch.teamId).name)} choisit son menu…</div>
      <div class="menus">${ch.themes.map((th, i) => `<div class="menu ${th.taré ? 'tare' : ''}"><span>Menu ${['Ketchup', 'Mayo', 'Sel ou poivre'][i]}</span><b>${esc(th.name)}</b></div>`).join('')}</div>`,
      ring(ch.deadline, ch.deadline - ch.startsAt)];
  }
  if (!rev && ch.stage === 'video') {
    return [`<div class="video-wrap"><video id="vid" playsinline src="${esc(ch.item.src)}"></video></div>`, ''];
  }
  const head = ch.theme ? `<div class="burger-theme ${ch.themeTare ? 'tare' : ''}">🍔 ${esc(ch.theme)}</div>` : '';
  if (!rev) {
    const total = (ch.res || []).length + 1;
    const n = ch.type === 'video' ? `${ch.i ? 'Question bonus' : 'Question'}` : `Question ${ch.i + 1} / 3`;
    if (ch.q.isNumber) return [`${head}<div class="rule">${n}</div><div class="question">${esc(ch.q.q)}</div><div class="rule">Réponse en ${esc(ch.q.u || 'nombre')} sur vos téléphones.</div>`, answeredSide(ch).join('')];
    return [`${head}<div class="rule">${n}${ch.type === 'video' && ch.i ? ' · 1 pt pour tout le monde' : ''}</div>${qcmBlock({ ...ch, rule: '' }, false).replace('<div class="rule"></div>', '')}`, answeredSide(ch).join('')];
  }
  const rows = (ch.res || []).map((r, k) => {
    const good = r.q.n !== undefined ? r.q.n.toLocaleString('fr-FR') + ' ' + (r.q.u || '') : r.q.o[r.q.a];
    return `<div class="sres"><div class="sq"><span>${k + 1}</span>${esc(r.q.q)}</div><div class="sa">✓ ${esc(good)}</div>
      <div class="sw">${r.ok.length ? r.ok.map(id => `${dot(team(id).color)}${esc(team(id).name)}`).join(' ') : '<span class="muted">personne</span>'}</div>${r.q.f ? `<div class="sf">${esc(r.q.f)}</div>` : ''}</div>`;
  }).join('');
  const vid = ch.type === 'video' && ch.item && ch.item.src ? `<div class="video-wrap small"><video id="vid" data-resume="1" playsinline src="${esc(ch.item.src)}"></video></div>` : '';
  return [`${head}${vid}<div class="sresults">${rows}</div>${revFooter(ch)}`, ''];
};

// ── Qui veut gagner des millions
RENDER.millions = (ch, rev) => {
  const ladder = `<div class="ladder">${S.meta.ladder.map((v, i) => `<div class="${i < ch.level ? 'done' : ''} ${i === ch.level && !rev ? 'cur' : ''} ${i === 1 ? 'safe' : ''}"><span>${i + 1}</span><b>${v} pt${v > 1 ? 's' : ''}</b></div>`).reverse().join('')}</div>`;
  if (rev) {
    const last = ch.hist[ch.hist.length - 1];
    return [`${last ? qcmBlock({ ...ch, q: last.q, answers: { [ch.teamId]: { v: last.v } } }, true) : ''}${revFooter(ch)}`, ladder];
  }
  if (ch.stage === 'decide') {
    return [`<div class="big-center"><div class="huge">💰 ${ch.bank}</div><div class="mid">Bonne réponse ! ${esc(team(ch.teamId).name)}, on continue ?</div>
      <div class="rule">Prochaine marche : ${S.meta.ladder[ch.level]} pts · en cas d'erreur : ${ch.level > 1 ? S.meta.ladder[1] + ' pts (palier)' : 'zéro'}</div></div>`, ladder + ring(ch.deadline, ch.deadline - ch.startsAt)];
  }
  return [`<div class="rule">Question ${ch.level + 1} pour ${S.meta.ladder[ch.level]} pt${S.meta.ladder[ch.level] > 1 ? 's' : ''} · seule ${esc(team(ch.teamId).name)} répond… C'est votre dernier mot ?</div>${qcmBlock({ ...ch, rule: '' }, false).replace('<div class="rule"></div>', '')}`,
    ladder + ring(ch.deadline, ch.deadline - ch.startsAt)];
};

// ── Affiche mystère : les indices tombent avec le temps
RENDER.affiche = (ch, rev) => {
  const clues = (ch.q.clues || []).map((c, i) => `<div class="clue" data-clue="${i}" ${rev ? '' : 'style="visibility:hidden"'}><span>${i + 1}</span>${esc(c)}</div>`).join('');
  const pts = `<div class="rule" id="affPts"></div>`;
  return [`${rev ? '' : `<div class="rule">${esc(ch.rule)}</div>`}<div class="clues">${clues}</div>${rev ? '' : pts}
    <div class="opts">${ch.q.o.map((o, i) => { const who = rev ? S.teams.filter(t => ch.answers[t.id] && ch.answers[t.id].v === i).map(t => `${dot(t.color)}<small>${ch.seen && ch.seen[t.id] ? ch.seen[t.id] + ' ind.' : ''}</small>`).join('') : '';
      return `<div class="opt ${rev ? (i === ch.q.a ? 'good' : 'bad') : ''}"><span class="L" style="background:${OPT_COLORS[i]}">${LETTERS[i]}</span><span>${esc(o)}</span><span class="who">${who}</span></div>`; }).join('')}</div>${rev ? revFooter(ch) : ''}`,
    rev ? '' : answeredSide(ch).join('')];
};


// clic animateur sur une case du Bac
$('#overlay').addEventListener('click', e => {
  const oh = e.target.closest('[data-h]');
  if (oh && S.host) { audioUnlock(); return host(oh.dataset.h); }
  const bm = e.target.closest('[data-bmc]');
  if (bm && S.host && S.phase === 'challenge' && S.ch && S.ch.stage === 'judge') return host('bmcPick', { i: Number(bm.dataset.bmc) });
  const c = e.target.closest('[data-cash]');
  if (c && c.dataset.cash && S.host) return host('cashToggle', { teamId: c.dataset.cash });
  const td = e.target.closest('td.toggle'); if (!td || !S.host) return;
  host('bacToggle', { teamId: td.dataset.bt, i: Number(td.dataset.bi) });
});

// ── son des blind tests ──────────────────────────────────────
const layerAudio = [];
let layerKey = '';
function syncLayers(ch) {
  const key = ch ? JSON.stringify(ch.item.layers) + ch.cell : '';
  if (key !== layerKey) {
    layerAudio.splice(0).forEach(a => a.pause());
    layerKey = key;
    if (ch) for (const src of ch.item.layers) { const a = new Audio(new URL(src, location.href).href); a.preload = 'auto'; a.volume = 0; layerAudio.push(a); }
  }
  if (!ch) return;
  const playing = (S.phase === 'challenge' && ch.stage === 'play' && gameNow(S) >= ch.startsAt) || S.phase === 'reveal';
  const n = S.phase === 'reveal' ? layerAudio.length : Math.min(layerAudio.length, 1 + Math.floor((gameNow(S) - ch.startsAt) / S.meta.timers.layer));
  layerAudio.forEach((a, i) => {
    a.volume = i < n ? 1 : 0;
    if (playing && a.paused) { a.currentTime = layerAudio[0].currentTime || 0; a.play().catch(soundBlocked); }
    if (!playing && !a.paused) a.pause();
  });
  document.querySelectorAll('[data-layer]').forEach(el => el.classList.toggle('on', Number(el.dataset.layer) < n));
}
let vidHandled = '';
function syncVideo(ch) {
  const v = $('#vid'); if (!v || !ch || !ch.item) return;
  const tag = ch.cell + S.phase + (v.dataset.resume || '') + '|' + (ch.replay || 0);
  if (vidHandled === tag) return;
  vidHandled = tag;
  const start = ch.item.start || 0, stop = ch.item.stop;
  if (v.dataset.resume) { v.currentTime = stop != null ? stop : start; v.play().catch(soundBlocked); return; }
  v.currentTime = start; v.play().catch(soundBlocked);
  v.ontimeupdate = () => { if (stop != null && v.currentTime >= stop) { v.pause(); v.ontimeupdate = null; if (S.host) host('mediaDone'); } };
  v.onended = () => { if (S.host) host('mediaDone'); };
}
let lastReplayKey = '';
function syncAudio() {
  const ch = S.ch;
  // pause du maître du jeu : tout se tait
  const vid = $('#vid');
  if (S.paused) {
    if (!audio.paused) audio.pause();
    layerAudio.forEach(a => a.pause());
    if (vid && !vid.paused) { vid.pause(); vid.dataset.gmPaused = '1'; }
    return;
  }
  if (vid && vid.dataset.gmPaused) { delete vid.dataset.gmPaused; vid.play().catch(() => {}); }
  // « relancer l'extrait » demandé par le maître du jeu
  const rk = ch ? `${ch.cell}|${S.move && S.move.n}|${ch.replay || 0}` : '';
  if (ch && ch.replay && rk !== lastReplayKey && lastReplayKey !== '') {
    try { audio.currentTime = (ch.item && ch.item.start) || 0; } catch {}
    layerAudio.forEach(a => { try { a.currentTime = 0; } catch {} });
    vidHandled = '';
  }
  lastReplayKey = rk;
  syncLayers(ch && ch.kind === 'media' && ch.media === 'layers' && ch.item && ch.item.layers ? ch : null);
  if (ch && ch.type === 'video') syncVideo(ch);
  // extrait audio : buzzer (media) ou QCM duo/carré/cash avec le son qui tourne (dcc)
  if (!ch || (ch.kind !== 'media' && ch.kind !== 'dcc') || ch.media !== 'audio' || !ch.item || !ch.item.src) { if (!audio.paused) audio.pause(); return; }
  const src = new URL(ch.item.src, location.href).href;
  if (audio.src !== src) { audio.src = src; audio.currentTime = ch.item.start || 0; }
  // l'extrait ne tourne que pendant l'écoute (30 s max) puis à la révélation ; pas pendant la question bonus
  const shouldPlay = (S.phase === 'challenge' && ch.stage === 'play' && gameNow(S) >= ch.startsAt) || (S.phase === 'reveal' && !!ch.outro);
  if (S.phase === 'reveal' && ch.outro && audio.ended) { audio.currentTime = 0; }
  if (ch.stage === 'answer' && S.phase === 'challenge' && !audio.paused) { audio.pause(); sfx.buzz(); }
  if (shouldPlay && audio.paused) audio.play().catch(soundBlocked);
  if (!shouldPlay && !audio.paused) audio.pause();
}

// ── 🔞 Le rabbin qui danse (mode NSFW) ───────────────────────
// 1er appui : il danse sur le plateau avec la musique ; 2e appui : la musique s'arrête, il s'assoit et attend.
const rabbiAudio = new Audio('/media/rabbi.mp3'); rabbiAudio.loop = true; rabbiAudio.volume = .75; rabbiAudio.preload = 'none';
window.nqAudio = { rabbi: rabbiAudio };
// Les navigateurs refusent de jouer du son tant que personne n'a cliqué sur la page de la télé
// (le maître du jeu pilote depuis son téléphone) : on le signale en grand, un clic n'importe où débloque tout.
function soundBlocked(e) {
  if (e && e.name !== 'NotAllowedError') return;
  $('#soundGate').classList.remove('hidden');
}
function soundGateUpdate() {
  const active = navigator.userActivation ? navigator.userActivation.hasBeenActive : soundGateUpdate.clicked;
  if (active) $('#soundGate').classList.add('hidden');
  else if (S && S.phase !== 'end') $('#soundGate').classList.remove('hidden');
}
addEventListener('pointerdown', () => { soundGateUpdate.clicked = true; audioUnlock(); $('#soundGate').classList.add('hidden'); if (S) syncAudio(); syncRabbi(); }, true);
setInterval(soundGateUpdate, 1000);
const RABBI_DANCE = `<svg viewBox="0 0 200 300" class="rb">
  <g class="rb-legs"><g class="rb-legL"><rect x="78" y="200" width="18" height="70" rx="6" fill="#1b1b1b"/><ellipse cx="82" cy="274" rx="18" ry="8" fill="#000"/></g>
    <g class="rb-legR"><rect x="104" y="200" width="18" height="70" rx="6" fill="#1b1b1b"/><ellipse cx="118" cy="274" rx="18" ry="8" fill="#000"/></g></g>
  <g class="rb-body">
    <path d="M62 112 Q100 96 138 112 L150 214 Q100 228 50 214 Z" fill="#111"/>
    <path d="M90 112 L100 150 L110 112 Z" fill="#fff"/>
    <g class="rb-armL"><path d="M68 120 Q40 140 30 168" stroke="#111" stroke-width="20" fill="none" stroke-linecap="round"/><circle cx="29" cy="171" r="10" fill="#f1c7a1"/></g>
    <g class="rb-armR"><path d="M132 120 Q160 140 170 168" stroke="#111" stroke-width="20" fill="none" stroke-linecap="round"/><circle cx="171" cy="171" r="10" fill="#f1c7a1"/></g>
    <g class="rb-head">
      <circle cx="100" cy="74" r="28" fill="#f1c7a1"/>
      <path d="M74 80 Q76 122 100 128 Q124 122 126 80 Q114 98 100 96 Q86 98 74 80 Z" fill="#5a4636"/>
      <path d="M73 66 q-6 10 0 20 q-6 8 0 16" stroke="#5a4636" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path d="M127 66 q6 10 0 20 q6 8 0 16" stroke="#5a4636" stroke-width="4" fill="none" stroke-linecap="round"/>
      <circle cx="90" cy="70" r="3" fill="#222"/><circle cx="110" cy="70" r="3" fill="#222"/>
      <path d="M92 84 Q100 90 108 84" stroke="#7a3b2b" stroke-width="3" fill="none" stroke-linecap="round"/>
      <ellipse cx="100" cy="50" rx="46" ry="9" fill="#000"/><rect x="74" y="20" width="52" height="32" rx="8" fill="#0d0d0d"/>
    </g>
  </g></svg>`;
const RABBI_SIT = `<svg viewBox="0 0 200 300" class="rb">
  <rect x="44" y="182" width="112" height="12" rx="4" fill="#8a5a33"/><rect x="50" y="194" width="10" height="80" fill="#6d4526"/><rect x="140" y="194" width="10" height="80" fill="#6d4526"/>
  <rect x="140" y="96" width="10" height="92" fill="#6d4526"/>
  <g class="rb-idle">
    <path d="M66 112 Q100 98 134 112 L140 188 L60 188 Z" fill="#111"/><path d="M90 112 L100 146 L110 112 Z" fill="#fff"/>
    <rect x="62" y="176" width="70" height="20" rx="8" fill="#1b1b1b"/>
    <rect x="66" y="190" width="16" height="70" rx="6" fill="#1b1b1b"/><rect x="108" y="190" width="16" height="70" rx="6" fill="#1b1b1b"/>
    <ellipse cx="72" cy="264" rx="16" ry="7" fill="#000"/><ellipse cx="118" cy="264" rx="16" ry="7" fill="#000"/>
    <path d="M70 124 Q60 156 84 170" stroke="#111" stroke-width="18" fill="none" stroke-linecap="round"/><circle cx="88" cy="170" r="9" fill="#f1c7a1"/>
    <circle cx="100" cy="74" r="28" fill="#f1c7a1"/>
    <path d="M74 80 Q76 122 100 128 Q124 122 126 80 Q114 98 100 96 Q86 98 74 80 Z" fill="#5a4636"/>
    <path d="M86 70 h8 M106 70 h8" stroke="#222" stroke-width="3" stroke-linecap="round"/>
    <ellipse cx="100" cy="50" rx="46" ry="9" fill="#000"/><rect x="74" y="20" width="52" height="32" rx="8" fill="#0d0d0d"/>
  </g>
  <text x="150" y="40" class="rb-zz" font-size="26" fill="#FFD23F" font-family="Bungee, sans-serif">…</text></svg>`;
let rabbiShown = '';
function syncRabbi() {
  const r = S && S.nsfw ? S.rabbi : null;
  const mode = r ? r.mode : '';
  const el = $('#rabbi');   // le bouton est sur le téléphone du maître du jeu uniquement
  if (mode !== rabbiShown) {
    rabbiShown = mode;
    el.className = mode ? mode : 'hidden';
    document.body.classList.toggle('rabbion', !!mode);
    el.innerHTML = mode === 'dance' ? RABBI_DANCE : mode === 'sit' ? RABBI_SIT : '';
  }
  if (mode === 'dance' && !S.paused) {
    if (rabbiAudio.paused) {
      const d = rabbiAudio.duration || 100;
      try { rabbiAudio.currentTime = ((serverNow() - r.at) / 1000) % d; } catch {}
      rabbiAudio.play().catch(soundBlocked);
    }
  } else if (!rabbiAudio.paused) rabbiAudio.pause();
}


// ── FIN ──────────────────────────────────────────────────────
function renderEnd() {
  const r = (S.ranking || []).map(id => team(id)).filter(Boolean);
  const pod = [r[1], r[0], r[2]].map((t, i) => t ? `<div class="pod" style="background:${t.color};height:${[330, 450, 290][i]}px"><span class="r">${[2, 1, 3][i]}</span><span class="n">${esc(t.name)}</span><span class="p">${t.score} pts</span></div>` : '').join('');
  $('#end').innerHTML = `<div class="logo"><span>Et les grands vainqueurs sont…</span><b>${esc(r[0] ? r[0].name : '?')}</b></div>
    <div class="podium">${pod}</div>
    ${r.length > 3 ? `<div class="losers">Et aussi, sans honte aucune : ${r.slice(3).map(t => `${esc(t.name)} (${t.score})`).join(', ')}</div>` : ''}
    <div class="losers">${r.length ? `Mention spéciale à ${esc(r[r.length - 1].name)}, qui a tout donné. Vraiment tout. Même la dignité.` : ''}</div>
    ${S.host ? `<button class="big-btn" onclick="location.href='/tv'">Nouvelle partie</button>` : ''}`;
  $('#end').classList.remove('hidden');
  if (!renderEnd.played) { renderEnd.played = true; sfx.win(); setTimeout(sfx.win, 600); }
}

// ── Chronos (rafraîchis 5 fois par seconde) ──────────────────
function tickTimers() {
  const now = gameNow(S);
  document.querySelectorAll('[data-ring]').forEach(el => {
    if (!Number(el.dataset.ring)) { el.style.visibility = 'hidden'; return; }
    const dl = Number(el.dataset.ring), total = Number(el.dataset.total) || 30000;
    const rem = Math.max(0, dl - now);
    const pct = Math.max(0, Math.min(100, rem / total * 100));
    el.style.background = `conic-gradient(var(--yellow) 0 ${pct}%, var(--panel) ${pct}% 100%)`;
    const sec = fmtSec(rem);
    el.querySelector('b').textContent = sec;
    el.classList.toggle('hurry', sec <= 5);
    if (sec <= 5 && sec > 0 && lastSec !== sec && el === document.querySelector('[data-ring]')) sfx.tick();
    lastSec = sec;
  });
  document.querySelectorAll('[data-dl]').forEach(el => { const dl = Number(el.dataset.dl); el.textContent = dl ? fmtSec(dl - now) + ' s' : ''; });
  const go = document.querySelector('[data-go]');
  if (go) {
    const goAt = Number(go.dataset.go);
    if (now < goAt) {
      const n = fmtSec(goAt - now);
      if (go.textContent !== String(n)) { go.textContent = n; sfx.bip(); }   // 3… 2… 1…
    }
    else if (go.textContent !== 'GO !') { go.textContent = 'GO !'; $('#b10t').textContent = 'Comptez dans votre tête… pas à voix haute, bande de tricheurs 🤫'; sfx.bipGo(); setTimeout(() => { if (go.isConnected) go.textContent = '🤫'; }, 1500); }
  }
  if (S.ch && S.ch.kind === 'affiche' && S.phase === 'challenge') {
    const k = Math.min(S.ch.q.clues ? S.ch.q.clues.length : 4, 1 + Math.floor(Math.max(0, now - S.ch.startsAt) / S.meta.timers.clue));
    document.querySelectorAll('[data-clue]').forEach(el => { const show = Number(el.dataset.clue) < k; if (show && el.style.visibility === 'hidden') { el.style.visibility = 'visible'; el.classList.add('pop'); sfx.ding(); } });
    const ap = $('#affPts'); if (ap) ap.textContent = `Indice ${k} sur ${S.ch.q.clues ? S.ch.q.clues.length : 4} · une bonne réponse maintenant vaut ${Math.max(1, (S.ch.q.clues ? S.ch.q.clues.length : 4) + 1 - k)} pt${k < 4 ? 's' : ''}`;
  }
  // A contrario : indices révélés à 10 s et 20 s d'écoute (le temps de réponse après un buzz ne compte pas)
  if (S.ch && S.ch.media === 'text' && S.phase === 'challenge' && S.ch.item && S.ch.item.hints) {
    const shown = S.ch.stage === 'answer' && S.ch.buzzAt ? S.ch.buzzAt : now;
    const k = Math.floor(Math.max(0, shown - S.ch.startsAt) / S.meta.timers.hint);
    document.querySelectorAll('[data-hint]').forEach(el => {
      const i = Number(el.dataset.hint);
      if (i < k && !el.classList.contains('on')) { el.classList.add('on', 'pop'); el.querySelector('b').textContent = S.ch.item.hints[i]; sfx.ding(); }
    });
  }
  const p = $('#poch');
  if (p && S.phase === 'challenge' && S.ch && (S.ch.stage === 'play' || S.ch.kind === 'dcc')) {
    const prog = Math.min(1, (now - S.ch.startsAt) / (S.ch.playMs || S.meta.timers.image || S.meta.timers.media));
    p.style.filter = `blur(${Math.round(40 * (1 - prog))}px)`;
  }
  if (S && S.startedAt && S.phase !== 'end' && S.phase !== 'lobby') {
    const el = Math.floor((now - S.startedAt) / 60000), tot = S.durationMin;
    const f = m => `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, '0')}`;
    $('#clock').textContent = `${f(el)} / ${f(tot)}${now > S.endAt ? ' · dernier tour !' : ''} · manche ${S.round}${S.gmOnline > 0 ? ' · 🎩 MJ' : ''}`;
  }
}
setInterval(() => { if (!S || S.phase === 'lobby' || S.phase === 'end') return; renderOverlay(false); syncAudio(); tickTimers(); renderTaunts(false); syncRabbi(); }, 200);

// ── Décompte « bip bip bip » avant chaque question ou épreuve
const cdUpdate = countdown({ parent: stage, onTick: n => (n ? sfx.bip : sfx.bipGo)() });
setInterval(() => { if (S) cdUpdate(S); }, 50);
