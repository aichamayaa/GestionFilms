import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { config } from '../config.js';
import { ErreurHttp } from './erreurs.js';

export function creerJeton(utilisateur) {
  return jwt.sign({ sub: String(utilisateur._id), role: utilisateur.role }, config.jwtSecret, {
    expiresIn: config.jwtDuree,
  });
}

export async function authentifier(req, res, next) {
  const entete = req.headers.authorization || '';
  const [type, jeton] = entete.split(' ');

  if (type !== 'Bearer' || !jeton) {
    throw new ErreurHttp(401, 'Authentification requise.');
  }

  let charge;
  try {
    charge = jwt.verify(jeton, config.jwtSecret);
  } catch (erreur) {
    const message = erreur.name === 'TokenExpiredError' ? 'Votre session a expiré.' : 'Jeton non valide.';
    throw new ErreurHttp(401, message);
  }

  const utilisateur = await User.findById(charge.sub);
  if (!utilisateur) {
    throw new ErreurHttp(401, 'Utilisateur introuvable.');
  }

  req.user = utilisateur;
  next();
}

export function exigerRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new ErreurHttp(403, 'Vous n’avez pas les droits nécessaires pour cette action.');
    }
    next();
  };
}

export function verifierIdParam(nom = 'id') {
  return (req, res, next) => {
    if (!/^[0-9a-fA-F]{24}$/.test(req.params[nom] ?? '')) {
      throw new ErreurHttp(400, 'Identifiant non valide.');
    }
    next();
  };
}
