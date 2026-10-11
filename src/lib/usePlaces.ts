import { useMemo } from "react";
import { ALL_PLACES, ALL_FESTIVALS, type Place } from "../data/seed";
import { useCity } from "./useCity";
import { neighborsOf } from "../data/neighborCities";

// 🏙️ **지금 보고 있는 도시의 곳만 고른다.**
//
// ── 왜 따로 두나 ──────────────────────────────────────────────────────────
//   ALL_PLACES 는 **출시 범위 안의 모든 도시**를 담는다(launchScope 가 거른 뒤).
//   도시가 하나일 때는 그게 곧 그 도시였지만, 부산을 여는 순간 **서울 화면에
//   부산 곳이 섞인다.** 동네 목록·지도·계절 사진이 전부 그렇다.
//   화면은 안 깨지고 곳 수만 늘어나서, 열어 봐도 티가 잘 안 난다 — 그게 위험하다.
//
// 🚨 **city 가 비어 있으면 서울로 친다.** 서울 자료(seed.ts·tourPlaces.ts)는
//    city 칸이 없다 — 있던 자료를 전부 고치는 것보다, 없으면 서울이라고
//    한 곳에서 정하는 쪽이 안전하다(Place.city 주석과 같은 약속).
export const cityOf = (p: Place): string => p.city ?? "seoul";

/** React 밖에서도 쓸 수 있는 쪽 (곳 페이지를 만드는 스크립트 등). */
export function placesInCity(cityKey: string, list: readonly Place[] = ALL_PLACES): Place[] {
  return list.filter((p) => cityOf(p) === cityKey);
}

/** 화면에서 쓰는 쪽. */
export function usePlacesHere(): Place[] {
  const { cityKey } = useCity();
  return useMemo(() => placesInCity(cityKey), [cityKey]);
}

/**
 * 🎪 **축제도 도시로 가른다.**
 *
 * 🐞 2026-09-17에 여기서 걸렸다 — 부산을 열고 도시 카드에서 부산을 눌러도
 *    **첫 화면(계절)이 그대로 서울 축제**를 보여 줬다. 도시는 제대로 바뀌었는데,
 *    그 화면만 `ALL_FESTIVALS` 를 곧바로 읽고 있었던 것이다.
 *    곳 목록·지도·계절 사진은 이미 도시를 보는데 **축제만 빠져 있었다.**
 *    화면은 멀쩡해 보이고 오류도 없다 — 브라우저로 눌러 보지 않았으면 못 찾았다.
 *
 * ⚠️ 축제 목록은 곳 목록과 **다르다**(사진 게이트가 없어 더 많다 — seed.ts 참고).
 *    그래서 `placesInCity` 를 그냥 쓰지 않고 이 함수를 따로 둔다.
 */
export function useFestivalsHere(): Place[] {
  const { cityKey } = useCity();
  return useMemo(() => placesInCity(cityKey, ALL_FESTIVALS), [cityKey]);
}

/**
 * 🚗 **옆 지역(이웃 시·도) 축제.**
 *
 * 사장님 (2026-10-11): *"지방은 축제 탭이 너무 비는데 합치거나 방법이 없을까"* →
 * *"합쳐 내용은 남겨야해"*.
 *
 * 지방은 달 칸의 37%가 비어 있었다(대구 8달·광주 9달·세종 12달). 이웃까지 함께
 * 보여 주면 5%로 준다. 다만 **내 지역 것을 대신하지 않는다** — 화면 쪽이
 * 내 지역을 먼저 다 보여 주고 그 아래에 이것을 잇는다.
 *
 * ⚠️ 이 목록에는 **내 지역 것이 한 곳도 안 들어온다.** 두 목록을 이어 붙일 때
 *    같은 축제가 두 번 뜨면 손님이 "앱이 고장 났나" 한다.
 */
export function useNeighborFestivals(): Place[] {
  const { cityKey } = useCity();
  return useMemo(() => {
    const 이웃 = neighborsOf(cityKey);
    if (!이웃.length) return [];
    const 집합 = new Set(이웃);
    return ALL_FESTIVALS.filter((p) => 집합.has(cityOf(p)));
  }, [cityKey]);
}
