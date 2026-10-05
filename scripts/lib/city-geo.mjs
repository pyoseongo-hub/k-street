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

// ── 🏝️ 세 번째 그물: **같은 시·군 안에서 저희끼리 모여 있나** (2026-10-05) ──
//
// 인천을 열다 걸렸다. **옹진군 39곳이 200km 바다에 흩어져 있다** —
// 가운데는 남쪽 섬(영흥도 쪽, 시청에서 36km)에 잡히는데,
// **백령도·대청도 8곳은 그 가운데에서 160~173km**다. 그래서 —
//   · 시청 자(인천은 대도시라 60km)  → 못 잡는다
//   · 시·군 가운데 자(30km)         → 못 잡는다
// 둘 다 놓쳐서 **두무진·콩돌해변·심청각·사곶해변 여덟 곳의 좌표가 버려졌다.**
// 그런데 그 좌표는 **맞다.** 백령도는 정말 거기 있다.
//
// ✅ **저희끼리 모여 있으면 믿는다.** 같은 시·군 안에서 30km 안에 **셋 이상**이
//    뭉쳐 있으면 그건 튄 좌표가 아니라 **진짜 동떨어진 섬·산간**이다.
//    백령도 여덟 곳은 서로 10km 안이라 함께 통과한다.
//
// 🚨 **왜 셋인가.** 하나는 그냥 오류다. 둘은 **같은 오류가 두 번** 날 수 있다
//    (관광공사가 한 묶음을 같은 엉뚱한 자리에 찍어 두는 일이 있다).
//    셋부터는 묶음으로 본다 — districtMedians 가 3을 쓰는 것과 같은 이유다.
// 🚨 **남중국해 반송공원은 여전히 걸린다** — 혼자다. 자를 늘린 게 아니라
//    **재는 자리를 하나 더 둔 것**이라, 원래 잡으려던 것은 그대로 잡는다.

/** 떨어진 섬·산간으로 인정하는 **최소 묶음 크기**. 이보다 적으면 오류로 본다. */
export const CLUSTER_MIN = 3;

/**
 * 시·군마다 **저희끼리 뭉친 자리들**을 구한다(30km 안에 CLUSTER_MIN 이상).
 * @param {{gu?: string, lat?: number, lng?: number}[]} rows
 * @returns {Map<string, {lat:number,lng:number}[]>} 시·군 → 뭉친 자리들의 가운데
 */
export function districtClusters(rows) {
  const 모음 = new Map();
  for (const r of rows ?? []) {
    const gu = r?.gu;
    const lat = Number(r?.lat), lng = Number(r?.lng);
    if (!gu || !Number.isFinite(lat) || !Number.isFinite(lng) || (!lat && !lng)) continue;
    if (!모음.has(gu)) 모음.set(gu, []);
    모음.get(gu).push([lat, lng]);
  }
  const out = new Map();
  for (const [gu, pts] of 모음) {
    // 아주 단순한 묶기 — 아직 아무 묶음에도 안 든 점을 씨앗으로 삼아
    // 30km 안의 점을 끌어모은다. 곳 수가 수백 단위라 이 정도면 충분하다.
    const 남음 = [...pts];
    const 묶음들 = [];
    while (남음.length) {
      const [씨lat, 씨lng] = 남음.shift();
      const 식구 = [[씨lat, 씨lng]];
      for (let i = 남음.length - 1; i >= 0; i--) {
        if (nearCity(씨lat, 씨lng, 남음[i][0], 남음[i][1], DISTRICT_LIMIT_KM)) {
          식구.push(남음[i]); 남음.splice(i, 1);
        }
      }
      if (식구.length >= CLUSTER_MIN) {
        const mid = (xs) => { const a = [...xs].sort((x, y) => x - y); return a[Math.floor(a.length / 2)]; };
        묶음들.push({ lat: mid(식구.map((p) => p[0])), lng: mid(식구.map((p) => p[1])) });
      }
    }
    if (묶음들.length) out.set(gu, 묶음들);
  }
  return out;
}

/**
 * 그 좌표를 믿어도 되나 — 그물 **셋 중 하나**만 통과하면 받는다.
 *   ① 시청에서 가깝다 (대도시 60km · 도 160km)
 *   ② 그 시·군 곳들의 **가운데**에서 30km 안 — 울릉도를 살린 자
 *   ③ 그 시·군 안에서 **셋 이상이 뭉친 자리**에서 30km 안 — 백령도를 살린 자
 * @param {{lat:number, lng:number, kind?:string}} city 도시 명부 한 줄
 * @param {Map<string, {lat:number,lng:number}>} medians districtMedians() 가 만든 것
 * @param {Map<string, {lat:number,lng:number}[]>} [clusters] districtClusters() 가 만든 것
 */
export function coordLooksRight(city, medians, gu, lat, lng, clusters) {
  if (nearCity(city.lat, city.lng, lat, lng, maxKmFor(city))) return true;
  const mid = medians?.get(gu);
  if (mid && nearCity(mid.lat, mid.lng, lat, lng, DISTRICT_LIMIT_KM)) return true;
  for (const c of clusters?.get(gu) ?? [])
    if (nearCity(c.lat, c.lng, lat, lng, DISTRICT_LIMIT_KM)) return true;
  return false;
}
