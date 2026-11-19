import { Link, useNavigate, useParams } from 'react-router';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useFilm, useRetour } from '../utils/hooks.js';
import Alerte from '../components/Alerte.jsx';
import Chargement from '../components/Chargement.jsx';
import FormulaireDvd, { valeursDepuisFilm } from '../components/FormulaireDvd.jsx';

export default function ModificationDvd() {
  const { id } = useParams();
  const navigate = useNavigate();
  const retour = useRetour();
  const { utilisateur } = useAuth();
  const { film, erreur, chargement } = useFilm(id);

  async function modifier(donnees) {
    const reponse = await api.modifierFilm(id, donnees);
    navigate(retour, { state: { message: `The DVD “${reponse.film.titreFrancais}” was updated.` } });
  }

  if (chargement) {
    return <Chargement />;
  }

  if (erreur || !film) {
    return (
      <section className="page page-etroite">
        <Alerte type="erreur">{erreur || 'This DVD could not be found.'}</Alerte>
        <Link to={retour} className="bouton bouton-secondaire">
          Back to list
        </Link>
      </section>
    );
  }

  if (!film.permissions.modifier) {
    return (
      <section className="page page-etroite">
        <Alerte type="erreur">You can’t edit this DVD.</Alerte>
        <Link to={retour} className="bouton bouton-secondaire">
          Back to list
        </Link>
      </section>
    );
  }

  const pourAutrui = film.detenteur && film.detenteur._id !== utilisateur._id;
  const information = pourAutrui
    ? `You are making this change on behalf of ${film.detenteur.nom}, who is holding this DVD.`
    : null;

  return (
    <section className="page page-etroite">
      <FormulaireDvd
        titre={`Edit DVD “${film.titreFrancais}”`}
        valeursInitiales={valeursDepuisFilm(film)}
        libelleBouton="Save changes"
        onSoumettre={modifier}
        onAnnuler={() => navigate(retour)}
        informationPourQui={information}
      />
    </section>
  );
}
