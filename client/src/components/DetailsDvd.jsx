import Pochette from './Pochette.jsx';
import { formaterDate, formaterListe, formaterOuiNon } from '../utils/format.js';

function Ligne({ libelle, children }) {
  return (
    <div className="fiche-ligne">
      <dt>{libelle}</dt>
      <dd>{children}</dd>
    </div>
  );
}

export default function DetailsDvd({ film }) {
  return (
    <article className="fiche panneau">
      <div className="fiche-image">
        <Pochette fichier={film.imagePochette} titre={film.titreFrancais} />
      </div>
      <div className="fiche-contenu">
        <h1 className="fiche-titre">{film.titreFrancais}</h1>
        <dl className="fiche-donnees">
          <Ligne libelle="Titre original">{film.titreOriginal || 'Non précisé'}</Ligne>
          <Ligne libelle="Année de sortie">{film.anneeSortie ?? 'Non précisée'}</Ligne>
          <Ligne libelle="Catégorie">{film.categorie || 'Non précisée'}</Ligne>
          <Ligne libelle="Réalisateur">{film.realisateur?.nom ?? 'Non précisé'}</Ligne>
          <Ligne libelle="Producteur">{film.producteur?.nom ?? 'Non précisé'}</Ligne>
          <Ligne libelle="Acteurs principaux">
            {film.acteurs.length > 0 ? film.acteurs.map((a) => a.nom).join(', ') : 'Non précisés'}
          </Ligne>
          <Ligne libelle="Durée">{film.dureeMinutes ? `${film.dureeMinutes} minutes` : 'Non précisée'}</Ligne>
          <Ligne libelle="Format">{film.format || 'Non précisé'}</Ligne>
          <Ligne libelle="Langues">{formaterListe(film.langues)}</Ligne>
          <Ligne libelle="Sous-titres">{formaterListe(film.sousTitres)}</Ligne>
          <Ligne libelle="Suppléments">
            {film.supplements.length > 0 ? (
              <ul className="liste-simple">
                {film.supplements.map((supplement) => (
                  <li key={supplement}>{supplement}</li>
                ))}
              </ul>
            ) : (
              'Aucun'
            )}
          </Ligne>
          <Ligne libelle="Nombre de disques">{film.nbDisques ?? 'Non précisé'}</Ligne>
          <Ligne libelle="DVD original ?">{formaterOuiNon(film.dvdOriginal)}</Ligne>
          <Ligne libelle="Version étendue ?">{formaterOuiNon(film.versionEtendue)}</Ligne>
          <Ligne libelle="Visible à tous ?">{formaterOuiNon(film.visibleATous)}</Ligne>
          <Ligne libelle="Résumé">{film.resume || 'Aucun résumé'}</Ligne>
          <Ligne libelle="Propriétaire">{film.proprietaire?.nom ?? 'Inconnu'}</Ligne>
          <Ligne libelle="En main chez">{film.detenteur?.nom ?? 'Personne'}</Ligne>
          <Ligne libelle="Dernière mise à jour effectuée le">{formaterDate(film.dateMAJ)}</Ligne>
          <Ligne libelle="Dernière mise à jour effectuée par">{film.utilisateurMAJ?.nom ?? 'Inconnu'}</Ligne>
        </dl>
      </div>
    </article>
  );
}
