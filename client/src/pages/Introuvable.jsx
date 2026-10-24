import { Link } from 'react-router';

export default function Introuvable() {
  return (
    <section className="page page-etroite">
      <div className="panneau vide">
        <h1>Page introuvable</h1>
        <p>La page que vous cherchez n’existe pas ou a été déplacée.</p>
        <Link to="/dvds" className="bouton bouton-primaire">
          Retour à la liste des DVDs
        </Link>
      </div>
    </section>
  );
}
