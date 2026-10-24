import Acteur from '../models/Acteur.js';
import Realisateur from '../models/Realisateur.js';
import Producteur from '../models/Producteur.js';
import { regexSansAccents } from './texte.js';

async function trouverOuCreer(Modele, nom, donneesSupplementaires = {}) {
  const existant = await Modele.findOne({ nom: regexSansAccents(nom, { exact: true }) });
  if (existant) {
    return existant;
  }
  return Modele.create({ nom, ...donneesSupplementaires });
}

export async function resoudreActeurs(noms) {
  const ids = [];
  for (const nom of noms) {
    const acteur = await trouverOuCreer(Acteur, nom, { sexe: 'N' });
    if (!ids.some((id) => String(id) === String(acteur._id))) {
      ids.push(acteur._id);
    }
  }
  return ids;
}

export async function resoudreRealisateur(nom) {
  if (!nom) {
    return undefined;
  }
  const personne = await trouverOuCreer(Realisateur, nom);
  return personne._id;
}

export async function resoudreProducteur(nom) {
  if (!nom) {
    return undefined;
  }
  const personne = await trouverOuCreer(Producteur, nom);
  return personne._id;
}

export async function listerNoms() {
  const [acteurs, realisateurs, producteurs] = await Promise.all([
    Acteur.find().select('nom').sort({ nom: 1 }).collation({ locale: 'fr', strength: 1 }).lean(),
    Realisateur.find().select('nom').sort({ nom: 1 }).collation({ locale: 'fr', strength: 1 }).lean(),
    Producteur.find().select('nom').sort({ nom: 1 }).collation({ locale: 'fr', strength: 1 }).lean(),
  ]);
  return {
    acteurs: acteurs.map((p) => p.nom),
    realisateurs: realisateurs.map((p) => p.nom),
    producteurs: producteurs.map((p) => p.nom),
  };
}
