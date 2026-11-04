// Outils partagés TV + téléphones
export const $ = (sel, root = document) => root.querySelector(sel);
export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const uid = () => (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36));

// Horloge serveur (pour les chronos)
let offset = 0;
export const serverNow = () => Date.now() + offset;
// Heure du jeu : figée pendant une pause (les chronos et les indices ne défilent plus)
export const gameNow = S => (S && S.paused ? S.paused.at : Date.now() + offset);

// Connexion WebSocket avec reconnexion automatique
export function connect(room, hello, { onState, onError, onStatus, onDenied }) {
  let ws, alive = false, retry = 0, lastMsgAt = 0;
  const open = () => {
    const proto = location.protocol === 'https:' ? 'wss' : 'ws';
    ws = new WebSocket(`${proto}://${location.host}/ws/${room}`);
    ws.onopen = () => { retry = 0; alive = true; onStatus && onStatus(true); ws.send(JSON.stringify({ t: 'hello', ...hello() })); };
    ws.onmessage = e => {
      lastMsgAt = Date.now();
      const m = JSON.parse(e.data);
      if (m.t === 'state') { offset = m.s.now - Date.now(); onState(m.s); }
      else if (m.t === 'error') onError && onError(m.text);
      else if (m.t === 'denied') onDenied && onDenied(m.text);
    };
    ws.onclose = () => { alive = false; onStatus && onStatus(false); clearTimeout(timer); timer = setTimeout(open, Math.min(4000, 400 * ++retry)); };
  };
  let timer;
  open();
  setInterval(() => { if (alive) try { ws.send('{"t":"ping"}'); } catch {} }, 25000);
  // Retour au premier plan / réseau revenu : on reconnecte tout de suite au lieu d'attendre
  const revive = () => {
    if (document.visibilityState !== 'visible') return;
    if (!ws || ws.readyState === WebSocket.CLOSED || ws.readyState === WebSocket.CLOSING) { clearTimeout(timer); retry = 0; open(); }
    else if (ws.readyState === WebSocket.OPEN) {
      // on redemande l'état à jour ; sans réponse sous 3 s, la connexion est « zombie » (après une veille) : on repart à zéro
      const t0 = Date.now(), dead = ws;
      try { dead.send(JSON.stringify({ t: 'hello', ...hello() })); } catch {}
      setTimeout(() => {
        if (ws !== dead || lastMsgAt >= t0) return;
        dead.onclose = null; try { dead.close(); } catch {}
        alive = false; onStatus && onStatus(false); clearTimeout(timer); retry = 0; open();
      }, 3000);
    }
  };
  document.addEventListener('visibilitychange', revive);
  addEventListener('online', revive);
  addEventListener('pageshow', revive);
  return {
    send: m => { if (alive) ws.send(JSON.stringify(m)); else onError && onError('Connexion perdue, on réessaie…'); },
    hello: () => { if (alive) ws.send(JSON.stringify({ t: 'hello', ...hello() })); }
  };
}

// ── Écran toujours allumé (téléphones et télé)
// 1) API Screen Wake Lock (Chrome/Android, Safari iOS ≥ 16.4), redemandée à chaque retour sur la page
// 2) sinon, petite vidéo noire muette en boucle (même astuce que NoSleep.js) pour les vieux navigateurs
// Les navigateurs exigent un geste de l'utilisateur : on s'accroche au premier toucher.
export function keepAwake({ onChange } = {}) {
  let lock = null, video = null, on = false;
  const set = v => { if (v !== on) { on = v; onChange && onChange(on); } };
  const useVideo = () => {
    if (!video) {
      video = document.createElement('video');
      video.setAttribute('playsinline', ''); video.setAttribute('muted', ''); video.muted = true; video.loop = true;
      video.style.cssText = 'position:fixed;width:1px;height:1px;opacity:0;pointer-events:none;left:0;top:0';
      for (const [src, type] of [['/vendor/keepawake.webm', 'video/webm'], ['/vendor/keepawake.mp4', 'video/mp4']]) {
        const s = document.createElement('source'); s.src = src; s.type = type; video.appendChild(s);
      }
      document.body.appendChild(video);
    }
    video.play().then(() => set(true)).catch(() => set(false));
  };
  const request = async () => {
    if (document.visibilityState !== 'visible') return;
    if ('wakeLock' in navigator) {
      if (lock && !lock.released) return set(true);
      try {
        lock = await navigator.wakeLock.request('screen');
        set(true);
        lock.addEventListener('release', () => { set(false); setTimeout(request, 1000); });
        return;
      } catch { /* refusé (économie d'énergie, onglet caché…) : on tente la vidéo */ }
    }
    useVideo();
  };
  document.addEventListener('visibilitychange', request);
  addEventListener('pageshow', request);
  for (const ev of ['click', 'touchend', 'keydown']) addEventListener(ev, request, { passive: true });
  request();
  return { get on() { return on; } };
}

const FACES = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };
export function dieHTML(n, cls = '') {
  const on = FACES[n] || [];
  return `<div class="die ${cls}">${Array.from({ length: 9 }, (_, i) => `<i class="${on.includes(i) ? 'on' : ''}"></i>`).join('')}</div>`;
}

export function toast(container, { k = 'info', text, from }, ms = 5000) {
  const el = document.createElement('div');
  el.className = 'toast ' + k;
  el.innerHTML = (from ? `<span class="from">${esc(from)}</span>` : '') + esc(text);
  container.appendChild(el);
  setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 450); }, ms);
  while (container.children.length > 4) container.firstChild.remove();
}

export const fmtSec = ms => Math.max(0, Math.ceil(ms / 1000));
export const LETTERS = ['A', 'B', 'C', 'D'];
export const OPT_COLORS = ['#FFD23F', '#FF6B9D', '#3EE0A0', '#5AB0FF'];

// ── Petits effets sonores synthétisés (aucun fichier à charger)
let ac;
export function audioUnlock() { try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); ac.resume(); } catch {} }
function tone(freq, dur, type = 'square', vol = .15, when = 0, slide) {
  if (!ac) return;
  const t = ac.currentTime + when, o = ac.createOscillator(), g = ac.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.001, t + dur);
  o.connect(g).connect(ac.destination); o.start(t); o.stop(t + dur);
}
export const sfx = {
  buzz: () => { tone(140, .5, 'square', .25); tone(147, .5, 'sawtooth', .15); },
  tick: () => tone(1200, .05, 'square', .08),
  dice: () => { for (let i = 0; i < 8; i++) tone(300 + Math.random() * 600, .04, 'square', .07, i * .07); },
  win: () => [523, 659, 784, 1046].forEach((f, i) => tone(f, .25, 'triangle', .2, i * .11)),
  fail: () => [392, 370, 349, 330].forEach((f, i) => tone(f, i === 3 ? .7 : .3, 'sawtooth', .12, i * .3, i === 3 ? 260 : undefined)),
  ding: () => tone(880, .4, 'sine', .2),
  curse: () => { tone(110, 1.2, 'sawtooth', .2, 0, 55); tone(116, 1.2, 'square', .1, 0, 58); },
  taunt: () => { tone(600, .08, 'square', .1); tone(900, .1, 'square', .1, .09); }
};
