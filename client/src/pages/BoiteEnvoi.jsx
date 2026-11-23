import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { formaterDateHeure } from '../utils/format.js';
import Alerte from '../components/Alerte.jsx';
import Chargement from '../components/Chargement.jsx';
import { useTranslation } from 'react-i18next';

export default function BoiteEnvoi() {
  const { t } = useTranslation();
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
        <h1>{t('emails.title')}</h1>
        <button type="button" className="bouton bouton-secondaire" onClick={() => charger()} disabled={chargement}>
          {t('emails.refresh')}
        </button>
      </div>

      <Alerte type="erreur">{erreur}</Alerte>
      {donnees?.simulation && (
        <Alerte type="info">
          {t('emails.simulation')}
        </Alerte>
      )}

      {chargement && !donnees && <Chargement />}

      {donnees && donnees.courriels.length === 0 && <p className="vide panneau">{t('emails.none')}</p>}

      {donnees && donnees.courriels.length > 0 && (
        <ul className="liste-courriels">
          {donnees.courriels.map((courriel) => (
            <li key={courriel.id} className="panneau courriel">
              <div className="courriel-entete">
                <h2>{courriel.sujet}</h2>
                <span className={`badge badge-${courriel.statut}`}>{t(`emails.status.${courriel.statut}`)}</span>
              </div>
              <p className="aide">{formaterDateHeure(courriel.date)}</p>
              <p>
                <strong>{t('emails.to')}</strong> {courriel.destinataires.map((d) => `${d.nom} <${d.courriel}>`).join(', ')}
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
