// ─────────────────────────────────────────────────────────────
//  Téléphone du MAÎTRE DU JEU : voit les réponses, corrige, annule, met en pause.
//  Accès : /gm?room=ABCD + code secret (variable GM_PIN côté Cloudflare, 1234 par défaut).
// ─────────────────────────────────────────────────────────────
import { $, esc, connect, gameNow, toast, fmtSec, LETTERS, OPT_COLORS, keepAwake } from './common.js';

const params = new URLSearchParams(location.search);
let room = (params.get('room') || localStorage.getItem('nq_gm_room') || '').toUpperCase();
let pin = localStorage.getItem('nq_gm_pin') || '';
const main = $('#main');

let S = null, net = null, tab = 'now', lastHtml = '', loginErr = '';

// ── Connexion ────────────────────────────────────────────────
function loginScreen(msg = '') {
  $('#hdr').classList.add('hidden'); $('#tabs').classList.add('hidden');
  main.innerHTML = `<form class="login" id="login">
    <h1>🎩 Maître du jeu</h1>
    <p class="sub">Le code de la partie est affiché sur la télé.</p>
    <input id="lgRoom" maxlength="4" placeholder="CODE" autocapitalize="characters" autocomplete="off" value="${esc(room)}">
    <input id="lgPin" type="password" inputmode="numeric" placeholder="Code secret" autocomplete="off">
    <div class="err">${esc(msg)}</div>
    <button class="b y big">Prendre les commandes</button>
  </form>`;
  $('#login').onsubmit = e => {
    e.preventDefault();
    const r = $('#lgRoom').value.trim().toUpperCase();
    if (!/^[A-Z]{4}$/.test(r)) { loginScreen('Code de partie : 4 lettres.'); return; }
    pin = $('#lgPin').value.trim();
    localStorage.setItem('nq_gm_pin', pin);
    if (r !== room || !net) {
      room = r; localStorage.setItem('nq_gm_room', room);
      history.replaceState(null, '', `?room=${room}`);
      location.reload();   // nouvelle partie : on repart proprement
      return;
    }
    net.hello();
  };
  setTimeout(() => (room ? $('#lgPin') : $('#lgRoom')).focus(), 50);
}

if (!/^[A-Z]{4}$/.test(room)) loginScreen();
else {
  localStorage.setItem('nq_gm_room', room);
  if (!params.get('room')) history.replaceState(null, '', `?room=${room}`);
  if (!pin) loginScreen();
  net = connect(room, () => ({ role: 'gm', pin }), {
    onState: st => { S = st; render(false); },
    onError: txt => toast($('#toasts'), { k: 'curse', text: txt }, 3500),
    onStatus: ok => $('#conn').classList.toggle('hidden', ok),
    onDenied: txt => { S = null; lastHtml = ''; localStorage.removeItem('nq_gm_pin'); loginScreen(pin ? txt : ''); }
  });
  keepAwake();
}

const host = (action, extra = {}) => net && net.send({ t: 'host', action, ...extra });
const team = id => (S.teams.find(t => t.id === id) || { name: '?', color: '#888', jokers: {}, armed: {}, curses: [] });
const dot = c => `<span class="dot" style="background:${c}"></span>`;
const active = () => S.teams[S.turn];
const cellLbl = i => `${i} · ${S.meta.board[i] ? S.meta.board[i].label : '?'}`;

// Bouton générique : data-a = action, data-p = paramètres JSON, data-c = confirmation, data-pr = question (réponse → paramètre)
const B = (label, action, p = {}, cls = '', opt = {}) =>
  `<button class="b ${cls}" data-a="${action}" data-p="${esc(JSON.stringify(p))}"${opt.confirm ? ` data-c="${esc(opt.confirm)}"` : ''}${opt.prompt ? ` data-pr="${esc(opt.prompt)}" data-pk="${opt.key}" data-pd="${esc(opt.def ?? '')}"` : ''}${opt.dis ? ' disabled' : ''}>${label}</button>`;
const sel = (action, key, options, p = {}, placeholder = 'Choisir…') =>
  `<select data-a="${action}" data-k="${key}" data-p="${esc(JSON.stringify(p))}"><option value="">${esc(placeholder)}</option>${options.map(([v, l]) => `<option value="${esc(v)}">${esc(l)}</option>`).join('')}</select>`;
const cellOptions = () => S.meta.board.map((c, i) => [i, cellLbl(i)]);

document.addEventListener('click', e => {
  const t = e.target.closest('#tabs [data-tab]');
  if (t) { tab = t.dataset.tab; document.querySelectorAll('#tabs button').forEach(b => b.classList.toggle('on', b === t)); render(true); scrollTo(0, 0); return; }
  const b = e.target.closest('button[data-a]'); if (!b || !S) return;
  const p = JSON.parse(b.dataset.p || '{}');
  if (b.dataset.c && !confirm(b.dataset.c)) return;
  if (b.dataset.a === 'logout') { localStorage.removeItem('nq_gm_pin'); location.reload(); return; }
  if (b.dataset.pr) {
    const v = prompt(b.dataset.pr, b.dataset.pd || '');
    if (v === null || v.trim() === '') return;
    p[b.dataset.pk] = v.trim();
  }
  if (navigator.vibrate) try { navigator.vibrate(15); } catch {}
  host(b.dataset.a, p);
});
document.addEventListener('change', e => {
  const s = e.target.closest('select[data-a]'); if (!s || s.value === '') return;
  const p = JSON.parse(s.dataset.p || '{}');
  const raw = s.value;
  p[s.dataset.k] = /^-?\d+$/.test(raw) ? Number(raw) : raw;
  host(s.dataset.a, p);
  s.value = '';
});

// ── Rendu ────────────────────────────────────────────────────
function render(force) {
  if (!S) return;
  // ne pas tout redessiner pendant qu'une liste déroulante est ouverte
  if (!force && document.activeElement && document.activeElement.tagName === 'SELECT') return;
  $('#hdr').classList.remove('hidden'); $('#tabs').classList.remove('hidden');
  document.body.classList.toggle('paused', !!S.paused);
  renderHeader();
  const html = ({ now: tabNow, teams: tabTeams, game: tabGame, hist: tabHist }[tab] || tabNow)();
  if (html !== lastHtml) {
    if (document.activeElement && document.activeElement.tagName === 'SELECT' && !force) return;
    main.innerHTML = html; lastHtml = html;
  }
  tickTimers();
}

function phaseText() {
  const t = active();
  if (S.phase === 'lobby') return ['Salle d\'attente', `${S.teams.length} équipe${S.teams.length > 1 ? 's' : ''}`];
  if (S.phase === 'end') return ['Partie terminée', '🏆'];
  const ch = S.ch;
  if (S.phase === 'roll') return [`Au tour de`, t ? t.name : '?'];
  if (S.phase === 'rolled') return [`${team(S.move.teamId).name} a fait ${S.move.roll}`, `→ ${cellLbl(S.move.to)}`];
  if (S.phase === 'challenge') return [`${team(ch.teamId).name} joue · case ${ch.cell}`, ch.fallback ? `Culture G (consolation ${ch.label})` : ch.label];
  if (S.phase === 'reveal') return ['Résultat', ch && ch.label ? ch.label : ''];
  return [S.phase, ''];
}
function renderHeader() {
  const [a, b] = phaseText();
  const html = `<div class="what"><small>${esc(S.code)} · ${esc(a)}</small><b>${esc(b)}</b></div>
    <span class="clock" id="clock"></span>
    ${S.phase !== 'lobby' && S.phase !== 'end' ? `<button class="pz ${S.paused ? 'on' : ''}" data-a="${S.paused ? 'resume' : 'pause'}" data-p="{}" title="${S.paused ? 'Reprendre' : 'Pause'}">${S.paused ? '▶️' : '⏸'}</button>` : ''}`;
  if ($('#hdr').dataset.h !== html) { $('#hdr').innerHTML = html; $('#hdr').dataset.h = html; }
}

// ── Onglet « En cours » ──────────────────────────────────────
function tabNow() {
  if (S.phase === 'lobby') return lobbyHTML();
  if (S.phase === 'end') return endHTML();
  const out = [];
  if (S.paused) out.push(`<div class="p warn"><div class="title">⏸ Jeu en pause</div><div class="sub">Chronos arrêtés, téléphones bloqués, son coupé.</div>${B('▶️ Reprendre', 'resume', {}, 'y big')}</div>`);
  if (S.phase === 'roll') out.push(rollHTML());
  else if (S.phase === 'rolled') out.push(rolledHTML());
  else if (S.phase === 'challenge') out.push(challengeHTML());
  else if (S.phase === 'reveal') out.push(revealHTML());
  if (S.hist && S.hist.length) out.push(`<div class="btns">${B('↩️ Annuler la dernière étape', 'undo', {}, '', { confirm: `Revenir à : ${S.hist[0].label} ?` })}</div>`);
  return out.join('');
}

function lobbyHTML() {
  return `<div class="p"><div class="title">Salle d'attente</div>
    <div class="sub">Les joueurs rejoignent avec le QR code de la télé. Lancez quand tout le monde est là.</div>
    <div class="sub">Partie <b>${esc(S.code)}</b> : vérifiez que c'est bien le code affiché sur la télé.</div>
    ${S.teams.map(t => `<div class="trow">${dot(t.color)}<div class="nm">${esc(t.name)}<span>${S.players[t.id] || 0} joueur(s)</span></div>${B('✕', 'removeTeam', { teamId: t.id }, 'sm', { confirm: `Retirer ${t.name} ?` })}</div>`).join('') || '<div class="sub">Aucune équipe pour l\'instant.</div>'}
    <div class="line"><label>Durée</label>${sel('setDuration', 'min', [[45, '45 min'], [60, '1 h'], [90, '1 h 30'], [120, '2 h'], [150, '2 h 30'], [180, '3 h']], {}, `${S.durationMin} min`)}</div>
    ${B(S.teams.length >= 2 ? '🚀 Lancer la partie' : S.teams.length === 1 ? '🧪 Lancer en mode test (1 équipe)' : '🧪 Tester le plateau (sans équipe)', 'start', {}, 'y big')}
  </div>`;
}
function endHTML() {
  const r = (S.ranking || []).map(id => team(id));
  return `<div class="p"><div class="title">🏆 Classement final</div>${r.map((t, i) => `<div class="trow"><b>${i + 1}</b>${dot(t.color)}<div class="nm">${esc(t.name)}</div><b>${t.score} pts</b></div>`).join('')}
    <div class="sub">Pour une nouvelle partie : bouton « Nouvelle partie » sur la télé, puis reconnectez-vous ici avec le nouveau code.</div></div>`;
}

const diceRow = (action, extra = {}) => `<div class="dice">${[1, 2, 3, 4, 5, 6].map(n => B(String(n), action, { ...extra, value: n })).join('')}</div>`;
const teamsChips = (action, exclude, keyName = 'teamId') => `<div class="btns">${S.teams.filter(t => t.id !== exclude).map(t => B(`${dot(t.color)} ${esc(t.name)}`, action, { [keyName]: t.id })).join('')}</div>`;

function rollHTML() {
  const t = active();
  return `<div class="p"><div class="title">${dot(t.color)} Au tour de ${esc(t.name)}</div>
      <div class="sub">L'équipe lance le dé sur son téléphone… ou vous le faites pour elle.</div>
      ${B('🎲 Lancer le dé', 'roll', {}, 'y big')}
      <h3>Ou choisir le résultat du dé</h3>${diceRow('roll')}
    </div>
    <div class="p"><h3>📍 Envoyer directement sur une case</h3>${sel('goto', 'cell', cellOptions(), {}, 'Choisir la case…')}
      <div class="sub">Le pion y va sans lancer de dé et l'épreuve démarre.</div></div>
    <div class="p"><h3>👉 Donner la main à une autre équipe</h3>${teamsChips('setTurn', t.id)}</div>`;
}
function rolledHTML() {
  const m = S.move;
  return `<div class="p"><div class="title">${dot(team(m.teamId).color)} ${esc(team(m.teamId).name)} a fait ${m.roll}</div>
      <div class="ans">→ ${esc(cellLbl(m.to))}${m.passed ? '<small>Passe par le Départ : +2 pts</small>' : ''}</div>
      ${B('Avancer le pion ▶', 'next', {}, 'y big')}
      ${B('🎲 Relancer le dé', 'reroll')}
      <h3>Corriger la valeur du dé</h3>${diceRow('setRoll')}
      <h3>Ou forcer la case d'arrivée</h3>${sel('forceCell', 'cell', cellOptions(), {}, 'Choisir la case…')}</div>`;
}

// Bonne réponse et contenu complet de l'épreuve
function optList(q, answers) {
  if (!q || !q.o) return '';
  return `<div class="olist">${q.o.map((o, i) => {
    const who = answers ? S.teams.filter(t => answers[t.id] && answers[t.id].v === i).map(t => dot(t.color)).join('') : '';
    return `<div class="${i === q.a ? 'good' : ''}"><span class="L" style="background:${OPT_COLORS[i]}">${LETTERS[i]}</span><span style="flex:1">${esc(o)}</span>${who}${i === q.a ? ' ✓' : ''}</div>`;
  }).join('')}</div>`;
}
function qBlock(q, answers) {
  if (!q) return '';
  if (q.n !== undefined) return `<div class="q">${esc(q.q)}</div><div class="ans">${Number(q.n).toLocaleString('fr-FR')} ${esc(q.u || '')}</div>${q.f ? `<div class="fun">${esc(q.f)}</div>` : ''}`;
  const qt = !q.q && q.o && q.o.length === 3 ? 'Trouver le mensonge' : q.q;
  const good = q.o && q.a !== undefined ? `<div class="ans">✓ ${esc(q.o[q.a])}${q.k && q.k.length ? `<small>Cash accepté aussi : ${esc(q.k.join(', '))}</small>` : ''}</div>` : '';
  return `${qt ? `<div class="q">${esc(qt)}</div>` : ''}${good}${optList(q, answers)}${q.f ? `<div class="fun">💡 ${esc(q.f)}</div>` : ''}`;
}
function expectHTML(ch) {
  const k = ch.kind;
  let body = '';
  if (k === 'media') {
    body = `<div class="ans">${esc(ch.item && ch.item.answer || '?')}${ch.item && ch.item.bonus ? `<small>Bonus (+1) : ${esc(ch.item.bonus)}</small>` : ''}</div>`;
  } else if (k === 'series' && ch.type === 'video') {
    body = `<div class="q">🎬 ${esc(ch.item && ch.item.label || 'Vidéo')}</div>${(ch.qs || []).map((q, i) => `<div class="sub">Question ${i ? 'bonus' : ''}${ch.i === i && ch.stage === 'q' ? ' (en cours)' : ''}</div>${qBlock(q)}`).join('')}`;
  } else if (k === 'series') {
    if (ch.stage === 'theme') body = `<div class="sub">${esc(team(ch.teamId).name)} choisit un menu :</div>${ch.themes.map(th => `<div class="q">${th.taré ? '🤪' : '🍔'} ${esc(th.name)}</div>`).join('')}`;
    else body = `<div class="sub">🍔 ${esc(ch.theme || '')}</div>${(ch.qs || []).map((q, i) => `<div class="sub">Question ${i + 1}/3${ch.i === i ? ' · en cours' : i < ch.i ? ' · passée' : ''}</div>${qBlock(q, ch.i === i ? ch.answers : null)}`).join('')}`;
  } else if (k === 'millions') {
    body = `<div class="sub">Marche ${ch.level + 1} · en banque : ${ch.bank} pt(s)</div>${qBlock(ch.q, ch.answers)}
      <h3>Les marches suivantes</h3>${(ch.ladder || []).map((q, i) => i > ch.level ? `<div class="sub">${i + 1}. ${esc(q.q)} → <b>${esc(q.o[q.a])}</b></div>` : '').join('')}`;
  } else if (k === 'number') {
    body = `<div class="q">${esc(ch.q.q)}</div><div class="ans">${Number(ch.q.a).toLocaleString('fr-FR')} ${esc(ch.q.u || '')}</div>${ch.q.f ? `<div class="fun">💡 ${esc(ch.q.f)}</div>` : ''}`;
  } else if (k === 'famille') {
    body = `<div class="q">${esc(ch.q.q)}</div><div class="olist">${ch.q.r.map((r, i) => `<div class="good"><span class="L" style="background:var(--ink)">${i + 1}</span><span style="flex:1">${esc(r.l)}</span><b>${r.p}</b></div>`).join('')}</div>`;
  } else if (k === 'bac') {
    body = `<div class="ans">Lettre ${esc(ch.letter)}</div><div class="sub">${ch.cats.map(esc).join(' · ')}</div>`;
  } else if (k === 'open') {
    body = `<div class="q">${esc(ch.q.q)}</div>${ch.q.sub ? `<div class="sub">${esc(ch.q.sub)}</div>` : ''}<div class="sub">Pas de bonne réponse : les équipes votent.</div>`;
  } else if (k === 'buzz10') {
    body = `<div class="ans">10,00 s</div><div class="sub">Le plus proche de 10 secondes gagne 2 pts (3 si à 0,15 s près).</div>`;
  } else if (k === 'affiche') {
    body = `${(ch.q.clues || []).map((c, i) => `<div class="sub">Indice ${i + 1} : ${esc(c)}</div>`).join('')}${qBlock(ch.q, ch.answers)}`;
  } else if (k === 'duel' || k === 'target') {
    body = ch.stage === 'pick' ? `<div class="q">${esc(team(ch.teamId).name)} doit choisir ${k === 'duel' ? 'son adversaire' : 'sa victime'}.</div>` : qBlock(ch.q, ch.answers);
  } else if (ch.q) body = qBlock(ch.q, ch.answers);
  else body = `<div class="q">${esc(ch.summary || ch.text || ch.rule || '')}</div>`;
  return `<div class="p expect"><h3>✓ Réponse attendue</h3>${body}</div>`;
}

// Ce qu'a fait chaque équipe
function teamStatus(ch, id) {
  const k = ch.kind, a = ch.answers ? ch.answers[id] : undefined;
  if (ch.blocked && ch.blocked.includes(id)) return ['🚫 écartée de l\'épreuve', 'bad'];
  if (k === 'media') {
    if (ch.buzzer === id) return ['🔔 a buzzé', 'good'];
    if (ch.excluded && ch.excluded.includes(id)) return ['grillée (mauvaise réponse)', 'bad'];
    if (ch.winner === id) return ['✓ a trouvé', 'good'];
    return ['peut buzzer', ''];
  }
  if (k === 'buzz10') { const ms = ch.taps[id]; return ms === undefined ? ['n\'a pas buzzé', ''] : ms < 0 ? ['faux départ', 'bad'] : [`${(ms / 1000).toFixed(2).replace('.', ',')} s`, Math.abs(ms - 10000) <= 1000 ? 'good' : '']; }
  if (k === 'dcc' && ch.stage === 'mode') return [ch.modes[id] ? `a choisi ${ch.modes[id]}` : 'choisit…', ''];
  if (ch.participants && !ch.participants.includes(id)) return ['ne joue pas', ''];
  if (a === undefined) return [ch.kind === 'open' && ch.stage === 'vote' ? (ch.votes[id] ? `a voté pour ${team(ch.votes[id]).name}` : 'vote…') : '… pas encore répondu', ''];
  if (k === 'open') return [`« ${a.v} »${ch.stage === 'vote' ? (ch.votes[id] ? ` · a voté pour ${team(ch.votes[id]).name}` : ' · vote…') : ''}`, ''];
  if (k === 'bac') return [a.v.map(w => w || '—').join(' · '), ''];
  if (k === 'famille') return [a.v.join(' · '), ''];
  if (k === 'number' || (ch.q && ch.q.n !== undefined)) {
    const target = k === 'number' ? ch.q.a : ch.q.n;
    return [`${Number(a.v).toLocaleString('fr-FR')} (écart ${Math.abs(a.v - target).toLocaleString('fr-FR')})`, a.v === target ? 'good' : ''];
  }
  if (k === 'dcc') {
    const mode = ch.modes[id];
    if (a.cash) return [`cash « ${a.v} »`, ''];
    return [`${mode} · ${LETTERS[a.v]} ${ch.q.o[a.v]}`, a.v === ch.q.a ? 'good' : 'bad'];
  }
  if (ch.q && ch.q.o) return [`${LETTERS[a.v]} ${ch.q.o[a.v]}`, a.v === ch.q.a ? 'good' : 'bad'];
  return ['a répondu', ''];
}
function teamsBlock(ch) {
  const canBlock = ch.kind === 'media' || !!ch.participants;
  const rows = S.teams.map(t => {
    const [txt, cls] = teamStatus(ch, t.id);
    const blocked = ch.blocked && ch.blocked.includes(t.id);
    const hasAns = (ch.answers && ch.answers[t.id] !== undefined && !(ch.kind === 'bac' && ch.stage === 'review')) || (ch.taps && ch.taps[t.id] !== undefined) || (ch.modes && ch.stage === 'mode' && ch.modes[t.id]) || (ch.votes && ch.stage === 'vote' && ch.votes[t.id]);
    return `<div class="trow ${blocked ? 'off' : ''}">${dot(t.color)}<div class="nm"><div>${esc(t.name)}${t.id === ch.teamId ? ' <i class="pill y">joue</i>' : ''}</div><span class="${cls}">${esc(txt)}</span></div>
      ${hasAns ? B('Effacer', 'clearAnswer', { teamId: t.id }, 'sm', { confirm: `Effacer la réponse de ${t.name} ? Elle pourra répondre à nouveau.` }) : ''}
      ${canBlock ? (blocked ? B('Réintégrer', 'blockTeam', { teamId: t.id, on: false }, 'sm') : B('Écarter', 'blockTeam', { teamId: t.id, on: true }, 'sm', { confirm: `Écarter ${t.name} de cette épreuve ?` })) : ''}</div>`;
  }).join('');
  return `<div class="p"><h3>👥 Les équipes</h3>${rows}</div>`;
}

function stageActions(ch) {
  const out = [];
  if (ch.kind === 'media') {
    if (ch.stage === 'answer') {
      const t = team(ch.buzzer);
      out.push(`<div class="buzzbox" style="background:${t.color}"><b>🔔 ${esc(t.name)}</b>a buzzé : on écoute sa réponse</div>
        <div class="btns">${B('✓ Bonne réponse', 'judge', { ok: true }, 'ok big')}${ch.item && ch.item.bonus ? B('✓ + bonus (+1)', 'judge', { ok: true, bonus: true }, 'ok') : ''}${B('✗ Raté', 'judge', { ok: false }, 'ko')}${B('↩️ Annuler le buzz', 'unbuzz')}</div>`);
    }
    out.push(`<div class="btns">${B(ch.media === 'image' ? '🔁 Reflouter l\'image' : '🔁 Relancer l\'extrait', 'replay')}</div>`);
  }
  if (ch.stage === 'video') out.push(`<div class="btns">${B('🔁 Relancer la vidéo', 'replay')}${B('▶ Passer aux questions', 'mediaDone', {}, 'y')}</div>`);
  if (ch.stage === 'pick') out.push(`<h3>Choisir à sa place</h3>${teamsChips('pick', ch.teamId)}`);
  if (ch.kind === 'series' && ch.stage === 'theme') out.push(`<h3>Choisir le menu à sa place</h3><div class="btns">${ch.themes.map((th, i) => B(esc(th.name), 'theme', { i })).join('')}</div>`);
  if (ch.kind === 'millions' && ch.stage === 'decide') out.push(`<div class="btns">${B('💰 Continuer', 'decide', { go: true }, 'ok')}${B('✋ S\'arrêter', 'decide', { go: false }, 'ko')}</div>`);
  if (ch.kind === 'dcc' && ch.stage === 'mode') out.push(`<div class="btns">${B('Passer à la question ▶ (carré par défaut)', 'next', {}, 'y')}</div>`);
  if (ch.kind === 'bac' && ch.stage === 'review') {
    out.push(`<h3>Correction : touchez un mot pour le valider / refuser</h3><table class="bac"><tr><th></th>${ch.cats.map(c => `<th>${esc(c)}</th>`).join('')}</tr>
      ${ch.participants.map(id => `<tr><td>${dot(team(id).color)}</td>${ch.cats.map((_, i) => { const w = ch.answers[id] ? ch.answers[id].v[i] : ''; const ok = ch.valid[id] && ch.valid[id][i] && w;
        return `<td class="w ${ok ? 'v' : 'x'}"><button class="b sm" style="background:none;color:inherit;min-height:30px;padding:0" data-a="bacToggle" data-p="${esc(JSON.stringify({ teamId: id, i }))}">${esc(w || '—')}</button></td>`; }).join('')}</tr>`).join('')}</table>
      ${B('✓ Valider les points', 'bacValidate', {}, 'y big')}`);
  }
  return out.length ? `<div class="p"><h3>🎛 Actions</h3>${out.join('')}</div>` : '';
}

function controls(ch) {
  return `<div class="p"><h3>⏱ Contrôle de l'épreuve <span class="r" id="chClock"></span></h3><div class="btns">
    ${ch.kind !== 'buzz10' ? B('+15 s', 'addTime', { sec: 15 }) + B('+30 s', 'addTime', { sec: 30 }) : ''}
    ${B('⏹ Stop, on révèle', 'next', {}, 'y')}
    ${B('⏭ Passer l\'épreuve', 'skip', {}, '', { confirm: 'Passer l\'épreuve ? Personne ne marque.' })}
    ${S.canRestart ? B('🔄 Rejouer l\'épreuve', 'restart', {}, '', { confirm: 'Rejouer cette épreuve depuis le début (même question, réponses et points effacés) ?' }) : ''}
    ${S.canRestart ? B('🔀 Autre question', 'newQuestion', {}, '', { confirm: 'Remplacer par une autre question de la même case ?' }) : ''}
  </div></div>`;
}

function challengeHTML() {
  const ch = S.ch;
  const head = `<div class="p"><div class="title">${esc(ch.fallback ? 'Culture G (consolation)' : ch.label)}</div><div class="sub">${esc(ch.rule || '')}</div></div>`;
  return head + stageActions(ch) + expectHTML(ch) + teamsBlock(ch) + controls(ch);
}

function revealHTML() {
  const ch = S.ch || {};
  const gains = S.teams.map(t => {
    const g = (ch.gains || {})[t.id] || 0;
    const cash = ch.kind === 'dcc' && ch.modes && ch.modes[t.id] === 'cash' && ch.answers && ch.answers[t.id];
    return `<div class="trow">${dot(t.color)}<div class="nm">${esc(t.name)}<span class="${g > 0 ? 'good' : g < 0 ? 'bad' : ''}">${g > 0 ? '+' : ''}${g} pt(s) sur cette épreuve · total ${t.score}${cash ? ` · cash « ${esc(ch.answers[t.id].v)} » ${ch.ok && ch.ok[t.id] ? '✓' : '✗'}` : ''}</span></div>
      ${cash ? B(ch.ok && ch.ok[t.id] ? 'Refuser' : 'Accepter', 'cashToggle', { teamId: t.id }, 'sm') : ''}
      ${B('−1', 'adjust', { teamId: t.id, delta: -1 }, 'sm')}${B('+1', 'adjust', { teamId: t.id, delta: 1 }, 'sm')}</div>`;
  }).join('');
  return `<div class="p"><div class="title">${esc(ch.label || 'Résultat')}</div><div class="q">${esc(ch.summary || '')}</div>
      ${B('Tour suivant ▶', 'next', {}, 'y big')}</div>
    ${ch.kind ? expectHTML(ch) : ''}
    <div class="p"><h3>🧮 Points (corriger si besoin)</h3>${gains}</div>
    <div class="p"><div class="btns">
      ${ch.kind === 'media' && ch.item ? B('🔁 Rejouer l\'extrait', 'replay') : ''}
      ${S.canRestart ? B('🔄 Rejouer l\'épreuve', 'restart', {}, '', { confirm: 'Rejouer cette épreuve depuis le début ? Les points gagnés ici seront retirés.' }) : ''}
      ${S.canRestart ? B('🔀 Autre question', 'newQuestion', {}, '', { confirm: 'Rejouer la case avec une autre question ? Les points gagnés ici seront retirés.' }) : ''}
    </div></div>`;
}

// ── Onglet « Équipes » ───────────────────────────────────────
function tabTeams() {
  if (!S.teams.length) return `<div class="p"><div class="sub">Aucune équipe.</div></div>`;
  return S.teams.map(t => {
    const isActive = active() && active().id === t.id && S.phase !== 'lobby';
    const players = (S.roster || []).filter(p => p.teamId === t.id);
    const jokers = Object.entries(S.meta.jokers).map(([k, j]) => `<button class="chip ${t.jokers[k] ? '' : 'off'}" data-a="setJoker" data-p="${esc(JSON.stringify({ teamId: t.id, kind: k, on: !t.jokers[k] }))}">${j.icon} ${esc(j.label)}</button>`).join('');
    const armed = [['double', '💥 ×2 armé'], ['shield', '🛡️ Bouclier levé'], ['halve', '🪓 Points ÷2']].map(([k, l]) => `<button class="chip ${t.armed[k] ? 'on' : ''}" data-a="setArmed" data-p="${esc(JSON.stringify({ teamId: t.id, key: k, on: !t.armed[k] }))}">${l}</button>`).join('');
    return `<div class="p tcard">
      <div class="head">${dot(t.color)}<span class="n">${esc(t.name)}</span>${isActive ? '<span class="pill y">joue</span>' : ''}${B('✏️', 'renameTeam', { teamId: t.id }, 'sm', { prompt: 'Nouveau nom de l\'équipe ?', key: 'name', def: t.name })}</div>
      <div class="score">${B('−1', 'adjust', { teamId: t.id, delta: -1 })}<span class="v">${t.score}</span>${B('+1', 'adjust', { teamId: t.id, delta: 1 })}${B('✏️ Fixer', 'setScore', { teamId: t.id }, '', { prompt: `Nouveau score de ${t.name} ?`, key: 'value', def: t.score })}</div>
      <div class="line"><label>Position : ${esc(cellLbl(t.pos))}</label>${sel('setPos', 'cell', cellOptions(), { teamId: t.id }, 'Déplacer…')}</div>
      <div class="line"><label>${t.skip ? `⛔ Bloquée : passe ${t.skip} tour(s)` : 'Tours à passer : aucun'}</label>${B('−', 'setSkip', { teamId: t.id, n: Math.max(0, t.skip - 1) }, 'sm', { dis: !t.skip })}${B('+', 'setSkip', { teamId: t.id, n: t.skip + 1 }, 'sm')}${t.skip ? B('Débloquer', 'setSkip', { teamId: t.id, n: 0 }, 'sm') : ''}</div>
      ${S.phase !== 'lobby' && S.phase !== 'end' && !isActive ? B('👉 Lui donner la main', 'setTurn', { teamId: t.id }, '', { confirm: `Donner la main à ${t.name} ? L'épreuve en cours sera abandonnée.` }) : ''}
      <h3>🃏 Jokers (toucher pour rendre / retirer)</h3><div class="chips">${jokers}</div>
      <h3>✨ Effets en cours</h3><div class="chips">${armed}</div>
      ${t.curses.length ? `<div class="sub">💀 ${t.curses.map(c => esc(c.t)).join(' · ')}</div>${B('Lever les malédictions', 'clearCurses', { teamId: t.id }, 'sm')}` : ''}
      <h3>📱 Joueurs (${players.length})</h3>
      ${players.map(p => `<div class="trow"><div class="nm">${esc(p.name || 'Sans nom')}</div>${S.teams.length > 1 ? sel('movePlayer', 'teamId', S.teams.filter(x => x.id !== t.id).map(x => [x.id, x.name]), { pid: p.pid }, 'Changer d\'équipe…') : ''}${B('✕', 'kick', { pid: p.pid }, 'sm', { confirm: `Déconnecter ${p.name || 'ce joueur'} de l'équipe ?` })}</div>`).join('') || '<div class="sub">Personne (équipe de test ?)</div>'}
    </div>`;
  }).join('');
}

// ── Onglet « Partie » ────────────────────────────────────────
function tabGame() {
  const playing = S.phase !== 'lobby' && S.phase !== 'end';
  const feed = [...S.feed].reverse().slice(0, 20).map(f => `<div>${esc(f.text)}</div>`).join('');
  return `<div class="p"><h3>⏱ Temps de jeu <span class="r" id="gameClock"></span></h3>
      <div class="sub">Durée prévue : ${S.durationMin} min. À la fin du temps, le tour en cours se termine puis podium.</div>
      <div class="btns">${B('−15 min', 'addGameTime', { min: -15 })}${B('+15 min', 'addGameTime', { min: 15 })}${B('+30 min', 'addGameTime', { min: 30 })}</div></div>
    ${playing ? `<div class="p"><div class="btns">${S.paused ? B('▶️ Reprendre le jeu', 'resume', {}, 'y big') : B('⏸ Mettre en pause', 'pause', {}, 'big')}</div>
      <div class="sub">La pause arrête les chronos, coupe le son de la télé et bloque les téléphones.</div></div>` : ''}
    <div class="p"><h3>ℹ️ Partie ${esc(S.code)}</h3>
      <div class="sub">Joueurs : ${esc(location.host)}/${esc(S.code)} · ${S.teams.length} équipe(s) · manche ${S.round}${S.test ? ' · mode test' : ''}</div>
      <div class="sub">Télé : ${S.gmOnline > 1 ? `${S.gmOnline} maîtres du jeu connectés` : 'vous êtes le maître du jeu'}.</div></div>
    ${playing ? `<div class="p">${B('🏁 Terminer la partie maintenant', 'end', {}, 'ko', { confirm: 'Terminer la partie et afficher le podium ?' })}</div>` : ''}
    <div class="p"><h3>📰 Journal</h3><div class="feed">${feed}</div></div>
    <div class="p">${B('🔒 Se déconnecter', 'logout', {}, '', { confirm: 'Quitter le mode maître du jeu sur ce téléphone ?' })}</div>`;
}

// ── Onglet « Historique » ────────────────────────────────────
const ago = at => { const m = Math.round((gameNow(null) - at) / 60000); return m < 1 ? 'à l\'instant' : `il y a ${m} min`; };
function tabHist() {
  const h = S.hist || [];
  if (!h.length) return `<div class="p"><div class="sub">Rien à annuler pour l'instant. Chaque étape (lancer, épreuve, révélation) et chaque correction crée un point de retour.</div></div>`;
  return `<div class="p">${B('↩️ Annuler la dernière étape', 'undo', {}, 'y big', { confirm: `Revenir à : ${h[0].label} ?` })}
      <div class="sub">Revenir en arrière remet les scores, les pions, le dé et l'épreuve comme ils étaient. Les joueurs connectés restent connectés.</div></div>
    <div class="hist">${h.map(e => `<div class="h"><span>${esc(e.label)}</span><small>${ago(e.at)}</small>${B('Revenir ici', 'restoreTo', { id: e.id }, 'sm', { confirm: `Revenir à : ${e.label} ?\nTout ce qui s'est passé depuis sera annulé.` })}</div>`).join('')}</div>`;
}

// ── Chronos ──────────────────────────────────────────────────
function tickTimers() {
  if (!S) return;
  const now = gameNow(S);
  const dl = S.deadline && S.phase !== 'lobby' && S.phase !== 'end' ? Math.max(0, S.deadline - now) : null;
  const c = $('#clock'); if (c) c.textContent = dl === null ? '' : S.paused ? '⏸' : fmtSec(dl) + ' s';
  const cc = $('#chClock'); if (cc) cc.textContent = dl === null ? '' : fmtSec(dl) + ' s';
  const gc = $('#gameClock');
  if (gc && S.startedAt) { const left = Math.round((S.endAt - now) / 60000); gc.textContent = left >= 0 ? `reste ${Math.floor(left / 60)} h ${String(left % 60).padStart(2, '0')}` : 'temps écoulé · dernier tour'; }
}
setInterval(tickTimers, 250);

// une liste déroulante refermée : on rattrape l'affichage différé
document.addEventListener('focusout', e => { if (e.target.tagName === 'SELECT') setTimeout(() => render(true), 0); });
