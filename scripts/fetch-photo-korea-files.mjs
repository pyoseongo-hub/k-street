#!/usr/bin/env node
// 📷 **포토코리아 사진을 실제로 내려받아 저장소에 넣는다.**
//
//   왜 따로 두나: scripts/find-photo-korea.mjs 는 **찾아서 보여 주기만** 한다.
//   고르는 것은 사람이고, 고른 뒤에 파일로 가져오는 것이 이 스크립트다.
//
//   🪪 공공누리 **제1유형** — 출처만 밝히면 상업적 이용도 된다.
//      그래서 **credits.json 을 같이 쓴다.** 사진만 남고 촬영자를 잃으면
//      출처를 못 밝히게 되고, 그 순간 쓸 수 없는 사진이 된다.
//
//   ⚠️ 이 환경(클로드 쪽)은 tong.visitkorea.or.kr 에 막혀 있다(403).
//      **GitHub Actions 에서만 돈다.**
//
//   돌리는 법:  node scripts/fetch-photo-korea-files.mjs

import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT  = join(ROOT, "assets", "photo-korea");

// 🖐️ **사람이 고른 목록이다.** 검색 결과를 그대로 쓰지 않는다 —
//    포토코리아 검색에는 지역 코드가 없어 이름만 비슷한 남의 사진이 섞인다.
//    아래는 촬영장소가 '서울 경복궁' 또는 '서울특별시 종로구'인 것만 골랐다.
const PICKS = [
  { file: "gyeongbokgung-hanbok-geunjeongjeon.jpg", id: "2541501",
    what: "경복궁 근정전 야경 · 한복", by: "IR 스튜디오", byEn: "IR Studio", when: "2017-09" },
  { file: "gyeongbokgung-gyeonghoeru-2020.jpg",     id: "2708190",
    what: "경복궁 경회루 야경", by: "라이브스튜디오", byEn: "Live Studio", when: "2020-11" },
  { file: "gyeongbokgung-geunjeongjeon-2020.jpg",   id: "2708188",
    what: "경복궁 근정전 야경", by: "두드림", byEn: "Doodream", when: "2020-11" },
  { file: "gyeongbokgung-geunjeongjeon-2011.jpg",   id: "1304650",
    what: "경복궁 근정전 야경", by: "한국관광공사 이범수", byEn: "Lee Beom-su", when: "2011-05" },
  { file: "gyeongbokgung-gyeonghoeru-2011.jpg",     id: "1304671",
    what: "경복궁 경회루 야경", by: "한국관광공사 이범수", byEn: "Lee Beom-su", when: "2011-05" },
  { file: "gyeongbokgung-heungnyemun-2010.jpg",     id: "1134330",
    what: "경복궁 흥례문 야경", by: "한국관광공사 김지호", byEn: "Kim Ji-ho", when: "2010-11" },
];

const url = (id) => `https://tong.visitkorea.or.kr/cms2/website/${id.slice(-2)}/${id}.jpg`;

mkdirSync(OUT, { recursive: true });
const credits = [];
let 받음 = 0, 실패 = 0;

for (const p of PICKS) {
  const u = url(p.id);
  try {
    const r = await fetch(u, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!r.ok) throw new Error("HTTP " + r.status);
    const buf = Buffer.from(await r.arrayBuffer());
    // 🚫 **크기를 재 본다.** 오류 페이지가 jpg 인 척 오는 일이 있다.
    if (buf.length < 8000) throw new Error(`너무 작다 (${buf.length}바이트) — 사진이 아닐 수 있다`);
    if (!(buf[0] === 0xFF && buf[1] === 0xD8)) throw new Error("JPEG 머리표가 아니다");
    writeFileSync(join(OUT, p.file), buf);
    credits.push({ ...p, url: u, license: "KOGL Type 1 (공공누리 제1유형)",
                   source: "한국관광공사 포토코리아",
                   creditKo: `사진: 한국관광공사 포토코리아 – ${p.by}`,
                   creditEn: `Photo: Korea Tourism Organization (Photo Korea) – ${p.byEn}` });
    console.log(`✅ ${p.file}  ${(buf.length/1024).toFixed(0)}KB  — ${p.what} / ${p.by}`);
    받음++;
  } catch (e) {
    console.log(`❌ ${p.file}  ${u}\n     ${e.message}`);
    실패++;
  }
}

// 출처 장부는 **받은 것만** 적는다. 없는 사진의 출처가 남아 있으면 헷갈린다.
writeFileSync(join(OUT, "credits.json"), JSON.stringify(credits, null, 2) + "\n");
console.log(`\n📊 받음 ${받음}장 · 실패 ${실패}장`);
console.log(`🪪 공공누리 제1유형 — 쓸 때 credits.json 의 creditEn 을 그대로 적는다.`);
if (받음 === 0) process.exit(1);
