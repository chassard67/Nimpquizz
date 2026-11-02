// ─────────────────────────────────────────────────────────────
//  LE GRAND N'IMPORTE QUIZ — contenu
//  Tout le contenu du jeu est ici. Ajoute / modifie librement.
//  QCM : o = options, a = index de la bonne réponse (0 = première), f = anecdote affichée à la révélation
// ─────────────────────────────────────────────────────────────

export const QCM = {
  culture: [
    { q: "Quelle est la capitale de l'Australie ?", o: ["Sydney", "Canberra", "Melbourne", "Kangourou-City"], a: 1, f: "Sydney et Melbourne se disputaient le titre. Résultat : on a construit une troisième ville. Diplomatie australienne." },
    { q: "Combien de cœurs a une pieuvre ?", o: ["Un seul", "Deux", "Trois", "Aucun, c'est une ex"], a: 2, f: "Trois cœurs, et pourtant elle ne vous rappellera jamais." },
    { q: "Quel pays a offert la statue de la Liberté aux États-Unis ?", o: ["La France", "Le Royaume-Uni", "L'Espagne", "Amazon Prime"], a: 0, f: "On leur a offert la Liberté, ils nous ont renvoyé McDo. Échange équitable." },
    { q: "En quelle année l'Homme a-t-il marché sur la Lune (officiellement, hein) ?", o: ["1965", "1969", "1972", "Jamais, c'était tourné à Hollywood"], a: 1, f: "Juillet 1969. Ton oncle complotiste n'est pas d'accord, mais ton oncle croit aussi que la Terre est plate." },
    { q: "Quel est l'os le plus long du corps humain ?", o: ["Le fémur", "Le tibia", "L'humérus", "Celui du matin"], a: 0, f: "Le fémur. L'autre n'est pas un os, désolé messieurs." },
    { q: "Quelle planète est surnommée la planète rouge ?", o: ["Vénus", "Jupiter", "Mars", "Celle de ton coup de soleil"], a: 2, f: "Mars, rouge à cause de l'oxyde de fer. Elle rouille, comme ton couple." },
    { q: "Qui a peint La Joconde ?", o: ["Michel-Ange", "Léonard de Vinci", "Raphaël", "Un stagiaire non rémunéré"], a: 1, f: "Léonard de Vinci. Il l'a trimballée pendant des années sans jamais la finir. Un vrai procrastinateur." },
    { q: "Combien de joueurs par équipe sur le terrain au rugby à XV ?", o: ["11", "13", "15", "Ça dépend des blessés"], a: 2, f: "15. C'était écrit dans la question. On vous regarde." },
    { q: "Quel est le plus grand océan du monde ?", o: ["Atlantique", "Indien", "Arctique", "Pacifique"], a: 3, f: "Le Pacifique, qui couvre à lui seul environ un tiers de la planète." },
    { q: "Quelle est la langue maternelle la plus parlée au monde ?", o: ["L'anglais", "L'espagnol", "Le mandarin", "Le ch'ti"], a: 2, f: "Le mandarin. En nombre total de locuteurs, l'anglais passe devant. Le ch'ti, lui, reste dans le Nord." },
    { q: "Dans quel pays se trouve le Machu Picchu ?", o: ["Mexique", "Pérou", "Bolivie", "Chili"], a: 1, f: "Au Pérou, à près de 2 500 m d'altitude. Prévoyez des mollets." },
    { q: "Combien de pattes a une araignée ?", o: ["Six", "Huit", "Dix", "Trop"], a: 1, f: "Huit pattes. Et toutes les huit courent vers ton lit." },
    { q: "Qui a écrit Les Misérables ?", o: ["Émile Zola", "Honoré de Balzac", "Victor Hugo", "Marc Lévy"], a: 2, f: "Victor Hugo. Marc Lévy, lui, a écrit des trucs qu'on lit à la plage." },
    { q: "Quel est le symbole chimique de l'or ?", o: ["Or", "Au", "Ag", "Bling"], a: 1, f: "Au, du latin aurum. Ag c'est l'argent, pour ceux qui ont paniqué." },
    { q: "Quel est l'animal terrestre le plus rapide ?", o: ["Le lion", "Le guépard", "L'antilope", "Ton ex quand tu parles d'engagement"], a: 1, f: "Le guépard, plus de 100 km/h en pointe. Ton ex, c'est hors catégorie." },
    { q: "En France, combien d'années dure un mandat présidentiel ?", o: ["4 ans", "5 ans", "7 ans", "Jusqu'à ce que le peuple craque"], a: 1, f: "5 ans depuis 2002. Avant c'était 7, il fallait être patient." },
    { q: "Quel est le plus petit État du monde ?", o: ["Monaco", "Le Vatican", "Andorre", "Le studio de ton cousin à Paris"], a: 1, f: "Le Vatican, environ 0,44 km². Le studio de ton cousin fait 9 m² mais coûte plus cher." },
    { q: "Le soleil aide le corps à fabriquer quelle vitamine ?", o: ["Vitamine A", "Vitamine C", "Vitamine D", "Vitamine Spritz"], a: 2, f: "La vitamine D. La vitamine Spritz se fabrique en terrasse, mais ce n'est pas remboursé." },
    { q: "Combien de dents a un adulte, dents de sagesse comprises ?", o: ["28", "30", "32", "Ça dépend du nombre de bagarres"], a: 2, f: "32. Moins si vous avez dit à la mauvaise personne qu'elle avait grossi." },
    { q: "Qui a découvert la pénicilline ?", o: ["Louis Pasteur", "Alexander Fleming", "Marie Curie", "Un étudiant qui ne faisait jamais la vaisselle"], a: 1, f: "Fleming, en 1928… grâce à une boîte de culture moisie oubliée pendant ses vacances. La flemme sauve des vies." },
    { q: "Combien de côtés a un hexagone ?", o: ["Cinq", "Six", "Huit", "Je fais une licence de lettres"], a: 1, f: "Six. Comme la France, appelée l'Hexagone, qui râle sur six côtés à la fois." },
    { q: "Quelle est la plus haute montagne du monde ?", o: ["Le K2", "Le mont Blanc", "L'Everest", "La pile de linge à repasser"], a: 2, f: "L'Everest, environ 8 849 m. La pile de linge suit de près." },
    { q: "Quel est le pays le plus peuplé du monde depuis 2023 ?", o: ["La Chine", "L'Inde", "Les États-Unis", "La Belgique (en frites)"], a: 1, f: "L'Inde a doublé la Chine en 2023 selon l'ONU." },
    { q: "Quel organe produit l'insuline ?", o: ["Le foie", "La rate", "Le pancréas", "La vésicule de tata Josiane"], a: 2, f: "Le pancréas. Tata Josiane, elle, produit surtout des remarques." },
    { q: "En quelle année est tombé le mur de Berlin ?", o: ["1985", "1989", "1991", "Il est tombé tout seul ?"], a: 1, f: "Le 9 novembre 1989. Non, pas tout seul, il a fallu un peu aider." },
    { q: "Quel est l'animal national de l'Écosse ?", o: ["Le cerf", "Le mouton", "La licorne", "Nessie"], a: 2, f: "La licorne. Oui, vraiment. Les Écossais ne font rien comme tout le monde." },
    { q: "Quelle ville accueille les Jeux olympiques d'été 2028 ?", o: ["Brisbane", "Los Angeles", "Rome", "Châteauroux"], a: 1, f: "Los Angeles. Châteauroux a pourtant envoyé un dossier très motivé." },
    { q: "Combien de bits dans un octet ?", o: ["4", "8", "16", "Assez pour ta grand-mère"], a: 1, f: "8 bits. Une question pour les geeks, ils sont fiers, laissez-les." },
    { q: "Quel fleuve traverse Paris ?", o: ["La Loire", "Le Rhône", "La Seine", "Le Nil (pendant les JO)"], a: 2, f: "La Seine, où l'on s'est remis à nager. Bon courage." },
    { q: "Quel est le nom du paquebot qui a coulé en 1912 ?", o: ["Le Lusitania", "Le Titanic", "Le Britannic", "La Boudeuse"], a: 1, f: "Le Titanic. Il restait de la place sur la porte, on dit ça on dit rien." },
    { q: "Quelle est la monnaie du Japon ?", o: ["Le won", "Le yuan", "Le yen", "Le Pokédollar"], a: 2, f: "Le yen. Le Pokédollar n'est accepté qu'au Centre Pokémon." },
    { q: "Combien de touches a un piano classique ?", o: ["76", "88", "92", "Une de trop chez le voisin à 7 h"], a: 1, f: "88 touches : 52 blanches, 36 noires." }
  ],

  noix: [
    { q: "De quelle forme sont les crottes de wombat ?", o: ["Rondes", "Cubiques", "En étoile", "En forme de cœur"], a: 1, f: "Des petits cubes ! Pratique pour qu'elles ne roulent pas. La nature fait du Tetris." },
    { q: "Combien de temps dure en moyenne l'orgasme d'un cochon ?", o: ["30 secondes", "5 minutes", "Jusqu'à 30 minutes", "Moins que toi"], a: 2, f: "Jusqu'à une demi-heure. Un peu de respect pour le cochon, s'il vous plaît." },
    { q: "Quel animal est incapable de sauter ?", o: ["L'hippopotame nain", "L'éléphant", "Le koala", "Le paresseux"], a: 1, f: "L'éléphant adulte ne saute jamais : trop lourd, et franchement, pas besoin." },
    { q: "Combien de temps un cafard peut-il survivre sans tête ?", o: ["Quelques secondes", "Une heure", "Environ une semaine", "Il s'en fout, il n'en avait pas besoin"], a: 2, f: "Environ une semaine. Il finit par mourir… de soif. Il ne peut plus boire, logique." },
    { q: "Quelle lettre n'apparaît dans le nom d'aucun des 50 États américains ?", o: ["Z", "Q", "J", "X"], a: 1, f: "Le Q. Les Américains n'ont pas de Q. On ne commentera pas." },
    { q: "Les empreintes digitales des koalas ressemblent presque parfaitement à celles…", o: ["Des chimpanzés", "Des humains", "Des ours", "D'un suspect idéal"], a: 1, f: "Des humains ! Un koala pourrait théoriquement brouiller une scène de crime." },
    { q: "Quel animal a le plus long pénis par rapport à la taille de son corps ?", o: ["Le cheval", "La baleine bleue", "La bernacle (un petit crustacé)", "Ton ex (selon lui)"], a: 2, f: "La bernacle : jusqu'à environ 8 fois la longueur de son corps. Ton ex ment." },
    { q: "Combien de compartiments a l'estomac d'une vache ?", o: ["Un", "Deux", "Quatre", "Autant que ton beau-frère au buffet"], a: 2, f: "Quatre : panse, bonnet, feuillet, caillette. Ton beau-frère en a cinq." },
    { q: "Que veut dire « Häagen-Dazs » en danois ?", o: ["Glace de la montagne", "Crème du roi", "Rien du tout, c'est inventé", "Diarrhée assurée"], a: 2, f: "Rien ! Un nom inventé dans le Bronx pour faire « nordique et chic ». Ça a marché." },
    { q: "Quel est le muscle le plus puissant du corps humain par rapport à sa taille ?", o: ["Le cœur", "La langue", "Le masséter (mâchoire)", "Celui du poignet droit, on sait"], a: 2, f: "Le masséter, le muscle qui fait mâcher. Le poignet droit, on ne juge pas." },
    { q: "Comment dorment les dauphins ?", o: ["La tête en bas", "Avec la moitié du cerveau éveillée", "Collés à leur maman", "Ils ne dorment jamais"], a: 1, f: "Un hémisphère dort, l'autre surveille. Comme toi en réunion." },
    { q: "Quelle est la mémoire réelle d'un poisson rouge ?", o: ["3 secondes", "3 minutes", "Plusieurs mois", "Mieux que la tienne"], a: 2, f: "Plusieurs mois. La légende des 3 secondes est fausse. Elle aussi, tu l'avais oubliée." },
    { q: "Où se trouve le cœur d'une crevette ?", o: ["Dans la queue", "Dans la tête", "Dans le ventre", "Au rayon surgelés"], a: 1, f: "Dans la tête. Quand tu l'étêtes, tu lui brises le cœur. Bon appétit." },
    { q: "Combien de pets lâche en moyenne un humain par jour ?", o: ["2", "Une quinzaine", "50", "Mamie : zéro (officiellement)"], a: 1, f: "Entre 10 et 20 par jour. Oui, même la personne la plus classe de la pièce." },
    { q: "Pourquoi les loutres de mer ont-elles une poche sous chaque bras ?", o: ["Pour garder leurs petits", "Pour ranger leur caillou préféré", "Pour stocker de la graisse", "Pour leurs clés"], a: 1, f: "Pour ranger un caillou qui sert à casser les coquillages. Elles gardent le même toute leur vie." },
    { q: "Quel animal peut dormir jusqu'à 22 heures par jour ?", o: ["Le paresseux", "Le koala", "Le chat", "L'ado le dimanche"], a: 1, f: "Le koala, jusqu'à 22 h. L'eucalyptus est si pauvre qu'il doit économiser l'énergie. L'ado, lui, n'a pas d'excuse." }
  ],

  emojis: [
    { q: "🦁👑", o: ["Le Roi Lion", "Madagascar", "Le Livre de la jungle", "Tarzan"], a: 0 },
    { q: "🚢🧊💔", o: ["Pirates des Caraïbes", "Titanic", "La Reine des neiges", "Poséidon"], a: 1 },
    { q: "👽📞🏠", o: ["Men in Black", "Rencontres du troisième type", "E.T. l'extra-terrestre", "Independence Day"], a: 2 },
    { q: "🧙‍♂️💍🌋", o: ["Harry Potter", "Le Seigneur des anneaux", "Game of Thrones", "Le Hobbit… non attendez"], a: 1 },
    { q: "🦈🏖️😱", o: ["Les Dents de la mer", "Sharknado", "Le Monde de Nemo", "Baywatch"], a: 0 },
    { q: "🐀👨‍🍳🇫🇷", o: ["Ratatouille", "Cauchemar en cuisine", "Les Visiteurs", "Top Chef"], a: 0 },
    { q: "⚡👓🧙", o: ["Doctor Strange", "Harry Potter", "Merlin", "Les Animaux fantastiques"], a: 1 },
    { q: "🦖🏝️🧬", o: ["King Kong", "Jurassic Park", "L'Âge de glace", "Godzilla"], a: 1 },
    { q: "🚗⚡⏰🔙", o: ["Fast & Furious", "Retour vers le futur", "Cars", "Les Bronzés font du ski"], a: 1 },
    { q: "🤡🎈🌧️", o: ["Joker", "Ça", "Saw", "Le Cirque du Soleil"], a: 1 },
    { q: "💊🐇🕶️", o: ["Matrix", "Alice au pays des merveilles", "Men in Black", "Le Loup de Wall Street"], a: 0 },
    { q: "❄️👸⛄", o: ["Raiponce", "La Reine des neiges", "Blanche-Neige", "Les Bronzés font du ski"], a: 1 },
    { q: "🍫🏭🎫", o: ["Le Chocolat", "Charlie et la Chocolaterie", "Willy et les Gourmands", "Ratatouille"], a: 1 },
    { q: "🐼🥋", o: ["Kung Fu Panda", "Karaté Kid", "Mulan", "Ip Man"], a: 0 },
    { q: "👦🏠🎄✈️", o: ["Le Père Noël est une ordure", "Maman, j'ai raté l'avion", "Love Actually", "Y a-t-il un pilote dans l'avion ?"], a: 1 },
    { q: "🐰📍 (expression)", o: ["Poser un lapin", "Courir deux lièvres", "Sortir du chapeau", "Avoir une carotte"], a: 0 },
    { q: "🍎🍎😵 (expression)", o: ["Tomber dans les pommes", "Croquer la pomme", "Être haut comme trois pommes", "Ramener sa fraise"], a: 0 },
    { q: "🦶🍽️ (expression)", o: ["Casser les pieds", "Mettre les pieds dans le plat", "Faire du pied", "Avoir les pieds sur terre"], a: 1 },
    { q: "🪳😢 (expression)", o: ["Avoir le cafard", "Avoir des fourmis dans les jambes", "Être une petite bête", "Pleurer comme un insecte"], a: 0 },
    { q: "🧈💶🧈 (expression)", o: ["Faire son beurre", "Le beurre et l'argent du beurre", "Compter pour du beurre", "Beurrer la tartine"], a: 1 }
  ],

  // 3 affirmations, a = index du MENSONGE
  mensonge: [
    { o: ["Les loutres de mer se tiennent la main pour dormir", "Un escargot peut dormir pendant trois ans", "La tour Eiffel rétrécit de 15 cm chaque été"], a: 2, f: "C'est l'inverse : le métal se dilate avec la chaleur, elle grandit de quelques centimètres en été." },
    { o: ["Les vaches ont des meilleures amies et stressent sans elles", "Napoléon était bien plus petit que les Français de son époque", "Le miel ne se périme jamais"], a: 1, f: "Napoléon mesurait environ 1,69 m, la moyenne de l'époque. La légende vient de la propagande anglaise. Sacrés Anglais." },
    { o: ["Les bananes sont légèrement radioactives", "La Grande Muraille de Chine est visible à l'œil nu depuis la Lune", "Un éclair est plus chaud que la surface du Soleil"], a: 1, f: "Même depuis l'orbite basse on la voit à peine. Depuis la Lune : nada." },
    { o: ["Les pieuvres ont le sang bleu", "Le cri du canard ne fait pas d'écho", "Les flamants roses sont roses à cause de ce qu'ils mangent"], a: 1, f: "Le coin-coin fait de l'écho, c'est juste difficile à entendre. Mythe démonté." },
    { o: ["Cléopâtre a vécu plus près de l'invention de l'iPhone que de la construction de la grande pyramide", "Les Vikings portaient des casques à cornes", "L'université d'Oxford est plus ancienne que l'Empire aztèque"], a: 1, f: "Aucune preuve de casques à cornes au combat. C'est une invention de l'opéra du XIXe siècle." },
    { o: ["Les autruches cachent leur tête dans le sable quand elles ont peur", "Les kangourous ont du mal à marcher à reculons", "Il y a plus d'arbres sur Terre que d'étoiles dans la Voie lactée"], a: 0, f: "Elles mettent la tête au sol pour retourner leurs œufs, pas pour se cacher. Elles assument, elles." },
    { o: ["Le Nutella contient plus de 50 % de sucre", "La France est le pays qui a le plus de fuseaux horaires", "Le mot « sel » vient du mot « salaire »"], a: 2, f: "C'est l'inverse : « salaire » vient du latin salarium, lié au sel. Le sel était avant." },
    { o: ["Les paresseux retiennent leur souffle plus longtemps que les dauphins", "Einstein était nul en maths à l'école", "Un jour sur Vénus dure plus longtemps qu'une année sur Vénus"], a: 1, f: "Einstein maîtrisait le calcul différentiel avant 15 ans. Arrêtez de vous servir de lui comme excuse." },
    { o: ["Le premier « bug » informatique était un vrai insecte", "Les chats ne perçoivent pas le goût sucré", "On n'utilise que 10 % de notre cerveau"], a: 2, f: "On utilise tout notre cerveau. Même si certains invités ce soir semblent économiser." },
    { o: ["Le rouge rend les taureaux furieux", "Les hippopotames ne savent pas vraiment nager", "Botaniquement, la banane est une baie mais pas la fraise"], a: 0, f: "Les taureaux voient mal le rouge. C'est le mouvement de la cape qui les énerve." },
    { o: ["Marie Curie a reçu deux prix Nobel", "La Belgique est restée plus de 500 jours sans gouvernement", "Le sang est bleu dans les veines"], a: 2, f: "Le sang est toujours rouge, plus foncé dans les veines. Le bleu, c'est un effet de la peau." },
    { o: ["Les chiens peuvent détecter certains cancers à l'odeur", "Un poisson rouge relâché dans la nature peut atteindre la taille d'un ballon de foot", "Les chauves-souris sont aveugles"], a: 2, f: "Elles voient très bien. Elles ont juste l'écholocation en bonus. Frimeuses." }
  ]
};

// ─── PLUS OU MOINS : a = réponse, u = unité
export const NUMBERS = [
  { q: "Quelle est la hauteur de la tour Eiffel, antennes comprises ?", a: 330, u: "mètres", f: "330 m environ depuis l'ajout d'une antenne en 2022." },
  { q: "Combien de marches pour monter au sommet de la tour Eiffel ?", a: 1665, u: "marches", f: "1 665 marches. Le public n'a accès à pied que jusqu'au 2e étage. Heureusement." },
  { q: "Combien de litres de sang dans le corps d'un adulte ?", a: 5, u: "litres", f: "Environ 5 litres. Sauf chez les moustiques, qui se servent." },
  { q: "Combien d'os dans le squelette d'un adulte ?", a: 206, u: "os", f: "206. Un bébé en a environ 300, qui fusionnent en grandissant." },
  { q: "En quelle année les frères McDonald ont-ils ouvert leur tout premier restaurant ?", a: 1940, u: "", f: "1940 en Californie. Un barbecue au départ, pas encore de Big Mac." },
  { q: "Combien de pays sont membres de l'ONU ?", a: 193, u: "pays", f: "193 États membres. Le Vatican et la Palestine sont observateurs." },
  { q: "À quel âge est morte Jeanne Calment, doyenne de l'humanité ?", a: 122, u: "ans", f: "122 ans. Elle a fumé jusqu'à 117 ans. Ce n'est pas un conseil." },
  { q: "Combien de langues parle-t-on dans le monde, environ ?", a: 7000, u: "langues", f: "Environ 7 000, dont près de la moitié en danger." },
  { q: "Combien pèse un cerveau humain adulte, en moyenne ?", a: 1400, u: "grammes", f: "Autour de 1,3 à 1,4 kg. Pour certains joueurs ce soir, on attend la pesée." },
  { q: "Quelle est la distance moyenne Terre-Lune ?", a: 384400, u: "km", f: "384 400 km. Elle s'éloigne d'environ 3,8 cm par an. Même la Lune prend ses distances." },
  { q: "Combien de communes y a-t-il en France, environ ?", a: 34900, u: "communes", f: "Près de 35 000 : un record en Europe. Et chacune a son maire, sa fête et son bal." },
  { q: "Combien de touches sur un piano classique ?", a: 88, u: "touches", f: "88 touches. Si vous aviez la question en Culture G, c'était cadeau." },
  { q: "Quelle est la température à la surface du Soleil, environ ?", a: 5500, u: "°C", f: "Environ 5 500 °C. Le cœur, lui, dépasse 15 millions de degrés." },
  { q: "Quelle est la profondeur maximale de la fosse des Mariannes ?", a: 11000, u: "mètres", f: "Presque 11 000 m. Plus profond que l'Everest n'est haut." },
  { q: "Quelle est la longueur totale de la Grande Muraille de Chine selon le relevé officiel chinois ?", a: 21196, u: "km", f: "21 196 km d'après le relevé de 2012, en comptant toutes les sections." },
  { q: "Combien de cases sur un échiquier ?", a: 64, u: "cases", f: "64. Si vous vous êtes trompés, retournez aux petits chevaux." }
];

// ─── QUESTIONS SANS RÉPONSE : les équipes inventent, puis votent pour la meilleure
export const OPEN = [
  "Que dit un poisson rouge quand il fait le tour de son bocal pour la 3 000e fois ?",
  "Si les chats avaient un compte en banque, ils dépenseraient tout dans quoi ?",
  "Quel est le pire nom possible pour un chirurgien esthétique ?",
  "Qu'est-ce que Dieu a dit en voyant l'ornithorynque pour la première fois ?",
  "Quel serait le slogan publicitaire de la gastro ?",
  "Où partent vraiment les chaussettes qui disparaissent dans la machine à laver ?",
  "Quel est le dernier message que ton frigo enverrait avant de mourir ?",
  "Quelle est la pire phrase à dire juste après « Oui, je le veux » ?",
  "Que se passe-t-il vraiment dans un bureau de poste entre 12 h et 14 h ?",
  "Quel est le titre du prochain film X inspiré d'un Disney ?",
  "Si ton slip pouvait parler, il dirait quoi de toi ?",
  "Quel est le pire métier pour quelqu'un qui pète tout le temps ?",
  "Comment s'appelait le 8e nain, celui que Disney a viré ?",
  "Que faisaient vraiment les dinosaures le samedi soir ?",
  "Quelle est la vraie raison pour laquelle le Titanic a coulé ?",
  "Quel est le mot de passe Wi-Fi de Dieu ?",
  "Qu'est-ce qu'on trouve dans l'historique de navigation du Père Noël ?",
  "Quelle serait la pire application de rencontre possible ?"
];

// ─── LE BAC : une lettre + 5 catégories tirées au sort
export const BAC = {
  letters: "ABCDFGLMNPRST",
  cats: [
    "Un prénom", "Une ville", "Un chanteur ou une chanteuse", "Un film", "Une série",
    "Un truc dans le sac à main de mamie", "Une excuse pour être en retard", "Un truc qui pue",
    "Un truc à ne pas dire à sa belle-mère", "Une insulte gentille", "Une marque", "Un animal",
    "Un truc qu'on fait aux toilettes", "Un métier", "Un truc qu'on cache à ses parents",
    "Un plat qui fait péter", "Un truc qu'on trouve sous un lit", "Une raison de divorcer"
  ]
};

// ─── UNE FAMILLE EN OR : sondage 100 % bidon. k = mots-clés reconnus (sans accents, minuscules)
export const FAMILLE = [
  { q: "Une excuse pour ne pas aller à une soirée", r: [
    { l: "Je suis malade", k: ["malade", "fievre", "creve", "grippe", "covid", "gastro", "rhume"], p: 32 },
    { l: "Je suis fatigué", k: ["fatigue", "epuise", "dormir", "sommeil"], p: 24 },
    { l: "Les enfants", k: ["enfant", "gosse", "babysit", "nounou", "gamin", "mome"], p: 18 },
    { l: "Le boulot", k: ["boulot", "taf", "travail", "bosse", "travaille"], p: 14 },
    { l: "Panne de voiture", k: ["panne", "voiture", "bagnole", "train", "greve"], p: 8 } ] },
  { q: "Un truc qu'on fait en cachette aux toilettes", r: [
    { l: "Le téléphone", k: ["tel", "portable", "scroll", "insta", "tiktok", "telephone", "reseaux"], p: 38 },
    { l: "Lire", k: ["lire", "lecture", "journal", "magazine", "bouquin", "livre"], p: 20 },
    { l: "Fumer", k: ["fumer", "cigarette", "clope", "joint"], p: 15 },
    { l: "Pleurer", k: ["pleur"], p: 12 },
    { l: "Manger", k: ["manger", "chips", "chocolat", "bouffer", "grignot"], p: 9 },
    { l: "Dormir", k: ["dormir", "sieste", "dort"], p: 6 } ] },
  { q: "Un truc dans le sac à main d'une mamie", r: [
    { l: "Mouchoirs", k: ["mouchoir", "kleenex"], p: 30 },
    { l: "Bonbons", k: ["bonbon", "werther", "pastille", "caramel", "reglisse"], p: 25 },
    { l: "Porte-monnaie", k: ["monnaie", "argent", "piece", "portefeuille", "sous"], p: 18 },
    { l: "Lunettes", k: ["lunette"], p: 12 },
    { l: "Photos des petits-enfants", k: ["photo", "petit"], p: 8 },
    { l: "Parapluie", k: ["parapluie", "pluie"], p: 7 } ] },
  { q: "Une raison de se faire larguer", r: [
    { l: "Tromper", k: ["tromp", "infidel", "cocu", "amant", "maitresse"], p: 35 },
    { l: "Ronfler", k: ["ronfl"], p: 18 },
    { l: "Être jaloux", k: ["jalou"], p: 15 },
    { l: "Être radin", k: ["radin", "pingre", "avare"], p: 12 },
    { l: "La belle-mère", k: ["belle mere", "bellemere", "maman", "mere"], p: 10 },
    { l: "Les chaussettes qui traînent", k: ["chaussette", "linge", "bordel", "menage", "sale"], p: 10 } ] },
  { q: "Un truc qui pue", r: [
    { l: "Les pieds", k: ["pied", "chaussette", "basket"], p: 34 },
    { l: "La poubelle", k: ["poubelle", "ordure", "dechet"], p: 22 },
    { l: "Un pet", k: ["pet", "prout", "flatulence", "gaz", "caca"], p: 18 },
    { l: "Le fromage", k: ["fromage", "maroilles", "munster", "camembert"], p: 14 },
    { l: "Un œuf pourri", k: ["oeuf", "pourri"], p: 7 },
    { l: "Ton ex", k: ["ex"], p: 5 } ] },
  { q: "Un truc qu'on fait en se levant le matin", r: [
    { l: "Aller aux toilettes", k: ["pipi", "wc", "toilette", "caca"], p: 30 },
    { l: "Boire un café", k: ["cafe", "the", "petit dej", "dejeuner"], p: 25 },
    { l: "Prendre une douche", k: ["douche", "laver"], p: 18 },
    { l: "Regarder son téléphone", k: ["tel", "portable", "insta", "telephone", "mail"], p: 15 },
    { l: "Se brosser les dents", k: ["dent", "brosse"], p: 7 },
    { l: "Râler", k: ["raler", "ronchon", "grogn", "rale"], p: 5 } ] },
  { q: "Un mot qu'on crie quand on se cogne le petit orteil", r: [
    { l: "Putain", k: ["putain", "ptain", "pute"], p: 40 },
    { l: "Merde", k: ["merde", "mrd"], p: 25 },
    { l: "Aïe / Ouille", k: ["aie", "ouille", "ouch", "ouai"], p: 15 },
    { l: "Bordel", k: ["bordel"], p: 10 },
    { l: "Ta mère", k: ["ta mere"], p: 6 },
    { l: "Nom de Dieu", k: ["dieu"], p: 4 } ] },
  { q: "Une raison de ne pas aller au sport", r: [
    { l: "La fatigue", k: ["fatigue", "creve", "epuise"], p: 33 },
    { l: "La flemme", k: ["flemme", "paresse", "envie", "motivation"], p: 28 },
    { l: "La météo", k: ["pluie", "froid", "temps", "meteo", "chaud", "neige"], p: 15 },
    { l: "Les courbatures", k: ["courbature", "mal", "douleur", "blessure", "blesse"], p: 12 },
    { l: "L'apéro", k: ["apero", "biere", "boire", "vin", "alcool"], p: 7 },
    { l: "Netflix", k: ["netflix", "serie", "film", "tele"], p: 5 } ] },
  { q: "Un truc qu'on dit à un repas de famille et qu'on regrette", r: [
    { l: "La politique", k: ["politique", "vote", "election", "macron", "gauche", "droite"], p: 30 },
    { l: "L'héritage", k: ["heritage", "testament", "notaire"], p: 20 },
    { l: "« T'as grossi »", k: ["gross", "poids", "gros", "kilo"], p: 18 },
    { l: "« C'est pour quand le bébé ? »", k: ["bebe", "enfant", "mariage", "marier", "gosse"], p: 15 },
    { l: "Parler de son ex", k: ["ex"], p: 10 },
    { l: "La religion", k: ["religion", "dieu", "eglise"], p: 7 } ] },
  { q: "Un animal qu'on ne veut pas trouver dans son lit", r: [
    { l: "Une araignée", k: ["araignee", "araigne", "mygale"], p: 35 },
    { l: "Un serpent", k: ["serpent", "vipere", "couleuvre"], p: 25 },
    { l: "Un rat", k: ["rat", "souris", "rongeur"], p: 18 },
    { l: "Un cafard", k: ["cafard", "blatte", "cancrelat"], p: 12 },
    { l: "Une punaise de lit", k: ["punaise"], p: 6 },
    { l: "Sa belle-mère", k: ["belle mere", "bellemere"], p: 4 } ] },
  { q: "Un truc qui dure moins longtemps que prévu", r: [
    { l: "Les vacances", k: ["vacance", "conge", "weekend", "week end"], p: 30 },
    { l: "Le couple", k: ["couple", "amour", "relation", "mariage"], p: 22 },
    { l: "Le salaire", k: ["salaire", "paye", "paie", "argent", "fric", "thune"], p: 20 },
    { l: "La batterie du téléphone", k: ["batterie", "tel", "portable", "pile"], p: 12 },
    { l: "Le régime", k: ["regime", "diete"], p: 10 },
    { l: "Monsieur au lit", k: ["lit", "sexe", "performance", "calin", "rapport", "orgasme"], p: 6 } ] },
  { q: "Un truc qu'on achète en soldes et qu'on ne porte jamais", r: [
    { l: "Des chaussures", k: ["chaussure", "talon", "basket", "botte", "escarpin"], p: 30 },
    { l: "Une robe", k: ["robe"], p: 22 },
    { l: "Un jean", k: ["jean", "pantalon"], p: 15 },
    { l: "Un pull", k: ["pull", "gilet"], p: 13 },
    { l: "Un maillot de bain", k: ["maillot"], p: 10 },
    { l: "Un manteau", k: ["manteau", "veste", "blouson"], p: 10 } ] }
];

// ─── MALÉDICTIONS : fx = effet automatique, turns = durée de l'effet texte, w = poids du tirage
export const CURSES = [
  { t: "Reculez de 3 cases. Le karma, ça pique.", fx: { move: -3 }, w: 3 },
  { t: "Perdez 2 points. Cadeau de la maison.", fx: { points: -2 }, w: 3 },
  { t: "Vous passez votre prochain tour. Allez réfléchir à vos actes.", fx: { skip: 1 }, w: 2 },
  { t: "Vos prochains points gagnés sont divisés par deux. Comme votre QI.", fx: { halve: true }, w: 2 },
  { t: "Donnez 2 points à l'équipe dernière au classement. Robin des Bois, version nulle.", fx: { robin: 2 }, w: 2 },
  { t: "Vous perdez un joker au hasard. Fallait l'utiliser, radins.", fx: { loseJoker: true }, w: 2 },
  { t: "Retour à la case Départ. Oui, c'est violent. Non, on ne s'excuse pas.", fx: { home: true }, w: 1 },
  { t: "Pendant 2 tours, toutes vos réponses à voix haute se font en chantant.", fx: {}, turns: 2, w: 2 },
  { t: "Pendant 2 tours, interdiction de dire « oui » et « non ». Chaque faute = un gage choisi par les autres.", fx: {}, turns: 2, w: 2 },
  { t: "Jusqu'à votre prochain tour, toute l'équipe parle avec l'accent marseillais. Peuchère.", fx: {}, turns: 1, w: 2 },
  { t: "Jusqu'à la fin de la partie, vous appelez l'animateur « Votre Majesté ».", fx: {}, turns: 99, w: 1 },
  { t: "Votre capitaine fait 10 squats. Maintenant. Tout le monde regarde.", fx: {}, turns: 0, w: 2 },
  { t: "Pendant 2 tours, toute l'équipe parle d'elle-même à la troisième personne.", fx: {}, turns: 2, w: 2 },
  { t: "Racontez votre pire honte, sinon −3 points. L'assemblée juge.", fx: {}, turns: 0, w: 2 },
  { t: "Un joueur de votre équipe imite un animal choisi par les autres pendant 30 secondes.", fx: {}, turns: 0, w: 2 },
  { t: "Vous devez complimenter sincèrement l'équipe en tête. Ça fait mal, hein ?", fx: {}, turns: 0, w: 2 }
];

// ─── VANNES À ENVOYER D'UN TÉLÉPHONE À L'AUTRE
export const TAUNTS = {
  mean: [
    "On vous a vus réfléchir. C'était triste. 😬",
    "Même ma mamie aurait trouvé. Et elle est morte en 2009.",
    "Votre QI cumulé ne fait pas une température normale. 🤒",
    "Retournez jouer aux petits chevaux. 🐴",
    "Vous puez la défaite. Et un peu des pieds. 🦶",
    "Vous êtes la preuve que l'évolution peut faire marche arrière. 🐒",
    "C'était pas une question piège hein…",
    "Ça sent le sapin pour vous. 🌲",
    "On vous laisse gagner par pitié. Profitez.",
    "Votre équipe, c'est un pot de yaourt avec des chaussures.",
    "Vous êtes comme le Wi-Fi des trains : on ne capte rien. 📶",
    "Si la bêtise était olympique, vous seriez sur le podium. 🥇"
  ],
  nice: [
    "Allez, vous allez y arriver ! (non) 💪",
    "On croit en vous ! (on ment) 🙏",
    "Courage, la honte ne tue pas. Enfin, pas tout de suite.",
    "Respect, c'était bien joué 👏",
    "Bravo ! Même une horloge cassée a raison deux fois par jour. 🕰️",
    "Je vous aime bien, vous me rappelez mon chien. 🐶"
  ]
};

export const TEAM_NAMES = [
  "Les Moules à Frites", "Les Castors Juniors", "Les Licornes Alcooliques", "Les Patates Douces",
  "Les Raclettes Sauvages", "Les Bigorneaux", "Les Saucisses de Morteau", "Les Croquettes",
  "Les Flamants Rosés", "Les Chips Molles", "Les Ornithorynques", "Les Pieds Nickelés",
  "Les Mamies Rebelles", "Les Kebabs Tristes", "Les Loutres en Rut", "Les Perceuses"
];

// ═════════════════════════════════════════════════════════════
//  NOUVELLES CATÉGORIES (v2)
//  Rappel : le jeu MÉLANGE l'ordre des réponses à chaque fois.
//  On peut donc toujours écrire la bonne réponse en premier (a: 0).
// ═════════════════════════════════════════════════════════════

// ─── CULTURE G PAR THÈMES (en plus de QCM.culture, thème « Général »)
//  Le jeu fait tourner les thèmes pour ne pas enchaîner trois fois le même.
export const CULTURE_THEMES = {
  manga: { label: 'Manga', q: [
    { q: "Dans One Piece, quel est le rêve de Monkey D. Luffy ?", o: ["Devenir le roi des pirates", "Trouver l'All Blue", "Devenir le meilleur bretteur du monde", "Manger toute la viande du monde"], a: 0, f: "Le roi des pirates. Manger toute la viande du monde, c'est le plan B." },
    { q: "Comment s'appelle le premier fils de Son Goku ?", o: ["Son Gohan", "Son Goten", "Trunks", "Krilin junior"], a: 0, f: "Gohan, du nom du grand-père adoptif de Goku." },
    { q: "Dans Naruto, quelle créature est scellée dans le corps de Naruto ?", o: ["Le renard à neuf queues", "Le tanuki à une queue", "Un dragon à huit têtes", "Un pigeon possédé"], a: 0, f: "Kurama, le renard à neuf queues. Ça explique les moustaches." },
    { q: "Dans Les Chevaliers du Zodiaque, sous quelle constellation est placé Seiya ?", o: ["Pégase", "Le Dragon", "Le Cygne", "Andromède"], a: 0 },
    { q: "Dans Death Note, que se passe-t-il si on écrit le nom de quelqu'un dans le cahier ?", o: ["Il meurt", "Il tombe amoureux", "Il perd la mémoire", "Il devient chauve"], a: 0 },
    { q: "Dans le dessin animé Pokémon, quel est le premier Pokémon de Sacha ?", o: ["Pikachu", "Salamèche", "Carapuce", "Évoli"], a: 0 },
    { q: "Sous quel nom City Hunter est-il connu en France ?", o: ["Nicky Larson", "Cobra", "Ken le Survivant", "Max et Compagnie"], a: 0, f: "Nicky Larson : obsédé notoire, régulièrement assommé par la massue de Laura." },
    { q: "Dans quel manga des géants dévorent-ils les humains derrière des murs ?", o: ["L'Attaque des Titans", "Fullmetal Alchemist", "One Punch Man", "Bleach"], a: 0 }
  ] },
  da: { label: 'Dessins animés', q: [
    { q: "Comment s'appellent les trois neveux de Donald ?", o: ["Riri, Fifi et Loulou", "Tic, Tac et Toc", "Pif, Paf et Pouf", "Zip, Zap et Zop"], a: 0 },
    { q: "Qui est l'ennemi juré des Schtroumpfs ?", o: ["Gargamel", "Azraël", "Le Grand Schtroumpf", "Satanas"], a: 0, f: "Gargamel. Azraël, c'est son chat." },
    { q: "Dans Les Simpson, quel est le métier d'Homer ?", o: ["Inspecteur de la sécurité à la centrale nucléaire", "Barman", "Policier", "Chauffeur de bus"], a: 0, f: "Inspecteur de la sécurité. À la centrale nucléaire. Dormez tranquilles." },
    { q: "Dans la version française d'Inspecteur Gadget, comment s'appelle sa nièce ?", o: ["Sophie", "Penny", "Lisa", "Gadgetine"], a: 0, f: "Sophie en VF (Penny en VO), avec son chien Finot." },
    { q: "Dans Le Roi Lion, comment s'appelle le père de Simba ?", o: ["Mufasa", "Scar", "Rafiki", "Zazu"], a: 0 },
    { q: "Dans Ulysse 31, comment s'appelle le petit robot ?", o: ["Nono", "Bubo", "Robby", "R2"], a: 0 },
    { q: "Où habite Bob l'éponge ?", o: ["Dans un ananas", "Dans une noix de coco", "Dans une boîte de conserve", "Chez sa mère"], a: 0 },
    { q: "Dans Tom et Jerry, qui est la souris ?", o: ["Jerry", "Tom", "Speedy", "Mickey"], a: 0, f: "Jerry. Si vous avez hésité, on a un vrai sujet." }
  ] },
  chfr: { label: 'Chanson française', q: [
    { q: "Qui chante « Alexandrie Alexandra » ?", o: ["Claude François", "Michel Sardou", "Johnny Hallyday", "Joe Dassin"], a: 0, f: "Claude François, single sorti juste après sa mort en 1978." },
    { q: "Quel artiste a sorti l'album « Racine carrée » ?", o: ["Stromae", "Orelsan", "Angèle", "Maître Gims"], a: 0 },
    { q: "Qui chante « Les Lacs du Connemara » ?", o: ["Michel Sardou", "Jean-Jacques Goldman", "Francis Cabrel", "Renaud"], a: 0, f: "Hymne officiel de toutes les fins de mariage." },
    { q: "Quel groupe chante « L'Aventurier » ?", o: ["Indochine", "Téléphone", "Noir Désir", "Les Rita Mitsouko"], a: 0 },
    { q: "Qui chante « La Bohème » ?", o: ["Charles Aznavour", "Jacques Brel", "Édith Piaf", "Serge Gainsbourg"], a: 0 },
    { q: "Qui chante « Djadja » ?", o: ["Aya Nakamura", "Angèle", "Wejdene", "Clara Luciani"], a: 0 },
    { q: "Qui chante « Le Sud » ?", o: ["Nino Ferrer", "Hugues Aufray", "Michel Fugain", "Gérard Lenorman"], a: 0 }
  ] },
  chet: { label: 'Chanson étrangère', q: [
    { q: "Quel groupe chante « Bohemian Rhapsody » ?", o: ["Queen", "The Beatles", "Pink Floyd", "Led Zeppelin"], a: 0 },
    { q: "Qui est surnommé le « King of Pop » ?", o: ["Michael Jackson", "Elvis Presley", "Prince", "Justin Bieber"], a: 0, f: "Elvis, lui, c'est le King tout court." },
    { q: "Qui chante « Despacito » (avec Daddy Yankee) ?", o: ["Luis Fonsi", "Enrique Iglesias", "Ricky Martin", "Shakira"], a: 0 },
    { q: "Quel groupe suédois a gagné l'Eurovision 1974 avec « Waterloo » ?", o: ["ABBA", "Roxette", "Ace of Base", "Europe"], a: 0, f: "Waterloo. Encore une défaite française chantée par les autres." },
    { q: "Quelle chanteuse a sorti l'album « 21 » ?", o: ["Adele", "Amy Winehouse", "Taylor Swift", "Rihanna"], a: 0 },
    { q: "Quel est l'album le plus vendu de l'histoire ?", o: ["Thriller", "Back in Black", "The Dark Side of the Moon", "Le best-of de Patrick Sébastien"], a: 0 },
    { q: "De quel pays vient le groupe U2 ?", o: ["Irlande", "Royaume-Uni", "États-Unis", "Australie"], a: 0 }
  ] },
  paillarde: { label: 'Chansons paillardes', q: [
    { q: "Dans quel port breton vivent les célèbres filles de la chanson paillarde ?", o: ["Camaret", "Brest", "Quimper", "Lorient"], a: 0, f: "Les Filles de Camaret. On ne détaillera pas leurs mœurs, il y a peut-être des enfants." },
    { q: "« La Digue du cul » commence en revenant de quelle ville ?", o: ["Nantes", "Lyon", "Brest", "Marseille"], a: 0, f: "De Nantes à Montaigu. La digue du cul !" },
    { q: "Dans « Jeanneton prend sa faucille », combien de jeunes gens croise-t-elle ?", o: ["Quatre", "Deux", "Trois", "Toute une caserne"], a: 0, f: "Quatre. La morale change selon le taux d'alcoolémie de la tablée." },
    { q: "Dans « Chevaliers de la Table ronde », que vont-ils goûter ?", o: ["Le vin", "La bière", "Le cidre", "L'eau de Vichy"], a: 0 },
    { q: "Quelle chanson de Brassens, où un primate s'en prend à un juge, fut interdite d'antenne à sa sortie ?", o: ["Le Gorille", "La Mauvaise Réputation", "Les Copains d'abord", "Le Parapluie"], a: 0 }
  ] },
  cine: { label: 'Ciné & séries', q: [
    { q: "Dans « Le Dîner de cons », comment s'appelle le personnage de Jacques Villeret ?", o: ["François Pignon", "Pierre Brochant", "Juste Leblanc", "Lucien Cheval"], a: 0, f: "François Pignon. Juste Leblanc, lui, a un prénom : Juste." },
    { q: "Dans quel film Jacquouille la Fripouille débarque-t-il au XXe siècle ?", o: ["Les Visiteurs", "Kaamelott", "La Grande Vadrouille", "Astérix et Obélix"], a: 0 },
    { q: "Dans « Friends », quel est le métier de Ross ?", o: ["Paléontologue", "Chef cuisinier", "Masseur", "Acteur"], a: 0 },
    { q: "Combien de saisons compte « Game of Thrones » ?", o: ["8", "6", "7", "Une de trop"], a: 0, f: "8. La dernière, on n'en parle pas." },
    { q: "Quel acteur joue Forrest Gump ?", o: ["Tom Hanks", "Kevin Costner", "Robin Williams", "Bill Murray"], a: 0 }
  ] }
};

// ─── A CONTRARIO : titre ou expression inversé, retrouvez l'original
export const CONTRARIO = [
  { q: "Le Bruit des moutons", o: ["Le Silence des agneaux", "La Mélodie du bonheur", "Le Cri du loup", "Les Moutons de Panurge"], a: 0 },
  { q: "Petit-déjeuner chez les génies", o: ["Le Dîner de cons", "Les Visiteurs", "La Cité de la peur", "Le Père Noël est une ordure"], a: 0 },
  { q: "Le Petit Bleu", o: ["Le Grand Bleu", "Le Petit Prince", "Le Grand Blond avec une chaussure noire", "Les Schtroumpfs"], a: 0 },
  { q: "Papa, j'ai eu le train", o: ["Maman, j'ai raté l'avion", "Y a-t-il un pilote dans l'avion ?", "Le Crime de l'Orient-Express", "Taxi"], a: 0 },
  { q: "Le Paysan des carrés", o: ["Le Seigneur des anneaux", "Le Roi Lion", "Le Hobbit", "Le Cercle des poètes disparus"], a: 0 },
  { q: "Une nuit avec fin", o: ["Un jour sans fin", "La Nuit au musée", "28 jours plus tard", "Le Jour le plus long"], a: 0 },
  { q: "Noire-Pluie et les sept géants", o: ["Blanche-Neige et les sept nains", "Les Sept Mercenaires", "Le Géant de fer", "Cendrillon"], a: 0 },
  { q: "Les Pâlots font du surf", o: ["Les Bronzés font du ski", "Point Break", "Brice de Nice", "Camping"], a: 0 },
  { q: "La Petite Immobilité", o: ["La Grande Vadrouille", "Le Petit Baigneur", "La Grande Évasion", "Les Grandes Gueules"], a: 0 },
  { q: "Monter dans les poires (expression)", o: ["Tomber dans les pommes", "Poireauter", "Ramener sa fraise", "Avoir la pêche"], a: 0 },
  { q: "Avoir le foie sous le pied (expression)", o: ["Avoir le cœur sur la main", "Casser les pieds", "Avoir la main verte", "Se faire du mauvais sang"], a: 0 }
];

// ─── AFFICHE MYSTÈRE : les indices tombent un par un, moins on en voit, plus ça rapporte
export const AFFICHES = [
  { clues: ["Un fond vert qui défile", "Une pilule rouge", "Une pilule bleue", "Des lunettes noires et un long manteau"], o: ["Matrix", "Men in Black", "Inception", "Tron"], a: 0 },
  { clues: ["Un paquebot", "Un iceberg", "Un dessin au fusain", "Une porte qui flotte (avec de la place pour deux)"], o: ["Titanic", "Poséidon", "Le Grand Bleu", "La Croisière s'amuse"], a: 0 },
  { clues: ["Un squelette géant", "Une Jeep", "Un moustique dans de l'ambre", "Un verre d'eau qui tremble"], o: ["Jurassic Park", "King Kong", "Godzilla", "La Nuit au musée"], a: 0 },
  { clues: ["Un rocher au lever du soleil", "Un bébé brandi devant la foule", "Un babouin", "Un phacochère qui pète"], o: ["Le Roi Lion", "Le Livre de la jungle", "Madagascar", "Tarzan"], a: 0 },
  { clues: ["Des traces de pneus en feu", "Une horloge de mairie", "Un skateboard", "Une voiture aux portes papillon"], o: ["Retour vers le futur", "Fast & Furious", "Taxi", "Back to School"], a: 0 },
  { clues: ["Une nageuse vue d'en dessous", "Un aileron", "Une plage américaine", "Un maire qui refuse de fermer la plage"], o: ["Les Dents de la mer", "Le Monde de Nemo", "Alerte à Malibu", "Sharknado"], a: 0 },
  { clues: ["Du vert et du rouge partout", "Une frange brune", "Un nain de jardin qui voyage", "Une crème brûlée"], o: ["Le Fabuleux Destin d'Amélie Poulain", "Les Choristes", "La Haine", "Intouchables"], a: 0 },
  { clues: ["Un vélo devant la pleine lune", "Un doigt qui s'allume", "Un placard plein de peluches", "Un téléphone bricolé"], o: ["E.T. l'extra-terrestre", "Rencontres du troisième type", "Super 8", "Les Goonies"], a: 0 },
  { clues: ["Un anneau doré", "Un volcan", "Des pieds très poilus", "Un magicien à barbe grise"], o: ["Le Seigneur des anneaux", "Harry Potter", "Game of Thrones", "Le Monde de Narnia"], a: 0 },
  { clues: ["Une mallette qui brille", "Un concours de twist", "Un milkshake à 5 dollars", "Une seringue plantée dans le cœur"], o: ["Pulp Fiction", "Reservoir Dogs", "Kill Bill", "Grease"], a: 0 },
  { clues: ["Des combinaisons de ski fluo", "Un télésiège", "Un refuge de montagne", "Une liqueur d'échalote"], o: ["Les Bronzés font du ski", "Les Visiteurs", "Le Père Noël est une ordure", "Camping"], a: 0 }
];

// ─── BURGER QUIZ : 3 thèmes tirés au sort (dont 1 taré), l'équipe choisit, 3 questions
//  d = description affichée (pour les thèmes tarés, plus c'est n'importe quoi, mieux c'est)
export const BURGER = [
  { name: "Les fromages qui puent", qs: [
    { q: "De quelle région vient le maroilles ?", o: ["Le Nord", "La Normandie", "L'Alsace", "La Savoie"], a: 0 },
    { q: "Le munster est une spécialité…", o: ["Alsacienne et vosgienne", "Bretonne", "Auvergnate", "Corse"], a: 0 },
    { q: "Avec quel fromage fait-on la vraie tartiflette ?", o: ["Le reblochon", "Le comté", "La raclette", "Le brie"], a: 0 } ] },
  { name: "Les années 80", qs: [
    { q: "Quel personnage jaune passe sa vie à manger des pac-gommes ?", o: ["Pac-Man", "Mario", "Sonic", "Kirby"], a: 0 },
    { q: "En quelle année Marty McFly remonte-t-il depuis 1985 ?", o: ["1955", "1965", "1945", "1975"], a: 0 },
    { q: "Comment s'appelle la console de salon de Nintendo sortie en Europe en 1986 ?", o: ["La NES", "La Game Boy", "La Master System", "L'Atari 2600"], a: 0 } ] },
  { name: "Les animaux de la ferme", qs: [
    { q: "Comment s'appelle le petit de la chèvre ?", o: ["Le chevreau", "L'agneau", "Le poulain", "Le veau"], a: 0 },
    { q: "Combien de trayons a une vache ?", o: ["4", "2", "6", "8"], a: 0 },
    { q: "Le foie gras est produit à partir de…", o: ["Canards ou oies", "Poules", "Dindes", "Lapins"], a: 0 } ] },
  { name: "Le corps humain", qs: [
    { q: "Quel est le plus grand organe du corps humain ?", o: ["La peau", "Le foie", "Les poumons", "L'intestin"], a: 0 },
    { q: "Où se trouve l'étrier ?", o: ["Dans l'oreille", "Dans le pied", "Dans le nez", "Dans le genou"], a: 0 },
    { q: "Combien de cavités compte le cœur humain ?", o: ["4", "2", "3", "5"], a: 0 } ] },
  { name: "La gastronomie française", qs: [
    { q: "De quelle ville vient la bouillabaisse ?", o: ["Marseille", "Lyon", "Bordeaux", "Lille"], a: 0 },
    { q: "Que contient une vraie quiche lorraine ?", o: ["Des lardons", "Du saumon", "Du chèvre", "Du poulet"], a: 0 },
    { q: "Le kouign-amann est une spécialité…", o: ["Bretonne", "Alsacienne", "Basque", "Savoyarde"], a: 0 } ] },
  { name: "Les héros Disney", qs: [
    { q: "Comment s'appelle la fée de Peter Pan ?", o: ["La fée Clochette", "La fée Marraine", "Flora", "La fée Bleue"], a: 0 },
    { q: "Dans Aladdin, comment s'appelle le singe ?", o: ["Abu", "Rafiki", "Iago", "Pascal"], a: 0 },
    { q: "Comment s'appelle la Petite Sirène ?", o: ["Ariel", "Ondine", "Marina", "Moana"], a: 0 } ] },
  { name: "L'espace", qs: [
    { q: "Quelle planète a les anneaux les plus spectaculaires ?", o: ["Saturne", "Jupiter", "Mars", "Vénus"], a: 0 },
    { q: "Qui a été le premier homme dans l'espace ?", o: ["Youri Gagarine", "Neil Armstrong", "Buzz Aldrin", "Thomas Pesquet"], a: 0 },
    { q: "Quelle est la planète la plus proche du Soleil ?", o: ["Mercure", "Vénus", "Mars", "La Terre"], a: 0 } ] },
  { name: "Le foot", qs: [
    { q: "Quel pays a remporté la Coupe du monde 2018 ?", o: ["La France", "La Croatie", "La Belgique", "Le Brésil"], a: 0 },
    { q: "Qui a donné un coup de tête en finale de la Coupe du monde 2006 ?", o: ["Zinédine Zidane", "Thierry Henry", "Franck Ribéry", "Fabien Barthez"], a: 0 },
    { q: "Combien de temps dure un match de foot, hors prolongations ?", o: ["90 minutes", "80 minutes", "100 minutes", "Jusqu'à ce que la France perde"], a: 0 } ] },
  { name: "Les choses qui collent quand on transpire du slip", taré: true, qs: [
    { q: "Avec la résine de pin, on fabrique…", o: ["De la térébenthine", "Du pétrole", "Du caoutchouc", "Du savon"], a: 0 },
    { q: "Le premier chewing-gum industriel était fait à base de…", o: ["Chiclé, une sève d'arbre", "Pétrole", "Gélatine de porc", "Cire d'abeille"], a: 0 },
    { q: "Quel animal fabrique un fil collant pour attraper ses proies ?", o: ["L'araignée", "Le ver à soie", "La chenille", "L'escargot"], a: 0 } ] },
  { name: "Les animaux qui ont manifestement raté leur vie", taré: true, qs: [
    { q: "Quel animal dort la tête en bas ?", o: ["La chauve-souris", "Le hibou", "Le koala", "Le flamant rose"], a: 0 },
    { q: "Quel est le mammifère le plus lent du monde ?", o: ["Le paresseux", "Le koala", "Le hérisson", "Le lamantin"], a: 0 },
    { q: "Quel oiseau de l'Antarctique ne sait pas voler ?", o: ["Le manchot", "Le pingouin", "Le goéland", "Le pétrel"], a: 0, f: "Le manchot. Le pingouin, lui, vole très bien. Piège !" } ] },
  { name: "Ce que tonton Michel raconte au quatrième pastis", taré: true, qs: [
    { q: "Quelle plante donne son goût au pastis ?", o: ["L'anis", "La menthe", "Le thym", "Le basilic"], a: 0 },
    { q: "Combien de temps a réellement duré la guerre de Cent Ans ?", o: ["116 ans", "100 ans", "99 ans", "Cent ans pile, faut pas pinailler"], a: 0, f: "116 ans. Comme les histoires de tonton." },
    { q: "Le pastis est né dans quelle région ?", o: ["La Provence", "La Bretagne", "L'Alsace", "La Corse"], a: 0 } ] },
  { name: "Les sujets interdits au repas de Noël chez les Duchmol", taré: true, qs: [
    { q: "Combien de temps dure le mandat d'un député français ?", o: ["5 ans", "4 ans", "6 ans", "7 ans"], a: 0 },
    { q: "En quelle année a eu lieu la prise de la Bastille ?", o: ["1789", "1792", "1793", "1815"], a: 0 },
    { q: "Combien de signes compte le zodiaque occidental ?", o: ["12", "10", "13", "9"], a: 0 } ] }
];

// ─── QUI VEUT GAGNER DES MILLIONS : 5 paliers de difficulté, l'équipe peut s'arrêter à tout moment
//  Gains : 1, 2, 3, 5, 8 pts. Palier assuré après la 2e question.
export const MILLIONS = [
  [ // niveau 1
    { q: "De quelle couleur est le cheval blanc d'Henri IV ?", o: ["Blanc", "Noir", "Gris", "Alezan"], a: 0 },
    { q: "Combien de jours compte une année bissextile ?", o: ["366", "365", "364", "367"], a: 0 },
    { q: "Quel animal est le symbole de la France ?", o: ["Le coq", "L'aigle", "Le lion", "Le lapin"], a: 0 },
    { q: "Qui est le compagnon de route de Tintin, capitaine de son état ?", o: ["Haddock", "Obélix", "Spirou", "Gaston"], a: 0 },
    { q: "Dans quel pays se trouve la tour de Pise ?", o: ["L'Italie", "L'Espagne", "La Grèce", "La France"], a: 0 },
    { q: "Combien y a-t-il de minutes dans une heure ?", o: ["60", "100", "30", "90"], a: 0, f: "60. Pas 100, monsieur du forain." }
  ],
  [ // niveau 2
    { q: "Quel est l'ingrédient principal du guacamole ?", o: ["L'avocat", "Le concombre", "Le petit pois", "La courgette"], a: 0 },
    { q: "Quel est le plus long fleuve de France ?", o: ["La Loire", "La Seine", "Le Rhône", "La Garonne"], a: 0 },
    { q: "Qui a écrit « Le Petit Prince » ?", o: ["Antoine de Saint-Exupéry", "Jules Verne", "Albert Camus", "Marcel Pagnol"], a: 0 },
    { q: "Combien de cordes a une guitare classique ?", o: ["6", "4", "7", "12"], a: 0 },
    { q: "Quel gaz les plantes absorbent-elles pour la photosynthèse ?", o: ["Le dioxyde de carbone", "L'oxygène", "L'azote", "L'hélium"], a: 0 },
    { q: "Quelle est la capitale du Canada ?", o: ["Ottawa", "Toronto", "Montréal", "Vancouver"], a: 0 }
  ],
  [ // niveau 3
    { q: "Quel peintre s'est tranché une partie de l'oreille ?", o: ["Vincent van Gogh", "Pablo Picasso", "Claude Monet", "Salvador Dalí"], a: 0 },
    { q: "Combien d'étoiles compte le drapeau européen ?", o: ["12", "15", "27", "10"], a: 0 },
    { q: "Quel est le plus grand désert chaud du monde ?", o: ["Le Sahara", "Le Gobi", "Le Kalahari", "L'Atacama"], a: 0 },
    { q: "Quel compositeur était devenu sourd ?", o: ["Beethoven", "Mozart", "Bach", "Chopin"], a: 0 },
    { q: "Quel élément chimique a pour symbole Fe ?", o: ["Le fer", "Le fluor", "Le fermium", "Le phosphore"], a: 0 },
    { q: "Quel pays compte le plus de fuseaux horaires, territoires d'outre-mer compris ?", o: ["La France", "La Russie", "Les États-Unis", "La Chine"], a: 0, f: "La France, avec 12 fuseaux grâce à ses territoires d'outre-mer." }
  ],
  [ // niveau 4
    { q: "En quelle année Christophe Colomb atteint-il l'Amérique ?", o: ["1492", "1515", "1453", "1498"], a: 0 },
    { q: "Quel est le plus petit pays indépendant d'Amérique du Sud ?", o: ["Le Suriname", "L'Uruguay", "Le Guyana", "L'Équateur"], a: 0 },
    { q: "Qui a peint « Guernica » ?", o: ["Pablo Picasso", "Salvador Dalí", "Joan Miró", "Francisco de Goya"], a: 0 },
    { q: "Quel est le plus petit os du corps humain ?", o: ["L'étrier", "Le marteau", "L'enclume", "La phalange du petit orteil"], a: 0 },
    { q: "Qui a écrit « Je pense, donc je suis » ?", o: ["René Descartes", "Blaise Pascal", "Voltaire", "Jean-Jacques Rousseau"], a: 0 },
    { q: "Quelle est la monnaie de la Suisse ?", o: ["Le franc suisse", "L'euro", "La couronne", "Le mark"], a: 0 }
  ],
  [ // niveau 5
    { q: "En quelle année est mort Napoléon Ier ?", o: ["1821", "1815", "1830", "1804"], a: 0 },
    { q: "Quel est le seul mammifère capable de vraiment voler ?", o: ["La chauve-souris", "L'écureuil volant", "Le colugo", "Le phalanger volant"], a: 0, f: "La chauve-souris. Les autres planent, ce qui n'est pas pareil." },
    { q: "Quel est le plus haut sommet d'Afrique ?", o: ["Le Kilimandjaro", "Le mont Kenya", "Le Toubkal", "Le Ruwenzori"], a: 0 },
    { q: "Combien de symphonies Beethoven a-t-il achevées ?", o: ["9", "5", "12", "7"], a: 0 },
    { q: "Quelle planète tourne sur elle-même dans le sens inverse de la Terre ?", o: ["Vénus", "Mars", "Jupiter", "Neptune"], a: 0 },
    { q: "Quel est l'animal le plus rapide en piqué ?", o: ["Le faucon pèlerin", "L'aigle royal", "Le guépard", "Le martinet"], a: 0, f: "Le faucon pèlerin, plus de 300 km/h en piqué." }
  ]
];

// ─── PHRASE À DOUBLE SENS : une phrase qui marche dans les deux situations. Chacun écrit, on vote.
export const DOUBLESENS = [
  { a: "un repas de famille", b: "une soirée échangiste", ex: "« C'est toi qui as farci la dinde ? »" },
  { a: "la messe du dimanche", b: "une boîte de nuit à 4 h du matin" },
  { a: "chez le boucher", b: "une première nuit ensemble" },
  { a: "un cours de gym", b: "la chambre à coucher" },
  { a: "chez le garagiste", b: "chez le gynécologue" },
  { a: "une réunion de travail", b: "un enterrement de vie de garçon" },
  { a: "un concours de pâtisserie", b: "une nuit de noces" },
  { a: "un déjeuner chez la belle-mère", b: "un club libertin" },
  { a: "un cours de cuisine", b: "un sex-shop" },
  { a: "un atelier jardinage", b: "un premier rendez-vous Tinder" },
  { a: "le contrôle technique", b: "une soirée tupperware coquine" },
  { a: "une partie de pétanque", b: "un tournage de film pour adultes" }
];

// ─── TITRE DÉBILE : ajoutez UN mot au titre pour le rendre débile. Chacun écrit, on vote.
//  Exemples : Star Wars → Star Wars Zazat · Autant en emporte le vent → Autant en emporte le vent des globes
export const TITRES = [
  "Star Wars", "Autant en emporte le vent", "Le Seigneur des anneaux", "Titanic", "Le Parrain",
  "La Grande Vadrouille", "Les Bronzés font du ski", "Le Roi Lion", "Retour vers le futur", "Le Silence des agneaux",
  "Harry Potter à l'école des sorciers", "Le Dîner de cons", "Jurassic Park", "Les Visiteurs", "Pirates des Caraïbes"
];

// ─── MÉDIAS : à préparer. Les réponses sont déjà là, il ne manque que les fichiers.
//  Déposez le fichier dans public/media/ et remplacez src: null par le chemin, ex. src: "/media/queen.mp3".
//  Une entrée sans fichier est ignorée. Si une case n'a aucun fichier, elle donne une question de Culture G.
//    audio      : { src, answer, start (s), bonus }       bonus = info pour le +1 (année, réalisateur…)
//    pochette   : { img, answer }
//    une note   : { src, answer }                          extrait d'une seule note / d'un seul accord
//    couche     : { layers: [src batterie, src basse, src guitare/clavier, src voix], answer }
//                 (pistes séparées avec un outil comme Demucs, toutes de même durée)
//    vidéo      : { src, start, stop, qs: [question, question bonus facultative] }
export const MEDIA = {
  bt_actuel: [
    { src: null, answer: "Flowers — Miley Cyrus", bonus: "2023" },
    { src: null, answer: "Blinding Lights — The Weeknd", bonus: "2019" },
    { src: null, answer: "As It Was — Harry Styles", bonus: "2022" },
    { src: null, answer: "Bad Guy — Billie Eilish", bonus: "2019" },
    { src: null, answer: "Tout oublier — Angèle feat. Roméo Elvis", bonus: "2018" },
    { src: null, answer: "Djadja — Aya Nakamura", bonus: "2018" },
    { src: null, answer: "Calm Down — Rema & Selena Gomez", bonus: "2022" },
    { src: null, answer: "Shape of You — Ed Sheeran", bonus: "2017" },
    { src: null, answer: "Papaoutai — Stromae", bonus: "2013" },
    { src: null, answer: "Espresso — Sabrina Carpenter", bonus: "2024" }
  ],
  bt_intemporel: [
    { src: null, answer: "Bohemian Rhapsody — Queen", bonus: "1975" },
    { src: null, answer: "Billie Jean — Michael Jackson", bonus: "1983" },
    { src: null, answer: "Hotel California — Eagles", bonus: "1976" },
    { src: null, answer: "Smells Like Teen Spirit — Nirvana", bonus: "1991" },
    { src: null, answer: "Hey Jude — The Beatles", bonus: "1968" },
    { src: null, answer: "Le Sud — Nino Ferrer", bonus: "1975" },
    { src: null, answer: "Les Champs-Élysées — Joe Dassin", bonus: "1969" },
    { src: null, answer: "I Will Survive — Gloria Gaynor", bonus: "1978" },
    { src: null, answer: "Africa — Toto", bonus: "1982" },
    { src: null, answer: "Sweet Dreams — Eurythmics", bonus: "1983" }
  ],
  bt_series: [
    { src: null, answer: "Friends" }, { src: null, answer: "Game of Thrones" }, { src: null, answer: "Les Simpson" },
    { src: null, answer: "Stranger Things" }, { src: null, answer: "Dallas" }, { src: null, answer: "X-Files" },
    { src: null, answer: "Kaamelott" }, { src: null, answer: "Plus belle la vie" }, { src: null, answer: "Mission impossible (la série)" },
    { src: null, answer: "Les Mystères de l'Ouest" }
  ],
  bt_films: [
    { src: null, answer: "Star Wars", bonus: "1977 · George Lucas" },
    { src: null, answer: "Les Dents de la mer", bonus: "1975 · Steven Spielberg" },
    { src: null, answer: "Titanic", bonus: "1997 · James Cameron" },
    { src: null, answer: "Le Bon, la Brute et le Truand", bonus: "1966 · Sergio Leone" },
    { src: null, answer: "Pirates des Caraïbes", bonus: "2003 · Gore Verbinski" },
    { src: null, answer: "Rocky", bonus: "1976 · John G. Avildsen" },
    { src: null, answer: "Le Parrain", bonus: "1972 · Francis Ford Coppola" },
    { src: null, answer: "Indiana Jones (Les Aventuriers de l'arche perdue)", bonus: "1981 · Steven Spielberg" },
    { src: null, answer: "Le Fabuleux Destin d'Amélie Poulain", bonus: "2001 · Jean-Pierre Jeunet" },
    { src: null, answer: "SOS Fantômes", bonus: "1984 · Ivan Reitman" }
  ],
  paroles: [
    { src: null, answer: "Les Lacs du Connemara — Michel Sardou" },
    { src: null, answer: "Alexandrie Alexandra — Claude François" },
    { src: null, answer: "Femme Like U — K-Maro" },
    { src: null, answer: "L'Aventurier — Indochine" },
    { src: null, answer: "Les Démons de minuit — Images" },
    { src: null, answer: "Je l'aime à mourir — Francis Cabrel" },
    { src: null, answer: "Foule sentimentale — Alain Souchon" },
    { src: null, answer: "Tous les mêmes — Stromae" },
    { src: null, answer: "Ça plane pour moi — Plastic Bertrand" },
    { src: null, answer: "Les Sardines — Patrick Sébastien" }
  ],
  envers: [
    { src: null, answer: "Gangnam Style — PSY" }, { src: null, answer: "Macarena — Los del Río" },
    { src: null, answer: "YMCA — Village People" }, { src: null, answer: "La Danse des canards — J.J. Lionel" },
    { src: null, answer: "Billie Jean — Michael Jackson" }, { src: null, answer: "Despacito — Luis Fonsi" },
    { src: null, answer: "Wannabe — Spice Girls" }, { src: null, answer: "Happy — Pharrell Williams" },
    { src: null, answer: "Asereje (The Ketchup Song) — Las Ketchup" }, { src: null, answer: "Mambo No. 5 — Lou Bega" }
  ],
  replique: [
    { src: null, answer: "Les Visiteurs", bonus: "1993 · Jean-Marie Poiré" },
    { src: null, answer: "Le Dîner de cons", bonus: "1998 · Francis Veber" },
    { src: null, answer: "La Cité de la peur", bonus: "1994 · Alain Berbérian" },
    { src: null, answer: "OSS 117 : Le Caire, nid d'espions", bonus: "2006 · Michel Hazanavicius" },
    { src: null, answer: "Bienvenue chez les Ch'tis", bonus: "2008 · Dany Boon" },
    { src: null, answer: "Le Père Noël est une ordure", bonus: "1982 · Jean-Marie Poiré" },
    { src: null, answer: "Astérix & Obélix : Mission Cléopâtre", bonus: "2002 · Alain Chabat" },
    { src: null, answer: "Les Tontons flingueurs", bonus: "1963 · Georges Lautner" },
    { src: null, answer: "Kaamelott (série)", bonus: "2005 · Alexandre Astier" },
    { src: null, answer: "La Haine", bonus: "1995 · Mathieu Kassovitz" }
  ],
  pochette: [
    { img: null, answer: "Thriller — Michael Jackson" }, { img: null, answer: "Abbey Road — The Beatles" },
    { img: null, answer: "Nevermind — Nirvana" }, { img: null, answer: "The Dark Side of the Moon — Pink Floyd" },
    { img: null, answer: "Racine carrée — Stromae" }, { img: null, answer: "Back in Black — AC/DC" },
    { img: null, answer: "21 — Adele" }, { img: null, answer: "Brol — Angèle" },
    { img: null, answer: "Random Access Memories — Daft Punk" }, { img: null, answer: "Rumours — Fleetwood Mac" }
  ],
  unenote: [
    { src: null, answer: "Seven Nation Army — The White Stripes" }, { src: null, answer: "A Hard Day's Night — The Beatles (l'accord d'ouverture)" },
    { src: null, answer: "Billie Jean — Michael Jackson" }, { src: null, answer: "Another One Bites the Dust — Queen" },
    { src: null, answer: "Highway to Hell — AC/DC" }, { src: null, answer: "Smoke on the Water — Deep Purple" },
    { src: null, answer: "Sweet Child O' Mine — Guns N' Roses" }, { src: null, answer: "Smells Like Teen Spirit — Nirvana" },
    { src: null, answer: "Satisfaction — The Rolling Stones" }, { src: null, answer: "Thunderstruck — AC/DC" }
  ],
  instruments: [
    { layers: null, answer: "Billie Jean — Michael Jackson" }, { layers: null, answer: "Seven Nation Army — The White Stripes" },
    { layers: null, answer: "Another One Bites the Dust — Queen" }, { layers: null, answer: "Get Lucky — Daft Punk" },
    { layers: null, answer: "Uptown Funk — Mark Ronson & Bruno Mars" }, { layers: null, answer: "Hotel California — Eagles" },
    { layers: null, answer: "Wonderwall — Oasis" }, { layers: null, answer: "Stand by Me — Ben E. King" },
    { layers: null, answer: "Happy — Pharrell Williams" }, { layers: null, answer: "Zombie — The Cranberries" }
  ],
  // Vidéos cultes : la vidéo s'arrête à « stop », puis les questions s'enchaînent (la 2e vaut 1 pt bonus).
  // Questions : QCM { q, o, a } ou nombre { q, n: réponse, u: unité }
  video: [
    { src: null, start: 0, stop: null, label: "Le gilet jaune « Macron destitution… »", qs: [
      { q: "« Macron destitution, Macron… » ? Quel est le mot suivant ?", o: ["Décapitation", "Démission", "Dégage", "Délocalisation"], a: 0 } ] },
    { src: null, start: 0, stop: null, label: "Le drapeau « quadricolore »", qs: [
      { q: "Combien y a-t-il réellement de couleurs primaires ?", o: ["3", "4", "2", "7"], a: 0, f: "Trois : rouge, vert, bleu pour la lumière ; cyan, magenta, jaune en imprimerie. Bleu-blanc-rouge, non." } ] },
    { src: null, start: 0, stop: null, label: "Au forain : « 2 minutes, c'est 100 secondes »", qs: [
      { q: "Combien y a-t-il de secondes dans une journée ?", n: 86400, u: "secondes", f: "86 400 (24 × 60 × 60). Selon le monsieur du forain : 240 000." } ] },
    { src: null, start: 0, stop: null, label: "Reportage sur la Fistinière", qs: [
      { q: "Quel membre de sa famille la dame veut-elle… inviter ?", o: ["[À COMPLÉTER : la bonne réponse]", "Sa belle-mère", "Son beau-frère", "Le chien"], a: 0 } ] },
    { src: null, start: 0, stop: null, label: "« Midi, c'est midi ! Comment elles font les autres ? »", qs: [
      { q: "Pourquoi madame est-elle furieuse contre son mari ?", o: ["Le repas n'est pas à l'heure", "Il a oublié son anniversaire", "Il a vendu la voiture", "Il ronfle"], a: 0 },
      { q: "BONUS : de quelle émission vient cet extrait ?", o: ["Confessions intimes", "Zone interdite", "C'est mon choix", "Tous ensemble"], a: 0, f: "À vérifier sur l'extrait." } ] },
    { src: null, start: 0, stop: null, label: "Nabilla : « Allô ? Non mais allô… »", qs: [
      { q: "« Non mais allô, quoi. T'es une fille et t'as pas de… » ?", o: ["Shampoing", "Rouge à lèvres", "Téléphone", "Mascara"], a: 0 },
      { q: "BONUS : dans quelle émission ?", o: ["Les Anges de la téléréalité", "Secret Story", "Loft Story", "L'Île de la tentation"], a: 0 } ] },
    { src: null, start: 0, stop: null, label: "Nicolas Sarkozy : « Casse-toi, pauvre con »", qs: [
      { q: "Où a été filmée la scène ?", o: ["Au Salon de l'agriculture", "Au Tour de France", "À l'Élysée", "Au Salon de l'auto"], a: 0 },
      { q: "BONUS : en quelle année ?", o: ["2008", "2007", "2010", "2012"], a: 0 } ] },
    { src: null, start: 0, stop: null, label: "Ségolène Royal invente la « bravitude »", qs: [
      { q: "Où prononce-t-elle ce mot ?", o: ["Sur la Grande Muraille de Chine", "Au Machu Picchu", "Devant les pyramides", "Au sommet de la tour Eiffel"], a: 0 },
      { q: "BONUS : en quelle année ?", o: ["2007", "2005", "2012", "2002"], a: 0 } ] },
    { src: null, start: 0, stop: null, label: "Emmanuel Macron : « C'est notre projet ! »", qs: [
      { q: "Complétez : « Parce que c'est notre… » ?", o: ["Projet", "Destin", "Pays", "Avenir"], a: 0 },
      { q: "BONUS : en quelle année ?", o: ["2016", "2017", "2014", "2019"], a: 0 } ] },
    { src: null, start: 0, stop: null, label: "Jean-Claude Van Damme est « aware »", qs: [
      { q: "Quel mot anglais JCVD utilise-t-il pour dire qu'il est conscient ?", o: ["Aware", "Ready", "Awake", "Alive"], a: 0 } ] }
  ]
};
