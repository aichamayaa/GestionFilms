import { useTranslation } from 'react-i18next';

export default function Alerte({ type = 'erreur', children, onFermer }) {
  const { t } = useTranslation();
  if (!children) {
    return null;
  }
  return (
    <div className={`alerte alerte-${type}`} role={type === 'erreur' ? 'alert' : 'status'}>
      <div className="alerte-texte">{children}</div>
      {onFermer && (
        <button type="button" className="alerte-fermer" onClick={onFermer} title={t('common.closeMessage')} aria-label={t('common.closeMessage')}>
          ×
        </button>
      )}
    </div>
  );
}
