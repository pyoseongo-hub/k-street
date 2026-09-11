// 📏 **구 안의 곳들을 「가까운 순」으로 묶는다.**
//
// 사장님 생각(2026-09-12):
//   "구를 선택 / 아래로 리스트 거리순 나열 / 1km 미만 장소 … 이 장소에서 2km 미만 장소 …
//    그냥 나열하면 먼데부터 갈수잏자나"
//
// 🚨 **시간은 쓰지 않는다.** 사장님이 못박은 것 —
//   "그시간을 잴수없어 거기에 머무르는 시간은 개개인이 틀리니"
//   「2시간 코스」·「반나절」은 우리 자료에 없는 값이라 적는 순간 지어낸 말이 된다.
//   **거리는 좌표에서 나오는 사실**이라 마음껏 써도 된다. 자세한 것은 docs/코스-추천.md.
//
// 🧭 **기준점은 「내 위치」가 아니라 그 구의 대표 역이다.** 사장님 지적 —
//   "내 위치는 매일 숙소에서 계획 짜면 같은장소니 구를 선택하게"
//   손님은 숙소에서 **내일 갈 동네**를 정한다. 그때 「내 위치 근처」는 늘 같은 숙소라
//   아무 쓸모가 없다. 위치 허락을 받을 필요도 없어진다.

import stationData from "../data/nearest-station.json";
import type { Place } from "../data/seed";

interface StationRec {
  station?: string;
  dist?: number;
  lat?: number;
  lng?: number;
}
const STATIONS = (stationData as { 곳: Record<string, StationRec> })["곳"] ?? {};

export interface Point {
  lat: number;
  lng: number;
}

/**
 * 두 점 사이 직선 거리(m). 하버사인.
 *
 * ⚠️ **걸어가는 거리가 아니라 직선 거리다.** 실제로 걸으면 더 멀다(길이 꺾이니까).
 *    그래서 화면에는 「직선 …m」이라고 적는다 — 「걸어서 …분」이라고 하면 거짓말이 된다.
 */
export function metersBetween(a: Point, b: Point): number {
  const R = 6371000;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export interface DistrictOrigin extends Point {
  /** 「광화문역 5호선」처럼 호선까지 들어 있는 이름 */
  station: string;
  /** 이 역을 가장 가까운 역으로 두고 있는 곳 수 */
  places: number;
}

/**
 * 그 구의 **대표 역** — 그 구의 곳들이 **가장 많이 끼고 있는 역**.
 *
 * 「구청」이나 「구의 한가운데」를 기준으로 잡지 않는 이유: 손님은 지하철로 온다.
 * 곳이 가장 많이 몰린 역이 실제로 **손님이 내리는 역**이다.
 * 역 자료가 한 곳도 없으면 null — 그때는 거리순을 아예 안 보여 준다(지어내지 않는다).
 */
export function districtOrigin(places: Place[]): DistrictOrigin | null {
  const count = new Map<string, number>();
  const spot = new Map<string, Point>();
  for (const p of places) {
    const r = STATIONS[p.id];
    if (!r?.station || r.lat == null || r.lng == null) continue;
    count.set(r.station, (count.get(r.station) ?? 0) + 1);
    if (!spot.has(r.station)) spot.set(r.station, { lat: r.lat, lng: r.lng });
  }
  let best: string | null = null;
  for (const [name, n] of count) if (!best || n > (count.get(best) ?? 0)) best = name;
  const at = best ? spot.get(best) : undefined;
  return best && at ? { station: best, places: count.get(best) ?? 0, ...at } : null;
}

export interface Ranked {
  place: Place;
  /** 기준점에서 직선 거리(m) */
  meters: number;
}

/** 좌표가 있는 곳만, 기준점에서 가까운 순으로. 좌표가 없으면 **뺀다** — 0m 로 두면 맨 위에 뜬다. */
export function rankByDistance(places: Place[], from: Point): Ranked[] {
  return places
    .filter((p): p is Place & Point => p.lat != null && p.lng != null)
    .map((p) => ({ place: p, meters: metersBetween(from, p) }))
    .sort((a, b) => a.meters - b.meters);
}

export interface Band {
  /** 아래 경계(m). 맨 끝 띠는 upper 가 없다 */
  lower: number;
  upper?: number;
  items: Ranked[];
}

/**
 * 거리 띠로 묶는다 — 1km 안 · 1~2km · 2~3km · 3km 밖.
 *
 * 왜 띠인가 — 그냥 쭉 나열하면 **손님이 먼 데부터 갈 수 있다**(사장님 지적).
 * 띠로 끊어 두면 「이 정도는 걸어서, 여기서부터는 한 정거장」이 눈에 보인다.
 * 빈 띠는 **안 내보낸다** — 곳이 적은 구에서 빈 칸만 늘어서면 화면이 비어 보인다.
 */
export const BAND_EDGES = [1000, 2000, 3000] as const;

export function toBands(ranked: Ranked[]): Band[] {
  const edges = [0, ...BAND_EDGES, Infinity];
  const out: Band[] = [];
  for (let i = 0; i < edges.length - 1; i++) {
    const lower = edges[i];
    const upper = edges[i + 1];
    const items = ranked.filter((r) => r.meters >= lower && r.meters < upper);
    if (items.length) out.push({ lower, upper: Number.isFinite(upper) ? upper : undefined, items });
  }
  return out;
}
