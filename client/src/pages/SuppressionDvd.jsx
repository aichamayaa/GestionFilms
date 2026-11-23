import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { api } from '../api/client.js';
import { useFilm, useRetour } from '../utils/hooks.js';
import Alerte from '../components/Alerte.jsx';
import Chargement from '../components/Chargement.jsx';
import DetailsDvd from '../components/DetailsDvd.jsx';
import { useTranslation } from 'react-i18next';

export default function SuppressionDvd() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const retour = useRetour();
  const { film, erreur, chargement } = useFilm(id);
  const [envoi, setEnvoi] = useState(false);
  const [erreurAction, setErreurAction] = useState('');

  async function confirmer() {
    setEnvoi(true);
    setErreurAction('');
    try {
      await api.supprimerFilm(id);
      navigate(retour, { state: { message: t('delete.success', { titre: film.titreFrancais }) } });
    } catch (e) {
      setErreurAction(e.message);
      setEnvoi(false);
    }
  }

  return (
    <section className="page page-etroite">
      {chargement && <Chargement />}
      <Alerte type="erreur">{erreur}</Alerte>
      {film && !film.permissions.supprimer && <Alerte type="erreur">{t('delete.forbidden')}</Alerte>}
      {film && (
        <>
          <DetailsDvd film={film} />
          {film.permissions.supprimer && (
            <div className="panneau confirmation confirmation-danger">
              <h2>{t('delete.heading')}</h2>
              <p>
                {t('delete.text', { titre: film.titreFrancais })}
              </p>
              <Alerte type="erreur">{erreurAction}</Alerte>
              <div className="formulaire-actions">
                <button type="button" className="bouton bouton-danger" onClick={confirmer} disabled={envoi}>
                  {envoi ? t('delete.deleting') : t('delete.yes')}
                </button>
                <button type="button" className="bouton bouton-secondaire" onClick={() => navigate(retour)} disabled={envoi}>
                  {t('delete.no')}
                </button>
              </div>
            </div>
          )}
        </>
      )}
      {!chargement && !film && (
        <Link to={retour} className="bouton bouton-secondaire">
          {t('common.backToList')}
        </Link>
      )}
    </section>
  );
}
