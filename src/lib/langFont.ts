// 🌏 **손님이 고른 말의 글꼴을, 그 말을 골랐을 때만 받는다.**
//
// 사장님 (2026-09-15): *"전체적으로 텍스트 잘 보이게 두꺼운 글씨체, 외국어 포함 교체"*
//
// ─────────────────────────────────────────────────────────────────────────
// 무엇이 문제였나
// ─────────────────────────────────────────────────────────────────────────
//   본문 글꼴이 `"DM Sans", -apple-system, …` 뿐이었다. 그런데 **DM Sans 에는
//   한글도 가나도 한자도 타이 문자도 키릴 문자도 한 자가 없다.** 그래서 12개 언어
//   중 다섯(ja·zh·zh-TW·th·ru)은 **폰에 깔린 아무 글꼴**로 그려졌다.
//   폰마다 다르고 대개 얇다. 우리가 두께를 정한 적이 없는 글자였다.
//
// ─────────────────────────────────────────────────────────────────────────
// 왜 index.html 에 다 넣지 않나 — **한국어·영어 손님에게 짐을 지우지 않는다**
// ─────────────────────────────────────────────────────────────────────────
//   중국어·일본어 글꼴은 글자가 수만 자라 통째로는 무겁다. 구글이 잘게 쪼개
//   보내 주긴 하지만(unicode-range), **안 쓰는 언어의 스타일시트를 받는 것부터가
//   낭비**다. 이 앱의 초심은 「적은 비용으로 오래」다.
//   그래서 **고른 순간에 그 하나만** 받는다. 한국어·영어는 한 바이트도 더 안 받는다.
//
// 🚨 **구글이 막힌 곳이 있다**(중국). 그래서 index.html 과 같은 방식을 쓴다 —
//    `media="print"` 로 걸어 화면 그리기를 막지 않고, 다 받아지면 적용한다.
//    글꼴이 영영 안 와도 화면은 대체 글꼴로 멀쩡히 읽힌다.
//
// 🚨 **같은 글꼴을 두 번 받지 않는다.** 언어를 오갈 때마다 <link> 가 쌓이면
//    머리가 지저분해지고 요청도 는다. 이미 넣은 것은 id 로 알아본다.

/** 언어별로 세울 글꼴. **없는 언어는 여기 없다** — DM Sans 로 충분한 말들이다. */
const FONTS: Partial<Record<string, { family: string; query: string }>> = {
  // 굵기는 **500·700 두 가지만** 받는다. 본문이 500, 굵은 글씨가 700 이다(index.css).
  // 더 받으면 그만큼 느려지고, 그 사이 굵기는 브라우저가 알아서 흉내 낸다.
  ja: { family: "Noto Sans JP", query: "Noto+Sans+JP:wght@500;700" },
  zh: { family: "Noto Sans SC", query: "Noto+Sans+SC:wght@500;700" },
  "zh-TW": { family: "Noto Sans TC", query: "Noto+Sans+TC:wght@500;700" },
  th: { family: "Noto Sans Thai", query: "Noto+Sans+Thai:wght@500;700" },
  // 러시아어는 키릴 문자다. DM Sans 에 키릴이 없어서 여기서 세운다.
  ru: { family: "Noto Sans", query: "Noto+Sans:wght@500;700" },
  // 베트남어는 라틴 문자에 성조 부호가 붙은 것이라 DM Sans 가 그대로 그린다 —
  // 굳이 더 받지 않는다. (구글이 vietnamese 부분집합을 같이 보내 준다.)
};

/** 이미 받아 둔 글꼴 — 같은 것을 두 번 넣지 않는다. */
const 넣은것 = new Set<string>();

/**
 * 그 말에 필요한 글꼴을 세운다. 필요 없으면 기본값으로 되돌린다.
 *
 * @param lang 손님이 고른 말 ('ja' · 'zh-TW' …)
 */
export function ensureLangFont(lang: string): void {
  if (typeof document === "undefined") return; // 곳 페이지를 만들 때(서버)는 할 일이 없다

  const spec = FONTS[lang];
  const root = document.documentElement;

  if (!spec) {
    // 🇰🇷🇬🇧 한국어·영어·유럽어 — 이미 있는 글꼴로 충분하다. 기본값으로 되돌린다.
    //    (되돌리지 않으면 일본어를 봤다가 영어로 온 손님이 계속 일본어 글꼴을 쓴다.)
    root.style.removeProperty("--font-lang");
    return;
  }

  root.style.setProperty("--font-lang", `"${spec.family}"`);
  if (넣은것.has(lang)) return;
  넣은것.add(lang);

  try {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${spec.query}&display=swap`;
    // 🚨 화면 그리기를 막지 않는다 — index.html 이 쓰는 그 방법이다.
    //    구글이 느리거나 막힌 곳(중국)에서도 첫 화면이 제때 뜬다.
    link.media = "print";
    link.onload = () => {
      link.media = "all";
    };
    document.head.appendChild(link);
  } catch {
    // 아주 드물게 막힌 브라우저. 대체 글꼴로 읽히고 화면은 안 깨진다 — 여기서 멈추지 않는다.
  }
}
