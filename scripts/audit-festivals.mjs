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
const venuesRaw = JSON.parse(readFileSync(D("festival-venues.json"), "utf-8"));

const nfc = (s) => String(s ?? "").normalize("NFC");

// 🎪 축제가 '실제로 열리는 곳' 표(festival-venues.json). 좌표가 없는 축제 중
// 이 표에 있는 것은 **다음 자동 실행이 알아서 채운다** — 사람이 할 일이 없다.
// 표에 없는 것만 사람이 장소를 확인해 표에 한 줄 넣으면 된다. 그 구분을 아래
// 목록에 표시해서, "17곳 남았다"는 숫자가 실제 할 일과 어긋나지 않게 한다.
const VENUES = new Set(
  Object.keys(venuesRaw)
    .filter((k) => !k.startsWith("_"))
    .map(nfc)
);
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
  // 🙈 사람이 "안 내보낸다"고 정한 것은 감사 대상이 아니다(Place.hidden).
  //    앱에 안 나오는 것을 "사진 없음·좌표 없음"으로 세면 할 일이 부풀어 보인다.
  if (/hidden: "/.test(line)) continue;
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
  f.hasVenue = VENUES.has(nfc(f.name));
}

const noCoord = all.filter((f) => !f.hasCoord);
// 좌표도 없고 장소표에도 없는 곳 — 여기만 사람 손이 필요하다.
const noCoordNoVenue = noCoord.filter((f) => !f.hasVenue);
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
console.log(
  `   그중 ${noCoord.length - noCoordNoVenue.length}곳은 장소표에 있어 자동으로 채워진다 — 사람 손이 필요한 건 ${noCoordNoVenue.length}곳`
);
console.log(listOf(noCoord));
console.log("");
console.log(`📷 사진 없는 축제 ${noPhoto.length}곳 (카드에 계절 그림이 대신 나온다)`);
console.log(listOf(noPhoto));

// ── 파일로 저장 ──────────────────────────────────────────────────
// 🔒 달의 근거가 없어 **계절 화면에서 가려진** 축제 (2026-09-02)
//
// 사용자 지시: "부정확한건 가리고 서치가 맞을때 개시".
// 같은 날 두 곳의 달이 틀린 걸 찾았다 — 한성백제문화제(10월→9월)와
// 허준축제(9월→10월). 둘 다 **근거 없이 적힌 값**이었다. 그래서 근거를 적은 것만
// 내보낸다. 출처를 확인해 seed.ts의 monthSource에 적으면 그날부터 다시 나온다.
{
  const seedSrc = readFileSync(D("seed.ts"), "utf-8");
  const hidden = [];
  for (const line of seedSrc.split("\n")) {
    if (!/category: "festival"/.test(line)) continue;
    if (!/startMonth: \d/.test(line)) continue; // 달이 없는 것은 원래 안 나온다
    // 사람이 "안 내보낸다"고 정한 것은 근거를 찾을 대상이 아니다(Place.hidden).
    if (/hidden: "/.test(line)) continue;
    if (/monthSource:/.test(line)) continue;
    const name = line.match(/name: "([^"]+)"/)?.[1];
    const gu = line.match(/gu: "([^"]+)"/)?.[1] ?? "";
    const m = line.match(/startMonth: (\d+)/)?.[1];
    hidden.push(`${gu.padEnd(6)} ${name} (${m}월)`);
  }
  console.log("");
  console.log(`🔒 달의 근거가 없어 가려진 축제 — ${hidden.length}곳`);
  if (hidden.length) {
    console.log("   (관광공사 축제 창구에도 있는 곳은 거기서 근거가 붙어 실제로는 나온다)");
    hidden.forEach((h) => console.log(`   · ${h}`));
    console.log("   → 출처를 확인해 seed.ts의 monthSource에 적으면 다시 나온다.");
  }
}


if (!SAVE) {
  console.log("");
  console.log("저장하려면 --save 를 붙이세요 → docs/축제-빈칸.md");
  process.exit(0);
}

const today = new Date().toISOString().slice(0, 10);
const row = (f, withVenue) =>
  `| ${f.startMonth ? f.startMonth + "월" : "—"} | ${f.season ?? "—"} | ${f.gu} | ${f.name} | ${f.from} |` +
  (withVenue ? ` ${f.hasVenue ? "🤖 자동" : "**사람이 확인**"} |` : "");
const table = (arr, withVenue = false) =>
  [
    `| 달 | 계절 | 구 | 축제 | 출처 |${withVenue ? " 장소표 |" : ""}`,
    `|---|---|---|---|---|${withVenue ? "---|" : ""}`,
  ]
    .concat(
      arr
        .slice()
        .sort((a, b) => (a.startMonth ?? 99) - (b.startMonth ?? 99) || a.gu.localeCompare(b.gu, "ko"))
        .map((f) => row(f, withVenue))
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

**왜 자동으로 안 채워졌나** — 좌표 채우기 스크립트가 **축제 이름으로** 지도를 검색하는데,
축제는 며칠만 열리는 '행사'라 지도에 등록된 '장소'가 아니다. "강남페스티벌"을 지도에서
검색하면 아무것도 안 나온다(2026-09-01 사용자 캡처로 확인한 그 문제).

**어떻게 바꿨나** (2026-09-02) — 축제마다 **실제로 열리는 곳**을 적어 둔 표를 만들었다:
\`src/data/festival-venues.json\` (예: 강남페스티벌 → 코엑스, 한성백제문화제 → 올림픽공원).
좌표 스크립트가 축제 이름 대신 이 장소를 검색하므로, 표에 있는 축제는 **매주 월요일 새벽
자동 실행이 알아서 채운다.** 아래 표의 '장소표' 칸이 🤖 자동이면 손댈 것이 없다.

**사람이 할 일** — '장소표' 칸이 **사람이 확인**인 것만. 앱에서 그 축제 이름을 누르면
네이버 통합검색 → 그 구청의 공식 행사 안내로 간다. 거기 적힌 장소(예: "서울숲 가족마당")를
\`festival-venues.json\`에 한 줄 넣으면 된다. 좌표를 손으로 적을 필요는 없다.
⚠️ 장소는 해마다 바뀌기도 하니, **여러 해 같은 곳에서 열린 것**만 넣는다.

${table(noCoord, true)}

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
