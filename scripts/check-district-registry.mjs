#!/usr/bin/env node
// 🗺️ **명부(cities.ts)에 없는 동네 때문에 곳이 버려지고 있나.**
//
// 🐞 왜 만들었나 (2026-10-05, 인천을 열다 걸렸다) —
//    관광공사가 돌려준 인천 주소가 **영종구 · 제물포구 · 서해구 · 검단구** 였다.
//    그런데 cities.ts 에는 **중구 · 동구 · 서구** 로 적혀 있었다.
//    `build-city-places` 는 명부에 없는 동네를 보면 그 곳을 버린다 —
//    **114곳 중 73곳이 통째로 버려졌다.** 차이나타운·월미도가 있는 자리다.
//
// 🚨 **화면은 안 깨진다.** 그 구가 없는 채로 앱이 멀쩡히 돈다 — 벌집에 칸이
//    없으니 **빈 곳으로도 안 보인다.** 「칸이 없으면 빈 곳이 안 보인다」 그대로다.
//
// ── 🚨 무엇을 근거로 삼나 — **주소다. 코드표가 아니다.** ──────────────────
//   처음엔 관광공사 `areaCode2`(시·군·구 코드표)에 물어봤다. **그게 틀렸다.**
//   코드표는 **옛날 이름을 그대로 들고 있고 새 이름은 없다**:
//     · 제주 → 「남제주군 · 북제주군」  (2006년에 없어졌다)
//     · 경남 → 「마산시 · 진해시」      (2010년에 창원시로 합쳐졌다)
//     · 충북 → 「청원군」              (2014년에 청주시로 합쳐졌다)
//     · 인천 → 「중구 · 동구 · 서구」   (주소는 영종구·제물포구·서해구·검단구를 쓴다)
//   그 말을 믿고 명부를 맞췄으면 **없어진 군을 되살려 놓을 뻔했다.**
//   → 그래서 **실제 곳들의 주소**(survey-*.json)를 본다. 그게 지금 쓰이는 이름이다.
//     덤으로 **관광공사를 안 불러도 된다** — 공짜고, 푸시마다 돌릴 수 있다.
//
// ── ⚠️ 두 방향은 무게가 다르다 ───────────────────────────────────────────
//   ❌ **주소에 있는데 명부에 없다** — 그 곳들이 **버려진다.** 고쳐야 한다.
//   ⬜ **명부에 있는데 주소에 없다** — 그냥 **빈 칸**이다. 관광 자료가 없을 뿐이고
//      칸은 있어야 빈 곳이 보인다. **알려만 주고 막지 않는다.**
//
// 돌리기:  node scripts/check-district-registry.mjs
import { readFileSync, existsSync } from "node:fs";
import { readCities } from "./lib/city-registry.mjs";

const cities = readCities().filter((c) => c.areaCode);
let 막음 = 0, 본도시 = 0;
const 알림 = [];

for (const c of cities) {
  const f = `src/data/survey-${c.areaCode}.json`;
  if (!existsSync(f)) continue;   // 아직 조사 안 한 도시 — 댈 것이 없다
  본도시++;
  let rows;
  try { rows = JSON.parse(readFileSync(f, "utf-8")); }
  catch (e) { console.error(`❌ ${c.ko} — ${f} 를 못 읽었다: ${e.message}`); 막음++; continue; }

  const 셈 = new Map();
  for (const r of rows) {
    // 주소의 **둘째 칸**이 시·군·구다 — build-city-places 와 **똑같이** 뽑는다.
    // (잣대가 둘이면 반쪽 적용이 생긴다 — 이 저장소가 여러 번 데인 자리다.)
    const p = String(r?.addr1 ?? "").split(/\s+/);
    if (p.length > 1 && p[1]) 셈.set(p[1], (셈.get(p[1]) ?? 0) + 1);
  }
  const ours = new Set(c.units);
  // 🚨 시·군·구 **꼴인 것만** 본다. 세종처럼 시·군·구가 없는 곳은 주소 둘째 칸이
  //    도로명(「다솜로」)이나 동 이름이라, 안 거르면 도로를 「없는 구」라고 외친다.
  const 구꼴 = (s) => /(시|군|구|읍|면)$/.test(s);
  // 🚨 **남의 시·도 동네는 고칠 게 아니다** (2026-10-05에 바로 걸렸다).
  //    광주 조사에 「화순군 1곳」이 섞여 있었다 — 화순군은 **전남**이다.
  //    경계 가까운 곳이 한두 개 넘어오는 것은 흔하고, 빌더가 버리는 게 맞다.
  //    이걸 ❌ 로 외치면 **광주 명부에 화순군을 넣으라**는 말이 된다.
  //    그래서 **다른 도시 명부에 있는 이름이면 알림으로만** 돌린다.
  const 남의동네 = new Set();
  for (const o of cities) if (o.key !== c.key) for (const u of o.units) 남의동네.add(u);
  const 넘어온것 = [];
  const 버려지는것 = [];
  for (const [k, n] of [...셈.entries()].sort((a, b) => b[1] - a[1])) {
    if (ours.has(k) || !구꼴(k)) continue;
    (남의동네.has(k) ? 넘어온것 : 버려지는것).push([k, n]);
  }
  if (넘어온것.length)
    알림.push(`   ↔️ ${c.ko} — 이웃 시·도 동네가 섞여 왔다(버리는 게 맞다): ` +
      넘어온것.map(([k, n]) => `${k}(${n})`).join(" · "));
  const 빈칸 = c.units.filter((u) => !셈.has(u));

  if (버려지는것.length) {
    막음++;
    console.log(`❌ ${c.ko} [${c.status}] — 주소에 나오는데 명부에 없다 → 그 곳들이 버려진다`);
    for (const [k, n] of 버려지는것) console.log(`      ${k} — ${n}곳`);
  } else {
    console.log(`✅ ${c.ko.padEnd(4)} ${String(c.units.length).padStart(2)}칸 — 버려지는 동네 없음`);
  }
  if (빈칸.length) 알림.push(`   ⬜ ${c.ko} — 주소에 안 나온 칸 ${빈칸.length}개: ${빈칸.join(" · ")}`);
}

console.log("");
if (!본도시) { console.log("⬜ 조사 자료(survey-*.json)가 하나도 없다 — 댈 것이 없다."); process.exit(0); }
if (알림.length) {
  console.log("⬜ 빈 칸 (막지 않는다 — 관광 자료가 없을 뿐이고 칸은 있어야 빈 곳이 보인다)");
  for (const a of 알림) console.log(a);
  console.log("");
}
if (막음) {
  console.log(`❌ ${막음}곳에서 곳이 버려지고 있다 — src/data/cities.ts 의 units 에 그 이름을 더할 것.`);
  console.log("   ⚠️ 이름을 더하면 cityHexMaps.ts 의 벌집 배치도 같이 고쳐야 한다(check-hex-maps 가 잡아 준다).");
  process.exit(1);
}
console.log(`✅ 조사한 ${본도시}곳 — 명부에 없어서 버려지는 동네가 없다.`);
