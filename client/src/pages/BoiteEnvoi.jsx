import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { formaterDateHeure } from '../utils/format.js';
import Alerte from '../components/Alerte.jsx';
import Chargement from '../components/Chargement.jsx';

const STATUTS = {
  simule: 'Simulated',
  envoye: 'Sent',
  echec: 'Failed',
};

export default function BoiteEnvoi() {
  const [donnees, setDonnees] = useState(null);
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(true);

  const charger = useCallback((signal) => {
    setChargement(true);
    api
      .boiteEnvoi(signal)
      .then((reponse) => {
        setDonnees(reponse);
        setErreur('');
        setChargement(false);
      })
      .catch((e) => {
        if (e.name === 'AbortError') {
          return;
        }
        setErreur(e.message);
        setChargement(false);
      });
  }, []);

  useEffect(() => {
    const controleur = new AbortController();
    charger(controleur.signal);
    return () => controleur.abort();
  }, [charger]);

  return (
    <section className="page page-etroite">
      <div className="page-entete">
        <h1>Sent emails</h1>
        <button type="button" className="bouton bouton-secondaire" onClick={() => charger()} disabled={chargement}>
          Refresh
        </button>
      </div>

      <Alerte type="erreur">{erreur}</Alerte>
      {donnees?.simulation && (
        <Alerte type="info">
          No SMTP server is configured. Emails are not actually sent: they are kept here with the recipients’ addresses, subject and body. Messages are cleared when the server restarts.
        </Alerte>
      )}

      {chargement && !donnees && <Chargement />}

      {donnees && donnees.courriels.length === 0 && <p className="vide panneau">No emails have been sent yet.</p>}

      {donnees && donnees.courriels.length > 0 && (
        <ul className="liste-courriels">
          {donnees.courriels.map((courriel) => (
            <li key={courriel.id} className="panneau courriel">
              <div className="courriel-entete">
                <h2>{courriel.sujet}</h2>
                <span className={`badge badge-${courriel.statut}`}>{STATUTS[courriel.statut]}</span>
              </div>
              <p className="aide">{formaterDateHeure(courriel.date)}</p>
              <p>
                <strong>To:</strong> {courriel.destinataires.map((d) => `${d.nom} <${d.courriel}>`).join(', ')}
              </p>
              <pre className="courriel-corps">{courriel.corps}</pre>
              {courriel.erreur && <p className="message-erreur">{courriel.erreur}</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
