#!/usr/bin/env node
// 🧳 **또타러기지 6곳의 좌표를 받아 둔다.** (2026-09-10)
//
// 왜 (사장님):
//   "짐보관 누르면 가까운 타러기지 있으면 지하철역과 타러기지
//    페이지에 우리 카카오맵 목적지까지 안내하는 맵 버튼 두 개
//    ... 타러기지 없으면 지하철만 안내"
//
//   「가까운 또타러기지가 있나」를 답하려면 **그 6곳이 어디인지**를 알아야 한다.
//   공식 페이지는 역 이름만 준다(서울역·홍대입구역·잠실역·명동역·김포공항역·종로3가역).
//   좌표가 있어야 곳마다 거리를 잴 수 있다.
//
// 🚨 **또타러기지 자체를 검색하지 않는다.** 검색으로 나온 남의 가게를
//    「또타러기지」로 저장하면 손님을 엉뚱한 데로 보낸다 — 이 저장소가
//    사진·영상에서 이미 겪은 사고다. 우리가 아는 확실한 것은 **역 이름**이므로
//    역(SW8)만 찾고, 「그 역」이라고만 말한다. 층·출구는 공식 페이지 값을 쓴다.
//
//   KAKAO_REST_API_KEY=xxx node scripts/find-luggage-branches.mjs            # 맛보기
//   KAKAO_REST_API_KEY=xxx node scripts/find-luggage-branches.mjs --apply    # 파일에 씀

import { writeFileSync } from "node:fs";

const KEY = process.env.KAKAO_REST_API_KEY ?? "";
const APPLY = process.argv.includes("--apply");
const OUT = "src/data/luggage-branches.json";

if (!KEY) {
  console.error("❌ KAKAO_REST_API_KEY 가 없다. 워크플로에 시크릿을 넘겼는지 볼 것.");
  process.exit(1);
}

const { OFFICIAL_BRANCHES } = await import("../dist-ssr/luggage-official.js").catch(() => ({ OFFICIAL_BRANCHES: null }));
if (!OFFICIAL_BRANCHES) {
  console.error("❌ dist-ssr/luggage-official.js 가 없다. 먼저 이걸 돌려야 한다:");
  console.error("   npx vite build --ssr scripts/lib/luggage-official.ts --outDir dist-ssr");
  process.exit(1);
}

/** 받은 것과 못 받은 것을 가른다 — 섞으면 「없다」고 잘못 적는다. */
async function kakao(query) {
  const url =
    "https://dapi.kakao.com/v2/local/search/keyword.json?" +
    new URLSearchParams({ query, category_group_code: "SW8", size: "5" });
  try {
    const r = await fetch(url, { headers: { Authorization: `KakaoAK ${KEY}` }, signal: AbortSignal.timeout(20000) });
    const text = await r.text();
    if (!r.ok) return { got: true, ok: false, why: `HTTP ${r.status} — ${text.slice(0, 120)}` };
    return { got: true, ok: true, docs: JSON.parse(text).documents ?? [] };
  } catch (e) {
    return { got: false, ok: false, why: e?.cause?.code || e?.name || e?.message };
  }
}

const out = [];
let failed = 0;

console.log(`🧳 또타러기지 ${OFFICIAL_BRANCHES.length}곳의 역 좌표를 찾는다\n`);

for (const b of OFFICIAL_BRANCHES) {
  const r = await kakao(b.station);
  if (!r.got) {
    failed++;
    console.log(`   ❌ ${b.station} — 카카오에 **못 물어봤다** (${r.why}). 없다는 뜻이 아니다`);
    continue;
  }
  if (!r.ok) {
    failed++;
    console.log(`   ❌ ${b.station} — ${r.why}`);
    continue;
  }
  // 🚨 이름이 **정확히 그 역**인 것만 쓴다. 카카오는 비슷한 역도 같이 준다
  //    (「서울역」으로 물으면 「서울역사박물관」 같은 것이 섞인다).
  const hit = r.docs.find((d) => d.place_name === b.station) ?? r.docs.find((d) => d.place_name.startsWith(b.station));
  if (!hit) {
    failed++;
    console.log(`   ❌ ${b.station} — 이름이 맞는 역이 없다 (받은 것: ${r.docs.map((d) => d.place_name).join(" · ") || "없음"})`);
    continue;
  }
  out.push({
    line: b.line,
    station: b.station,
    floor: b.floor,
    exit: b.exit,
    lat: Number(hit.y),
    lng: Number(hit.x),
    kakaoName: hit.place_name, // 🔎 나중에 의심스러울 때 되짚을 수 있어야 한다
  });
  console.log(`   ✅ ${b.station.padEnd(8)} ${hit.y} , ${hit.x}   (카카오가 준 이름: ${hit.place_name})`);
}

console.log(`\n찾은 곳 ${out.length} / ${OFFICIAL_BRANCHES.length}`);
if (failed) console.log(`❌ 못 받은 곳 ${failed} — 다시 돌릴 것. **반쪽으로 저장하지 않는다**`);

if (APPLY) {
  if (out.length !== OFFICIAL_BRANCHES.length) {
    console.error("❌ 여섯 곳을 다 못 받았다. 반쪽 자료를 저장하면 화면에서 한 곳이 조용히 사라진다.");
    process.exit(1);
  }
  writeFileSync(OUT, JSON.stringify({ 받은날: new Date().toISOString().slice(0, 10), 출처: "카카오 지역검색 (SW8 지하철역) — 역 좌표만", 곳: out }, null, 2) + "\n");
  console.log(`\n📄 ${OUT} 에 ${out.length}곳을 적었다.`);
} else {
  console.log("\n(맛보기였다. 파일에 쓰려면 --apply)");
}
