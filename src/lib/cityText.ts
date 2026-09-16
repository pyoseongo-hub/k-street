// 🏙️ **문구 안의 도시 이름을 지금 보는 도시로 바꾼다.**
//
// 왜 (2026-09-17) — 부산을 열려고 보니 앱 문구에 **「서울」이 그대로 박혀 있었다.**
// 부산을 고른 손님에게 「동네마다 다른 **서울**」이라고 말하게 된다. 오류는 안 뜨고,
// 그 말을 읽는 손님만 이상하게 여긴다 — 이 저장소에서 여러 번 본 그 종류다.
//
// 그래서 문구에는 자리만 비워 두고(`{city}`), 값은 여기서 채운다.
//
// ── 두 가지 자리가 있는 이유 ──────────────────────────────────────────────
//   `{city}`   기본꼴 — 「동네마다 다른 **부산**」
//   `{cityOf}` 「…의」 — 러시아어는 격에 따라 꼴이 바뀐다:
//              «Вы за пределами **Сеула**» (생격). 여기에 기본꼴을 넣으면 문법이 깨진다.
//   다른 언어는 꼴이 하나뿐이라 둘 다 같은 값이 온다.
//
// 🚨 꼴은 지어내지 않았다 — 이미 번역해 둔 곳 이름에서 실제로 쓰인 것을 세어 뽑았다
//    (cities.ts 의 `names`·`ruForms` 머리말 참고).
import { cityName } from "../data/cities";
import { useCity } from "./useCity";
import { useLanguage } from "./useLanguage";

/**
 * 문구에 지금 도시 이름을 채워 준다.
 *
 * ```tsx
 * const withCity = useCityText();
 * <h2>{withCity(t.exploreTitle)}</h2>   // 「동네마다 다른 부산」
 * ```
 */
export function useCityText(): (text: string) => string {
  const { city } = useCity();
  const { language } = useLanguage();
  return (text: string) =>
    text
      .replace(/\{cityOf\}/g, cityName(city, language, "of"))
      .replace(/\{city\}/g, cityName(city, language));
}
