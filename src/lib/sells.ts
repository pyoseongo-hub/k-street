// 🏪 **이 시장은 무엇을 파나** — 화면에 보여 줄 글자를 만든다.
//
// 사장님 지시 (2026-09-12):
//   "방산 시장 동대문 시장처럼 먹거리나 그런 것이 아닌 **특성화된 장소**도 있으니
//    시장 자료 올려줘야 해"
//
// 그전까지 우리 목록은 이랬다 — 외국인이 아는 것이 **아무것도 없다**:
//     방산 종합시장   시장 · 중구 · 을지로4가역 2호선 · 252m
// 이제 이렇게 된다:
//     방산 종합시장   Printing · Paper products — 시장 · 중구 · 을지로4가역 · 252m
//
// 자료는 두 파일에서 온다:
//   · place-intro.json  곳마다 판매품목 한 줄 (한국관광공사 detailIntro)
//   · sells-words.json  그 낱말들의 12개 언어 (구글 번역 + 사람이 또렷하게 고친 말)
//
// 🚨 **낱말 하나라도 번역이 없으면 한국어를 그대로 쓴다.** 빼지 않는다 —
//    「원단」이 빠진 「액세서리 부자재」는 그 시장을 **잘못 소개하는 것**이 된다.
//    모르는 낱말이 섞여 있어도 손님은 나머지로 짐작할 수 있다.

import INTRO from "../data/place-intro.json";
import WORDS from "../data/sells-words.json";

interface Intro {
  sells?: string;
  hours?: string;
  closed?: string;
  fee?: string;
  tel?: string;
  tourName?: string;
  type?: string;
}

const 곳 = (INTRO as { 곳?: Record<string, Intro> })["곳"] ?? {};
/**
 * ⚠️ **`나온횟수`(수) 가 같이 들어 있어 Record<string,string> 이 아니다.**
 *    그 숫자는 사람이 훑어볼 때 「이 낱말이 몇 곳에 나오나」를 보려고 넣은 것이다.
 *    여기서는 언어 열쇠만 쓰므로 값이 글자일 때만 받는다.
 */
const 낱말 = (WORDS as unknown as { 낱말?: Record<string, Record<string, string | number>> })["낱말"] ?? {};

/** 그 언어의 번역. 없거나 숫자면 undefined. */
function word(w: string, lang: string): string | undefined {
  const v = 낱말[w]?.[lang];
  return typeof v === "string" && v ? v : undefined;
}

/** 그 곳의 속사정(판매품목·영업시간…). 없으면 undefined. */
export function introFor(id: string): Intro | undefined {
  return 곳[id];
}

/**
 * 판매품목 한 줄을 낱말로 쪼갠다.
 *
 * 🐞 **가운뎃점(·)으로는 쪼개지 않는다.** 쪼갰더니 「농·수·축산물」이 셋으로
 *    갈라져 낱말 표에 「농 → Farm」·「수 → number」가 들어갔다(2026-09-12).
 *    ⚠️ **번역 스크립트(scripts/translate-sells.mjs)와 같은 규칙이어야 한다** —
 *       쪼개는 법이 둘로 갈리면 여기서 만든 낱말이 표에 없어서 번역이 통째로 빠진다.
 */
function split(s: string): string[] {
  return s
    .split(/[/,]/)
    .map((t) => t.trim().replace(/\s*등$/, "").trim())
    .filter(Boolean);
}

/**
 * 「Printing · Paper products」 — 그 언어로. 없으면 빈 문자열.
 *
 * @param max 몇 낱말까지 보여 줄까. 목록 줄은 짧아야 하고 곳 페이지는 넉넉해도 된다.
 *            「원단·의류부자재 / 액세서리 부자재 / 혼수용품 및 홈인테리어」처럼
 *            긴 것이 있어서, 목록에서는 줄여야 한 줄에 들어간다.
 */
export function sellsFor(id: string, lang: string, max = 99): string {
  const raw = 곳[id]?.sells;
  if (!raw) return "";
  const words = split(raw).slice(0, max);
  if (!words.length) return "";
  // 한국어 화면에는 원문 그대로. 번역을 거칠 이유가 없다.
  if (lang === "ko") return words.join(" · ");
  return words.map((w) => word(w, lang) ?? word(w, "en") ?? w).join(" · ");
}

/** 판매품목을 아는 곳이 몇 곳인가 — 감사·보고용. */
export function sellsCount(): number {
  return Object.values(곳).filter((v) => v.sells).length;
}
