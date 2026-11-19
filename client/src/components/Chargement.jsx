export default function Chargement({ texte = 'Loading…' }) {
  return (
    <div className="chargement" role="status" aria-live="polite">
      <span className="chargement-roue" aria-hidden="true" />
      <span>{texte}</span>
    </div>
  );
}
