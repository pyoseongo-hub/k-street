// 🗺️ **도시별 육각형 지도 배치.**
//
// 동네 화면(DistrictExplorer)이 구·군을 벌집 모양으로 늘어놓을 때 쓰는 자리표다.
// 예전에는 서울 것 하나뿐이었다(seoulHexMap.ts). 도시가 늘면 여기에 한 줄 더 적는다.
//
// `offset` 은 그 행이 왼쪽에서 몇 hex 폭만큼 들여쓰는지다.
//
// ⚠️ **두 도시의 근거가 다르다. 갈라서 읽을 것.**
//   · 서울 — 참고 이미지를 **픽셀 단위로 실측**해 얻은 배치다(2026-08-28).
//   · 부산 — 그런 참고 이미지가 없다. **구청 좌표를 위도(북→남)·경도(서→동)
//            순서로 놓고 손으로 앉혔다**(2026-09-16). 모양이 어색하면 고쳐도 된다 —
//            실측값이 아니므로 「원본을 훼손한다」는 걱정은 안 해도 된다.
import { SEOUL_HEX_ROWS, type SeoulHexRow } from "./seoulHexMap";

export type HexRow = SeoulHexRow;

/**
 * 🌊 **부산 16개 구·군.**
 *
 * 구청 좌표를 위도로 넷으로 나누고, 각 줄 안에서 경도 순으로 놓았다:
 *   · 0행 (35.20°N 위) — 강서 128.98 · 북 128.99 · 동래 129.08 · 금정 129.09 · 기장 129.22
 *   · 1행 (35.15~35.20) — 사상 128.99 · 부산진 129.05 · 연제 129.08 · 해운대 129.16
 *   · 2행 (35.13~35.15) — 동 129.05 · 남 129.08 · 수영 129.11
 *   · 3행 (35.11 아래)  — 사하 128.98 · 서 129.02 · 중 129.03 · 영도 129.07
 *
 * 읽어 보면 맞는다 — 강서가 가장 서쪽, 기장이 북동쪽 끝, 해운대가 동쪽,
 * 영도(섬)가 남쪽 끝이다.
 *
 * 🚨 이름이 **cities.ts 의 부산 units 16곳과 정확히 같아야 한다.**
 *    하나라도 다르면 그 동네가 화면에서 조용히 빠진다 — 아래 검사가 잡는다.
 */
const BUSAN_HEX_ROWS: HexRow[] = [
  { offset: 0.0, gus: ["강서구", "북구", "동래구", "금정구", "기장군"] },
  { offset: 0.5, gus: ["사상구", "부산진구", "연제구", "해운대구"] },
  { offset: 1.0, gus: ["동구", "남구", "수영구"] },
  { offset: 0.5, gus: ["사하구", "서구", "중구", "영도구"] },
];

/**
 * 🗺️ **아래 일곱 도시는 `scripts/make-hex-map.mjs` 가 뽑았다** (2026-10-01).
 *
 * 사장님: *"제주 광주 대구 경주 대전 전주 강원도 순으로 만들어"*
 *
 * 부산은 손으로 앉혔지만(위 주석), 강원 18·경북 22는 손으로 하면 틀린다.
 * 그래서 **조사 자료(survey-*.json)의 곳 좌표를 시·군·구별로 평균**내어
 * 위도로 줄을 나누고 줄 안에서 서→동 순으로 놓았다. 근거가 자료에 남는다.
 *
 * 🚨 **「서구」가 「달서구」를 잡아먹는 함정**이 있었다 — 주소 맞추기를
 *    `includes` 로 하면 "달서구".includes("서구") 가 참이라 **대구 달서구 31곳이
 *    통째로 서구로 갔다.** 긴 이름부터 맞춰 고쳤다. 같은 함정: 경주시/경산시.
 *
 * ⚠️ 실측 배치가 아니므로 **모양이 어색하면 줄을 바꿔도 된다.**
 */
const JEJU_HEX_ROWS: HexRow[] = [
  { offset: 0.0, gus: ["서귀포시", "제주시"] },
];

const GWANGJU_HEX_ROWS: HexRow[] = [
  { offset: 0.0, gus: ["광산구", "서구", "북구"] },
  { offset: 0.5, gus: ["남구", "동구"] },
];

const DAEGU_HEX_ROWS: HexRow[] = [
  { offset: 0.0, gus: ["북구", "군위군", "동구"] },
  { offset: 0.5, gus: ["서구", "중구", "수성구"] },
  { offset: 0.0, gus: ["달성군", "달서구", "남구"] },
];

const DAEJEON_HEX_ROWS: HexRow[] = [
  { offset: 0.0, gus: ["유성구", "대덕구", "동구"] },
  { offset: 0.5, gus: ["중구", "서구"] },
];

/** 🏯 경주시가 여기 있다 — 경주는 광역시가 아니라 **경북의 시**다. */
const GYEONGBUK_HEX_ROWS: HexRow[] = [
  { offset: 0.0, gus: ["영주시", "봉화군", "영양군", "울진군", "울릉군"] },
  { offset: 0.5, gus: ["문경시", "예천군", "의성군", "안동시", "영덕군"] },
  { offset: 0.0, gus: ["상주시", "김천시", "구미시", "칠곡군", "포항시"] },
  { offset: 0.5, gus: ["성주군", "청송군", "경산시", "영천시", "경주시"] },
  { offset: 0.0, gus: ["고령군", "청도군"] },
];

/** 🍚 전주시가 여기 있다 — 전주도 광역시가 아니라 **전북의 시**다. */
const JEONBUK_HEX_ROWS: HexRow[] = [
  { offset: 0.0, gus: ["군산시", "익산시", "전주시", "진안군"] },
  { offset: 0.5, gus: ["부안군", "김제시", "완주군", "장수군"] },
  { offset: 0.0, gus: ["고창군", "정읍시", "순창군", "임실군"] },
  { offset: 0.5, gus: ["무주군", "남원시"] },
];

const GANGWON_HEX_ROWS: HexRow[] = [
  { offset: 0.0, gus: ["철원군", "화천군", "양구군", "고성군", "속초시"] },
  { offset: 0.5, gus: ["춘천시", "홍천군", "인제군", "양양군", "강릉시"] },
  { offset: 0.0, gus: ["원주시", "횡성군", "영월군", "평창군", "정선군"] },
  { offset: 0.5, gus: ["동해시", "태백시", "삼척시"] },
];

export const HEX_ROWS_BY_CITY: Record<string, HexRow[]> = {
  seoul: SEOUL_HEX_ROWS,
  busan: BUSAN_HEX_ROWS,
  jeju: JEJU_HEX_ROWS,
  gwangju: GWANGJU_HEX_ROWS,
  daegu: DAEGU_HEX_ROWS,
  daejeon: DAEJEON_HEX_ROWS,
  gyeongbuk: GYEONGBUK_HEX_ROWS,
  jeonbuk: JEONBUK_HEX_ROWS,
  gangwon: GANGWON_HEX_ROWS,
};

/** 그 도시의 배치. 없으면 빈 배열 — **서울 것을 대신 보여 주지 않는다.**
 *  남의 도시 지도를 보여 주는 것보다 안 보여 주는 쪽이 낫다. */
export function hexRowsOf(cityKey: string): HexRow[] {
  return HEX_ROWS_BY_CITY[cityKey] ?? [];
}
