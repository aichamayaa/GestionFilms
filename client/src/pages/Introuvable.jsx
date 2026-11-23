import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';

export default function Introuvable() {
  const { t } = useTranslation();
  return (
    <section className="page page-etroite">
      <div className="panneau vide">
        <h1>{t('notFound.title')}</h1>
        <p>{t('notFound.text')}</p>
        <Link to="/dvds" className="bouton bouton-primaire">
          {t('notFound.back')}
        </Link>
      </div>
    </section>
  );
}
