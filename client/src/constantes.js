export const CATEGORIES = [
  "Action",
  "Adolescent",
  "Biographie",
  "Cape et d'épée",
  "Catastrophe",
  "Chronique",
  "Comédie de moeurs",
  "Comédie d'horreur",
  "Comédie dramatique",
  "Comédie fantaisiste",
  "Comédie musicale",
  "Comédie policière",
  "Comédie satirique",
  "Comédie sentimentale",
  "Comédie",
  "Criminel",
  "Danse",
  "Dessins animés",
  "Documentaire",
  "Drame de guerre",
  "Drame de moeurs",
  "Drame d'horreur",
  "Drame judiciaire",
  "Drame musical",
  "Drame poétique",
  "Drame policier",
  "Drame psychologique",
  "Drame sentimental",
  "Drame social",
  "Drame",
  "Espionnage",
  "Expérimental",
  "Fantastique",
  "Film à sketches",
  "Film d'animation",
  "Film d'art martial",
  "Historique",
  "Horreur",
  "Humoristique",
  "Marionnettes",
  "Mélodrame",
  "Musical",
  "Road movie",
  "Romantique",
  "Science-fiction",
  "Série policière",
  "Série TV",
  "Spectacle d'humour",
  "Spectacle musical",
  "Suspense",
  "Western"
];

export const FORMATS = [
  "Blu-Ray",
  "Normal",
  "Panoramique"
];

export const LANGUES = [
  "Français",
  "Anglais",
  "Espagnol"
];

export const SUPPLEMENTS = [
  "Bande-annonce (Trailer)",
  "Bande sonore",
  "Commentaires audio",
  "Documentaire sur la création du film",
  "Fin alternative",
  "Gaffes (Bloopers)",
  "Galerie d'images",
  "Interprètes et artisans",
  "Montages de prises ratées",
  "Notes de production",
  "Sauvegarde d'écran",
  "Scènes inédites",
  "Scènes supprimées",
  "Sélection des scènes",
  "Visionneur de scénario-maquette"
];

export const ROLES = {
  A: 'Administrateur',
  S: 'Super utilisateur',
  U: 'Utilisateur',
};

export const NB_PAR_PAGE_OPTIONS = Array.from({ length: 32 }, (_, i) => 6 + i * 3);

export const TRIS = [
  { valeur: 'titre', libelle: 'Titre français' },
  { valeur: 'utilisateur', libelle: 'Nom de l’utilisateur' },
  { valeur: 'utilisateur-titre', libelle: 'Nom de l’utilisateur, puis titre' },
];
