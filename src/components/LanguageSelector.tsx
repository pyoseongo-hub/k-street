import { useLanguage, type Language } from '../lib/useLanguage';
import '../styles/language-selector.css';

export default function LanguageSelector() {
  const { language, setLanguage, languages } = useLanguage();

  return (
    <div className="language-selector">
      <label htmlFor="lang-select" className="sr-only">
        언어 선택
      </label>
      <select
        id="lang-select"
        className="lang-select"
        value={language}
        onChange={(e) => setLanguage(e.target.value as Language)}
        aria-label="Select language"
      >
        {Object.entries(languages).map(([code, name]) => (
          <option key={code} value={code}>
            {name}
          </option>
        ))}
      </select>
    </div>
  );
}
