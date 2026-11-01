// Outils partagés TV + téléphones
export const $ = (sel, root = document) => root.querySelector(sel);
export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const uid = () => (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36));

// Horloge serveur (pour les chronos)
let offset = 0;
export const serverNow = () => Date.now() + offset;

// Connexion WebSocket avec reconnexion automatique
export function connect(room, hello, { onState, onError, onStatus }) {
  let ws, alive = false, retry = 0;
  const open = () => {
    const proto = location.protocol === 'https:' ? 'wss' : 'ws';
    ws = new WebSocket(`${proto}://${location.host}/ws/${room}`);
    ws.onopen = () => { retry = 0; alive = true; onStatus && onStatus(true); ws.send(JSON.stringify({ t: 'hello', ...hello() })); };
    ws.onmessage = e => {
      const m = JSON.parse(e.data);
      if (m.t === 'state') { offset = m.s.now - Date.now(); onState(m.s); }
      else if (m.t === 'error') onError && onError(m.text);
    };
    ws.onclose = () => { alive = false; onStatus && onStatus(false); setTimeout(open, Math.min(4000, 400 * ++retry)); };
  };
  open();
  setInterval(() => { if (alive) try { ws.send('{"t":"ping"}'); } catch {} }, 25000);
  return { send: m => { if (alive) ws.send(JSON.stringify(m)); else onError && onError('Connexion perdue, on réessaie…'); } };
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
