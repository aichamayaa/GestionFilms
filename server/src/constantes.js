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

export const ROLES = ['A', 'S', 'U'];

export const COURRIEL_ADMIN = 'admin@gestionfilms.local';

export const NOM_ADMIN = 'admin';

export const MOT_DE_PASSE_ADMIN = '99999';

const LIBELLES_EN = {
  // Categories
  'Action': 'Action',
  'Adolescent': 'Teen',
  'Biographie': 'Biography',
  "Cape et d'épée": 'Swashbuckler',
  'Catastrophe': 'Disaster',
  'Chronique': 'Chronicle',
  'Comédie de moeurs': 'Comedy of manners',
  "Comédie d'horreur": 'Horror comedy',
  'Comédie dramatique': 'Comedy-drama',
  'Comédie fantaisiste': 'Fantasy comedy',
  'Comédie musicale': 'Musical comedy',
  'Comédie policière': 'Crime comedy',
  'Comédie satirique': 'Satirical comedy',
  'Comédie sentimentale': 'Romantic comedy',
  'Comédie': 'Comedy',
  'Criminel': 'Crime',
  'Danse': 'Dance',
  'Dessins animés': 'Cartoons',
  'Documentaire': 'Documentary',
  'Drame de guerre': 'War drama',
  'Drame de moeurs': 'Drama of manners',
  "Drame d'horreur": 'Horror drama',
  'Drame judiciaire': 'Courtroom drama',
  'Drame musical': 'Musical drama',
  'Drame poétique': 'Poetic drama',
  'Drame policier': 'Police drama',
  'Drame psychologique': 'Psychological drama',
  'Drame sentimental': 'Romantic drama',
  'Drame social': 'Social drama',
  'Drame': 'Drama',
  'Espionnage': 'Spy',
  'Expérimental': 'Experimental',
  'Fantastique': 'Fantasy',
  'Film à sketches': 'Sketch film',
  "Film d'animation": 'Animated film',
  "Film d'art martial": 'Martial arts film',
  'Historique': 'Historical',
  'Horreur': 'Horror',
  'Humoristique': 'Humor',
  'Marionnettes': 'Puppets',
  'Mélodrame': 'Melodrama',
  'Musical': 'Musical',
  'Road movie': 'Road movie',
  'Romantique': 'Romance',
  'Science-fiction': 'Science fiction',
  'Série policière': 'Crime series',
  'Série TV': 'TV series',
  "Spectacle d'humour": 'Stand-up comedy',
  'Spectacle musical': 'Music performance',
  'Suspense': 'Suspense',
  'Western': 'Western',
  // Formats
  'Blu-Ray': 'Blu-ray',
  'Normal': 'Standard',
  'Panoramique': 'Widescreen',
  // Languages
  'Français': 'French',
  'Anglais': 'English',
  'Espagnol': 'Spanish',
  // Extras
  'Bande-annonce (Trailer)': 'Trailer',
  'Bande sonore': 'Soundtrack',
  'Commentaires audio': 'Audio commentary',
  'Documentaire sur la création du film': 'Making-of documentary',
  'Fin alternative': 'Alternate ending',
  'Gaffes (Bloopers)': 'Bloopers',
  "Galerie d'images": 'Image gallery',
  'Interprètes et artisans': 'Cast and crew',
  'Montages de prises ratées': 'Outtake reel',
  'Notes de production': 'Production notes',
  "Sauvegarde d'écran": 'Screen saver',
  'Scènes inédites': 'Unreleased scenes',
  'Scènes supprimées': 'Deleted scenes',
  'Sélection des scènes': 'Scene selection',
  'Visionneur de scénario-maquette': 'Storyboard viewer',
};

// Stored values stay in French; this only changes how they appear in emails.
export function traduire(valeur) {
  return LIBELLES_EN[valeur] ?? valeur;
}
