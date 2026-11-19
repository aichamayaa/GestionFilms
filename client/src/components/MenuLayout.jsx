import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext.jsx';
import { ROLES } from '../constantes.js';

const LIENS_UTILISATEUR = [
  { vers: '/dvds', libelle: 'All DVDs', fin: true, aide: 'Show every user’s DVDs' },
  { vers: '/dvds/en-main', libelle: 'DVDs I’m holding', aide: 'Show the DVDs I currently have' },
  { vers: '/dvds/utilisateurs', libelle: 'Another user’s DVDs', aide: 'Show another user’s DVDs' },
  { vers: '/dvds/ajout', libelle: 'Add a DVD', aide: 'Add a new DVD to the collection' },
  { vers: '/personnalisation', libelle: 'Settings', aide: 'Change my password and preferences' },
  { vers: '/courriel', libelle: 'Send an email', aide: 'Send a message to one or more users' },
  { vers: '/courriels', libelle: 'Sent emails', aide: 'View the emails sent by the app' },
];

const LIENS_ADMIN = [
  { vers: '/dvds', libelle: 'All DVDs', fin: true, aide: 'Show every user’s DVDs' },
  { vers: '/dvds/utilisateurs', libelle: 'A user’s DVDs', aide: 'Show a user’s DVDs' },
  { vers: '/administration/utilisateurs', libelle: 'User management', aide: 'Manage user accounts' },
  { vers: '/courriel', libelle: 'Send an email', aide: 'Send a message to one or more users' },
  { vers: '/courriels', libelle: 'Sent emails', aide: 'View the emails sent by the app' },
];

export default function MenuLayout() {
  const { utilisateur, estAdmin, deconnecter } = useAuth();
  const navigate = useNavigate();
  const [menuOuvert, setMenuOuvert] = useState(false);
  const liens = estAdmin ? LIENS_ADMIN : LIENS_UTILISATEUR;

  function seDeconnecter() {
    navigate('/connexion', { replace: true });
    deconnecter();
  }

  return (
    <div className="application">
      <header className="entete">
        <div className="entete-interieur">
          <NavLink to="/dvds" end className="marque" title="Back to home">
            Film Management
          </NavLink>
          <button
            type="button"
            className="bouton-menu"
            aria-expanded={menuOuvert}
            aria-controls="navigation-principale"
            onClick={() => setMenuOuvert((ouvert) => !ouvert)}
          >
            Menu
          </button>
          <nav id="navigation-principale" className={`navigation${menuOuvert ? ' navigation-ouverte' : ''}`} aria-label="Main navigation">
            {liens.map((lien) => (
              <NavLink
                key={lien.vers}
                to={lien.vers}
                end={lien.fin}
                title={lien.aide}
                className={({ isActive }) => (isActive ? 'lien-menu actif' : 'lien-menu')}
                onClick={() => setMenuOuvert(false)}
              >
                {lien.libelle}
              </NavLink>
            ))}
          </nav>
          <div className="session">
            <span className="session-nom" title={ROLES[utilisateur.role]}>
              {utilisateur.nom}
            </span>
            <span className="badge badge-role">{ROLES[utilisateur.role]}</span>
            <button type="button" className="bouton bouton-contour" onClick={seDeconnecter} title="End my session">
              Log out
            </button>
          </div>
        </div>
      </header>
      <main className="contenu">
        <Outlet />
      </main>
      <footer className="pied">Film Management · Full-stack project by Aicha M. Touré · React, Express, MongoDB</footer>
    </div>
  );
}
