#!/usr/bin/env node
// 🔑 **seed.ts에서 항목을 지우거나 끼워 넣은 뒤 반드시 돌린다.**
//
// 왜 필요한가 (2026-09-02) — seed.ts의 id는 `ks_1, ks_2 …`로 **파일에 적힌 순서**로
// 매겨진다. 항목 하나를 지우면 그 뒤가 전부 한 칸씩 밀리는데, 좌표(coords.json)와
// 사진(manual-photos.json)은 옛 번호를 그대로 들고 있어 **조용히 남의 것이 된다.**
//
//     무수골(도봉구)       → 경춘선숲길 좌표 + 경춘선숲길 사진
//     서울시립미술관(중구)  → 딜쿠샤 사진 (종로구의 다른 곳)
//
// 실제로 좌표 7곳·사진 11곳이 그 상태였고, 사용자가 "하나하나 수동검사 해"라고
// 해서야 찾았다. 화면도 안 깨지고 문법도 안 틀려 눈으로는 절대 못 잡는다.
//
// 이제 두 파일 모두 **그때의 장소 이름**을 함께 들고 있으므로(coords의 for·venueFor,
// photos의 matchedName), 그 이름으로 지금 seed를 다시 찾아 번호를 새로 매길 수 있다.
//
//   node scripts/rekey-by-name.mjs          # 무엇이 바뀌는지만 보여 준다
//   node scripts/rekey-by-name.mjs --apply  # 실제로 다시 매긴다
//
// ⚠️ 이름을 못 찾은 항목은 **버리지 않고 그대로 둔다.** 감사(❌B1-2)가 잡아 주므로
//    사람이 보고 정하는 편이 낫다 — 자동으로 지우면 멀쩡한 자료가 조용히 사라진다.

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const D = (f) => join(__dirname, "..", "src", "data", f);
const APPLY = process.argv.includes("--apply");

const nfc = (s) => String(s ?? "").normalize("NFC");
const sq = (s) => nfc(s).replace(/[^가-힣a-zA-Z0-9]/g, "");

// 지금 seed.ts의 순서대로 id를 다시 센다 — seed.ts의 id() 규칙과 같아야 한다.
const rows = [];
let seq = 0;
for (const line of readFileSync(D("seed.ts"), "utf-8").split("\n")) {
  if (!/id: id\(\)/.test(line)) continue;
  seq++;
  rows.push({
    id: `ks_${seq.toString(36)}`,
    name: line.match(/name: "([^"]+)"/)?.[1] ?? "",
    gu: line.match(/gu: "([^"]+)"/)?.[1] ?? "",
  });
}

// 이름 → 항목. 같은 이름이 둘 이상이면 **고르지 않는다**(구로시장·남구로시장처럼
// 닮은 이름을 잘못 이으면 그게 바로 이 사고의 시작이다).
const byName = new Map();
const dupNames = new Set();
for (const r of rows) {
  const k = sq(r.name);
  if (byName.has(k)) dupNames.add(k);
  byName.set(k, r);
}
for (const k of dupNames) byName.delete(k);

// 별명표 — 관광공사 이름과 우리 이름이 다른 곳(국립현대미술관 서울 ↔ 서울관 등).
// 이걸 안 보면 멀쩡한 자료가 "이름 못 찾음"으로 뜬다.
const aliases = JSON.parse(readFileSync(D("name-aliases.json"), "utf-8"));
for (const r of rows) {
  const a = aliases[nfc(r.name)];
  if (typeof a === "string" && !byName.has(sq(a))) byName.set(sq(a), r);
}

/**
 * 이 항목이 지금 어느 id에 붙어야 하나. 못 찾으면 null.
 *
 * 이름이 정확히 같은 곳이 없을 때만, **그 이름으로 시작하는 곳이 딱 하나**면
 * 그리로 본다("강동아트센터" → "강동아트센터 갤러리 그림"). 둘 이상이면 고르지
 * 않는다 — 닮은 이름을 잘못 이으면 그게 바로 이 사고의 시작이다.
 */
function findByStoredName(name) {
  const k = sq(name);
  if (!k) return null;
  if (byName.has(k)) return byName.get(k);
  const hits = rows.filter((r) => sq(r.name).startsWith(k));
  return hits.length === 1 ? hits[0] : null;
}

function rekey(file, nameOf) {
  const json = JSON.parse(readFileSync(D(file), "utf-8"));
  const out = {};
  const moved = [];
  const stayed = [];
  const lost = [];
  for (const [id, v] of Object.entries(json)) {
    if (id.startsWith("_")) {
      out[id] = v; // 파일 안 설명 칸
      continue;
    }
    const name = nameOf(v);
    const target = findByStoredName(name);
    if (!target) {
      out[id] = v; // 못 찾으면 그대로 둔다 — 감사가 잡는다
      // 이름이 **없는 것**과 **둘 이상이라 못 고르는 것**은 다르다.
      // 국립서울현충원처럼 산책길·박물관 두 칸에 같은 이름이 있으면 어느 쪽인지
      // 기계가 정할 수 없다 — 그때는 그대로 두는 것이 맞다.
      const same = rows.filter((r) => sq(r.name) === sq(name)).length;
      lost.push(
        same > 1
          ? `${id} "${name}" — seed에 같은 이름이 ${same}개라 어느 쪽인지 못 고른다(그대로 둠)`
          : `${id} "${name}" — seed에 그 이름이 없다`
      );
      continue;
    }
    if (target.id === id) {
      out[id] = v;
      stayed.push(id);
    } else {
      out[target.id] = v;
      moved.push(`${id} → ${target.id}  ${target.gu} ${target.name}`);
    }
  }
  return { json: out, moved, stayed, lost };
}

const jobs = [
  ["coords.json", (v) => v.for ?? v.venueFor],
  ["manual-photos.json", (v) => v.matchedName],
];

let totalMoved = 0;
for (const [file, nameOf] of jobs) {
  const r = rekey(file, nameOf);
  console.log(`\n■ ${file}`);
  console.log(`   그대로 ${r.stayed.length} · 옮김 ${r.moved.length} · 이름 못 찾음 ${r.lost.length}`);
  r.moved.forEach((m) => console.log(`   🔁 ${m}`));
  r.lost.forEach((m) => console.log(`   ❓ ${m}`));
  totalMoved += r.moved.length;
  if (APPLY) {
    writeFileSync(D(file), JSON.stringify(r.json, null, 2) + "\n");
  }
}

console.log("");
if (!APPLY) {
  console.log(`👀 보기만 했다 — 옮길 것 ${totalMoved}곳. 반영하려면 --apply 를 붙일 것.`);
} else {
  console.log(`✅ ${totalMoved}곳을 새 번호로 옮겼다. 이어서 \`npm run audit-seed\`로 확인할 것.`);
}
