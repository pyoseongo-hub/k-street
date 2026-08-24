// 🔍 seed.ts 자체 감사 — Kfood의 scripts/audit-seed.mjs와 같은 목적으로 만들었다.
// "확인 못 한 것은 넣지 않는다"는 원칙을 기계가 지켜지는지 검사한다.
//
// 검사 두 갈래:
//   ❌ 막아야 할 것(blocking) — 데이터 모순, id 충돌처럼 화면이 실제로 잘못될 수 있는 것.
//   ⚠️ 살펴볼 것(warning) — 커버리지 현황처럼 사람이 판단해서 다음 조사를 정할 것.
//
// 실행: node scripts/audit-seed.mjs

import { execSync } from "node:child_process";
import { writeFileSync, rmSync } from "node:fs";

// seed.ts는 TypeScript라 Node가 바로 import 못 한다 — esbuild로 즉석 변환한다.
const tmp = new URL("../.audit-seed.mjs", import.meta.url);
execSync(
  `npx esbuild src/data/seed.ts --bundle --format=esm --platform=node --outfile=${tmp.pathname}`,
  { cwd: new URL("..", import.meta.url).pathname, stdio: "pipe" }
);
const { ALL_PLACES, CATEGORY_META } = await import(tmp.href);
rmSync(tmp, { force: true });

const DISTRICTS = [
  "종로구", "중구", "용산구", "성동구", "광진구",
  "동대문구", "중랑구", "성북구", "강북구", "도봉구",
  "노원구", "은평구", "서대문구", "마포구", "양천구",
  "강서구", "구로구", "금천구", "영등포구", "동작구",
  "관악구", "서초구", "강남구", "송파구", "강동구",
];

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

// ❌ B2 — 알 수 없는 카테고리
add(
  blocking,
  "B2",
  "CATEGORY_META에 없는 카테고리",
  ALL_PLACES.filter((p) => !CATEGORY_META[p.category]).map((p) => `${p.id} ${p.category}`)
);

// ❌ B3 — 25개 구에 없는 자치구 이름 오타
add(
  blocking,
  "B3",
  "DISTRICTS 목록에 없는 자치구",
  ALL_PLACES.filter((p) => !DISTRICTS.includes(p.gu)).map((p) => `${p.id} "${p.gu}"`)
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

// ⚠️ W1 — 카테고리별 커버리지(25개 구 중 몇 곳 확인됐나)
{
  const lines = [];
  for (const cat of Object.keys(CATEGORY_META)) {
    const inCat = ALL_PLACES.filter((p) => p.category === cat);
    const confirmedGu = new Set(inCat.filter((p) => p.confirmed).map((p) => p.gu));
    const pct = Math.round((confirmedGu.size / DISTRICTS.length) * 100);
    lines.push(
      `${CATEGORY_META[cat].icon} ${CATEGORY_META[cat].label}: ${confirmedGu.size}/${DISTRICTS.length} (${pct}%)`
    );
  }
  add(warning, "W1", "카테고리별 커버리지", lines);
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
  for (const cat of Object.keys(CATEGORY_META)) {
    const gusInCat = new Set(ALL_PLACES.filter((p) => p.category === cat).map((p) => p.gu));
    for (const d of DISTRICTS) {
      if (!gusInCat.has(d)) missing.push(`${d} — ${CATEGORY_META[cat].label} 행 자체가 없음`);
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
