import { z } from 'zod';
import i18n from './i18n/index.js';
import { CATEGORIES, FORMATS, LANGUES, SUPPLEMENTS } from './constantes.js';

// Schemas are built when a form is submitted, so messages use the language currently selected.
const t = (cle, options) => i18n.t(cle, options);

const vide = (valeur) => (typeof valeur === 'string' && valeur.trim() === '') || valeur === null;

const idMongo = () => z.string().regex(/^[0-9a-fA-F]{24}$/, t('val.invalidId'));

const idOptionnel = () => z.preprocess((v) => (vide(v) ? undefined : v), idMongo().optional());

const texteOptionnel = (max, cleLibelle) =>
  z.preprocess(
    (v) => (vide(v) ? undefined : v),
    z.string().trim().max(max, t('val.maxChars', { label: t(cleLibelle), max })).optional()
  );

const entierOptionnel = (min, max, cleLibelle) => {
  const label = t(cleLibelle);
  return z.preprocess(
    (v) => (vide(v) ? undefined : v),
    z.coerce
      .number({ error: t('val.notNumber', { label }) })
      .int(t('val.notInt', { label }))
      .min(min, t('val.min', { label, min }))
      .max(max, t('val.max', { label, max }))
      .optional()
  );
};

const enumOptionnelle = (valeurs, message) =>
  z.preprocess((v) => (vide(v) ? undefined : v), z.enum(valeurs, { error: message }).optional());

const listeEnum = (valeurs, message, max) => {
  let schema = z.array(z.enum(valeurs, { error: message }));
  if (max) {
    schema = schema.max(max, t('val.tooMany', { max }));
  }
  return z.preprocess((v) => (v == null ? [] : v), schema.refine((l) => new Set(l).size === l.length, t('val.duplicates')));
};

const booleenOptionnel = () => z.preprocess((v) => (vide(v) ? undefined : v), z.boolean({ error: t('val.invalidValue') }).optional());

const listeNoms = (max, cleLibelle) =>
  z.preprocess(
    (v) => (Array.isArray(v) ? v.map((x) => (typeof x === 'string' ? x.trim() : x)).filter((x) => x !== '') : v ?? []),
    z
      .array(z.string().max(100, t('val.nameMax')))
      .max(max, t('val.namesMax', { label: t(cleLibelle), max }))
      .refine((noms) => new Set(noms.map((n) => n.toLowerCase())).size === noms.length, t('val.sameName'))
  );

export const filmSchema = () =>
  z.object({
    titreFrancais: z
      .string({ error: t('val.titleRequired') })
      .trim()
      .min(1, t('val.titleRequired'))
      .max(200, t('val.titleMax')),
    titreOriginal: texteOptionnel(200, 'val.l.originalTitle'),
    anneeSortie: entierOptionnel(1888, 2100, 'val.l.year'),
    categorie: enumOptionnelle(CATEGORIES, t('val.invalidCategory')),
    format: enumOptionnelle(FORMATS, t('val.invalidFormat')),
    langues: listeEnum(LANGUES, t('val.invalidLanguage')),
    sousTitres: listeEnum(LANGUES, t('val.invalidSubtitles')),
    supplements: listeEnum(SUPPLEMENTS, t('val.invalidExtra'), 3),
    resume: texteOptionnel(2000, 'val.l.summary'),
    dureeMinutes: entierOptionnel(1, 9999, 'val.l.duration'),
    dvdOriginal: booleenOptionnel(),
    versionEtendue: booleenOptionnel(),
    visibleATous: z.preprocess((v) => (vide(v) || v === undefined ? true : v), z.boolean({ error: t('val.invalidValue') })),
    nbDisques: entierOptionnel(1, 99, 'val.l.discs'),
    imagePochette: z.preprocess(
      (v) => (vide(v) ? undefined : v),
      z
        .string()
        .trim()
        .regex(/^[\w.\-]+$/, t('val.invalidFileName'))
        .max(200)
        .optional()
    ),
    acteurs: listeNoms(3, 'val.l.actors'),
    realisateur: texteOptionnel(100, 'val.l.director'),
    producteur: texteOptionnel(100, 'val.l.producer'),
  });

export const ajoutFilmSchema = () => filmSchema().extend({ pourUtilisateurId: idOptionnel() });

export const appropriationSchema = () => z.object({ nouveauDetenteurId: idOptionnel() });

export const connexionSchema = () =>
  z.object({
    identifiant: z.string({ error: t('val.idRequired') }).trim().min(1, t('val.idRequired')),
    motDePasse: z.string({ error: t('val.pwRequired') }).min(1, t('val.pwRequired')),
  });

const motDePasse = () =>
  z
    .string({ error: t('val.pwRequired') })
    .min(6, t('val.pwMin'))
    .max(100, t('val.pwMax'));

export const changementMotDePasseSchema = () =>
  z
    .object({
      ancienMotDePasse: z.string({ error: t('val.currentPwRequired') }).min(1, t('val.currentPwRequired')),
      nouveauMotDePasse: motDePasse(),
      confirmation: z.string({ error: t('val.confirmRequired') }),
    })
    .refine((d) => d.nouveauMotDePasse === d.confirmation, {
      message: t('val.pwMismatch'),
      path: ['confirmation'],
    });

const couleur = () =>
  z.preprocess(
    (v) => (vide(v) ? undefined : v),
    z
      .string()
      .regex(/^#[0-9a-fA-F]{6}$/, t('val.invalidColor'))
      .optional()
  );

export const preferencesSchema = () =>
  z.object({
    nbFilmsParPage: z.coerce
      .number({ error: t('val.perPageNumber') })
      .int(t('val.perPageInt'))
      .min(6, t('val.perPageMin'))
      .max(99, t('val.perPageMax'))
      .refine((n) => (n - 6) % 3 === 0, t('val.perPageList')),
    courrielSiAjout: z.boolean({ error: t('val.invalidValue') }),
    courrielSiSuppression: z.boolean({ error: t('val.invalidValue') }),
    courrielSiAppropriation: z.boolean({ error: t('val.invalidValue') }),
    couleurFond: couleur(),
    couleurTexte: couleur(),
  });

const nomUtilisateur = () =>
  z
    .string({ error: t('val.firstNameRequired') })
    .trim()
    .min(2, t('val.firstNameMin'))
    .max(60, t('val.firstNameMax'));

const courrielValide = () =>
  z.preprocess(
    (v) => (typeof v === 'string' ? v.trim().toLowerCase() : v),
    z
      .string({ error: t('val.emailRequired') })
      .min(1, t('val.emailRequired'))
      .max(120, t('val.emailMax'))
      .regex(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, t('val.emailInvalid'))
  );

export const creationUtilisateurSchema = () =>
  z
    .object({
      nom: nomUtilisateur(),
      courriel: courrielValide(),
      motDePasse: motDePasse(),
      confirmation: z.string({ error: t('val.confirmRequired') }),
      role: z.preprocess((v) => (vide(v) || v === undefined ? 'U' : v), z.enum(['U', 'S'], { error: t('val.invalidRole') })),
    })
    .refine((d) => d.motDePasse === d.confirmation, {
      message: t('val.pwMismatch'),
      path: ['confirmation'],
    });

export const modificationUtilisateurSchema = () =>
  z
    .object({
      nom: nomUtilisateur(),
      courriel: courrielValide(),
      motDePasse: z.preprocess((v) => (vide(v) ? undefined : v), motDePasse().optional()),
      confirmation: z.preprocess((v) => (vide(v) ? undefined : v), z.string().optional()),
      role: z.enum(['A', 'S', 'U'], { error: t('val.invalidRole') }),
    })
    .refine((d) => d.motDePasse === d.confirmation, {
      message: t('val.pwMismatch'),
      path: ['confirmation'],
    });

export const messageSchema = () =>
  z
    .object({
      destinataires: z.preprocess((v) => v ?? [], z.array(idMongo())),
      tous: z.preprocess((v) => v ?? false, z.boolean()),
      sujet: z
        .string({ error: t('val.subjectRequired') })
        .trim()
        .min(1, t('val.subjectRequired'))
        .max(150, t('val.subjectMax')),
      corps: z
        .string({ error: t('val.messageRequired') })
        .trim()
        .min(1, t('val.messageRequired'))
        .max(5000, t('val.messageMax')),
    })
    .refine((d) => d.tous || d.destinataires.length > 0, {
      message: t('val.chooseRecipient'),
      path: ['destinataires'],
    });

export function validerFormulaire(fabriqueSchema, valeurs) {
  const resultat = fabriqueSchema().safeParse(valeurs ?? {});
  if (resultat.success) {
    return { donnees: resultat.data, erreurs: {} };
  }
  const erreurs = {};
  for (const probleme of resultat.error.issues) {
    const champ = probleme.path.length ? String(probleme.path[0]) : 'general';
    if (!erreurs[champ]) {
      erreurs[champ] = probleme.message;
    }
  }
  return { donnees: null, erreurs };
}
