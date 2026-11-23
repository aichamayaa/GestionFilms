import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { api } from '../api/client.js';
import { libelleRole } from '../constantes.js';
import Alerte from '../components/Alerte.jsx';
import Chargement from '../components/Chargement.jsx';
import { useTranslation } from 'react-i18next';

export default function GestionUtilisateurs() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');
  const [message, setMessage] = useState(location.state?.message ?? '');
  const [aSupprimer, setASupprimer] = useState(null);
  const [suppression, setSuppression] = useState(false);

  const charger = useCallback((signal) => {
    api
      .listerUtilisateurs(signal)
      .then((reponse) => {
        setUtilisateurs(reponse.utilisateurs);
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

  useEffect(() => {
    if (location.state?.message) {
      navigate(location.pathname, { replace: true, state: null });
    }
  }, []);

  async function supprimer(utilisateur) {
    setSuppression(true);
    setErreur('');
    try {
      await api.supprimerUtilisateur(utilisateur._id);
      setMessage(t('admin.deleted', { nom: utilisateur.nom }));
      setASupprimer(null);
      charger();
    } catch (e) {
      setErreur(e.message);
      setASupprimer(null);
    } finally {
      setSuppression(false);
    }
  }

  return (
    <section className="page">
      <div className="page-entete">
        <h1>{t('admin.title')}</h1>
        <Link to="/administration/utilisateurs/nouveau" className="bouton bouton-primaire" title={t('admin.addTitle')}>
          {t('admin.add')}
        </Link>
      </div>

      <Alerte type="succes" onFermer={() => setMessage('')}>
        {message}
      </Alerte>
      <Alerte type="erreur" onFermer={() => setErreur('')}>
        {erreur}
      </Alerte>

      {chargement && <Chargement />}

      {!chargement && (
        <div className="panneau tableau-conteneur">
          <table className="tableau">
            <caption className="sr-seulement">{t('admin.caption')}</caption>
            <thead>
              <tr>
                <th scope="col">{t('admin.no')}</th>
                <th scope="col">{t('common.firstName')}</th>
                <th scope="col">{t('common.email')}</th>
                <th scope="col">{t('admin.role')}</th>
                <th scope="col">{t('admin.owned')}</th>
                <th scope="col">{t('admin.held')}</th>
                <th scope="col">{t('admin.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {utilisateurs.map((u, index) => (
                <tr key={u._id}>
                  <td>{index + 1}</td>
                  <td>{u.nom}</td>
                  <td>{u.courriel}</td>
                  <td>{libelleRole(u.role)}</td>
                  <td>{u.nbPossedes}</td>
                  <td>{u.nbEnMain}</td>
                  <td>
                    {aSupprimer === u._id ? (
                      <div className="actions-ligne">
                        <span>{t('admin.deleteQ')}</span>
                        <button type="button" className="bouton bouton-petit bouton-danger" onClick={() => supprimer(u)} disabled={suppression}>
                          {t('common.confirm')}
                        </button>
                        <button type="button" className="bouton bouton-petit bouton-secondaire" onClick={() => setASupprimer(null)} disabled={suppression}>
                          {t('common.cancel')}
                        </button>
                      </div>
                    ) : (
                      <div className="actions-ligne">
                        <Link to={`/administration/utilisateurs/${u._id}`} className="bouton bouton-petit bouton-secondaire" title={t('admin.editTitle', { nom: u.nom })}>
                          {t('common.edit')}
                        </Link>
                        {u.role !== 'A' && (
                          <button type="button" className="bouton bouton-petit bouton-danger-contour" onClick={() => setASupprimer(u._id)} title={t('admin.deleteTitle', { nom: u.nom })}>
                            {t('common.delete')}
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
