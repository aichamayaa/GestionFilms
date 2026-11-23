import { useTranslation } from 'react-i18next';

export default function Chargement({ texte }) {
  const { t } = useTranslation();
  return (
    <div className="chargement" role="status" aria-live="polite">
      <span className="chargement-roue" aria-hidden="true" />
      <span>{texte ?? t('common.loading')}</span>
    </div>
  );
}
