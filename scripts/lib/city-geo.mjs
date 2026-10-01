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

// ─────────────────────────────────────────────────────────────────────────────
// 🏝️ **섬은 시청에서 멀다 — 그래서 자(尺)를 두 겹으로 둔다.** (2026-10-01)
// ─────────────────────────────────────────────────────────────────────────────
//
// 🐞 무슨 일이 있었나: 경북을 넣었더니 「울릉군 설 자리 없음 — 좌표 있는 곳 0 (곳 34)」.
//    울릉도는 경북 시청에서 약 220km다. 도(道)에 쓰는 자가 160km라 **34곳의 좌표가
//    전부 버려졌다.** 좌표가 틀린 게 아니라 **자가 짧았다** — MAX_KM=60 을 전국에
//    들이댔던 것과 똑같은 병이다(위 maxKmFor 주석).
//
// ❌ 자를 220km 로 늘리지 않는다. 그러면 원래 잡으려던 것(남중국해에 찍힌 반송공원)을
//    놓친다. 자를 늘리는 것은 지키려던 것을 버리는 일이다.
// ✅ **재는 자리를 바꾼다.** 시청에서 재는 것 말고, **그 시·군에 모인 곳들의 가운데**에서도
//    재 본다. 울릉군 34곳은 다 울릉도에 모여 있으니 가운데도 울릉도다 — 안 버려진다.
//    반송공원은 해운대구 다른 곳들의 가운데에서 수천 km라 그대로 걸린다.
//
// 🚨 **중앙값**을 쓴다(평균이 아니다). 틀린 좌표 하나가 평균을 끌고 가 버린다.
// ⚠️ 곳이 적은 시·군(1~2곳)에서는 가운데가 곧 그 곳이라 아무것도 못 가른다. 그래서
//    **시청 자를 없애지 않고 둘 중 하나만 통과해도 받는다.**
//
// 🚨 **이 함수가 한 자리에 있는 것이 핵심이다.** 처음에는 만드는 쪽
//    (build-city-places)에만 넣었더니, 검사하는 쪽(check-city-places)이 여전히
//    시청 자 하나로만 재서 **같은 곳 19개를 「217km 떨어져 있다」고 막았다.**
//    이 저장소가 여러 번 데인 자리다 — 「잣대가 둘이면 반쪽 적용이 생긴다」.

/** 시·군 가운데에서 이만큼 벗어나면 튄 좌표로 본다(km). */
export const DISTRICT_LIMIT_KM = 30;

/**
 * 시·군마다 **곳들이 모인 가운데**(중앙값)를 구한다.
 * @param {{gu?: string, lat?: number, lng?: number}[]} rows
 * @returns {Map<string, {lat: number, lng: number}>}
 *   곳이 3개 미만인 시·군은 **담지 않는다** — 가운데가 곧 그 곳이라 잣대가 못 된다.
 */
export function districtMedians(rows) {
  const 모음 = new Map();
  for (const r of rows ?? []) {
    const gu = r?.gu;
    const lat = Number(r?.lat), lng = Number(r?.lng);
    if (!gu || !Number.isFinite(lat) || !Number.isFinite(lng) || (!lat && !lng)) continue;
    if (!모음.has(gu)) 모음.set(gu, []);
    모음.get(gu).push([lat, lng]);
  }
  const mid = (xs) => { const a = [...xs].sort((x, y) => x - y); return a[Math.floor(a.length / 2)]; };
  const out = new Map();
  for (const [gu, pts] of 모음)
    if (pts.length >= 3) out.set(gu, { lat: mid(pts.map((p) => p[0])), lng: mid(pts.map((p) => p[1])) });
  return out;
}

/**
 * 그 좌표를 믿어도 되나 — **시청 자, 아니면 시·군 가운데 자.** 둘 중 하나만 통과하면 받는다.
 * @param {{lat:number, lng:number, kind?:string}} city 도시 명부 한 줄
 * @param {Map<string, {lat:number,lng:number}>} medians districtMedians() 가 만든 것
 */
export function coordLooksRight(city, medians, gu, lat, lng) {
  if (nearCity(city.lat, city.lng, lat, lng, maxKmFor(city))) return true;
  const mid = medians?.get(gu);
  return mid ? nearCity(mid.lat, mid.lng, lat, lng, DISTRICT_LIMIT_KM) : false;
}
