import { useState } from 'react';
import { api, ErreurApi } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { NB_PAR_PAGE_OPTIONS } from '../constantes.js';
import { changementMotDePasseSchema, preferencesSchema, validerFormulaire } from '../validation.js';
import Alerte from '../components/Alerte.jsx';
import { CaseACocher, Champ, Groupe } from '../components/Champ.jsx';
import { useTranslation } from 'react-i18next';

const COULEUR_FOND_DEFAUT = '#f4f6fa';
const COULEUR_TEXTE_DEFAUT = '#1f3864';

function FormulaireMotDePasse() {
  const { t } = useTranslation();
  const [valeurs, setValeurs] = useState({ ancienMotDePasse: '', nouveauMotDePasse: '', confirmation: '' });
  const [erreurs, setErreurs] = useState({});
  const [erreurGenerale, setErreurGenerale] = useState('');
  const [succes, setSucces] = useState('');
  const [envoi, setEnvoi] = useState(false);

  function changer(champ, valeur) {
    setValeurs((v) => ({ ...v, [champ]: valeur }));
  }

  async function soumettre(evenement) {
    evenement.preventDefault();
    setSucces('');
    setErreurGenerale('');
    const { donnees, erreurs: erreursClient } = validerFormulaire(changementMotDePasseSchema, valeurs);
    if (Object.keys(erreursClient).length > 0) {
      setErreurs(erreursClient);
      return;
    }
    setErreurs({});
    setEnvoi(true);
    try {
      const reponse = await api.changerMotDePasse(donnees);
      setSucces(t('settings.passwordChanged'));
      setValeurs({ ancienMotDePasse: '', nouveauMotDePasse: '', confirmation: '' });
    } catch (e) {
      if (e instanceof ErreurApi) {
        setErreurs(e.erreurs);
        setErreurGenerale(e.message);
      }
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <form className="panneau" onSubmit={soumettre} noValidate>
      <h2>{t('settings.changePassword')}</h2>
      <Alerte type="succes" onFermer={() => setSucces('')}>
        {succes}
      </Alerte>
      <Alerte type="erreur">{erreurGenerale}</Alerte>
      <Champ id="ancienMotDePasse" libelle={t('settings.currentPassword')} erreur={erreurs.ancienMotDePasse}>
        <input
          id="ancienMotDePasse"
          type="password"
          value={valeurs.ancienMotDePasse}
          onChange={(e) => changer('ancienMotDePasse', e.target.value)}
          placeholder={t('settings.currentPasswordPh')}
          autoComplete="current-password"
          aria-invalid={erreurs.ancienMotDePasse ? 'true' : undefined}
        />
      </Champ>
      <Champ id="nouveauMotDePasse" libelle={t('settings.newPassword')} erreur={erreurs.nouveauMotDePasse} aide={t('settings.newPasswordHelp')}>
        <input
          id="nouveauMotDePasse"
          type="password"
          value={valeurs.nouveauMotDePasse}
          onChange={(e) => changer('nouveauMotDePasse', e.target.value)}
          placeholder={t('settings.newPasswordPh')}
          autoComplete="new-password"
          aria-invalid={erreurs.nouveauMotDePasse ? 'true' : undefined}
        />
      </Champ>
      <Champ id="confirmation" libelle={t('settings.confirmPassword')} erreur={erreurs.confirmation}>
        <input
          id="confirmation"
          type="password"
          value={valeurs.confirmation}
          onChange={(e) => changer('confirmation', e.target.value)}
          placeholder={t('settings.confirmPasswordPh')}
          autoComplete="new-password"
          aria-invalid={erreurs.confirmation ? 'true' : undefined}
        />
      </Champ>
      <button type="submit" className="bouton bouton-primaire" disabled={envoi}>
        {envoi ? t('common.saving') : t('settings.changePassword')}
      </button>
    </form>
  );
}

function FormulairePreferences() {
  const { t } = useTranslation();
  const { utilisateur, mettreAJourUtilisateur } = useAuth();
  const p = utilisateur.preferences;
  const [valeurs, setValeurs] = useState({
    nbFilmsParPage: p.nbFilmsParPage,
    courrielSiAjout: p.courrielSiAjout,
    courrielSiSuppression: p.courrielSiSuppression,
    courrielSiAppropriation: p.courrielSiAppropriation,
    couleurFond: p.couleurFond ?? '',
    couleurTexte: p.couleurTexte ?? '',
  });
  const [erreurs, setErreurs] = useState({});
  const [erreurGenerale, setErreurGenerale] = useState('');
  const [succes, setSucces] = useState('');
  const [envoi, setEnvoi] = useState(false);

  function changer(champ, valeur) {
    setValeurs((v) => ({ ...v, [champ]: valeur }));
  }

  async function soumettre(evenement) {
    evenement.preventDefault();
    setSucces('');
    setErreurGenerale('');
    const { donnees, erreurs: erreursClient } = validerFormulaire(preferencesSchema, valeurs);
    if (Object.keys(erreursClient).length > 0) {
      setErreurs(erreursClient);
      return;
    }
    setErreurs({});
    setEnvoi(true);
    try {
      const reponse = await api.modifierPreferences(donnees);
      mettreAJourUtilisateur(reponse.utilisateur);
      setSucces(t('settings.preferencesSaved'));
    } catch (e) {
      if (e instanceof ErreurApi) {
        setErreurs(e.erreurs);
        setErreurGenerale(e.message);
      }
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <form className="panneau" onSubmit={soumettre} noValidate>
      <h2>{t('settings.preferences')}</h2>
      <Alerte type="succes" onFermer={() => setSucces('')}>
        {succes}
      </Alerte>
      <Alerte type="erreur">{erreurGenerale}</Alerte>

      <Champ id="nbFilmsParPage" libelle={t('settings.perPage')} erreur={erreurs.nbFilmsParPage} aide={t('settings.perPageHelp')}>
        <select
          id="nbFilmsParPage"
          value={valeurs.nbFilmsParPage}
          onChange={(e) => changer('nbFilmsParPage', Number(e.target.value))}
          title={t('settings.perPageTitle')}
        >
          {NB_PAR_PAGE_OPTIONS.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </Champ>

      <Groupe libelle={t('settings.autoEmails')}>
        <CaseACocher
          id="courrielSiAjout"
          libelle={t('settings.emailAdd')}
          coche={valeurs.courrielSiAjout}
          onChange={(v) => changer('courrielSiAjout', v)}
        />
        <CaseACocher
          id="courrielSiSuppression"
          libelle={t('settings.emailDelete')}
          coche={valeurs.courrielSiSuppression}
          onChange={(v) => changer('courrielSiSuppression', v)}
        />
        <CaseACocher
          id="courrielSiAppropriation"
          libelle={t('settings.emailClaim')}
          coche={valeurs.courrielSiAppropriation}
          onChange={(v) => changer('courrielSiAppropriation', v)}
        />
      </Groupe>

      <Groupe libelle={t('settings.colors')} erreur={erreurs.couleurFond || erreurs.couleurTexte}>
        <div className="champs-ligne">
          <Champ id="couleurFond" libelle={t('settings.bgColor')}>
            <input
              id="couleurFond"
              type="color"
              value={valeurs.couleurFond || COULEUR_FOND_DEFAUT}
              onChange={(e) => changer('couleurFond', e.target.value)}
              title={t('settings.bgColorTitle')}
            />
          </Champ>
          <Champ id="couleurTexte" libelle={t('settings.textColor')}>
            <input
              id="couleurTexte"
              type="color"
              value={valeurs.couleurTexte || COULEUR_TEXTE_DEFAUT}
              onChange={(e) => changer('couleurTexte', e.target.value)}
              title={t('settings.textColorTitle')}
            />
          </Champ>
        </div>
        <button
          type="button"
          className="bouton bouton-petit bouton-secondaire"
          onClick={() => setValeurs((v) => ({ ...v, couleurFond: '', couleurTexte: '' }))}
        >
          {t('settings.restoreColors')}
        </button>
      </Groupe>

      <button type="submit" className="bouton bouton-primaire" disabled={envoi}>
        {envoi ? t('common.saving') : t('settings.savePreferences')}
      </button>
    </form>
  );
}

export default function Personnalisation() {
  const { t } = useTranslation();
  const { utilisateur } = useAuth();

  return (
    <section className="page page-etroite">
      <div className="page-entete">
        <h1>{t('settings.title')}</h1>
      </div>

      <div className="panneau">
        <h2>{t('settings.account')}</h2>
        <dl className="fiche-donnees">
          <div className="fiche-ligne">
            <dt>{t('common.firstName')}</dt>
            <dd>{utilisateur.nom}</dd>
          </div>
          <div className="fiche-ligne">
            <dt>{t('common.email')}</dt>
            <dd>{utilisateur.courriel}</dd>
          </div>
        </dl>
        <p className="aide">{t('settings.accountHelp')}</p>
      </div>

      <FormulaireMotDePasse />
      <FormulairePreferences />
    </section>
  );
}
