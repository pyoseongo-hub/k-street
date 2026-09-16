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

/** 두 점 사이 거리(km). */
export function distanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371, r = Math.PI / 180;
  const dLat = (lat2 - lat1) * r, dLng = (lng2 - lng1) * r;
  const h = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1 * r) * Math.cos(lat2 * r) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** 그 도시 자리라고 볼 수 있나. 값이 없으면 false — 없는 것과 먼 것을 갈라 쓸 것. */
export function nearCity(cityLat, cityLng, lat, lng) {
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || (!lat && !lng)) return false;
  return distanceKm(cityLat, cityLng, lat, lng) <= MAX_KM;
}
