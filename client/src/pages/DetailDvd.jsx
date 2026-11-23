import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { api } from '../api/client.js';
import { useFilm, useRetour } from '../utils/hooks.js';
import { formaterDate } from '../utils/format.js';
import Alerte from '../components/Alerte.jsx';
import Chargement from '../components/Chargement.jsx';
import DetailsDvd from '../components/DetailsDvd.jsx';
import { useTranslation } from 'react-i18next';

export default function DetailDvd() {
  const { t } = useTranslation();
  const { id } = useParams();
  const retour = useRetour();
  const { film, erreur, chargement } = useFilm(id);
  const [emprunts, setEmprunts] = useState([]);

  useEffect(() => {
    const controleur = new AbortController();
    api
      .historiqueFilm(id, controleur.signal)
      .then((donnees) => setEmprunts(donnees.emprunts))
      .catch(() => setEmprunts([]));
    return () => controleur.abort();
  }, [id]);

  return (
    <section className="page page-etroite">
      <div className="barre-retour">
        <Link to={retour} className="bouton bouton-secondaire" title={t('common.backToListTitle')}>
          {t('common.backToList')}
        </Link>
      </div>
      {chargement && <Chargement />}
      <Alerte type="erreur">{erreur}</Alerte>
      {film && (
        <>
          <DetailsDvd film={film} />
          {emprunts.length > 0 && (
            <div className="panneau historique">
              <h2>{t('history.title')}</h2>
              <table className="tableau">
                <thead>
                  <tr>
                    <th scope="col">{t('history.date')}</th>
                    <th scope="col">{t('history.user')}</th>
                  </tr>
                </thead>
                <tbody>
                  {emprunts.map((emprunt) => (
                    <tr key={emprunt._id}>
                      <td>{formaterDate(emprunt.dateEmprunt)}</td>
                      <td>{emprunt.utilisateur?.nom ?? t('common.deletedUser')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </section>
  );
}
