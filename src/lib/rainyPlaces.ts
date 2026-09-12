// 🌧️ **비 와도 괜찮은 곳 고르기** — 앱과 묶음 페이지가 **같은 함수를 쓴다.**
//
// 사장님 (2026-09-12): "항시 보이게 비행기 옆에 두고, 예보 있으면 단추 키우거나
//                     자리 만들어서 더 잘 보이게 해"
//
// 🚨 **잣대를 여기 한 곳에만 둔다.** 묶음 페이지(scripts/build-place-pages.ts)와
//    앱이 각자 골라내면 **같은 주소를 보고 온 손님이 다른 목록을 본다.**
//    이 저장소는 그 사고를 이미 겪었다 — 등급 판정과 화면이 잣대를 따로 쓰다가
//    「반쪽 적용」이 생겼다(CLAUDE.md: "잣대가 둘이면 반쪽 적용이 생긴다").
//
// 그래서 실제 판단은 전부 src/lib/indoor.ts 가 한다. 이 파일이 하는 일은
// **역 자료를 붙여 줄 세우고 두 묶음으로 가르는 것**뿐이다.

import { ALL_PLACES, type Place } from "../data/seed";
import { isArcade, isIndoor, isRainOk, rainWalkMax } from "./indoor";
import { nearestStation } from "./nearestStation";

export interface RainyRow {
  place: Place;
  station: string;
  /** 역까지 **직선거리**(m). 실제 걷는 길은 이보다 길다 — 화면에 그대로 적는다. */
  dist: number;
}

export interface RainyList {
  /** 🏢 건물 안 — 비를 아예 안 맞는 곳 */
  indoors: RainyRow[];
  /** 🏮 중앙 통로에 지붕이 있는 시장 — **안내 문구와 한 세트로만** 보여 준다 */
  arcades: RainyRow[];
  /** 두 묶음을 합친 수. 단추에 적는 숫자다. */
  total: number;
  /** 몇 개 구에 걸쳐 있나 */
  gus: number;
}

/**
 * 비 오는 날 목록. 가까운 역이 **있고** 잣대 안에 드는 곳만.
 *
 * 🚨 **역을 모르는 곳은 안 넣는다.** 「역이 먼지 모른다」와 「역이 가깝다」는
 *    다른 말이다. 모르는 것을 가까운 쪽으로 반올림하면 손님이 젖는다.
 *
 * 📌 자료가 안 바뀌면 결과도 안 바뀌므로 **한 번만 세고 들고 있는다**(아래 caching).
 *    목록이 100곳을 넘어서 그릴 때마다 다시 세면 화면이 버벅인다.
 */
let cached: RainyList | null = null;

export function rainyPlaces(): RainyList {
  if (cached) return cached;

  const rows: RainyRow[] = [];
  for (const place of ALL_PLACES) {
    if (!isRainOk(place)) continue;
    const s = nearestStation(place.id, place);
    if (!s?.station || s.dist == null) continue;
    if (s.dist > rainWalkMax(place)) continue;
    rows.push({ place, station: s.station, dist: s.dist });
  }
  // 가까운 순. 비 오는 날에 손님이 보는 것은 이름이 아니라 **얼마나 걷느냐**다.
  rows.sort((a, b) => a.dist - b.dist);

  // 🏢/🏮 을 **갈라서** 담는다. 섞으면 「중앙 통로만 덮였다」는 안내문구를
  //    붙일 데가 없고, 손님은 박물관과 시장을 같은 정도로 마른 곳이라 읽는다.
  const indoors = rows.filter((r) => isIndoor(r.place));
  const arcades = rows.filter((r) => isArcade(r.place) && !isIndoor(r.place));

  cached = {
    indoors,
    arcades,
    total: indoors.length + arcades.length,
    gus: new Set(rows.map((r) => r.place.gu)).size,
  };
  return cached;
}
