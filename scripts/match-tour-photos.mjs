#!/usr/bin/env node
// 📷 사진이 없어 앱에서 가려진 곳을, **이미 받아 둔 관광공사 자료 풀**과 대조해 채운다.
//
// 왜 만들었나 (2026-09-02) —
// 좌표 17곳을 고치면서 배운 게 있다: **자료가 없는 게 아니라 이름이 안 맞아서**
// 못 쓰고 있었다. 사진도 똑같은지 세어 봤더니 그랬다.
//
//   src/data/tour-pool-all.json   858곳 — 그중 815곳이 사진을 가지고 있다
//   src/data/tour-places-raw.json 269곳 — 이름 규칙에 걸러지고 남은 것
//
// 589곳이 쓰이지 않고 있었고, 그 안에 우리가 가린 곳들이 들어 있었다.
// (예: "뚝섬한강공원 산책로"는 풀의 "뚝섬한강공원"과 같은 곳인데 이름이 달라 못 찾았다.)
//
// 🚨 저작권 — 관광공사 자료는 **공공누리 제1유형**이다(출처만 밝히면 상업적 이용 가능).
// 구청 보도자료는 대부분 제2·4유형(상업적 이용 금지)이라 쓸 수 없다 — 2026-09-02에
// 강남구청 페이지에서 확인했다. 그래서 자동으로 채우는 건 관광공사 것만 쓴다.
//
// 대조 잣대는 fetch-coords.mjs와 **같은 것**을 쓴다. 잣대가 둘이면 한쪽만 고쳐지고
// 다른 쪽에 같은 사고가 다시 난다(Kfood에서 겪은 '잣대가 둘이면 반쪽 적용' 문제).
//
//   node scripts/match-tour-photos.mjs          # 미리보기(파일 안 씀)
//   node scripts/match-tour-photos.mjs --apply  # manual-photos.json에 반영

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const D = (f) => join(__dirname, "..", "src", "data", f);
const MANUAL = D("manual-photos.json");

const APPLY = process.argv.includes("--apply");

const nfc = (s) => String(s ?? "").normalize("NFC");
const squash = (s) => nfc(s).replace(/[^가-힣a-zA-Z0-9]/g, "");

// fetch-coords.mjs와 같은 값. 덧붙은 글자가 이보다 길면 다른 곳으로 본다.
const EXTRA_CHARS_ALLOWED = 5;
// 이름만 빌려 쓴 다른 업종을 거른다(노량진수산시장 vs 노량진수산시장성당).
const FACILITY_WORDS = [
  "아파트", "성당", "교회", "사찰", "병원", "의원", "약국", "한의원",
  "상가", "빌딩", "타워", "오피스텔", "어린이집", "유치원",
  "학원", "편의점", "은행", "우체국", "주유소", "호텔", "모텔",
  "횟집", "식당", "카페", "치킨", "노래방", "PC방", "미용실",
];

/** 두 이름이 같은 곳인가. 정확히 같은 것 우선, 없으면 짧게 덧붙은 것만 인정. */
function sameName(candidate, target) {
  const a = squash(candidate);
  const t = squash(target);
  if (!a || !t) return false;
  if (a === t) return true;
  const [longer, shorter] = a.length >= t.length ? [a, t] : [t, a];
  if (shorter.length < 4) return false; // "이태원" 같은 3글자가 아무 데나 걸리는 걸 막는다
  if (!longer.includes(shorter)) return false;
  if (longer.length - shorter.length > EXTRA_CHARS_ALLOWED) return false;
  const extra = longer.replace(shorter, "");
  return !FACILITY_WORDS.some((w) => extra.includes(w));
}

// ── 지금 가려져 있는 곳 (seed.ts에 사진이 없고 manual-photos.json에도 없는 곳) ──
const seedSrc = readFileSync(D("seed.ts"), "utf-8");
const manual = JSON.parse(readFileSync(MANUAL, "utf-8"));

const hidden = [];
let seq = 0;
for (const line of seedSrc.split("\n")) {
  if (!/id:\s*id\(\)/.test(line)) continue;
  seq++;
  const pick = (k) => line.match(new RegExp(`${k}: "([^"]+)"`))?.[1];
  const id = `ks_${seq.toString(36)}`;
  const name = pick("name");
  if (!name) continue;
  if (/image:\s*"/.test(line) || manual[id]) continue;
  hidden.push({ id, name, gu: pick("gu") ?? "", category: pick("category") ?? "" });
}

// ── 관광공사 자료 풀 (거르기 전 원본) ──
const pool = JSON.parse(readFileSync(D("tour-pool-all.json"), "utf-8"));
const poolArr = (Array.isArray(pool) ? pool : Object.values(pool).flat()).filter((p) => p.image || p.thumb);

console.log(`사진 없어 가려진 곳 ${hidden.length}곳 · 관광공사 풀에서 사진 있는 것 ${poolArr.length}곳\n`);

const found = [];
const missing = [];
for (const h of hidden) {
  // ⚠️ 구가 같은 것 안에서만 찾는다. 이름이 같은 공원·시장이 서울에 여럿 있다
  //    (예: 중앙시장). 구 검사가 없으면 남의 동네 사진이 붙는다.
  const hit = poolArr.find((p) => p.gu === h.gu && sameName(p.name, h.name));
  if (hit) found.push({ ...h, hit });
  else missing.push(h);
}

const byCat = {};
for (const f of found) (byCat[f.category] ??= []).push(f);

console.log(`✅ 관광공사 사진으로 채울 수 있는 곳: ${found.length}곳`);
for (const [cat, arr] of Object.entries(byCat)) {
  console.log(`\n[${cat}] ${arr.length}곳`);
  for (const f of arr) {
    const same = squash(f.hit.name) === squash(f.name) ? "" : `  (풀 이름: ${f.hit.name})`;
    console.log(`   ${f.gu.padEnd(5)} ${f.name}${same}`);
  }
}
console.log(`\n⬜ 여전히 사람이 찾아야 하는 곳: ${missing.length}곳`);

if (!APPLY) {
  console.log("\n미리보기만 했다 — 반영하려면 --apply를 붙일 것.");
  process.exit(0);
}

for (const f of found) {
  manual[f.id] = {
    // 원본(image)을 썸네일보다 먼저 쓴다 — 2026-09-01 "사진 화질이 안 좋아".
    image: f.hit.image ?? f.hit.thumb,
    source: "한국관광공사",
    license: "공공누리 제1유형",
    pageUrl: `https://korean.visitkorea.or.kr/detail/ms_detail.do?cotid=${f.hit.contentId}`,
    // 사람이 찾은 것과 구분해 둔다. 나중에 이름 대조가 틀렸던 게 드러나면
    // 이 표시로 자동 매칭분만 골라 다시 볼 수 있다.
    auto: true,
    matchedName: f.hit.name,
  };
}
writeFileSync(MANUAL, JSON.stringify(manual, null, 2) + "\n");
console.log(`\nmanual-photos.json에 ${found.length}곳을 반영했다.`);
