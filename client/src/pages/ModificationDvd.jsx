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
    navigate(retour, { state: { message: `Le DVD « ${reponse.film.titreFrancais} » a été modifié.` } });
  }

  if (chargement) {
    return <Chargement />;
  }

  if (erreur || !film) {
    return (
      <section className="page page-etroite">
        <Alerte type="erreur">{erreur || 'Ce DVD est introuvable.'}</Alerte>
        <Link to={retour} className="bouton bouton-secondaire">
          Retour à la liste
        </Link>
      </section>
    );
  }

  if (!film.permissions.modifier) {
    return (
      <section className="page page-etroite">
        <Alerte type="erreur">Vous ne pouvez pas modifier ce DVD.</Alerte>
        <Link to={retour} className="bouton bouton-secondaire">
          Retour à la liste
        </Link>
      </section>
    );
  }

  const pourAutrui = film.detenteur && film.detenteur._id !== utilisateur._id;
  const information = pourAutrui
    ? `Vous effectuez cette modification pour ${film.detenteur.nom}, qui a ce DVD en main.`
    : null;

  return (
    <section className="page page-etroite">
      <FormulaireDvd
        titre={`Modification du DVD « ${film.titreFrancais} »`}
        valeursInitiales={valeursDepuisFilm(film)}
        libelleBouton="Enregistrer les modifications"
        onSoumettre={modifier}
        onAnnuler={() => navigate(retour)}
        informationPourQui={information}
      />
    </section>
  );
}
