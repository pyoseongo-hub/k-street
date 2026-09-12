import { useLanguage, type Language } from '../lib/useLanguage';
import '../styles/language-selector.css';

/* 🌐 **좁은 폰에서는 이 그림만 보인다.**
 * 머리줄에 ☂️ 를 들이면서 단추가 셋이 되어, 언어 칸이 **40px** 줄었다
 * (재 봤다: 320px 에서 57 → 17px — 「한국어」가 아예 사라졌다).
 * 12개 언어 앱에서 언어 단추는 **한국어를 못 읽는 손님이 가장 먼저 찾는 것**이라
 * 그대로 둘 수 없었다.
 * ⚠️ `<select>` 는 **지우지 않고 위에 투명하게 덮는다**(index.css) —
 *    고르는 기능·aria-label·키보드가 그대로 살아 있어야 한다.
 *    그림만 남기고 알맹이를 바꾸면 화면을 읽어 주는 손님이 잃는다. */

export default function LanguageSelector() {
  const { language, setLanguage, languages } = useLanguage();

  return (
    <div className="language-selector">
      <span className="lang-globe" aria-hidden="true">🌐</span>
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
