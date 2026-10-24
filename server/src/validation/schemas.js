import { z } from 'zod';
import { CATEGORIES, FORMATS, LANGUES, SUPPLEMENTS } from '../constantes.js';
import { ErreurHttp } from '../middleware/erreurs.js';

z.config(z.locales.fr());

const vide = (valeur) => (typeof valeur === 'string' && valeur.trim() === '') || valeur === null;

const idMongo = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Identifiant non valide.');

const idOptionnel = z.preprocess((v) => (vide(v) ? undefined : v), idMongo.optional());

const texteOptionnel = (max, libelle) =>
  z.preprocess(
    (v) => (vide(v) ? undefined : v),
    z.string().trim().max(max, `${libelle} ne doit pas dépasser ${max} caractères.`).optional()
  );

const entierOptionnel = (min, max, libelle) =>
  z.preprocess(
    (v) => (vide(v) ? undefined : v),
    z.coerce
      .number({ error: `${libelle} doit être un nombre.` })
      .int(`${libelle} doit être un nombre entier.`)
      .min(min, `${libelle} doit être au moins ${min}.`)
      .max(max, `${libelle} doit être au plus ${max}.`)
      .optional()
  );

const enumOptionnelle = (valeurs, message) =>
  z.preprocess((v) => (vide(v) ? undefined : v), z.enum(valeurs, { error: message }).optional());

const listeEnum = (valeurs, message, max) => {
  let schema = z.array(z.enum(valeurs, { error: message }));
  if (max) {
    schema = schema.max(max, `Vous ne pouvez pas choisir plus de ${max} éléments.`);
  }
  return z.preprocess((v) => (v == null ? [] : v), schema.refine((l) => new Set(l).size === l.length, 'Valeurs en double.'));
};

const booleenOptionnel = z.preprocess((v) => (vide(v) ? undefined : v), z.boolean({ error: 'Valeur invalide.' }).optional());

const listeNoms = (max, libelle) =>
  z.preprocess(
    (v) => (Array.isArray(v) ? v.map((x) => (typeof x === 'string' ? x.trim() : x)).filter((x) => x !== '') : v ?? []),
    z
      .array(z.string().max(100, 'Un nom ne doit pas dépasser 100 caractères.'))
      .max(max, `${libelle} : ${max} noms au maximum.`)
      .refine(
        (noms) => new Set(noms.map((n) => n.toLowerCase())).size === noms.length,
        'Le même nom ne peut pas être saisi deux fois.'
      )
  );

export const filmSchema = z.object({
  titreFrancais: z
    .string({ error: 'Le titre français est obligatoire.' })
    .trim()
    .min(1, 'Le titre français est obligatoire.')
    .max(200, 'Le titre français ne doit pas dépasser 200 caractères.'),
  titreOriginal: texteOptionnel(200, 'Le titre original'),
  anneeSortie: entierOptionnel(1888, 2100, 'L’année de sortie'),
  categorie: enumOptionnelle(CATEGORIES, 'Catégorie non valide.'),
  format: enumOptionnelle(FORMATS, 'Format non valide.'),
  langues: listeEnum(LANGUES, 'Langue non valide.'),
  sousTitres: listeEnum(LANGUES, 'Sous-titres non valides.'),
  supplements: listeEnum(SUPPLEMENTS, 'Supplément non valide.', 3),
  resume: texteOptionnel(2000, 'Le résumé'),
  dureeMinutes: entierOptionnel(1, 9999, 'La durée'),
  dvdOriginal: booleenOptionnel,
  versionEtendue: booleenOptionnel,
  visibleATous: z.preprocess((v) => (vide(v) || v === undefined ? true : v), z.boolean({ error: 'Valeur invalide.' })),
  nbDisques: entierOptionnel(1, 99, 'Le nombre de disques'),
  imagePochette: z.preprocess(
    (v) => (vide(v) ? undefined : v),
    z
      .string()
      .trim()
      .regex(/^[\w.\-]+$/, 'Nom de fichier non valide.')
      .max(200)
      .optional()
  ),
  acteurs: listeNoms(3, 'Acteurs'),
  realisateur: texteOptionnel(100, 'Le nom du réalisateur'),
  producteur: texteOptionnel(100, 'Le nom du producteur'),
});

export const ajoutFilmSchema = filmSchema.extend({
  pourUtilisateurId: idOptionnel,
});

export const appropriationSchema = z.object({
  nouveauDetenteurId: idOptionnel,
});

export const connexionSchema = z.object({
  identifiant: z.string({ error: 'L’identifiant est obligatoire.' }).trim().min(1, 'L’identifiant est obligatoire.'),
  motDePasse: z.string({ error: 'Le mot de passe est obligatoire.' }).min(1, 'Le mot de passe est obligatoire.'),
});

const motDePasse = z
  .string({ error: 'Le mot de passe est obligatoire.' })
  .min(6, 'Le mot de passe doit contenir au moins 6 caractères.')
  .max(100, 'Le mot de passe ne doit pas dépasser 100 caractères.');

export const changementMotDePasseSchema = z
  .object({
    ancienMotDePasse: z.string({ error: 'L’ancien mot de passe est obligatoire.' }).min(1, 'L’ancien mot de passe est obligatoire.'),
    nouveauMotDePasse: motDePasse,
    confirmation: z.string({ error: 'La confirmation est obligatoire.' }),
  })
  .refine((d) => d.nouveauMotDePasse === d.confirmation, {
    message: 'Les deux mots de passe ne correspondent pas.',
    path: ['confirmation'],
  });

const couleur = z.preprocess(
  (v) => (vide(v) ? undefined : v),
  z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, 'Couleur non valide.')
    .optional()
);

export const preferencesSchema = z.object({
  nbFilmsParPage: z.coerce
    .number({ error: 'Le nombre de DVDs par page doit être un nombre.' })
    .int('Le nombre de DVDs par page doit être un entier.')
    .min(6, 'Le minimum est de 6 DVDs par page.')
    .max(99, 'Le maximum est de 99 DVDs par page.')
    .refine((n) => (n - 6) % 3 === 0, 'Choisissez une valeur proposée dans la liste.'),
  courrielSiAjout: z.boolean({ error: 'Valeur invalide.' }),
  courrielSiSuppression: z.boolean({ error: 'Valeur invalide.' }),
  courrielSiAppropriation: z.boolean({ error: 'Valeur invalide.' }),
  couleurFond: couleur,
  couleurTexte: couleur,
});

const nomUtilisateur = z
  .string({ error: 'Le prénom est obligatoire.' })
  .trim()
  .min(2, 'Le prénom doit contenir au moins 2 caractères.')
  .max(60, 'Le prénom ne doit pas dépasser 60 caractères.');

const courrielValide = z.preprocess(
  (v) => (typeof v === 'string' ? v.trim().toLowerCase() : v),
  z
    .string({ error: 'Le courriel est obligatoire.' })
    .min(1, 'Le courriel est obligatoire.')
    .max(120, 'Le courriel ne doit pas dépasser 120 caractères.')
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, 'Le courriel n’est pas valide.')
);

export const creationUtilisateurSchema = z
  .object({
    nom: nomUtilisateur,
    courriel: courrielValide,
    motDePasse,
    confirmation: z.string({ error: 'La confirmation est obligatoire.' }),
    role: z.preprocess((v) => (vide(v) || v === undefined ? 'U' : v), z.enum(['U', 'S'], { error: 'Rôle non valide.' })),
  })
  .refine((d) => d.motDePasse === d.confirmation, {
    message: 'Les deux mots de passe ne correspondent pas.',
    path: ['confirmation'],
  });

export const modificationUtilisateurSchema = z
  .object({
    nom: nomUtilisateur,
    courriel: courrielValide,
    motDePasse: z.preprocess((v) => (vide(v) ? undefined : v), motDePasse.optional()),
    confirmation: z.preprocess((v) => (vide(v) ? undefined : v), z.string().optional()),
    role: z.enum(['A', 'S', 'U'], { error: 'Rôle non valide.' }),
  })
  .refine((d) => d.motDePasse === d.confirmation, {
    message: 'Les deux mots de passe ne correspondent pas.',
    path: ['confirmation'],
  });

export const messageSchema = z
  .object({
    destinataires: z.preprocess((v) => v ?? [], z.array(idMongo)),
    tous: z.preprocess((v) => v ?? false, z.boolean()),
    sujet: z
      .string({ error: 'L’objet est obligatoire.' })
      .trim()
      .min(1, 'L’objet est obligatoire.')
      .max(150, 'L’objet ne doit pas dépasser 150 caractères.'),
    corps: z
      .string({ error: 'Le message est obligatoire.' })
      .trim()
      .min(1, 'Le message est obligatoire.')
      .max(5000, 'Le message ne doit pas dépasser 5000 caractères.'),
  })
  .refine((d) => d.tous || d.destinataires.length > 0, {
    message: 'Choisissez au moins un destinataire.',
    path: ['destinataires'],
  });

export function valider(schema, donnees) {
  const resultat = schema.safeParse(donnees ?? {});
  if (resultat.success) {
    return resultat.data;
  }
  const erreurs = {};
  for (const probleme of resultat.error.issues) {
    const champ = probleme.path.length ? String(probleme.path[0]) : 'general';
    if (!erreurs[champ]) {
      erreurs[champ] = probleme.message;
    }
  }
  throw new ErreurHttp(400, 'Les données fournies ne sont pas valides.', erreurs);
}
