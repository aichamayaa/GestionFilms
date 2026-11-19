import { traduire } from '../constantes.js';

export function formaterDate(valeur) {
  if (!valeur) {
    return 'Not specified';
  }
  return new Date(valeur).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function formaterDateHeure(valeur) {
  if (!valeur) {
    return '';
  }
  return new Date(valeur).toLocaleString('en-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formaterOuiNon(valeur) {
  if (valeur === true) {
    return 'Yes';
  }
  if (valeur === false) {
    return 'No';
  }
  return 'Not specified';
}

export function formaterListe(valeurs) {
  return valeurs && valeurs.length > 0 ? valeurs.map(traduire).join(', ') : 'None';
}

export function urlPochette(fichier) {
  return fichier ? `/pochettes/${encodeURIComponent(fichier)}` : null;
}
