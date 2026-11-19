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
    throw new ErreurHttp(401, 'Authentication required.');
  }

  let charge;
  try {
    charge = jwt.verify(jeton, config.jwtSecret);
  } catch (erreur) {
    const message = erreur.name === 'TokenExpiredError' ? 'Your session has expired.' : 'Invalid token.';
    throw new ErreurHttp(401, message);
  }

  const utilisateur = await User.findById(charge.sub);
  if (!utilisateur) {
    throw new ErreurHttp(401, 'User not found.');
  }

  req.user = utilisateur;
  next();
}

export function exigerRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new ErreurHttp(403, 'You don’t have the permissions needed for this action.');
    }
    next();
  };
}

export function verifierIdParam(nom = 'id') {
  return (req, res, next) => {
    if (!/^[0-9a-fA-F]{24}$/.test(req.params[nom] ?? '')) {
      throw new ErreurHttp(400, 'Invalid identifier.');
    }
    next();
  };
}
