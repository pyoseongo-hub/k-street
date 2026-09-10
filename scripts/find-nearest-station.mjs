#!/usr/bin/env node
// 🚇 **곳마다 가장 가까운 지하철역을 찾아 둔다.** (2026-09-10)
//
// 왜 (사장님):
//   "가까운 지하철역 없으면 소비자가 알아야지 거긴 없구나 / 대부분 지하 타니 가까운 지하철"
//
//   이 한 줄이 막혀 있던 걸 풀었다. 나는 **또타라커 273개 역 목록**을 구하려고
//   공식 페이지를 뒤지고 있었는데(없었다), 사실 필요한 건 그게 아니었다:
//
//   · 손님은 대부분 지하철로 움직인다
//   · 또타라커는 **273개 역**에 있다 — 역을 알면 보관함은 거의 따라온다
//   · 그리고 **역이 멀면 「여긴 없구나」를 아는 것 자체가 쓸모**다.
//     빈칸이 아니라 **답**이다 — "미리 맡기고 오세요"가 되니까
//
// 🔑 역 목록이 필요 없다. 카카오에 **좌표를 주고 「가까운 지하철역」**을 물으면 된다.
//    category_group_code=SW8 이 지하철역이다.
//
// ⚠️ 여기서 가져오는 것은 **역과 거리**뿐이다. 그 역에 보관함이 있는지는
//    **모른다** — 273/약 340역이라 대부분 있지만 전부는 아니다.
//    화면에서 "있습니다"라고 하지 않는다. 그건 지어내는 것이다.
//
//   KAKAO_REST_API_KEY=xxx node scripts/find-nearest-station.mjs            # 맛보기
//   KAKAO_REST_API_KEY=xxx node scripts/find-nearest-station.mjs --apply    # 파일에 씀

import { writeFileSync } from "node:fs";

const KEY = process.env.KAKAO_REST_API_KEY ?? "";
const APPLY = process.argv.includes("--apply");
const OUT = "src/data/nearest-station.json";

if (!KEY) {
  console.error("❌ KAKAO_REST_API_KEY 가 없다. Actions 시크릿을 워크플로에 넘겼는지 볼 것.");
  process.exit(1);
}

// 곳과 좌표는 만들어 둔 파일에서 읽는다 (scripts/dump-place-coords 가 만든다).
const { PLACES } = await import("../dist-ssr/place-coords.js").catch(() => ({ PLACES: null }));
if (!PLACES) {
  console.error("❌ dist-ssr/place-coords.js 가 없다. 먼저 좌표를 뽑아야 한다:");
  console.error("   npx vite build --ssr scripts/dump-place-coords.ts --outDir dist-ssr");
  console.error("   node dist-ssr/dump-place-coords.js");
  process.exit(1);
}

/** 받은 것 / 못 받은 것을 갈라서 돌려준다 — 섞으면 "없다"고 잘못 적는다. */
async function kakao(params) {
  const url = `https://dapi.kakao.com/v2/local/search/category.json?${new URLSearchParams(params)}`;
  try {
    const r = await fetch(url, {
      headers: { Authorization: `KakaoAK ${KEY}` },
      signal: AbortSignal.timeout(20000),
    });
    const text = await r.text();
    if (!r.ok) return { got: true, ok: false, why: `HTTP ${r.status} — ${text.slice(0, 100)}` };
    return { got: true, ok: true, docs: JSON.parse(text).documents ?? [] };
  } catch (e) {
    return { got: false, ok: false, why: e?.cause?.code || e?.name || e?.message };
  }
}

// 1.5km 밖이면 "가깝다"고 할 수 없다. 캐리어를 끌고 갈 거리가 아니다.
const RADIUS = 1500;

const out = {};
let near = 0;
let far = 0;
let failed = 0;
const buckets = { 300: 0, 500: 0, 1000: 0, 1500: 0 };

console.log(`🚇 곳 ${PLACES.length}개의 가장 가까운 지하철역을 찾는다 (둘레 ${RADIUS}m)\n`);

for (const p of PLACES) {
  const r = await kakao({
    category_group_code: "SW8",
    x: String(p.lng),
    y: String(p.lat),
    radius: String(RADIUS),
    size: "1",
    sort: "distance",
  });

  if (!r.got) {
    failed++;
    console.log(`   ❌ ${p.name} — 카카오에 **못 물어봤다** (${r.why}). 역이 없다는 뜻이 아니다`);
    continue;
  }
  if (!r.ok) {
    failed++;
    console.log(`   ❌ ${p.name} — ${r.why}`);
    continue;
  }
  if (!r.docs.length) {
    far++;
    // 🚨 이건 **빈칸이 아니라 답**이다. 화면에서 "가까운 역이 없습니다"라고 말해 준다.
    out[p.id] = { none: true };
    continue;
  }

  const d = r.docs[0];
  const dist = Number(d.distance);
  for (const b of [300, 500, 1000, 1500]) {
    if (dist <= b) {
      buckets[b]++;
      break;
    }
  }
  near++;
  out[p.id] = {
    // 역 이름은 한국어 그대로 — 손님이 역 표지판에서 그 글자를 찾는다
    station: d.place_name,
    dist,
    lat: Number(d.y),
    lng: Number(d.x),
    url: d.place_url,
  };
}

console.log(`\n가까운 역이 있는 곳  ${near}`);
for (const b of [300, 500, 1000, 1500]) console.log(`   ${String(b).padStart(4)}m 안  ${buckets[b]}`);
console.log(`${RADIUS}m 안에 역이 없는 곳  ${far}   ← 이것도 답이다("미리 맡기고 오세요")`);
if (failed) console.log(`❌ 못 물어본 곳  ${failed}  — 다시 돌릴 것`);

if (APPLY) {
  writeFileSync(OUT, JSON.stringify({ 받은날: new Date().toISOString().slice(0, 10), 출처: "카카오 지역검색 (SW8 지하철역)", 곳: out }, null, 2) + "\n");
  console.log(`\n📄 ${OUT} 에 ${Object.keys(out).length}곳을 적었다.`);
} else {
  console.log("\n(맛보기였다. 파일에 쓰려면 --apply)");
}
