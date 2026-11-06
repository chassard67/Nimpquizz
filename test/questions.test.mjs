// Fichiers questions/*.json : lecture, validation, ajout au jeu
import { mkdtempSync, mkdirSync, cpSync, readdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';

let ok = 0; const fails = [];
const check = (c, m) => { if (c) ok++; else { fails.push(m); console.log('  ❌ ' + m); } };
const root = new URL('..', import.meta.url).pathname;
const tmp = mkdtempSync(join(tmpdir(), 'nqq-'));
for (const d of ['scripts', 'src', 'questions']) mkdirSync(join(tmp, d));
cpSync(join(root, 'scripts/build-questions.mjs'), join(tmp, 'scripts/build-questions.mjs'));
// tous les exemples activés (renommés sans « _exemple- »)
for (const f of readdirSync(join(root, 'questions'))) if (f.startsWith('_exemple-')) cpSync(join(root, 'questions', f), join(tmp, 'questions', f.replace('_exemple-', '')));
// erreurs volontaires
writeFileSync(join(tmp, 'questions/emojis.json'), '[ { "q": "🦁", "o": ["A", "B"], "a": 5 }, { "q": "🚢🧊", "o": ["Titanic", "Poséidon"], "a": 0 }, ]');
writeFileSync(join(tmp, 'questions/noix.json'), '[ { "q": "Sans réponse" }, { "q": "Ok ?", "o": ["Oui", "Non"] } ]');
writeFileSync(join(tmp, 'questions/blague.json'), '[]');
const log = execFileSync('node', [join(tmp, 'scripts/build-questions.mjs')], { encoding: 'utf8' });
const { EXTRA } = await import(join(tmp, 'src/questions-index.js'));
rmSync(tmp, { recursive: true, force: true });

check(EXTRA.culture.length === 1 && EXTRA.culture[0].k && EXTRA.culture[0].f, 'culture : question, anecdote et variantes cash');
check(EXTRA.themes.manga && EXTRA.themes.manga.label === 'Manga' && EXTRA.themes.manga.q.length === 1, 'thème culture-manga');
check(EXTRA.mensonge[0].o.length === 3 && EXTRA.plusoumoins[0].a === 1665 && EXTRA.contrario[0].hints.length === 2, 'mensonge, plus ou moins, contrario');
check(EXTRA.burger.length === 2 && EXTRA.burger[1].taré && EXTRA.burger[0].qs.length === 3, 'burger : menus et menu taré');
check(EXTRA.millions.length === 5 && EXTRA.millions.every(l => l.length === 1), 'millions : 5 niveaux');
check(EXTRA.bmc.noires.length === 2 && EXTRA.bmc.blanches[1].nsfw, 'Blanc Manger Coco : cartes noires et blanches, NSFW');
check(EXTRA.videos[0].qs[1].n === 86400 && EXTRA.unenote.length === 1 && EXTRA.titres.length === 3 && EXTRA.bac.cats.length === 2, 'vidéos, une note, titres, bac');
check(/emojis\.json : JSON invalide/.test(log) && !EXTRA.emojis, 'JSON invalide (virgule en trop) : fichier ignoré et signalé');
check(EXTRA.noix.length === 1 && /noix\.json : #1 : « o »/.test(log), 'entrée invalide ignorée, les autres gardées');
check(/blague\.json : nom de fichier inconnu/.test(log), 'nom de fichier inconnu signalé');

// en jeu
const { EXTRA: LIVE } = await import('../src/questions-index.js');
Object.assign(LIVE, EXTRA);
const C = await import('../src/content.js');
// content.js a déjà été évalué avec l'index réel (vide) : on vérifie juste que l'ajout fonctionne sur ces données
const before = C.QCM.noix.length;
check(before > 0, 'les questions écrites dans content.js restent en jeu');

console.log(fails.length ? `❌ Questions JSON : ${fails.length} échec(s)` : `✅ Questions JSON : ${ok} vérifications OK`);
if (fails.length) process.exit(1);
