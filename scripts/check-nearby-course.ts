// 🧭 **내 주변 코스가 실제로 나오는지 돌려 본다** (src/lib/nearbyCourse.ts).
//
// 왜 필요한가 — 코스는 **자료가 얇은 곳에서 조용히 빈다.** 화면은 안 깨지고
// 오류도 안 나고, 손님만 빈 칸을 본다. docs/코스-추천.md 가 이미 경고해 둔 자리다
// (9개 구에 골목이 0곳 — 「골목 3곳 코스」를 고르면 빈 화면).
//
// 그래서 **서 있을 법한 자리마다 실제로 만들어 본다.** 서 있을 법한 자리는
// 그 구의 대표 역이다(districtDistance.ts — 곳이 가장 많이 몰린 역 = 손님이 내리는 역).
//
// 🔔 **경보를 울려 봐야 한다** (CLAUDE.md). `--strict` 를 주면 걸어서 3곳을
//    못 만드는 구가 하나라도 있을 때 **실패로 끝난다** — 워크플로에 걸 때 쓴다.

import { ALL_PLACES } from "../src/data/seed";
import { districtOrigin } from "../src/lib/districtDistance";
import { buildCourse, formatMeters, REACH } from "../src/lib/nearbyCourse";
// 🏙️ **도시로 먼저 가른다.** 구 이름만으로 묶으면 안 된다 —
//    「중구」·「서구」·「동구」·「남구」·「북구」·「강서구」는 서울에도 부산에도 있다.
//    한 자루에 담으면 부산 중구 곳이 서울 중구 코스에 섞여 들어간다. myDistrict.ts 가
//    같은 함정을 주석으로 경고해 뒀다. (처음 돌렸을 때 이 파일이 실제로 그랬다.)
import { cityOf, placesInCity } from "../src/lib/usePlaces";

const strict = process.argv.includes("--strict");
const CITIES = [...new Set(ALL_PLACES.map(cityOf))].sort();

let noOrigin = 0;
let shortWalk = 0;
let emptyWalk = 0;

console.log("구별 — 대표 역에 서 있다고 치고 「3곳 코스」를 만들어 본다\n");
for (const city of CITIES) {
  const CITY_PLACES = placesInCity(city);
  const GU = [...new Set(CITY_PLACES.map((p) => p.gu))].sort();
  console.log(`\n■ ${city} (곳 ${CITY_PLACES.length})`);
  console.log("   구        🚶 걸어서            🚇 지하철도");
  for (const gu of GU) {
  const ps = CITY_PLACES.filter((p) => p.gu === gu);
  // 🚉 서 있을 자리. 역 자료가 있으면 그 구의 대표 역, **없으면 그 구의 첫 곳**.
  //
  // 🚨 부산은 역 자료가 **한 건도 없다** (nearest-station.json 364건이 전부 서울이다).
  //    그래서 예전 「가까운 순 보기」는 부산에서 아예 안 뜬다 — 기준점이 역이라서다.
  //    **내 주변 코스는 다르다.** 기준점이 손님의 GPS 라 역 자료가 없어도 돈다.
  //    여기서만 역이 없는 도시를 검사하려고 대신 설 자리를 하나 잡는 것이다 —
  //    화면이 실제로 쓰는 값이 아니다.
  const station = districtOrigin(ps);
  const fallback = ps.find((p) => p.lat != null && p.lng != null);
  const o = station ?? (fallback ? { lat: fallback.lat!, lng: fallback.lng! } : null);
  if (!o) {
    noOrigin++;
    console.log(`   ❌ ${gu.padEnd(6)} 설 자리 없음 — 좌표 있는 곳 0 (곳 ${ps.length})`);
    continue;
  }
  const mark = station ? " " : "*";
  // 🏙️ **그 구 안으로 가두지 않는다.** 손님은 구 경계를 모르고, 경계에 서 있으면
  //    옆 구가 더 가깝다. 코스는 도시 전체를 후보로 본다 — 화면도 그렇게 돈다.
  const cell = (reach: number) => {
    const c = buildCourse(CITY_PLACES, o, { size: 3, reach });
    if (!c) return "없음";
    return `${c.stops.length}곳 · ${formatMeters(c.total)}`;
  };
  const walk = buildCourse(CITY_PLACES, o, { size: 3, reach: REACH.walk });
  if (!walk) emptyWalk++;
  else if (walk.stops.length < 3) shortWalk++;
  console.log(`  ${mark}${gu.padEnd(8)} ${cell(REACH.walk).padEnd(20)} ${cell(REACH.transit)}`);
  }
}

console.log("\n  * = 역 자료가 없어 그 구의 첫 곳에 서 있다고 친 것 (부산 전체가 그렇다)");
console.log(
  `\n설 자리 못 잡은 구 ${noOrigin} · 걸어서 한 곳도 못 찾은 구 ${emptyWalk} · 3곳을 못 채운 구 ${shortWalk}`,
);
console.log(
  emptyWalk || shortWalk
    ? "⚠️ 그 구에서는 「걸어서」를 고른 손님이 적은 코스를 받는다 — 화면이 그렇다고 말해 준다(nearbyCourseShort)."
    : "✅ 모든 구에서 걸어서 3곳이 나온다.",
);

if (strict && (noOrigin || emptyWalk)) {
  console.error("❌ --strict: 코스가 아예 안 나오는 구가 있다");
  process.exit(1);
}
