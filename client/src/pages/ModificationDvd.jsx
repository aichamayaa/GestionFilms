import { Link, useNavigate, useParams } from 'react-router';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useFilm, useRetour } from '../utils/hooks.js';
import Alerte from '../components/Alerte.jsx';
import Chargement from '../components/Chargement.jsx';
import FormulaireDvd, { valeursDepuisFilm } from '../components/FormulaireDvd.jsx';
import { useTranslation } from 'react-i18next';

export default function ModificationDvd() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const retour = useRetour();
  const { utilisateur } = useAuth();
  const { film, erreur, chargement } = useFilm(id);

  async function modifier(donnees) {
    const reponse = await api.modifierFilm(id, donnees);
    navigate(retour, { state: { message: t('edit.success', { titre: reponse.film.titreFrancais }) } });
  }

  if (chargement) {
    return <Chargement />;
  }

  if (erreur || !film) {
    return (
      <section className="page page-etroite">
        <Alerte type="erreur">{erreur || t('edit.notFound')}</Alerte>
        <Link to={retour} className="bouton bouton-secondaire">
          {t('common.backToList')}
        </Link>
      </section>
    );
  }

  if (!film.permissions.modifier) {
    return (
      <section className="page page-etroite">
        <Alerte type="erreur">{t('edit.forbidden')}</Alerte>
        <Link to={retour} className="bouton bouton-secondaire">
          {t('common.backToList')}
        </Link>
      </section>
    );
  }

  const pourAutrui = film.detenteur && film.detenteur._id !== utilisateur._id;
  const information = pourAutrui
    ? t('edit.onBehalf', { nom: film.detenteur.nom })
    : null;

  return (
    <section className="page page-etroite">
      <FormulaireDvd
        titre={t('edit.title', { titre: film.titreFrancais })}
        valeursInitiales={valeursDepuisFilm(film)}
        libelleBouton={t('edit.save')}
        onSoumettre={modifier}
        onAnnuler={() => navigate(retour)}
        informationPourQui={information}
      />
    </section>
  );
}
