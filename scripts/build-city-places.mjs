#!/usr/bin/env node
// 🏙️ **조사 자료 → 앱이 쓰는 곳 목록.**
//
// 사장님 (2026-09-16): *"잘 짜서 만들어."*
//
// ── 무엇을 하나 ───────────────────────────────────────────────────────────
//   Survey city 가 저장해 둔 `src/data/survey-<지역코드>.json` 을 읽어,
//   관광공사 분류 코드로 갈래를 정하고(scripts/lib/tour-categories.mjs),
//   `src/data/<도시>-places.json` 으로 저장한다.
//
// 🚨 **관광공사를 부르지 않는다.** 이미 받아 둔 파일만 읽는다 —
//    규칙을 고칠 때마다 API 를 부르면 하루 몫을 금방 쓴다.
//
// 🚨 **id 는 관광공사 contentId 를 그대로 쓴다.** 순번으로 만들지 않는다 —
//    순번은 항목 하나를 지우면 뒤가 통째로 밀리고, 그러면 **지운 곳의 사진과
//    언급 수가 새 곳에 붙는다**(케이푸드에서 실제로 당했다).
//    부산 257개가 서울 304개와 **하나도 안 겹치는 것**을 확인했다.
//
// 돌리기:
//   node scripts/build-city-places.mjs --city busan --area 6
//   node scripts/build-city-places.mjs --city busan --area 6 --apply   ← 저장
import { readFileSync, writeFileSync } from "node:fs";
import { categoryOf } from "./lib/tour-categories.mjs";
import { httpsPhoto } from "./lib/https-photo.mjs";
import { distanceKm, nearCity, MAX_KM } from "./lib/city-geo.mjs";
import { cityByKey } from "./lib/city-registry.mjs";

const args = process.argv.slice(2);
const argOf = (f) => { const i = args.indexOf(f); const v = i >= 0 ? args[i + 1] : undefined; return v && !v.startsWith("--") ? v : undefined; };
const CITY = argOf("--city");
const AREA = argOf("--area");
const APPLY = args.includes("--apply");
if (!CITY || !AREA) {
  console.error("❌ 쓰는 법: node scripts/build-city-places.mjs --city busan --area 6 [--apply]");
  process.exit(1);
}

const SRC = `src/data/survey-${AREA}.json`;
const OUT = `src/data/${CITY}-places.json`;

// 🧾 도시 이름이 명부에 있나 먼저 본다. 없으면 만들어 봐야 화면에 자리가 없다.
const city = cityByKey(CITY);
if (!city) {
  console.error(`❌ cities.ts 에 「${CITY}」가 없다. 명부에 먼저 넣을 것.`);
  process.exit(1);
}
// 🚨 **지역 번호가 명부와 다르면 멈춘다.** `--city seoul --area 6` 처럼 한 글자만
//    어긋나도 **부산 자료가 서울 이름표를 달고** 저장된다 — 화면에서는 티가 안 난다.
if (city.areaCode !== String(AREA)) {
  console.error(`❌ 「${city.ko}」의 관광공사 지역 번호는 ${city.areaCode} 인데 --area ${AREA} 를 적었다.`);
  console.error(`   맞다면 cities.ts 의 areaCode 를 먼저 고칠 것. 지금 그대로 두면 남의 도시 자료가 섞인다.`);
  process.exit(1);
}
const UNITS = city.units;
const CITY_KO = city.ko;
const CITY_LAT = city.lat;
const CITY_LNG = city.lng;
// 🌊 바다가 없는 도시에서는 「바다·해변」 갈래를 통째로 막는다 (cities.ts 의 coast 참고).
if (typeof city.coast !== "boolean") {
  console.error(`❌ cities.ts 의 「${CITY}」에 coast 칸이 없다 — 바다 갈래를 막을지 알 수 없다.`);
  process.exit(1);
}

const pool = JSON.parse(readFileSync(SRC, "utf8"));

// ── 🚫 이미 앱에 있는 곳은 두 번 넣지 않는다 ──────────────────────────────
//
//   서울은 **이 빌더가 생기기 전에** 자료가 들어왔다 —
//     · src/data/tour-places-raw.json — 관광공사에서 받은 304곳 (id 가 `tour_…`)
//     · src/data/seed.ts             — 사람이 25개 구를 직접 조사해 적은 것
//   여기서 같은 곳을 또 만들면 **화면에 같은 곳이 두 번 뜬다.** id 앞에 붙는 말이
//   달라서(`tour_1234` vs `1234`) 겹치는 줄도 모른다.
//
//   🚨 **번호는 도시와 상관없이 막고, 이름은 같은 도시 안에서만 막는다.**
//      「중앙시장」처럼 서울에도 부산에도 있는 이름이 있어서다 —
//      이름으로 도시를 넘어 막으면 **부산 중앙시장이 조용히 사라진다.**
//      위 두 파일은 지금 전부 서울 것이라, 이름 쪽은 서울일 때만 쓴다.
const nfc = (t) => String(t ?? "").normalize("NFC").trim();
const takenIds = new Set();
const takenNames = new Set();
{
  const tourRaw = JSON.parse(readFileSync("src/data/tour-places-raw.json", "utf8"));
  for (const list of Object.values(tourRaw))
    for (const p of list) {
      takenIds.add(String(p.contentId));
      if (CITY === "seoul") takenNames.add(nfc(p.name));
    }
  if (CITY === "seoul") {
    // seed.ts 는 사람이 적은 것이라 기계가 읽을 모양이 아니다 — 이름만 훑는다.
    //
    // 🚨 **줄 첫머리로 찾으면 안 된다** (2026-09-17에 당했다).
    //    처음엔 `^ {2,4}name:` 으로 찾았는데, seed.ts 에는 한 줄짜리 항목이 섞여 있다:
    //      { id: id(), gu: "중랑구", category: "flower", name: "사가정공원", … },
    //    이 모양은 `name:` 이 줄 첫머리가 아니라 **통째로 안 걸렸다.** 그래서
    //    사가정공원 · 백인제가옥 · 딜쿠샤 · 북서울꿈의숲 · 대안공간 루프 **5곳이
    //    두 번 들어갔고**, 12개 언어에서 같은 제목의 페이지가 두 장씩 났다
    //    (…/baek-in-je-house 와 …/baek-in-je-house-2). 감사가 잡아 줬다.
    //    seed.ts 의 `name: "` 194개는 **전부 곳 이름**이라(다른 뜻으로 쓰인 게 없다)
    //    줄 위치를 따지지 않고 다 담는 것이 맞다.
    const seed = readFileSync("src/data/seed.ts", "utf8");
    for (const m of seed.matchAll(/\bname: "([^"]+)"/g)) takenNames.add(nfc(m[1]));
  }
}
const out = [];
const dropped = new Map();
const drop = (why, title) => dropped.set(why, [...(dropped.get(why) ?? []), title]);

for (const it of pool) {
  const name = String(it.title ?? "").trim();
  const { category, why } = categoryOf(it, { coast: city.coast });
  if (!category) { drop(why.startsWith("제외") ? why : "갈래를 모름", name); continue; }

  // 🏘️ 동네는 **주소의 둘째 칸**에서 뽑는다. 도로명이 아니라 주소 그대로다.
  //    명부에 없는 이름이면 버린다 — 화면에 그 칸이 없어서 어차피 안 보인다.
  const gu = String(it.addr1 ?? "").split(/\s+/)[1] ?? "";
  if (!UNITS.includes(gu)) { drop(gu ? `명부에 없는 동네(${gu})` : "주소 없음", name); continue; }

  // 🚫 이미 있는 곳 (위 주석 참고). 번호가 같으면 확실히 같은 곳이다.
  if (takenIds.has(String(it.contentid))) { drop("이미 앱에 있다(번호가 같다)", name); continue; }
  if (takenNames.has(nfc(name))) { drop("이미 앱에 있다(이름이 같다)", name); continue; }

  // 📷 사진이 없으면 앱이 걸러 낸다(ALL_PLACES). 여기서 미리 갈라 세어 둔다.
  const image = httpsPhoto(it.firstimage);
  const thumb = httpsPhoto(it.firstimage2);
  if (!image) drop("사진 없음(자료는 남긴다)", name);

  // 📍 🚨 **좌표가 도시 밖이면 좌표만 버린다. 곳은 남긴다.**
  //    2026-09-16에 반송공원(해운대구)이 **남중국해**에 찍혀 있었다 —
  //    관광공사 자료가 틀린 것이고 우리가 고칠 수 있는 값이 아니다.
  //    지어내지 않는다(빈 칸이 틀린 값보다 낫다). 주소가 있으면 길찾기는 된다.
  let lat = Number(it.mapy), lng = Number(it.mapx);
  if (!nearCity(CITY_LAT, CITY_LNG, lat, lng)) {
    if (Number.isFinite(lat) && Number.isFinite(lng) && (lat || lng))
      drop(`좌표가 ${CITY_KO} 밖 — 좌표만 버림(${Math.round(distanceKm(CITY_LAT, CITY_LNG, lat, lng))}km)`, name);
    lat = NaN; lng = NaN;
  }
  out.push({
    id: String(it.contentid),
    city: CITY,
    gu,
    category,
    name,
    addr: String(it.addr1 ?? "").trim() || undefined,
    image: image || undefined,
    thumb: thumb || undefined,
    lat: Number.isFinite(lat) && lat ? lat : undefined,
    lng: Number.isFinite(lng) && lng ? lng : undefined,
    tourContentId: String(it.contentid),
    source: "tour",
    // ✅ **관광공사가 직접 등록·관리하는 자료**라 「확인된 값」으로 둔다.
    //    seed.ts 의 confirmed:false 는 「아직 못 찾은 빈 칸」이라 뜻이 다르다
    //    (tourPlaces.ts 에 같은 이유를 적어 뒀다 — 잣대를 둘로 두지 않는다).
    //    🚨 이걸 빼면 감사 ❌B5 가 **346곳 전부**를 「값처럼 보이는데 확인 안 됐다」로
    //       잡고 푸시를 막는다. 실제로 2026-09-17에 그렇게 막혔다.
    confirmed: true,
  });
}

// ── 세어 보여 준다 ────────────────────────────────────────────────────────
const by = (fn) => out.reduce((m, p) => m.set(fn(p), (m.get(fn(p)) ?? 0) + 1), new Map());
console.log(`🏙️ ${CITY_KO} — 조사 ${pool.length}곳 → 쓸 수 있는 곳 **${out.length}곳**\n`);
console.log("갈래별");
for (const [k, n] of [...by((p) => p.category)].sort((a, b) => b[1] - a[1])) {
  const pic = out.filter((p) => p.category === k && p.image).length;
  console.log(`   ${k.padEnd(9)} ${String(n).padStart(4)}곳 · 사진 ${String(pic).padStart(3)}`);
}
console.log(`\n동네별 (명부 ${UNITS.length}곳)`);
const guMap = by((p) => p.gu);
for (const u of UNITS) console.log(`   ${u.padEnd(8)} ${String(guMap.get(u) ?? 0).padStart(3)}곳${guMap.get(u) ? "" : "   ⬜ 비었다"}`);

console.log("\n버린 것");
for (const [why, list] of [...dropped].sort((a, b) => b[1].length - a[1].length))
  console.log(`   ${String(list.length).padStart(3)}곳  ${why.padEnd(22)} ${list.slice(0, 3).join(" · ").slice(0, 60)}`);

const noPic = out.filter((p) => !p.image).length;
console.log(`\n📷 사진 있는 곳 ${out.length - noPic} / ${out.length}곳`);
if (noPic) console.log(`   ⚠️ 사진 없는 ${noPic}곳은 **앱 화면에 안 나온다**(ALL_PLACES 가 거른다). 자료는 남겨 둔다.`);
// 🚨 좌표가 없으면 길찾기가 안 된다 — 몇 곳인지 알고 있어야 한다.
const noXY = out.filter((p) => p.lat == null || p.lng == null).length;
console.log(`📍 좌표 있는 곳 ${out.length - noXY} / ${out.length}곳${noXY ? `  (나머지는 주소로 길을 찾는다 · ${MAX_KM}km 넘게 튄 것은 버렸다)` : ""}`);

if (!APPLY) {
  console.log(`\n(맛보기다. 저장하려면 --apply 를 붙인다 → ${OUT})`);
  process.exit(0);
}
out.sort((a, b) => a.gu.localeCompare(b.gu, "ko") || a.name.localeCompare(b.name, "ko"));
writeFileSync(OUT, JSON.stringify(out, null, 2) + "\n");
console.log(`\n💾 ${OUT} 에 ${out.length}곳 저장`);
