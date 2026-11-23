import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { TRIS } from '../constantes.js';
import { useAnnuaire } from '../utils/hooks.js';
import Alerte from '../components/Alerte.jsx';
import CarteDvd from '../components/CarteDvd.jsx';
import Chargement from '../components/Chargement.jsx';
import Pagination from '../components/Pagination.jsx';
import { useTranslation } from 'react-i18next';

const TITRES = {
  tous: 'list.titleAll',
  'en-main': 'list.titleHeld',
  utilisateur: 'list.titleUser',
};

export default function ListeDvds({ portee }) {
  const { t } = useTranslation();
  const { utilisateur, estAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [donnees, setDonnees] = useState(null);
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(true);
  const [message, setMessage] = useState(location.state?.message ?? '');

  const page = Number.parseInt(params.get('page'), 10) || 1;
  const tri = params.get('tri') || 'titre';
  const q = params.get('q') || '';
  const idChoisi = params.get('u') || '';
  const [saisie, setSaisie] = useState(q);

  const { utilisateurs, erreur: erreurAnnuaire } = useAnnuaire(portee === 'utilisateur');
  const choix = utilisateurs.filter((u) => u._id !== utilisateur._id);

  useEffect(() => {
    setSaisie(q);
  }, [q]);

  useEffect(() => {
    if (location.state?.message) {
      navigate(`${location.pathname}${location.search}`, { replace: true, state: null });
    }
  }, []);

  useEffect(() => {
    if (portee === 'utilisateur' && !idChoisi) {
      setDonnees(null);
      setChargement(false);
      return undefined;
    }
    const controleur = new AbortController();
    setChargement(true);
    setErreur('');
    api
      .listerFilms({ portee, page, tri, q, utilisateurId: idChoisi }, controleur.signal)
      .then((reponse) => {
        setDonnees(reponse);
        setChargement(false);
      })
      .catch((e) => {
        if (e.name === 'AbortError') {
          return;
        }
        setErreur(e.message);
        setDonnees(null);
        setChargement(false);
      });
    return () => controleur.abort();
  }, [portee, page, tri, q, idChoisi]);

  function modifierParametres(changements) {
    const suivants = new URLSearchParams(params);
    for (const [cle, valeur] of Object.entries(changements)) {
      if (valeur === '' || valeur === null || valeur === undefined || (cle === 'page' && valeur === 1)) {
        suivants.delete(cle);
      } else {
        suivants.set(cle, String(valeur));
      }
    }
    setParams(suivants);
  }

  function lancerRecherche(evenement) {
    evenement.preventDefault();
    modifierParametres({ q: saisie.trim(), page: 1 });
  }

  const retour = `${location.pathname}${location.search}`;
  const premierNumero = donnees ? (donnees.page - 1) * donnees.parPage : 0;
  const recherche = portee === 'tous' && q !== '';

  return (
    <section className="page">
      <div className="page-entete">
        <h1>{recherche ? t('list.searchResults') : t(TITRES[portee])}</h1>
        {donnees && (
          <p className="page-compte" aria-live="polite">
            {donnees.utilisateur
              ? t('list.countHeld', { count: donnees.total, nom: donnees.utilisateur.nom })
              : t('list.count', { count: donnees.total })}
          </p>
        )}
      </div>

      <Alerte type="succes" onFermer={() => setMessage('')}>
        {message}
      </Alerte>
      <Alerte type="erreur">{erreur || erreurAnnuaire}</Alerte>

      {portee === 'utilisateur' && (
        <div className="panneau barre-outils">
          <div className="champ champ-ligne">
            <label htmlFor="choix-utilisateur">{estAdmin ? t('list.user') : t('list.otherUser')}</label>
            <select
              id="choix-utilisateur"
              value={idChoisi}
              onChange={(e) => modifierParametres({ u: e.target.value, page: 1 })}
              title={t('list.chooseUserTitle')}
            >
              <option value="">{t('list.chooseUser')}</option>
              {choix.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.nom}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {portee === 'tous' && (
        <div className="panneau barre-outils">
          <form className="recherche" onSubmit={lancerRecherche} role="search">
            <label htmlFor="recherche" className="sr-seulement">
              {t('list.searchLabel')}
            </label>
            <input
              id="recherche"
              type="search"
              value={saisie}
              onChange={(e) => setSaisie(e.target.value)}
              placeholder={t('list.searchPh')}
              title={t('list.searchTitle')}
            />
            <button type="submit" className="bouton bouton-primaire">
              {t('list.search')}
            </button>
            {recherche && (
              <button
                type="button"
                className="bouton bouton-secondaire"
                onClick={() => modifierParametres({ q: '', page: 1 })}
                title={t('list.backTitle')}
              >
                {t('list.back')}
              </button>
            )}
          </form>
          <div className="champ champ-ligne">
            <label htmlFor="tri">{t('list.sortBy')}</label>
            <select
              id="tri"
              value={tri}
              onChange={(e) => modifierParametres({ tri: e.target.value === 'titre' ? '' : e.target.value, page: 1 })}
              title={t('list.sortTitle')}
            >
              {TRIS.map((option) => (
                <option key={option} value={option}>
                  {t(`sorts.${option}`)}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {chargement && <Chargement />}

      {!chargement && portee === 'utilisateur' && !idChoisi && (
        <p className="vide panneau">{t('list.pickUser')}</p>
      )}

      {!chargement && donnees && donnees.films.length === 0 && (
        <p className="vide panneau">
          {recherche
            ? t('list.noMatch', { q })
            : portee === 'en-main'
              ? t('list.notHolding')
              : t('list.noDvds')}
        </p>
      )}

      {!chargement && donnees && donnees.films.length > 0 && (
        <>
          <ol className="grille-dvd" start={premierNumero + 1}>
            {donnees.films.map((film, index) => (
              <CarteDvd
                key={film._id}
                film={film}
                numero={premierNumero + index + 1}
                afficherDetenteur={portee === 'tous'}
                retour={retour}
              />
            ))}
          </ol>
          <p className="page-position">
            {t('list.pageOf', { page: donnees.page, total: donnees.nbPages })}
          </p>
          <Pagination page={donnees.page} nbPages={donnees.nbPages} onChanger={(p) => modifierParametres({ page: p })} />
        </>
      )}
    </section>
  );
}
