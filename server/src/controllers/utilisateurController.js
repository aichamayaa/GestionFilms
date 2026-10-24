import User from '../models/User.js';
import Film from '../models/Film.js';
import Emprunt from '../models/Emprunt.js';
import { ErreurHttp } from '../middleware/erreurs.js';
import { creationUtilisateurSchema, modificationUtilisateurSchema, valider } from '../validation/schemas.js';
import {
  estAdminIntegre,
  hacherMotDePasse,
  presenterUtilisateur,
  verifierUnicite,
} from '../services/utilisateurs.js';
import { envoyerCourriel } from '../services/courriel.js';
import { COLLATION_FR } from '../services/films.js';
import { COURRIEL_ADMIN } from '../constantes.js';
import { config } from '../config.js';

async function chargerUtilisateur(id) {
  const utilisateur = await User.findById(id);
  if (!utilisateur) {
    throw new ErreurHttp(404, 'Cet utilisateur est introuvable.');
  }
  if (estAdminIntegre(utilisateur)) {
    throw new ErreurHttp(403, 'Les données de l’administrateur ne peuvent pas être modifiées.');
  }
  return utilisateur;
}

export async function annuaire(req, res) {
  const utilisateurs = await User.find({ courriel: { $ne: COURRIEL_ADMIN } })
    .select('nom role')
    .sort({ nom: 1 })
    .collation(COLLATION_FR)
    .lean();

  res.json({ utilisateurs: utilisateurs.map((u) => ({ _id: String(u._id), nom: u.nom, role: u.role })) });
}

export async function lister(req, res) {
  const [utilisateurs, films] = await Promise.all([
    User.find({ courriel: { $ne: COURRIEL_ADMIN } }).sort({ nom: 1 }).collation(COLLATION_FR),
    Film.find().select('proprietaireId detenteurId').lean(),
  ]);

  const possedes = new Map();
  const enMain = new Map();
  for (const film of films) {
    if (film.proprietaireId) {
      const cle = String(film.proprietaireId);
      possedes.set(cle, (possedes.get(cle) ?? 0) + 1);
    }
    if (film.detenteurId) {
      const cle = String(film.detenteurId);
      enMain.set(cle, (enMain.get(cle) ?? 0) + 1);
    }
  }

  res.json({
    utilisateurs: utilisateurs.map((u) => ({
      ...presenterUtilisateur(u),
      nbPossedes: possedes.get(String(u._id)) ?? 0,
      nbEnMain: enMain.get(String(u._id)) ?? 0,
    })),
  });
}

export async function obtenir(req, res) {
  const utilisateur = await chargerUtilisateur(req.params.id);
  res.json({ utilisateur: presenterUtilisateur(utilisateur) });
}

export async function creer(req, res) {
  const donnees = valider(creationUtilisateurSchema, req.body);
  const conflits = await verifierUnicite(donnees);

  if (Object.keys(conflits).length > 0) {
    throw new ErreurHttp(409, 'Ce prénom ou ce courriel existe déjà.', conflits);
  }

  const utilisateur = await User.create({
    nom: donnees.nom,
    courriel: donnees.courriel,
    motDePasseHache: await hacherMotDePasse(donnees.motDePasse),
    role: donnees.role,
  });

  await envoyerCourriel({
    destinataires: [{ nom: utilisateur.nom, courriel: utilisateur.courriel }],
    sujet: 'Bienvenue dans Gestion de films',
    corps: [
      `Bonjour ${utilisateur.nom},`,
      '',
      'Votre compte a été créé.',
      `Vous pouvez vous connecter avec votre prénom (${utilisateur.nom}) ou votre courriel (${utilisateur.courriel}).`,
      `Adresse de l’application : ${config.urlClient}/connexion`,
      '',
      'Gestion de films',
    ].join('\n'),
  });

  res.status(201).json({ utilisateur: presenterUtilisateur(utilisateur) });
}

export async function modifier(req, res) {
  const utilisateur = await chargerUtilisateur(req.params.id);
  const donnees = valider(modificationUtilisateurSchema, req.body);
  const conflits = await verifierUnicite(donnees, utilisateur._id);

  if (Object.keys(conflits).length > 0) {
    throw new ErreurHttp(409, 'Ce prénom ou ce courriel existe déjà.', conflits);
  }

  const ancienNom = utilisateur.nom;
  utilisateur.nom = donnees.nom;
  utilisateur.courriel = donnees.courriel;
  utilisateur.role = donnees.role;
  if (donnees.motDePasse) {
    utilisateur.motDePasseHache = await hacherMotDePasse(donnees.motDePasse);
  }
  await utilisateur.save();

  if (ancienNom !== utilisateur.nom) {
    await Film.updateMany({ detenteurId: utilisateur._id }, { $set: { detenteurNom: utilisateur.nom } });
  }

  res.json({ utilisateur: presenterUtilisateur(utilisateur) });
}

export async function supprimer(req, res) {
  const utilisateur = await chargerUtilisateur(req.params.id);

  if (utilisateur.role === 'A') {
    throw new ErreurHttp(409, 'Un administrateur ne peut pas être supprimé.');
  }

  const [possedes, enMain] = await Promise.all([
    Film.countDocuments({ proprietaireId: utilisateur._id }),
    Film.countDocuments({ detenteurId: utilisateur._id }),
  ]);

  if (possedes > 0 || enMain > 0) {
    throw new ErreurHttp(
      409,
      `Impossible de supprimer ${utilisateur.nom} : cet utilisateur possède ${possedes} DVD(s) et en a ${enMain} en main. Transférez ou supprimez ces DVDs d’abord.`
    );
  }

  await Emprunt.deleteMany({ utilisateurId: utilisateur._id });
  await Film.updateMany({ utilisateurMAJ: utilisateur._id }, { $unset: { utilisateurMAJ: 1 } });
  await User.deleteOne({ _id: utilisateur._id });

  res.json({ message: 'L’utilisateur a été supprimé.' });
}
