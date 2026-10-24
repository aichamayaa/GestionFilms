export function formaterDate(valeur) {
  if (!valeur) {
    return 'Non précisée';
  }
  return new Date(valeur).toLocaleDateString('fr-CA', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function formaterDateHeure(valeur) {
  if (!valeur) {
    return '';
  }
  return new Date(valeur).toLocaleString('fr-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formaterOuiNon(valeur) {
  if (valeur === true) {
    return 'Oui';
  }
  if (valeur === false) {
    return 'Non';
  }
  return 'Non précisé';
}

export function formaterListe(valeurs) {
  return valeurs && valeurs.length > 0 ? valeurs.join(', ') : 'Aucun';
}

export function urlPochette(fichier) {
  return fichier ? `/pochettes/${encodeURIComponent(fichier)}` : null;
}
