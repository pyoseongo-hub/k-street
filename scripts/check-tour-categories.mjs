#!/usr/bin/env node
// 🧾 **분류표가 실제 자료에 맞나 센다.** 관광공사를 부르지 않는다 —
//    저장해 둔 조사 자료(src/data/survey-*.json)에만 대 본다.
//
// 이 검사가 있는 이유 — 표를 손으로 고치다 보면 코드 한 줄을 지우고도 모른다.
// 그러면 「절 29곳」이 조용히 사라진다. 숫자가 줄면 여기서 걸린다.
//
// 돌리기: node scripts/check-tour-categories.mjs [--city 부산]
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { categoryOf, CODE_TO_CATEGORY, SKIP_CODES } from "./lib/tour-categories.mjs";
import { cityByArea } from "./lib/city-registry.mjs";

const DIR = "src/data";
const files = readdirSync(DIR).filter((f) => /^survey-\d+\.json$/.test(f));
if (!files.length) {
  console.error("❌ 조사 자료가 없다 — Actions 의 Survey city 를 save 켜고 돌릴 것.");
  process.exit(1);
}

// 🚨 **이 아래로 떨어지면 무언가 망가진 것이다.** 부산 실측(2026-09-16)에서
//    203/218곳(93%)이 갈렸다. 표를 고치다 코드 한 줄을 지우면 「절 29곳」이
//    조용히 사라지는데, 화면을 봐도 티가 안 난다 — 숫자로 잡는다.
//    88% 로 둔 이유: 93% 에서 5%p 여유. 새 도시가 들어오면 조금 떨어질 수 있다.
const MIN_COVER = 0.88;
let bad = 0;

for (const f of files) {
  const pool = JSON.parse(readFileSync(join(DIR, f), "utf8"));
  // 🏙️ 이 파일이 어느 도시 것인가 — 파일 이름의 번호가 관광공사 지역 번호다.
  //    도시를 알아야 **바다가 있는지**를 알고, 그래야 바다 갈래를 막을 수 있다.
  const area = f.match(/^survey-(\d+)\.json$/)[1];
  const city = cityByArea(area);
  if (!city) {
    console.error(`❌ ${f} — 지역 번호 ${area} 가 cities.ts 에 없다. 명부에 먼저 넣을 것.`);
    bad++;
    continue;
  }
  const hit = new Map();
  const unknown = [];
  let skipped = 0;
  for (const it of pool) {
    const { category, why } = categoryOf(it, { coast: city.coast });
    if (category) hit.set(category, (hit.get(category) ?? 0) + 1);
    else if (why.startsWith("제외")) skipped++;
    else unknown.push(`${it.title}  ← ${why}`);
  }
  const counted = [...hit.values()].reduce((a, b) => a + b, 0);
  const judged = pool.length - skipped;           // 제외한 것은 분모에서 뺀다
  const cover = judged ? counted / judged : 0;
  console.log(`\n📋 ${f} — ${city.ko} ${pool.length}곳 (관광객 대상 아님 ${skipped}곳 제외${city.coast ? "" : " · 바다 없는 도시"})`);
  for (const [k, n] of [...hit].sort((a, b) => b[1] - a[1]))
    console.log(`   ${k.padEnd(9)} ${String(n).padStart(4)}곳`);
  console.log(`   ${"── 갈린 곳".padEnd(9)} ${String(counted).padStart(4)} / ${judged}곳  (${Math.round(cover * 100)}%)`);
  if (unknown.length) {
    console.log(`   ⬜ 아직 모르는 곳 ${unknown.length}곳 — **억지로 넣지 않는다**:`);
    for (const u of unknown.slice(0, 40)) console.log(`      ${u}`);
    if (unknown.length > 40) console.log(`      … 그리고 ${unknown.length - 40}곳 더`);
  }
  if (cover < MIN_COVER) {
    console.error(`   ❌ ${Math.round(MIN_COVER * 100)}% 아래로 떨어졌다 — 표에서 무언가 빠졌다.`);
    bad++;
  }
}

console.log(`\n표에 적힌 코드 ${CODE_TO_CATEGORY.size}개 · 제외 코드 ${SKIP_CODES.size}개`);
process.exit(bad ? 1 : 0);
