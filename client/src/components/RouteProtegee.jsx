import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '../context/AuthContext.jsx';
import Chargement from './Chargement.jsx';
import { useTranslation } from 'react-i18next';

export default function RouteProtegee() {
  const { t } = useTranslation();
  const { utilisateur, pret } = useAuth();
  const location = useLocation();

  if (!pret) {
    return <Chargement texte={t('session.checking')} />;
  }

  if (!utilisateur) {
    return <Navigate to="/connexion" replace state={{ from: `${location.pathname}${location.search}` }} />;
  }

  return <Outlet />;
}
