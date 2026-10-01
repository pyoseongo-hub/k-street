#!/usr/bin/env node
// 🗺️ **벌집 지도 배치를 조사 자료에서 뽑는다.**
//
// 사장님 (2026-10-01): *"같은 방법으로 제주 광주 대구 경주 대전 전주 강원도 순으로 만들어"*
//
// ── 왜 ───────────────────────────────────────────────────────────────
//   부산 배치는 **손으로 앉혔다**(cityHexMaps.ts 머리말). 16곳이라 가능했다.
//   강원 18 · 경북 22 · 전북 14를 손으로 앉히면 틀린다. 그리고 근거가 안 남는다.
//
//   조사 자료에 **곳마다 좌표가 들어 있다**(mapx·mapy). 시·군·구별로 평균을 내면
//   그게 그 동네의 자리다 — 손으로 찍는 것보다 정확하고, 왜 그 자리인지 설명된다.
//
// ── 🚨 「서구」가 「달서구」를 잡아먹는다 ────────────────────────────────
//   처음에 `주소.includes(단위)` 로 맞췄더니 **대구 달서구 31곳이 통째로 서구로**
//   갔다. "달서구".includes("서구") 가 참이기 때문이다.
//   → **긴 이름부터** 맞춘다. 같은 함정: 서울 중구/종로구, 경북 경주시/경산시.
//
// 🚨 **아무것도 안 고친다.** 붙여 넣을 토막을 찍어 줄 뿐이다 —
//    모양이 어색하면 사람이 줄을 바꾸면 된다(부산 주석에 적힌 그대로다).
//
// 돌리기: node scripts/make-hex-map.mjs --city gangwon
import { readFileSync } from "node:fs";
import { cityByKey } from "./lib/city-registry.mjs";

const args = process.argv.slice(2);
const argOf = (f) => { const i = args.indexOf(f); const v = i >= 0 ? args[i + 1] : undefined; return v && !v.startsWith("--") ? v : undefined; };
const KEY = argOf("--city");
if (!KEY) { console.error("❌ 쓰는 법: node scripts/make-hex-map.mjs --city gangwon"); process.exit(1); }

const city = cityByKey(KEY);
if (!city) { console.error(`❌ cities.ts 에 「${KEY}」가 없다.`); process.exit(1); }

const rows = JSON.parse(readFileSync(`src/data/survey-${city.areaCode}.json`, "utf8"));
// 긴 이름부터 — 위 「달서구」 함정.
const units = [...city.units].sort((a, b) => b.length - a.length);

const acc = new Map();
for (const r of rows) {
  const addr = String(r.addr1 ?? "");
  const u = units.find((u) => addr.includes(u));
  if (!u) continue;
  const lat = Number(r.mapy), lng = Number(r.mapx);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || !lat || !lng) continue;
  const e = acc.get(u) ?? { n: 0, lat: 0, lng: 0 };
  e.n++; e.lat += lat; e.lng += lng;
  acc.set(u, e);
}

const placed = [...acc].map(([gu, e]) => ({ gu, n: e.n, lat: e.lat / e.n, lng: e.lng / e.n }));
const missing = city.units.filter((u) => !acc.has(u));

// 🧭 위도로 줄을 나누고, 줄 안에서는 서→동 순으로 놓는다. 부산을 손으로 앉힌 방식과 같다.
const nRows = Math.max(1, Math.round(Math.sqrt(placed.length)));
const byLat = [...placed].sort((a, b) => b.lat - a.lat); // 북 → 남
const per = Math.ceil(byLat.length / nRows);
const lines = [];
for (let i = 0; i < nRows; i++) {
  const chunk = byLat.slice(i * per, (i + 1) * per).sort((a, b) => a.lng - b.lng);
  if (!chunk.length) continue;
  const offset = i % 2 === 0 ? "0.0" : "0.5";
  lines.push({ offset, chunk });
}

const NAME = `${KEY.toUpperCase()}_HEX_ROWS`;
console.log(`🗺️  ${city.ko} — 단위 ${city.units.length} · 자리를 얻은 곳 ${placed.length} · ${nRows}줄\n`);
if (missing.length) {
  console.log(`⬜ 조사 자료에 안 나온 곳 ${missing.length}: ${missing.join(", ")}`);
  console.log(`   → 아래 토막에 **안 들어간다.** 화면에서 빠지므로 사람이 줄 하나에 끼워 넣어야 한다.\n`);
}
for (const { offset, chunk } of lines) {
  console.log(`   ${offset}  ` + chunk.map((c) => `${c.gu}(${c.n})`).join(" · "));
}
console.log(`\n── 붙여 넣을 토막 ──────────────────────────────────────────`);
console.log(`const ${NAME}: HexRow[] = [`);
for (const { offset, chunk } of lines) {
  console.log(`  { offset: ${offset}, gus: [${chunk.map((c) => `"${c.gu}"`).join(", ")}] },`);
}
console.log(`];`);
console.log(`\n  ${KEY}: ${NAME},   ← HEX_ROWS_BY_CITY 에 더한다`);
