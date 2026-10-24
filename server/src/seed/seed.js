import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import { connecter, deconnecter } from '../db.js';
import User from '../models/User.js';
import Film from '../models/Film.js';
import Acteur from '../models/Acteur.js';
import Realisateur from '../models/Realisateur.js';
import Producteur from '../models/Producteur.js';
import Emprunt from '../models/Emprunt.js';
import { assurerAdminIntegre, hacherMotDePasse } from '../services/utilisateurs.js';

const dossier = path.dirname(fileURLToPath(import.meta.url));
const donnees = JSON.parse(fs.readFileSync(path.join(dossier, 'donnees.json'), 'utf-8'));

function indexerParNom(documents) {
  return new Map(documents.map((d) => [d.nom, d]));
}

function chercher(index, nom, genre) {
  const document = index.get(nom);
  if (!document) {
    throw new Error(`${genre} introuvable dans le jeu de données : ${nom}`);
  }
  return document;
}

async function peupler() {
  await connecter();

  const modeles = [User, Film, Acteur, Realisateur, Producteur, Emprunt];
  await Promise.all(modeles.map((modele) => modele.init()));

  for (const modele of modeles) {
    await modele.deleteMany({});
  }

  await assurerAdminIntegre();

  const utilisateurs = [];
  for (const u of donnees.users) {
    utilisateurs.push(
      await User.create({
        nom: u.nom,
        courriel: u.courriel,
        motDePasseHache: await hacherMotDePasse(u.motDePasse),
        role: u.role,
        preferences: u.preferences,
      })
    );
  }
  const parUtilisateur = indexerParNom(utilisateurs);

  const acteurs = await Acteur.insertMany(donnees.acteurs);
  const realisateurs = await Realisateur.insertMany(donnees.realisateurs);
  const producteurs = await Producteur.insertMany(donnees.producteurs);
  const parActeur = indexerParNom(acteurs);
  const parRealisateur = indexerParNom(realisateurs);
  const parProducteur = indexerParNom(producteurs);

  const films = [];
  for (const f of donnees.films) {
    const detenteur = chercher(parUtilisateur, f.detenteur, 'Utilisateur');
    const film = new Film({
      titreFrancais: f.titreFrancais,
      titreOriginal: f.titreOriginal ?? undefined,
      anneeSortie: f.anneeSortie ?? undefined,
      categorie: f.categorie ?? undefined,
      format: f.format ?? undefined,
      langues: f.langues,
      sousTitres: f.sousTitres,
      supplements: f.supplements,
      resume: f.resume ?? undefined,
      dureeMinutes: f.dureeMinutes ?? undefined,
      dvdOriginal: f.dvdOriginal ?? undefined,
      versionEtendue: f.versionEtendue ?? undefined,
      visibleATous: f.visibleATous ?? true,
      nbDisques: f.nbDisques ?? undefined,
      imagePochette: f.imagePochette ?? undefined,
      acteurs: f.acteurs.map((nom) => chercher(parActeur, nom, 'Acteur')._id),
      realisateurId: chercher(parRealisateur, f.realisateur, 'Réalisateur')._id,
      producteurId: chercher(parProducteur, f.producteur, 'Producteur')._id,
      proprietaireId: chercher(parUtilisateur, f.proprietaire, 'Utilisateur')._id,
      detenteurId: detenteur._id,
      detenteurNom: detenteur.nom,
      utilisateurMAJ: chercher(parUtilisateur, f.utilisateurMAJ, 'Utilisateur')._id,
      dateMAJ: new Date(`${f.dateMAJ}T12:00:00.000Z`),
    });
    films.push(await film.save());
  }
  const parTitre = new Map(films.map((film) => [film.titreFrancais, film]));

  const emprunts = donnees.emprunts.map((e) => ({
    filmId: chercher(new Map([...parTitre].map(([titre, film]) => [titre, { nom: titre, _id: film._id }])), e.film, 'Film')._id,
    utilisateurId: chercher(parUtilisateur, e.utilisateur, 'Utilisateur')._id,
    dateEmprunt: new Date(`${e.dateEmprunt}T12:00:00.000Z`),
  }));
  await Emprunt.insertMany(emprunts);

  console.log('Base de données peuplée :');
  console.log(`  ${utilisateurs.length} utilisateurs (et le compte administrateur intégré)`);
  console.log(`  ${acteurs.length} acteurs, ${realisateurs.length} réalisateurs, ${producteurs.length} producteurs`);
  console.log(`  ${films.length} films`);
  console.log(`  ${emprunts.length} emprunts`);
}

peupler()
  .then(() => deconnecter())
  .catch(async (erreur) => {
    console.error('Échec du peuplement :', erreur.message);
    await mongoose.disconnect();
    process.exit(1);
  });
