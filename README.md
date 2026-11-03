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

Seul l'écran qui a créé la partie peut l'animer ; une autre télé ouverte sur la même partie est simple spectatrice.

**Mode test** : on peut lancer la partie avec une seule équipe, ou sans aucune (une « Équipe Test » est créée). L'animateur peut lancer le dé depuis la télé (bouton « 🎲 Lancer le dé pour… »). Les cases Duel, Vol et Échange sont passées faute d'adversaire.

## Les cases (32)

Le plateau compte 32 cases, prévu pour 1,5 à 2 tours en 2 à 3 h avec 3 ou 4 équipes. La liste complète des questions et réponses est dans [`QUESTIONS.md`](QUESTIONS.md).

- **Questions** : Culture G en *Duo, carré ou cash* ×2 (thèmes qui tournent : général, manga, dessins animés, chanson française, chanson étrangère, chansons paillardes, ciné & séries) · À la noix · Emojis · Grand mensonge · A contrario · Plus ou moins · Sans réponse, Donne-moi l'expression ×2 et Titre débile (on écrit, puis on vote) · Le Bac · Burger Quiz (3 menus dont 1 taré) · Millionnaire (5 marches, on peut s'arrêter)
- **Blind tests** : actuel, intemporel, séries, films · N'oubliez pas les paroles · À l'envers · Réplique culte · Une seule note · Couche par couche (batterie, basse, etc.)
- **Visuel** : Pochette floutée · Affiche mystère (indices un par un) · Vidéo culte (la vidéo s'arrête, puis questions + bonus)
- **Buzzers** : Buzzer 10 s · Famille en or
- **Pièges** : Duel · Vol de points · Malédiction
- Repasser par **Départ** rapporte 2 pts. Sur les blind tests, l'animateur peut valider « ✓ + bonus » (+1) si l'équipe donne aussi l'année ou le réalisateur.

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
npm test           # simulation du moteur (toutes les cases, jokers, fin de partie)
npm run sim        # partie complète à 3 équipes contre le serveur local (wrangler dev doit tourner)
npm run questions  # régénère QUESTIONS.md depuis src/content.js
```

Structure :

- `src/game.js`: moteur de jeu pur (règles, points, chronos, jokers)
- `src/room.js`: Durable Object : une partie, ses WebSockets et ses alarmes
- `src/index.js`: Worker : création de partie, WebSocket, lien court du QR code
- `public/tv.html`, `public/js/tv.js`: écran télé
- `public/play.html`, `public/js/play.js`: manette téléphone
