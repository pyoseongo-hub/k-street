// 🌸🍁 **이 계절의 길** — 봄 꽃길 · 가을 단풍길.
//
// 사장님 (2026-09-14): *"테마로 빼서 강추 — 봄 꽃길, 가을 단풍길 추천.
// 이게 있으면 좋겠는데."*
//
// ── 왜 '테마로 빼는' 것이 옳았나 ────────────────────────────────────────
// 단풍길 110곳을 장소 칸(walk)에 넣으려다 막혔다. ALL_PLACES 끝에
// `.filter(hasPhoto)` 가 걸려 있어서 **사진 없는 곳은 화면에 아예 안 나온다**
// (2026-09-01에 "사진 없으면 빈 상자가 남는다"고 건 게이트다).
// 110곳 중 **109곳이 사진이 없다** — 그대로 넣으면 1곳만 보인다.
//
// 테마 띠는 축제 카드처럼 사진 없이도 그려진다. 그래서 **빼는 것이 곧 푸는 것**이었다.
// 게이트를 뚫는 대신 게이트가 없는 자리로 옮긴 셈이다.
//
// ── 두 자료가 출처가 다르다 ─────────────────────────────────────────────
//  · 🍁 가을 — **서울시 「서울 단풍길」** 110곳. 수종·길이·설명까지 붙어 있다.
//             (scripts/fetch-autumn-roads.mjs, 공공저작물 · 출처표시)
//  · 🌸 봄  — **앱이 직접 조사한 꽃길** 30곳(seed.ts의 flower 칸).
//             서울시에 단풍길 같은 공식 봄꽃길 목록이 있는지 네 주소를 두드려 봤는데
//             전부 404였다(2026-09-14). **없는 게 아니라 못 찾은 것**이라 —
//             나중에 찾으면 가을과 같은 모양으로 갈아 끼우면 된다.
//
// 출처가 다르니 **가진 칸도 다르다.** 단풍길에는 수종·길이가 있고 꽃길에는 없다.
// 지어내지 않고 **없는 칸은 비운다** — 화면이 있을 때만 보여준다.

import autumn from "./autumn-roads.json";
// 🚨 사진 있는 것(ALL_PLACES)과 **사진 없어 가려진 것(HIDDEN_NO_PHOTO)을 함께** 쓴다.
//    꽃길 30곳 중에도 사진 없는 곳이 있는데, 여기서는 사진이 필요 없다.
//    ALL_PLACES 만 쓰면 "가을은 110곳인데 봄은 몇 곳뿐"인 이상한 짝이 된다.
import { ALL_PLACES, HIDDEN_NO_PHOTO } from "./seed";

export type RoadSeason = "spring" | "autumn";

export interface SeasonRoad {
  key: string;
  season: RoadSeason;
  gu: string;
  /** 길 이름. 한국어 원문 — 손님이 택시에서 그대로 말할 수 있어야 한다. */
  name: string;
  /** 나무 종류. 단풍길에만 있다. */
  species?: string;
  /** "1.2km". 단풍길에만 있다. */
  length?: string;
  /** 서울시가 붙인 한 줄 설명. 단풍길에만 있다. */
  note?: string;
}

interface AutumnRow {
  번호: number;
  구: string;
  이름: string;
  수종: string | null;
  길이: string | null;
  설명: string | null;
}

/**
 * 🍁 가을 단풍길.
 *
 * ⚠️ **과천 3곳은 뺀다.** 서울대공원(낙엽의거리·동물원 둘레길·호숫가 둘레길)은
 *    서울시가 운영하지만 자리는 경기도 과천이다. 이 앱은 서울 25개 구를 뼈대로
 *    삼으므로 넣을 칸이 없다 — 구 이름이 '과천'인 채로 들어가면 구별 화면이 깨진다.
 *    자료(autumn-roads.json)에는 그대로 남아 있으니 나중에 살릴 수 있다.
 */
const AUTUMN: SeasonRoad[] = (autumn.길 as AutumnRow[])
  .filter((r) => r.구.endsWith("구"))
  .map((r) => ({
    key: `autumn-${r.번호}`,
    season: "autumn" as const,
    gu: r.구,
    name: r.이름,
    species: r.수종 ?? undefined,
    length: r.길이 ?? undefined,
    note: r.설명 ?? undefined,
  }));

/** 🌸 봄 꽃길 — seed.ts 의 flower 칸을 그대로 쓴다. */
const SPRING: SeasonRoad[] = [...ALL_PLACES, ...HIDDEN_NO_PHOTO]
  .filter((p) => p.category === "flower")
  .map((p) => ({
    key: `spring-${p.id}`,
    season: "spring" as const,
    gu: p.gu,
    name: p.name,
    note: p.note,
  }));

export const SEASON_ROADS: Record<RoadSeason, SeasonRoad[]> = {
  spring: SPRING,
  autumn: AUTUMN,
};

/** 그 계절에 보여줄 길. 여름·겨울은 없다(빈 배열) — 없는 걸 지어내지 않는다. */
export function roadsForSeason(season: string): SeasonRoad[] {
  return season === "spring" || season === "autumn" ? SEASON_ROADS[season] : [];
}

/** 출처 표기. 공공저작물이라 **출처를 밝히는 것이 쓰는 조건**이다. */
export const ROAD_SOURCE: Record<RoadSeason, string> = {
  autumn: "서울특별시 「서울 단풍길」",
  spring: "K-Street 조사",
};
