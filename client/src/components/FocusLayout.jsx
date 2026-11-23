import { Link, Outlet, useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext.jsx';
import { libelleRole } from '../constantes.js';
import SelecteurLangue from './SelecteurLangue.jsx';

export default function FocusLayout() {
  const { t } = useTranslation();
  const { utilisateur } = useAuth();
  const location = useLocation();
  const retour = location.state?.from ?? '/dvds';

  return (
    <div className="application">
      <header className="entete">
        <div className="entete-interieur">
          <span className="marque">{t('common.appName')}</span>
          <div className="entete-espace" />
          <div className="session">
            <SelecteurLangue />
            <span className="session-nom">{utilisateur.nom}</span>
            <span className="badge badge-role">{libelleRole(utilisateur.role)}</span>
            <Link to={retour} className="bouton bouton-contour" title={t('common.backToListTitle')}>
              {t('common.backToList')}
            </Link>
          </div>
        </div>
      </header>
      <main className="contenu">
        <Outlet />
      </main>
      <footer className="pied">{t('footer.text')}</footer>
    </div>
  );
}
