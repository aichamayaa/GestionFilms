import Pochette from './Pochette.jsx';
import { formaterDate, formaterListe, formaterOuiNon } from '../utils/format.js';
import { traduire } from '../constantes.js';

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
          <Ligne libelle="Original title">{film.titreOriginal || 'Not specified'}</Ligne>
          <Ligne libelle="Release year">{film.anneeSortie ?? 'Not specified'}</Ligne>
          <Ligne libelle="Category">{film.categorie ? traduire(film.categorie) : 'Not specified'}</Ligne>
          <Ligne libelle="Director">{film.realisateur?.nom ?? 'Not specified'}</Ligne>
          <Ligne libelle="Producer">{film.producteur?.nom ?? 'Not specified'}</Ligne>
          <Ligne libelle="Main actors">
            {film.acteurs.length > 0 ? film.acteurs.map((a) => a.nom).join(', ') : 'Not specified'}
          </Ligne>
          <Ligne libelle="Duration">{film.dureeMinutes ? `${film.dureeMinutes} minutes` : 'Not specified'}</Ligne>
          <Ligne libelle="Format">{film.format ? traduire(film.format) : 'Not specified'}</Ligne>
          <Ligne libelle="Languages">{formaterListe(film.langues)}</Ligne>
          <Ligne libelle="Subtitles">{formaterListe(film.sousTitres)}</Ligne>
          <Ligne libelle="Extras">
            {film.supplements.length > 0 ? (
              <ul className="liste-simple">
                {film.supplements.map((supplement) => (
                  <li key={supplement}>{traduire(supplement)}</li>
                ))}
              </ul>
            ) : (
              'None'
            )}
          </Ligne>
          <Ligne libelle="Number of discs">{film.nbDisques ?? 'Not specified'}</Ligne>
          <Ligne libelle="Original DVD?">{formaterOuiNon(film.dvdOriginal)}</Ligne>
          <Ligne libelle="Extended edition?">{formaterOuiNon(film.versionEtendue)}</Ligne>
          <Ligne libelle="Visible to everyone?">{formaterOuiNon(film.visibleATous)}</Ligne>
          <Ligne libelle="Summary">{film.resume || 'No summary'}</Ligne>
          <Ligne libelle="Owner">{film.proprietaire?.nom ?? 'Unknown'}</Ligne>
          <Ligne libelle="Held by">{film.detenteur?.nom ?? 'Nobody'}</Ligne>
          <Ligne libelle="Last updated on">{formaterDate(film.dateMAJ)}</Ligne>
          <Ligne libelle="Last updated by">{film.utilisateurMAJ?.nom ?? 'Unknown'}</Ligne>
        </dl>
      </div>
    </article>
  );
}
