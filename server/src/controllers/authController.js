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
} from '../services/utilisateurs.js';
import User from '../models/User.js';

const HACHE_BIDON = '$2b$10$CwTycUXWue0Thq9StjUM0uJ8y4Vv1QbJ6nqk6K0k5K6y9pU9s2uXa';

export async function connexion(req, res) {
  const { identifiant, motDePasse } = valider(connexionSchema, req.body);
  const { utilisateur, ambigu } = await trouverParIdentifiant(identifiant);

  if (ambigu) {
    throw new ErreurHttp(401, 'Plusieurs utilisateurs portent ce prénom. Utilisez plutôt votre adresse courriel.');
  }

  const valide = await comparerMotDePasse(motDePasse, utilisateur ? utilisateur.motDePasseHache : HACHE_BIDON);

  if (!utilisateur || !valide) {
    throw new ErreurHttp(401, 'Identifiant ou mot de passe incorrect.');
  }

  res.json({ token: creerJeton(utilisateur), utilisateur: presenterUtilisateur(utilisateur) });
}

export async function moi(req, res) {
  res.json({ utilisateur: presenterUtilisateur(req.user) });
}

export async function changerMotDePasse(req, res) {
  if (estAdminIntegre(req.user)) {
    throw new ErreurHttp(403, 'Le mot de passe de l’administrateur ne peut pas être modifié.');
  }

  const { ancienMotDePasse, nouveauMotDePasse } = valider(changementMotDePasseSchema, req.body);
  const utilisateur = await User.findById(req.user._id).select('+motDePasseHache');

  if (!(await comparerMotDePasse(ancienMotDePasse, utilisateur.motDePasseHache))) {
    throw new ErreurHttp(400, 'L’ancien mot de passe est incorrect.', {
      ancienMotDePasse: 'L’ancien mot de passe est incorrect.',
    });
  }

  utilisateur.motDePasseHache = await hacherMotDePasse(nouveauMotDePasse);
  await utilisateur.save();

  res.json({ message: 'Votre mot de passe a été modifié.' });
}

export async function modifierPreferences(req, res) {
  if (estAdminIntegre(req.user)) {
    throw new ErreurHttp(403, 'Les données de l’administrateur ne peuvent pas être modifiées.');
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
