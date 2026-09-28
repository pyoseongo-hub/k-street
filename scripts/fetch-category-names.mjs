#!/usr/bin/env node
// 🏷️ **분류 코드의 「진짜 이름」을 관광공사에 물어본다.**
//
// 사장님 (2026-09-28): *"분류 규칙을 손봐"*
//
// ── 왜 이게 먼저인가 ──────────────────────────────────────────────────
//   `scripts/lib/tour-categories.mjs` 는 코드마다 **제목 몇 개를 눈으로 보고**
//   뜻을 정했다. 그 방식으로 한 번 크게 틀렸다 —
//   A01010500 을 부산 표본 셋(「절영해안산책로」…)만 보고 **「해안 절경」**으로
//   읽어 beach 에 넣었는데, 서울 19곳은 **전부 내륙 공원**이었다.
//   그대로 갔으면 「바다·해변」 탭에 서울 동네 공원이 떴을 것이다.
//
//   관광공사는 **코드의 공식 이름을 준다.** 짐작할 이유가 없다.
//
// 🚨 **아무것도 안 고친다.** 이름을 받아 찍어 주기만 한다 —
//    표를 고치는 것은 사람이 한다(위 사고가 「기계가 정해 준 대로」 넣어서 난 게 아니라,
//    **표본이 적은 코드의 뜻을 단정해서** 났기 때문이다).
//
// ── 돌리는 법 ────────────────────────────────────────────────────────
//   TOUR_API_KEY=키 node scripts/fetch-category-names.mjs
//   TOUR_API_KEY=키 node scripts/fetch-category-names.mjs --codes A01010600,A01010200

import { fetchWithRetry } from "./lib/tour-fetch.mjs";

const KEY = process.env.TOUR_API_KEY;
if (!KEY) {
  console.error("❌ TOUR_API_KEY 가 없다.");
  process.exit(1);
}

const ROOT = "https://apis.data.go.kr/B551011/KorService2";
const argv = process.argv.slice(2);
const only = argv.includes("--codes")
  ? new Set(argv[argv.indexOf("--codes") + 1].split(",").map((s) => s.trim()).filter(Boolean))
  : null;

/** 🚨 serviceKey 는 URLSearchParams 에 안 넣는다 — 이미 인코딩된 값이라 깨진다. */
async function call(extra) {
  const params = new URLSearchParams({
    MobileOS: "ETC", MobileApp: "KStreet", _type: "json",
    numOfRows: "200", pageNo: "1", ...extra,
  });
  const res = await fetchWithRetry(`${ROOT}/categoryCode2?serviceKey=${KEY}&${params.toString()}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); }
  catch { throw new Error(`JSON 이 아니다 — 앞 200자: ${text.slice(0, 200)}`); }
  const items = data?.response?.body?.items?.item;
  return !items ? [] : Array.isArray(items) ? items : [items];
}

const names = new Map();   // 코드 → 이름
const lines = [];          // 사람이 읽을 줄

console.log("🏷️  관광공사 분류체계를 받는다 (대분류 → 중분류 → 소분류)\n");

for (const c1 of await call({})) {
  names.set(c1.code, c1.name);
  for (const c2 of await call({ cat1: c1.code })) {
    names.set(c2.code, c2.name);
    for (const c3 of await call({ cat1: c1.code, cat2: c2.code })) {
      names.set(c3.code, c3.name);
      if (only && !only.has(c3.code)) continue;
      lines.push(`${c3.code}  ${c1.name} › ${c2.name} › ${c3.name}`);
    }
  }
}

console.log(`받은 코드 ${names.size}개\n`);
for (const l of lines.sort()) console.log("  " + l);
if (only) {
  const missing = [...only].filter((c) => !names.has(c));
  if (missing.length) console.log("\n⚠️ 관광공사 목록에 없는 코드: " + missing.join(", "));
}
