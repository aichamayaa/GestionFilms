import { useState } from 'react';
import { Navigate, useLocation } from 'react-router';
import { useAuth } from '../context/AuthContext.jsx';
import { ErreurApi } from '../api/client.js';
import { connexionSchema, validerFormulaire } from '../validation.js';
import Alerte from '../components/Alerte.jsx';
import { Champ } from '../components/Champ.jsx';

export default function Connexion() {
  const { utilisateur, pret, connecter, messageSession } = useAuth();
  const location = useLocation();
  const [identifiant, setIdentifiant] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [erreurs, setErreurs] = useState({});
  const [erreurGenerale, setErreurGenerale] = useState('');
  const [envoi, setEnvoi] = useState(false);

  if (pret && utilisateur) {
    return <Navigate to={location.state?.from ?? '/dvds'} replace />;
  }

  async function soumettre(evenement) {
    evenement.preventDefault();
    setErreurGenerale('');

    const { erreurs: erreursClient } = validerFormulaire(connexionSchema, { identifiant, motDePasse });
    if (Object.keys(erreursClient).length > 0) {
      setErreurs(erreursClient);
      return;
    }

    setErreurs({});
    setEnvoi(true);
    try {
      await connecter(identifiant.trim(), motDePasse);
    } catch (erreur) {
      setErreurGenerale(erreur instanceof ErreurApi ? erreur.message : 'Une erreur inattendue est survenue.');
      setEnvoi(false);
    }
  }

  return (
    <div className="connexion-page">
      <div className="connexion-carte panneau">
        <h1 className="connexion-titre">Gestion de films</h1>
        <p className="connexion-sous-titre">Connectez-vous pour consulter la collection de DVDs du groupe.</p>

        <Alerte type="info">{messageSession}</Alerte>
        <Alerte type="erreur">{erreurGenerale}</Alerte>

        <form onSubmit={soumettre} noValidate>
          <Champ id="identifiant" libelle="Identifiant" erreur={erreurs.identifiant}>
            <input
              id="identifiant"
              type="text"
              value={identifiant}
              onChange={(e) => setIdentifiant(e.target.value)}
              placeholder="Prénom ou adresse courriel"
              title="Entrez votre prénom ou votre adresse courriel"
              autoComplete="username"
              autoFocus
              aria-invalid={erreurs.identifiant ? 'true' : undefined}
            />
          </Champ>
          <Champ id="motDePasse" libelle="Mot de passe" erreur={erreurs.motDePasse}>
            <input
              id="motDePasse"
              type="password"
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              placeholder="Votre mot de passe"
              title="Entrez votre mot de passe"
              autoComplete="current-password"
              aria-invalid={erreurs.motDePasse ? 'true' : undefined}
            />
          </Champ>
          <button type="submit" className="bouton bouton-primaire bouton-large" disabled={envoi}>
            {envoi ? 'Connexion en cours…' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
}
