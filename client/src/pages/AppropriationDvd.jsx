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
        state: { message: `The DVD “${film.titreFrancais}” is now held by ${nomCible}.` },
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
      {film && !film.permissions.approprier && <Alerte type="erreur">You can’t claim this DVD.</Alerte>}
      {film && (
        <>
          <DetailsDvd film={film} />
          {film.permissions.approprier && (
            <div className="panneau confirmation">
              <h2>Claim DVD</h2>
              {estSuper ? (
                <>
                  <p>
                    This DVD is currently held by <strong>{film.detenteur?.nom ?? 'nobody'}</strong>. Choose the member who now has it.
                  </p>
                  <Champ id="nouveauDetenteur" libelle="New holder" aide="You are doing this on behalf of the selected member.">
                    <select
                      id="nouveauDetenteur"
                      value={nouveauDetenteurId}
                      onChange={(e) => setNouveauDetenteurId(e.target.value)}
                      title="Member who now has the DVD"
                    >
                      <option value="">Choose a member</option>
                      {utilisateurs
                        .filter((u) => u._id !== detenteurActuelId)
                        .map((u) => (
                          <option key={u._id} value={u._id}>
                            {u._id === utilisateur._id ? `${u.nom} (me)` : u.nom}
                          </option>
                        ))}
                    </select>
                  </Champ>
                </>
              ) : (
                <p>
                  Confirm that you now have the DVD “{film.titreFrancais}”, currently held by{' '}
                  <strong>{film.detenteur?.nom ?? 'nobody'}</strong>. The users concerned will be notified by email.
                </p>
              )}
              <Alerte type="erreur">{erreurAction}</Alerte>
              <div className="formulaire-actions">
                <button type="button" className="bouton bouton-primaire" onClick={confirmer} disabled={envoi || !peutConfirmer}>
                  {envoi ? 'Saving…' : 'Confirm claim'}
                </button>
                <button type="button" className="bouton bouton-secondaire" onClick={() => navigate(retour)} disabled={envoi}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </>
      )}
      {!chargement && !film && (
        <Link to={retour} className="bouton bouton-secondaire">
          Back to list
        </Link>
      )}
    </section>
  );
}
