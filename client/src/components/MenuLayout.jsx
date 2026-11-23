import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext.jsx';
import { libelleRole } from '../constantes.js';
import SelecteurLangue from './SelecteurLangue.jsx';

const LIENS_UTILISATEUR = [
  { vers: '/dvds', cle: 'allDvds', fin: true },
  { vers: '/dvds/en-main', cle: 'held' },
  { vers: '/dvds/utilisateurs', cle: 'otherUser' },
  { vers: '/dvds/ajout', cle: 'add' },
  { vers: '/personnalisation', cle: 'settings' },
  { vers: '/courriel', cle: 'sendEmail' },
  { vers: '/courriels', cle: 'sentEmails' },
];

const LIENS_ADMIN = [
  { vers: '/dvds', cle: 'allDvds', fin: true },
  { vers: '/dvds/utilisateurs', cle: 'aUser' },
  { vers: '/administration/utilisateurs', cle: 'userMgmt' },
  { vers: '/courriel', cle: 'sendEmail' },
  { vers: '/courriels', cle: 'sentEmails' },
];

export default function MenuLayout() {
  const { t } = useTranslation();
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
          <NavLink to="/dvds" end className="marque" title={t('nav.backHome')}>
            {t('common.appName')}
          </NavLink>
          <button
            type="button"
            className="bouton-menu"
            aria-expanded={menuOuvert}
            aria-controls="navigation-principale"
            onClick={() => setMenuOuvert((ouvert) => !ouvert)}
          >
            {t('nav.menu')}
          </button>
          <nav id="navigation-principale" className={`navigation${menuOuvert ? ' navigation-ouverte' : ''}`} aria-label={t('nav.main')}>
            {liens.map((lien) => (
              <NavLink
                key={lien.vers}
                to={lien.vers}
                end={lien.fin}
                title={t(`nav.${lien.cle}Help`)}
                className={({ isActive }) => (isActive ? 'lien-menu actif' : 'lien-menu')}
                onClick={() => setMenuOuvert(false)}
              >
                {t(`nav.${lien.cle}`)}
              </NavLink>
            ))}
          </nav>
          <div className="session">
            <SelecteurLangue />
            <span className="session-nom" title={libelleRole(utilisateur.role)}>
              {utilisateur.nom}
            </span>
            <span className="badge badge-role">{libelleRole(utilisateur.role)}</span>
            <button type="button" className="bouton bouton-contour" onClick={seDeconnecter} title={t('nav.logoutTitle')}>
              {t('nav.logout')}
            </button>
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
