// Soirée : lancement par le MJ, pas de question répétée, Blanc Manger Coco (NSFW, sans chrono), rabbin, suite de la chanson
import * as G from '../src/game.js';
import { BMC, QCM } from '../src/content.js';
import { MEDIA_INDEX } from '../src/media-index.js';

let now = 1_700_000_000_000, seed = 11, ok = 0;
const rng = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
const fails = [];
const check = (c, m) => { if (c) ok++; else { fails.push(m); console.log('  ❌ ' + m); } };
const s = G.createGame('SOIR', now);
const send = (pid, m) => G.handle(s, m, { now, pid, rng });
const gm = m => G.handle(s, { t: 'host', ...m }, { now, host: true, gm: true, rng, online: Object.keys(s.players) });
for (const [pid, n] of [['a', 'Alpha'], ['b', 'Bravo']]) send(pid, { t: 'createTeam', name: n, player: pid.toUpperCase() });
send('c', { t: 'joinTeam', teamId: s.teams[0].id, player: 'C' });
gm({ action: 'start' });
const go = type => { gm({ action: 'goto', cell: G.BOARD.indexOf(type) }); };

// plateau
let same = 0; for (let i = 0; i < 32; i++) if (G.TYPES[G.BOARD[i]].group === G.TYPES[G.BOARD[(i + 1) % 32]].group) same++;
check(same === 0, 'plateau : jamais deux couleurs identiques côte à côte');
check(!G.BOARD.includes('affiche') && !G.BOARD.includes('instruments') && G.BOARD.filter(t => t === 'expression').length === 2 && G.TYPES.expression.label === 'Double Sens', 'Affiche mystère et Couche par couche retirées, Double Sens ×2');

// pas deux fois la même question
const n = QCM.noix.length, seen = new Set();
for (let k = 0; k < n; k++) { go('noix'); seen.add(s.ch.q.q); gm({ action: 'skip' }); gm({ action: 'next' }); }
check(seen.size === n, `À la noix : ${n} questions différentes sur ${n} passages`);
go('noix');
check(s.ch.fallback === 'noix' && s.ch.kind === 'qcm' && !QCM.noix.some(q => q.q === s.ch.q.q), 'banque épuisée → question de consolation, pas de répétition');
gm({ action: 'skip' }); gm({ action: 'next' });
go('mensonge'); const q1 = s.ch.q.o.join(); gm({ action: 'undo' });
check(s.phase === 'roll', 'annulation de l\'arrivée sur la case');
go('mensonge');
check(s.ch.q.o.join() !== q1, 'après une annulation, la question déjà tirée ne revient pas');
gm({ action: 'skip' }); gm({ action: 'next' });

// Blanc Manger Coco : pas de chrono, cartes visibles seulement quand tout le monde a joué
go('bmc'); gm({ action: 'launch' }); now = s.ch.startsAt;
check(s.ch.kind === 'bmc' && s.deadline === null && G.nextDeadline(s) === null, 'BMC : pas de chrono pendant que les joueurs choisissent');
const play = pid => { const v = G.view(s, { pid }); return send(pid, { t: 'bmc', cards: v.bmcHand.slice(0, s.ch.black.n).map(c => c.i) }); };
play('a'); play('b');
check(s.ch.stage === 'write' && !G.view(s, { role: 'tv' }).ch.entries, 'BMC : rien d\'affiché tant qu\'un joueur n\'a pas joué');
now += 600000; G.tick(s, now, rng);
check(s.ch.stage === 'write', 'BMC : on attend même 10 min');
play('c');
check(s.ch.stage === 'judge' && s.ch.entries.length === 3 && s.deadline === null, 'BMC : tout le monde a joué → cartes affichées, sans chrono');
now += 600000; G.tick(s, now, rng);
check(s.ch.stage === 'judge', 'BMC : le MJ prend le temps de choisir');
gm({ action: 'bmcPick', i: 0 });
check(s.phase === 'reveal', 'BMC : le MJ choisit la plus drôle');
gm({ action: 'next' });

// NSFW activé en cours de partie
const nsfwIn = pid => s.bmc.hands[pid].filter(i => BMC.blanches[i].nsfw).length;
check(['a', 'b', 'c'].every(p => nsfwIn(p) === 0), 'avant NSFW : aucune carte NSFW en main');
gm({ action: 'setNsfw', on: true });
check(['a', 'b', 'c'].every(p => nsfwIn(p) >= 2 && s.bmc.hands[p].length === G.BMC_HAND), 'NSFW activé en cours de partie : au moins 2 cartes NSFW dans chaque main, mains complètes');
let blackX = 0;
for (let k = 0; k < 4; k++) { go('bmc'); if (BMC.noires.find(c => c.t === s.ch.black.t).nsfw) blackX++; gm({ action: 'skip' }); gm({ action: 'next' }); }
check(blackX >= 2, `NSFW : les cartes noires NSFW sortent (${blackX}/4)`);
gm({ action: 'setNsfw', on: false });
check(['a', 'b', 'c'].every(p => nsfwIn(p) === 0), 'NSFW désactivé : plus aucune carte NSFW en main');

// rabbin
check(gm({ action: 'rabbi' }) !== null, 'rabbin : seulement en NSFW');
gm({ action: 'setNsfw', on: true });
check(gm({ action: 'rabbi' }) === null && s.rabbi.mode === 'dance', 'rabbin : il danse');
check(gm({ action: 'rabbi' }) === null && s.rabbi.mode === 'sit', 'rabbin : 2e appui, il s\'assoit');
gm({ action: 'setNsfw', on: false });
check(!s.rabbi, 'rabbin : disparaît sans NSFW');

// suite de la chanson
MEDIA_INDEX.bt_musique.push({ id: 't', src: '/media/musique/t.mp3', answer: 'Test' });
go('bt_musique'); gm({ action: 'launch' }); now = s.ch.startsAt + 1000;
send('a', { t: 'buzz' }); gm({ action: 'judge', ok: true });
check(s.phase === 'reveal' && !s.ch.outro, 'révélation : la chanson ne repart pas toute seule');
check(G.handle(s, { t: 'host', action: 'outro' }, { now, host: true, rng }) === null && s.ch.outro, 'la télé peut lancer la suite de la chanson');
check(gm({ action: 'outro' }) === null && !s.ch.outro, 'le MJ peut la couper');

// pause : temps cumulé
gm({ action: 'pause' }); now += 120000; gm({ action: 'resume' });
check(s.pausedMs === 120000, 'temps de pause cumulé (pour proposer une pause par heure de jeu)');

console.log(fails.length ? `❌ Soirée : ${fails.length} échec(s)` : `✅ Soirée : ${ok} vérifications OK`);
if (fails.length) process.exit(1);
