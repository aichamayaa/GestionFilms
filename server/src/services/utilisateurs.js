import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { COURRIEL_ADMIN, NOM_ADMIN, MOT_DE_PASSE_ADMIN } from '../constantes.js';
import { normaliser, premierMot } from './texte.js';

const TOURS_HACHAGE = 10;

export function hacherMotDePasse(motDePasse) {
  return bcrypt.hash(motDePasse, TOURS_HACHAGE);
}

export function comparerMotDePasse(motDePasse, hache) {
  return bcrypt.compare(motDePasse, hache);
}

export function estAdminIntegre(utilisateur) {
  return utilisateur.courriel === COURRIEL_ADMIN;
}

export async function assurerAdminIntegre() {
  const existant = await User.findOne({ courriel: COURRIEL_ADMIN }).select('+motDePasseHache');
  if (!existant) {
    await User.create({
      nom: NOM_ADMIN,
      courriel: COURRIEL_ADMIN,
      motDePasseHache: await hacherMotDePasse(MOT_DE_PASSE_ADMIN),
      role: 'A',
    });
    return;
  }

  const conforme =
    existant.role === 'A' &&
    existant.nom === NOM_ADMIN &&
    (await comparerMotDePasse(MOT_DE_PASSE_ADMIN, existant.motDePasseHache));

  if (!conforme) {
    existant.nom = NOM_ADMIN;
    existant.role = 'A';
    existant.motDePasseHache = await hacherMotDePasse(MOT_DE_PASSE_ADMIN);
    await existant.save();
  }
}

export async function trouverParIdentifiant(identifiant) {
  const recherche = normaliser(identifiant);
  if (!recherche) {
    return { utilisateur: null, ambigu: false };
  }

  const tous = await User.find().select('+motDePasseHache');

  const parCourriel = tous.find((u) => u.courriel === recherche);
  if (parCourriel) {
    return { utilisateur: parCourriel, ambigu: false };
  }

  const parNom = tous.filter((u) => normaliser(u.nom) === recherche);
  if (parNom.length === 1) {
    return { utilisateur: parNom[0], ambigu: false };
  }

  const parPrenom = tous.filter((u) => normaliser(premierMot(u.nom)) === recherche);
  if (parPrenom.length === 1) {
    return { utilisateur: parPrenom[0], ambigu: false };
  }

  return { utilisateur: null, ambigu: parPrenom.length > 1 || parNom.length > 1 };
}

export async function verifierUnicite({ nom, courriel }, idExclu) {
  const erreurs = {};
  const tous = await User.find().select('nom courriel');

  for (const u of tous) {
    if (idExclu && String(u._id) === String(idExclu)) {
      continue;
    }
    if (normaliser(u.nom) === normaliser(nom)) {
      erreurs.nom = 'Ce prénom est déjà utilisé par un autre utilisateur.';
    }
    if (u.courriel === courriel) {
      erreurs.courriel = 'Cette adresse courriel est déjà utilisée.';
    }
  }

  if (normaliser(nom) === normaliser(NOM_ADMIN)) {
    erreurs.nom = 'Ce nom est réservé.';
  }

  return erreurs;
}

export function presenterUtilisateur(utilisateur) {
  const brut = typeof utilisateur.toJSON === 'function' ? utilisateur.toJSON() : utilisateur;
  return {
    _id: String(brut._id),
    nom: brut.nom,
    courriel: brut.courriel,
    role: brut.role,
    preferences: {
      nbFilmsParPage: brut.preferences?.nbFilmsParPage ?? 12,
      courrielSiAjout: brut.preferences?.courrielSiAjout ?? true,
      courrielSiAppropriation: brut.preferences?.courrielSiAppropriation ?? true,
      courrielSiSuppression: brut.preferences?.courrielSiSuppression ?? true,
      couleurFond: brut.preferences?.couleurFond ?? null,
      couleurTexte: brut.preferences?.couleurTexte ?? null,
    },
    integre: brut.courriel === COURRIEL_ADMIN,
    createdAt: brut.createdAt,
  };
}
