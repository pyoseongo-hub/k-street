#!/usr/bin/env node
// 한국관광공사 TourAPI(KorService2)에서 장소 이름으로 검색해 대표 이미지 + 실제 좌표(mapx/mapy)를
// 받아온다. 전부 공공누리 1유형(출처 표시하면 상업적 이용·수정 가능) 데이터다.
// 좌표는 나중에 지도 위 실제 핀 기능에 쓴다 — 검색으로 추측한 좌표가 아니라 관광공사가 직접
// 등록해 둔 값이라 정확도 원칙(좌표를 지어내지 않는다)에 어긋나지 않는다.
//
// 2026-08-28까지는 FESTIVALS(축제)만 처리했다 — 개발계정 트래픽 한도(엔드포인트당
// 하루 1,000건)를 걱정해서였는데, 실제로 세어 보니 서울 전체가 축제·시장·꽃길·
// 산책로·둘레길·박물관 다 합쳐도 200곳이 안 돼 한도의 20%도 안 쓴다. 그래서 5개
// 카테고리 전부로 넓힌다(사용자 확인 후 진행, 2026-08-28).
// ※ 2026-08-29에 "A · B"처럼 이름 두 개를 하나로 합쳐 둔 항목들을 지도 검색이
//   되도록 개별 항목으로 쪼개면서 곳 수가 156 → 185로 늘었다(seed.ts 참고).
//
// 이 세션(샌드박스)은 apis.data.go.kr에 접속이 막혀 있어서 직접 실행해 확인할 수 없다.
// 실제 인터넷이 되는 로컬 PC(또는 fetch-tour-images.yml GitHub Actions)에서
// 이렇게 실행할 것 — data.go.kr 활용신청 상세 화면의 "일반 인증키"를 그대로
// 복사해 쓰면 된다(Encoding/Decoding 구분해서 찾을 필요 없음, 아래 searchKeyword()
// 주석 참고):
//
//   TOUR_API_KEY=데이터포털에서_복사한_일반_인증키 node scripts/fetch-tour-images.mjs
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
  // serviceKey는 URLSearchParams에 넣지 않고 직접 이어 붙인다 — data.go.kr의
  // "일반 인증키"는 이미 URL에 바로 쓸 수 있게 인코딩된 값(%2B, %2F, %3D 등을
  // 그대로 포함)이라, URLSearchParams를 거치면 그 %를 다시 인코딩해 %252B처럼
  // 이중 인코딩되어 키가 깨진다. 사용자가 데이터포털 화면에 보이는 "일반
  // 인증키" 값을 그대로 복사해 쓸 수 있게 하기 위한 조치다(2026-08-28).
  const params = new URLSearchParams({
    MobileOS: "ETC",
    MobileApp: "KStreet",
    _type: "json",
    keyword,
    areaCode: "1", // 서울
    numOfRows: "5",
    pageNo: "1",
  });
  const res = await fetch(`${BASE}?serviceKey=${API_KEY}&${params.toString()}`);
  if (!res.ok) throw new Error(`HTTP ${res.status} for "${keyword}"`);
  const data = await res.json();
  const items = data?.response?.body?.items?.item;
  if (!items) return [];
  return Array.isArray(items) ? items : [items];
}

// seed.ts에서 FESTIVALS부터 MUSEUMS까지 6개 배열 전체의 {id, category, name}을
// 뽑는다(TS를 실행하지 않고도 되게) — fetch-coords.mjs와 같은 방식. id()는 파일에
// 등장하는 순서대로(FESTIVALS→MARKETS→FLOWERS→WALKS→HIKES→MUSEUMS) ks_1, ks_2...
// (36진수)를 매기므로, 같은 순서로 다시 세어야 실제 id와 어긋나지 않는다.
function extractPlaces(source) {
  const block = source.match(/export const FESTIVALS[\s\S]*?const ALL_PLACES_RAW/);
  if (!block) throw new Error("seed.ts에서 장소 배열 블록을 못 찾음");
  const lineRe = /\{\s*id:\s*id\(\),\s*([^\n]*?)\},?\s*$/gm;
  const places = [];
  let seq = 0;
  let m;
  while ((m = lineRe.exec(block[0]))) {
    seq++;
    const body = m[1];
    const category = body.match(/category:\s*"([^"]+)"/)?.[1];
    const name = body.match(/name:\s*"([^"]+)"/)?.[1];
    if (!category || !name) continue;
    places.push({ id: `ks_${seq.toString(36)}`, category, name });
  }
  return places;
}

function normalize(s) {
  return s.replace(/[·・()（）]/g, " ").replace(/\s+/g, " ").trim();
}

// --limit=(빈 값)이면 Number("")가 0이 되어 전체 실행이 "0곳 처리"로 조용히
// 죽는 버그가 있었다(2026-08-30, GitHub Actions에서 limit 칸을 비운 채
// 돌렸을 때 실제로 겪음) — 빈 문자열도 "제한 없음"으로 취급해야 한다.
const rawLimit = process.argv.find((a) => a.startsWith("--limit="))?.split("=")[1];
const LIMIT = rawLimit ? Number(rawLimit) : Infinity;

async function main() {
  const source = readFileSync(SEED_TS, "utf-8");
  const allPlaces = extractPlaces(source);
  const places = allPlaces.slice(0, LIMIT);

  // 기존 결과가 있으면 이어서 채운다(덮어쓰지 않음) — 부분 실행·재실행에도 안전하게.
  let existing = {};
  try {
    existing = JSON.parse(readFileSync(OUT_JSON, "utf-8"));
  } catch {
    // 파일이 없거나 비어 있으면 빈 객체로 시작
  }

  console.log(
    `${allPlaces.length}곳(축제·시장·꽃길·산책로·둘레길·박물관) 중 ${places.length}곳 이미지 검색 시작...`
  );

  const result = { ...existing };
  let matched = 0;

  for (const p of places) {
    // "성북 세계음식축제 누리마실 · 다다페스타"처럼 복합명은 첫 조각만 검색어로 쓴다.
    const keyword = normalize(p.name).split(" ").slice(0, 3).join(" ");
    try {
      const items = await searchKeyword(keyword);
      const hit = items.find(
        (it) => it.firstimage && normalize(it.title).includes(normalize(keyword).split(" ")[0])
      );
      if (hit) {
        result[p.id] = {
          name: p.name,
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
        console.log(`✅ [${p.category}] ${p.name} → ${hit.title}`);
      } else {
        console.log(`⬜ [${p.category}] ${p.name} — 못 찾음(빈 칸으로 둠)`);
      }
    } catch (err) {
      console.log(`❌ [${p.category}] ${p.name} — 오류: ${err.message}`);
    }
    await new Promise((r) => setTimeout(r, 300)); // 예의상 살짝 쉬어감
  }

  writeFileSync(OUT_JSON, JSON.stringify(result, null, 2) + "\n");
  console.log(`\n${matched}/${places.length}개 매칭 → ${OUT_JSON}에 저장함(총 ${Object.keys(result).length}곳).`);
  console.log("이미지가 맞는지 눈으로 한 번 확인하고 커밋할 것(정확도 원칙).");
}

main();
