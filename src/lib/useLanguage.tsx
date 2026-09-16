import { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from 'react';
import { getTranslations, type Language } from './translations';
import { ensureLangFont } from './langFont';
// 📦 곳 이름 번역도 **고른 말 하나만** 받는다 — 왜 그런지는 placeText.ts 머리말에.
import { ensurePlaceTranslations } from './placeText';

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
  // 📦 곳 이름 번역 조각이 도착하면 이 값을 올려 **화면을 다시 그린다.**
  //    안 올리면 조각은 받아 놨는데 화면은 계속 한국어 이름을 보여 준다.
  const [번역받음, set번역받음] = useState(0);

  useEffect(() => {
    setIsClient(true);

    // 🔗 ① **주소에 ?lang= 이 붙어 있으면 그것이 먼저다.**
    //
    // 사장님 (2026-09-14): 인스타 프로필에 korea-street.com 을 걸면서
    // *"링크로 연결함 · 언어 영어로"*.
    //
    // 왜 필요한가 — 아래 ②③ 만으로도 **외국 손님은 제 말로 본다**(그게 기본이고
    // 그대로 둔다). 빠져 있던 것은 **올리는 쪽에서 언어를 못 박는 길**이다:
    //   · 영어로 쓴 인스타 글 → korea-street.com/?lang=en
    //   · 일본어로 쓴 글      → korea-street.com/?lang=ja
    // 폰이 무슨 말로 맞춰져 있든 **그 글을 읽고 누른 사람은 그 말로** 본다.
    // 일본어 글을 보고 들어온 손님의 폰이 영어로 설정돼 있는 일은 흔하다.
    //
    // 🚨 **고른 값(localStorage)보다 앞에 둔다.** 링크에 말이 적혀 있다는 건 보내는
    //    쪽이 일부러 정한 것이라, 뒤로 밀리면 파라미터가 있으나 마나가 된다.
    //    손님이 되돌리는 건 머리줄 드롭다운 한 번이다.
    //
    // 🧹 읽은 뒤 **주소에서 지운다.** 남겨 두면 손님이 그 주소를 친구에게 보낼 때
    //    남의 언어가 따라간다.
    let fromUrl: Language | null = null;
    try {
      const raw = new URLSearchParams(window.location.search).get('lang');
      if (raw) {
        const tag = raw.toLowerCase();
        // 'en-US' · 'zh-tw' 처럼 적어 보내도 알아듣는다.
        // ⚠️ detectLanguage 는 **못 알아들으면 'en'** 을 준다. 오타가 조용히 영어가
        //    되지 않게, 실제로 아는 말을 가리켰을 때만 받는다.
        if (tag in LANGUAGES || tag.split('-')[0] in LANGUAGES || tag.startsWith('zh')) {
          fromUrl = tag in LANGUAGES ? (tag as Language) : detectLanguage([tag]);
        }
        if (fromUrl) {
          const url = new URL(window.location.href);
          url.searchParams.delete('lang');
          window.history.replaceState({}, '', url.toString());
        }
      }
    } catch {
      // 아주 옛 브라우저. 그냥 아래로 내려간다.
    }
    if (fromUrl) {
      setLanguageState(fromUrl);
      try {
        localStorage.setItem('k-street-language', fromUrl);
      } catch {
        /* 저장을 막아 둔 브라우저 — 이번 방문 동안은 맞게 보인다 */
      }
      return;
    }

    // ② 손님이 직접 고른 것, ③ 없으면 브라우저 언어(detectLanguage 주석 참고).
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

  // 🏷️ <html lang> 을 지금 보는 말에 맞춰 준다. 여태 index.html 의 "en" 이
  //    그대로 남아 있었다 — 일본어로 읽고 있어도 브라우저는 영어인 줄 알았다.
  //    두 가지가 걸려 있다:
  //      · 화면 낭독기가 일본어를 영어 발음으로 읽는다
  //      · CSS 가 언어를 못 봐서 word-break 를 갈라 줄 수 없다
  //        (keep-all 은 띄어쓰기가 있는 한국어 전용 — 아래 index.css 주석 참고)
  useEffect(() => {
    document.documentElement.lang = language;
    // 🌏 그 말의 글꼴도 여기서 세운다 — **고른 순간에 그 하나만** 받는다.
    //    DM Sans 에는 가나·한자·타이 문자·키릴 문자가 한 자도 없어서, 그전에는
    //    그 글자들이 폰에 깔린 아무 글꼴로 떨어졌다(두께가 제각각이었다).
    //    자세한 이야기는 src/lib/langFont.ts 머리말에.
    ensureLangFont(language);
    // 📦 그 말의 **곳 이름 번역**도 여기서 받는다. 글꼴과 같은 자리에 두는 이유는,
    //    둘 다 「말이 정해진 순간에 그 하나만」이기 때문이다.
    //    🚨 받아 온 뒤 화면을 다시 그려야 한다 — placeText 는 리액트 바깥에 있어서
    //       값이 채워져도 리액트가 모른다.
    let 살아있나 = true;
    ensurePlaceTranslations(language).then((바뀜) => {
      if (살아있나 && 바뀜) set번역받음((n) => n + 1);
    });
    return () => { 살아있나 = false; };
  }, [language]);

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
  // 번역 조각이 도착했다는 사실을 값에 실어 보낸다 — 이것 때문에 아래 Provider 가
  // 새 값을 내려 주고, 곳 이름을 쓰는 화면들이 다시 그려진다.
  void 번역받음;

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
