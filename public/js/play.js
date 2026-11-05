import { $, esc, uid, connect, gameNow, dieHTML, toast, fmtSec, LETTERS, OPT_COLORS, keepAwake, countdown, bmcSentence } from './common.js';

const params = new URLSearchParams(location.search);
const room = (params.get('room') || '').toUpperCase();
const main = $('#main');

if (!/^[A-Z]{4}$/.test(room)) {
  main.innerHTML = `<div class="center"><h1>Le grand N'importe Quiz</h1><p class="msg">Entrez le code affiché sur la télé</p>
    <input id="code" maxlength="4" autocapitalize="characters" style="text-align:center;font-size:40px;letter-spacing:10px;font-family:var(--display)">
    <button class="btn" id="goCode">Rejoindre</button></div>`;
  $('#goCode').onclick = () => { const c = $('#code').value.trim().toUpperCase(); if (/^[A-Z]{4}$/.test(c)) location.href = `/play?room=${c}`; };
  throw new Error('pas de salle');
}

const pid = localStorage.getItem('nq_pid') || (() => { const k = uid(); localStorage.setItem('nq_pid', k); return k; })();
let S = null, lastFeed = -1, screenKey = '', sheet = null, chosenColor = null, selOpt = null, tauntTo = 'all', tauntTab = 'mean', autoSent = '', bmcSel = [];

const net = connect(room, () => ({ role: 'phone', pid }), {
  onState: st => { const first = !S; S = st; onState(first); },
  onError: txt => { toast($('#toasts'), { k: 'curse', text: txt }, 3500); buzz(80); },
  onStatus: ok => $('#conn').classList.toggle('hidden', ok)
});
const send = m => net.send(m);
// Bandeau de pause (décidée par le maître du jeu)
const pauseBanner = Object.assign(document.createElement('div'), { id: 'pauseBanner', className: 'hidden', textContent: '⏸ PAUSE — on attend le maître du jeu' });
document.body.appendChild(pauseBanner);
// L'écran du téléphone ne doit jamais se mettre en veille pendant la partie
const wakeBadge = Object.assign(document.createElement('div'), { id: 'wake', textContent: '😴 Touchez l\'écran pour l\'empêcher de se mettre en veille' });
document.body.appendChild(wakeBadge);
keepAwake({ onChange: on => wakeBadge.classList.toggle('hidden', on) });
const buzz = p => { try { navigator.vibrate && navigator.vibrate(p); } catch {} };
const team = id => S.teams.find(t => t.id === id);
const me = () => S.me ? team(S.me.teamId) : null;
const dot = c => `<span class="dot" style="background:${c}"></span>`;
const isMyTurn = () => me() && S.teams[S.turn] && S.teams[S.turn].id === me().id;

function onState(first) {
  pauseBanner.classList.toggle('hidden', !S.paused);
  const t = me();
  // toasts : vannes reçues, jokers et malédictions
  if (first) lastFeed = S.feed.length ? S.feed[S.feed.length - 1].id : 0;
  for (const f of S.feed) if (f.id > lastFeed) {
    lastFeed = f.id;
    if (f.k === 'taunt' && t && f.from !== t.id && (f.to === 'all' || f.to === t.id)) {
      toast($('#toasts'), { k: 'taunt', text: f.text, from: `${team(f.from)?.name || '?'} vous dit :` }, 6000); buzz([60, 40, 60]);
    } else if ((f.k === 'joker' || f.k === 'curse') && t && f.text.includes(t.name)) {
      toast($('#toasts'), { k: f.k, text: f.text }, 5000); buzz(200);
    }
  }
  renderHeader();
  $('#tabs').classList.toggle('hidden', !t);
  if (t) $('#jkCount').textContent = `(${Object.values(t.jokers).filter(Boolean).length})`;
  render();
  if (sheet) renderSheet();
}

function renderHeader() {
  const t = me(), h = $('#hdr');
  if (!t) { h.style.background = 'var(--panel)'; h.style.color = 'var(--ink)'; h.innerHTML = `<div class="nm"><small>Partie ${room}</small><b>N'importe Quiz</b></div>`; h.classList.remove('myturn'); return; }
  const rank = [...S.teams].sort((a, b) => b.score - a.score).findIndex(x => x.id === t.id) + 1;
  h.style.background = t.color; h.style.color = 'var(--bg)';
  h.classList.toggle('myturn', isMyTurn() && (S.phase === 'roll' || S.phase === 'rolled'));
  h.innerHTML = `<div class="nm"><small>${S.me.name ? esc(S.me.name) + ' · ' : ''}Équipe</small><b>${esc(t.name)}</b></div>
    <div class="sc"><small>${S.phase === 'lobby' ? '' : `${rank}e / ${S.teams.length}`}</small><b>${t.score} pt${t.score > 1 ? 's' : ''}</b></div>`;
}

// clé d'écran : on ne redessine que si l'écran change (pour ne pas effacer ce qu'on tape)
function keyOf() {
  const t = me(), ch = S.ch;
  const k = [S.phase, t ? t.id : '-', S.turn, S.move && S.move.n, S.move && S.move.roll];
  if (!t) k.push(JSON.stringify(S.teams.map(x => [x.id, x.name, S.players[x.id]])));
  if (ch) k.push(ch.type, ch.stage, ch.cell, ch.target, ch.buzzer, (ch.excluded || []).length, ch.answers && t && ch.answers[t.id] ? 'A' : '', ch.votes && t && ch.votes[t.id] ? 'V' : '',
    ch.taps && t && ch.taps[t.id] !== undefined ? 'T' : '', ch.fifty && t && ch.fifty[t.id] ? 'F' : '', ch.i, ch.level, ch.modes && t ? ch.modes[t.id] : '', gameNow(S) >= (ch.startsAt || 0) ? 'S' : 'w', ch.goAt && gameNow(S) >= ch.goAt ? 'G' : '', ch.mine ? 'M' : '', ch.inGame ? 'I' : '');
  if (S.phase === 'end') k.push(JSON.stringify(S.ranking));
  return k.join('|');
}

function render(force) {
  const k = keyOf();
  if (!force && k === screenKey) return;
  screenKey = k; selOpt = null; bmcSel = [];
  const t = me();
  if (!t) return renderJoin();
  if (S.phase === 'lobby') return html(`<div class="center"><div class="big">🍻</div><h1>Vous êtes dans<br>${esc(t.name)}</h1>
    <p class="msg">En attente du lancement de la partie. Profitez-en pour tester les vannes en bas ↓</p>
    <button class="btn alt small" id="leave">Changer d'équipe</button></div>`, () => $('#leave').onclick = () => send({ t: 'leaveTeam' }));
  if (S.phase === 'end') return renderEnd();
  if (S.phase === 'roll') return renderRoll();
  if (S.phase === 'rolled') return renderRolled();
  if (S.phase === 'challenge') return renderChallenge();
  if (S.phase === 'reveal') return renderReveal();
}
const html = (h, after) => { main.innerHTML = h; after && after(); };

// ── Rejoindre / créer une équipe ─────────────────────────────
function renderJoin() {
  const taken = S.teams.map(x => x.color);
  const free = S.meta.colors.filter(c => !taken.includes(c));
  if (!free.includes(chosenColor)) chosenColor = free[0] || null;
  const savedName = localStorage.getItem('nq_name') || '';
  html(`<h1>Bienvenue dans le grand N'importe Quiz 🎲</h1>
    <label class="f">Ton prénom (pour la postérité)<input id="pname" maxlength="20" value="${esc(savedName)}" placeholder="Ex : Gérard"></label>
    ${S.teams.length ? `<h2>Rejoins une équipe</h2><div class="teams">${S.teams.map(x => `<button class="teamBtn" data-join="${x.id}">${dot(x.color)}${esc(x.name)}<span class="n">${S.players[x.id] || 0} 👤</span></button>`).join('')}</div>` : ''}
    ${S.teams.length < 6 ? `<h2>${S.teams.length ? 'Ou crée la tienne' : 'Crée la première équipe'}</h2>
    <div class="p"><div class="row"><input id="tname" maxlength="28" placeholder="Nom d'équipe ridicule"><button class="btn alt small" id="rnd" style="width:56px" aria-label="Nom au hasard">🎲</button></div>
      <div class="swatches">${free.map(c => `<button class="swatch ${c === chosenColor ? 'on' : ''}" data-c="${c}" style="background:${c}" aria-label="Couleur"></button>`).join('')}</div>
      <button class="btn" id="create">Créer l'équipe</button></div>` : ''}`, () => {
    const name = () => { const v = $('#pname').value.trim(); localStorage.setItem('nq_name', v); return v; };
    main.querySelectorAll('[data-join]').forEach(b => b.onclick = () => send({ t: 'joinTeam', teamId: b.dataset.join, player: name() }));
    main.querySelectorAll('[data-c]').forEach(b => b.onclick = () => { chosenColor = b.dataset.c; main.querySelectorAll('.swatch').forEach(x => x.classList.toggle('on', x === b)); });
    const rnd = $('#rnd'); if (rnd) rnd.onclick = () => { const used = S.teams.map(x => x.name); const opts = S.meta.teamNames.filter(n => !used.includes(n)); $('#tname').value = opts[Math.floor(Math.random() * opts.length)] || 'Les Anonymes'; };
    const cr = $('#create'); if (cr) cr.onclick = () => send({ t: 'createTeam', name: $('#tname').value, color: chosenColor, player: name() });
  });
}

// ── Dé ───────────────────────────────────────────────────────
const WAIT = ['Pendant ce temps, préparez une vanne 😈', 'Profitez-en pour remplir votre verre 🍷', 'Respirez. Vous allez encore perdre.', 'Regardez la télé, ça va être gênant pour eux.'];
function renderRoll() {
  const cur = S.teams[S.turn];
  if (!isMyTurn()) return html(`<div class="center"><h2>Au tour de</h2><h1 style="color:${cur.color}">${esc(cur.name)}</h1><p class="msg">${WAIT[S.round % WAIT.length]}</p></div>`);
  buzz([100, 50, 100]);
  html(`<div class="center"><h1>C'est à vous !</h1><button class="dice-btn" id="roll" aria-label="Lancer le dé">${dieHTML(5)}</button><p class="msg">Touchez le dé (ou secouez le téléphone)</p></div>`, () => {
    const go = () => { $('#roll .die').classList.add('rolling'); buzz(150); send({ t: 'roll' }); };
    $('#roll').onclick = go;
    shakeArm(go);
  });
}
let shakeHandler = null;
function shakeArm(fn) {
  if (shakeHandler) removeEventListener('devicemotion', shakeHandler);
  let fired = false;
  shakeHandler = e => { const a = e.accelerationIncludingGravity; if (!a || fired) return; if (Math.abs(a.x) + Math.abs(a.y) + Math.abs(a.z) > 38) { fired = true; removeEventListener('devicemotion', shakeHandler); fn(); } };
  addEventListener('devicemotion', shakeHandler);
}
let rollShown = 0, rollAnimTimer = null;
function renderRolled() {
  if (shakeHandler) { removeEventListener('devicemotion', shakeHandler); shakeHandler = null; }
  const m = S.move, cell = S.meta.board[m.to], who = team(m.teamId);
  // Animation : le dé tourne quelques secondes avant d'afficher le résultat
  const left = (m.at || 0) + S.meta.timers.roll - gameNow(S);
  if (rollShown !== m.n && left > 150) {
    clearInterval(rollAnimTimer);
    html(`<div class="center"><div id="rollDie" class="spin">${dieHTML(1 + Math.floor(Math.random() * 6)).replace('class="die', 'style="width:170px;height:170px" class="die')}</div>
      <h1>${isMyTurn() ? 'Ça roule…' : esc(who.name) + ' lance le dé…'}</h1></div>`);
    rollAnimTimer = setInterval(() => { const d = $('#rollDie'); if (d) d.innerHTML = dieHTML(1 + Math.floor(Math.random() * 6)).replace('class="die', 'style="width:170px;height:170px" class="die'); buzz(15); }, 120);
    setTimeout(() => { clearInterval(rollAnimTimer); rollShown = m.n; buzz([80, 40, 160]); render(true); }, left);
    return;
  }
  rollShown = m.n;
  const head = `<div class="center">${dieHTML(m.roll).replace('class="die', 'style="width:150px;height:150px" class="die')}
    <h1>${isMyTurn() ? 'Vous faites' : esc(who.name) + ' fait'} ${m.roll}${m.rerolled ? ' (relancé)' : ''}</h1>
    <h2>→ Case ${m.to} · <span class="c-${cell.group}">${esc(cell.label)}</span></h2>`;
  if (!isMyTurn()) return html(head + `</div>`);
  const t = me();
  html(head + `<button class="btn" id="go">C'est parti ! <span class="cd" data-dl="${S.deadline}"></span></button>
    ${t.jokers.relance ? `<button class="btn alt" id="rel">🎲 Joker : relancer le dé</button>` : ''}</div>`, () => {
    $('#go').onclick = () => send({ t: 'go' });
    const r = $('#rel'); if (r) r.onclick = () => { if (confirm('Utiliser votre joker « Relancer le dé » ?')) send({ t: 'joker', kind: 'relance' }); };
  });
}

// ── Épreuves ─────────────────────────────────────────────────
function renderChallenge() {
  const ch = S.ch, t = me();
  const timer = `<span class="cd" data-dl="${ch.deadline}"></span>`;
  if (gameNow(S) < (ch.startsAt || 0) && ch.kind !== 'buzz10') return html(`<div class="center"><div class="big">👀</div><h1>Regardez la télé !</h1><h2>${esc(ch.fallback ? 'Question de consolation' : ch.label)}</h2></div>`);
  const answered = ch.answers && ch.answers[t.id] !== undefined;
  const wait = (txt, emoji = '⏳') => html(`<div class="center"><div class="big">${emoji}</div><h1>${txt}</h1><p class="msg">${timer}</p></div>`);
  const participant = !ch.participants || ch.participants.includes(t.id);

  // Écran QCM réutilisable : only = indices autorisés (duo), head = texte au-dessus
  const qcmUI = ({ only = null, head = '', label = 'Valider', fifty = true } = {}) => {
    const q = ch.q, banned = (ch.fifty && ch.fifty[t.id]) || [];
    const isEmoji = ch.type === 'emojis';
    const qtxt = q.q ? (ch.type === 'contrario' ? `« ${q.q} » à l'endroit, ça donne… ?` : q.q) : ch.type === 'affiche' ? 'Quel est ce film ? Les indices sont sur la télé 📺' : 'Lequel est le mensonge ?';
    const idx = only || q.o.map((_, i) => i);
    return html(`${head}<div class="qtext ${isEmoji ? 'emoji' : ''}">${esc(qtxt)}</div>
      <div class="opts">${idx.map(i => `<button class="opt" data-o="${i}" ${banned.includes(i) ? 'disabled' : ''}><span class="L" style="background:${OPT_COLORS[i]}">${LETTERS[i]}</span>${esc(q.o[i])}</button>`).join('')}</div>
      <button class="btn" id="val" disabled>${label} ${timer}</button>
      ${fifty && !only && t.jokers.fifty && q.o.length === 4 && !banned.length ? `<button class="btn alt small" id="ff">✂️ Joker 50/50</button>` : ''}`, () => {
      main.querySelectorAll('[data-o]').forEach(b => b.onclick = () => { selOpt = Number(b.dataset.o); main.querySelectorAll('.opt').forEach(x => x.classList.toggle('sel', x === b)); $('#val').disabled = false; buzz(20); });
      $('#val').onclick = () => { if (selOpt !== null) send({ t: 'answer', value: selOpt }); };
      const ff = $('#ff'); if (ff) ff.onclick = () => send({ t: 'joker', kind: 'fifty' });
    });
  };
  const numberUI = () => html(`<div class="qtext">${esc(ch.q.q)}</div><label class="f">Votre réponse (${esc(ch.q.u || 'nombre')})
      <input id="num" inputmode="decimal" autocomplete="off" placeholder="Ex : 1 234" data-auto="number"></label>
      <button class="btn" id="val">Valider ${timer}</button>`, () => { $('#val').onclick = () => submitAuto(); });

  if (ch.kind === 'dcc') {
    const mode = ch.modes[t.id];
    if (ch.stage === 'mode') {
      if (mode) return wait(`${{ duo: 'Duo', carre: 'Carré', cash: 'CASH' }[mode]} ! On attend les autres…`, mode === 'cash' ? '💰' : '👍');
      return html(`<h2>Duo, carré ou cash ?</h2><div class="qtext" style="color:var(--ink);font-size:20px">${esc(ch.q.q)}</div>
        <div class="dcc"><button class="btn alt" data-mode="duo"><b>Duo</b> 2 propositions · 1 pt</button>
        <button class="btn alt" data-mode="carre"><b>Carré</b> 4 propositions · 2 pts</button>
        <button class="btn" data-mode="cash"><b>CASH</b> sans filet · 4 pts</button></div><p class="msg">${timer}</p>`,
        () => main.querySelectorAll('[data-mode]').forEach(b => b.onclick = () => { buzz(40); send({ t: 'mode', mode: b.dataset.mode }); }));
    }
    if (answered) return wait('Réponse envoyée ! Croisez les doigts 🤞', '✅');
    if (mode === 'cash') return html(`<h2>💰 Cash : tapez la réponse</h2><div class="qtext" style="color:var(--ink);font-size:20px">${esc(ch.q.q)}</div>
      <input id="cash" autocomplete="off" autocapitalize="sentences" placeholder="Votre réponse" data-auto="cash"><button class="btn" id="val">C'est mon dernier mot ${timer}</button>`,
      () => { $('#val').onclick = () => submitAuto(); });
    return qcmUI({ only: mode === 'duo' ? ch.duo[t.id] : null, head: `<h2>${mode === 'duo' ? 'Duo · 1 pt' : 'Carré · 2 pts'}</h2>` });
  }
  if (ch.kind === 'series') {
    if (ch.stage === 'theme') {
      if (ch.teamId !== t.id) return wait(`${esc(team(ch.teamId).name)} choisit son menu… 🍔`, '🍔');
      return html(`<h1>Choisissez votre menu 🍔</h1><div class="teams">${ch.themes.map((th, i) => `<button class="teamBtn" data-th="${i}">${esc(th.name)}</button>`).join('')}</div><p class="msg">Trois questions pour tout le monde. ${timer}</p>`,
        () => main.querySelectorAll('[data-th]').forEach(b => b.onclick = () => send({ t: 'theme', i: Number(b.dataset.th) })));
    }
    if (ch.stage === 'video') return wait('Regardez bien la vidéo… 📺', '🎬');
    if (answered) return wait(ch.type === 'burger' && ch.i < 2 ? 'Envoyé ! Question suivante dans un instant…' : 'Réponse envoyée ! Croisez les doigts 🤞', '✅');
    if (ch.q.isNumber) return numberUI();
    return qcmUI({ head: `<h2>${ch.type === 'video' ? (ch.i ? 'Bonus · 1 pt' : 'Question') : `Question ${ch.i + 1} / 3 · ${esc(ch.theme || '')}`}</h2>` });
  }
  if (ch.kind === 'millions') {
    const mine = ch.teamId === t.id;
    if (!mine) return wait(`${esc(team(ch.teamId).name)} joue pour ${S.meta.ladder[ch.level] || ''} pts. Profitez du spectacle 🍿 (et chambrez)`, '💸');
    if (ch.stage === 'decide') return html(`<div class="center"><div class="big">💰 ${ch.bank}</div><h1>Bonne réponse !</h1>
      <p class="msg">Prochaine question : ${S.meta.ladder[ch.level]} pts. En cas d'erreur : ${ch.level > 1 ? S.meta.ladder[1] + ' pts' : 'zéro'}.</p>
      <button class="btn green" id="go">Je continue ! ${timer}</button><button class="btn alt" id="stop">Je m'arrête avec ${ch.bank} pt${ch.bank > 1 ? 's' : ''}</button></div>`,
      () => { $('#go').onclick = () => send({ t: 'decide', go: true }); $('#stop').onclick = () => send({ t: 'decide', go: false }); });
    if (answered) return wait('C\'est votre dernier mot… 🥁', '😬');
    return qcmUI({ head: `<h2>Question ${ch.level + 1} · ${S.meta.ladder[ch.level]} pt${S.meta.ladder[ch.level] > 1 ? 's' : ''}</h2>`, label: "C'est mon dernier mot" });
  }
  if (ch.kind === 'affiche') {
    if (answered) return wait('Réponse envoyée ! On verse les points à la fin.', '🎬');
    const k = Math.min(4, 1 + Math.floor(Math.max(0, gameNow(S) - ch.startsAt) / S.meta.timers.clue));
    return qcmUI({ head: `<h2 id="affpts">Répondez vite : ${5 - k} pts maintenant</h2>` });
  }
  if (ch.kind === 'qcm' || (ch.kind === 'duel' && ch.stage === 'q')) {
    if (!participant) return wait(`Duel en cours entre ${esc(team(ch.participants[0]).name)} et ${esc(team(ch.participants[1]).name)}`, '🍿');
    if (answered) return wait('Réponse envoyée ! Croisez les doigts 🤞', '✅');
    return qcmUI();
  }
  if (ch.kind === 'number') {
    if (answered) return wait('Nombre envoyé. Les maths vont trancher.', '🔢');
    return html(`<div class="qtext">${esc(ch.q.q)}</div><label class="f">Votre réponse (${esc(ch.q.u || 'nombre')})
      <input id="num" inputmode="decimal" autocomplete="off" placeholder="Ex : 1 234" data-auto="number"></label>
      <button class="btn" id="val">Valider ${timer}</button>`, () => { $('#val').onclick = () => submitAuto(); });
  }
  if (ch.kind === 'open') {
    if (ch.stage === 'write') {
      if (answered) return wait('Proposition envoyée. On espère que c\'est drôle.', '✍️');
      if (ch.q.words) {
        // Titre débile : un trou entre chaque mot, on écrit son mot dans UN seul trou
        const w = ch.q.words;
        return html(`<h2>Titre débile</h2><p class="msg">Glissez UN mot où vous voulez dans le titre.</p>
          <div class="tslots">${w.map((x, i) => `<input class="slot" data-pos="${i}" maxlength="30" autocomplete="off" autocapitalize="sentences" aria-label="Mot avant « ${esc(x)} »" data-auto="titre"><span>${esc(x)}</span>`).join('')}<input class="slot" data-pos="${w.length}" maxlength="30" autocomplete="off" autocapitalize="sentences" aria-label="Mot à la fin" data-auto="titre"></div>
          <div class="tpreview" id="tprev"></div>
          <button class="btn" id="val" disabled>Envoyer ${timer}</button>`, () => {
          const slots = [...main.querySelectorAll('.slot')];
          const sync = () => {
            const filled = slots.filter(x => x.value.trim());
            slots.forEach(x => { x.disabled = filled.length > 0 && !filled.includes(x); x.size = Math.max(2, x.value.length + 1); });
            const f = filled[0];
            $('#tprev').innerHTML = f ? [...w.slice(0, Number(f.dataset.pos)).map(esc), `<mark>${esc(f.value.trim())}</mark>`, ...w.slice(Number(f.dataset.pos)).map(esc)].join(' ') : '<span class="muted">Touchez un trou pour écrire votre mot</span>';
            $('#val').disabled = !f;
          };
          slots.forEach(x => x.oninput = sync); sync();
          $('#val').onclick = () => submitAuto();
        });
      }
      return html(`<div class="qtext" style="color:var(--ink);font-size:20px">${esc(ch.q.q)}</div>${ch.q.sub ? `<p class="msg">${esc(ch.q.sub)}</p>` : ''}<label class="f">${ch.type === 'titredebile' ? 'Votre titre débile' : ch.type === 'expression' ? 'Votre expression' : 'Votre réponse la plus drôle'}
        <textarea id="txt" rows="4" maxlength="140" placeholder="Lâchez-vous…" data-auto="open"></textarea></label>
        <button class="btn" id="val">Envoyer ${timer}</button>`, () => { $('#val').onclick = () => submitAuto(); });
    }
    if (ch.votes[t.id]) return wait('Vote enregistré. Vous avez du goût. Ou pas.', '🗳️');
    const others = Object.keys(ch.answers).filter(id => id !== t.id);
    if (!others.length) return wait('Personne d\'autre n\'a répondu, pas de vote pour vous.', '🤷');
    const txt = a => ch.q.words && a.w !== undefined ? [...ch.q.words.slice(0, a.ins).map(esc), `<mark>${esc(a.w)}</mark>`, ...ch.q.words.slice(a.ins).map(esc)].join(' ') : esc(a.v);
    return html(`<h1>Votez pour la meilleure</h1><p class="msg">${timer}</p><div class="opts">${others.map(id => `<button class="card" data-v="${id}">${txt(ch.answers[id])}</button>`).join('')}</div>`,
      () => main.querySelectorAll('[data-v]').forEach(b => b.onclick = () => send({ t: 'vote', teamId: b.dataset.v })));
  }
  if (ch.kind === 'bac') {
    if (ch.stage === 'review') return wait('L\'animateur corrige les copies… sans pitié.', '📝');
    if (answered) return wait('Copie rendue ! Stylos posés.', '📝');
    return html(`<div class="bigletter">${esc(ch.letter)}</div><p class="msg" style="text-align:center">Un mot par catégorie qui commence par ${esc(ch.letter)} ${timer}</p>
      ${ch.cats.map((c, i) => `<label class="f">${esc(c)}<input data-bac="${i}" autocomplete="off" autocapitalize="words" data-auto="bac"></label>`).join('')}
      <button class="btn" id="val">Rendre la copie</button>`, () => { $('#val').onclick = () => submitAuto(); });
  }
  if (ch.kind === 'bmc') {
    const black = ch.black.t, n = ch.black.n;
    if (ch.stage === 'judge') {
      return html(`<h1>Le maître du jeu choisit… 🃏</h1><p class="msg">${timer}</p><div class="opts">${(ch.entries || []).map(e => `<div class="bmc-black bmc-sm ${e.me ? 'mine' : ''}">${bmcSentence(black, e.parts)}${e.me ? '<small>← la vôtre</small>' : ''}</div>`).join('')}</div>`);
    }
    if (!ch.inGame) return wait('Arrivé en cours de route : pas de cartes pour celle-là. Profitez du spectacle 🍿', '🃏');
    if (ch.mine) return html(`<div class="center"><div class="big">🃏</div><h1>Carte jouée !</h1><div class="bmc-black bmc-sm">${bmcSentence(black, ch.mine)}</div><p class="msg">On attend les autres… ${timer}</p></div>`);
    const hand = S.bmcHand || [];
    return html(`<div class="bmc-black bmc-sm" id="bmcPrev">${bmcSentence(black, [])}</div>
      <p class="msg">${n > 1 ? `Touchez ${n} cartes, dans l'ordre des trous` : 'Touchez la carte qui complète le mieux'} · ${timer}</p>
      <div class="hand">${hand.map(c => `<button class="bmc-white hc" data-c="${c.i}"><span class="ord"></span>${esc(c.t)}</button>`).join('')}</div>
      <button class="btn" id="val" disabled>Jouer ${n > 1 ? 'ces cartes' : 'cette carte'}</button>`, () => {
      const upd = () => {
        main.querySelectorAll('.hc').forEach(b => { const k = bmcSel.indexOf(Number(b.dataset.c)); b.classList.toggle('sel', k >= 0); b.querySelector('.ord').textContent = n > 1 && k >= 0 ? k + 1 : ''; });
        $('#bmcPrev').innerHTML = bmcSentence(black, bmcSel.map(i => (hand.find(c => c.i === i) || {}).t));
        $('#val').disabled = bmcSel.length !== n;
      };
      main.querySelectorAll('.hc').forEach(b => b.onclick = () => {
        const i = Number(b.dataset.c), k = bmcSel.indexOf(i);
        if (k >= 0) bmcSel.splice(k, 1); else if (bmcSel.length < n) bmcSel.push(i); else bmcSel[n - 1] = i;
        buzz(20); upd();
      });
      $('#val').onclick = () => submitAuto();
      upd();
    });
  }
  if (ch.kind === 'buzz10') {
    if (ch.taps[t.id] !== undefined) return wait(ch.taps[t.id] === -1 ? 'FAUX DÉPART. Bravo les champions.' : 'Enregistré ! Verdict sur la télé.', ch.taps[t.id] === -1 ? '🤦' : '⏱️');
    const go = gameNow(S) >= ch.goAt;
    return html(`<div class="center"><h1>${go ? 'GO ! Appuyez à 10 secondes pile' : 'Attendez le GO…'}</h1>
      <button class="buzzer ${go ? 'go' : ''}" id="bz">${go ? 'STOP' : '…'}</button><p class="msg">${go ? 'Comptez dans votre tête 🤫' : 'Buzzer avant le GO = éliminé'}</p></div>`,
      () => $('#bz').onclick = () => { buzz(80); send({ t: 'buzz' }); });
  }
  if ((ch.kind === 'duel' || ch.kind === 'target') && ch.stage === 'pick') {
    const a = team(ch.teamId);
    if (a.id !== t.id) return wait(`${esc(a.name)} choisit sa victime… 😬`, ch.type === 'duel' ? '⚔️' : ch.type === 'vol' ? '🦹' : '🔄');
    const verb = ch.type === 'duel' ? 'Qui voulez-vous défier ?' : ch.type === 'vol' ? 'À qui voler 3 points ?' : 'Avec qui échanger votre place ?';
    return html(`<h1>${verb}</h1><p class="msg">${esc(ch.rule)} ${timer}</p><div class="teams">${S.teams.filter(x => x.id !== t.id).map(x => `<button class="teamBtn" data-pick="${x.id}">${dot(x.color)}${esc(x.name)}<span class="n">${x.score} pts · case ${x.pos}</span></button>`).join('')}</div>`,
      () => main.querySelectorAll('[data-pick]').forEach(b => b.onclick = () => send({ t: 'pick', teamId: b.dataset.pick })));
  }
  if (ch.kind === 'media') {
    if (ch.excluded.includes(t.id)) return wait('Grillés pour celle-là 🔥 Laissez les autres chercher.', '🙊');
    if (ch.stage === 'answer') return ch.buzzer === t.id ? wait('À VOUS ! Dites la réponse à voix haute 🎤', '🔔') : wait(`${esc(team(ch.buzzer).name)} a buzzé…`, '😱');
    const head = ch.media === 'text' ? `<h2>À l'endroit, ça donne… ?</h2><h1>« ${esc(ch.item.q || '')} »</h1>` : `<h1>${ch.media === 'image' ? 'Quel est cet artiste ?' : 'Écoutez bien…'}</h1>`;
    return html(`<div class="center">${head}<button class="buzzer" id="bz">BUZZ</button><p class="msg">${ch.media === 'text' ? 'Indices sur la télé 📺 · réponse à voix haute · ' : ''}${timer}</p></div>`,
      () => $('#bz').onclick = () => { buzz(200); send({ t: 'buzz' }); });
  }
  wait('Regardez la télé !', '👀');
}

function submitAuto() {
  const ch = S.ch; if (!ch) return;
  if (ch.kind === 'number' || (ch.q && ch.q.isNumber)) { const v = $('#num')?.value.trim(); if (v) send({ t: 'answer', value: v }); }
  if (ch.kind === 'dcc') { const v = $('#cash')?.value.trim(); if (v) send({ t: 'answer', value: v }); }
  if (ch.kind === 'open') {
    const slot = [...main.querySelectorAll('.slot')].find(x => x.value.trim());
    if (slot) return send({ t: 'answer', value: { pos: Number(slot.dataset.pos), word: slot.value.trim() } });
    const v = $('#txt')?.value.trim(); if (v) send({ t: 'answer', value: v });
  }
  if (ch.kind === 'bmc' && ch.stage === 'write' && ch.black && bmcSel.length === ch.black.n) send({ t: 'bmc', cards: bmcSel });
  if (ch.kind === 'bac') send({ t: 'answer', value: [...main.querySelectorAll('[data-bac]')].map(i => i.value) });
}

// ── Révélation ───────────────────────────────────────────────
const QUIPS_WIN = ['La classe à Dallas 😎', 'Même pas peur.', 'On vous soupçonne de tricher.', 'Énorme. Ou chance. Surtout chance.'];
const QUIPS_ZERO = ['Zéro. Pointé. 🥚', 'Vos parents auraient honte.', 'Au moins vous avez participé.', 'C\'est pas grave, c\'est que du jeu (si, c\'est grave).'];
function renderReveal() {
  const t = me(), ch = S.ch;
  const g = (ch && ch.gains && ch.gains[t.id]) || 0;
  const involved = ch && (ch.teamId === t.id || ch.target === t.id || (ch.participants || []).includes(t.id) || (ch.kind === 'bmc' && (ch.entries || []).some(e => e.teamId === t.id)));
  if (g > 0) buzz([60, 40, 60, 40, 200]);
  const quip = g > 0 ? QUIPS_WIN[S.round % QUIPS_WIN.length] : g < 0 ? 'Aïe. Ça pique.' : involved ? QUIPS_ZERO[S.round % QUIPS_ZERO.length] : 'Pas concernés cette fois. Profitez du spectacle 🍿';
  html(`<div class="center"><div class="gain ${g > 0 ? 'pos' : g < 0 ? 'neg' : 'zero'}">${g > 0 ? '+' : involved ? '' : '·'}${involved || g ? g : ''}</div>
    <h1>${quip}</h1>
    ${ch && ch.kind === 'bmc' && ch.entries && ch.entries[ch.winner] ? `<div class="bmc-black bmc-sm">${bmcSentence(ch.black.t, ch.entries[ch.winner].parts)}</div>` : ''}
    <p class="msg">${esc(ch && ch.summary || '')}</p><p class="msg">Suite sur la télé quand l'animateur aura fini de rire.</p></div>`);
}

function renderEnd() {
  const r = (S.ranking || []), pos = r.indexOf(me().id) + 1;
  html(`<div class="center"><div class="big">${pos === 1 ? '🏆' : pos === r.length ? '🥔' : '🎖️'}</div>
    <h1>${pos === 1 ? 'VICTOIRE ! Vous pouvez être insupportables.' : pos === r.length ? 'Derniers. Mais derniers avec panache.' : `${pos}e place. Ni honte, ni gloire.`}</h1>
    <p class="msg">${me().score} points</p></div>`);
}

// ── Feuilles : jokers et vannes ──────────────────────────────
$('#tabs').addEventListener('click', e => { const b = e.target.closest('[data-sheet]'); if (b) { sheet = b.dataset.sheet; renderSheet(); } });
$('#sheet').addEventListener('click', e => { if (e.target.id === 'sheet' || e.target.closest('.close')) closeSheet(); });
function closeSheet() { sheet = null; $('#sheet').classList.add('hidden'); }

function renderSheet() {
  const t = me(); if (!t) return closeSheet();
  const body = $('#sheetBody');
  $('#sheet').classList.remove('hidden');
  if (sheet === 'jokers') {
    const ch = S.ch;
    const can = {
      double: !t.armed.double, bouclier: !t.armed.shield, vol: true, blocage: true,
      relance: S.phase === 'rolled' && isMyTurn(),
      fifty: S.phase === 'challenge' && ch && ch.q && ch.q.o && ch.q.o.length === 4 && (!ch.participants || ch.participants.includes(t.id)) && ch.answers && ch.answers[t.id] === undefined
        && (ch.kind !== 'dcc' || (ch.stage === 'q' && ch.modes[t.id] === 'carre')) && (!['series', 'millions'].includes(ch.kind) || ch.stage === 'q')
    };
    const ingame = S.phase !== 'lobby' && S.phase !== 'end';
    body.innerHTML = `<h1>Vos jokers</h1><p class="msg">Chacun ne sert qu'une fois. Choisissez bien, ou n'importe comment.</p>` +
      Object.entries(S.meta.jokers).map(([k, j]) => {
        const st = !t.jokers[k] ? 'utilisé' : (k === 'double' && t.armed.double) || (k === 'bouclier' && t.armed.shield) ? 'armé ✓' : '';
        return `<button class="jk" data-jk="${k}" ${!t.jokers[k] || !can[k] || !ingame ? 'disabled' : ''}><span class="i">${j.icon}</span><span><b>${esc(j.label)}</b><span class="d">${esc(j.desc)}</span></span><span class="st">${st}</span></button>`;
      }).join('') + `<div id="jkTarget"></div>`;
    body.querySelectorAll('[data-jk]').forEach(b => b.onclick = () => {
      const k = b.dataset.jk;
      if (k === 'vol' || k === 'blocage') {
        $('#jkTarget').innerHTML = `<h2>${k === 'vol' ? 'Voler 3 points à…' : 'Bloquer…'}</h2><div class="teams">${S.teams.filter(x => x.id !== t.id).map(x => `<button class="teamBtn" data-tg="${x.id}">${dot(x.color)}${esc(x.name)}<span class="n">${x.score} pts</span></button>`).join('')}</div>`;
        $('#jkTarget').querySelectorAll('[data-tg]').forEach(x => x.onclick = () => { send({ t: 'joker', kind: k, target: x.dataset.tg }); closeSheet(); });
        $('#jkTarget').scrollIntoView({ behavior: 'smooth' });
        return;
      }
      if (confirm(`Utiliser le joker « ${S.meta.jokers[k].label} » ?`)) { send({ t: 'joker', kind: k }); closeSheet(); }
    });
  } else if (sheet === 'taunt') {
    const list = S.meta.taunts[tauntTab];
    body.innerHTML = `<h1>Chambrer 😈</h1>
      <div class="chips"><button class="chip ${tauntTo === 'all' ? 'on' : ''}" data-to="all">📢 Tout le monde</button>${S.teams.filter(x => x.id !== t.id).map(x => `<button class="chip ${tauntTo === x.id ? 'on' : ''}" data-to="${x.id}">${dot(x.color)}${esc(x.name)}</button>`).join('')}</div>
      <div class="chips"><button class="chip ${tauntTab === 'mean' ? 'on' : ''}" data-tab="mean">🔥 Méchant</button><button class="chip ${tauntTab === 'nice' ? 'on' : ''}" data-tab="nice">🥰 « Gentil »</button></div>
      <div class="tauntList">${list.map((x, i) => `<button data-tt="${i}">${esc(x)}</button>`).join('')}</div>
      <div class="row"><input id="custom" maxlength="120" placeholder="Ou écrivez la vôtre…"><button class="btn small" id="sendCustom" style="width:90px">Go</button></div>`;
    body.querySelectorAll('[data-to]').forEach(b => b.onclick = () => { tauntTo = b.dataset.to; renderSheet(); });
    body.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => { tauntTab = b.dataset.tab; renderSheet(); });
    const fire = text => { send({ t: 'taunt', to: tauntTo, text }); buzz(40); closeSheet(); toast($('#toasts'), { k: 'points', text: 'Envoyé. Assumez maintenant.' }, 2000); };
    body.querySelectorAll('[data-tt]').forEach(b => b.onclick = () => fire(list[Number(b.dataset.tt)]));
    $('#sendCustom').onclick = () => { const v = $('#custom').value.trim(); if (v) fire(v); };
  }
}

// ── Décompte avant chaque épreuve (visuel + vibration, le son vient de la télé)
const cdUpdate = countdown({ onTick: n => buzz(n ? 40 : 160) });
setInterval(() => { if (S) cdUpdate(S); }, 50);

// ── Chronos, auto-envoi, changements d'écran liés au temps ───
setInterval(() => {
  if (!S) return;
  const now = gameNow(S);
  document.querySelectorAll('[data-dl]').forEach(el => { const s = fmtSec(Number(el.dataset.dl) - now); el.textContent = `⏱ ${s} s`; });
  if (keyOf() !== screenKey) render();
  const ap = document.getElementById('affpts');
  if (ap && S.ch && S.ch.kind === 'affiche') { const k = Math.min(4, 1 + Math.floor(Math.max(0, now - S.ch.startsAt) / S.meta.timers.clue)); ap.textContent = `Répondez vite : ${5 - k} pt${k < 4 ? 's' : ''} maintenant`; }
  // envoi automatique de ce qui est tapé juste avant la fin du chrono
  const ch = S.ch, t = me();
  const pending = ch && t && ((ch.answers && ch.answers[t.id] === undefined && main.querySelector('[data-auto]')) || (ch.kind === 'bmc' && ch.stage === 'write' && !ch.mine && bmcSel.length));
  if (S.phase === 'challenge' && pending && ch.deadline - now < 1500) {
    const tag = ch.type + ch.cell + (S.move && S.move.n);
    if (autoSent !== tag) { autoSent = tag; submitAuto(); }
  }
}, 250);
