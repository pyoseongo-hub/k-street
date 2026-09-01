#!/usr/bin/env node
// 🎪 축제를 하나씩 훑어 **빈 칸 두 가지**를 센다 (사용자 지시 2026-09-01:
// "계절별 축제 하나씩 맵 매치되나 확인하고 / 매칭 안 되는 거 정리 보고 /
//  사진 없는 축제도 정리해서 저장 / 내일부터 두 개 해결한다").
//
// 무엇을 보나 —
//   ① 지도 매칭(좌표) — 좌표가 있어야 길찾기 버튼이 **출발지·목적지가 채워진**
//      화면으로 바로 간다. 없으면 '검색' 화면으로 떨어져 손님이 한 번 더 골라야 한다.
//   ② 사진 — 없으면 카드에 계절 그림이 대신 그려진다. 그림도 봐줄 만하지만
//      실제 사진만은 못하다.
//
// 결과는 화면에 요약하고, 같은 내용을 **docs/축제-빈칸.md**에 표로 저장한다.
// 내일부터 그 파일을 보며 하나씩 지워 나가면 된다.
//
//   node scripts/audit-festivals.mjs          # 보기만
//   node scripts/audit-festivals.mjs --save   # docs/축제-빈칸.md 에 저장
//
// ⚠️ seed.ts의 ALL_FESTIVALS와 **같은 방식으로** 합친다(사람 33곳 + 관광공사 57곳,
//    이름이 같으면 사람 것을 남기고 관광공사에서 사진·좌표만 덧입힘). 합치는 규칙이
//    두 곳에 있으면 언젠가 어긋난다 — seed.ts를 고치면 여기도 같이 고칠 것.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const D = (f) => join(__dirname, "..", "src", "data", f);
const OUT = join(__dirname, "..", "docs", "축제-빈칸.md");

const SAVE = process.argv.includes("--save");

const seedSrc = readFileSync(D("seed.ts"), "utf-8");
const tourRaw = JSON.parse(readFileSync(D("tour-places-raw.json"), "utf-8"));
const dates = JSON.parse(readFileSync(D("festival-dates.json"), "utf-8"));
const coords = JSON.parse(readFileSync(D("coords.json"), "utf-8"));

const nfc = (s) => String(s ?? "").normalize("NFC");
const pick = (line, key) => line.match(new RegExp(`${key}: "([^"]+)"`))?.[1];
const num = (line, key) => {
  const v = line.match(new RegExp(`${key}: (-?[\\d.]+)`))?.[1];
  return v == null ? null : Number(v);
};

// ── 사람이 조사한 축제 (seed.ts) ──────────────────────────────────
// id는 파일에 나오는 순서대로 ks_1, ks_2… 로 매겨진다(seed.ts의 id() 함수).
const hand = [];
let seq = 0;
for (const line of seedSrc.split("\n")) {
  if (!/id:\s*id\(\)/.test(line)) continue;
  seq++;
  if (pick(line, "category") !== "festival") continue;
  const id = `ks_${seq.toString(36)}`;
  hand.push({
    id,
    name: pick(line, "name") ?? "",
    gu: pick(line, "gu") ?? "",
    startMonth: num(line, "startMonth"),
    endMonth: num(line, "endMonth"),
    lat: num(line, "lat") ?? coords[id]?.lat ?? null,
    image: null, // seed.ts에는 사진이 없다 — 전부 관광공사에서 온다
    from: "사람",
  });
}

// ── 관광공사 축제 ────────────────────────────────────────────────
const tour = (tourRaw.festival ?? []).map((p) => {
  const d = dates[p.contentId];
  return {
    id: `tour_${p.contentId}`,
    name: p.name,
    gu: p.gu ?? "",
    startMonth: d?.startMonth ?? null,
    endMonth: d?.endMonth ?? null,
    lat: p.lat ?? null,
    image: p.image ?? null,
    from: "관광공사",
  };
});

// ── 합치기 (seed.ts의 ALL_FESTIVALS와 같은 규칙) ──────────────────
const byName = new Map(tour.map((p) => [nfc(p.name), p]));
const used = new Set();
const merged = hand.map((h) => {
  const t = byName.get(nfc(h.name));
  if (!t) return h;
  used.add(t.id);
  return {
    ...h,
    // 사람이 적은 값이 이긴다. 관광공사에서는 빈 칸만 채워 온다.
    lat: h.lat ?? t.lat,
    image: h.image ?? t.image,
    startMonth: h.startMonth ?? t.startMonth,
    endMonth: h.endMonth ?? t.endMonth,
    from: "사람+관광공사",
  };
});
const all = [...merged, ...tour.filter((t) => !used.has(t.id))];

// ── 계절 ─────────────────────────────────────────────────────────
const SEASONS = [
  { key: "봄", months: [3, 4, 5] },
  { key: "여름", months: [6, 7, 8] },
  { key: "가을", months: [9, 10, 11] },
  { key: "겨울", months: [12, 1, 2] },
];
const seasonOf = (m) =>
  m == null ? null : SEASONS.find((s) => s.months.includes(m))?.key ?? null;

for (const f of all) {
  f.season = seasonOf(f.startMonth);
  f.hasCoord = f.lat != null;
  f.hasPhoto = Boolean(f.image);
}

const noCoord = all.filter((f) => !f.hasCoord);
const noPhoto = all.filter((f) => !f.hasPhoto);
const noMonth = all.filter((f) => f.startMonth == null);

// ── 화면 요약 ────────────────────────────────────────────────────
const pct = (n) => `${Math.round((n / all.length) * 100)}%`;
console.log(`축제 전체 ${all.length}곳`);
console.log(`  🗺️ 지도 매칭(좌표 있음) ${all.length - noCoord.length}곳 (${pct(all.length - noCoord.length)}) — 없음 ${noCoord.length}곳`);
console.log(`  📷 사진 있음            ${all.length - noPhoto.length}곳 (${pct(all.length - noPhoto.length)}) — 없음 ${noPhoto.length}곳`);
if (noMonth.length) console.log(`  📅 열리는 달 모름        ${noMonth.length}곳 — 계절 화면에 아예 안 나온다`);
console.log("");

console.log("계절별");
for (const { key } of SEASONS) {
  const g = all.filter((f) => f.season === key);
  if (!g.length) {
    console.log(`  ${key.padEnd(3)} 0곳`);
    continue;
  }
  const c = g.filter((f) => !f.hasCoord).length;
  const p = g.filter((f) => !f.hasPhoto).length;
  console.log(`  ${key.padEnd(3)} ${String(g.length).padStart(2)}곳 — 좌표 없음 ${c} · 사진 없음 ${p}`);
}
console.log("");

const listOf = (arr) =>
  arr
    .slice()
    .sort((a, b) => (a.startMonth ?? 99) - (b.startMonth ?? 99) || a.gu.localeCompare(b.gu, "ko"))
    .map((f) => `  · ${(f.startMonth ? f.startMonth + "월" : "달모름").padEnd(5)} ${f.gu.padEnd(5)} ${f.name}`)
    .join("\n");

console.log(`🗺️ 지도에 못 붙는 축제 ${noCoord.length}곳 (길찾기가 '검색' 화면으로 떨어진다)`);
console.log(listOf(noCoord));
console.log("");
console.log(`📷 사진 없는 축제 ${noPhoto.length}곳 (카드에 계절 그림이 대신 나온다)`);
console.log(listOf(noPhoto));

// ── 파일로 저장 ──────────────────────────────────────────────────
if (!SAVE) {
  console.log("");
  console.log("저장하려면 --save 를 붙이세요 → docs/축제-빈칸.md");
  process.exit(0);
}

const today = new Date().toISOString().slice(0, 10);
const row = (f) =>
  `| ${f.startMonth ? f.startMonth + "월" : "—"} | ${f.season ?? "—"} | ${f.gu} | ${f.name} | ${f.from} |`;
const table = (arr) =>
  ["| 달 | 계절 | 구 | 축제 | 출처 |", "|---|---|---|---|---|"]
    .concat(
      arr
        .slice()
        .sort((a, b) => (a.startMonth ?? 99) - (b.startMonth ?? 99) || a.gu.localeCompare(b.gu, "ko"))
        .map(row)
    )
    .join("\n");

const md = `# 축제 빈 칸 — 내일부터 채울 목록

\`node scripts/audit-festivals.mjs --save\` 로 다시 만든다. **손으로 고치지 말 것** — 다시 돌리면 덮어쓴다.
마지막 갱신: ${today}

축제 전체 **${all.length}곳** (사람 조사 ${hand.length} + 관광공사 ${tour.length}, 이름이 같은 ${used.size}곳은 하나로 합침)

| 무엇 | 채워진 것 | 빈 것 |
|---|---|---|
| 🗺️ 지도 매칭(좌표) | ${all.length - noCoord.length}곳 | **${noCoord.length}곳** |
| 📷 사진 | ${all.length - noPhoto.length}곳 | **${noPhoto.length}곳** |
| 📅 열리는 달 | ${all.length - noMonth.length}곳 | **${noMonth.length}곳** |

계절별 — ${SEASONS.map((s) => {
  const g = all.filter((f) => f.season === s.key);
  return `${s.key} ${g.length}곳(좌표 없음 ${g.filter((f) => !f.hasCoord).length}·사진 없음 ${g.filter((f) => !f.hasPhoto).length})`;
}).join(" · ")}

---

## 🗺️ 지도에 못 붙는 축제 ${noCoord.length}곳

좌표가 없으면 길찾기 버튼이 **출발지·목적지가 찍힌 화면**이 아니라 '검색' 화면으로 떨어진다.

**왜 자동으로 안 채워지나** — 전부 사람이 조사한 축제인데, **행사 이름만 있고 열리는 장소가
안 정해져 있다.** "강남페스티벌"을 지도에 검색해도 나오는 장소가 없다. 축제는 며칠만 열리는
행사라 지도에 상호로 등록되지 않기 때문이다(2026-09-01 사용자 캡처로 확인한 그 문제).

**채우는 법** — 앱에서 그 축제 이름을 누르면 네이버 통합검색 → 그 구청의 공식 행사 안내로 간다.
거기 적힌 장소(예: "서울숲 가족마당")를 네이버 지도에서 찾아 좌표를 얻고, \`seed.ts\`의 그
항목에 \`lat\`·\`lng\`를 적는다.

${table(noCoord)}

---

## 📷 사진 없는 축제 ${noPhoto.length}곳

사진이 없으면 카드에 계절 그림이 대신 그려진다(빈 칸이 생기지는 않는다).

**🚨 아무 사진이나 쓰면 안 된다.** 공공기관이 **공공누리**로 공개한 사진만 쓴다.
블로그·인스타·구글 이미지 검색 결과는 전부 남의 저작물이다. 출처와 이용 조건을 못 적으면
아예 넣지 않는다 — \`src/lib/manualPhotos.ts\`가 그 두 칸이 없는 항목을 코드로 걸러낸다.

**채우는 법** — 구청 문화관광 페이지에서 공공누리 표시가 있는 사진을 찾아
\`src/data/manual-photos.json\`에 넣는다. 틀은 \`npm run photo-todo\` 가 찍어 준다.

${table(noPhoto)}

---

## 📅 열리는 달을 모르는 축제 ${noMonth.length}곳

**이 축제들은 계절 화면에 아예 안 나온다.** 화면이 달로 거르는데 달이 없기 때문이다.
위 두 가지(좌표·사진)보다 **먼저 채우는 게 낫다** — 채우는 즉시 그 달 목록에 나타난다.

**채우는 법** — 구청 안내에서 "매년 ○월"을 확인해 \`seed.ts\`의 그 항목에
\`startMonth\`(필요하면 \`endMonth\`)를 적는다. 날짜까지는 필요 없다.
관광공사 축제 창구에 등록된 것이라면 매달 1일에 도는 **Fetch festival dates**가
저절로 채워 주기도 한다.

${table(noMonth)}
`;

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, md);
console.log("");
console.log(`저장: ${OUT}`);
