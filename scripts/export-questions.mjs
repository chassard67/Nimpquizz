// Génère QUESTIONS.md (fiche animateur) à partir de src/content.js
// Usage : npm run questions
import { writeFileSync } from 'node:fs';
import * as C from '../src/content.js';
import { BOARD, TYPES, LADDER } from '../src/game.js';

const L = 'ABCD';
const out = [];
const h = (t) => out.push(`\n## ${t}\n`);
const qcm = (q, n) => {
  const good = q.o[q.a];
  out.push(`${n}. ${q.q ? q.q : '_(Trouvez le mensonge)_'}`);
  out.push(`   - ${q.o.map(o => (o === good ? `**${o}** ✅` : o)).join(' · ')}`);
  if (q.f) out.push(`   - _${q.f}_`);
};
const count = (arr) => `${arr.length} question${arr.length > 1 ? 's' : ''}`;

out.push(`# Le Grand N'importe Quiz — questions et réponses`);
out.push(`\n> Fichier généré automatiquement depuis \`src/content.js\` (\`npm run questions\`). Ne pas modifier à la main : modifiez \`content.js\` puis relancez.`);
out.push(`> Dans le jeu, l'ordre des propositions est mélangé à chaque fois.`);

h('Le plateau (32 cases)');
out.push('| Case | Épreuve | Case | Épreuve |\n|---|---|---|---|');
for (let i = 0; i < 16; i++) out.push(`| ${i} | ${TYPES[BOARD[i]].label} | ${i + 16} | ${TYPES[BOARD[i + 16]].label} |`);

h(`Culture G — Duo, carré ou cash (${Object.values(C.CULTURE_THEMES).reduce((a, t) => a + t.q.length, C.QCM.culture.length)} questions)`);
out.push(`_${TYPES.culture.rule}_ Sert aussi de question de consolation pour les cases média pas encore remplies, et aux duels.`);
out.push(`\n### Général (${count(C.QCM.culture)})`);
C.QCM.culture.forEach((q, i) => qcm(q, i + 1));
for (const th of Object.values(C.CULTURE_THEMES)) { out.push(`\n### ${th.label} (${count(th.q)})`); th.q.forEach((q, i) => qcm(q, i + 1)); }

for (const [key, title, arr] of [['noix', 'Question à la noix', C.QCM.noix], ['emojis', 'Emojis', C.QCM.emojis]]) {
  h(`${title} (${count(arr)})`); out.push(`_${TYPES[key].rule}_\n`); arr.forEach((q, i) => qcm(q, i + 1));
}
h(`A contrario (${count(C.CONTRARIO)})`); out.push(`_${TYPES.contrario.rule}_\n`);
C.CONTRARIO.forEach((q, i) => out.push(`${i + 1}. « ${q.q} » → **${q.answer}** · indices : ${q.hints.join(' / ')}`));
h(`Le grand mensonge (${count(C.QCM.mensonge)})`); out.push(`_${TYPES.mensonge.rule}_\n`);
C.QCM.mensonge.forEach((q, i) => { out.push(`${i + 1}. ${q.o.map((o, k) => k === q.a ? `**${o}** ❌ MENSONGE` : o).join(' · ')}`); if (q.f) out.push(`   - _${q.f}_`); });

h(`Plus ou moins (${count(C.NUMBERS)})`); out.push(`_${TYPES.plusoumoins.rule}_\n`);
C.NUMBERS.forEach((q, i) => { out.push(`${i + 1}. ${q.q} → **${q.a.toLocaleString('fr-FR')} ${q.u}**`); if (q.f) out.push(`   - _${q.f}_`); });

h(`Affiche mystère (${count(C.AFFICHES)})`); out.push(`_${TYPES.affiche.rule}_\n`);
C.AFFICHES.forEach((q, i) => out.push(`${i + 1}. ${q.clues.map((c, k) => `${k + 1}) ${c}`).join(' · ')} → **${q.o[q.a]}**`));

h(`Burger Quiz (${C.BURGER.length} thèmes, ${C.BURGER.reduce((a, b) => a + b.qs.length, 0)} questions)`); out.push(`_${TYPES.burger.rule}_ À chaque case : 2 thèmes normaux + 1 thème taré (🤪).`);
C.BURGER.forEach(b => { out.push(`\n### ${b.taré ? '🤪 ' : ''}${b.name}`); b.qs.forEach((q, i) => qcm(q, i + 1)); });

h(`Qui veut gagner des millions (${C.MILLIONS.reduce((a, l) => a + l.length, 0)} questions sur 5 niveaux)`); out.push(`_${TYPES.millions.rule}_`);
C.MILLIONS.forEach((lvl, k) => { out.push(`\n### Niveau ${k + 1} — ${LADDER[k]} pt${LADDER[k] > 1 ? 's' : ''}`); lvl.forEach((q, i) => qcm(q, i + 1)); });

h(`Donne-moi l'expression (${C.DOUBLESENS.length + C.INVENTE.length} sujets, 2 cases)`); out.push(`_${TYPES.expression.rule}_ Les deux sortes de sujets tombent en alternance.\n`);
out.push('### Une phrase qui marche dans les deux situations');
C.DOUBLESENS.forEach((d, i) => out.push(`${i + 1}. À **${d.a}** et à **${d.b}**${d.ex ? ` _(ex. ${d.ex})_` : ''}`));
out.push('\n### Une expression pour définir…');
C.INVENTE.forEach((d, i) => out.push(`${i + 1}. ${d.q}${d.ex ? ` _(ex. ${d.ex})_` : ''}`));
h(`Titre débile (${count(C.TITRES)})`); out.push(`_${TYPES.titredebile.rule}_ Le téléphone affiche le titre avec un trou entre chaque mot (et au début, et à la fin) : on écrit son mot dans un seul trou. Ex. : Star Wars → Star Wars Zazat · Le Parrain → Le Parrain Charcutier.\n`);
C.TITRES.forEach((t, i) => out.push(`${i + 1}. ${t}`));

const nsfw = arr => arr.filter(c => c.nsfw).length;
h(`Blanc Manger Coco (${C.BMC.noires.length} cartes noires, ${C.BMC.blanches.length} cartes blanches)`);
out.push(`_${TYPES.bmc.rule}_ Chaque joueur garde 5 cartes blanches en main toute la partie (une carte jouée est remplacée). 🔞 = carte distribuée seulement si le maître du jeu active le mode NSFW.\n`);
out.push(`### Cartes noires (${C.BMC.noires.length - nsfw(C.BMC.noires)} gentilles, ${nsfw(C.BMC.noires)} 🔞)`);
C.BMC.noires.forEach((c, i) => out.push(`${i + 1}. ${c.nsfw ? '🔞 ' : ''}${c.t.replace(/-{3,}/g, '____')}`));
out.push(`\n### Cartes blanches (${C.BMC.blanches.length - nsfw(C.BMC.blanches)} gentilles, ${nsfw(C.BMC.blanches)} 🔞)`);
C.BMC.blanches.forEach((c, i) => out.push(`${i + 1}. ${c.nsfw ? '🔞 ' : ''}${c.t}`));

h('Le Bac'); out.push(`_${TYPES.bac.rule}_\n\nLettres : ${C.BAC.letters.split('').join(' ')}\n\nCatégories (5 tirées au hasard) : ${C.BAC.cats.join(' · ')}`);

const M = C.MEDIA;
const ready = arr => arr.filter(x => x.src || x.img || (x.layers && x.layers.length)).length;
h('Cases média : à préparer');
out.push(`Les réponses sont prêtes. Il ne manque que les fichiers : déposez-les dans \`public/media/\` et remplacez \`src: null\` par le chemin dans \`src/content.js\`. Tant qu'une case n'a aucun fichier, elle donne une question de Culture G.\n`);
out.push(`Bonus +1 : sur les blind tests, l'animateur peut valider « ✓ + bonus » si l'équipe donne en plus l'année ou le réalisateur (indiqués entre parenthèses).\n`);
for (const [key, title, field] of [['bt_actuel', 'Blind test — musique actuelle'], ['bt_intemporel', 'Blind test — musique intemporelle'], ['bt_ecrans', 'Blind test — séries & films (génériques et musiques de films)'], ['replique', 'Réplique culte'], ['pochette', 'Pochette floutée (images)'], ['unenote', 'Une seule note'], ['instruments', 'Couche par couche (pistes séparées)']]) {
  out.push(`\n### ${title} — ${ready(M[key])}/${M[key].length} fichiers prêts`);
  out.push(`_${TYPES[key].rule}_\n`);
  M[key].forEach((x, i) => out.push(`${i + 1}. ${x.answer}${x.bonus ? ` _(bonus : ${x.bonus})_` : ''}${x.src || x.img || (x.layers && x.layers.length) ? ' ✅' : ''}`));
}
out.push(`\n### Vidéos cultes — ${ready(M.video)}/${M.video.length} fichiers prêts`);
out.push(`_${TYPES.video.rule}_ Indiquer \`stop\` (en secondes) : la vidéo se fige à ce moment, puis les questions tombent ; elle reprend à la révélation.\n`);
M.video.forEach((v, i) => { out.push(`${i + 1}. **${v.label}**`); v.qs.forEach(q => out.push(`   - ${q.q} → **${q.n !== undefined ? q.n.toLocaleString('fr-FR') + ' ' + q.u : q.o[q.a]}**${q.f ? ` _(${q.f})_` : ''}`)); });

writeFileSync(new URL('../QUESTIONS.md', import.meta.url), out.join('\n') + '\n');
console.log('QUESTIONS.md généré');
