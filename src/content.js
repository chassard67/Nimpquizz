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

// ─── BLIND TESTS / POCHETTES : à remplir plus tard.
//  Audio : { src: "/media/xxx.mp3" (ou URL), answer: "Titre — Artiste", start: 0 }
//  Pochette floutée : { img: "/media/xxx.jpg", answer: "Album — Artiste" }
//  Tant qu'une liste est vide, la case donne une question de Culture G de consolation.
export const MEDIA = {
  bt_actuel: [],
  bt_intemporel: [],
  bt_series: [],
  bt_films: [],
  paroles: [],
  envers: [],
  replique: [],
  pochette: []
};
