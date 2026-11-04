// Maître du jeu : pause, annulation, rejouer, corrections, vues (le MJ voit tout, les téléphones non)
import * as G from '../src/game.js';

let now = 1_700_000_000_000;
let seed = 99;
const rng = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
const fails = [];
const check = (cond, msg) => { if (!cond) { fails.push(msg); console.log('  ❌ ' + msg); } else ok++; };
let ok = 0;
const s = G.createGame('GMTS', now);
const send = (pid, msg) => G.handle(s, msg, { now, pid, rng });
const gm = msg => G.handle(s, { t: 'host', ...msg }, { now, host: true, gm: true, rng });
const tv = msg => G.handle(s, { t: 'host', ...msg }, { now, host: true, rng });
const wait = ms => { now += ms; G.tick(s, now, rng); };
const cellOf = type => G.BOARD.indexOf(type);

send('a', { t: 'createTeam', name: 'Alpha', player: 'A' });
send('b', { t: 'createTeam', name: 'Bravo', player: 'B' });
send('c', { t: 'createTeam', name: 'Charlie', player: 'C' });
const [A, Bt, C] = s.teams.map(t => t.id);
const pidOf = id => ({ [A]: 'a', [Bt]: 'b', [C]: 'c' })[id];
check(gm({ action: 'start' }) === null, 'le MJ peut lancer la partie');
check(send('a', { t: 'host', action: 'pause' }) !== null, 'un joueur ne peut pas jouer au MJ');

// ── goto réservé au MJ (ou mode test)
check(tv({ action: 'goto', cell: 3 }) !== null, 'goto refusé à la télé hors mode test');

// ── dé : valeur choisie, correction, relance
const act = () => s.teams[s.turn];
check(gm({ action: 'roll', value: 3 }) === null && s.move.roll === 3 && s.move.to === (act().pos + 3) % 32, 'lancer avec valeur choisie');
check(gm({ action: 'setRoll', value: 5 }) === null && s.move.roll === 5, 'corriger la valeur du dé');
check(gm({ action: 'reroll' }) === null && s.phase === 'rolled', 'relancer le dé');
check(gm({ action: 'forceCell', cell: cellOf('noix') }) === null, 'forcer la case');

// ── pause : chronos gelés, téléphones bloqués
gm({ action: 'next' });
now = s.ch.startsAt;
check(s.phase === 'challenge' && s.ch.type === 'noix', 'épreuve À la noix lancée');
const dl = s.deadline;
check(gm({ action: 'pause' }) === null && s.paused, 'pause');
check(send(pidOf(A), { t: 'answer', value: 0 }) !== null, 'réponse refusée pendant la pause');
check(G.nextDeadline(s) === null, 'aucun chrono pendant la pause');
now += 60000; G.tick(s, now, rng);
check(s.phase === 'challenge', 'le chrono ne tombe pas pendant la pause');
check(gm({ action: 'resume' }) === null && !s.paused && s.deadline === dl + 60000, 'reprise : chrono décalé de la durée de pause');

// ── effacer une réponse, écarter une équipe
send(pidOf(A), { t: 'answer', value: 0 });
check(send(pidOf(A), { t: 'answer', value: 1 }) !== null, 'pas de 2e réponse');
check(gm({ action: 'clearAnswer', teamId: A }) === null && s.ch.answers[A] === undefined, 'MJ efface une réponse');
check(send(pidOf(A), { t: 'answer', value: 1 }) === null, 'l\'équipe peut répondre à nouveau');
check(gm({ action: 'blockTeam', teamId: C, on: true }) === null && !s.ch.participants.includes(C), 'MJ écarte une équipe');
check(send(pidOf(C), { t: 'answer', value: 0 }) !== null, 'équipe écartée ne peut plus répondre');
check(gm({ action: 'blockTeam', teamId: C, on: false }) === null && s.ch.participants.includes(C), 'MJ réintègre l\'équipe');
gm({ action: 'blockTeam', teamId: C, on: true });

// ── vues : le MJ voit la réponse, pas les téléphones
const vg = G.view(s, { role: 'gm', host: true });
const vp = G.view(s, { pid: 'b' });
const vt = G.view(s, { role: 'tv', host: true });
check(vg.ch.q.a !== undefined && vg.ch.answers[A] && vg.ch.answers[A].v !== undefined, 'MJ voit bonne réponse et réponses des équipes');
check(vp.ch.q.a === undefined && vp.ch.answers[A].hidden, 'téléphone : réponses cachées');
check(vt.ch.q.a === undefined, 'télé : réponse cachée');
check(vg.hist.length > 0 && vg.hist[0].data === undefined && vp.hist === undefined && vp.chSnap === undefined && vg.chSnap === undefined, 'historique : libellés pour le MJ seulement, jamais les données');
check(Array.isArray(vg.roster) && vg.roster.length === 3 && !vp.roster, 'liste des joueurs pour le MJ seulement');

// ── rejouer l'épreuve : réponses et points effacés, même question
const qBefore = s.ch.q.q;
send(pidOf(Bt), { t: 'answer', value: s.ch.q.a });   // dernière réponse attendue → révélation
check(s.phase === 'reveal', 'révélation quand toutes les équipes actives ont répondu');
const scoreB = s.teams.find(t => t.id === Bt).score, gainB = s.ch.gains[Bt] || 0;
check(scoreB > 0, 'Bravo a marqué');
check(gm({ action: 'restart' }) === null && s.phase === 'challenge' && s.ch.q.q === qBefore && !Object.keys(s.ch.answers).length, 'rejouer : même question, réponses effacées');
check(gainB > 0 && s.teams.find(t => t.id === Bt).score === scoreB - gainB, 'rejouer : points de l\'épreuve retirés');
check(s.ch.participants.includes(C), 'rejouer : équipe écartée réintégrée');
check(s.ch.startsAt >= now, 'rejouer : nouveau délai d\'affichage');
gm({ action: 'newQuestion' });
check(s.phase === 'challenge' && s.ch.type === 'noix' && s.ch.q.q !== qBefore, 'autre question sur la même case');

// ── corrections d'équipe
check(gm({ action: 'setScore', teamId: A, value: 12 }) === null && s.teams.find(t => t.id === A).score === 12, 'fixer un score');
check(gm({ action: 'adjust', teamId: A, delta: -2 }) === null && s.teams.find(t => t.id === A).score === 10 && s.ch.gains[A] === -2 + (s.ch.gains[A] + 2), 'ajuster un score');
check(gm({ action: 'setSkip', teamId: C, n: 2 }) === null && s.teams.find(t => t.id === C).skip === 2, 'bloquer une équipe 2 tours');
check(gm({ action: 'setSkip', teamId: C, n: 0 }) === null && s.teams.find(t => t.id === C).skip === 0, 'débloquer');
check(gm({ action: 'setJoker', teamId: A, kind: 'vol', on: false }) === null && s.teams.find(t => t.id === A).jokers.vol === 0, 'retirer un joker');
check(gm({ action: 'setJoker', teamId: A, kind: 'vol', on: true }) === null && s.teams.find(t => t.id === A).jokers.vol === 1, 'rendre un joker');
check(gm({ action: 'setArmed', teamId: Bt, key: 'shield', on: true }) === null && s.teams.find(t => t.id === Bt).armed.shield, 'lever un bouclier');
check(gm({ action: 'setPos', teamId: Bt, cell: 7 }) === null && s.teams.find(t => t.id === Bt).pos === 7 && s.phase === 'challenge', 'déplacer un pion sans déclencher la case');
check(gm({ action: 'renameTeam', teamId: Bt, name: 'Bravo Bis' }) === null && s.teams.find(t => t.id === Bt).name === 'Bravo Bis', 'renommer');

// ── annuler : on revient en arrière pas à pas
const sc = () => s.teams.find(t => t.id === A).score;
check(gm({ action: 'undo' }) === null && s.teams.find(t => t.id === Bt).name === 'Bravo Bis', 'annuler : le nom de l\'équipe est conservé');
check(s.teams.find(t => t.id === Bt).pos !== 7, 'annuler le déplacement du pion');
for (let k = 0; k < 6; k++) gm({ action: 'undo' });
check(sc() === 12, 'annuler pas à pas : score revenu à 12');
gm({ action: 'undo' });
check(sc() !== 12, 'annuler le score fixé');

// ── retour à un point précis
const vh = G.view(s, { role: 'gm', host: true }).hist;
const target = vh.find(h => h.label.startsWith('Tour de'));
check(!!target, 'un point « Tour de… » existe');
check(gm({ action: 'restoreTo', id: target.id }) === null && s.phase === 'roll', 'revenir à un point précis (avant le lancer)');
check(!G.view(s, { role: 'gm', host: true }).hist.some(h => h.id >= target.id), 'les points suivants disparaissent');

// ── blind test : buzz, annuler le buzz, relancer, valider, puis annuler la validation
check(gm({ action: 'goto', cell: cellOf('bt_intemporel') }) === null && s.ch.kind === 'media', 'MJ envoie sur le blind test');
now = s.ch.startsAt + 1000;
check(send(pidOf(Bt), { t: 'buzz' }) === null && s.ch.stage === 'answer', 'buzz');
check(gm({ action: 'unbuzz' }) === null && s.ch.stage === 'play' && s.ch.buzzer === null, 'annuler le buzz');
const st = s.ch.startsAt;
now += 2000;
check(gm({ action: 'replay' }) === null && s.ch.replay === 1 && s.ch.startsAt > st, 'relancer l\'extrait');
now += 1000;
check(send(pidOf(Bt), { t: 'buzz' }) === null, 'on peut rebuzzer après la relance');
const before = s.teams.find(t => t.id === Bt).score;
check(gm({ action: 'judge', ok: true, bonus: true }) === null && s.phase === 'reveal' && s.teams.find(t => t.id === Bt).score === before + 3, 'bonne réponse + bonus');
check(gm({ action: 'undo' }) === null && s.phase === 'challenge' && s.ch.stage === 'answer' && s.teams.find(t => t.id === Bt).score === before, 'annuler la validation');
check(gm({ action: 'blockTeam', teamId: Bt, on: true }) === null && s.ch.stage === 'play' && s.ch.excluded.includes(Bt), 'écarter l\'équipe qui a buzzé');
check(gm({ action: 'addTime', sec: 30 }) === null, 'rallonge de 30 s');

// ── donner la main, choisir à la place des équipes
check(gm({ action: 'setTurn', teamId: C }) === null && act().id === C && s.phase === 'roll', 'donner la main');
gm({ action: 'goto', cell: cellOf('vol') }); now = s.ch.startsAt;
check(s.ch.stage === 'pick' && gm({ action: 'pick', teamId: A }) === null && s.phase === 'reveal', 'choisir la victime à la place de l\'équipe');
gm({ action: 'goto', cell: cellOf('burger') }); now = s.ch.startsAt;
check(s.ch.stage === 'theme' && gm({ action: 'theme', i: 0 }) === null && s.ch.stage === 'q', 'choisir le menu du Burger Quiz');
gm({ action: 'goto', cell: cellOf('millions') }); now = s.ch.startsAt;
send(pidOf(C), { t: 'answer', value: s.ch.q.a });
check(s.ch.stage === 'decide' && gm({ action: 'decide', go: false }) === null && s.phase === 'reveal', 'décider à la place (Millionnaire)');

// ── temps de partie
const end0 = s.endAt;
check(gm({ action: 'addGameTime', min: 15 }) === null && s.endAt === end0 + 15 * 60000, 'rallonger la partie');

// ── taille raisonnable de l'état sauvegardé
const size = JSON.stringify(s).length;
check(size < 1_500_000, `état sauvegardé raisonnable (${Math.round(size / 1024)} Ko)`);
check((s.hist || []).length <= 25, 'historique plafonné');

console.log(fails.length ? `\n❌ Maître du jeu : ${fails.length} échec(s), ${ok} OK` : `✅ Maître du jeu : ${ok} vérifications OK (état ${Math.round(size / 1024)} Ko)`);
if (fails.length) process.exit(1);
