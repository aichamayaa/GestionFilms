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

const TITRES = {
  tous: 'DVDs de tous les utilisateurs',
  'en-main': 'Mes DVDs en main',
  utilisateur: 'DVDs d’un autre utilisateur',
};

export default function ListeDvds({ portee }) {
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
        <h1>{recherche ? 'Résultats de la recherche' : TITRES[portee]}</h1>
        {donnees && (
          <p className="page-compte" aria-live="polite">
            {donnees.total} DVD{donnees.total > 1 ? 's' : ''}
            {donnees.utilisateur ? ` en main chez ${donnees.utilisateur.nom}` : ''}
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
            <label htmlFor="choix-utilisateur">{estAdmin ? 'Utilisateur' : 'Autre utilisateur'}</label>
            <select
              id="choix-utilisateur"
              value={idChoisi}
              onChange={(e) => modifierParametres({ u: e.target.value, page: 1 })}
              title="Choisir l’utilisateur dont vous voulez voir les DVDs"
            >
              <option value="">Choisir un utilisateur</option>
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
              Rechercher un titre
            </label>
            <input
              id="recherche"
              type="search"
              value={saisie}
              onChange={(e) => setSaisie(e.target.value)}
              placeholder="Titre français ou original, en entier ou en partie"
              title="Rechercher sur une partie ou la totalité du titre français ou du titre original"
            />
            <button type="submit" className="bouton bouton-primaire">
              Rechercher
            </button>
            {recherche && (
              <button
                type="button"
                className="bouton bouton-secondaire"
                onClick={() => modifierParametres({ q: '', page: 1 })}
                title="Afficher de nouveau tous les DVDs"
              >
                Retour
              </button>
            )}
          </form>
          <div className="champ champ-ligne">
            <label htmlFor="tri">Trier par</label>
            <select
              id="tri"
              value={tri}
              onChange={(e) => modifierParametres({ tri: e.target.value === 'titre' ? '' : e.target.value, page: 1 })}
              title="Choisir l’ordre alphabétique d’affichage"
            >
              {TRIS.map((option) => (
                <option key={option.valeur} value={option.valeur}>
                  {option.libelle}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {chargement && <Chargement />}

      {!chargement && portee === 'utilisateur' && !idChoisi && (
        <p className="vide panneau">Choisissez un utilisateur dans la liste pour afficher ses DVDs.</p>
      )}

      {!chargement && donnees && donnees.films.length === 0 && (
        <p className="vide panneau">
          {recherche
            ? `Aucun DVD ne correspond à « ${q} ».`
            : portee === 'en-main'
              ? 'Vous n’avez aucun DVD en main pour le moment.'
              : 'Aucun DVD à afficher.'}
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
            Page {donnees.page} sur {donnees.nbPages}
          </p>
          <Pagination page={donnees.page} nbPages={donnees.nbPages} onChanger={(p) => modifierParametres({ page: p })} />
        </>
      )}
    </section>
  );
}
