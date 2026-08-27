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

// 언어 상태를 컴포넌트마다 따로(useState) 들고 있으면, 드롭다운을 바꿔도
// 그 컴포넌트만 갱신되고 나머지는 새로고침 전까지 예전 언어로 남는다
// (localStorage는 마운트 시 한 번만 읽으니까). 그래서 하나의 Provider가
// 상태를 들고, 모든 useLanguage() 호출은 그 하나를 공유한다.
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('ko');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const stored = localStorage.getItem('k-street-language') as Language | null;
    if (stored && stored in LANGUAGES) {
      setLanguageState(stored);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('k-street-language', lang);
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
