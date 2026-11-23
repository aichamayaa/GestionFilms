import { Link } from 'react-router';
import Pochette from './Pochette.jsx';
import { useTranslation } from 'react-i18next';

export default function CarteDvd({ film, numero, afficherDetenteur, retour }) {
  const { t } = useTranslation();
  const etat = { from: retour };
  const { permissions } = film;

  return (
    <li className="carte-dvd">
      <span className="carte-numero" title={t('card.dvdNumber', { numero })}>
        {numero}
      </span>
      <Link to={`/dvds/${film._id}`} state={etat} className="carte-image" title={t('card.viewDetails', { titre: film.titreFrancais })}>
        <Pochette fichier={film.imagePochette} titre={film.titreFrancais} />
      </Link>
      <div className="carte-corps">
        <h3 className="carte-titre" title={film.titreFrancais}>
          {film.titreFrancais}
        </h3>
        {afficherDetenteur && (
          <p className="carte-detenteur" title={t('card.holderTitle')}>
            {film.detenteur ? film.detenteur.nom : t('card.noHolder')}
          </p>
        )}
      </div>
      <div className="carte-actions">
        <Link to={`/dvds/${film._id}`} state={etat} className="bouton bouton-petit bouton-secondaire" title={t('card.detailsTitle')}>
          {t('card.details')}
        </Link>
        {permissions.modifier && (
          <Link to={`/dvds/${film._id}/modifier`} state={etat} className="bouton bouton-petit bouton-secondaire" title={t('card.editTitle')}>
            {t('card.edit')}
          </Link>
        )}
        {permissions.supprimer && (
          <Link to={`/dvds/${film._id}/supprimer`} state={etat} className="bouton bouton-petit bouton-danger-contour" title={t('card.deleteTitle')}>
            {t('card.delete')}
          </Link>
        )}
        {permissions.ecrire && film.detenteur && (
          <Link
            to={`/courriel?a=${film.detenteur._id}&objet=${encodeURIComponent(t('card.emailSubject', { titre: film.titreFrancais }))}`}
            className="bouton bouton-petit bouton-secondaire"
            title={t('card.emailTitle', { nom: film.detenteur.nom })}
          >
            {t('card.email')}
          </Link>
        )}
        {permissions.approprier && (
          <Link to={`/dvds/${film._id}/appropriation`} state={etat} className="bouton bouton-petit bouton-primaire" title={t('card.claimTitle')}>
            {t('card.claim')}
          </Link>
        )}
      </div>
    </li>
  );
}
