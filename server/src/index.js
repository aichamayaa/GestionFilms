import { config } from './config.js';
import { connecter } from './db.js';
import { creerApp } from './app.js';
import { assurerAdminIntegre } from './services/utilisateurs.js';
import { smtpActif } from './services/courriel.js';

async function demarrer() {
  try {
    await connecter();
  } catch (erreur) {
    console.error(`Connexion à MongoDB impossible (${config.mongoUri}) : ${erreur.message}`);
    process.exit(1);
  }

  await assurerAdminIntegre();

  const app = creerApp();
  app.listen(config.port, () => {
    console.log(`API démarrée sur http://localhost:${config.port}`);
    console.log(
      smtpActif()
        ? `Courriels envoyés par le serveur SMTP ${config.smtp.hote}`
        : 'Aucun serveur SMTP configuré : les courriels sont affichés dans la boîte d’envoi de l’application.'
    );
  });
}

demarrer();
