// ─────────────────────────────────────────────────────────────
//  Lit questions/*.json (à la racine du dépôt, PAS dans public/ : les réponses ne sont pas téléchargeables)
//  et fabrique src/questions-index.js, ajouté au contenu de src/content.js au démarrage du jeu.
//  Lancé automatiquement par Cloudflare à chaque déploiement, comme build-media.mjs.
//  Un fichier mal formé ou une entrée invalide est ignoré(e) avec un avertissement : le jeu se déploie quand même.
//  Les fichiers qui commencent par _ (exemples) sont ignorés. Le format de chaque fichier est dans questions/LISEZ-MOI.txt.
// ─────────────────────────────────────────────────────────────
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIR = join(ROOT, 'questions');
const OUT = join(ROOT, 'src', 'questions-index.js');

const warnings = [];
let where = '';
const warn = m => warnings.push(`  ⚠️  ${where} : ${m}`);
const str = v => typeof v === 'string' && v.trim() !== '';
const strs = v => Array.isArray(v) && v.every(str);

// QCM : { q, o: [2 à 4 propositions], a: index de la bonne (0 = la 1re), f?, k? }
function qcm(x, i, { needQ = true, n = [2, 4] } = {}) {
  const tag = `#${i + 1}`;
  if (!x || typeof x !== 'object') return warn(`${tag} : pas un objet { … }`), null;
  if (needQ && !str(x.q)) return warn(`${tag} : « q » (la question) manquant`), null;
  if (!strs(x.o) || x.o.length < n[0] || x.o.length > n[1]) return warn(`${tag} : « o » doit contenir ${n[0]} à ${n[1]} propositions`), null;
  const a = x.a === undefined ? 0 : x.a;
  if (!Number.isInteger(a) || a < 0 || a >= x.o.length) return warn(`${tag} : « a » doit être la position de la bonne réponse (0 à ${x.o.length - 1})`), null;
  const out = { q: x.q || undefined, o: x.o, a };
  if (str(x.f)) out.f = x.f;
  if (strs(x.k)) out.k = x.k;
  return out;
}
const list = (arr, fn) => { if (!Array.isArray(arr)) { warn('le fichier doit contenir une liste [ … ]'); return []; } return arr.map(fn).filter(Boolean); };

const READERS = {
  culture: d => list(d, (x, i) => qcm(x, i)),
  noix: d => list(d, (x, i) => qcm(x, i)),
  emojis: d => list(d, (x, i) => qcm(x, i)),
  mensonge: d => list(d, (x, i) => qcm(x, i, { needQ: false, n: [3, 3] })),
  plusoumoins: d => list(d, (x, i) => {
    if (!str(x.q) || typeof x.a !== 'number') return warn(`#${i + 1} : il faut « q » et « a » (un nombre)`), null;
    return { q: x.q, a: x.a, u: str(x.u) ? x.u : '', ...(str(x.f) ? { f: x.f } : {}) };
  }),
  contrario: d => list(d, (x, i) => {
    const answer = x.answer || x.reponse;
    const hints = x.hints || x.indices || [];
    if (!str(x.q) || !str(answer)) return warn(`#${i + 1} : il faut « q » (la phrase à l'envers) et « answer » (l'original)`), null;
    if (!strs(hints)) return warn(`#${i + 1} : « hints » doit être une liste de textes`), null;
    return { q: x.q, answer, hints: hints.slice(0, 2) };
  }),
  burger: d => list(d, (x, i) => {
    if (!str(x.name) || !Array.isArray(x.qs)) return warn(`#${i + 1} : il faut « name » et « qs » (3 questions)`), null;
    const qs = x.qs.map((q, k) => qcm(q, k)).filter(Boolean);
    if (qs.length < 1) return warn(`#${i + 1} « ${x.name} » : aucune question valide`), null;
    if (qs.length !== 3) warn(`#${i + 1} « ${x.name} » : ${qs.length} question(s) au lieu de 3`);
    return { name: x.name, qs, ...(x.taré || x.tare ? { taré: true } : {}) };
  }),
  millions: d => {
    if (!Array.isArray(d) || d.length !== 5 || !d.every(Array.isArray)) { warn('il faut une liste de 5 listes (niveau 1 à 5)'); return [[], [], [], [], []]; }
    return d.map((lvl, k) => { const w0 = where; where = `${w0} niveau ${k + 1}`; const r = lvl.map((x, i) => qcm(x, i)).filter(Boolean); where = w0; return r; });
  },
  doublesens: d => list(d, (x, i) => (str(x.a) && str(x.b) ? { a: x.a, b: x.b, ...(str(x.ex) ? { ex: x.ex } : {}) } : (warn(`#${i + 1} : il faut « a » et « b » (les deux situations)`), null))),
  titres: d => list(d, (x, i) => (str(x) ? x : (warn(`#${i + 1} : un titre doit être un texte`), null))),
  bac: d => {
    if (!d || typeof d !== 'object' || Array.isArray(d)) { warn('il faut un objet { "cats": [ … ] }'); return {}; }
    const out = {};
    if (d.cats !== undefined) { if (strs(d.cats)) out.cats = d.cats; else warn('« cats » doit être une liste de catégories'); }
    if (d.letters !== undefined) { if (str(d.letters)) out.letters = d.letters.toUpperCase().replace(/[^A-Z]/g, ''); else warn('« letters » doit être un texte, ex. "ABCDF"'); }
    return out;
  },
  bmc: d => {
    if (!d || typeof d !== 'object' || Array.isArray(d)) { warn('il faut un objet { "noires": [ … ], "blanches": [ … ] }'); return { noires: [], blanches: [] }; }
    const card = (x, i, kind) => {
      const c = typeof x === 'string' ? { t: x } : x;
      if (!c || !str(c.t)) return warn(`${kind} #${i + 1} : il faut « t » (le texte)`), null;
      if (kind === 'noires' && !/-{3,}/.test(c.t)) return warn(`noires #${i + 1} : pas de trou « ---- » dans « ${c.t} »`), null;
      return { t: c.t, ...(c.nsfw ? { nsfw: true } : {}) };
    };
    return { noires: (d.noires || []).map((x, i) => card(x, i, 'noires')).filter(Boolean), blanches: (d.blanches || []).map((x, i) => card(x, i, 'blanches')).filter(Boolean) };
  },
  videos: d => list(d, (x, i) => {
    if (!str(x.src) || !Array.isArray(x.qs) || !x.qs.length) return warn(`#${i + 1} : il faut « src » (la vidéo) et « qs » (les questions)`), null;
    const qs = x.qs.map((q, k) => (q && q.n !== undefined ? (str(q.q) && typeof q.n === 'number' ? { q: q.q, n: q.n, u: q.u || '', ...(str(q.f) ? { f: q.f } : {}) } : (warn(`#${i + 1} question ${k + 1} : il faut « q » et « n » (un nombre)`), null)) : qcm(q, k))).filter(Boolean);
    return { src: x.src, start: Number(x.start) || 0, stop: x.stop == null ? null : Number(x.stop), label: str(x.label) ? x.label : '', qs };
  }),
  unenote: d => list(d, (x, i) => (str(x.src) && str(x.answer) ? { src: x.src, answer: x.answer } : (warn(`#${i + 1} : il faut « src » et « answer »`), null)))
};
// culture-<thème>.json : { "label": "Manga", "q": [ QCM… ] }
const themeReader = d => {
  if (!d || typeof d !== 'object' || Array.isArray(d)) { warn('il faut un objet { "label": "…", "q": [ … ] }'); return null; }
  const q = list(d.q, (x, i) => qcm(x, i));
  return { label: str(d.label) ? d.label : '', q };
};

const extra = { themes: {} };
const counts = [];
if (existsSync(DIR)) {
  for (const f of readdirSync(DIR).sort()) {
    if (!f.endsWith('.json') || f.startsWith('_')) continue;
    const name = basename(f, '.json').toLowerCase();
    where = `questions/${f}`;
    let data;
    try { data = JSON.parse(readFileSync(join(DIR, f), 'utf8').replace(/^﻿/, '')); }
    catch (e) { warn(`JSON invalide, fichier ignoré (${e.message.split('\n')[0]})`); continue; }
    const th = name.match(/^culture-([a-z0-9-]+)$/);
    if (th) {
      const t = themeReader(data);
      if (t) { if (!t.label) t.label = th[1][0].toUpperCase() + th[1].slice(1); extra.themes[th[1]] = t; counts.push(`${name}: ${t.q.length}`); }
      continue;
    }
    if (!READERS[name]) { warn(`nom de fichier inconnu (attendus : ${Object.keys(READERS).join(', ')}, culture-<thème>)`); continue; }
    extra[name] = READERS[name](data);
    const n = name === 'millions' ? extra[name].reduce((a, l) => a + l.length, 0) : name === 'bmc' ? extra[name].noires.length + extra[name].blanches.length : name === 'bac' ? (extra[name].cats || []).length : extra[name].length;
    counts.push(`${name}: ${n}`);
  }
}

const content = `// FICHIER GÉNÉRÉ par scripts/build-questions.mjs à partir de questions/*.json : ne pas modifier à la main.
export const EXTRA = ${JSON.stringify(extra, null, 1)};
`;
if (!existsSync(OUT) || readFileSync(OUT, 'utf8') !== content) writeFileSync(OUT, content);
console.log(`❓ Questions ajoutées depuis questions/ → ${counts.length ? counts.join(' · ') : 'aucune'}`);
if (warnings.length) console.log(warnings.join('\n'));
