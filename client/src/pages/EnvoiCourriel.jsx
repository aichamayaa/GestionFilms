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
          <h1>Message sent</h1>
        </div>
        <Alerte type={courriel.statut === 'echec' ? 'erreur' : 'succes'}>
          {courriel.statut === 'echec'
            ? 'The email server rejected the message.'
            : simulation
              ? 'No SMTP server is configured: the message was not actually sent, but it is shown below.'
              : 'The message was sent.'}
        </Alerte>
        <div className="panneau courriel-apercu">
          <dl className="fiche-donnees">
            <div className="fiche-ligne">
              <dt>Recipients</dt>
              <dd>{courriel.destinataires.map((d) => `${d.nom} <${d.courriel}>`).join(', ')}</dd>
            </div>
            <div className="fiche-ligne">
              <dt>Subject</dt>
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
            Write another message
          </button>
          <Link to="/courriels" className="bouton bouton-secondaire">
            View sent emails
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="page page-etroite">
      <div className="page-entete">
        <h1>Send an email</h1>
      </div>

      <form className="panneau" onSubmit={soumettre} noValidate>
        <Alerte type="erreur">{erreurGenerale || erreurAnnuaire}</Alerte>

        <Champ id="mode" libelle="Recipients">
          <select id="mode" value={mode} onChange={(e) => setMode(e.target.value)} title="Choose who will receive the message">
            <option value="un">One user</option>
            <option value="plusieurs">Several users</option>
            <option value="tous">All users</option>
          </select>
        </Champ>

        {mode === 'un' && (
          <Champ id="destinataire" libelle="User" erreur={erreurs.destinataires}>
            <select
              id="destinataire"
              value={unDestinataire}
              onChange={(e) => setUnDestinataire(e.target.value)}
              title="Choose the message recipient"
              aria-invalid={erreurs.destinataires ? 'true' : undefined}
            >
              <option value="">Choose a user</option>
              {autres.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.nom}
                </option>
              ))}
            </select>
          </Champ>
        )}

        {mode === 'plusieurs' && (
          <Groupe libelle="Users" erreur={erreurs.destinataires}>
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
                Select all
              </button>
              <button type="button" className="bouton bouton-petit bouton-secondaire" onClick={() => setPlusieurs([])}>
                Deselect all
              </button>
            </div>
          </Groupe>
        )}

        {mode === 'tous' && <p className="aide">The message will be sent to all other users.</p>}

        <Champ id="sujet" libelle="Subject" requis erreur={erreurs.sujet}>
          <input
            id="sujet"
            type="text"
            value={sujet}
            onChange={(e) => setSujet(e.target.value)}
            placeholder="Message subject"
            title="Message subject (150 characters maximum)"
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
            placeholder="Write your message here"
            title="Message body (5000 characters maximum)"
            maxLength={5000}
            aria-invalid={erreurs.corps ? 'true' : undefined}
          />
        </Champ>

        <button type="submit" className="bouton bouton-primaire" disabled={envoi}>
          {envoi ? 'Sending…' : 'Send message'}
        </button>
      </form>
    </section>
  );
}
