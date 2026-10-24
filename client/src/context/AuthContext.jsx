import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, definirJeton, definirSurNonAutorise } from '../api/client.js';

const CLE_STOCKAGE = 'gestion-films-jeton';

const AuthContext = createContext(null);

function lireJetonStocke() {
  try {
    return sessionStorage.getItem(CLE_STOCKAGE);
  } catch {
    return null;
  }
}

function ecrireJetonStocke(valeur) {
  try {
    if (valeur) {
      sessionStorage.setItem(CLE_STOCKAGE, valeur);
    } else {
      sessionStorage.removeItem(CLE_STOCKAGE);
    }
  } catch {
    return;
  }
}

function lireExpiration(jeton) {
  try {
    const charge = JSON.parse(atob(jeton.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return charge.exp ? charge.exp * 1000 : null;
  } catch {
    return null;
  }
}

const jetonInitial = lireJetonStocke();
definirJeton(jetonInitial);

export function AuthProvider({ children }) {
  const [jeton, setJeton] = useState(jetonInitial);
  const [utilisateur, setUtilisateur] = useState(null);
  const [pret, setPret] = useState(!jetonInitial);
  const [messageSession, setMessageSession] = useState('');

  const deconnecter = useCallback((message = '') => {
    definirJeton(null);
    ecrireJetonStocke(null);
    setJeton(null);
    setUtilisateur(null);
    setMessageSession(message);
    setPret(true);
  }, []);

  useEffect(() => {
    definirSurNonAutorise((message) => {
      deconnecter(message || 'Votre session a expiré. Veuillez vous reconnecter.');
    });
  }, [deconnecter]);

  useEffect(() => {
    if (!jetonInitial) {
      return undefined;
    }
    const controleur = new AbortController();
    api
      .moi(controleur.signal)
      .then((donnees) => {
        setUtilisateur(donnees.utilisateur);
        setPret(true);
      })
      .catch((erreur) => {
        if (erreur.name === 'AbortError') {
          return;
        }
        deconnecter(erreur.statut === 401 ? 'Votre session a expiré. Veuillez vous reconnecter.' : '');
      });
    return () => controleur.abort();
  }, [deconnecter]);

  useEffect(() => {
    if (!jeton) {
      return undefined;
    }
    const expiration = lireExpiration(jeton);
    if (!expiration) {
      return undefined;
    }
    const delai = Math.max(expiration - Date.now(), 0);
    const minuterie = setTimeout(() => {
      deconnecter('Votre session a expiré. Veuillez vous reconnecter.');
    }, Math.min(delai, 2147483000));
    return () => clearTimeout(minuterie);
  }, [jeton, deconnecter]);

  useEffect(() => {
    const racine = document.documentElement;
    const preferences = utilisateur?.preferences;
    if (preferences?.couleurFond) {
      racine.style.setProperty('--fond-page', preferences.couleurFond);
    } else {
      racine.style.removeProperty('--fond-page');
    }
    if (preferences?.couleurTexte) {
      racine.style.setProperty('--texte-page', preferences.couleurTexte);
    } else {
      racine.style.removeProperty('--texte-page');
    }
  }, [utilisateur]);

  const connecter = useCallback(async (identifiant, motDePasse) => {
    const donnees = await api.connexion(identifiant, motDePasse);
    definirJeton(donnees.token);
    ecrireJetonStocke(donnees.token);
    setMessageSession('');
    setJeton(donnees.token);
    setUtilisateur(donnees.utilisateur);
    setPret(true);
    return donnees.utilisateur;
  }, []);

  const valeur = useMemo(
    () => ({
      jeton,
      utilisateur,
      pret,
      messageSession,
      estAdmin: utilisateur?.role === 'A',
      estSuper: utilisateur?.role === 'S',
      connecter,
      deconnecter: () => deconnecter(''),
      mettreAJourUtilisateur: setUtilisateur,
    }),
    [jeton, utilisateur, pret, messageSession, connecter, deconnecter]
  );

  return <AuthContext.Provider value={valeur}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const contexte = useContext(AuthContext);
  if (!contexte) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider.');
  }
  return contexte;
}
