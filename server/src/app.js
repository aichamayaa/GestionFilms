import express from 'express';
import cors from 'cors';
import fs from 'node:fs';
import path from 'node:path';
import { config } from './config.js';
import { gestionnaireErreurs, routeInconnue } from './middleware/erreurs.js';
import authRoutes from './routes/auth.js';
import filmRoutes from './routes/films.js';
import utilisateurRoutes from './routes/utilisateurs.js';
import courrielRoutes from './routes/courriels.js';
import personneRoutes from './routes/personnes.js';
import pochetteRoutes from './routes/pochettes.js';

export function creerApp() {
  const app = express();

  fs.mkdirSync(config.dossierPochettes, { recursive: true });

  app.use(cors({ origin: config.urlClient }));
  app.use(express.json({ limit: '1mb' }));

  app.use('/pochettes', express.static(config.dossierPochettes, { maxAge: '1d' }));

  app.get('/api/sante', (req, res) => res.json({ statut: 'ok' }));
  app.use('/api/auth', authRoutes);
  app.use('/api/films', filmRoutes);
  app.use('/api/utilisateurs', utilisateurRoutes);
  app.use('/api/courriels', courrielRoutes);
  app.use('/api/personnes', personneRoutes);
  app.use('/api/pochettes', pochetteRoutes);
  app.use('/api', routeInconnue);

  const indexClient = path.join(config.dossierClient, 'index.html');
  if (fs.existsSync(indexClient)) {
    app.use(express.static(config.dossierClient));
    app.use((req, res, next) => {
      if (req.method !== 'GET' || req.path.startsWith('/pochettes')) {
        return next();
      }
      res.sendFile(indexClient);
    });
  }

  app.use(gestionnaireErreurs);

  return app;
}
