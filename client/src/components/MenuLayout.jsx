import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext.jsx';
import { ROLES } from '../constantes.js';

const LIENS_UTILISATEUR = [
  { vers: '/dvds', libelle: 'Tous les DVDs', fin: true, aide: 'Afficher les DVDs de tous les utilisateurs' },
  { vers: '/dvds/en-main', libelle: 'Mes DVDs en main', aide: 'Afficher les DVDs que j’ai en main' },
  { vers: '/dvds/utilisateurs', libelle: 'DVDs d’un autre utilisateur', aide: 'Afficher les DVDs d’un autre utilisateur' },
  { vers: '/dvds/ajout', libelle: 'Ajouter un DVD', aide: 'Ajouter un nouveau DVD à la collection' },
  { vers: '/personnalisation', libelle: 'Personnalisation', aide: 'Modifier mon mot de passe et mes préférences' },
  { vers: '/courriel', libelle: 'Envoyer un courriel', aide: 'Transmettre un message à un ou plusieurs utilisateurs' },
  { vers: '/courriels', libelle: 'Courriels envoyés', aide: 'Consulter les courriels envoyés par l’application' },
];

const LIENS_ADMIN = [
  { vers: '/dvds', libelle: 'Tous les DVDs', fin: true, aide: 'Afficher les DVDs de tous les utilisateurs' },
  { vers: '/dvds/utilisateurs', libelle: 'DVDs d’un utilisateur', aide: 'Afficher les DVDs d’un utilisateur' },
  { vers: '/administration/utilisateurs', libelle: 'Gestion des utilisateurs', aide: 'Gérer les comptes des utilisateurs' },
  { vers: '/courriel', libelle: 'Envoyer un courriel', aide: 'Transmettre un message à un ou plusieurs utilisateurs' },
  { vers: '/courriels', libelle: 'Courriels envoyés', aide: 'Consulter les courriels envoyés par l’application' },
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
          <NavLink to="/dvds" end className="marque" title="Retour à l’accueil">
            Gestion de films
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
          <nav id="navigation-principale" className={`navigation${menuOuvert ? ' navigation-ouverte' : ''}`} aria-label="Navigation principale">
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
            <button type="button" className="bouton bouton-contour" onClick={seDeconnecter} title="Fermer ma session">
              Déconnexion
            </button>
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
