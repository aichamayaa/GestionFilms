import mongoose from 'mongoose';

export class ErreurHttp extends Error {
  constructor(statut, message, erreurs) {
    super(message);
    this.statut = statut;
    this.erreurs = erreurs;
  }
}

export function routeInconnue(req, res) {
  res.status(404).json({ message: 'Ressource introuvable.' });
}

export function gestionnaireErreurs(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof ErreurHttp) {
    return res.status(err.statut).json({ message: err.message, erreurs: err.erreurs });
  }

  if (err instanceof mongoose.Error.ValidationError) {
    const erreurs = {};
    for (const [champ, detail] of Object.entries(err.errors)) {
      erreurs[champ] = detail.message;
    }
    return res.status(400).json({ message: 'Les données fournies ne sont pas valides.', erreurs });
  }

  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({ message: 'Identifiant ou valeur non valide.' });
  }

  if (err && err.code === 11000) {
    const champ = Object.keys(err.keyPattern ?? {})[0];
    if (champ === 'titreFrancais') {
      return res.status(409).json({
        message: 'Un DVD portant ce titre existe déjà.',
        erreurs: { titreFrancais: 'Un DVD portant ce titre existe déjà.' },
      });
    }
    if (champ === 'courriel') {
      return res.status(409).json({
        message: 'Cette adresse courriel est déjà utilisée.',
        erreurs: { courriel: 'Cette adresse courriel est déjà utilisée.' },
      });
    }
    return res.status(409).json({ message: 'Cette valeur existe déjà.' });
  }

  if (err && err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'L’image ne doit pas dépasser 2 Mo.' });
  }

  if (err && err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Le corps de la requête n’est pas du JSON valide.' });
  }

  console.error(err);
  return res.status(500).json({ message: 'Une erreur interne est survenue.' });
}
