import { Link } from 'react-router';
import Pochette from './Pochette.jsx';

export default function CarteDvd({ film, numero, afficherDetenteur, retour }) {
  const etat = { from: retour };
  const { permissions } = film;

  return (
    <li className="carte-dvd">
      <span className="carte-numero" title={`DVD numéro ${numero}`}>
        {numero}
      </span>
      <Link to={`/dvds/${film._id}`} state={etat} className="carte-image" title={`Afficher les données détaillées de ${film.titreFrancais}`}>
        <Pochette fichier={film.imagePochette} titre={film.titreFrancais} />
      </Link>
      <div className="carte-corps">
        <h3 className="carte-titre" title={film.titreFrancais}>
          {film.titreFrancais}
        </h3>
        {afficherDetenteur && (
          <p className="carte-detenteur" title="Utilisateur ayant le DVD en main">
            {film.detenteur ? film.detenteur.nom : 'Aucun détenteur'}
          </p>
        )}
      </div>
      <div className="carte-actions">
        <Link to={`/dvds/${film._id}`} state={etat} className="bouton bouton-petit bouton-secondaire" title="Afficher les données détaillées">
          Détails
        </Link>
        {permissions.modifier && (
          <Link to={`/dvds/${film._id}/modifier`} state={etat} className="bouton bouton-petit bouton-secondaire" title="Modifier les données de ce DVD">
            Modifier
          </Link>
        )}
        {permissions.supprimer && (
          <Link to={`/dvds/${film._id}/supprimer`} state={etat} className="bouton bouton-petit bouton-danger-contour" title="Supprimer ce DVD">
            Supprimer
          </Link>
        )}
        {permissions.ecrire && film.detenteur && (
          <Link
            to={`/courriel?a=${film.detenteur._id}&objet=${encodeURIComponent(`À propos du DVD « ${film.titreFrancais} »`)}`}
            className="bouton bouton-petit bouton-secondaire"
            title={`Envoyer un courriel à ${film.detenteur.nom}`}
          >
            Écrire
          </Link>
        )}
        {permissions.approprier && (
          <Link to={`/dvds/${film._id}/appropriation`} state={etat} className="bouton bouton-petit bouton-primaire" title="Indiquer que ce DVD est maintenant en main chez vous">
            Appropriation
          </Link>
        )}
      </div>
    </li>
  );
}
