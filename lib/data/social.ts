// Preuve sociale — UNIQUEMENT du vrai. On n'invente jamais d'avis.
//
// TÉMOIGNAGES : colle ici les VRAIS retours de tes joueurs / bêta-testeurs
// (demande-leur l'autorisation). Tant que le tableau est vide, la section ne
// s'affiche pas — pas de faux avis en ligne.
//
// Format : { quote, name, meta } — name = prénom + initiale, meta = poste/âge/niveau.

export type Testimonial = { quote: string; name: string; meta: string };

export const TESTIMONIALS: Testimonial[] = [
  // Exemple de format (à REMPLACER par de vrais retours, puis décommenter) :
  // { quote: "En 3 semaines je suis passé de 34 à 61 jonglages. Les séances sont courtes et je les fais chez moi.", name: "Rayan M.", meta: "Ailier · U16 · District" },
];

// Endorsement d'un préparateur / coach — à remplir avec le VRAI coach une fois
// le partenariat signé (nom, structure, portée). Laisse `name` vide pour masquer.
export const COACH_ENDORSEMENT = {
  name: "", // ex : "Thomas D." — vide = section masquée
  role: "Préparateur physique",
  reach: "", // ex : "11 M de vues/an"
  quote:
    "Les exercices s'appuient sur des protocoles reconnus (FIFA 11+, prévention des adducteurs). Le dosage est adapté à l'âge — exactement ce qu'il faut pour progresser sans se blesser.",
};

// Seuil à partir duquel on affiche le nombre réel de joueurs (sinon : « membre
// fondateur », honnête quand le volume est encore faible).
export const PLAYER_COUNT_THRESHOLD = 50;
