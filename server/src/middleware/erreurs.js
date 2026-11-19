import mongoose from 'mongoose';

export class ErreurHttp extends Error {
  constructor(statut, message, erreurs) {
    super(message);
    this.statut = statut;
    this.erreurs = erreurs;
  }
}

export function routeInconnue(req, res) {
  res.status(404).json({ message: 'Resource not found.' });
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
    return res.status(400).json({ message: 'The data provided is not valid.', erreurs });
  }

  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({ message: 'Invalid identifier or value.' });
  }

  if (err && err.code === 11000) {
    const champ = Object.keys(err.keyPattern ?? {})[0];
    if (champ === 'titreFrancais') {
      return res.status(409).json({
        message: 'A DVD with this title already exists.',
        erreurs: { titreFrancais: 'A DVD with this title already exists.' },
      });
    }
    if (champ === 'courriel') {
      return res.status(409).json({
        message: 'This email address is already in use.',
        erreurs: { courriel: 'This email address is already in use.' },
      });
    }
    return res.status(409).json({ message: 'This value already exists.' });
  }

  if (err && err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'The image must not exceed 2 MB.' });
  }

  if (err && err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'The request body is not valid JSON.' });
  }

  console.error(err);
  return res.status(500).json({ message: 'An internal error occurred.' });
}
