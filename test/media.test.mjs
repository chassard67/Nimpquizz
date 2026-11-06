// Dossiers médias : fiches .txt (oral / QCM), indexation, cases du plateau, QCM avec son
import { mkdtempSync, mkdirSync, writeFileSync, cpSync, rmSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';

let ok = 0; const fails = [];
const check = (c, m) => { if (c) ok++; else { fails.push(m); console.log('  ❌ ' + m); } };

// 1) indexation sur une copie du projet avec de faux fichiers
const root = new URL('..', import.meta.url).pathname;
const tmp = mkdtempSync(join(tmpdir(), 'nq-'));
mkdirSync(join(tmp, 'scripts')); mkdirSync(join(tmp, 'src')); 
cpSync(join(root, 'scripts/build-media.mjs'), join(tmp, 'scripts/build-media.mjs'));
// seulement la structure et les exemples, pas les vrais fichiers déposés
cpSync(join(root, 'public/media'), join(tmp, 'public/media'), { recursive: true, filter: src => !/\.(mp3|m4a|ogg|wav|aac|jpe?g|png|webp|gif)$/i.test(src) && !(/\.txt$/i.test(src) && !/(_exemple|LISEZ-MOI)/i.test(src)) });
const M = join(tmp, 'public/media');
const put = (p, c = 'x') => writeFileSync(join(M, p), c);
put('musique/Village People - YMCA.mp3');                                    // sans fiche
put('musique/Queen - Bohemian Rhapsody.mp3'); put('musique/Queen - Bohemian Rhapsody.jpg');
put('musique/Queen - Bohemian Rhapsody.txt', '﻿réponse : Bohemian Rhapsody — Queen\r\nbonus : 1975\r\ndebut : 0:40\r\ninfo : Un opéra rock.\r\n');
put('cinema/Jurassic Park.mp3'); put('cinema/Jurassic Park.jpg');
put('cinema/Jurassic Park.txt', 'mode : qcm\nquestion : De quel film ?\npropositions : Jurassic Park | King Kong | Godzilla | Indiana Jones\npochette : non\nbonus : 1993\n');
writeFileSync(join(M, 'citations/Les Visiteurs.txt'), Buffer.from('reponse : Les Visiteurs\nbonus : Jean-Marie Poir\xe9\n', 'latin1')); // vieux Bloc-notes
put('citations/Les Visiteurs.mp3');
put('jeux-videos/Tetris.mp3');
put('jeux-videos/Mario.txt', 'mode : qcm\npropositions : Mario | Sonic\n');      // fiche sans son : ignorée
put('cinema/Titanic.png');                                                    // image seule hors pochettes/ : ignorée
put('pochettes/Michael Jackson.jpg');
put('pochettes/Daft Punk.png'); put('pochettes/Daft Punk.txt', 'bonus : Discovery (2001)\n');
const log = execFileSync('node', [join(tmp, 'scripts/build-media.mjs')], { encoding: 'utf8' });
const idx = (await import(join(tmp, 'src/media-index.js'))).MEDIA_INDEX;
rmSync(tmp, { recursive: true, force: true });

const mus = idx.bt_musique, cin = idx.bt_ecrans;
check(mus.length === 2 && cin.length === 1 && idx.bt_jeux.length === 1 && idx.replique.length === 1, 'chaque dossier va dans sa case');
const ymca = mus.find(x => /YMCA/.test(x.answer)), queen = mus.find(x => /Queen/.test(x.answer));
check(ymca && ymca.answer === 'Village People - YMCA' && !ymca.qcm, 'sans fiche : réponse = nom du fichier, à l\'oral');
check(queen.answer === 'Bohemian Rhapsody — Queen' && queen.bonus === '1975' && queen.start === 40 && queen.info && queen.cover, 'fiche UTF-8 avec BOM : réponse, bonus, début 0:40, anecdote, image');
check(queen.src === '/media/musique/Queen%20-%20Bohemian%20Rhapsody.mp3', 'noms avec espaces encodés dans l\'adresse');
const jp = cin[0];
check(jp.qcm && jp.qcm.o.length === 4 && jp.qcm.o[0] === 'Jurassic Park' && jp.qcm.q === 'De quel film ?', 'fiche QCM : question et 4 propositions, la bonne en premier');
check(idx.replique[0].bonus === 'Jean-Marie Poiré', 'fiche Windows-1252 (accents) lue correctement');
check(idx.pochette.length === 2 && idx.pochette.every(p => p.folder === 'pochettes') && idx.pochette.some(p => p.answer === 'Michael Jackson') && idx.pochette.find(p => p.answer === 'Daft Punk').bonus === 'Discovery (2001)', 'Pochette floutée : seulement le dossier pochettes/, réponse = nom du fichier');
check(/Titanic.*ignorée/.test(log), 'image hors pochettes/ sans son : signalée et ignorée');
check(/Mario.*sans extrait/.test(log), 'fiche sans fichier du même nom signalée');
check(!JSON.stringify(idx).includes('exemple'), 'fichiers _exemple ignorés');

// 2) en jeu : buzz à l'oral, et QCM avec le son
const { MEDIA_INDEX } = await import('../src/media-index.js');
for (const k of Object.keys(idx)) MEDIA_INDEX[k] = idx[k];
const G = await import('../src/game.js');
let now = 1_700_000_000_000, seed = 3;
const rng = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
const s = G.createGame('MEDI', now);
const send = (pid, m) => G.handle(s, m, { now, pid, rng });
const gm = m => G.handle(s, { t: 'host', ...m }, { now, host: true, gm: true, rng });
send('a', { t: 'createTeam', name: 'Alpha', player: 'A' }); send('b', { t: 'createTeam', name: 'Bravo', player: 'B' });
gm({ action: 'start' });
check(G.BOARD.filter(t => t === 'bt_musique').length === 2 && G.BOARD.includes('bt_jeux') && !G.BOARD.includes('bt_actuel') && !G.BOARD.includes('bt_intemporel') && G.BOARD.length === 32, 'plateau : 2 cases BT Musique, 1 BT Jeux vidéo, 32 cases');
gm({ action: 'goto', cell: G.BOARD.indexOf('bt_jeux') }); gm({ action: 'launch' }); now = s.ch.startsAt + 1000;
check(s.ch.kind === 'media' && s.ch.item.answer === 'Tetris', 'BT Jeux vidéo joue le fichier du dossier');
send('a', { t: 'buzz' }); gm({ action: 'judge', ok: true });
check(s.teams.find(t => t.name === 'Alpha').score === 2, 'buzz + validation : 2 pts');
gm({ action: 'goto', cell: G.BOARD.indexOf('bt_ecrans') }); gm({ action: 'launch' }); now = s.ch.startsAt;
check(s.ch.kind === 'media' && s.ch.media === 'audio' && s.ch.playMs === 30000 && s.deadline - now === 30000, 'blind test : 30 s d\'écoute maximum, on buzze d\'abord');
const A = s.teams.find(t => t.name === 'Alpha').id, Bv = s.teams.find(t => t.name === 'Bravo').id;
const scoreB = s.teams.find(t => t.id === Bv).score;
now += 3000; send('b', { t: 'buzz' });
gm({ action: 'judge', ok: true });
check(s.ch.kind === 'dcc' && s.ch.bonusQcm && s.ch.stage === 'mode' && s.ch.participants.length === 1 && s.ch.participants[0] === Bv, 'bonne réponse validée → question bonus pour l\'équipe qui a trouvé');
check(s.teams.find(t => t.id === Bv).score === scoreB + 2, 'les 2 pts du blind test sont acquis avant le bonus');
check(s.ch.q.o.length === 4 && s.ch.q.q === 'De quel film ?', 'la question bonus vient de la fiche');
check(send('a', { t: 'mode', mode: 'cash' }) !== null, 'les autres équipes ne jouent pas le bonus');
const vp = G.view(s, { pid: 'a' });
check(vp.ch.q.a === undefined && !vp.ch.item.qcm && vp.ch.item.answer === s.ch.item.answer, 'téléphone : le titre trouvé, mais pas la bonne réponse du bonus');
send('b', { t: 'mode', mode: 'carre' });
now = s.ch.startsAt;
send('b', { t: 'answer', value: s.ch.q.a });
check(s.phase === 'reveal' && s.teams.find(t => t.id === Bv).score === scoreB + 4 && /question bonus/.test(s.ch.summary), 'bonus réussi en carré : +2 (pas de +1 « équipe qui joue »)');
const pochette = idx.pochette.length;
gm({ action: 'goto', cell: G.BOARD.indexOf('pochette') }); gm({ action: 'launch' }); now = s.ch.startsAt;
check(s.ch.kind === 'media' && s.ch.media === 'image' && s.ch.item.img && s.ch.playMs === 20000, `Pochette floutée : images du dossier pochettes (${pochette}), 20 s maximum`);

console.log(fails.length ? `❌ Médias : ${fails.length} échec(s)` : `✅ Médias : ${ok} vérifications OK`);
if (fails.length) process.exit(1);
