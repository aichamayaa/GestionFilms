import { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router';
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
      setErreurGenerale(erreur instanceof ErreurApi ? erreur.message : 'An unexpected error occurred.');
      setEnvoi(false);
    }
  }

  return (
    <div className="connexion-page">
      <div className="connexion-carte panneau">
        <h1 className="connexion-titre">Film Management</h1>
        <p className="connexion-sous-titre">Sign in to browse the group’s DVD collection.</p>

        <Alerte type="info">{messageSession}</Alerte>
        <Alerte type="erreur">{erreurGenerale}</Alerte>

        <form onSubmit={soumettre} noValidate>
          <Champ id="identifiant" libelle="Username" erreur={erreurs.identifiant}>
            <input
              id="identifiant"
              type="text"
              value={identifiant}
              onChange={(e) => setIdentifiant(e.target.value)}
              placeholder="First name or email address"
              title="Enter your first name or email address"
              autoComplete="username"
              autoFocus
              aria-invalid={erreurs.identifiant ? 'true' : undefined}
            />
          </Champ>
          <Champ id="motDePasse" libelle="Password" erreur={erreurs.motDePasse}>
            <input
              id="motDePasse"
              type="password"
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              placeholder="Your password"
              title="Enter your password"
              autoComplete="current-password"
              aria-invalid={erreurs.motDePasse ? 'true' : undefined}
            />
          </Champ>
          <button type="submit" className="bouton bouton-primaire bouton-large" disabled={envoi}>
            {envoi ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="connexion-sous-titre">
          No account? <Link to="/inscription">Create an account</Link>
        </p>
      </div>
    </div>
  );
}