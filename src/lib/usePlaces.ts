import { useMemo } from "react";
import { ALL_PLACES, type Place } from "../data/seed";
import { useCity } from "./useCity";

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
