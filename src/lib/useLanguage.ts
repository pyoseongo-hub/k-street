import { useState, useEffect } from 'react';

export type Language = 'ko' | 'en' | 'ja' | 'zh' | 'zh-TW' | 'vi' | 'es' | 'fr' | 'de' | 'ru' | 'id' | 'th';

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

export function useLanguage() {
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

  return {
    language,
    setLanguage,
    languages: LANGUAGES,
    getLanguageName,
    getCurrentLanguageName,
    isClient,
  };
}
