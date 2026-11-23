import { useTranslation } from 'react-i18next';

const LANGUES_UI = ['en', 'fr'];

export default function SelecteurLangue() {
  const { t, i18n } = useTranslation();
  const courante = i18n.language?.startsWith('fr') ? 'fr' : 'en';

  return (
    <div className="selecteur-langue" role="group" aria-label={t('lang.label')}>
      {LANGUES_UI.map((code) => (
        <button
          key={code}
          type="button"
          lang={code}
          className={code === courante ? 'langue-bouton langue-active' : 'langue-bouton'}
          aria-pressed={code === courante}
          title={t(`lang.${code}`)}
          onClick={() => i18n.changeLanguage(code)}
        >
          {code.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
