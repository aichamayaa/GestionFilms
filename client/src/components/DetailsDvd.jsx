import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const nonPrecise = t('common.notSpecified');

  return (
    <article className="fiche panneau">
      <div className="fiche-image">
        <Pochette fichier={film.imagePochette} titre={film.titreFrancais} />
      </div>
      <div className="fiche-contenu">
        <h1 className="fiche-titre">{film.titreFrancais}</h1>
        <dl className="fiche-donnees">
          <Ligne libelle={t('details.originalTitle')}>{film.titreOriginal || nonPrecise}</Ligne>
          <Ligne libelle={t('details.releaseYear')}>{film.anneeSortie ?? nonPrecise}</Ligne>
          <Ligne libelle={t('details.category')}>{film.categorie ? traduire(film.categorie) : nonPrecise}</Ligne>
          <Ligne libelle={t('details.director')}>{film.realisateur?.nom ?? nonPrecise}</Ligne>
          <Ligne libelle={t('details.producer')}>{film.producteur?.nom ?? nonPrecise}</Ligne>
          <Ligne libelle={t('details.mainActors')}>
            {film.acteurs.length > 0 ? film.acteurs.map((a) => a.nom).join(', ') : nonPrecise}
          </Ligne>
          <Ligne libelle={t('details.duration')}>
            {film.dureeMinutes ? t('details.durationValue', { count: film.dureeMinutes }) : nonPrecise}
          </Ligne>
          <Ligne libelle={t('details.format')}>{film.format ? traduire(film.format) : nonPrecise}</Ligne>
          <Ligne libelle={t('details.languages')}>{formaterListe(film.langues)}</Ligne>
          <Ligne libelle={t('details.subtitles')}>{formaterListe(film.sousTitres)}</Ligne>
          <Ligne libelle={t('details.extras')}>
            {film.supplements.length > 0 ? (
              <ul className="liste-simple">
                {film.supplements.map((supplement) => (
                  <li key={supplement}>{traduire(supplement)}</li>
                ))}
              </ul>
            ) : (
              t('common.none')
            )}
          </Ligne>
          <Ligne libelle={t('details.discs')}>{film.nbDisques ?? nonPrecise}</Ligne>
          <Ligne libelle={t('details.originalDvd')}>{formaterOuiNon(film.dvdOriginal)}</Ligne>
          <Ligne libelle={t('details.extended')}>{formaterOuiNon(film.versionEtendue)}</Ligne>
          <Ligne libelle={t('details.visible')}>{formaterOuiNon(film.visibleATous)}</Ligne>
          <Ligne libelle={t('details.summary')}>{film.resume || t('details.noSummary')}</Ligne>
          <Ligne libelle={t('details.owner')}>{film.proprietaire?.nom ?? t('common.unknown')}</Ligne>
          <Ligne libelle={t('details.heldBy')}>{film.detenteur?.nom ?? t('common.nobody')}</Ligne>
          <Ligne libelle={t('details.updatedOn')}>{formaterDate(film.dateMAJ)}</Ligne>
          <Ligne libelle={t('details.updatedBy')}>{film.utilisateurMAJ?.nom ?? t('common.unknown')}</Ligne>
        </dl>
      </div>
    </article>
  );
}
