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

## Les cases (26)

Départ · Culture G ×2 · À la noix · Emojis · Grand mensonge · Plus ou moins · Sans réponse (on vote) · Le Bac · Famille en or · Buzzer 10 s · Duel · Vol de points ×2 · Échange de place · Malédiction · Blind tests (actuel ×2, intemporel ×2, séries, films) · N'oubliez pas les paroles · À l'envers · Réplique culte · Pochette floutée.

**Jokers** (une fois chacun, depuis le téléphone) : Points ×2, Relancer le dé, Voleur (3 pts), Blocage (l'équipe saute son tour), Bouclier, 50/50.

## Modifier le contenu

Tout est dans [`src/content.js`](src/content.js) : questions, sondages, catégories du Bac, malédictions, vannes, noms d'équipes.

**Blind tests et pochettes** (à remplir) : déposer les fichiers dans `public/media/` puis les déclarer dans `MEDIA` :

```js
bt_actuel: [{ src: '/media/titre.mp3', answer: 'Titre — Artiste', start: 30 }],
pochette:  [{ img: '/media/album.jpg', answer: 'Album — Artiste' }],
```

Tant qu'une liste est vide, la case donne une question de Culture G « de consolation ». Le son sort de l'ordi relié à la télé ; le premier qui buzze coupe la musique, l'animateur valide ✓ ou ✗.

## Développement

```bash
npm install
npm run dev        # http://localhost:8787
npm test           # simulation du moteur (toutes les cases, jokers, fin de partie)
npm run sim        # partie complète à 3 équipes contre le serveur local (wrangler dev doit tourner)
```

Structure :

- `src/game.js`: moteur de jeu pur (règles, points, chronos, jokers)
- `src/room.js`: Durable Object : une partie, ses WebSockets et ses alarmes
- `src/index.js`: Worker : création de partie, WebSocket, lien court du QR code
- `public/tv.html`, `public/js/tv.js`: écran télé
- `public/play.html`, `public/js/play.js`: manette téléphone
