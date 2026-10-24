import Film from '../models/Film.js';
import { regexSansAccents } from './texte.js';

export const COLLATION_FR = { locale: 'fr', strength: 1, numericOrdering: true };

export const POPULATION_DETAIL = [
  { path: 'acteurs', select: 'nom sexe' },
  { path: 'realisateurId', select: 'nom' },
  { path: 'producteurId', select: 'nom' },
  { path: 'proprietaireId', select: 'nom' },
  { path: 'detenteurId', select: 'nom' },
  { path: 'utilisateurMAJ', select: 'nom' },
];

function idDe(valeur) {
  if (!valeur) {
    return null;
  }
  return String(valeur._id ?? valeur);
}

export function calculerPermissions(utilisateur, film) {
  const estAdmin = utilisateur.role === 'A';
  const estSuper = utilisateur.role === 'S';
  const detenteurId = idDe(film.detenteurId);
  const detenteurEstMoi = detenteurId !== null && detenteurId === String(utilisateur._id);

  return {
    modifier: estAdmin || estSuper || detenteurEstMoi,
    supprimer: estAdmin || estSuper || detenteurEstMoi,
    approprier: !estAdmin && (estSuper || !detenteurEstMoi),
    ecrire: detenteurId !== null && !detenteurEstMoi,
    detenteurEstMoi,
  };
}

function personne(valeur) {
  if (!valeur || !valeur._id) {
    return null;
  }
  return { _id: String(valeur._id), nom: valeur.nom };
}

export function formaterVignette(film, utilisateur) {
  return {
    _id: String(film._id),
    titreFrancais: film.titreFrancais,
    imagePochette: film.imagePochette ?? null,
    detenteur: film.detenteurId ? { _id: String(film.detenteurId), nom: film.detenteurNom ?? '' } : null,
    permissions: calculerPermissions(utilisateur, film),
  };
}

export function formaterDetail(film, utilisateur) {
  const brut = typeof film.toObject === 'function' ? film.toObject() : film;
  return {
    _id: String(brut._id),
    titreFrancais: brut.titreFrancais,
    titreOriginal: brut.titreOriginal ?? '',
    anneeSortie: brut.anneeSortie ?? null,
    categorie: brut.categorie ?? '',
    format: brut.format ?? '',
    langues: brut.langues ?? [],
    sousTitres: brut.sousTitres ?? [],
    supplements: brut.supplements ?? [],
    resume: brut.resume ?? '',
    dureeMinutes: brut.dureeMinutes ?? null,
    dvdOriginal: brut.dvdOriginal ?? null,
    versionEtendue: brut.versionEtendue ?? null,
    visibleATous: brut.visibleATous ?? true,
    nbDisques: brut.nbDisques ?? null,
    imagePochette: brut.imagePochette ?? null,
    acteurs: (brut.acteurs ?? []).filter((a) => a && a._id).map((a) => ({ _id: String(a._id), nom: a.nom, sexe: a.sexe })),
    realisateur: personne(brut.realisateurId),
    producteur: personne(brut.producteurId),
    proprietaire: personne(brut.proprietaireId),
    detenteur: personne(brut.detenteurId),
    utilisateurMAJ: personne(brut.utilisateurMAJ),
    dateMAJ: brut.dateMAJ ?? null,
    permissions: calculerPermissions(utilisateur, brut),
  };
}

export function filtreVisibilite(utilisateur) {
  if (utilisateur.role === 'A') {
    return {};
  }
  return {
    $or: [{ visibleATous: { $ne: false } }, { proprietaireId: utilisateur._id }, { detenteurId: utilisateur._id }],
  };
}

export function peutVoir(utilisateur, film) {
  if (utilisateur.role === 'A' || film.visibleATous !== false) {
    return true;
  }
  const id = String(utilisateur._id);
  return idDe(film.proprietaireId) === id || idDe(film.detenteurId) === id;
}

export function filtreRecherche(texte) {
  const motif = regexSansAccents(texte);
  return { $or: [{ titreFrancais: motif }, { titreOriginal: motif }] };
}

export function ordreDeTri(tri) {
  if (tri === 'utilisateur') {
    return { detenteurNom: 1, _id: 1 };
  }
  if (tri === 'utilisateur-titre') {
    return { detenteurNom: 1, titreFrancais: 1 };
  }
  return { titreFrancais: 1 };
}

export async function titreExiste(titre, idExclu) {
  const filtre = { titreFrancais: regexSansAccents(titre, { exact: true }) };
  if (idExclu) {
    filtre._id = { $ne: idExclu };
  }
  return Boolean(await Film.exists(filtre));
}
