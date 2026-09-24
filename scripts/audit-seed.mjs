// 🔍 seed.ts 자체 감사 — Kfood의 scripts/audit-seed.mjs와 같은 목적으로 만들었다.
// "확인 못 한 것은 넣지 않는다"는 원칙을 기계가 지켜지는지 검사한다.
//
// 검사 두 갈래:
//   ❌ 막아야 할 것(blocking) — 데이터 모순, id 충돌처럼 화면이 실제로 잘못될 수 있는 것.
//   ⚠️ 살펴볼 것(warning) — 커버리지 현황처럼 사람이 판단해서 다음 조사를 정할 것.
//
// 실행: node scripts/audit-seed.mjs

import { execSync } from "node:child_process";
import { writeFileSync, rmSync, readFileSync } from "node:fs";
// 🏙️ 도시마다 어떤 동네가 있는지는 명부 한 곳에서 읽는다.
import { readCities } from "./lib/city-registry.mjs";

// 좌표·사진은 id를 열쇠로 쓰는 별도 파일이다. B1-2가 이 둘을 seed와 대조한다.
const dataFile = (f) =>
  JSON.parse(readFileSync(new URL(`../src/data/${f}`, import.meta.url), "utf-8"));
const coordsJson = dataFile("coords.json");
const manualPhotosJson = dataFile("manual-photos.json");

// seed.ts는 TypeScript라 Node가 바로 import 못 한다 — esbuild로 즉석 변환한다.
const tmp = new URL("../.audit-seed.mjs", import.meta.url);
execSync(
  `npx esbuild src/data/seed.ts --bundle --format=esm --platform=node --outfile=${tmp.pathname}`,
  { cwd: new URL("..", import.meta.url).pathname, stdio: "pipe" }
);
const { ALL_PLACES, CATEGORY_META } = await import(tmp.href);
rmSync(tmp, { force: true });

// 🏙️ **동네 목록은 명부(cities.ts)에서 가져온다** (2026-09-17, 부산을 열면서).
//
//    그전에는 서울 25개 구가 여기 손으로 박혀 있었다. 부산을 여는 순간
//    금정구·해운대구가 전부 「없는 구」로 잡혀 **160건이 막혔다.**
//
// 🚨 **도시를 가려서 본다.** 두 도시 목록을 한 통에 부어 놓고 보면
//    「부산 곳에 서울 강남구」 같은 진짜 사고를 놓친다 —
//    「중구」는 서울에도 부산에도 있어서 그냥은 못 가른다.
const CITIES_ON_DISK = readCities();
const UNITS_BY_CITY = new Map(CITIES_ON_DISK.map((c) => [c.key, c.units]));
/** 서울 25개 구 — 맨 아래 「총 …개 자치구 기준」 한 줄에만 쓴다. */
const DISTRICTS = UNITS_BY_CITY.get("seoul") ?? [];

/**
 * 🏙️ **커버리지(W1·W3)는 도시마다 따로 센다** (2026-09-24에 이걸로 데였다).
 *
 * 그전에는 **두 도시 곳을 한 자루에 담고 서울 25개 구로 나누고** 있었다.
 * 「중구」·「서구」·「동구」·「남구」·「북구」·「강서구」는 **서울에도 부산에도 있어서**
 * 부산 곳이 서울 칸을 대신 채웠다. 실제로 이랬다 —
 *
 *   야경 : 서울엔 5개 구뿐인데 **11개 구**로 셌다
 *          (부산 중구·해운대구 등 6개가 서울 칸을 채웠다)
 *   절   : 서울 16 → **29**
 *   해변 : 서울은 0인데 **6**  ← 서울에 바다가 없다는 사실이 가려졌다
 *
 * 그래서 W3(「행 자체가 빠진 구」)가 **진짜 빈 칸을 안 짚어 줬다.**
 * 서울 중구에 야경이 없는데 부산 중구가 있으니 「있음」으로 넘어갔다.
 * 숫자는 커 보이고 경보는 조용했다 — 가장 나쁜 조합이다.
 */
const CITY_KEYS = [...UNITS_BY_CITY.keys()];
const cityOf = (p) => p.city ?? "seoul";

const blocking = [];
const warning = [];
const add = (bucket, code, title, items) => {
  if (items.length) bucket.push({ code, title, items });
};

// ❌ B1 — id 충돌
{
  const seen = new Map();
  const dups = [];
  for (const p of ALL_PLACES) {
    if (seen.has(p.id)) dups.push(`${p.id} (${seen.get(p.id)} ↔ ${p.name})`);
    seen.set(p.id, p.name);
  }
  add(blocking, "B1", "id 충돌", dups);
}

// ❌ B1-2 — **좌표·사진이 남의 것에 붙어 있지 않은가** (2026-09-02에 18곳이 그랬다)
//
// seed.ts의 id는 `ks_1, ks_2 …`로 **파일에 적힌 순서**로 매겨진다. 항목 하나를
// 지우거나 끼워 넣으면 그 뒤가 전부 한 칸씩 밀리는데, coords.json과
// manual-photos.json은 옛 번호를 그대로 들고 있어 조용히 남의 것이 된다:
//
//     무수골(도봉구)       → 경춘선숲길 좌표 + 경춘선숲길 사진
//     서울시립미술관(중구)  → 딜쿠샤 사진 (종로구의 다른 곳)
//
// **화면도 안 깨지고 문법도 안 틀려서 눈으로는 절대 못 잡는다.** 좌표 7곳·사진
// 11곳이 그 상태였고, 사용자가 "하나하나 수동검사 해"라고 해서야 찾았다.
// 앱에는 이름 대조 장치를 넣었지만(lib/coords.ts·manualPhotos.ts), 그건 **틀린 걸
// 안 쓰는 것**이지 고치는 게 아니다 — 여기서 잡아야 다시 채울 수 있다.
{
  const sq = (s) => String(s ?? "").normalize("NFC").replace(/[^가-힣a-zA-Z0-9]/g, "");
  const near = (a, b) => sq(a).includes(sq(b)) || sq(b).includes(sq(a));
  const byId = new Map(ALL_PLACES.map((p) => [p.id, p]));
  const check = (file, json, label) => {
    const bad = [];
    for (const [id, v] of Object.entries(json)) {
      if (id.startsWith("_")) continue;
      const p = byId.get(id);
      if (!p) continue; // 관광공사 쪽(tour_…)이거나 지워진 항목 — 여기선 안 본다
      // 축제 장소표로 찾은 좌표는 일부러 다른 이름이다(venueFor).
      const stamped = v.for ?? v.matchedName;
      if (v.venueFor || !stamped) continue;
      if (!near(stamped, p.name)) bad.push(`${p.gu} ${p.name} ← "${stamped}" (${file})`);
    }
    return bad;
  };
  add(blocking, "B1-2", "좌표·사진이 남의 장소 것에 붙어 있다 (id 밀림)", [
    ...check("coords.json", coordsJson, "좌표"),
    ...check("manual-photos.json", manualPhotosJson, "사진"),
  ]);
}

// ❌ B11 — 사진 주소가 http:// 인 것
//
// 앱은 https:// 로 서비스되는데(GitHub Pages) 관광공사 API는 사진 주소를 http:// 로 준다.
// https 페이지 안의 http 사진은 브라우저가 **혼합 콘텐츠**로 보고 막거나 https로
// 조용히 승격한다 — 실패하면 오류 없이 **사진 자리만 빈 채로** 남는다.
// 개발할 때는 http://localhost 라 멀쩡히 보여서, 2026-09-04 출시 전 검수 전까지
// 사진 540개가 전부 http인 줄 아무도 몰랐다.
//
// 받아 적을 때 scripts/lib/https-photo.mjs가 올려 주지만, 새 스크립트가 그걸
// 안 거치면 다시 들어온다. 그때도 아무도 모른다 — 그래서 여기서 막는다.
{
  const httpPhotos = [];
  const seen = new Set();
  const look = (file, obj, path = "") => {
    if (typeof obj === "string") {
      if (obj.startsWith("http://") && /\.(jpe?g|png|gif|webp)(\?|$)/i.test(obj)) {
        const k = `${file} ${obj}`;
        if (!seen.has(k)) {
          seen.add(k);
          httpPhotos.push(`${file}${path} — ${obj}`);
        }
      }
      return;
    }
    if (obj && typeof obj === "object")
      for (const [k, v] of Object.entries(obj)) look(file, v, `${path}.${k}`);
  };
  for (const f of [
    "tour-places-raw.json",
    "tour-gallery.json",
    "tour-images.json",
    "festival-dates.json",
    "manual-photos.json",
    "cover-photos.json",
  ]) {
    look(f, dataFile(f));
  }
  // 수백 개가 한꺼번에 터지면 로그가 안 읽히므로 앞의 몇 개만 보여 준다.
  add(
    blocking,
    "B11",
    "사진 주소가 http:// — https로 서비스되는 앱에서는 사진이 안 보인다",
    httpPhotos.length > 8
      ? [...httpPhotos.slice(0, 8), `…그 밖에 ${httpPhotos.length - 8}개 더`]
      : httpPhotos
  );
}

// ❌ B2 — 알 수 없는 카테고리
add(
  blocking,
  "B2",
  "CATEGORY_META에 없는 카테고리",
  ALL_PLACES.filter((p) => !CATEGORY_META[p.category]).map((p) => `${p.id} ${p.category}`)
);

// ❌ B3 — 그 **도시의** 명부에 없는 동네 이름 (오타)
//
// 🚨 **도시가 섞인 것은 여기서 안 잡힌다** — 2026-09-17에 일부러 부산 곳에 「강남구」를
//    넣어 보고 알았다. 그 곳은 여기 오기 전에 **이미 사라진다**: seed.ts 의 게이트가
//    `sidoOf(gu, city)` 로 「그 구가 그 도시 것인가」를 보고 아니면 걸러 내기 때문이다.
//    그래서 이 검사는 조용히 통과한다.
//
//    잡는 것은 **check-city-places.mjs** 다 —
//      「busan-places.json — 가덕도 등대: 「강남구」는 부산 명부에 없다」
//    거기서 푸시가 막힌다. 둘 다 있어야 한다:
//      · check-city-places — **자료가 틀렸다**고 알려 준다(푸시를 막는다)
//      · seed.ts 의 게이트 — 틀린 것이 **손님 화면에 못 간다**(안전판)
//    여기 B3 는 남은 몫을 본다: 자료 파일이 아니라 seed.ts 에 손으로 적은 곳의 오타.
add(
  blocking,
  "B3",
  "그 도시 명부에 없는 동네",
  ALL_PLACES.filter((p) => {
    const units = UNITS_BY_CITY.get(p.city ?? "seoul");
    // 명부에 없는 도시면 그것부터 문제다 — 아래 메시지에 그대로 드러난다.
    return !units || !units.includes(p.gu);
  }).map((p) => `${p.id} [${p.city ?? "seoul"}] "${p.gu}"`)
);

// ❌ B4 — confirmed:true인데 이름이 "확인 필요"류 자리표시자
const PLACEHOLDER_RE = /확인\s*필요|이름\s*미확인/;
add(
  blocking,
  "B4",
  "confirmed:true인데 자리표시자 이름",
  ALL_PLACES.filter((p) => p.confirmed && PLACEHOLDER_RE.test(p.name)).map((p) => `${p.gu} ${p.name}`)
);

// ❌ B5 — confirmed:false인데 자리표시자 문구가 없음(값처럼 보이는데 확인 안 됐다고 표시)
add(
  blocking,
  "B5",
  "confirmed:false인데 자리표시자 문구가 없음 — 진짜 값을 넣어놓고 false로 잘못 표시했을 수 있다",
  ALL_PLACES.filter((p) => !p.confirmed && !PLACEHOLDER_RE.test(p.name)).map((p) => `${p.gu} ${p.name}`)
);

// ⚠️ W1 — 카테고리별 커버리지 (**도시마다 따로**)
{
  const lines = [];
  for (const key of CITY_KEYS) {
    const units = UNITS_BY_CITY.get(key) ?? [];
    if (!units.length) continue;
    const here = ALL_PLACES.filter((p) => cityOf(p) === key);
    if (!here.length) continue;
    lines.push(`── ${key} (${units.length}개 동네 · 곳 ${here.length})`);
    for (const cat of Object.keys(CATEGORY_META)) {
      const inCat = here.filter((p) => p.category === cat);
      const confirmedGu = new Set(inCat.filter((p) => p.confirmed).map((p) => p.gu));
      const pct = Math.round((confirmedGu.size / units.length) * 100);
      lines.push(
        `   ${CATEGORY_META[cat].icon} ${CATEGORY_META[cat].label}: ${confirmedGu.size}/${units.length} (${pct}%)`
      );
    }
  }
  add(warning, "W1", "카테고리별 커버리지 (도시별)", lines);
}

// ⚠️ W2 — 축제인데 월 정보가 없는 항목(홈 상단 칸에 절대 안 뜬다)
add(
  warning,
  "W2",
  "축제인데 startMonth가 없음 — MonthlyFestivalPanel에 노출되지 않는다",
  ALL_PLACES.filter((p) => p.category === "festival" && p.startMonth == null).map((p) => `${p.gu} ${p.name}`)
);

// ⚠️ W3 — 자치구 하나에 특정 카테고리가 아예 없는 경우(행이 통째로 빠졌을 가능성)
{
  const missing = [];
  for (const key of CITY_KEYS) {
    const units = UNITS_BY_CITY.get(key) ?? [];
    const here = ALL_PLACES.filter((p) => cityOf(p) === key);
    if (!units.length || !here.length) continue;
    for (const cat of Object.keys(CATEGORY_META)) {
      // 🏙️ **그 도시 곳만 본다.** 합쳐 보면 부산 중구가 서울 중구 칸을 채운다.
      const gusInCat = new Set(here.filter((p) => p.category === cat).map((p) => p.gu));
      // 🤫 **그 도시에 그 갈래가 아예 없으면 한 줄로 끝낸다.**
      //    서울에 바다가 없는 것은 사고가 아니라 사실이다. 그걸 25줄로 적으면
      //    진짜 빠진 한 줄이 그 사이에 묻힌다 — 경보는 울릴 때만 울려야 한다.
      if (gusInCat.size === 0) {
        missing.push(`[${key}] ${CATEGORY_META[cat].label} — 이 도시에 한 곳도 없다`);
        continue;
      }
      for (const d of units) {
        if (!gusInCat.has(d)) missing.push(`[${key}] ${d} — ${CATEGORY_META[cat].label} 행 자체가 없음`);
      }
    }
  }
  add(warning, "W3", "행 자체가 빠진 구 (확인 필요 표시조차 없음)", missing);
}

// ── 출력 ──────────────────────────────────────────────
const printBucket = (bucket, mark) => {
  for (const { code, title, items } of bucket) {
    console.log(`\n${mark} ${code} — ${title} (${items.length}건)`);
    for (const item of items) console.log(`   ${item}`);
  }
};

console.log(`총 ${ALL_PLACES.length}개 항목, ${DISTRICTS.length}개 자치구 기준으로 감사한다.`);
printBucket(warning, "⚠️");
printBucket(blocking, "❌");

if (blocking.length) {
  console.log(`\n❌ 막힘 — blocking 문제 ${blocking.reduce((n, b) => n + b.items.length, 0)}건. 고치기 전엔 커밋하지 말 것.`);
  process.exit(1);
} else {
  console.log("\n✅ blocking 문제 없음.");
}
