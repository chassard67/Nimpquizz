// ─────────────────────────────────────────────────────────────
//  Lit public/media/<dossier>/ et fabrique src/media-index.js
//  Lancé automatiquement par Cloudflare à chaque déploiement (wrangler.jsonc → build.command)
//  et en local par `npm run dev` / `npm run media`.
//
//  Un élément = des fichiers qui portent le même nom :
//    Queen - Bohemian Rhapsody.mp3   l'extrait (mp3, m4a, ogg, wav)
//    Queen - Bohemian Rhapsody.jpg   l'image (jpg, jpeg, png, webp) : pochette floutée + affichée à la réponse
//    Queen - Bohemian Rhapsody.txt   la fiche (facultative) : réponse, bonus, mode oral ou QCM…
//  Sans fiche : la réponse est le nom du fichier, réponse à l'oral.
//  Les fichiers qui commencent par _ (exemples, brouillons) sont ignorés.
// ─────────────────────────────────────────────────────────────
import { readdirSync, readFileSync, writeFileSync, statSync, existsSync } from 'node:fs';
import { join, extname, basename, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const MEDIA = join(ROOT, 'public', 'media');
const OUT = join(ROOT, 'src', 'media-index.js');

// dossier → case du plateau
export const FOLDERS = {
  musique: { type: 'bt_musique', label: 'BT Musique' },
  cinema: { type: 'bt_ecrans', label: 'BT Séries & films' },
  'jeux-videos': { type: 'bt_jeux', label: 'BT Jeux vidéo' },
  citations: { type: 'replique', label: 'Réplique culte' }
};
const AUDIO = ['.mp3', '.m4a', '.ogg', '.wav', '.aac'];
const IMAGE = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

const warnings = [];
const warn = (f, m) => warnings.push(`  ⚠️  ${f} : ${m}`);

// Lit un .txt en UTF-8 (Bloc-notes récent) ou Windows-1252 (vieux Bloc-notes)
function readText(path) {
  const buf = readFileSync(path);
  let t;
  try { t = new TextDecoder('utf-8', { fatal: true }).decode(buf); }
  catch { t = new TextDecoder('windows-1252').decode(buf); }
  return t.replace(/^﻿/, '');
}

const KEYS = {
  reponse: 'answer', 'réponse': 'answer', bonus: 'bonus', mode: 'mode', question: 'question',
  propositions: 'options', choix: 'options', accepte: 'accept', 'accepté': 'accept', aussi: 'accept',
  debut: 'start', 'début': 'start', pochette: 'cover', image: 'cover', info: 'info', anecdote: 'info'
};
function parseFiche(text, file) {
  const out = {};
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const m = line.match(/^([^:=]+?)\s*[:=]\s*(.*)$/);
    if (!m) { warn(file, `ligne ignorée (pas de « clé : valeur ») : ${line}`); continue; }
    const key = KEYS[m[1].trim().toLowerCase()];
    if (!key) { warn(file, `clé inconnue « ${m[1].trim()} » (ignorée)`); continue; }
    out[key] = m[2].trim();
  }
  return out;
}
const split = s => String(s || '').split('|').map(x => x.trim()).filter(Boolean);
const yes = s => /^(oui|o|yes|y|1|vrai)$/i.test(String(s || '').trim());
const no = s => /^(non|n|no|0|faux)$/i.test(String(s || '').trim());
// "1:05" ou "65" → secondes
const secs = s => { const t = String(s || '').trim(); if (!t) return 0; const p = t.split(':').map(Number); return p.some(isNaN) ? 0 : p.reduce((a, v) => a * 60 + v, 0); };
const url = (folder, file) => '/media/' + encodeURIComponent(folder) + '/' + encodeURIComponent(file);

const index = {};
const counts = {};
for (const [folder, { type }] of Object.entries(FOLDERS)) {
  const dir = join(MEDIA, folder);
  index[type] = index[type] || [];
  if (!existsSync(dir)) continue;
  const groups = {};
  for (const f of readdirSync(dir).sort((a, b) => a.localeCompare(b, 'fr'))) {
    if (f.startsWith('_') || f.startsWith('.') || !statSync(join(dir, f)).isFile()) continue;
    const ext = extname(f).toLowerCase(), base = basename(f, extname(f));
    if (/^lisez-?moi$|^readme$/i.test(base)) continue;
    const g = groups[base] = groups[base] || { base };
    if (AUDIO.includes(ext)) g.audio = f;
    else if (IMAGE.includes(ext)) g.image = f;
    else if (ext === '.txt') g.txt = f;
    else warn(`${folder}/${f}`, 'format non pris en charge (ignoré)');
  }
  for (const g of Object.values(groups)) {
    const where = `${folder}/${g.base}`;
    if (!g.audio && !g.image) { warn(where, 'fiche .txt sans extrait ni image du même nom (ignorée)'); continue; }
    const fiche = g.txt ? parseFiche(readText(join(dir, g.txt)), `${folder}/${g.txt}`) : {};
    const item = {
      id: `${folder}/${g.base}`,
      answer: fiche.answer || g.base,
      folder
    };
    if (g.audio) item.src = url(folder, g.audio);
    if (g.image) item.cover = url(folder, g.image);
    if (fiche.bonus) item.bonus = fiche.bonus;
    if (fiche.info) item.info = fiche.info;
    if (fiche.start) item.start = secs(fiche.start);
    const mode = (fiche.mode || 'oral').toLowerCase();
    if (/qcm|carr|cash|duo|choix/.test(mode)) {
      const o = split(fiche.options);
      if (o.length < 2) warn(where, 'mode QCM mais moins de 2 propositions : passé en réponse orale');
      else {
        if (o.length !== 4) warn(where, `${o.length} propositions (4 conseillées ; le duo et le 50/50 ont besoin de 4)`);
        item.qcm = { q: fiche.question || '', o, a: 0 };
        const k = split(fiche.accept);
        if (k.length) item.qcm.k = k;
      }
    } else if (mode !== 'oral') warn(where, `mode « ${fiche.mode} » inconnu : réponse orale`);
    if (no(fiche.cover)) item.noCover = true;      // l'image n'ira pas dans « Pochette floutée »
    if (g.audio) index[FOLDERS[folder].type].push(item);
    // les images (sauf « pochette : non ») alimentent la case Pochette floutée
    if (g.image && !item.noCover) {
      const p = { id: item.id + '#img', img: item.cover, answer: item.answer, folder };
      if (item.bonus) p.bonus = item.bonus;
      if (item.info) p.info = item.info;
      if (item.qcm) p.qcm = item.qcm;
      (index.pochette = index.pochette || []).push(p);
    }
    counts[folder] = (counts[folder] || 0) + 1;
  }
}
index.pochette = index.pochette || [];

const content = `// FICHIER GÉNÉRÉ par scripts/build-media.mjs : ne pas modifier à la main.
// Il est refait à chaque déploiement à partir des dossiers de public/media/.
export const MEDIA_INDEX = ${JSON.stringify(index, null, 1)};
`;
// n'écrit que si ça a changé (évite de relancer le serveur local pour rien)
if (!existsSync(OUT) || readFileSync(OUT, 'utf8') !== content) writeFileSync(OUT, content);

const sum = Object.entries(index).map(([k, v]) => `${k}: ${v.length}`).join(' · ');
console.log(`🎵 Médias indexés → ${sum}`);
if (warnings.length) console.log(warnings.join('\n'));
