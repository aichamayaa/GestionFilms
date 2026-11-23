import { useState } from 'react';
import { urlPochette } from '../utils/format.js';
import { useTranslation } from 'react-i18next';

export default function Pochette({ fichier, titre, classe = '' }) {
  const { t } = useTranslation();
  const [enErreur, setEnErreur] = useState(false);
  const url = urlPochette(fichier);

  if (!url || enErreur) {
    return (
      <div className={`pochette pochette-vide ${classe}`} role="img" aria-label={t('cover.none', { titre })}>
        <span>{titre}</span>
      </div>
    );
  }

  return (
    <img
      className={`pochette ${classe}`}
      src={url}
      alt={t('cover.alt', { titre })}
      loading="lazy"
      onError={() => setEnErreur(true)}
    />
  );
}
