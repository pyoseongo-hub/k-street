/**
 * 🗓️ **이름에 지난 연도가 박힌 행사**를 가려낸다.
 *
 * 왜 (2026-09-10) — 다른 AI 에게 두 앱을 평가시켰더니 이걸 짚었다:
 * 「현재 화면에 2025년에 열린 행사가 남아 있다」. 재 보니 **사실이었다.**
 *
 *   · 이름에 2025 가 박힌 곳 **11곳**이 그대로 살아 있었다
 *   · 그리고 「Seoul Festivals in October **2026**」 이라는 제목의 묶음 페이지가
 *     「**2025** Seoul Hanok Week」 를 목록에 올리고 있었다 — **한 화면 안에서
 *     2026 과 2025 가 부딪힌다.**
 *
 * 이 자료는 관광공사 원본(tour-places-raw.json)에서 온 것이고, 제목이 곧
 * **그 해 회차의 이름**이다. 우리가 아는 사실은 여기까지다:
 *   ✅ 2025년에 그 달에 열렸다        ❌ 2026년에도 열리는지는 모른다
 *
 * 그래서 **지우지도, 올해 것처럼 보여 주지도 않는다.**
 * 아는 것만 말한다 — 「2025년 회차 기록이다. 올해도 열리는지는 공식 안내를 보라」.
 * (빈 칸이 틀린 정보보다 낫다 — 이 저장소의 제1원칙.)
 *
 * 🚨 **앱과 정적 페이지가 이 함수 하나를 같이 쓴다.** 잣대가 둘이면 한쪽만
 *    고쳐 놓고 다른 쪽이 옛 모습으로 남는다 — 이 저장소가 여러 번 데인 자리다.
 */

/** 이름 안의 4자리 연도. 없으면 undefined. */
export function editionYear(name: string): number | undefined {
  // 「2025 서울한옥위크」 · 「Entertech Seoul 2025」 둘 다 잡는다.
  // ⚠️ 아무 네 자리 숫자나 잡으면 안 된다 — 「1948」 같은 설명 속 숫자가 아니라
  //    **연도로 읽히는 범위**만 본다.
  const m = name.match(/\b(19[89]\d|20[0-4]\d)\b/);
  return m ? Number(m[1]) : undefined;
}

/**
 * 지난 회차인가 — 이름의 연도가 **올해보다 앞이면** 그렇다.
 *
 * 올해(또는 내년) 연도가 박힌 것은 그대로 둔다. 그건 최신 정보다.
 */
export function isPastEdition(name: string, now: Date = new Date()): boolean {
  const y = editionYear(name);
  return y !== undefined && y < now.getFullYear();
}

/** 「2025」 — 화면에 그대로 보여 줄 연도. 지난 회차가 아니면 undefined. */
export function pastEditionYear(name: string, now: Date = new Date()): number | undefined {
  const y = editionYear(name);
  return y !== undefined && y < now.getFullYear() ? y : undefined;
}
