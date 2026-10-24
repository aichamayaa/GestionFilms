import { Navigate, Outlet } from 'react-router';
import { useAuth } from '../context/AuthContext.jsx';

export default function RouteRole({ roles }) {
  const { utilisateur } = useAuth();

  if (!roles.includes(utilisateur.role)) {
    return <Navigate to="/dvds" replace />;
  }

  return <Outlet />;
}
