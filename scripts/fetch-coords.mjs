#!/usr/bin/env node
// seed.ts의 152곳 중 좌표가 없는 곳(147곳, 2026-08-27 기준)을 채운다.
// 이 세션(샌드박스)은 지도·주소 API 호스트를 전부 못 부른다(방화벽 화이트리스트) —
// 그래서 이 스크립트는 실제 인터넷이 되는 곳(로컬 PC 또는 GitHub Actions)에서 돌린다.
//
// 카카오 로컬 검색(상호명으로 찾는다) → 네이버 지오코딩(카카오가 찾은 도로명주소를
// 다시 좌표로 바꿔서 대조)이 서로 가까운 값을 낼 때만 저장한다. 한쪽만 있으면
// 그 값을 쓰되 confidence를 낮게 남긴다. 상호가 안 맞거나 둘 다 못 찾으면 건너뛴다
// (정확도 원칙: 틀린 좌표 < 빈 칸).
//
//   KAKAO_REST_API_KEY=xxx node scripts/fetch-coords.mjs            # 미리보기(파일 안 씀)
//   KAKAO_REST_API_KEY=xxx node scripts/fetch-coords.mjs --apply     # coords.json에 반영
//
// NAVER_GEOCODE_CLIENT_ID / NAVER_GEOCODE_CLIENT_SECRET(둘 다)가 있으면 대조에 쓴다.
// 이건 지도 SDK용 VITE_NAVER_MAPS_CLIENT_ID와는 다른 키다 — NCP 콘솔에서
// "AI NAVER API > Maps > Geocoding"을 별도로 신청해서 발급받는 Client ID+Secret 쌍.

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SEED_TS = join(__dirname, "..", "src", "data", "seed.ts");
const OUT_JSON = join(__dirname, "..", "src", "data", "coords.json");
const VENUES_JSON = join(__dirname, "..", "src", "data", "festival-venues.json");

const KAKAO_KEY = process.env.KAKAO_REST_API_KEY;
const NAVER_ID = process.env.NAVER_GEOCODE_CLIENT_ID;
const NAVER_SECRET = process.env.NAVER_GEOCODE_CLIENT_SECRET;
const APPLY = process.argv.includes("--apply");
// --limit=(빈 값)이면 Number("")가 0이 되어 "전체 실행"이 조용히 0곳
// 처리로 끝나는 버그가 있었다(fetch-tour-images.mjs에서 실제로 겪고 나서
// 여기도 같이 고침, 2026-08-30) — 빈 문자열도 "제한 없음"으로 취급한다.
const rawLimit = process.argv.find((a) => a.startsWith("--limit="))?.split("=")[1];
const LIMIT = rawLimit ? Number(rawLimit) : Infinity;

if (!KAKAO_KEY) {
  console.error("KAKAO_REST_API_KEY 환경변수가 없다. developers.kakao.com에서 무료 발급(즉시, 승인 대기 없음).");
  process.exit(1);
}
if (!NAVER_ID || !NAVER_SECRET) {
  console.log("⚠️ NAVER_GEOCODE_CLIENT_ID/SECRET이 없다 — 카카오 단독으로 진행(대조 없이 낮은 신뢰도로 저장).");
}

// ── seed.ts에서 장소 목록을 정규식으로 뽑는다(TS를 실행하지 않고도 되게,
//    fetch-tour-images.mjs와 같은 방식). id()는 파일 전체에서 등장 순서대로
//    ks_1, ks_2...(36진수)를 부여하므로 같은 순서로 다시 센다.
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
    const gu = body.match(/gu:\s*"([^"]+)"/)?.[1];
    const dong = body.match(/dong:\s*"([^"]+)"/)?.[1];
    const category = body.match(/category:\s*"([^"]+)"/)?.[1];
    const name = body.match(/name:\s*"([^"]+)"/)?.[1];
    const hasCoords = /\blat:\s*[\d.]/.test(body);
    if (!gu || !category || !name) continue;
    places.push({ id: `ks_${seq.toString(36)}`, gu, dong, category, name, hasCoords });
  }
  return places;
}

function normalize(s) {
  return s.replace(/[·・()（）]/g, " ").replace(/\s+/g, " ").trim();
}

// 🎪 축제는 지도에 등록된 '장소'가 아니라 며칠만 열리는 '행사'다. 그래서 이름으로
// 검색하면 아무것도 안 나온다 — 2026-09-01 감사에서 좌표 없는 17곳이 **전부 축제**로
// 확인됐다(docs/축제-빈칸.md). 사람이 근거를 확인해 적어 둔 '실제 열리는 곳'을
// festival-venues.json에서 읽어, 축제 이름 대신 그 장소를 검색한다.
//
// ⚠️ 한글은 NFC로 맞춰서 찾는다. 화면에 똑같이 보여도 자모 분해형(NFD)이면 다른
//    문자열이라 표에서 안 찾아진다(Kfood에서 유튜브 제목으로 실제로 겪은 사고).
const nfc = (s) => String(s ?? "").normalize("NFC");
const VENUES = (() => {
  const raw = JSON.parse(readFileSync(VENUES_JSON, "utf-8"));
  const map = new Map();
  for (const [name, v] of Object.entries(raw)) {
    if (name.startsWith("_")) continue; // "_읽어보세요" 같은 설명 칸
    map.set(nfc(name), v);
  }
  return map;
})();

// 🚨 2026-09-01 전수검사에서 찾은 버그 — 옛 primaryName()은 이름의 **첫 단어만**
// 검색어로 썼다. 여러 장소를 "A · B"로 합쳐 둔 이름을 쪼개려고 만든 것인데,
// normalize()가 ·를 공백으로 바꾼 뒤 공백으로 잘랐기 때문에 그냥 두 단어인
// 이름까지 전부 잘렸다. 185곳 중 68곳(37%)이 이렇게 망가져 있었다:
//
//   서울둘레길 1코스 — 수락산   → "서울둘레길"   (17개 코스가 전부 같은 검색어!)
//   이태원 지구촌축제           → "이태원"       (동네 이름)
//   청계천 꽃길                → "청계천"       (하천 전체)
//   성동구청 갤러리            → "성동구청"      (구청 건물)
//   예술의전당 서울서예박물관     → "예술의전당"    (공연장)
//
// 게다가 여기에 구까지 붙여 "댄싱노원 노원구"처럼 검색했다 — 카카오에서 0건이 난다
// (사용자가 캡처로 확인: "댄싱노원 거리페스티벌 노원구" → 검색 결과가 없어요).
// 좌표 없는 118곳이 이래서 생겼다.
//
// 합쳐진 이름은 2026-08-29(커밋 522e783)에 이미 항목 단위로 쪼개 뒀다. 지금 남은
// ·는 "송정·응봉지구", "망우·용마산"처럼 **한 장소 안의 구간 표시**라 쪼개면 안 된다.
// 그래서 이름을 자르지 않고, **넓은 것부터 좁은 것 순으로 여러 번** 시도한다.
function searchVariants(name, gu) {
  const full = normalize(name);
  const v = [full];
  // "서울둘레길 1코스 — 수락산" → "서울둘레길 1코스" (대시 뒤 구간 설명을 뗀다)
  const beforeDash = full.split(/\s*[—–-]\s*/)[0].trim();
  if (beforeDash && beforeDash !== full && beforeDash.length >= 4) v.push(beforeDash);
  // 괄호 안 설명을 뗀 이름. normalize()가 이미 괄호를 공백으로 바꾸므로 원본에서 뗀다.
  const noParen = normalize(name.replace(/\(.*?\)|（.*?）/g, ""));
  if (noParen && !v.includes(noParen) && noParen.length >= 4) v.push(noParen);
  // 마지막 수단으로만 구를 붙인다 — 붙이면 오히려 0건이 나는 경우가 많다.
  v.push(`${full} ${gu}`);
  return v;
}

// 결과가 그 장소가 맞는지 보는 잣대. **구가 일치하는지를 반드시 본다** —
// 검색어를 넓게 던지는 만큼 이 잣대가 정확도를 지키는 유일한 장치다.
function looksLikeSamePlace(doc, name, gu) {
  const addr = `${doc.road_address_name ?? ""} ${doc.address_name ?? ""}`;
  if (!addr.includes(gu)) return false;
  const squash = (s) => s.replace(/[^가-힣a-zA-Z0-9]/g, "");
  const a = squash(doc.place_name);
  const b = squash(name);
  if (!a || !b) return false;
  // 한쪽이 다른 쪽을 품고, 짧은 쪽이 4글자 이상일 때만 같은 곳으로 본다
  // ("이태원"처럼 3글자가 아무 데나 걸리는 걸 막는다).
  const shorter = a.length <= b.length ? a : b;
  return shorter.length >= 4 && (a.includes(b) || b.includes(a));
}

// 장소표(festival-venues.json)로 찾을 때 쓰는 잣대. 위와 다른 점은 **글자 수 제한이
// 느슨하다**는 것 하나다 — "덕수궁 · 코엑스 · 노원역"처럼 3글자짜리 정식 장소명이
// 많은데, 위 잣대(4글자 이상)를 그대로 쓰면 멀쩡한 장소가 전부 걸러진다.
// 대신 검색어가 **사람이 근거를 확인해 적어 둔 정식 명칭**이고, 구 일치 검사는
// 그대로 하므로 엉뚱한 곳이 걸릴 위험은 오히려 이름 검색보다 낮다.
function looksLikeVenue(doc, venue, gu) {
  const addr = `${doc.road_address_name ?? ""} ${doc.address_name ?? ""}`;
  if (!addr.includes(gu)) return false;
  const squash = (s) => s.replace(/[^가-힣a-zA-Z0-9]/g, "");
  const a = squash(nfc(doc.place_name));
  const b = squash(nfc(venue));
  if (!a || !b) return false;
  return a.includes(b) || b.includes(a);
}

// 요청 하나가 응답 없이 멈추면 전체 배치가 무한정 멎어 버리므로(147곳 실행 중
// 실제로 겪음), 모든 외부 호출에 제한 시간을 둔다.
async function fetchWithTimeout(url, options, timeoutMs = 15000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function kakaoSearch(query) {
  const url = `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(query)}&size=5`;
  const res = await fetchWithTimeout(url, { headers: { Authorization: `KakaoAK ${KAKAO_KEY}` } });
  if (!res.ok) {
    const body = await res.text().catch(() => "(본문 읽기 실패)");
    throw new Error(`Kakao HTTP ${res.status} for "${query}" — ${body}`);
  }
  const data = await res.json();
  return data.documents ?? [];
}

// 카카오는 이미 찾았는데 네이버 대조만 실패한 경우, 그 실패가 전체 장소를
// 건너뛰게 만들면 안 된다(교차확인 없이 카카오 단독·낮은 신뢰도로 저장하는
// 기존 로직으로 흘러가야 한다) — 그래서 여기서 모든 오류를 삼키고 null만 낸다.
async function naverGeocode(address) {
  if (!NAVER_ID || !NAVER_SECRET) return null;
  const url = `https://maps.apigw.ntruss.com/map-geocode/v2/geocode?query=${encodeURIComponent(address)}`;
  try {
    const res = await fetchWithTimeout(url, {
      headers: {
        "X-NCP-APIGW-API-KEY-ID": NAVER_ID,
        "X-NCP-APIGW-API-KEY": NAVER_SECRET,
      },
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "(본문 읽기 실패)");
      console.log(`  ↳ 네이버 지오코딩 HTTP ${res.status} for "${address}" — ${body}`);
      return null;
    }
    const data = await res.json();
    const hit = data?.addresses?.[0];
    if (!hit) {
      console.log(`  ↳ 네이버 지오코딩 결과 없음 for "${address}"`);
      return null;
    }
    return { lat: Number(hit.y), lng: Number(hit.x) };
  } catch (err) {
    console.log(`  ↳ 네이버 지오코딩 오류 for "${address}" — ${err.message}`);
    return null;
  }
}

// 두 좌표 사이 대략 거리(m) — 정밀한 지도 계산이 아니라 "같은 곳이 맞나" 정도만 본다.
function roughDistanceMeters(a, b) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

async function main() {
  const source = readFileSync(SEED_TS, "utf-8");
  const existing = JSON.parse(readFileSync(OUT_JSON, "utf-8"));
  const places = extractPlaces(source).filter((p) => !p.hasCoords && !existing[p.id]);
  const todo = places.slice(0, LIMIT);

  console.log(`좌표 없는 곳 ${places.length}개 중 ${todo.length}개 처리 시작 (${APPLY ? "적용" : "미리보기"})...`);

  const result = { ...existing };
  let matched = 0;
  let crossChecked = 0;

  for (const p of todo) {
    try {
      // 장소표에 적힌 축제면 축제 이름 대신 **열리는 곳**을 검색한다.
      const venue = VENUES.get(nfc(p.name));
      const keywords = venue ? venue.venues : searchVariants(p.name, p.gu);
      const matches = venue
        ? (doc, keyword) => looksLikeVenue(doc, keyword, p.gu)
        : (doc) => looksLikeSamePlace(doc, p.name, p.gu);

      // 넓은 검색어부터 차례로 던지고, 구까지 일치하는 결과가 나오면 거기서 멈춘다.
      let hit = null;
      let usedKeyword = "";
      for (const keyword of keywords) {
        const docs = await kakaoSearch(keyword);
        hit = docs.find((d) => matches(d, keyword)) ?? null;
        if (hit) {
          usedKeyword = keyword;
          break;
        }
        await new Promise((r) => setTimeout(r, 120));
      }
      if (!hit) {
        const how = venue ? `장소표: ${venue.venues.join(" / ")}` : "검색어 여러 개 시도";
        console.log(`⬜ [${p.category}] ${p.name} — 카카오에서 못 찾음(${how})`);
        continue;
      }
      if (venue) {
        console.log(`   ↳ 축제 장소표에서 "${usedKeyword}"로 찾음 — ${venue.why}`);
      } else if (usedKeyword !== normalize(p.name)) {
        console.log(`   ↳ "${usedKeyword}"로 찾음`);
      }
      const kakaoCoord = { lat: Number(hit.y), lng: Number(hit.x) };
      const address = hit.road_address_name || hit.address_name;

      let confidence = "kakao";
      let final = kakaoCoord;
      if (address) {
        const naverCoord = await naverGeocode(address);
        if (naverCoord) {
          const dist = roughDistanceMeters(kakaoCoord, naverCoord);
          if (dist < 150) {
            confidence = "kakao+naver";
            crossChecked++;
          } else {
            console.log(
              `⚠️ [${p.category}] ${p.name} — 카카오·네이버 좌표가 ${Math.round(dist)}m 떨어짐, 카카오만 신뢰도 낮게 저장`
            );
          }
        }
      }

      result[p.id] = {
        lat: final.lat,
        lng: final.lng,
        source: confidence,
        matchedName: hit.place_name,
        // 축제는 이름이 아니라 '열리는 곳'으로 찾았다는 것을 남긴다. 나중에
        // matchedName만 보고 "상호가 다른데?" 하고 지우는 일을 막는다.
        ...(venue ? { venueFor: p.name, venueWhy: venue.why } : {}),
      };
      matched++;
      console.log(`✅ [${p.category}] ${p.name} → ${hit.place_name} (${confidence})`);
    } catch (err) {
      console.log(`❌ [${p.category}] ${p.name} — 오류: ${err.message}`);
    }
    // API 호출 간 살짝 텀 — 두 서비스 다 초당 호출 제한이 있다.
    await new Promise((r) => setTimeout(r, 150));
  }

  console.log(`\n매칭 ${matched}/${todo.length} (교차확인 ${crossChecked}건)`);

  if (APPLY) {
    writeFileSync(OUT_JSON, JSON.stringify(result, null, 2) + "\n");
    console.log(`coords.json에 반영함 (총 ${Object.keys(result).length}곳).`);
  } else {
    console.log("미리보기만 했다 — 반영하려면 --apply를 붙여서 다시 실행할 것.");
  }
}

main();
