import { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router';
import { SESSION_EXPIREE, useAuth } from '../context/AuthContext.jsx';
import SelecteurLangue from '../components/SelecteurLangue.jsx';
import { ErreurApi } from '../api/client.js';
import { connexionSchema, validerFormulaire } from '../validation.js';
import Alerte from '../components/Alerte.jsx';
import { Champ } from '../components/Champ.jsx';
import { useTranslation } from 'react-i18next';

export default function Connexion() {
  const { t } = useTranslation();
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
      setErreurGenerale(erreur instanceof ErreurApi ? erreur.message : t('common.unexpected'));
      setEnvoi(false);
    }
  }

  return (
    <div className="connexion-page">
      <div className="connexion-carte panneau">
        <div className="connexion-langue">
          <SelecteurLangue />
        </div>
        <h1 className="connexion-titre">{t('common.appName')}</h1>
        <p className="connexion-sous-titre">{t('login.subtitle')}</p>

        <Alerte type="info">{messageSession === SESSION_EXPIREE ? t('session.expired') : messageSession}</Alerte>
        <Alerte type="erreur">{erreurGenerale}</Alerte>

        <form onSubmit={soumettre} noValidate>
          <Champ id="identifiant" libelle={t('login.username')} erreur={erreurs.identifiant}>
            <input
              id="identifiant"
              type="text"
              value={identifiant}
              onChange={(e) => setIdentifiant(e.target.value)}
              placeholder={t('login.usernamePh')}
              title={t('login.usernameTitle')}
              autoComplete="username"
              autoFocus
              aria-invalid={erreurs.identifiant ? 'true' : undefined}
            />
          </Champ>
          <Champ id="motDePasse" libelle={t('login.password')} erreur={erreurs.motDePasse}>
            <input
              id="motDePasse"
              type="password"
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              placeholder={t('login.passwordPh')}
              title={t('login.passwordTitle')}
              autoComplete="current-password"
              aria-invalid={erreurs.motDePasse ? 'true' : undefined}
            />
          </Champ>
          <button type="submit" className="bouton bouton-primaire bouton-large" disabled={envoi}>
            {envoi ? t('login.signingIn') : t('login.signIn')}
          </button>
        </form>

        <p className="connexion-sous-titre">
          {t('login.noAccount')} <Link to="/inscription">{t('login.createAccount')}</Link>
        </p>
      </div>
    </div>
  );
}