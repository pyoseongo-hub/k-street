#!/usr/bin/env node
// 🚨 K-Street 데이터를 통째로 다시 짜는 스크립트다(2026-08-30 사용자 지시:
// "싹다 지워 안맞는거 매칭하지 말고 관광공사 꺼 그대로 축제넣고 길잦아넣고
// 등산로넣고 다 여기자료를 베이스로해"). 지금까지는 사람이 직접 고른 185곳
// 목록에 관광공사 사진을 "맞춰 넣으려고" 했는데, 그 대조 자체가 계속
// 실패했다 — 그래서 방향을 바꿔 관광공사가 가진 자료를 그대로(대조 없이)
// 서울 데이터의 기반으로 쓴다.
//
// 이 스크립트는 seed.ts를 아직 직접 고치지 않는다 — 결과를
// src/data/tour-places-raw.json에 먼저 저장해서, 실제로 몇 곳이 잡히는지
// 카테고리별로 눈으로 확인한 뒤에 seed.ts로 옮긴다(정확도 원칙: 실제 응답을
// 한 번도 못 본 채로 seed.ts를 다시 쓰면, 그 형식이 잘못됐을 때 되돌리기가
// 더 어렵다 — 이 세션은 apis.data.go.kr을 직접 못 부른다).
//
//   TOUR_API_KEY=데이터포털에서_복사한_일반_인증키 node scripts/fetch-tour-places.mjs
//
// 결과는 카테고리별 곳 수와 함께 콘솔에 요약되고, 원본 항목은 전부
// src/data/tour-places-raw.json에 저장된다(공공누리 1유형, 비밀값 아님).

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_JSON = join(__dirname, "..", "src", "data", "tour-places-raw.json");
// 거르기 전 원본. 키워드 규칙을 고칠 근거가 되는 파일이다 — 1차 수집 때 이게 없어서
// market·walk·hike가 왜 0건인지 확인할 방법이 없었다.
const OUT_POOL = join(__dirname, "..", "src", "data", "tour-pool-all.json");

const API_KEY = process.env.TOUR_API_KEY;
if (!API_KEY) {
  console.error("TOUR_API_KEY 환경변수가 없다. 예) TOUR_API_KEY=xxxx node scripts/fetch-tour-places.mjs");
  process.exit(1);
}

const ROOT = "https://apis.data.go.kr/B551011/KorService2";

async function callTourApi(path, extraParams) {
  // serviceKey를 URLSearchParams에 안 넣는 이유는 fetch-coords.mjs 주석 참고
  // (data.go.kr "일반 인증키"가 이미 URL 인코딩된 값이라 이중 인코딩되면 깨짐).
  const params = new URLSearchParams({
    MobileOS: "ETC",
    MobileApp: "KStreet",
    _type: "json",
    ...extraParams,
  });
  const res = await fetch(`${ROOT}/${path}?serviceKey=${API_KEY}&${params.toString()}`);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${path}`);
  const data = await res.json();
  const body = data?.response?.body;
  const items = body?.items?.item;
  const list = !items ? [] : Array.isArray(items) ? items : [items];
  return { list, totalCount: Number(body?.totalCount ?? list.length) };
}

// contentTypeId별 서울(areaCode=1) 전체를 페이지네이션으로 다 받아온다.
async function fetchAllByContentType(contentTypeId) {
  const items = [];
  let pageNo = 1;
  const numOfRows = 500;
  for (;;) {
    const { list, totalCount } = await callTourApi("areaBasedList2", {
      contentTypeId,
      areaCode: "1",
      numOfRows: String(numOfRows),
      pageNo: String(pageNo),
      arrange: "A",
    });
    items.push(...list);
    if (items.length >= totalCount || list.length < numOfRows) break;
    pageNo++;
    if (pageNo > 10) break; // 안전장치
    await new Promise((r) => setTimeout(r, 200));
  }
  return items;
}

const SEOUL_DISTRICTS = [
  "종로구", "중구", "용산구", "성동구", "광진구", "동대문구", "중랑구", "성북구",
  "강북구", "도봉구", "노원구", "은평구", "서대문구", "마포구", "양천구", "강서구",
  "구로구", "금천구", "영등포구", "동작구", "관악구", "서초구", "강남구", "송파구",
  "강동구",
];

function extractGu(addr) {
  if (!addr) return undefined;
  return SEOUL_DISTRICTS.find((gu) => addr.includes(gu));
}

function toPlace(it) {
  return {
    name: it.title,
    gu: extractGu(it.addr1),
    addr: it.addr1,
    contentId: it.contentid,
    image: it.firstimage || undefined,
    thumb: it.firstimage2 || it.firstimage || undefined,
    lng: it.mapx && it.mapx !== "0" ? Number(it.mapx) : undefined,
    lat: it.mapy && it.mapy !== "0" ? Number(it.mapy) : undefined,
  };
}

// 시장·꽃길·산책로·등산로는 관광공사의 전용 contentTypeId가 없어서, 관광지(12)·
// 문화시설(14)·여행코스(25)·레포츠(28)·쇼핑(38)을 넓게 받은 뒤 제목에 키워드가
// 있는 것만 그 카테고리로 분류한다. 축제(15)만 그대로 전부 쓴다(전용 타입이라
// 필터가 필요 없음).
//
// 🚨 2026-09-01 1차 수집에서 배운 것 — 받아온 616곳 중 551곳을 걸러서 버렸는데,
// 버린 목록이 파일에 안 남아 규칙을 고칠 근거가 없었다. market·walk·hike가 전부
// 0건이었는데도 "왜 0건인지"를 확인할 방법이 없었다는 뜻이다. 그래서 이제
// 받은 것을 **하나도 버리지 않고** tour-pool-all.json에 통째로 저장한다.
// 규칙은 그 실제 제목들을 보고 정한다(추측으로 키워드를 넓히면 엉뚱한 게 섞인다).
const KEYWORD_CATEGORIES = {
  market: ["시장"],
  flower: ["벚꽃", "꽃길", "장미"],
  walk: ["둘레길", "산책", "숲길", "트레일"],
  hike: ["등산", "산행", "정상", "능선"],
  museum: ["박물관", "미술관", "기념관", "전시관"],
};

// 넓게 받아 두는 칸들. 여기서 키워드로 골라낸다.
// 38(쇼핑)이 빠져 있어서 시장이 0건이었다 — 관광공사는 전통시장을 쇼핑으로 분류한다.
// 28(레포츠)에는 등산로·산책로가 들어 있을 수 있어 함께 받는다.
const POOL_TYPES = [
  { id: "12", label: "관광지" },
  { id: "14", label: "문화시설" },
  { id: "25", label: "여행코스" },
  { id: "28", label: "레포츠" },
  { id: "38", label: "쇼핑" },
];

async function main() {
  console.log("서울 축제·공연·행사(15) 받는 중...");
  const festivals = await fetchAllByContentType("15");
  console.log(`  → ${festivals.length}건`);

  const pool = [];
  const poolByType = {};
  for (const { id, label } of POOL_TYPES) {
    console.log(`서울 ${label}(${id}) 받는 중...`);
    const list = await fetchAllByContentType(id);
    console.log(`  → ${list.length}건`);
    poolByType[`${id}_${label}`] = list.map(toPlace);
    pool.push(...list);
  }

  function byKeyword(keywords) {
    return pool.filter((it) => keywords.some((k) => (it.title || "").includes(k)));
  }

  const result = {
    festival: festivals.map(toPlace),
    market: byKeyword(KEYWORD_CATEGORIES.market).map(toPlace),
    flower: byKeyword(KEYWORD_CATEGORIES.flower).map(toPlace),
    walk: byKeyword(KEYWORD_CATEGORIES.walk).map(toPlace),
    hike: byKeyword(KEYWORD_CATEGORIES.hike).map(toPlace),
    museum: byKeyword(KEYWORD_CATEGORIES.museum).map(toPlace),
  };

  console.log("\n카테고리별 결과:");
  for (const [cat, list] of Object.entries(result)) {
    const withGu = list.filter((p) => p.gu).length;
    const withPhoto = list.filter((p) => p.image).length;
    console.log(`  ${cat}: ${list.length}건 (구 확인 ${withGu} / 사진 있음 ${withPhoto})`);
  }

  writeFileSync(OUT_JSON, JSON.stringify(result, null, 2) + "\n");
  console.log(`\n${OUT_JSON}에 저장함 — seed.ts로 옮기기 전에 내용을 먼저 확인할 것.`);

  // 걸러지기 전의 원본을 통째로 남긴다. 키워드 규칙을 고칠 때 "실제로 어떤 이름이
  // 있었는지"를 볼 수 있어야 추측이 아니라 근거로 정할 수 있다.
  poolByType["15_축제"] = result.festival;
  writeFileSync(OUT_POOL, JSON.stringify(poolByType, null, 2) + "\n");

  const poolTotal = Object.values(poolByType).reduce((n, l) => n + l.length, 0);
  const kept = Object.values(result).reduce((n, l) => n + l.length, 0);
  console.log(`${OUT_POOL}에 원본 ${poolTotal}건 전부 저장함(거르기 전).`);
  console.log(`\n요약: 받은 것 ${poolTotal}건 → 분류된 것 ${kept}건`);
}

main();
