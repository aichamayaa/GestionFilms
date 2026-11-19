import { z } from 'zod';
import { CATEGORIES, FORMATS, LANGUES, SUPPLEMENTS } from '../constantes.js';
import { ErreurHttp } from '../middleware/erreurs.js';

z.config(z.locales.en());

const vide = (valeur) => (typeof valeur === 'string' && valeur.trim() === '') || valeur === null;

const idMongo = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid identifier.');

const idOptionnel = z.preprocess((v) => (vide(v) ? undefined : v), idMongo.optional());

const texteOptionnel = (max, libelle) =>
  z.preprocess(
    (v) => (vide(v) ? undefined : v),
    z.string().trim().max(max, `${libelle} must not exceed ${max} characters.`).optional()
  );

const entierOptionnel = (min, max, libelle) =>
  z.preprocess(
    (v) => (vide(v) ? undefined : v),
    z.coerce
      .number({ error: `${libelle} must be a number.` })
      .int(`${libelle} must be a whole number.`)
      .min(min, `${libelle} must be at least ${min}.`)
      .max(max, `${libelle} must be at most ${max}.`)
      .optional()
  );

const enumOptionnelle = (valeurs, message) =>
  z.preprocess((v) => (vide(v) ? undefined : v), z.enum(valeurs, { error: message }).optional());

const listeEnum = (valeurs, message, max) => {
  let schema = z.array(z.enum(valeurs, { error: message }));
  if (max) {
    schema = schema.max(max, `You can’t choose more than ${max} items.`);
  }
  return z.preprocess((v) => (v == null ? [] : v), schema.refine((l) => new Set(l).size === l.length, 'Duplicate values.'));
};

const booleenOptionnel = z.preprocess((v) => (vide(v) ? undefined : v), z.boolean({ error: 'Invalid value.' }).optional());

const listeNoms = (max, libelle) =>
  z.preprocess(
    (v) => (Array.isArray(v) ? v.map((x) => (typeof x === 'string' ? x.trim() : x)).filter((x) => x !== '') : v ?? []),
    z
      .array(z.string().max(100, 'A name must not exceed 100 characters.'))
      .max(max, `${libelle}: ${max} names maximum.`)
      .refine(
        (noms) => new Set(noms.map((n) => n.toLowerCase())).size === noms.length,
        'The same name can’t be entered twice.'
      )
  );

export const filmSchema = z.object({
  titreFrancais: z
    .string({ error: 'The French title is required.' })
    .trim()
    .min(1, 'The French title is required.')
    .max(200, 'The French title must not exceed 200 characters.'),
  titreOriginal: texteOptionnel(200, 'The original title'),
  anneeSortie: entierOptionnel(1888, 2100, 'The release year'),
  categorie: enumOptionnelle(CATEGORIES, 'Invalid category.'),
  format: enumOptionnelle(FORMATS, 'Invalid format.'),
  langues: listeEnum(LANGUES, 'Invalid language.'),
  sousTitres: listeEnum(LANGUES, 'Invalid subtitles.'),
  supplements: listeEnum(SUPPLEMENTS, 'Invalid extra.', 3),
  resume: texteOptionnel(2000, 'The summary'),
  dureeMinutes: entierOptionnel(1, 9999, 'The duration'),
  dvdOriginal: booleenOptionnel,
  versionEtendue: booleenOptionnel,
  visibleATous: z.preprocess((v) => (vide(v) || v === undefined ? true : v), z.boolean({ error: 'Invalid value.' })),
  nbDisques: entierOptionnel(1, 99, 'The number of discs'),
  imagePochette: z.preprocess(
    (v) => (vide(v) ? undefined : v),
    z
      .string()
      .trim()
      .regex(/^[\w.\-]+$/, 'Invalid file name.')
      .max(200)
      .optional()
  ),
  acteurs: listeNoms(3, 'Actors'),
  realisateur: texteOptionnel(100, 'The director’s name'),
  producteur: texteOptionnel(100, 'The producer’s name'),
});

export const ajoutFilmSchema = filmSchema.extend({
  pourUtilisateurId: idOptionnel,
});

export const appropriationSchema = z.object({
  nouveauDetenteurId: idOptionnel,
});

export const connexionSchema = z.object({
  identifiant: z.string({ error: 'First name or email is required.' }).trim().min(1, 'First name or email is required.'),
  motDePasse: z.string({ error: 'The password is required.' }).min(1, 'The password is required.'),
});

const motDePasse = z
  .string({ error: 'The password is required.' })
  .min(6, 'The password must be at least 6 characters.')
  .max(100, 'The password must not exceed 100 characters.');

export const changementMotDePasseSchema = z
  .object({
    ancienMotDePasse: z.string({ error: 'The current password is required.' }).min(1, 'The current password is required.'),
    nouveauMotDePasse: motDePasse,
    confirmation: z.string({ error: 'Confirmation is required.' }),
  })
  .refine((d) => d.nouveauMotDePasse === d.confirmation, {
    message: 'The two passwords don’t match.',
    path: ['confirmation'],
  });

const couleur = z.preprocess(
  (v) => (vide(v) ? undefined : v),
  z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, 'Invalid color.')
    .optional()
);

export const preferencesSchema = z.object({
  nbFilmsParPage: z.coerce
    .number({ error: 'The number of DVDs per page must be a number.' })
    .int('The number of DVDs per page must be a whole number.')
    .min(6, 'The minimum is 6 DVDs per page.')
    .max(99, 'The maximum is 99 DVDs per page.')
    .refine((n) => (n - 6) % 3 === 0, 'Choose a value from the list.'),
  courrielSiAjout: z.boolean({ error: 'Invalid value.' }),
  courrielSiSuppression: z.boolean({ error: 'Invalid value.' }),
  courrielSiAppropriation: z.boolean({ error: 'Invalid value.' }),
  couleurFond: couleur,
  couleurTexte: couleur,
});

const nomUtilisateur = z
  .string({ error: 'First name is required.' })
  .trim()
  .min(2, 'First name must be at least 2 characters.')
  .max(60, 'First name must not exceed 60 characters.');

const courrielValide = z.preprocess(
  (v) => (typeof v === 'string' ? v.trim().toLowerCase() : v),
  z
    .string({ error: 'Email is required.' })
    .min(1, 'Email is required.')
    .max(120, 'Email must not exceed 120 characters.')
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, 'Email is not valid.')
);

export const creationUtilisateurSchema = z
  .object({
    nom: nomUtilisateur,
    courriel: courrielValide,
    motDePasse,
    confirmation: z.string({ error: 'Confirmation is required.' }),
    role: z.preprocess((v) => (vide(v) || v === undefined ? 'U' : v), z.enum(['U', 'S'], { error: 'Invalid role.' })),
  })
  .refine((d) => d.motDePasse === d.confirmation, {
    message: 'The two passwords don’t match.',
    path: ['confirmation'],
  });

export const modificationUtilisateurSchema = z
  .object({
    nom: nomUtilisateur,
    courriel: courrielValide,
    motDePasse: z.preprocess((v) => (vide(v) ? undefined : v), motDePasse.optional()),
    confirmation: z.preprocess((v) => (vide(v) ? undefined : v), z.string().optional()),
    role: z.enum(['A', 'S', 'U'], { error: 'Invalid role.' }),
  })
  .refine((d) => d.motDePasse === d.confirmation, {
    message: 'The two passwords don’t match.',
    path: ['confirmation'],
  });

export const messageSchema = z
  .object({
    destinataires: z.preprocess((v) => v ?? [], z.array(idMongo)),
    tous: z.preprocess((v) => v ?? false, z.boolean()),
    sujet: z
      .string({ error: 'Subject is required.' })
      .trim()
      .min(1, 'Subject is required.')
      .max(150, 'Subject must not exceed 150 characters.'),
    corps: z
      .string({ error: 'Message is required.' })
      .trim()
      .min(1, 'Message is required.')
      .max(5000, 'Message must not exceed 5000 characters.'),
  })
  .refine((d) => d.tous || d.destinataires.length > 0, {
    message: 'Choose at least one recipient.',
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
  throw new ErreurHttp(400, 'The data provided is not valid.', erreurs);
}
