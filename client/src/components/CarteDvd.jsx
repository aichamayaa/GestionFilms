import { Link } from 'react-router';
import Pochette from './Pochette.jsx';

export default function CarteDvd({ film, numero, afficherDetenteur, retour }) {
  const etat = { from: retour };
  const { permissions } = film;

  return (
    <li className="carte-dvd">
      <span className="carte-numero" title={`DVD number ${numero}`}>
        {numero}
      </span>
      <Link to={`/dvds/${film._id}`} state={etat} className="carte-image" title={`View details for ${film.titreFrancais}`}>
        <Pochette fichier={film.imagePochette} titre={film.titreFrancais} />
      </Link>
      <div className="carte-corps">
        <h3 className="carte-titre" title={film.titreFrancais}>
          {film.titreFrancais}
        </h3>
        {afficherDetenteur && (
          <p className="carte-detenteur" title="User currently holding the DVD">
            {film.detenteur ? film.detenteur.nom : 'No holder'}
          </p>
        )}
      </div>
      <div className="carte-actions">
        <Link to={`/dvds/${film._id}`} state={etat} className="bouton bouton-petit bouton-secondaire" title="View full details">
          Details
        </Link>
        {permissions.modifier && (
          <Link to={`/dvds/${film._id}/modifier`} state={etat} className="bouton bouton-petit bouton-secondaire" title="Edit this DVD">
            Edit
          </Link>
        )}
        {permissions.supprimer && (
          <Link to={`/dvds/${film._id}/supprimer`} state={etat} className="bouton bouton-petit bouton-danger-contour" title="Delete this DVD">
            Delete
          </Link>
        )}
        {permissions.ecrire && film.detenteur && (
          <Link
            to={`/courriel?a=${film.detenteur._id}&objet=${encodeURIComponent(`About the DVD “${film.titreFrancais}”`)}`}
            className="bouton bouton-petit bouton-secondaire"
            title={`Send an email to ${film.detenteur.nom}`}
          >
            Email
          </Link>
        )}
        {permissions.approprier && (
          <Link to={`/dvds/${film._id}/appropriation`} state={etat} className="bouton bouton-petit bouton-primaire" title="Mark this DVD as now in your hands">
            Claim
          </Link>
        )}
      </div>
    </li>
  );
}
