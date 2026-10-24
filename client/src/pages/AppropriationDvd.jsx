import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useAnnuaire, useFilm, useRetour } from '../utils/hooks.js';
import Alerte from '../components/Alerte.jsx';
import { Champ } from '../components/Champ.jsx';
import Chargement from '../components/Chargement.jsx';
import DetailsDvd from '../components/DetailsDvd.jsx';

export default function AppropriationDvd() {
  const { id } = useParams();
  const navigate = useNavigate();
  const retour = useRetour();
  const { utilisateur, estSuper } = useAuth();
  const { film, erreur, chargement } = useFilm(id);
  const { utilisateurs } = useAnnuaire(estSuper);
  const [nouveauDetenteurId, setNouveauDetenteurId] = useState('');
  const [envoi, setEnvoi] = useState(false);
  const [erreurAction, setErreurAction] = useState('');

  useEffect(() => {
    if (!estSuper || !film || nouveauDetenteurId) {
      return;
    }
    const parDefaut = film.detenteur?._id === utilisateur._id ? '' : utilisateur._id;
    setNouveauDetenteurId(parDefaut);
  }, [estSuper, film, utilisateur._id, nouveauDetenteurId]);

  const detenteurActuelId = film?.detenteur?._id ?? '';
  const cible = estSuper ? nouveauDetenteurId : utilisateur._id;
  const nomCible = estSuper
    ? utilisateurs.find((u) => u._id === nouveauDetenteurId)?.nom
    : utilisateur.nom;
  const peutConfirmer = Boolean(cible) && cible !== detenteurActuelId;

  async function confirmer() {
    setEnvoi(true);
    setErreurAction('');
    try {
      await api.approprierFilm(id, estSuper ? { nouveauDetenteurId } : {});
      navigate(retour, {
        state: { message: `Le DVD « ${film.titreFrancais} » est maintenant en main chez ${nomCible}.` },
      });
    } catch (e) {
      setErreurAction(e.message);
      setEnvoi(false);
    }
  }

  return (
    <section className="page page-etroite">
      {chargement && <Chargement />}
      <Alerte type="erreur">{erreur}</Alerte>
      {film && !film.permissions.approprier && <Alerte type="erreur">Vous ne pouvez pas vous approprier ce DVD.</Alerte>}
      {film && (
        <>
          <DetailsDvd film={film} />
          {film.permissions.approprier && (
            <div className="panneau confirmation">
              <h2>Appropriation du DVD</h2>
              {estSuper ? (
                <>
                  <p>
                    Ce DVD est actuellement en main chez <strong>{film.detenteur?.nom ?? 'personne'}</strong>. Indiquez le membre qui l’a
                    maintenant en main.
                  </p>
                  <Champ id="nouveauDetenteur" libelle="Nouveau détenteur" aide="Vous effectuez cette opération pour le membre choisi.">
                    <select
                      id="nouveauDetenteur"
                      value={nouveauDetenteurId}
                      onChange={(e) => setNouveauDetenteurId(e.target.value)}
                      title="Membre qui a maintenant le DVD en main"
                    >
                      <option value="">Choisir un membre</option>
                      {utilisateurs
                        .filter((u) => u._id !== detenteurActuelId)
                        .map((u) => (
                          <option key={u._id} value={u._id}>
                            {u._id === utilisateur._id ? `${u.nom} (moi)` : u.nom}
                          </option>
                        ))}
                    </select>
                  </Champ>
                </>
              ) : (
                <p>
                  Voulez-vous indiquer que vous avez maintenant en main le DVD « {film.titreFrancais} » que{' '}
                  <strong>{film.detenteur?.nom ?? 'personne'}</strong> avait en sa possession ? Les utilisateurs concernés seront avisés par
                  courriel.
                </p>
              )}
              <Alerte type="erreur">{erreurAction}</Alerte>
              <div className="formulaire-actions">
                <button type="button" className="bouton bouton-primaire" onClick={confirmer} disabled={envoi || !peutConfirmer}>
                  {envoi ? 'Enregistrement…' : 'Confirmer l’appropriation'}
                </button>
                <button type="button" className="bouton bouton-secondaire" onClick={() => navigate(retour)} disabled={envoi}>
                  Annuler
                </button>
              </div>
            </div>
          )}
        </>
      )}
      {!chargement && !film && (
        <Link to={retour} className="bouton bouton-secondaire">
          Retour à la liste
        </Link>
      )}
    </section>
  );
}
