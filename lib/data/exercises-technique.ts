import type { ExerciseSeed } from "./types";

// 21 exercices — Technique & conduite de balle (ballon seul ou mur/plots)
export const TECHNIQUE_EXERCISES: ExerciseSeed[] = [
  {
    slug: "toe-taps",
    name: "Touches rapides sur le ballon",
    category: "technique",
    emoji: "⚽",
    description:
      "Touches rapides du dessous du pied sur le ballon immobile, en alternant pied droit et pied gauche. La base du travail d'appuis et de la relation pied-ballon.",
    matchBenefit:
      "Des touches de balle plus rapides et plus sûres dans les petits espaces, sous pression d'un adversaire.",
    steps: [
      "Ballon immobile devant toi, bras légèrement écartés pour l'équilibre.",
      "Pose la semelle du pied droit sur le sommet du ballon, puis remplace-la immédiatement par la semelle gauche.",
      "Alterne en sautillant sur place, sur la pointe du pied d'appui, regard vers l'avant le plus possible.",
      "Commence lentement 20 secondes, puis accélère progressivement sans perdre le contact propre avec le ballon.",
    ],
    mistakes:
      "Regarder le ballon en permanence ; taper le ballon au lieu de le toucher (il ne doit pas bouger) ; rester à plat sur le pied d'appui au lieu d'être sur la pointe.",
    equipment: ["ballon"],
    smallSpaceFriendly: true,
    minAge: 13,
    positions: [],
    variantEasy: "Pose la main sur un mur pour l'équilibre et fais les touches sans sautiller.",
    variantHard: "Toe taps en tournant autour du ballon (sens horaire puis anti-horaire) ou en avançant/reculant.",
    durationMin: 4,
    isFree: true,
  },
  {
    slug: "semelles-alternees",
    name: "Semelles alternées (gauche-droite)",
    category: "technique",
    emoji: "⚽",
    description:
      "Déplacements latéraux du ballon avec la semelle, d'un pied à l'autre. Développe le contrôle sous pression et la mobilité des hanches.",
    matchBenefit:
      "Protège le ballon quand un adversaire arrive dans ton dos — tu changes d'appui sans le perdre.",
    steps: [
      "Ballon entre tes deux pieds, jambes légèrement fléchies.",
      "Avec la semelle du pied droit, roule le ballon vers la gauche.",
      "Bloque-le avec l'intérieur du pied gauche, puis roule-le vers la droite avec la semelle gauche.",
      "Enchaîne en rythme régulier, en restant bas sur tes appuis, buste droit.",
    ],
    mistakes:
      "Se redresser complètement (tu perds la position de jeu) ; frapper le ballon au lieu de le rouler ; laisser le ballon s'éloigner à plus de la largeur des épaules.",
    equipment: ["ballon"],
    smallSpaceFriendly: true,
    minAge: 13,
    positions: [],
    variantEasy: "Roule le ballon plus lentement et bloque-le 1 seconde à chaque passage.",
    variantHard: "Ajoute un déplacement : deux rolls sur place puis deux pas en avant avec le ballon.",
    durationMin: 4,
  },
  {
    slug: "foundations",
    name: "Touches avec l'intérieur du pied",
    category: "technique",
    emoji: "⚽",
    description:
      "Le ballon rebondit entre les deux intérieurs de pied, au ras du sol. L'exercice de base de tous les centres de formation pour le toucher de balle.",
    matchBenefit:
      "Le socle du toucher de balle : plus tu le travailles, moins tu perds le ballon en contrôle serré.",
    steps: [
      "Ballon entre les pieds, jambes fléchies, sur la pointe des pieds.",
      "Pousse le ballon avec l'intérieur du pied droit vers ton pied gauche.",
      "Renvoie-le immédiatement avec l'intérieur du pied gauche.",
      "Trouve un rythme régulier de « ping-pong » entre tes deux pieds, tête levée par intermittence.",
    ],
    mistakes:
      "Toucher le ballon avec la pointe au lieu de l'intérieur du pied ; jambes tendues ; ballon qui s'éloigne parce que les touches sont trop fortes.",
    equipment: ["ballon"],
    smallSpaceFriendly: true,
    minAge: 13,
    positions: [],
    variantEasy: "Un contrôle entre chaque touche : pousse, bloque, pousse.",
    variantHard: "Foundations en avançant sur 10 m puis en reculant, ou au chrono : 60 touches en 30 secondes.",
    durationMin: 4,
    isFree: true,
  },
  {
    slug: "conduite-en-huit",
    name: "Conduite en huit autour de 2 plots",
    category: "technique",
    emoji: "⚽",
    description:
      "Conduite de balle en dessinant un « 8 » autour de deux plots espacés de 3 à 5 mètres. Travaille les deux pieds, les changements de direction et la protection de balle.",
    matchBenefit:
      "Élimine un adversaire en conduite en changeant de direction sans ralentir ni regarder tes pieds.",
    steps: [
      "Place 2 plots (ou des chaussures) espacés de 3 à 5 m.",
      "Conduis le ballon en dessinant un 8 : contourne le premier plot par la droite, le second par la gauche.",
      "Utilise l'extérieur du pied droit dans les courbes à droite, l'extérieur du gauche dans les courbes à gauche.",
      "Petites touches (une par pas), le ballon reste à moins d'un mètre de toi.",
      "2 minutes dans un sens, 2 minutes dans l'autre.",
    ],
    mistakes:
      "Grandes touches qui obligent à courir après le ballon ; n'utiliser que le pied fort ; regarder uniquement le ballon (lève la tête entre deux touches).",
    equipment: ["ballon", "plots"],
    smallSpaceFriendly: true,
    minAge: 13,
    positions: [],
    variantEasy: "Espace les plots de 6-7 m et ralentis dans les virages.",
    variantHard: "Rapproche les plots à 2 m et impose : intérieur du pied uniquement, puis extérieur uniquement, puis pied faible uniquement.",
    durationMin: 6,
  },
  {
    slug: "sole-rolls",
    name: "Rouler le ballon sous la semelle",
    category: "technique",
    emoji: "⚽",
    description:
      "Conduite du ballon vers l'avant en le roulant sous la semelle. Indispensable au futsal et dans les petits espaces du city.",
    matchBenefit:
      "Utile en futsal ou au city où l'espace manque : tu gardes le ballon collé même acculé.",
    steps: [
      "Pose la semelle sur le ballon et roule-le vers l'avant en marchant.",
      "Alterne : trois roulettes du pied droit, trois du pied gauche.",
      "Garde le buste au-dessus du ballon et les genoux fléchis.",
      "Sur 10-15 m, puis reviens en conduite classique.",
    ],
    mistakes:
      "Écraser le ballon au lieu de le rouler ; le pousser trop loin devant ; se pencher en arrière.",
    equipment: ["ballon"],
    smallSpaceFriendly: true,
    minAge: 13,
    positions: [],
    variantEasy: "Roule le ballon sur place (avant-arrière) sans avancer.",
    variantHard: "Enchaîne roulette-stop-changement de direction à chaque 3e contact.",
    durationMin: 4,
  },
  {
    slug: "croquettes",
    name: "Croquettes intérieur-extérieur",
    category: "technique",
    emoji: "⚽",
    description:
      "Enchaînement intérieur puis extérieur du même pied en avançant. Le geste de dribble le plus utilisé en match pour éliminer dans la course.",
    matchBenefit:
      "Le geste le plus utilisé en match pour éliminer un adversaire lancé dans sa course.",
    steps: [
      "En conduite lente, pousse le ballon vers l'intérieur avec l'intérieur du pied droit.",
      "Sur le contact suivant, repousse-le vers l'extérieur avec l'extérieur du même pied.",
      "Le ballon dessine un zigzag serré devant toi.",
      "10 répétitions pied droit, 10 pied gauche, puis en alternant.",
    ],
    mistakes:
      "Toucher trop fort (le zigzag doit rester dans un couloir d'1 m) ; oublier de fléchir la jambe d'appui ; faire l'exercice uniquement du pied fort.",
    equipment: ["ballon"],
    smallSpaceFriendly: true,
    minAge: 13,
    positions: ["AIL", "MOF", "ATT"],
    variantEasy: "Marque un temps d'arrêt entre l'intérieur et l'extérieur.",
    variantHard: "Au signal (compte dans ta tête), enchaîne une croquette + accélération sur 5 m.",
    durationMin: 5,
  },
  {
    slug: "jonglage-pied-fort",
    name: "Jonglage pied fort",
    category: "technique",
    emoji: "⚽",
    description:
      "Jonglage au pied dominant. Le thermomètre de ton toucher de balle : c'est aussi l'un des 4 tests mesurés dans l'app.",
    matchBenefit:
      "Un meilleur toucher de balle général — moins de contrôles ratés, plus de solutions rapides.",
    steps: [
      "Lève le ballon au pied (semelle en arrière puis pointe dessous) ou lâche-le des mains.",
      "Frappe le ballon avec le plat du cou-de-pied, cheville verrouillée, pointe légèrement relevée.",
      "Le ballon doit monter à hauteur de ceinture maximum, avec peu d'effet.",
      "Compte tes touches. Quand tu perds le ballon, repars immédiatement.",
    ],
    mistakes:
      "Cheville molle (le ballon part dans tous les sens) ; frapper avec la pointe ; jongler trop haut ce qui casse le rythme.",
    equipment: ["ballon"],
    smallSpaceFriendly: true,
    minAge: 13,
    positions: [],
    variantEasy: "Un rebond au sol autorisé entre chaque touche.",
    variantHard: "Uniquement des touches en dessous du genou, ou en marchant sur 10 m.",
    durationMin: 5,
    isFree: true,
  },
  {
    slug: "jonglage-pied-faible",
    name: "Jonglage pied faible",
    category: "technique",
    emoji: "⚽",
    description:
      "Jonglage exclusivement du pied faible. Le raccourci le plus efficace pour un pied gauche (ou droit) qui ne te trahit plus en match.",
    matchBenefit:
      "Ton pied faible ne te trahit plus : plus d'options de passe et de contrôle des deux côtés.",
    steps: [
      "Même technique que le pied fort : plat du cou-de-pied, cheville verrouillée.",
      "Accepte de perdre le ballon souvent au début : c'est normal, c'est le prix de la progression.",
      "Objectif : battre ton record de touches à chaque séance, même de 1.",
      "Termine par 10 touches alternées fort/faible pour connecter les deux pieds.",
    ],
    mistakes:
      "Se pencher du mauvais côté ; abandonner après 3 échecs ; compenser en tournant le corps au lieu d'utiliser vraiment le pied faible.",
    equipment: ["ballon"],
    smallSpaceFriendly: true,
    minAge: 13,
    positions: [],
    variantEasy: "Un rebond au sol entre chaque touche du pied faible.",
    variantHard: "Enchaîne 5 touches pied faible + 1 touche cuisse sans faire tomber le ballon.",
    durationMin: 5,
  },
  {
    slug: "jonglage-enchainements",
    name: "Jonglage enchaînements (pieds, cuisses, tête)",
    category: "technique",
    emoji: "⚽",
    description:
      "Circuits de jonglage imposés : pied-pied-cuisse, pied-cuisse-tête… Développe la maîtrise totale du ballon dans toutes les surfaces de contact.",
    matchBenefit:
      "Tu gères n'importe quel ballon qui arrive (au sol, à mi-hauteur, aérien) sans paniquer.",
    steps: [
      "Commence par le circuit simple : pied droit, pied gauche, cuisse droite, cuisse gauche.",
      "Pour la cuisse : ballon frappé à plat au milieu de la cuisse, genou monté à l'horizontale.",
      "Ajoute la tête quand le circuit pieds-cuisses est stable : front, yeux ouverts, jambes fléchies.",
      "Objectif : 3 tours de circuit complets sans faire tomber le ballon.",
    ],
    mistakes:
      "Cuisse inclinée qui envoie le ballon derrière ; tête en arrière sur les touches de front ; précipitation entre les surfaces.",
    equipment: ["ballon"],
    smallSpaceFriendly: true,
    minAge: 13,
    positions: [],
    variantEasy: "Intercale un rebond au sol entre chaque surface.",
    variantHard: "Circuit imposé sans rebond + finir par un contrôle poitrine-reprise de volée douce contre un mur.",
    durationMin: 6,
  },
  {
    slug: "passes-mur-deux-touches",
    name: "Passes contre un mur (2 touches)",
    category: "technique",
    emoji: "⚽",
    description:
      "Contrôle puis passe contre un mur. Le partenaire d'entraînement le plus fiable du monde : il te renvoie toujours le ballon.",
    matchBenefit:
      "Des passes plus précises et un contrôle orienté qui te fait gagner une seconde sur l'adversaire.",
    steps: [
      "Place-toi à 3-5 m d'un mur, une ligne imaginaire au sol comme cible.",
      "Passe de l'intérieur du pied contre le mur, ni trop fort ni trop mou.",
      "Contrôle le retour de l'intérieur du pied opposé (contrôle orienté vers ta prochaine passe).",
      "Repasse du pied qui a contrôlé. Alterne les pieds à chaque aller-retour.",
      "2 séries de 25 passes, en comptant les passes propres.",
    ],
    mistakes:
      "Contrôler et passer du même pied à chaque fois ; ballon contrôlé dans les pieds au lieu de devant soi ; frapper avec la pointe.",
    equipment: ["ballon", "mur"],
    smallSpaceFriendly: true,
    minAge: 13,
    positions: [],
    variantEasy: "Recule à 2 m et bloque complètement le ballon avant chaque passe.",
    variantHard: "Impose le pied faible pour toutes les passes, ou recule à 8 m avec des passes plus appuyées.",
    durationMin: 6,
    isFree: true,
  },
  {
    slug: "passes-mur-une-touche",
    name: "Passes contre un mur (1 touche)",
    category: "technique",
    emoji: "⚽",
    description:
      "Redoublement de passes en une touche contre le mur. Vitesse d'exécution, ajustement des appuis, qualité du premier contact : tout y passe.",
    matchBenefit:
      "Le jeu en une touche qui accélère le jeu de ton équipe et déborde la défense adverse.",
    steps: [
      "À 3-4 m du mur, renvoie le ballon en une touche de l'intérieur du pied.",
      "Ajuste tes appuis entre chaque passe avec des petits pas rapides.",
      "Alterne pied droit et pied gauche à chaque touche quand le rythme est stable.",
      "3 séries de 30 secondes, compte tes passes réussies et bats ton record.",
    ],
    mistakes:
      "Rester statique entre les passes (les appuis doivent danser) ; frapper trop fort ; se tenir face au mur au lieu de légèrement de profil.",
    equipment: ["ballon", "mur"],
    smallSpaceFriendly: true,
    minAge: 13,
    positions: ["MDF", "MOF", "DC", "LAT"],
    variantEasy: "Reviens à 2 touches dès que tu perds le contrôle, puis repasse à 1 touche.",
    variantHard: "Une touche pied faible uniquement, ou alterne ras de terre / petite passe aérienne.",
    durationMin: 5,
  },
  {
    slug: "controle-oriente-mur",
    name: "Contrôle orienté contre mur",
    category: "technique",
    emoji: "⚽",
    description:
      "Frappe contre le mur puis contrôle orienté à 90° pour enchaîner vers une nouvelle direction. Le geste qui fait gagner une seconde sur chaque prise de balle en match.",
    matchBenefit:
      "Tu ne subis plus la première touche : tu ressors déjà orienté vers l'espace libre.",
    steps: [
      "Frappe le ballon contre le mur à hauteur moyenne.",
      "Au retour, oriente ton premier contact vers ta droite (intérieur ou extérieur du pied) au lieu de bloquer le ballon.",
      "Enchaîne 2 touches de conduite dans la direction du contrôle, puis reviens et recommence vers la gauche.",
      "10 contrôles orientés de chaque côté, des deux pieds.",
    ],
    mistakes:
      "Bloquer le ballon puis le pousser (2 gestes au lieu d'1) ; contrôle trop loin du corps ; toujours s'orienter du même côté.",
    equipment: ["ballon", "mur"],
    smallSpaceFriendly: true,
    minAge: 13,
    positions: [],
    variantEasy: "Laisse le ballon rebondir une fois au sol avant le contrôle orienté.",
    variantHard: "Regarde par-dessus ton épaule pendant que le ballon revient (scan), puis oriente à l'opposé de ton regard.",
    durationMin: 6,
  },
  {
    slug: "v-cuts",
    name: "Tirer-pousser le ballon en V",
    category: "technique",
    emoji: "⚽",
    description:
      "Tu tires le ballon en arrière avec la semelle puis tu le pousses en diagonale avec l'intérieur du pied, en dessinant un V. Protège le ballon et élimine un défenseur qui se jette.",
    matchBenefit:
      "Élimine un défenseur qui plonge dans le tacle en protégeant le ballon loin de lui.",
    steps: [
      "Ballon devant toi, tire-le vers toi avec la semelle du pied droit.",
      "Dans le même mouvement, pousse-le en diagonale avant-droite avec l'intérieur du même pied.",
      "Le ballon dessine un V. Refais le geste du pied gauche vers la diagonale avant-gauche.",
      "10 V de chaque pied, puis enchaîne droite-gauche sans pause.",
    ],
    mistakes:
      "Décomposer en deux gestes lents (le tirer-pousser doit être fluide) ; oublier de fléchir les jambes ; ballon poussé trop loin.",
    equipment: ["ballon"],
    smallSpaceFriendly: true,
    minAge: 13,
    positions: ["MOF", "AIL", "ATT", "MDF"],
    variantEasy: "Marque une pause d'une seconde entre le tirage et la poussée.",
    variantHard: "Enchaîne V-cut + accélération 5 m dès que le ballon sort du V.",
    durationMin: 4,
  },
  {
    slug: "pull-push",
    name: "Semelle avant-arrière",
    category: "technique",
    emoji: "⚽",
    description:
      "Aller-retour du ballon sous la semelle : tu le tires vers toi puis le repousses vers l'avant du même pied. Contrôle du tempo et jeu dans les espaces courts.",
    matchBenefit:
      "Casse le rythme d'un adversaire collé à toi pour gagner l'espace d'une passe ou d'un centre.",
    steps: [
      "Tire le ballon vers toi avec la semelle du pied droit.",
      "Repousse-le immédiatement vers l'avant avec le bout de la semelle ou l'intérieur.",
      "Reste sur la pointe du pied d'appui, buste légèrement penché en avant.",
      "30 secondes du pied droit, 30 du gauche, 2 fois.",
    ],
    mistakes:
      "S'appuyer trop fort sur le ballon ; pied d'appui à plat ; regarder ses pieds en permanence.",
    equipment: ["ballon"],
    smallSpaceFriendly: true,
    minAge: 13,
    positions: [],
    variantEasy: "Fais l'exercice en marchant lentement vers l'avant.",
    variantHard: "Alterne pull-push et roll latéral à chaque répétition, en rythme.",
    durationMin: 4,
  },
  {
    slug: "ciseaux",
    name: "Ciseaux (passement de jambes)",
    category: "technique",
    emoji: "⚽",
    description:
      "Le passement de jambe par-dessus le ballon pour déséquilibrer le défenseur. Travaillé d'abord à l'arrêt, puis en mouvement.",
    matchBenefit:
      "Déséquilibre un défenseur en 1 contre 1, surtout sur le côté pour centrer ou percuter.",
    steps: [
      "Ballon immobile : passe le pied droit par-dessus le ballon, de l'intérieur vers l'extérieur.",
      "Repose le pied à côté du ballon et pousse le ballon dans l'autre direction avec l'extérieur du pied gauche.",
      "Le haut du corps doit « mentir » : épaule et hanche partent dans le sens du ciseau.",
      "10 répétitions de chaque jambe à l'arrêt, puis en conduite lente, puis en trottinant.",
    ],
    mistakes:
      "Passer le pied trop haut au-dessus du ballon (perte de temps) ; oublier la feinte du corps qui fait tout le geste ; faire le ciseau trop près du ballon et le toucher.",
    equipment: ["ballon"],
    smallSpaceFriendly: true,
    minAge: 13,
    positions: ["AIL", "ATT", "MOF"],
    variantEasy: "Fais le geste sans ballon pour automatiser la coordination.",
    variantHard: "Double ciseau (droite puis gauche) + sortie extérieur du pied + accélération.",
    durationMin: 5,
  },
  {
    slug: "crochet-court",
    name: "Crochet court intérieur",
    category: "technique",
    emoji: "⚽",
    description:
      "Changement de direction sec avec l'intérieur du pied, ballon collé. Le geste défensif ET offensif le plus rentable dans les petits espaces.",
    matchBenefit:
      "Ressors propre d'un pressing adverse dans les petits espaces, aussi utile pour défendre.",
    steps: [
      "En conduite, coupe la trajectoire du ballon avec l'intérieur du pied droit vers ta gauche (angle de 90°).",
      "Baisse le centre de gravité au moment du crochet : c'est la flexion qui rend le geste sec.",
      "Repars dans la nouvelle direction en 2 touches rapides.",
      "10 crochets de chaque pied, en variant l'angle (90° puis 180°).",
    ],
    mistakes:
      "Crochet en restant haut sur les jambes (le geste devient mou) ; toucher le ballon trop fort ; toujours crocheter du même côté.",
    equipment: ["ballon"],
    smallSpaceFriendly: true,
    minAge: 13,
    positions: [],
    variantEasy: "Fais le crochet à l'arrêt : conduite, stop, crochet, repars en marchant.",
    variantHard: "Crochet à 180° en pleine course, avec un plot comme défenseur imaginaire à contourner.",
    durationMin: 5,
  },
  {
    slug: "cruyff-turn",
    name: "Crochet Cruyff (dans le dos)",
    category: "technique",
    emoji: "⚽",
    description:
      "La feinte de frappe qui devient passement du ballon derrière la jambe d'appui. Un classique pour se retourner dos au but ou éliminer sur un centre annoncé.",
    matchBenefit:
      "Te retourne dos au but sous pression, ou surprend sur un centre annoncé à l'adversaire.",
    steps: [
      "En conduite lente, fais mine d'armer une frappe ou un centre du pied droit.",
      "Au lieu de frapper, passe l'intérieur du pied droit derrière ta jambe d'appui pour pousser le ballon dans ton dos.",
      "Pivote sur la jambe d'appui et repars dans la direction opposée.",
      "8 répétitions de chaque pied, à vitesse lente puis en trottinant.",
    ],
    mistakes:
      "Oublier la feinte de frappe (sans elle, le geste ne trompe personne) ; pousser le ballon trop loin derrière soi ; pivoter avant d'avoir touché le ballon.",
    equipment: ["ballon"],
    smallSpaceFriendly: true,
    minAge: 13,
    positions: ["AIL", "ATT", "MOF", "LAT"],
    variantEasy: "Décompose : feinte, stop, passement, pivot, en marchant.",
    variantHard: "Cruyff turn sous pression imaginaire : sprint 5 m, Cruyff, sprint 5 m dans l'autre sens.",
    durationMin: 5,
  },
  {
    slug: "conduite-tete-levee",
    name: "Conduite balle au pied, tête levée",
    category: "technique",
    emoji: "⚽",
    description:
      "Conduite de balle libre en levant les yeux à chaque touche pour « scanner » l'espace. La compétence invisible qui sépare les joueurs qui subissent de ceux qui décident.",
    matchBenefit:
      "La différence entre subir le jeu et le lire : tu vois la passe avant qu'elle soit possible.",
    steps: [
      "Délimite un carré de 10 m × 10 m (plots, chaussures, lignes du city).",
      "Conduis librement dans le carré : une touche = un regard levé.",
      "Compte mentalement des éléments autour de toi (fenêtres, arbres, paniers) pour forcer le regard à vraiment voir.",
      "Change de direction toutes les 4-5 touches, avec toutes les surfaces du pied.",
    ],
    mistakes:
      "Lever la tête « pour faire semblant » sans rien regarder ; ralentir exagérément quand le regard se lève ; grandes touches pour se faciliter la tâche.",
    equipment: ["ballon", "plots"],
    smallSpaceFriendly: true,
    minAge: 13,
    positions: [],
    variantEasy: "Un regard toutes les 3 touches au lieu de chaque touche.",
    variantHard: "Ajoute un exercice mental : additionne des chiffres imaginaires affichés autour de toi, ou conduis uniquement du pied faible.",
    durationMin: 5,
  },
  {
    slug: "frappe-puissance-mur",
    name: "Frappe en puissance contre un mur",
    category: "technique",
    emoji: "⚽",
    description:
      "Frappe du cou-de-pied contre un mur, en cherchant la puissance sans sacrifier la propreté du geste. La base du tir qu'on ne travaille jamais assez seul.",
    matchBenefit:
      "Un tir plus puissant et mieux cadré dans les derniers mètres — celui qui transforme une occasion en but.",
    steps: [
      "Place-toi à 5-6 m du mur, ballon posé devant toi.",
      "Pose ton pied d'appui à côté du ballon, pointé vers ta cible, genou légèrement fléchi.",
      "Frappe avec le cou-de-pied (le dessus du pied), cheville verrouillée comme une planche.",
      "Regarde le ballon jusqu'au contact, puis termine ton geste en laissant la jambe continuer vers l'avant.",
      "Contrôle le rebond avant de repartir sur la frappe suivante.",
    ],
    mistakes:
      "Cheville molle au contact (le ballon part sans puissance) ; se pencher en arrière ; regarder le mur au lieu du ballon ; frapper de la pointe du pied.",
    equipment: ["ballon", "mur"],
    smallSpaceFriendly: true,
    minAge: 13,
    positions: [],
    variantEasy: "Frappe à 70% de la puissance max, uniquement concentré sur la cheville verrouillée.",
    variantHard: "Enchaîne un contrôle orienté puis une frappe en une touche, pied fort puis pied faible.",
    durationMin: 6,
  },
  {
    slug: "frappe-precision-cibles",
    name: "Frappe de précision sur cibles",
    category: "technique",
    emoji: "⚽",
    description:
      "Deux plots posés au sol comme cibles : la frappe cherche la précision dans les coins plutôt que la puissance pure.",
    matchBenefit:
      "Cadre ses tirs dans les coins, là où le gardien ne peut rien faire — la différence entre une frappe captée et un but.",
    steps: [
      "Place deux plots au sol, espacés d'environ 1 m, à 6-8 m de toi (ils représentent les coins du but).",
      "Ballon posé devant toi, pied d'appui pointé vers ta cible.",
      "Frappe en cherchant à faire passer le ballon juste à côté d'un des deux plots, pas au milieu.",
      "Alterne les cibles à chaque frappe, puis alterne pied fort et pied faible.",
      "Compte tes frappes cadrées sur 10 tentatives et essaie de battre ton score.",
    ],
    mistakes:
      "Toujours viser la même cible (trop prévisible en match) ; regarder la cible au moment du contact au lieu du ballon ; précipiter la frappe sans placer le pied d'appui.",
    equipment: ["ballon", "plots"],
    smallSpaceFriendly: true,
    minAge: 13,
    positions: [],
    variantEasy: "Rapproche les plots à 4-5 m et vise sans contrainte de puissance.",
    variantHard: "Ajoute un contrôle orienté avant chaque frappe, ou recule à 10-12 m.",
    durationMin: 6,
  },
  {
    slug: "frappe-mouvement",
    name: "Frappe en mouvement après conduite courte",
    category: "technique",
    emoji: "⚽",
    description:
      "Quelques touches de conduite puis frappe contre un mur, sans temps d'arrêt — le geste tel qu'il arrive vraiment en match, rarement à l'arrêt.",
    matchBenefit:
      "La plupart des buts se marquent en mouvement, pas ballon à l'arrêt : ce geste rapproche l'entraînement du vrai jeu.",
    steps: [
      "Place-toi à 10-12 m du mur, ballon au pied.",
      "Conduis le ballon vers le mur en 3-4 touches, en accélérant progressivement.",
      "Sur la dernière touche, prépare ton pied d'appui sans ralentir complètement.",
      "Frappe dans la foulée, cheville verrouillée, puis contrôle le rebond pour repartir.",
    ],
    mistakes:
      "S'arrêter complètement avant de frapper (perd tout l'intérêt de l'exercice) ; regarder le mur trop tôt et perdre le contrôle du ballon ; toujours démarrer du même pied.",
    equipment: ["ballon", "mur"],
    smallSpaceFriendly: true,
    minAge: 13,
    positions: ["AIL", "MOF", "ATT", "LAT"],
    variantEasy: "2 touches de conduite au lieu de 3-4, à vitesse modérée.",
    variantHard: "Ajoute un adversaire imaginaire à éviter d'un crochet avant la frappe finale.",
    durationMin: 6,
  },
];
