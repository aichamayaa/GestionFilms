import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { api } from '../api/client.js';
import { useFilm, useRetour } from '../utils/hooks.js';
import Alerte from '../components/Alerte.jsx';
import Chargement from '../components/Chargement.jsx';
import DetailsDvd from '../components/DetailsDvd.jsx';

export default function SuppressionDvd() {
  const { id } = useParams();
  const navigate = useNavigate();
  const retour = useRetour();
  const { film, erreur, chargement } = useFilm(id);
  const [envoi, setEnvoi] = useState(false);
  const [erreurAction, setErreurAction] = useState('');

  async function confirmer() {
    setEnvoi(true);
    setErreurAction('');
    try {
      await api.supprimerFilm(id);
      navigate(retour, { state: { message: `The DVD “${film.titreFrancais}” was deleted.` } });
    } catch (e) {
      setErreurAction(e.message);
      setEnvoi(false);
    }
  }

  return (
    <section className="page page-etroite">
      {chargement && <Chargement />}
      <Alerte type="erreur">{erreur}</Alerte>
      {film && !film.permissions.supprimer && <Alerte type="erreur">You can’t delete this DVD.</Alerte>}
      {film && (
        <>
          <DetailsDvd film={film} />
          {film.permissions.supprimer && (
            <div className="panneau confirmation confirmation-danger">
              <h2>Confirm deletion</h2>
              <p>
                Do you really want to delete the DVD “{film.titreFrancais}”? This cannot be undone: the DVD will be removed from the database and the users concerned will be notified by email.
              </p>
              <Alerte type="erreur">{erreurAction}</Alerte>
              <div className="formulaire-actions">
                <button type="button" className="bouton bouton-danger" onClick={confirmer} disabled={envoi}>
                  {envoi ? 'Deleting…' : 'Yes, delete this DVD'}
                </button>
                <button type="button" className="bouton bouton-secondaire" onClick={() => navigate(retour)} disabled={envoi}>
                  No, cancel
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
