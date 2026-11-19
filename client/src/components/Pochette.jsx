import { useState } from 'react';
import { urlPochette } from '../utils/format.js';

export default function Pochette({ fichier, titre, classe = '' }) {
  const [enErreur, setEnErreur] = useState(false);
  const url = urlPochette(fichier);

  if (!url || enErreur) {
    return (
      <div className={`pochette pochette-vide ${classe}`} role="img" aria-label={`No cover for ${titre}`}>
        <span>{titre}</span>
      </div>
    );
  }

  return (
    <img
      className={`pochette ${classe}`}
      src={url}
      alt={`Cover of ${titre}`}
      loading="lazy"
      onError={() => setEnErreur(true)}
    />
  );
}
