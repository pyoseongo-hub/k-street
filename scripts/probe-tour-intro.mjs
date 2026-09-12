// 🏪 **관광공사 `detailIntro` 를 찔러 본다** — 시장이 무엇을 파는가(판매품목).
//
// 사장님 지시 (2026-09-12):
//   "방산 시장 동대문 시장처럼 먹거리나 그런 것이 아닌 **특성화된 장소**도 있으니
//    시장 자료 올려줘야 해"
//
// 맞는 말이다. 지금 우리 목록은 이렇게만 나온다:
//     방산 종합시장   시장 · 중구 · 을지로4가역 2호선 · 252m
// 외국인이 이걸 보고 아는 것은 **아무것도 없다.** 그런데 방산시장은 포장재·인쇄·
// 제과 재료 전문이고, 동대문종합시장은 원단·부자재·한복이다. **그걸 알아야 안내다.**
//
// ─────────────────────────────────────────────────────────────────────────
// 🔎 `detailIntro` 가 무엇인가
// ─────────────────────────────────────────────────────────────────────────
//   우리가 이미 쓰는 TourAPI 의 **다른 창구**다. 곳 목록(areaBasedList)이 이름·주소·
//   사진을 준다면, 이쪽은 **그 곳의 속사정**을 준다. 갈래(contentTypeId)마다 칸이 다르다:
//     · 38 쇼핑 → **saleitem(판매품목)** · opentime · restdateshopping · parking · shopguide
//     · 12 관광지 → usetime · restdate · parking · expguide
//     · 14 문화시설 → usetimeculture · restdateculture · **usefee**
//   「영업시간·입장료는 우리가 모른다」고 접어 둔 칸이 여기서 풀릴 수 있다.
//
// 🚨 **찔러만 본다. 아무것도 저장하지 않는다.**
//    칸이 실제로 차 있는지, 값이 쓸 만한지를 **눈으로 보고** 나서 다음을 정한다.
//    「안 돌려 본 길은 안 도는 길」이고, **칸 이름만 보고 있다고 치면 그게 추측이다.**
//
// ⚠️ 인증키는 시크릿에서만 온다. 저장소에 한 글자도 안 적는다.

import { readFileSync } from "node:fs";
import { fetchWithRetry } from "./lib/tour-fetch.mjs";

const KEY = process.env.TOUR_API_KEY ?? "";
if (!KEY) {
  console.error("❌ TOUR_API_KEY 가 없다 — 워크플로에 시크릿을 넘겼는지 볼 것.");
  process.exit(1);
}
const HOW_MANY = Number(process.env.HOW_MANY || 6);

const raw = JSON.parse(readFileSync("src/data/tour-places-raw.json", "utf-8"));
const markets = (raw.market ?? []).filter((m) => m.contentId);
if (!markets.length) {
  console.error("❌ tour-places-raw.json 에 시장이 없다.");
  process.exit(1);
}

/**
 * 먼저 **어떤 갈래(contentTypeId)로 등록돼 있는지**부터 묻는다.
 * detailIntro 는 갈래를 같이 넘겨야 하고, 갈래를 틀리면 **빈 답이 온다** —
 * 그러면 「자료가 없다」로 잘못 읽는다. 없는 것과 잘못 물어본 것은 다르다.
 */
async function typeOf(contentId) {
  const url =
    `https://apis.data.go.kr/B551011/KorService2/detailCommon2` +
    `?serviceKey=${KEY}&MobileOS=ETC&MobileApp=KStreet&_type=json&contentId=${contentId}`;
  const r = await fetchWithRetry(url);
  const t = await r.text();
  try {
    const item = JSON.parse(t)?.response?.body?.items?.item;
    const one = Array.isArray(item) ? item[0] : item;
    return { ok: true, type: one?.contenttypeid, title: one?.title };
  } catch {
    return { ok: false, why: t.slice(0, 140).replace(/\s+/g, " ") };
  }
}

async function intro(contentId, contentTypeId) {
  const url =
    `https://apis.data.go.kr/B551011/KorService2/detailIntro2` +
    `?serviceKey=${KEY}&MobileOS=ETC&MobileApp=KStreet&_type=json` +
    `&contentId=${contentId}&contentTypeId=${contentTypeId}`;
  const r = await fetchWithRetry(url);
  const t = await r.text();
  try {
    const item = JSON.parse(t)?.response?.body?.items?.item;
    const one = Array.isArray(item) ? item[0] : item;
    return { ok: true, row: one ?? null };
  } catch {
    return { ok: false, why: t.slice(0, 140).replace(/\s+/g, " ") };
  }
}

/** 볼 만한 칸만 골라 보여 준다 — 전부 찍으면 무엇이 찼는지 안 보인다. */
const WANT = [
  "saleitem", "saleitemcost", "opentime", "restdateshopping",
  "parkingshopping", "shopguide", "scaleshopping", "restroom", "infocentershopping",
  "usetime", "restdate", "usefee", "parking",
];

console.log(`🏪 시장 ${markets.length}곳 중 ${HOW_MANY}곳만 찔러 본다\n`);

let filled = 0;
for (const m of markets.slice(0, HOW_MANY)) {
  console.log(`── ${m.name} (${m.gu}) · contentId ${m.contentId}`);
  const t = await typeOf(m.contentId);
  if (!t.ok) {
    console.log(`   ❌ 갈래를 못 물어봤다: ${t.why}\n`);
    continue;
  }
  console.log(`   갈래(contentTypeId) ${t.type ?? "?"} · 관광공사 이름 「${t.title ?? "?"}」`);
  if (!t.type) {
    console.log("");
    continue;
  }
  const r = await intro(m.contentId, t.type);
  if (!r.ok) {
    console.log(`   ❌ 속사정을 못 물어봤다: ${r.why}\n`);
    continue;
  }
  if (!r.row) {
    console.log("   · 답은 왔는데 **내용이 비어 있다**\n");
    continue;
  }
  let any = false;
  for (const k of WANT) {
    const v = String(r.row[k] ?? "").trim();
    if (!v) continue;
    any = true;
    // 관광공사 값에는 <br> 같은 표시가 섞여 온다 — 보기 좋게 한 줄로 줄인다.
    const clean = v.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").slice(0, 180);
    console.log(`   ✅ ${k.padEnd(20)} ${clean}`);
  }
  if (any) filled++;
  else console.log(`   · 우리가 보려는 칸은 다 비어 있다 (받은 칸: ${Object.keys(r.row).length}개)`);
  console.log("");
}

console.log(`\n칸이 찬 곳 ${filled}/${HOW_MANY}`);
console.log("🚨 저장한 것은 없다. 값을 보고 쓸지 정한다.");
