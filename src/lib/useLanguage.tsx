import { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from 'react';
import { getTranslations, type Language } from './translations';

export type { Language };

const LANGUAGES: Record<Language, string> = {
  'ko': '한국어',
  'en': 'English',
  'ja': '日本語',
  'zh': '简体中文',
  'zh-TW': '繁體中文',
  'vi': 'Tiếng Việt',
  'es': 'Español',
  'fr': 'Français',
  'de': 'Deutsch',
  'ru': 'Русский',
  'id': 'Bahasa Indonesia',
  'th': 'ไทย',
};

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  languages: Record<Language, string>;
  getLanguageName: (lang: Language) => string;
  getCurrentLanguageName: () => string;
  isClient: boolean;
  t: ReturnType<typeof getTranslations>;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

/**
 * 🌐 처음 온 손님에게 무슨 말로 보여 줄까.
 *
 * 이 앱은 **외국인 관광객**을 보고 만든 것인데, 예전에는 처음 화면이 무조건
 * 한국어였다(2026-09-04 출시 전 검수에서 찾았다). 일본에서 온 손님이 첫 화면에서
 * 읽을 수 있는 글자가 하나도 없고, 위쪽 작은 드롭다운을 스스로 찾아내야 했다.
 * 못 찾으면 그냥 닫는다 — 앱을 아무리 채워도 거기서 끝난다.
 *
 * 그래서 **브라우저에 설정된 언어**를 본다. 손님이 폰을 어느 말로 쓰는지가
 * 우리가 가진 가장 확실한 단서다(추측이 아니라 손님이 직접 설정해 둔 값이다).
 *
 * 못 알아들으면 **영어**로 간다 — 한국어가 아니다. 여기까지 온 사람은
 * 우리가 지원하지 않는 말을 쓰는 외국인일 가능성이 크고, 그 경우 한국어보다
 * 영어가 읽힐 확률이 훨씬 높다.
 *
 * ⚠️ 손님이 직접 고른 값(localStorage)이 언제나 이긴다 — 한 번 골랐으면
 *    브라우저 설정이 뭐든 그대로 둔다.
 */
export function detectLanguage(prefs: readonly string[]): Language {
  for (const raw of prefs) {
    const tag = raw.toLowerCase();
    // 중국어는 간체·번체가 갈린다. 대만·홍콩·마카오와 Hant 표기는 번체로 본다.
    if (tag.startsWith('zh')) {
      return /hant|tw|hk|mo/.test(tag) ? 'zh-TW' : 'zh';
    }
    // 'en-US' → 'en' 처럼 앞 두 글자만 본다.
    const base = tag.split('-')[0];
    if (base in LANGUAGES) return base as Language;
  }
  return 'en';
}

// 언어 상태를 컴포넌트마다 따로(useState) 들고 있으면, 드롭다운을 바꿔도
// 그 컴포넌트만 갱신되고 나머지는 새로고침 전까지 예전 언어로 남는다
// (localStorage는 마운트 시 한 번만 읽으니까). 그래서 하나의 Provider가
// 상태를 들고, 모든 useLanguage() 호출은 그 하나를 공유한다.
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('ko');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // 손님이 직접 고른 것이 먼저, 없으면 브라우저 언어(detectLanguage 주석 참고).
    let stored: Language | null = null;
    try {
      stored = localStorage.getItem('k-street-language') as Language | null;
    } catch {
      // 사파리 비공개 모드처럼 저장소를 막아 둔 경우 — 그냥 감지 쪽으로 간다.
    }
    if (stored && stored in LANGUAGES) {
      setLanguageState(stored);
      return;
    }
    const prefs = navigator.languages?.length ? navigator.languages : [navigator.language];
    setLanguageState(detectLanguage(prefs.filter(Boolean)));
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('k-street-language', lang);
    } catch {
      // 저장을 막아 둔 브라우저에서도 이번 방문 동안은 바뀐 말로 보인다.
    }
  };

  const getLanguageName = (lang: Language) => LANGUAGES[lang];
  const getCurrentLanguageName = () => LANGUAGES[language];
  const t = useMemo(() => getTranslations(language), [language]);

  const value: LanguageContextValue = {
    language,
    setLanguage,
    languages: LANGUAGES,
    getLanguageName,
    getCurrentLanguageName,
    isClient,
    t,
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage() must be used within a <LanguageProvider>');
  return ctx;
}
