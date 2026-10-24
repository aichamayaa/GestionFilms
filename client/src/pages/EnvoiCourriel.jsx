import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { api, ErreurApi } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { messageSchema, validerFormulaire } from '../validation.js';
import { useAnnuaire } from '../utils/hooks.js';
import Alerte from '../components/Alerte.jsx';
import { CaseACocher, Champ, Groupe } from '../components/Champ.jsx';

export default function EnvoiCourriel() {
  const { utilisateur } = useAuth();
  const [params] = useSearchParams();
  const { utilisateurs, erreur: erreurAnnuaire } = useAnnuaire();
  const destinataireInitial = params.get('a') ?? '';

  const [mode, setMode] = useState('un');
  const [unDestinataire, setUnDestinataire] = useState(destinataireInitial);
  const [plusieurs, setPlusieurs] = useState([]);
  const [sujet, setSujet] = useState(params.get('objet') ?? '');
  const [corps, setCorps] = useState('');
  const [erreurs, setErreurs] = useState({});
  const [erreurGenerale, setErreurGenerale] = useState('');
  const [envoi, setEnvoi] = useState(false);
  const [resultat, setResultat] = useState(null);

  const autres = utilisateurs.filter((u) => u._id !== utilisateur._id);

  useEffect(() => {
    setUnDestinataire(destinataireInitial);
  }, [destinataireInitial]);

  async function soumettre(evenement) {
    evenement.preventDefault();
    setErreurGenerale('');

    const charge = {
      destinataires: mode === 'un' ? (unDestinataire ? [unDestinataire] : []) : mode === 'plusieurs' ? plusieurs : [],
      tous: mode === 'tous',
      sujet,
      corps,
    };

    const { donnees, erreurs: erreursClient } = validerFormulaire(messageSchema, charge);
    if (Object.keys(erreursClient).length > 0) {
      setErreurs(erreursClient);
      return;
    }

    setErreurs({});
    setEnvoi(true);
    try {
      const reponse = await api.envoyerCourriel(donnees);
      setResultat(reponse);
    } catch (e) {
      if (e instanceof ErreurApi) {
        setErreurs(e.erreurs);
        setErreurGenerale(e.message);
      }
    } finally {
      setEnvoi(false);
    }
  }

  function basculerPlusieurs(id) {
    setPlusieurs((liste) => (liste.includes(id) ? liste.filter((x) => x !== id) : [...liste, id]));
  }

  function nouveauMessage() {
    setResultat(null);
    setSujet('');
    setCorps('');
    setPlusieurs([]);
    setUnDestinataire('');
  }

  if (resultat) {
    const { envoi: courriel, simulation } = resultat;
    return (
      <section className="page page-etroite">
        <div className="page-entete">
          <h1>Message transmis</h1>
        </div>
        <Alerte type={courriel.statut === 'echec' ? 'erreur' : 'succes'}>
          {courriel.statut === 'echec'
            ? 'Le serveur de courriel a refusé l’envoi du message.'
            : simulation
              ? 'Aucun serveur SMTP n’est configuré : le message n’a pas été expédié, mais il est présenté ci-dessous.'
              : 'Le message a été envoyé.'}
        </Alerte>
        <div className="panneau courriel-apercu">
          <dl className="fiche-donnees">
            <div className="fiche-ligne">
              <dt>Destinataires</dt>
              <dd>{courriel.destinataires.map((d) => `${d.nom} <${d.courriel}>`).join(', ')}</dd>
            </div>
            <div className="fiche-ligne">
              <dt>Objet</dt>
              <dd>{courriel.sujet}</dd>
            </div>
            <div className="fiche-ligne">
              <dt>Message</dt>
              <dd>
                <pre className="courriel-corps">{courriel.corps}</pre>
              </dd>
            </div>
          </dl>
        </div>
        <div className="formulaire-actions">
          <button type="button" className="bouton bouton-primaire" onClick={nouveauMessage}>
            Écrire un autre message
          </button>
          <Link to="/courriels" className="bouton bouton-secondaire">
            Voir les courriels envoyés
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="page page-etroite">
      <div className="page-entete">
        <h1>Envoyer un courriel</h1>
      </div>

      <form className="panneau" onSubmit={soumettre} noValidate>
        <Alerte type="erreur">{erreurGenerale || erreurAnnuaire}</Alerte>

        <Champ id="mode" libelle="Destinataires">
          <select id="mode" value={mode} onChange={(e) => setMode(e.target.value)} title="Choisir à qui le message sera transmis">
            <option value="un">Un utilisateur</option>
            <option value="plusieurs">Plusieurs utilisateurs</option>
            <option value="tous">Tous les utilisateurs</option>
          </select>
        </Champ>

        {mode === 'un' && (
          <Champ id="destinataire" libelle="Utilisateur" erreur={erreurs.destinataires}>
            <select
              id="destinataire"
              value={unDestinataire}
              onChange={(e) => setUnDestinataire(e.target.value)}
              title="Choisir le destinataire du message"
              aria-invalid={erreurs.destinataires ? 'true' : undefined}
            >
              <option value="">Choisir un utilisateur</option>
              {autres.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.nom}
                </option>
              ))}
            </select>
          </Champ>
        )}

        {mode === 'plusieurs' && (
          <Groupe libelle="Utilisateurs" erreur={erreurs.destinataires}>
            <div className="cases-grille">
              {autres.map((u) => (
                <CaseACocher
                  key={u._id}
                  id={`dest-${u._id}`}
                  libelle={u.nom}
                  coche={plusieurs.includes(u._id)}
                  onChange={() => basculerPlusieurs(u._id)}
                />
              ))}
            </div>
            <div className="formulaire-actions">
              <button type="button" className="bouton bouton-petit bouton-secondaire" onClick={() => setPlusieurs(autres.map((u) => u._id))}>
                Tout cocher
              </button>
              <button type="button" className="bouton bouton-petit bouton-secondaire" onClick={() => setPlusieurs([])}>
                Tout décocher
              </button>
            </div>
          </Groupe>
        )}

        {mode === 'tous' && <p className="aide">Le message sera transmis à tous les autres utilisateurs.</p>}

        <Champ id="sujet" libelle="Objet" requis erreur={erreurs.sujet}>
          <input
            id="sujet"
            type="text"
            value={sujet}
            onChange={(e) => setSujet(e.target.value)}
            placeholder="Objet du message"
            title="Objet du message (150 caractères au maximum)"
            maxLength={150}
            aria-invalid={erreurs.sujet ? 'true' : undefined}
          />
        </Champ>

        <Champ id="corps" libelle="Message" requis erreur={erreurs.corps}>
          <textarea
            id="corps"
            rows={8}
            value={corps}
            onChange={(e) => setCorps(e.target.value)}
            placeholder="Écrivez votre message ici"
            title="Corps du message (5000 caractères au maximum)"
            maxLength={5000}
            aria-invalid={erreurs.corps ? 'true' : undefined}
          />
        </Champ>

        <button type="submit" className="bouton bouton-primaire" disabled={envoi}>
          {envoi ? 'Envoi en cours…' : 'Envoyer le message'}
        </button>
      </form>
    </section>
  );
}
