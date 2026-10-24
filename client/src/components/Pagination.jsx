function construirePages(page, nbPages) {
  const pages = new Set([1, nbPages, page - 1, page, page + 1]);
  const valides = [...pages].filter((p) => p >= 1 && p <= nbPages).sort((a, b) => a - b);
  const resultat = [];
  valides.forEach((p, index) => {
    if (index > 0 && p - valides[index - 1] > 1) {
      resultat.push(`ellipse-${p}`);
    }
    resultat.push(p);
  });
  return resultat;
}

export default function Pagination({ page, nbPages, onChanger }) {
  if (nbPages <= 1) {
    return null;
  }

  return (
    <nav className="pagination" aria-label="Pagination">
      <button
        type="button"
        className="bouton bouton-secondaire"
        disabled={page <= 1}
        onClick={() => onChanger(page - 1)}
        title="Page précédente"
      >
        Précédent
      </button>
      <ul className="pagination-pages">
        {construirePages(page, nbPages).map((element) =>
          typeof element === 'string' ? (
            <li key={element} className="pagination-ellipse" aria-hidden="true">
              …
            </li>
          ) : (
            <li key={element}>
              <button
                type="button"
                className={element === page ? 'page-bouton page-actuelle' : 'page-bouton'}
                aria-current={element === page ? 'page' : undefined}
                onClick={() => onChanger(element)}
                title={`Aller à la page ${element}`}
              >
                {element}
              </button>
            </li>
          )
        )}
      </ul>
      <button
        type="button"
        className="bouton bouton-secondaire"
        disabled={page >= nbPages}
        onClick={() => onChanger(page + 1)}
        title="Page suivante"
      >
        Suivant
      </button>
    </nav>
  );
}
