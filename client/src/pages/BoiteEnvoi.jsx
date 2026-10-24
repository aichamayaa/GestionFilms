import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { formaterDateHeure } from '../utils/format.js';
import Alerte from '../components/Alerte.jsx';
import Chargement from '../components/Chargement.jsx';

const STATUTS = {
  simule: 'Simulé',
  envoye: 'Envoyé',
  echec: 'Échec',
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
        <h1>Courriels envoyés</h1>
        <button type="button" className="bouton bouton-secondaire" onClick={() => charger()} disabled={chargement}>
          Actualiser
        </button>
      </div>

      <Alerte type="erreur">{erreur}</Alerte>
      {donnees?.simulation && (
        <Alerte type="info">
          Aucun serveur SMTP n’est configuré. Les courriels ne sont pas expédiés : ils sont conservés ici, avec l’adresse des destinataires,
          l’objet et le corps du message. Les messages sont effacés au redémarrage du serveur.
        </Alerte>
      )}

      {chargement && !donnees && <Chargement />}

      {donnees && donnees.courriels.length === 0 && <p className="vide panneau">Aucun courriel n’a été envoyé pour le moment.</p>}

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
                <strong>À :</strong> {courriel.destinataires.map((d) => `${d.nom} <${d.courriel}>`).join(', ')}
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
