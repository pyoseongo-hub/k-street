#!/usr/bin/env node
// 🔁 같은 곳이 카드 두 장으로 뜨는 것을 찾아낸다 (2026-09-02 사용자 지적: "중복 검수").
//
// 사용자가 앱 화면에서 잡은 사고 —
//   성북구 9월 말  성북거리문화축제 <다다페스타>   ← 관광공사
//   성북구 9월     성북거리문화축제 다다페스타     ← 사람 조사
// **꺾쇠 < > 하나** 때문에 두 장이 됐다.
//
// 왜 생겼나 — seed.ts의 합치기가 이름을 **글자 하나까지 똑같을 때만** 같은 곳으로
// 봤다. 관광공사는 부제를 < >나 ( )로 묶고 띄어쓰기도 다르게 적는 일이 잦다.
//
// 지금은 합치기가 **기호·공백을 털어낸 이름**(tourPlaces.ts의 nameKey)으로 맞추고,
// 글자 자체가 다른 것만 name-aliases.json에 사람이 적는다. 이 검사는 그 두 장치가
// 실제로 듣는지 확인하고, **아직 안 붙은 것**만 남겨 보여 준다.
//
//   node scripts/audit-duplicates.mjs
//
// ⚠️ 찾은 것을 자동으로 지우지 않는다. 어느 쪽을 남길지는 사람이 정한다 — 사람이
//    적어 둔 note·기간이 관광공사 것보다 나은 경우가 많다.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const D = (f) => join(__dirname, "..", "src", "data", f);

const nfc = (s) => String(s ?? "").normalize("NFC");
// tourPlaces.ts의 nameKey와 **같은 규칙**이어야 한다. 여기가 어긋나면 검사기가
// "붙었다"고 말하는데 앱에서는 안 붙는 일이 생긴다.
const nameKey = (s) => nfc(s).replace(/[^가-힣a-zA-Z0-9]/g, "");

const aliasesRaw = JSON.parse(readFileSync(D("name-aliases.json"), "utf-8"));
const ALIASES = Object.fromEntries(
  Object.entries(aliasesRaw).filter(([k, v]) => !k.startsWith("_") && typeof v === "string")
);
// 이름이 닮았지만 **서로 다른 곳**이라고 사람이 확인해 둔 쌍. 매번 다시 고민하지 않게 한다.
const NOT_SAME = new Set(
  (aliasesRaw._다른곳 ?? []).map(([a, b]) => [nameKey(a), nameKey(b)].sort().join("|"))
);

// ── 사람이 적은 곳 (seed.ts) ──────────────────────────────────
const seedSrc = readFileSync(D("seed.ts"), "utf-8");
const hand = [];
let seq = 0;
for (const line of seedSrc.split("\n")) {
  if (!/id:\s*id\(\)/.test(line)) continue;
  seq++;
  const pick = (k) => line.match(new RegExp(`${k}: "([^"]+)"`))?.[1];
  const name = pick("name");
  if (!name) continue;
  hand.push({ id: `ks_${seq.toString(36)}`, name, gu: pick("gu") ?? "", category: pick("category") ?? "" });
}

// ── 관광공사 ────────────────────────────────────────────────
const tourRaw = JSON.parse(readFileSync(D("tour-places-raw.json"), "utf-8"));
const tour = [];
for (const [category, arr] of Object.entries(tourRaw)) {
  for (const p of arr) {
    if (!p.gu) continue; // 구를 못 찾은 항목은 앱이 애초에 안 쓴다
    tour.push({ id: `tour_${p.contentId}`, name: p.name, gu: p.gu, category });
  }
}

console.log(`장소 ${hand.length + tour.length}곳 (사람 ${hand.length} + 관광공사 ${tour.length})\n`);

// ── ① 지금 합치기가 실제로 붙이는 것 ──────────────────────────
const tourByKey = new Map(tour.map((p) => [nameKey(p.name), p]));
const mergedNow = [];
for (const h of hand) {
  const alias = ALIASES[nfc(h.name)];
  const t = (alias && tourByKey.get(nameKey(alias))) || tourByKey.get(nameKey(h.name));
  if (t) mergedNow.push({ h, t, via: alias && tourByKey.get(nameKey(alias)) ? "별명표" : "이름" });
}
console.log(`✅ 한 장으로 합쳐지는 곳: ${mergedNow.length}곳`);
for (const { h, t, via } of mergedNow) {
  if (nfc(h.name) === nfc(t.name)) continue; // 이름이 아예 같은 건 볼 것 없다
  console.log(`   [${h.category}] ${h.gu}  ${h.name}  =  ${t.name}   (${via})`);
}

// ── ② 아직 안 붙은 닮은 이름 ────────────────────────────────
// '한쪽이 다른 쪽을 품는' 느슨한 잣대로 훑어 사람이 볼 후보를 뽑는다.
// 합치기 자체를 이렇게 느슨하게 하면 안 된다(남구로시장·한복매장이 삼켜진다) —
// 그래서 **찾아서 보여만 주고** 붙이는 건 사람이 정한다.
const mergedTourIds = new Set(mergedNow.map(({ t }) => t.id));
const mergedHandIds = new Set(mergedNow.map(({ h }) => h.id));
const suspects = [];
for (const h of hand) {
  if (mergedHandIds.has(h.id)) continue;
  for (const t of tour) {
    if (mergedTourIds.has(t.id)) continue;
    if (h.gu !== t.gu || h.category !== t.category) continue;
    const a = nameKey(h.name);
    const b = nameKey(t.name);
    if (a === b) continue;
    const [longer, shorter] = a.length >= b.length ? [a, b] : [b, a];
    if (shorter.length < 4 || !longer.includes(shorter)) continue;
    if (longer.length - shorter.length > 6) continue;
    const pairKey = [a, b].sort().join("|");
    suspects.push({ h, t, known: NOT_SAME.has(pairKey) });
  }
}

const open = suspects.filter((s) => !s.known);
const known = suspects.filter((s) => s.known);

console.log(`\n⚠️ 아직 안 붙은 닮은 이름: ${open.length}쌍`);
if (open.length) {
  console.log("   같은 곳이면 name-aliases.json에, 다른 곳이면 그 파일의 _다른곳에 적으세요.\n");
  for (const { h, t } of open) {
    console.log(`  [${h.category}] ${h.gu}`);
    console.log(`      사람    : ${h.name}`);
    console.log(`      관광공사 : ${t.name}`);
  }
}

if (known.length) {
  console.log(`\nℹ️ 닮았지만 서로 다른 곳으로 확인해 둔 것: ${known.length}쌍 (그냥 두면 된다)`);
  for (const { h, t } of known) console.log(`   ${h.gu}  ${h.name}  ↔  ${t.name}`);
}

// ── ③ 한 출처 안에서의 중복 ──────────────────────────────────
// 위 ①②는 '사람 것 ↔ 관광공사 것'만 본다. 같은 목록 안에 같은 곳을 두 번 적어
// 둔 경우는 합치기가 아예 손대지 않으므로 따로 세어야 한다.
function selfDuplicates(list, label) {
  const seen = new Map();
  const dups = [];
  for (const p of list) {
    const key = `${p.gu}|${p.category}|${nameKey(p.name)}`;
    if (seen.has(key)) dups.push([seen.get(key), p]);
    else seen.set(key, p);
  }
  console.log(`\n🔂 ${label} 안에서 같은 이름이 두 번: ${dups.length}쌍`);
  for (const [a, b] of dups) {
    console.log(`   [${a.category}] ${a.gu}  ${a.name}  (${a.id} · ${b.id})`);
  }
  return dups.length;
}
const selfHand = selfDuplicates(hand, "사람 조사");
const selfTour = selfDuplicates(tour, "관광공사");

if (!open.length && !selfHand && !selfTour) console.log("\n✅ 사람이 볼 중복 없음");
