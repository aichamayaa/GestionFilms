import { config } from './config.js';
import { connecter } from './db.js';
import { creerApp } from './app.js';
import { assurerAdminIntegre } from './services/utilisateurs.js';
import { smtpActif } from './services/courriel.js';

const app = creerApp();

let pret = null;
function preparer() {
  pret ??= (async () => {
    await connecter();
    await assurerAdminIntegre();
  })();
  return pret;
}

if (!process.env.VERCEL) {
  try {
    await preparer();
  } catch (erreur) {
    console.error(`Connexion à MongoDB impossible : ${erreur.message}`);
    process.exit(1);
  }
  app.listen(config.port, () => {
    console.log(`API démarrée sur http://localhost:${config.port}`);
    console.log(smtpActif() ? `Courriels envoyés par ${config.smtp.hote}` : 'Aucun serveur SMTP configuré.');
  });
}

export default async function handler(req, res) {
  try {
    await preparer();
    return app(req, res);
  } catch (erreur) {
    pret = null;
    console.error(erreur);
    res.status(500).json({ message: 'Erreur de connexion à la base de données.' });
  }
}