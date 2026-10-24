import { Link, Outlet, useLocation } from 'react-router';
import { useAuth } from '../context/AuthContext.jsx';
import { ROLES } from '../constantes.js';

export default function FocusLayout() {
  const { utilisateur } = useAuth();
  const location = useLocation();
  const retour = location.state?.from ?? '/dvds';

  return (
    <div className="application">
      <header className="entete">
        <div className="entete-interieur">
          <span className="marque">Gestion de films</span>
          <div className="entete-espace" />
          <div className="session">
            <span className="session-nom">{utilisateur.nom}</span>
            <span className="badge badge-role">{ROLES[utilisateur.role]}</span>
            <Link to={retour} className="bouton bouton-contour" title="Retourner à la liste des DVDs">
              Retour à la liste
            </Link>
          </div>
        </div>
      </header>
      <main className="contenu">
        <Outlet />
      </main>
      <footer className="pied">Gestion de films – Programmation Web client II</footer>
    </div>
  );
}
