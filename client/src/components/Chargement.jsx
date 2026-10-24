export default function Chargement({ texte = 'Chargement en cours…' }) {
  return (
    <div className="chargement" role="status" aria-live="polite">
      <span className="chargement-roue" aria-hidden="true" />
      <span>{texte}</span>
    </div>
  );
}
