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
      <h2>Changement du mot de passe</h2>
      <Alerte type="succes" onFermer={() => setSucces('')}>
        {succes}
      </Alerte>
      <Alerte type="erreur">{erreurGenerale}</Alerte>
      <Champ id="ancienMotDePasse" libelle="Mot de passe actuel" erreur={erreurs.ancienMotDePasse}>
        <input
          id="ancienMotDePasse"
          type="password"
          value={valeurs.ancienMotDePasse}
          onChange={(e) => changer('ancienMotDePasse', e.target.value)}
          placeholder="Votre mot de passe actuel"
          autoComplete="current-password"
          aria-invalid={erreurs.ancienMotDePasse ? 'true' : undefined}
        />
      </Champ>
      <Champ id="nouveauMotDePasse" libelle="Nouveau mot de passe" erreur={erreurs.nouveauMotDePasse} aide="Au moins 6 caractères.">
        <input
          id="nouveauMotDePasse"
          type="password"
          value={valeurs.nouveauMotDePasse}
          onChange={(e) => changer('nouveauMotDePasse', e.target.value)}
          placeholder="Nouveau mot de passe"
          autoComplete="new-password"
          aria-invalid={erreurs.nouveauMotDePasse ? 'true' : undefined}
        />
      </Champ>
      <Champ id="confirmation" libelle="Confirmation du nouveau mot de passe" erreur={erreurs.confirmation}>
        <input
          id="confirmation"
          type="password"
          value={valeurs.confirmation}
          onChange={(e) => changer('confirmation', e.target.value)}
          placeholder="Saisissez-le une seconde fois"
          autoComplete="new-password"
          aria-invalid={erreurs.confirmation ? 'true' : undefined}
        />
      </Champ>
      <button type="submit" className="bouton bouton-primaire" disabled={envoi}>
        {envoi ? 'Enregistrement…' : 'Changer le mot de passe'}
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
      setSucces('Vos préférences ont été enregistrées.');
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
      <h2>Préférences</h2>
      <Alerte type="succes" onFermer={() => setSucces('')}>
        {succes}
      </Alerte>
      <Alerte type="erreur">{erreurGenerale}</Alerte>

      <Champ id="nbFilmsParPage" libelle="Nombre de DVDs affichés par page" erreur={erreurs.nbFilmsParPage} aide="De 6 à 99, par incréments de 3.">
        <select
          id="nbFilmsParPage"
          value={valeurs.nbFilmsParPage}
          onChange={(e) => changer('nbFilmsParPage', Number(e.target.value))}
          title="Nombre de DVDs affichés sur chaque page de résultats"
        >
          {NB_PAR_PAGE_OPTIONS.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </Champ>

      <Groupe libelle="Courriels automatiques">
        <CaseACocher
          id="courrielSiAjout"
          libelle="Me prévenir par courriel lors de l’ajout d’un DVD"
          coche={valeurs.courrielSiAjout}
          onChange={(v) => changer('courrielSiAjout', v)}
        />
        <CaseACocher
          id="courrielSiSuppression"
          libelle="Me prévenir par courriel lors du retrait d’un DVD"
          coche={valeurs.courrielSiSuppression}
          onChange={(v) => changer('courrielSiSuppression', v)}
        />
        <CaseACocher
          id="courrielSiAppropriation"
          libelle="Me prévenir par courriel lors de l’appropriation d’un DVD"
          coche={valeurs.courrielSiAppropriation}
          onChange={(v) => changer('courrielSiAppropriation', v)}
        />
      </Groupe>

      <Groupe libelle="Couleurs de l’interface" erreur={erreurs.couleurFond || erreurs.couleurTexte}>
        <div className="champs-ligne">
          <Champ id="couleurFond" libelle="Couleur de fond">
            <input
              id="couleurFond"
              type="color"
              value={valeurs.couleurFond || COULEUR_FOND_DEFAUT}
              onChange={(e) => changer('couleurFond', e.target.value)}
              title="Couleur de fond de l’interface"
            />
          </Champ>
          <Champ id="couleurTexte" libelle="Couleur du texte">
            <input
              id="couleurTexte"
              type="color"
              value={valeurs.couleurTexte || COULEUR_TEXTE_DEFAUT}
              onChange={(e) => changer('couleurTexte', e.target.value)}
              title="Couleur du texte de l’interface"
            />
          </Champ>
        </div>
        <button
          type="button"
          className="bouton bouton-petit bouton-secondaire"
          onClick={() => setValeurs((v) => ({ ...v, couleurFond: '', couleurTexte: '' }))}
        >
          Rétablir les couleurs par défaut
        </button>
      </Groupe>

      <button type="submit" className="bouton bouton-primaire" disabled={envoi}>
        {envoi ? 'Enregistrement…' : 'Enregistrer les préférences'}
      </button>
    </form>
  );
}

export default function Personnalisation() {
  const { utilisateur } = useAuth();

  return (
    <section className="page page-etroite">
      <div className="page-entete">
        <h1>Personnalisation de l’environnement</h1>
      </div>

      <div className="panneau">
        <h2>Mon compte</h2>
        <dl className="fiche-donnees">
          <div className="fiche-ligne">
            <dt>Prénom</dt>
            <dd>{utilisateur.nom}</dd>
          </div>
          <div className="fiche-ligne">
            <dt>Courriel</dt>
            <dd>{utilisateur.courriel}</dd>
          </div>
        </dl>
        <p className="aide">Seul l’administrateur peut modifier le prénom et le courriel d’un utilisateur.</p>
      </div>

      <FormulaireMotDePasse />
      <FormulairePreferences />
    </section>
  );
}
