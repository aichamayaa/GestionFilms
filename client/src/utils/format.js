import i18n, { langueCourante } from '../i18n/index.js';
import { traduire } from '../constantes.js';

function localeDate() {
  return langueCourante() === 'fr' ? 'fr-CA' : 'en-CA';
}

export function formaterDate(valeur) {
  if (!valeur) {
    return i18n.t('common.notSpecified');
  }
  return new Date(valeur).toLocaleDateString(localeDate(), { year: 'numeric', month: 'long', day: 'numeric' });
}

export function formaterDateHeure(valeur) {
  if (!valeur) {
    return '';
  }
  return new Date(valeur).toLocaleString(localeDate(), {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formaterOuiNon(valeur) {
  if (valeur === true) {
    return i18n.t('common.yes');
  }
  if (valeur === false) {
    return i18n.t('common.no');
  }
  return i18n.t('common.notSpecified');
}

export function formaterListe(valeurs) {
  return valeurs && valeurs.length > 0 ? valeurs.map(traduire).join(', ') : i18n.t('common.none');
}

export function urlPochette(fichier) {
  return fichier ? `/pochettes/${encodeURIComponent(fichier)}` : null;
}
