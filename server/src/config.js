import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dossierServeur = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

dotenv.config({ path: path.join(dossierServeur, '.env'), quiet: true });

export const config = {
  port: Number(process.env.PORT) || 3001,
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/gestion_films',
  jwtSecret: process.env.JWT_SECRET || 'cle-de-developpement-a-remplacer',
  jwtDuree: process.env.JWT_DUREE || '2h',
  urlClient: process.env.URL_CLIENT || 'http://localhost:5173',
  dossierPochettes: path.join(dossierServeur, 'public', 'pochettes'),
  dossierClient: path.resolve(dossierServeur, '..', 'client', 'dist'),
  smtp: {
    hote: process.env.SMTP_HOTE || '',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    utilisateur: process.env.SMTP_UTILISATEUR || '',
    motDePasse: process.env.SMTP_MOT_DE_PASSE || '',
    expediteur: process.env.SMTP_EXPEDITEUR || 'Gestion de films <no-reply@gestionfilms.local>',
  },
};
