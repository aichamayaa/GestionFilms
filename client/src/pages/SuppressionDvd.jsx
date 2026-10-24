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
      navigate(retour, { state: { message: `Le DVD « ${film.titreFrancais} » a été supprimé.` } });
    } catch (e) {
      setErreurAction(e.message);
      setEnvoi(false);
    }
  }

  return (
    <section className="page page-etroite">
      {chargement && <Chargement />}
      <Alerte type="erreur">{erreur}</Alerte>
      {film && !film.permissions.supprimer && <Alerte type="erreur">Vous ne pouvez pas supprimer ce DVD.</Alerte>}
      {film && (
        <>
          <DetailsDvd film={film} />
          {film.permissions.supprimer && (
            <div className="panneau confirmation confirmation-danger">
              <h2>Confirmer la suppression</h2>
              <p>
                Voulez-vous vraiment supprimer le DVD « {film.titreFrancais} » ? Cette opération est définitive : le DVD sera retiré
                de la base de données et les utilisateurs concernés seront avisés par courriel.
              </p>
              <Alerte type="erreur">{erreurAction}</Alerte>
              <div className="formulaire-actions">
                <button type="button" className="bouton bouton-danger" onClick={confirmer} disabled={envoi}>
                  {envoi ? 'Suppression…' : 'Oui, supprimer ce DVD'}
                </button>
                <button type="button" className="bouton bouton-secondaire" onClick={() => navigate(retour)} disabled={envoi}>
                  Non, annuler
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
