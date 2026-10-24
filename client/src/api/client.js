let jeton = null;
let surNonAutorise = () => {};

export class ErreurApi extends Error {
  constructor(statut, message, erreurs) {
    super(message);
    this.statut = statut;
    this.erreurs = erreurs ?? {};
  }
}

export function definirJeton(valeur) {
  jeton = valeur;
}

export function definirSurNonAutorise(fonction) {
  surNonAutorise = fonction;
}

async function requete(methode, chemin, { corps, formData, signal } = {}) {
  const entetes = {};
  if (jeton) {
    entetes.Authorization = `Bearer ${jeton}`;
  }

  let body;
  if (formData) {
    body = formData;
  } else if (corps !== undefined) {
    entetes['Content-Type'] = 'application/json';
    body = JSON.stringify(corps);
  }

  let reponse;
  try {
    reponse = await fetch(`/api${chemin}`, { method: methode, headers: entetes, body, signal });
  } catch (erreur) {
    if (erreur.name === 'AbortError') {
      throw erreur;
    }
    throw new ErreurApi(0, 'Impossible de joindre le serveur. Vérifiez que l’API est démarrée.');
  }

  let donnees = null;
  try {
    donnees = await reponse.json();
  } catch {
    donnees = null;
  }

  if (!reponse.ok) {
    if (reponse.status === 401 && jeton && chemin !== '/auth/connexion') {
      surNonAutorise(donnees?.message);
    }
    throw new ErreurApi(reponse.status, donnees?.message ?? 'Une erreur est survenue.', donnees?.erreurs);
  }

  return donnees;
}

function chaineRequete(parametres) {
  const recherche = new URLSearchParams();
  for (const [cle, valeur] of Object.entries(parametres)) {
    if (valeur !== undefined && valeur !== null && valeur !== '') {
      recherche.set(cle, String(valeur));
    }
  }
  const texte = recherche.toString();
  return texte ? `?${texte}` : '';
}

export const api = {
  connexion: (identifiant, motDePasse) => requete('POST', '/auth/connexion', { corps: { identifiant, motDePasse } }),
  moi: (signal) => requete('GET', '/auth/moi', { signal }),
  changerMotDePasse: (corps) => requete('PUT', '/auth/mot-de-passe', { corps }),
  modifierPreferences: (corps) => requete('PUT', '/auth/preferences', { corps }),

  listerFilms: (parametres, signal) => requete('GET', `/films${chaineRequete(parametres)}`, { signal }),
  obtenirFilm: (id, signal) => requete('GET', `/films/${id}`, { signal }),
  ajouterFilm: (corps) => requete('POST', '/films', { corps }),
  modifierFilm: (id, corps) => requete('PUT', `/films/${id}`, { corps }),
  supprimerFilm: (id) => requete('DELETE', `/films/${id}`),
  approprierFilm: (id, corps) => requete('POST', `/films/${id}/appropriation`, { corps }),
  historiqueFilm: (id, signal) => requete('GET', `/films/${id}/emprunts`, { signal }),

  personnes: (signal) => requete('GET', '/personnes', { signal }),
  televerserPochette: (fichier) => {
    const formData = new FormData();
    formData.append('image', fichier);
    return requete('POST', '/pochettes', { formData });
  },

  annuaire: (signal) => requete('GET', '/utilisateurs/annuaire', { signal }),
  listerUtilisateurs: (signal) => requete('GET', '/utilisateurs', { signal }),
  obtenirUtilisateur: (id, signal) => requete('GET', `/utilisateurs/${id}`, { signal }),
  creerUtilisateur: (corps) => requete('POST', '/utilisateurs', { corps }),
  modifierUtilisateur: (id, corps) => requete('PUT', `/utilisateurs/${id}`, { corps }),
  supprimerUtilisateur: (id) => requete('DELETE', `/utilisateurs/${id}`),

  envoyerCourriel: (corps) => requete('POST', '/courriels', { corps }),
  boiteEnvoi: (signal) => requete('GET', '/courriels/boite', { signal }),
};
