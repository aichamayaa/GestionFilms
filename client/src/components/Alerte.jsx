export default function Alerte({ type = 'erreur', children, onFermer }) {
  if (!children) {
    return null;
  }
  return (
    <div className={`alerte alerte-${type}`} role={type === 'erreur' ? 'alert' : 'status'}>
      <div className="alerte-texte">{children}</div>
      {onFermer && (
        <button type="button" className="alerte-fermer" onClick={onFermer} title="Close this message" aria-label="Close this message">
          ×
        </button>
      )}
    </div>
  );
}
