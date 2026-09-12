// 🚇 **곳마다 미리 받아 둔 「가장 가까운 지하철역」** — 읽는 자리를 하나로 모은다.
//
// 왜 파일이 따로 생겼나 (2026-09-12):
//   같은 자료를 **세 곳**이 각자 읽고 있었다 — 화면(MapDirections)·곳 페이지
//   (build-place-pages)·거리순 보기(districtDistance). 그래서 아래 사고가 났을 때
//   **한 곳만 고치면 나머지 둘이 그대로 틀린 값을 보여 준다.**
//   이 저장소가 여러 번 데인 자리라(「잣대가 둘이면 반쪽 적용이 생긴다」) 하나로 묶었다.
//
// ─────────────────────────────────────────────────────────────────────────
// 🐞 무슨 사고였나 — **곳이 움직이면 역 자료가 조용히 틀려진다**
// ─────────────────────────────────────────────────────────────────────────
//   이 자료는 `scripts/fetch-nearest-station` 이 **그때의 좌표로** 미리 재 둔 것이다.
//   그런데 2026-09-12에 구청 자료를 받아 쓰면서 **축제의 좌표가 바뀌는 길**이 생겼다.
//
//     서울라이트 한강 빛섬축제
//       2025년 → 뚝섬한강공원(광진구) · 가장 가까운 역 **자양역 7호선 679m**
//       2026년 → **노들섬(용산구)**   · 실제로는 노들역·용산역 쪽
//
//   좌표는 옮겼는데 역 자료는 그대로라, 곳 페이지에 **「노들섬 · 자양역 679m」**가
//   찍혔다. 한 칸 안에서 서로 다른 말을 하는 것이고, 짐 든 손님을 한강 건너로 보낸다.
//
// ✅ 고친 방법: **믿지 않고 재 본다.**
//   기록에 역의 좌표가 같이 들어 있으므로, 지금 곳 좌표에서 그 역까지 다시 잰다.
//   적어 둔 거리와 크게 어긋나면 **그 기록은 낡은 것**이라 쓰지 않는다.
//   ⚠️ 고쳐서 쓰지 않는다 — 「진짜 가장 가까운 역」은 여기서 알 수 없다. 역 목록이
//      없기 때문이다. **모르면 비운다.** 빈 칸이 틀린 역보다 낫다.
//   🔁 `fetch-nearest-station` 을 다시 돌리면 저절로 채워진다.

import stationData from "../data/nearest-station.json";

export interface StationRecord {
  /** 「안국역 3호선」처럼 호선까지 들어 있다 */
  station?: string;
  /** 곳에서 역까지 잰 거리(m) */
  dist?: number;
  /** 역의 좌표 */
  lat?: number;
  lng?: number;
  url?: string;
  /** true = 1.5km 안에 역이 없더라. **모른다는 뜻이 아니라 없다는 답이다** */
  none?: boolean;
}

const ROWS = (stationData as { 곳?: Record<string, StationRecord> })["곳"] ?? {};

/** 두 점 사이 직선 거리(m). districtDistance.ts 와 같은 식이다. */
function metres(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 6371000;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(bLat - aLat);
  const dLng = rad(bLng - aLng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(aLat)) * Math.cos(rad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/**
 * 적어 둔 거리와 지금 좌표가 이만큼 어긋나면 **낡은 기록**으로 본다(m).
 *
 * 300m 인 이유 — 좌표를 조금 다듬는 일(fetch-coords 가 더 정확한 점을 채우는 것)은
 * 보통 수십 m 안이다. 그걸 낡았다고 버리면 멀쩡한 자료가 통째로 사라진다.
 * 반대로 **곳이 진짜로 옮겨지면** 킬로미터 단위로 벌어진다(빛섬축제는 약 9km).
 */
const STALE_OVER = 300;

/**
 * 그 곳의 「가장 가까운 역」. **낡았으면 undefined** — 지어내지 않는다.
 *
 * @param at 지금 쓰고 있는 곳의 좌표. 주면 기록을 **다시 재서** 확인한다.
 *           안 주면 예전처럼 그대로 돌려준다(좌표를 모르는 화면도 있다).
 */
export function nearestStation(
  id: string,
  at?: { lat?: number; lng?: number },
): StationRecord | undefined {
  const r = ROWS[id];
  if (!r) return undefined;
  // 「역이 없다」는 답은 좌표와 상관없이 그대로 쓴다 — 거리를 잴 대상이 없다.
  if (r.none) return r;
  if (!r.station || r.dist == null) return undefined;
  if (at?.lat == null || at?.lng == null) return r;
  if (r.lat == null || r.lng == null) return r; // 옛 기록에는 역 좌표가 없다
  const now = metres(at.lat, at.lng, r.lat, r.lng);
  return Math.abs(now - r.dist) > STALE_OVER ? undefined : r;
}
