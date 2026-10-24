import { useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import { api } from '../api/client.js';

export function useFilm(id) {
  const [etat, setEtat] = useState({ film: null, erreur: '', chargement: true });

  useEffect(() => {
    const controleur = new AbortController();
    setEtat({ film: null, erreur: '', chargement: true });
    api
      .obtenirFilm(id, controleur.signal)
      .then((donnees) => setEtat({ film: donnees.film, erreur: '', chargement: false }))
      .catch((erreur) => {
        if (erreur.name === 'AbortError') {
          return;
        }
        setEtat({ film: null, erreur: erreur.message, chargement: false });
      });
    return () => controleur.abort();
  }, [id]);

  return etat;
}

export function useAnnuaire(actif = true) {
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [chargement, setChargement] = useState(actif);
  const [erreur, setErreur] = useState('');

  useEffect(() => {
    if (!actif) {
      return undefined;
    }
    const controleur = new AbortController();
    api
      .annuaire(controleur.signal)
      .then((donnees) => {
        setUtilisateurs(donnees.utilisateurs);
        setChargement(false);
      })
      .catch((e) => {
        if (e.name === 'AbortError') {
          return;
        }
        setErreur(e.message);
        setChargement(false);
      });
    return () => controleur.abort();
  }, [actif]);

  return { utilisateurs, chargement, erreur };
}

export function useRetour() {
  const location = useLocation();
  return location.state?.from ?? '/dvds';
}
