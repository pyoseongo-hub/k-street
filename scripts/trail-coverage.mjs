#!/usr/bin/env node
// 🥾 걷는 길(등산로·산책길)을 **구마다 한 자리씩** 놓고 채워진 곳·빈 곳을 보여 준다.
//
// 사용자 지시(2026-09-02): "둘레길 사진 엄청 많던데 구마다 자리 만들어 등록해".
//
// 왜 자리부터 만드나 — Kfood에서 배운 것이다. 서울 법정동을 등록하기 전에는
// "빈 동네 0"이라고 나왔다. 채운 게 아니라 **셀 칸이 아예 없었던 것**이다.
// 볼 자리를 안 만들면 빈 곳이 안 보인다. 25개 구를 먼저 늘어놓고 세야
// "어디가 비었나"가 드러난다.
//
//   node scripts/trail-coverage.mjs          # 화면에만
//   node scripts/trail-coverage.mjs --save   # docs/걷는길-현황.md 에 저장

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const D = (f) => join(__dirname, "..", "src", "data", f);
const OUT = join(__dirname, "..", "docs", "걷는길-현황.md");
const SAVE = process.argv.includes("--save");

const GU = [
  "종로구", "중구", "용산구", "성동구", "광진구", "동대문구", "중랑구", "성북구",
  "강북구", "도봉구", "노원구", "은평구", "서대문구", "마포구", "양천구", "강서구",
  "구로구", "금천구", "영등포구", "동작구", "관악구", "서초구", "강남구", "송파구",
  "강동구",
];

const nfc = (s) => String(s ?? "").normalize("NFC");

// ── 사람이 적은 곳 ────────────────────────────────────────────
const seedSrc = readFileSync(D("seed.ts"), "utf-8");
const places = [];
let seq = 0;
for (const line of seedSrc.split("\n")) {
  if (!/id:\s*id\(\)/.test(line)) continue;
  seq++;
  const pick = (k) => line.match(new RegExp(`${k}: "([^"]+)"`))?.[1];
  const name = pick("name");
  const category = pick("category");
  if (!name || (category !== "hike" && category !== "walk")) continue;
  // 자리표시자는 값이 아니라 빈 칸이다(seed.ts의 isPlaceholder와 같은 기준).
  if (/confirmed:\s*false/.test(line)) continue;
  places.push({ name, gu: pick("gu") ?? "", category, from: "사람", photo: false });
}

// ── 관광공사 ────────────────────────────────────────────────
const tourRaw = JSON.parse(readFileSync(D("tour-places-raw.json"), "utf-8"));
for (const category of ["hike", "walk"]) {
  for (const p of tourRaw[category] ?? []) {
    if (!p.gu) continue;
    places.push({ name: p.name, gu: p.gu, category, from: "관광공사", photo: Boolean(p.image) });
  }
}

// ── 사진 여러 장(갤러리) ────────────────────────────────────
const gallery = JSON.parse(readFileSync(D("tour-gallery.json"), "utf-8"));
const shotsByName = new Map();
for (const e of Object.values(gallery)) {
  if (e.name) shotsByName.set(nfc(e.name), (e.photos ?? []).length);
}

// ── 구마다 한 자리 ──────────────────────────────────────────
const rows = GU.map((gu) => {
  const mine = places.filter((p) => p.gu === gu);
  const hike = mine.filter((p) => p.category === "hike");
  const walk = mine.filter((p) => p.category === "walk");
  const shots = mine.reduce((s, p) => s + (shotsByName.get(nfc(p.name)) ?? 0), 0);
  return { gu, hike, walk, shots, total: mine.length };
});

const empty = rows.filter((r) => r.total === 0);
const noShots = rows.filter((r) => r.total > 0 && r.shots === 0);

console.log(`걷는 길(등산로·산책길) — 25개 구 자리\n`);
for (const r of rows) {
  const mark = r.total === 0 ? "🟥" : r.shots === 0 ? "🟨" : "🟩";
  console.log(
    `${mark} ${r.gu.padEnd(7)} 등산로 ${String(r.hike.length).padStart(2)} · 산책길 ${String(r.walk.length).padStart(2)}` +
      `   사진 ${String(r.shots).padStart(3)}장`
  );
  for (const p of [...r.hike, ...r.walk]) {
    const n = shotsByName.get(nfc(p.name)) ?? 0;
    console.log(`      ${n ? `📷${String(n).padStart(2)}` : "  ⬜"}  ${p.name}  (${p.from})`);
  }
}

const totalShots = rows.reduce((s, r) => s + r.shots, 0);
console.log(`\n합계 — 장소 ${places.length}곳 · 사진 ${totalShots}장`);
console.log(`🟥 아예 빈 구 ${empty.length}곳${empty.length ? ": " + empty.map((r) => r.gu).join(", ") : ""}`);
console.log(`🟨 있지만 사진 0장 ${noShots.length}곳${noShots.length ? ": " + noShots.map((r) => r.gu).join(", ") : ""}`);

if (!SAVE) {
  console.log("\n저장하려면 --save 를 붙이세요 → docs/걷는길-현황.md");
  process.exit(0);
}

const today = new Date().toISOString().slice(0, 10);
const md = `# 걷는 길 — 구마다 한 자리

\`node scripts/trail-coverage.mjs --save\` 로 다시 만든다. **손으로 고치지 말 것.**
마지막 갱신: ${today}

사용자 지시(2026-09-02): "둘레길 사진 엄청 많던데 구마다 자리 만들어 등록해".

**왜 자리부터 만드나** — Kfood에서 배운 것이다. 서울 법정동을 등록하기 전에는
"빈 동네 0"이라고 나왔다. 채운 게 아니라 **셀 칸이 아예 없었던 것**이다.
25개 구를 먼저 늘어놓고 세야 어디가 비었는지 드러난다.

| | 곳 |
|---|---|
| 장소 | ${places.length}곳 (등산로 ${places.filter((p) => p.category === "hike").length} · 산책길 ${places.filter((p) => p.category === "walk").length}) |
| 사진 | ${totalShots}장 |
| 🟥 아예 빈 구 | **${empty.length}곳** |
| 🟨 있지만 사진 0장 | **${noShots.length}곳** |

| 구 | 등산로 | 산책길 | 사진 | 상태 |
|---|---|---|---|---|
${rows
  .map(
    (r) =>
      `| ${r.gu} | ${r.hike.length} | ${r.walk.length} | ${r.shots}장 | ${
        r.total === 0 ? "🟥 빈 칸" : r.shots === 0 ? "🟨 사진 없음" : "🟩"
      } |`
  )
  .join("\n")}

---

## 구마다 무엇이 들어 있나

${rows
  .map((r) => {
    const list = [...r.hike, ...r.walk];
    if (!list.length) return `### ${r.gu}\n\n🟥 **비어 있다.**\n`;
    return (
      `### ${r.gu}\n\n` +
      list
        .map((p) => {
          const n = shotsByName.get(nfc(p.name)) ?? 0;
          return `- ${n ? `📷 ${n}장` : "⬜ 사진 없음"} — ${p.name} *(${p.from}, ${p.category === "hike" ? "등산로" : "산책길"})*`;
        })
        .join("\n") + "\n"
    );
  })
  .join("\n")}
`;

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, md);
console.log(`\n저장: ${OUT}`);
