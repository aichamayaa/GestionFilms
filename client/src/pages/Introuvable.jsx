import { Link } from 'react-router';

export default function Introuvable() {
  return (
    <section className="page page-etroite">
      <div className="panneau vide">
        <h1>Page not found</h1>
        <p>The page you’re looking for doesn’t exist or has been moved.</p>
        <Link to="/dvds" className="bouton bouton-primaire">
          Back to the DVD list
        </Link>
      </div>
    </section>
  );
}
