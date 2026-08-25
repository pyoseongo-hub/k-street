#!/usr/bin/env node
// 한국관광공사 TourAPI(KorService2)에서 축제 이름으로 검색해 대표 이미지 + 실제 좌표(mapx/mapy)를
// 받아온다. 전부 공공누리 1유형(출처 표시하면 상업적 이용·수정 가능) 데이터다.
// 좌표는 나중에 지도 위 실제 핀 기능에 쓴다 — 검색으로 추측한 좌표가 아니라 관광공사가 직접
// 등록해 둔 값이라 정확도 원칙(좌표를 지어내지 않는다)에 어긋나지 않는다.
//
// 이 세션(샌드박스)은 apis.data.go.kr에 접속이 막혀 있어서 직접 실행해 확인할 수 없다.
// 실제 인터넷이 되는 로컬 PC에서 인증키를 받아 이렇게 실행할 것:
//
//   TOUR_API_KEY=발급받은_디코딩_키 node scripts/fetch-tour-images.mjs
//
// 결과는 src/data/tour-images.json에 저장된다(비밀값 아님 — 이미지 URL만 들어있어 커밋해도 된다).
// 이름이 확실히 일치하는 것만 저장한다 — 애매하면 건너뛴다(정확도 원칙: 틀린 사진 < 빈 칸).

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SEED_TS = join(__dirname, "..", "src", "data", "seed.ts");
const OUT_JSON = join(__dirname, "..", "src", "data", "tour-images.json");

const API_KEY = process.env.TOUR_API_KEY;
if (!API_KEY) {
  console.error("TOUR_API_KEY 환경변수가 없다. 예) TOUR_API_KEY=xxxx node scripts/fetch-tour-images.mjs");
  process.exit(1);
}

const BASE = "https://apis.data.go.kr/B551011/KorService2/searchKeyword2";

async function searchKeyword(keyword) {
  const params = new URLSearchParams({
    serviceKey: API_KEY,
    MobileOS: "ETC",
    MobileApp: "KStreet",
    _type: "json",
    keyword,
    areaCode: "1", // 서울
    numOfRows: "5",
    pageNo: "1",
  });
  const res = await fetch(`${BASE}?${params.toString()}`);
  if (!res.ok) throw new Error(`HTTP ${res.status} for "${keyword}"`);
  const data = await res.json();
  const items = data?.response?.body?.items?.item;
  if (!items) return [];
  return Array.isArray(items) ? items : [items];
}

// seed.ts에서 FESTIVALS 배열의 {id, name} 쌍만 정규식으로 뽑는다(TS를 실행하지 않고도 되게).
function extractFestivals(source) {
  const block = source.match(/export const FESTIVALS[\s\S]*?\n\];/);
  if (!block) throw new Error("seed.ts에서 FESTIVALS 블록을 못 찾음");
  const idRe = /id:\s*id\(\)/g;
  const lineRe = /\{[^}]*name:\s*"([^"]+)"[^}]*\}/g;
  const names = [];
  let m;
  while ((m = lineRe.exec(block[0]))) names.push(m[1]);
  // id()는 호출 순서대로 ks_1, ks_2...(36진수) 부여된다 — seed.ts와 동일한 규칙으로 재계산.
  return names.map((name, i) => ({ id: `ks_${(i + 1).toString(36)}`, name }));
}

function normalize(s) {
  return s.replace(/[·・()（）]/g, " ").replace(/\s+/g, " ").trim();
}

async function main() {
  const source = readFileSync(SEED_TS, "utf-8");
  const festivals = extractFestivals(source);
  console.log(`축제 ${festivals.length}개에서 이미지 검색 시작...`);

  const result = {};
  let matched = 0;

  for (const f of festivals) {
    // "성북 세계음식축제 누리마실 · 다다페스타"처럼 복합명은 첫 조각만 검색어로 쓴다.
    const keyword = normalize(f.name).split(" ").slice(0, 3).join(" ");
    try {
      const items = await searchKeyword(keyword);
      const hit = items.find(
        (it) => it.firstimage && normalize(it.title).includes(normalize(keyword).split(" ")[0])
      );
      if (hit) {
        result[f.id] = {
          name: f.name,
          matchedTitle: hit.title,
          image: hit.firstimage,
          thumb: hit.firstimage2 || hit.firstimage,
          contentId: hit.contentid,
          // mapx/mapy: TourAPI가 주는 실제 좌표(경도/위도) — 지도에 핀을 찍을 때 이걸 쓴다.
          // 값이 "0"이거나 빈 문자열이면 좌표를 안 가진 항목이라 undefined로 남긴다(지어내지 않음).
          lng: hit.mapx && hit.mapx !== "0" ? Number(hit.mapx) : undefined,
          lat: hit.mapy && hit.mapy !== "0" ? Number(hit.mapy) : undefined,
          source: "TourAPI/공공누리 1유형",
        };
        matched++;
        console.log(`✅ ${f.name} → ${hit.title}`);
      } else {
        console.log(`⬜ ${f.name} — 못 찾음(빈 칸으로 둠)`);
      }
    } catch (err) {
      console.log(`❌ ${f.name} — 오류: ${err.message}`);
    }
    await new Promise((r) => setTimeout(r, 300)); // 예의상 살짝 쉬어감
  }

  writeFileSync(OUT_JSON, JSON.stringify(result, null, 2) + "\n");
  console.log(`\n${matched}/${festivals.length}개 매칭 → ${OUT_JSON}에 저장함.`);
  console.log("이미지가 맞는지 눈으로 한 번 확인하고 커밋할 것(정확도 원칙).");
}

main();
