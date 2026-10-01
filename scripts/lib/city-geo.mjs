// 📍 **좌표가 그 도시 안에 있나** — 만드는 쪽과 검사하는 쪽이 **같은 잣대**를 쓴다.
//
// 잣대가 둘이면 반쪽 적용이 생긴다: 만들 때는 통과했는데 검사에서 걸리거나,
// 그 반대가 된다. 그래서 숫자와 계산식을 한 군데 둔다.
//
// 🚨 60km 로 잡은 이유 — 부산은 가덕도에서 기장까지가 40km 남짓이다.
//    넉넉하면서도, 딴 나라로 튄 좌표는 잡는다. 실제로 2026-09-16에
//    **반송공원(해운대구)이 남중국해(117.99, 19.69)에** 찍혀 있었다.
//    관광공사 자료가 틀린 것이고, 우리가 고칠 수 있는 값이 아니다.
export const MAX_KM = 60;

/**
 * 🗺️ **도(道)는 60km 로 안 된다** (2026-10-01에 드러났다).
 *
 * 이 숫자는 **부산 하나를 보고** 정한 것이다. 그래서 도를 넣어 보니 —
 *   · 경북 717곳 중 좌표가 살아남은 것 **291곳**
 *   · 강원 626곳 중 **179곳**
 * 자료가 틀린 게 아니라 **자가 짧았다.** 경북은 울진에서 고령까지 남북 180km,
 * 강원은 철원에서 삼척까지 150km다. 도청에서 60km를 그으면 도의 절반이 잘린다.
 *
 * 그렇다고 전부 160km 로 늘리면 **부산에서 남중국해를 잡던 힘이 약해진다.**
 * → 도시 종류로 가른다. 대도시는 그대로 60, 도는 160.
 *   160km 로도 딴 나라(남중국해는 1,800km 밖)는 그대로 걸린다.
 */
export const MAX_KM_DO = 160;

/** 그 도시에 맞는 자. `kind` 가 없으면 좁은 쪽(60km)으로 — 모르면 깐깐하게 본다. */
export function maxKmFor(city) {
  return city?.kind === "도" ? MAX_KM_DO : MAX_KM;
}

/** 두 점 사이 거리(km). */
export function distanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371, r = Math.PI / 180;
  const dLat = (lat2 - lat1) * r, dLng = (lng2 - lng1) * r;
  const h = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1 * r) * Math.cos(lat2 * r) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/**
 * 그 도시 자리라고 볼 수 있나. 값이 없으면 false — 없는 것과 먼 것을 갈라 쓸 것.
 *
 * @param maxKm 자. 안 적으면 60km(대도시 기준) — **도를 다룰 때는 반드시 적는다**
 *              (`maxKmFor(city)`). 안 적으면 도의 절반이 조용히 잘린다.
 */
export function nearCity(cityLat, cityLng, lat, lng, maxKm = MAX_KM) {
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || (!lat && !lng)) return false;
  return distanceKm(cityLat, cityLng, lat, lng) <= maxKm;
}
