import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '../context/AuthContext.jsx';
import Chargement from './Chargement.jsx';

export default function RouteProtegee() {
  const { utilisateur, pret } = useAuth();
  const location = useLocation();

  if (!pret) {
    return <Chargement texte="Vérification de la session…" />;
  }

  if (!utilisateur) {
    return <Navigate to="/connexion" replace state={{ from: `${location.pathname}${location.search}` }} />;
  }

  return <Outlet />;
}
