#!/usr/bin/env node
// 🧳 **또타러기지 6곳의 역 좌표를 받아 둔다.** (2026-09-11)
//
// 사장님: "서울시 교통공사는 따로 카드해서 버튼 만들어줘 / 6군데 버튼 만들어"
//
// 단추를 누르면 **길찾기 화면**이 떠야 한다. 좌표가 없으면 카카오·네이버는
// 길찾기가 아니라 **검색 결과 화면**만 띄운다(mapLinks.ts 주석 참고).
// 그래서 좌표가 필요하다.
//
// 🚨 **어제 여기서 틀렸다.** 이름이 정확히 안 맞을 때 앞글자만 같으면 받아들이게
//    해 뒀더니 서울역 자리에 **「서울역 GTX-A」**가 들어왔다. 같은 이름으로 시작하는
//    다른 역이 수두룩하다(공항철도·GTX·경의중앙선).
//
// 🔑 고친 방법: **호선까지 넣어서 묻는다.** 우리는 지점마다 호선을 알고 있다
//    (서울역 1호선 · 홍대입구역 2호선 …). 카카오 지역검색의 역 이름도
//    「서울역 1호선」 꼴이라 이걸로 정확히 맞출 수 있다.
// 🚨 여섯 곳을 다 못 받으면 **저장하지 않는다.** 반쪽 자료는 화면에서 한 곳을
//    조용히 사라지게 만든다.
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

const { OFFICIAL_BRANCHES } = await import("../dist-ssr/luggageFacts.js").catch(() => ({ OFFICIAL_BRANCHES: null }));
if (!OFFICIAL_BRANCHES) {
  console.error("❌ dist-ssr/luggageFacts.js 가 없다. 먼저 이걸 돌려야 한다:");
  console.error("   npx vite build --ssr src/lib/luggageFacts.ts --outDir dist-ssr");
  process.exit(1);
}

/** 받은 것과 못 받은 것을 가른다 — 섞으면 「없다」고 잘못 적는다. */
async function kakao(query) {
  const url =
    "https://dapi.kakao.com/v2/local/search/keyword.json?" +
    new URLSearchParams({ query, category_group_code: "SW8", size: "15" });
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

console.log(`🧳 또타러기지 ${OFFICIAL_BRANCHES.length}곳의 역 좌표를 찾는다 (호선까지 맞춰서)\n`);

for (const b of OFFICIAL_BRANCHES) {
  const want = `${b.station} ${b.line}호선`;
  const r = await kakao(want);
  if (!r.got) {
    failed++;
    console.log(`   ❌ ${want} — 카카오에 **못 물어봤다** (${r.why}). 없다는 뜻이 아니다`);
    continue;
  }
  if (!r.ok) {
    failed++;
    console.log(`   ❌ ${want} — ${r.why}`);
    continue;
  }
  // 🚨 **이름이 정확히 「역이름 N호선」인 것만** 쓴다. 앞글자만 같은 것은 안 받는다 —
  //    어제 그 느슨함 때문에 「서울역 GTX-A」가 들어왔다.
  const hit = r.docs.find((d) => d.place_name === want);
  if (!hit) {
    failed++;
    console.log(`   ❌ ${want} — 이름이 정확히 맞는 역이 없다.\n        받은 것: ${r.docs.map((d) => d.place_name).join(" · ") || "없음"}`);
    continue;
  }
  out.push({
    line: b.line,
    station: b.station,
    floor: b.floor,
    exit: b.exit,
    lat: Number(hit.y),
    lng: Number(hit.x),
    // 🔎 카카오가 준 이름을 그대로 남긴다 — 나중에 의심스러울 때 되짚을 수 있어야 한다
    kakaoName: hit.place_name,
  });
  console.log(`   ✅ ${want.padEnd(14)} ${hit.y} , ${hit.x}`);
}

console.log(`\n찾은 곳 ${out.length} / ${OFFICIAL_BRANCHES.length}`);
if (failed) console.log(`❌ 못 받은 곳 ${failed} — 다시 돌릴 것`);

if (APPLY) {
  if (out.length !== OFFICIAL_BRANCHES.length) {
    console.error("❌ 여섯 곳을 다 못 받았다. **반쪽 자료는 저장하지 않는다** — 화면에서 한 곳이 조용히 사라진다.");
    process.exit(1);
  }
  writeFileSync(
    OUT,
    JSON.stringify({ 받은날: new Date().toISOString().slice(0, 10), 출처: "카카오 지역검색 (SW8) — 「역이름 N호선」 정확히 일치한 것만", 곳: out }, null, 2) + "\n",
  );
  console.log(`\n📄 ${OUT} 에 ${out.length}곳을 적었다.`);
} else {
  console.log("\n(맛보기였다. 파일에 쓰려면 --apply)");
}
