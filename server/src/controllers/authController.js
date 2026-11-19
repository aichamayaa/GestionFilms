import { creerJeton } from '../middleware/auth.js';
import { ErreurHttp } from '../middleware/erreurs.js';
import {
  changementMotDePasseSchema,
  connexionSchema,
  preferencesSchema,
  valider,
} from '../validation/schemas.js';
import {
  comparerMotDePasse,
  estAdminIntegre,
  hacherMotDePasse,
  presenterUtilisateur,
  trouverParIdentifiant,
  verifierUnicite,
} from '../services/utilisateurs.js';
import User from '../models/User.js';

const HACHE_BIDON = '$2b$10$CwTycUXWue0Thq9StjUM0uJ8y4Vv1QbJ6nqk6K0k5K6y9pU9s2uXa';

export async function connexion(req, res) {
  const { identifiant, motDePasse } = valider(connexionSchema, req.body);
  const { utilisateur, ambigu } = await trouverParIdentifiant(identifiant);

  if (ambigu) {
    throw new ErreurHttp(401, 'Several users have this first name. Please use your email address instead.');
  }

  const valide = await comparerMotDePasse(motDePasse, utilisateur ? utilisateur.motDePasseHache : HACHE_BIDON);

  if (!utilisateur || !valide) {
    throw new ErreurHttp(401, 'Incorrect username or password.');
  }

  res.json({ token: creerJeton(utilisateur), utilisateur: presenterUtilisateur(utilisateur) });
}

export async function inscription(req, res) {
  const nom = String(req.body.nom ?? '').trim();
  const courriel = String(req.body.courriel ?? '').trim().toLowerCase();
  const motDePasse = String(req.body.motDePasse ?? '');

  if (!nom || !courriel || motDePasse.length < 6) {
    throw new ErreurHttp(400, 'First name, email and password (6 characters minimum) are required.');
  }

  const erreurs = await verifierUnicite({ nom, courriel });
  if (Object.keys(erreurs).length > 0) {
    throw new ErreurHttp(409, Object.values(erreurs)[0], erreurs);
  }

  const utilisateur = await User.create({
    nom,
    courriel,
    motDePasseHache: await hacherMotDePasse(motDePasse),
  });

  res.status(201).json({ utilisateur: presenterUtilisateur(utilisateur) });
}

export async function moi(req, res) {
  res.json({ utilisateur: presenterUtilisateur(req.user) });
}

export async function changerMotDePasse(req, res) {
  if (estAdminIntegre(req.user)) {
    throw new ErreurHttp(403, 'The administrator’s password can’t be changed.');
  }

  const { ancienMotDePasse, nouveauMotDePasse } = valider(changementMotDePasseSchema, req.body);
  const utilisateur = await User.findById(req.user._id).select('+motDePasseHache');

  if (!(await comparerMotDePasse(ancienMotDePasse, utilisateur.motDePasseHache))) {
    throw new ErreurHttp(400, 'The current password is incorrect.', {
      ancienMotDePasse: 'The current password is incorrect.',
    });
  }

  utilisateur.motDePasseHache = await hacherMotDePasse(nouveauMotDePasse);
  await utilisateur.save();

  res.json({ message: 'Your password was changed.' });
}

export async function modifierPreferences(req, res) {
  if (estAdminIntegre(req.user)) {
    throw new ErreurHttp(403, 'The administrator’s data can’t be changed.');
  }

  const donnees = valider(preferencesSchema, req.body);
  const utilisateur = await User.findById(req.user._id);

  utilisateur.preferences.nbFilmsParPage = donnees.nbFilmsParPage;
  utilisateur.preferences.courrielSiAjout = donnees.courrielSiAjout;
  utilisateur.preferences.courrielSiSuppression = donnees.courrielSiSuppression;
  utilisateur.preferences.courrielSiAppropriation = donnees.courrielSiAppropriation;
  utilisateur.preferences.couleurFond = donnees.couleurFond;
  utilisateur.preferences.couleurTexte = donnees.couleurTexte;
  await utilisateur.save();

  res.json({ utilisateur: presenterUtilisateur(utilisateur) });
}