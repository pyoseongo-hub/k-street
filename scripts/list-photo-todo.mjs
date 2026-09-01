#!/usr/bin/env node
// 사진이 없어서 앱에 안 보이는 곳 중, 오늘 채울 3곳을 뽑는다.
//
// 사용자 결정(2026-09-01): "사진 없는장소 일단 가리기 앱에 안보이게 / 하루에 수동
// 몇개씩 구청 서치 무료 이미지있는거 사용 / 루틴으로 하루 세개씩 시작 / 이미지 채운
// 것은 보임으로".
//
//   node scripts/list-photo-todo.mjs           # 오늘의 3곳
//   node scripts/list-photo-todo.mjs --count=5 # 개수 바꾸기
//   node scripts/list-photo-todo.mjs --all     # 남은 곳 전부 보기(진행 상황 확인용)
//
// 🚩 꽃길을 맨 앞에 둔다. 사진 게이트를 켜면서 꽃길이 32곳 → 2곳으로 줄었다
// (사람이 조사한 25개 구 꽃길에 사진이 없어서다). 다른 칸은 관광공사 사진이 많아
// 당장 쓸 만하지만 꽃길만 사실상 비어 있으므로, 여기부터 채워야 탭이 되살아난다.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SEED_TS = join(__dirname, "..", "src", "data", "seed.ts");
const TOUR_RAW = join(__dirname, "..", "src", "data", "tour-places-raw.json");
const MANUAL = join(__dirname, "..", "src", "data", "manual-photos.json");

const COUNT = Number(process.argv.find((a) => a.startsWith("--count="))?.split("=")[1] ?? 3);
const ALL = process.argv.includes("--all");

// 어느 칸부터 채울지. 앞에 있을수록 먼저 나온다.
const PRIORITY = ["flower", "hike", "walk", "festival", "market", "museum", "street"];
const LABEL = {
  flower: "🌸 꽃길",
  hike: "⛰️ 등산로",
  walk: "🚶 산책길",
  festival: "🎪 축제",
  market: "🛒 시장",
  museum: "🏛️ 박물관",
  street: "🍢 골목·거리",
};

// seed.ts는 TS라 그냥 못 읽는다 — 다른 스크립트들과 같은 방식으로 정규식으로 뽑는다.
// id()는 파일에 나오는 순서대로 ks_1, ks_2… 로 매겨지므로 그 순서를 그대로 센다.
function extractPlaces(src) {
  const out = [];
  let seq = 0;
  for (const line of src.split("\n")) {
    if (!/id:\s*id\(\)/.test(line)) continue;
    seq++;
    const pick = (k) => line.match(new RegExp(`${k}:\\s*"([^"]+)"`))?.[1];
    const name = pick("name");
    if (!name) continue;
    out.push({
      id: `ks_${seq.toString(36)}`,
      name,
      gu: pick("gu") ?? "",
      dong: pick("dong"),
      category: pick("category") ?? "",
    });
  }
  return out;
}

const seed = readFileSync(SEED_TS, "utf-8");
const tour = JSON.parse(readFileSync(TOUR_RAW, "utf-8"));
const manual = JSON.parse(readFileSync(MANUAL, "utf-8"));

// 관광공사에서 사진을 받은 이름 — 이 이름과 같으면 이미 사진이 있다.
const tourPhotoNames = new Set(
  Object.values(tour)
    .flat()
    .filter((p) => p.image)
    .map((p) => p.name.normalize("NFC"))
);
const done = new Set(Object.keys(manual).filter((k) => !k.startsWith("_")));

const todo = extractPlaces(seed)
  .filter((p) => !tourPhotoNames.has(p.name.normalize("NFC")) && !done.has(p.id))
  .sort((a, b) => {
    const d = PRIORITY.indexOf(a.category) - PRIORITY.indexOf(b.category);
    return d !== 0 ? d : a.gu.localeCompare(b.gu, "ko");
  });

const guSite = (gu) => `https://www.google.com/search?q=${encodeURIComponent(`${gu}청 ${gu} 공공누리 사진`)}`;
const nameSearch = (p) =>
  `https://www.google.com/search?q=${encodeURIComponent(`${p.name} ${p.gu} site:seoul.go.kr OR 공공누리`)}`;

const remaining = todo.length;
console.log(`사진이 없어 가려진 곳: ${remaining}곳`);
if (remaining === 0) {
  console.log("🎉 전부 채웠다.");
  process.exit(0);
}
const byCat = {};
for (const p of todo) byCat[p.category] = (byCat[p.category] ?? 0) + 1;
console.log(
  "  칸별 남은 수 — " +
    PRIORITY.filter((c) => byCat[c]).map((c) => `${LABEL[c]} ${byCat[c]}`).join(" · ")
);
console.log(`  하루 ${COUNT}곳이면 약 ${Math.ceil(remaining / COUNT)}일`);
console.log("");

const pick = ALL ? todo : todo.slice(0, COUNT);
console.log(ALL ? "════ 남은 곳 전부 ════" : `════ 오늘 채울 ${pick.length}곳 ════`);
for (const [i, p] of pick.entries()) {
  console.log("");
  console.log(`${i + 1}. ${LABEL[p.category] ?? p.category}  ${p.name}`);
  console.log(`   id: ${p.id}   |   ${p.gu}${p.dong ? " " + p.dong : ""}`);
  if (!ALL) {
    console.log(`   찾아볼 곳: ${nameSearch(p)}`);
    console.log(`   구청 자료: ${guSite(p.gu)}`);
  }
}

if (!ALL) {
  console.log("");
  console.log("════ 사진을 찾으면 manual-photos.json에 이렇게 적는다 ════");
  console.log(
    JSON.stringify(
      Object.fromEntries(
        pick.map((p) => [
          p.id,
          {
            image: "여기에 사진 주소",
            source: `${p.gu}청`,
            license: "공공누리 제1유형",
            pageUrl: "여기에 원본 페이지 주소",
          },
        ])
      ),
      null,
      2
    )
  );
  console.log("");
  console.log("🚨 공공기관이 공공누리로 공개한 사진만 쓴다. 블로그·인스타·구글 이미지 검색 결과는 안 된다.");
  console.log("   출처(source)와 이용 조건(license)을 못 적는 사진은 넣지 않는다.");
}
