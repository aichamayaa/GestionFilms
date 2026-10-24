import User from '../models/User.js';
import { ErreurHttp } from '../middleware/erreurs.js';
import { messageSchema, valider } from '../validation/schemas.js';
import { envoyerCourriel, lireBoite, smtpActif } from '../services/courriel.js';
import { estAdminIntegre } from '../services/utilisateurs.js';
import { COURRIEL_ADMIN } from '../constantes.js';

export async function envoyer(req, res) {
  const donnees = valider(messageSchema, req.body);

  let destinataires;
  if (donnees.tous) {
    destinataires = await User.find({ courriel: { $ne: COURRIEL_ADMIN }, _id: { $ne: req.user._id } }).select('nom courriel');
  } else {
    destinataires = await User.find({
      _id: { $in: donnees.destinataires },
      courriel: { $ne: COURRIEL_ADMIN },
    }).select('nom courriel');
  }

  if (destinataires.length === 0) {
    throw new ErreurHttp(400, 'Aucun destinataire valide.', { destinataires: 'Aucun destinataire valide.' });
  }

  const signature = estAdminIntegre(req.user)
    ? 'L’administrateur'
    : `${req.user.nom} (${req.user.courriel})`;

  const entree = await envoyerCourriel({
    destinataires,
    sujet: donnees.sujet,
    corps: `Message de ${signature}\n\n${donnees.corps}`,
    expediteur: { nom: req.user.nom, courriel: estAdminIntegre(req.user) ? null : req.user.courriel },
    repondreA: estAdminIntegre(req.user) ? undefined : req.user.courriel,
  });

  res.status(201).json({ envoi: entree, simulation: !smtpActif() });
}

export async function boite(req, res) {
  res.json({ simulation: !smtpActif(), courriels: lireBoite() });
}
