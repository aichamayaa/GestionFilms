// Notification emails are bilingual (English, then French) because one message goes to many users.
import { traduire } from '../constantes.js';

const LOCALES = { en: 'en-CA', fr: 'fr-CA' };
const SEPARATEUR = '\n\n—————————————\n\n';

function formaterDate(date, langue) {
  return new Date(date).toLocaleDateString(LOCALES[langue], { year: 'numeric', month: 'long', day: 'numeric' });
}

const libelle = (valeur, langue) => (langue === 'fr' ? valeur : traduire(valeur));

function assembler(versions) {
  return {
    sujet: `${versions.en.sujet} / ${versions.fr.sujet}`,
    corps: `${versions.en.corps}${SEPARATEUR}${versions.fr.corps}`,
  };
}

const lignes = (liste) => liste.filter((l) => l !== null).join('\n');

export function courrielAjout({ auteur, film, cible, pourAutrui }) {
  const en = {
    sujet: `New DVD: ${film.titreFrancais}`,
    corps: lignes([
      'Hello,',
      '',
      `${auteur} added the DVD “${film.titreFrancais}”${pourAutrui ? ` for ${cible}` : ''} to the collection.`,
      film.categorie ? `Category: ${libelle(film.categorie, 'en')}` : null,
      film.anneeSortie ? `Release year: ${film.anneeSortie}` : null,
      `Holder: ${cible}`,
      '',
      'Film Management',
    ]),
  };
  const fr = {
    sujet: `Nouveau DVD : ${film.titreFrancais}`,
    corps: lignes([
      'Bonjour,',
      '',
      `${auteur} a ajouté le DVD « ${film.titreFrancais} »${pourAutrui ? ` pour ${cible}` : ''} à la collection.`,
      film.categorie ? `Catégorie : ${libelle(film.categorie, 'fr')}` : null,
      film.anneeSortie ? `Année de sortie : ${film.anneeSortie}` : null,
      `Détenteur : ${cible}`,
      '',
      'Gestion de films',
    ]),
  };
  return assembler({ en, fr });
}

export function courrielSuppression({ auteur, film }) {
  const en = {
    sujet: `DVD removed: ${film.titreFrancais}`,
    corps: lignes([
      'Hello,',
      '',
      `${auteur} removed the DVD “${film.titreFrancais}” from the collection.`,
      film.detenteurNom ? `It was held by: ${film.detenteurNom}` : null,
      '',
      'Film Management',
    ]),
  };
  const fr = {
    sujet: `DVD retiré : ${film.titreFrancais}`,
    corps: lignes([
      'Bonjour,',
      '',
      `${auteur} a retiré le DVD « ${film.titreFrancais} » de la collection.`,
      film.detenteurNom ? `Il était détenu par : ${film.detenteurNom}` : null,
      '',
      'Gestion de films',
    ]),
  };
  return assembler({ en, fr });
}

export function courrielAppropriation({ auteur, film, nouveau, parAutrui, ancienNom }) {
  const en = {
    sujet: `DVD changed hands: ${film.titreFrancais}`,
    corps: lignes([
      'Hello,',
      '',
      `The DVD “${film.titreFrancais}” is now held by ${nouveau}${parAutrui ? ` (action performed by ${auteur})` : ''}.`,
      `It was previously held by: ${ancienNom || 'nobody'}`,
      `Date: ${formaterDate(film.dateMAJ, 'en')}`,
      '',
      'Film Management',
    ]),
  };
  const fr = {
    sujet: `Changement de détenteur du DVD : ${film.titreFrancais}`,
    corps: lignes([
      'Bonjour,',
      '',
      `Le DVD « ${film.titreFrancais} » est maintenant détenu par ${nouveau}${parAutrui ? ` (action effectuée par ${auteur})` : ''}.`,
      `Il était auparavant détenu par : ${ancienNom || 'personne'}`,
      `Date : ${formaterDate(film.dateMAJ, 'fr')}`,
      '',
      'Gestion de films',
    ]),
  };
  return assembler({ en, fr });
}

export function courrielBienvenue({ utilisateur, url }) {
  const en = {
    sujet: 'Welcome to Film Management',
    corps: lignes([
      `Hello ${utilisateur.nom},`,
      '',
      'Your account has been created.',
      `You can sign in with your first name (${utilisateur.nom}) or your email (${utilisateur.courriel}).`,
      `App address: ${url}/connexion`,
      '',
      'Film Management',
    ]),
  };
  const fr = {
    sujet: 'Bienvenue dans Gestion de films',
    corps: lignes([
      `Bonjour ${utilisateur.nom},`,
      '',
      'Votre compte a été créé.',
      `Vous pouvez vous connecter avec votre prénom (${utilisateur.nom}) ou votre courriel (${utilisateur.courriel}).`,
      `Adresse de l’application : ${url}/connexion`,
      '',
      'Gestion de films',
    ]),
  };
  return assembler({ en, fr });
}

export function enteteMessage(signatureEn, signatureFr) {
  return `Message from ${signatureEn} · Message de ${signatureFr}`;
}
