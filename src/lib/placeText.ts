// 장소·축제의 **내용**(이름·설명·기간 문구)을 그 언어로 보여준다.
//
// 화면의 틀(버튼·안내문)은 translations.ts가 손으로 써 둔 12개 언어를 쓰고,
// 그 안에 담기는 내용은 이 파일이 place-translations.json을 본다
// (scripts/translate-places.mjs가 구글 번역으로 채운다).
//
// 규칙 두 가지 —
//
// ① **번역이 없으면 영어로, 영어도 없으면 한국어로.** 화면이 깨지지 않는다
//    (Kfood에서 쓰는 것과 같은 방식).
//
// ② 🚨 **이름은 번역만 보여주지 않고 한국어 원문을 함께 보여준다.**
//    기계 번역이라 이름이 어색하거나 틀릴 수 있는데, 손님이 길에서 정말 필요한 건
//    "택시 기사에게 보여줄 한국어"다. Kfood의 원칙과 같다 — 손님이 그 이름 그대로
//    말할 수 있어야 한다. 그래서 번역이 이상해도 한국어가 옆에 있으면 길은 찾는다.
//    (한국어 화면에서는 당연히 원문만 보여준다.)

import table from "../data/place-translations.json";

const TABLE = table as Record<string, Record<string, string>>;

/** 그 언어의 번역. 없으면 영어, 영어도 없으면 한국어 원문 그대로. */
export function translateText(ko: string, language: string): string {
  if (language === "ko") return ko;
  return TABLE[language]?.[ko] ?? TABLE.en?.[ko] ?? ko;
}

/** 번역이 실제로 있는지(원문과 다른 값이 있는지). 기간 문구를 쓸지 말지 고르는 데 쓴다. */
export function hasTranslation(ko: string, language: string): boolean {
  if (language === "ko") return true;
  const t = TABLE[language]?.[ko] ?? TABLE.en?.[ko];
  return Boolean(t && t !== ko);
}

/**
 * 이름을 어떻게 보여줄지. main은 크게, sub는 그 아래 작게.
 * 한국어 화면이거나 번역이 없으면 sub가 없다 — 같은 말을 두 번 적지 않는다.
 */
export function placeName(ko: string, language: string): { main: string; sub?: string } {
  if (language === "ko") return { main: ko };
  const t = TABLE[language]?.[ko] ?? TABLE.en?.[ko];
  return t && t !== ko ? { main: t, sub: ko } : { main: ko };
}
