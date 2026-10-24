const CLASSES_ACCENTS = {
  a: 'aàâäáãå',
  e: 'eéèêë',
  i: 'iîïíì',
  o: 'oôöóòõ',
  u: 'uùûüú',
  c: 'cç',
  y: 'yÿ',
  n: 'nñ',
};

export function normaliser(texte) {
  return String(texte ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/œ/gi, 'oe')
    .replace(/æ/gi, 'ae')
    .toLowerCase()
    .trim();
}

export function echapperRegex(texte) {
  return String(texte).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function regexSansAccents(texte, { exact = false } = {}) {
  const base = normaliser(texte);
  let motif = '';
  for (const caractere of base) {
    const classe = CLASSES_ACCENTS[caractere];
    if (classe) {
      motif += `[${classe}${classe.toUpperCase()}]`;
    } else {
      motif += echapperRegex(caractere);
    }
  }
  return new RegExp(exact ? `^${motif}$` : motif, 'i');
}

export function premierMot(nom) {
  return String(nom ?? '').trim().split(/\s+/)[0] ?? '';
}
