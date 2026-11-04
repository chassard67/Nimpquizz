# 🎲 Le Grand N'importe Quiz

Jeu de plateau quiz / blind test pour soirées entre adultes de mauvaise foi.
La télé affiche le plateau et les épreuves ; chaque équipe joue depuis ses téléphones (dé, réponses, buzzer, jokers, vannes).

## Mettre en ligne sur Cloudflare

1. Dans le tableau de bord Cloudflare : **Workers & Pages → Créer → Importer un dépôt Git** → choisir `nimpquizz`.
2. Laisser la commande de build **vide**. Commande de déploiement : `npx wrangler deploy` (proposée par défaut).
3. Déployer. Cloudflare crée le Worker, les fichiers statiques et le Durable Object qui garde chaque partie en mémoire (offert sur le plan gratuit).
4. L'adresse est du type `https://nimpquizz.<ton-compte>.workers.dev`. Un domaine perso se branche dans les réglages du Worker.

Chaque `git push` sur `main` redéploie automatiquement.

## Jouer

1. Sur l'ordi branché à la télé : ouvrir l'adresse → **Créer une partie**. Le QR code et un code à 4 lettres s'affichent.
2. Chaque joueur scanne le QR code, crée ou rejoint une équipe (plusieurs téléphones par équipe, c'est prévu).
3. Choisir la durée, puis **Lancer la partie**. Quand le temps est écoulé, la manche en cours se termine et le podium s'affiche.

**Commandes animateur** (écran télé) : la barre en bas à droite propose l'action du moment (avancer, révéler, tour suivant, valider le Bac, juger un buzz). `Espace` déclenche l'action principale. Survoler une équipe permet de donner ou retirer 1 point à la main.

**Veille** : les téléphones et la télé restent allumés pendant la partie (Wake Lock, ou petite vidéo muette en boucle sur les vieux navigateurs). Si un bandeau jaune « Touchez l'écran… » apparaît, un toucher suffit. Si un téléphone a quand même été verrouillé, il se reconnecte tout seul en revenant sur la page.

Seul l'écran qui a créé la partie peut l'animer ; une autre télé ouverte sur la même partie est simple spectatrice.

**Mode test** : on peut lancer la partie avec une seule équipe, ou sans aucune (une « Équipe Test » est créée). L'animateur peut lancer le dé depuis la télé (bouton « 🎲 Lancer le dé pour… »). Pour tester une case précise, choisir **🧪 Aller à la case…** dans la barre animateur, ou cliquer directement sur une case du plateau : le pion y est téléporté et l'épreuve démarre. Les cases Duel, Vol et Échange sont passées faute d'adversaire.

## Maître du jeu (sur votre téléphone)

L'ordi reste branché à la télé (plateau, son, vidéos) ; le maître du jeu pilote tout depuis son téléphone.

1. Sur le téléphone : ouvrir `/gm` (lien « 🎩 Maître du jeu » en bas de l'accueil, l'adresse exacte est aussi affichée sur la télé dans la salle d'attente).
2. Saisir le code de la partie (4 lettres) et le **code secret** (`1234` par défaut). 5 erreurs = 1 minute de blocage.
3. Tant qu'un maître du jeu est connecté, la barre de commandes disparaît de la télé (les joueurs ne voient rien) ; « 🎩 MJ » s'affiche à côté de l'horloge.

**Changer le code secret** (conseillé, le dépôt est public) : Cloudflare → Workers & Pages → `nimpquizz` → Settings → Variables and Secrets → ajouter un **Secret** `GM_PIN` avec votre code. Il est conservé aux déploiements suivants.

Ce que voit et peut faire le maître du jeu :

- **En cours** : la **réponse attendue** (bonne réponse, bonus, toutes les questions d'un Burger Quiz / Millionnaire, carte noire du Blanc Manger Coco, lettre du Bac…), la réponse de chaque équipe en direct, et les actions du moment : lancer le dé à la place d'une équipe ou **choisir sa valeur**, relancer le dé, corriger la case d'arrivée, envoyer sur n'importe quelle case, donner la main à une autre équipe, valider ✓ / ✓ + bonus / ✗ un buzz, **annuler un buzz**, **relancer l'extrait** (ou reflouter la pochette), choisir la cible / le menu / « je continue » à la place d'une équipe, corriger le Bac, accepter ou refuser un cash, **choisir la carte la plus drôle** au Blanc Manger Coco, **effacer la réponse** d'une équipe (elle peut répondre à nouveau), **écarter ou réintégrer** une équipe de l'épreuve, +15 s / +30 s, révéler maintenant, passer, **rejouer l'épreuve** (même question, réponses et points remis à zéro) ou **autre question** sur la même case, ±1 pt après la révélation.
- **Équipes** : score (±1 ou valeur exacte), position du pion (sans déclencher la case), tours à passer (bloquer / débloquer), jokers (rendre / retirer), effets (×2, bouclier, ÷2), malédictions, renommer, joueurs (changer d'équipe, retirer).
- **🔞 Mode NSFW** (salle d'attente et onglet Partie) : désactivé par défaut, seules les cartes gentilles du Blanc Manger Coco sont distribuées. Activé, il ajoute les cartes de cul, sur la religion et l'humour limite (en cours de partie, 2 cartes de chaque main sont remplacées pour que ça se sente tout de suite). Le désactiver retire ces cartes des mains.
- **Partie** : ⏸ **pause** (chronos arrêtés, son coupé, téléphones bloqués), ±15 min de jeu, fin de partie, journal.
- **Historique** : chaque étape (lancer, épreuve, révélation) et chaque correction crée un point de retour. **↩️ Annuler la dernière étape** ou **Revenir ici** remet scores, pions, dé et épreuve comme ils étaient (25 derniers points gardés).

## Les cases (32)

Le plateau compte 32 cases, prévu pour 1,5 à 2 tours en 2 à 3 h avec 3 ou 4 équipes. La liste complète des questions et réponses est dans [`QUESTIONS.md`](QUESTIONS.md).

- **Questions** : Culture G en *Duo, carré ou cash* ×3 (thèmes qui tournent : général, manga, dessins animés, chanson française, chanson étrangère, chansons paillardes, ciné & séries) · À la noix · Emojis ×2 · Grand mensonge · A contrario · Plus ou moins · Donne-moi l'expression ×2 et Titre débile (on écrit, puis on vote) · Le Bac · Burger Quiz (3 menus dont 1 taré) · Millionnaire (5 marches, on peut s'arrêter)
- **Cartes** : Blanc Manger Coco ×2 (voir plus bas)
- **Blind tests** : actuel, intemporel, séries & films ×2 · Réplique culte · Une seule note · Couche par couche (batterie, basse, etc.)
- **Visuel** : Pochette floutée · Affiche mystère (indices un par un) · Vidéo culte (la vidéo s'arrête, puis questions + bonus)
- **Buzzer** : Buzzer 10 s
- **Pièges** : Duel · Vol de points · Échange de place
- Repasser par **Départ** rapporte 2 pts. Sur les blind tests, l'animateur peut valider « ✓ + bonus » (+1) si l'équipe donne aussi l'année ou le réalisateur.

**Décompte** : avant chaque question ou épreuve, la télé affiche un décompte de 2 secondes avec « bip, bip, BIP » (les téléphones l'affichent aussi et vibrent). Pas de décompte quand on choisit une cible, un menu ou duo/carré/cash, ni sur le Buzzer 10 s qui a le sien.

**Titre débile** : le téléphone affiche le titre avec un trou entre chaque mot (et au début, et à la fin). On écrit son mot dans UN seul trou ; la télé montre ensuite les titres avec le mot ajouté en surbrillance.

**Blanc Manger Coco** : chaque joueur a 5 cartes blanches sur son téléphone, gardées toute la partie (une carte jouée est remplacée). Une carte noire est tirée ; chacun choisit la carte qui la complète (deux cartes, dans l'ordre, si la carte noire a deux trous). Les propositions s'affichent sur la télé, anonymes, et le maître du jeu choisit la plus drôle : 2 pts pour l'équipe du joueur. Sans maître du jeu, l'animateur clique sur la carte gagnante à la télé. Les cartes sont dans `src/content.js` (`BMC`), `nsfw: true` = réservée au mode NSFW.

**Jokers** (une fois chacun, depuis le téléphone) : Points ×2, Relancer le dé, Voleur (3 pts), Blocage (l'équipe saute son tour), Bouclier, 50/50.

## Modifier le contenu

Tout est dans [`src/content.js`](src/content.js). Le jeu mélange l'ordre des propositions : on peut toujours écrire la bonne réponse en premier. Après une modification, `npm run questions` régénère `QUESTIONS.md`.

**Cases média** : les réponses sont déjà écrites, il ne manque que les fichiers. Déposer le fichier dans `public/media/` et remplacer `src: null` par son chemin :

```js
bt_actuel:   [{ src: '/media/flowers.mp3', answer: 'Flowers — Miley Cyrus', start: 30, bonus: '2023' }],
pochette:    [{ img: '/media/thriller.jpg', answer: 'Thriller — Michael Jackson' }],
instruments: [{ layers: ['/media/bj-batterie.mp3', '/media/bj-basse.mp3', '/media/bj-reste.mp3', '/media/bj-voix.mp3'], answer: 'Billie Jean' }],
video:       [{ src: '/media/midi.mp4', start: 12, stop: 19.5, label: '…', qs: [ /* questions */ ] }],
```

Tant qu'une case n'a aucun fichier, elle donne une question de Culture G « de consolation ». Pour « Couche par couche », les pistes séparées s'obtiennent avec un outil gratuit comme Demucs. Le son et la vidéo sortent de l'ordi relié à la télé.

## Développement

```bash
npm install
npm run dev        # http://localhost:8787
npm test           # simulation du moteur (toutes les cases, jokers, fin de partie) + actions du maître du jeu
npm run sim        # partie complète à 3 équipes contre le serveur local (wrangler dev doit tourner)
npm run questions  # régénère QUESTIONS.md depuis src/content.js
```

Structure :

- `src/game.js`: moteur de jeu pur (règles, points, chronos, jokers)
- `src/room.js`: Durable Object : une partie, ses WebSockets et ses alarmes
- `src/index.js`: Worker : création de partie, WebSocket, lien court du QR code
- `public/tv.html`, `public/js/tv.js`: écran télé
- `public/play.html`, `public/js/play.js`: manette téléphone
- `public/gm.html`, `public/js/gm.js`: téléphone du maître du jeu
