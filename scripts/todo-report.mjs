#!/usr/bin/env node
// 📋 **빈 칸 목록** — 사진 없는 곳과 좌표 없는 곳을 따로 뽑는다.
//
// 사용자 지시(2026-09-02): "전부 시도하고 이미지없는거 좌표없는 거 따로 정리해서
// 보고 해 순차적으로 채울께".
//
// 왜 따로 뽑나 — 채우는 방법이 다르기 때문이다.
//   · 좌표 없음 → 그 자리를 가리키는 **다른 이름**을 알려 주면 된다
//                 (festival-venues.json에 적으면 다음 실행이 자동으로 찾는다).
//   · 사진 없음 → 공공누리 1유형 사진을 **찾아 와야** 한다. 자동으로 안 된다.
// 두 목록을 섞으면 무엇을 해야 하는지가 흐려진다.
//
//   node scripts/todo-report.mjs          # 화면에만
//   node scripts/todo-report.mjs --save   # docs/빈칸-목록.md 에 저장
//
// ⚠️ 이 파일은 **다시 만들어지는 문서**다. 손으로 고치지 말 것.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const D = (f) => join(__dirname, "..", "src", "data", f);
const OUT = join(__dirname, "..", "docs", "빈칸-목록.md");
const SAVE = process.argv.includes("--save");

const read = (f) => JSON.parse(readFileSync(D(f), "utf-8"));
const coords = read("coords.json");
const manualPhotos = (() => {
  try {
    return read("manual-photos.json");
  } catch {
    return {};
  }
})();

const CAT_LABEL = {
  festival: "축제",
  market: "시장",
  flower: "꽃길",
  walk: "산책길",
  hike: "둘레길·등산로",
  museum: "박물관",
  street: "골목·거리",
};

// seed.ts에서 사람이 적은 곳을 읽는다. id는 파일에 적힌 순서대로 ks_1, ks_2… 이므로
// 같은 방식으로 세어야 coords.json의 열쇠와 맞는다(id 규칙이 바뀌면 여기도 바꿀 것).
const src = readFileSync(D("seed.ts"), "utf-8");
const places = [];
let seq = 0;
for (const line of src.split("\n")) {
  if (!/id: id\(\)/.test(line)) continue;
  seq++;
  const pick = (k) => line.match(new RegExp(`${k}: "([^"]+)"`))?.[1];
  // 자리표시자는 값이 아니라 빈 칸이다 — 채울 대상이 아니라 아직 조사가 안 된 것이다.
  if (/confirmed:\s*false/.test(line)) continue;
  places.push({
    id: `ks_${seq.toString(36)}`,
    name: pick("name"),
    gu: pick("gu") ?? "",
    category: pick("category") ?? "",
    hasInlineCoords: /\blat:\s*[0-9]/.test(line),
    hasImage: /\bimage:\s*"/.test(line),
  });
}

const hasCoords = (p) => p.hasInlineCoords || Boolean(coords[p.id]);
const hasPhoto = (p) => p.hasImage || Boolean(manualPhotos[p.id]);

const noCoords = places.filter((p) => !hasCoords(p));
const noPhoto = places.filter((p) => !hasPhoto(p));

/** 구 → 목록. 화면에서 한 구씩 훑어 채우기 좋게 묶는다. */
function byGu(list) {
  const m = new Map();
  for (const p of list) {
    if (!m.has(p.gu)) m.set(p.gu, []);
    m.get(p.gu).push(p);
  }
  return [...m.entries()].sort((a, b) => b[1].length - a[1].length);
}

function section(title, list, help) {
  const lines = [`## ${title} — ${list.length}곳`, "", help, ""];
  for (const [gu, l] of byGu(list)) {
    lines.push(`### ${gu} (${l.length})`);
    for (const p of l) lines.push(`- [ ] ${p.name}  *(${CAT_LABEL[p.category] ?? p.category})*`);
    lines.push("");
  }
  return lines.join("\n");
}

const today = new Date().toISOString().slice(0, 10);
const md = `# 빈 칸 목록 — 순차적으로 채울 것

\`node scripts/todo-report.mjs --save\` 로 다시 만든다. **손으로 고치지 말 것.**
마지막 갱신: ${today}

사용자 지시(2026-09-02): "전부 시도하고 이미지없는거 좌표없는 거 따로 정리해서
보고 해 순차적으로 채울께".

| | 곳 |
|---|---|
| 사람이 적은 곳 | ${places.length} |
| 📍 좌표 없음 | **${noCoords.length}** |
| 📷 사진 없음 | **${noPhoto.length}** |

---

${section(
  "📍 좌표 없는 곳",
  noCoords,
  `**채우는 법** — 그 자리를 가리키는 **지도에 있는 이름**을 알려 주시면 됩니다.
\`src/data/festival-venues.json\`에 적으면 다음 좌표 실행이 자동으로 찾습니다.

여기 남은 것들은 대개 **지도에 한 점으로 등록되지 않는 것**입니다 — 길·코스·
구간처럼 시작과 끝이 있는 것, 또는 이름이 바뀐 곳입니다.
예) "정동길" → 덕수궁 · "성북동 인문산책 코스" → 최순우 옛집

⚠️ 억지로 채우지 않습니다. 못 찾으면 빈 칸으로 두고, 길찾기는 이름 검색으로
갑니다 — **틀린 좌표보다 빈 칸이 낫습니다.**`
)}
---

${section(
  "📷 사진 없는 곳",
  noPhoto,
  `**채우는 법** — 🚨 **공공누리 제1유형만** 씁니다(출처만 밝히면 상업적 이용 가능).
한국관광공사 자료가 여기 해당합니다.

❌ **쓸 수 없는 것** — 구청 보도자료 사진(대개 제2·4유형: 상업적 이용 금지) ·
시민이 올린 사진 · 블로그 · 인스타 · 핀터레스트 · 구글 이미지 검색 결과.

관광공사에 사진이 있는 곳은 자동으로 채워집니다. 여기 남은 것은 관광공사에도
없는 곳이라, 다른 공공누리 1유형 출처를 찾아야 합니다.`
)}`;

console.log(`사람이 적은 곳 ${places.length}곳`);
console.log(`  📍 좌표 없음 ${noCoords.length}곳`);
console.log(`  📷 사진 없음 ${noPhoto.length}곳`);

if (!SAVE) {
  console.log("\n저장하려면 --save 를 붙이세요 → docs/빈칸-목록.md");
  process.exit(0);
}

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, md);
console.log(`\n저장: ${OUT}`);
