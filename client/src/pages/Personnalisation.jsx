import { useState } from 'react';
import { api, ErreurApi } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { NB_PAR_PAGE_OPTIONS } from '../constantes.js';
import { changementMotDePasseSchema, preferencesSchema, validerFormulaire } from '../validation.js';
import Alerte from '../components/Alerte.jsx';
import { CaseACocher, Champ, Groupe } from '../components/Champ.jsx';

const COULEUR_FOND_DEFAUT = '#f4f6fa';
const COULEUR_TEXTE_DEFAUT = '#1f3864';

function FormulaireMotDePasse() {
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
      setSucces(reponse.message);
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
      <h2>Change password</h2>
      <Alerte type="succes" onFermer={() => setSucces('')}>
        {succes}
      </Alerte>
      <Alerte type="erreur">{erreurGenerale}</Alerte>
      <Champ id="ancienMotDePasse" libelle="Current password" erreur={erreurs.ancienMotDePasse}>
        <input
          id="ancienMotDePasse"
          type="password"
          value={valeurs.ancienMotDePasse}
          onChange={(e) => changer('ancienMotDePasse', e.target.value)}
          placeholder="Your current password"
          autoComplete="current-password"
          aria-invalid={erreurs.ancienMotDePasse ? 'true' : undefined}
        />
      </Champ>
      <Champ id="nouveauMotDePasse" libelle="New password" erreur={erreurs.nouveauMotDePasse} aide="At least 6 characters.">
        <input
          id="nouveauMotDePasse"
          type="password"
          value={valeurs.nouveauMotDePasse}
          onChange={(e) => changer('nouveauMotDePasse', e.target.value)}
          placeholder="New password"
          autoComplete="new-password"
          aria-invalid={erreurs.nouveauMotDePasse ? 'true' : undefined}
        />
      </Champ>
      <Champ id="confirmation" libelle="Confirm new password" erreur={erreurs.confirmation}>
        <input
          id="confirmation"
          type="password"
          value={valeurs.confirmation}
          onChange={(e) => changer('confirmation', e.target.value)}
          placeholder="Enter it again"
          autoComplete="new-password"
          aria-invalid={erreurs.confirmation ? 'true' : undefined}
        />
      </Champ>
      <button type="submit" className="bouton bouton-primaire" disabled={envoi}>
        {envoi ? 'Saving…' : 'Change password'}
      </button>
    </form>
  );
}

function FormulairePreferences() {
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
      setSucces('Your preferences have been saved.');
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
      <h2>Preferences</h2>
      <Alerte type="succes" onFermer={() => setSucces('')}>
        {succes}
      </Alerte>
      <Alerte type="erreur">{erreurGenerale}</Alerte>

      <Champ id="nbFilmsParPage" libelle="DVDs shown per page" erreur={erreurs.nbFilmsParPage} aide="From 6 to 99, in steps of 3.">
        <select
          id="nbFilmsParPage"
          value={valeurs.nbFilmsParPage}
          onChange={(e) => changer('nbFilmsParPage', Number(e.target.value))}
          title="Number of DVDs shown on each results page"
        >
          {NB_PAR_PAGE_OPTIONS.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </Champ>

      <Groupe libelle="Automatic emails">
        <CaseACocher
          id="courrielSiAjout"
          libelle="Email me when a DVD is added"
          coche={valeurs.courrielSiAjout}
          onChange={(v) => changer('courrielSiAjout', v)}
        />
        <CaseACocher
          id="courrielSiSuppression"
          libelle="Email me when a DVD is removed"
          coche={valeurs.courrielSiSuppression}
          onChange={(v) => changer('courrielSiSuppression', v)}
        />
        <CaseACocher
          id="courrielSiAppropriation"
          libelle="Email me when a DVD is claimed"
          coche={valeurs.courrielSiAppropriation}
          onChange={(v) => changer('courrielSiAppropriation', v)}
        />
      </Groupe>

      <Groupe libelle="Interface colors" erreur={erreurs.couleurFond || erreurs.couleurTexte}>
        <div className="champs-ligne">
          <Champ id="couleurFond" libelle="Background color">
            <input
              id="couleurFond"
              type="color"
              value={valeurs.couleurFond || COULEUR_FOND_DEFAUT}
              onChange={(e) => changer('couleurFond', e.target.value)}
              title="Interface background color"
            />
          </Champ>
          <Champ id="couleurTexte" libelle="Text color">
            <input
              id="couleurTexte"
              type="color"
              value={valeurs.couleurTexte || COULEUR_TEXTE_DEFAUT}
              onChange={(e) => changer('couleurTexte', e.target.value)}
              title="Interface text color"
            />
          </Champ>
        </div>
        <button
          type="button"
          className="bouton bouton-petit bouton-secondaire"
          onClick={() => setValeurs((v) => ({ ...v, couleurFond: '', couleurTexte: '' }))}
        >
          Restore default colors
        </button>
      </Groupe>

      <button type="submit" className="bouton bouton-primaire" disabled={envoi}>
        {envoi ? 'Saving…' : 'Save preferences'}
      </button>
    </form>
  );
}

export default function Personnalisation() {
  const { utilisateur } = useAuth();

  return (
    <section className="page page-etroite">
      <div className="page-entete">
        <h1>Settings</h1>
      </div>

      <div className="panneau">
        <h2>My account</h2>
        <dl className="fiche-donnees">
          <div className="fiche-ligne">
            <dt>First name</dt>
            <dd>{utilisateur.nom}</dd>
          </div>
          <div className="fiche-ligne">
            <dt>Email</dt>
            <dd>{utilisateur.courriel}</dd>
          </div>
        </dl>
        <p className="aide">Only the administrator can change a user’s first name and email.</p>
      </div>

      <FormulaireMotDePasse />
      <FormulairePreferences />
    </section>
  );
}
