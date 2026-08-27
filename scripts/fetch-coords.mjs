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

const KAKAO_KEY = process.env.KAKAO_REST_API_KEY;
const NAVER_ID = process.env.NAVER_GEOCODE_CLIENT_ID;
const NAVER_SECRET = process.env.NAVER_GEOCODE_CLIENT_SECRET;
const APPLY = process.argv.includes("--apply");
const LIMIT = Number(process.argv.find((a) => a.startsWith("--limit="))?.split("=")[1] ?? Infinity);

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

// 여러 조각 이름("A · B · C")은 첫 조각만 검색어로 쓴다.
// 단, 첫 조각이 짧으면(2글자 이하) 위험하다 — "성북 세계음식축제"의 "성북",
// "중랑 서울장미축제"의 "중랑"처럼 동네 이름 앞머리만 남으면 그 동네의
// 아무 업체 이름에나 들어맞는다(실제로 "성북구보건소", "중랑구보건소"와
// 잘못 매칭되는 걸 확인했다 — 네이버 교차확인도 "카카오가 찾은 그 틀린
// 업체"의 좌표를 다시 확인하는 것뿐이라 오히려 고신뢰도로 둔갑시킨다).
// "4·19혁명"의 "4"도 같은 문제. 이럴 땐 쪼개지 말고 전체 이름을 그대로 쓴다.
function primaryName(name) {
  const first = normalize(name).split(" ").filter(Boolean)[0] ?? name;
  return first.length >= 3 ? first : normalize(name);
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
    const keyword = `${primaryName(p.name)} ${p.dong ?? p.gu}`;
    try {
      const docs = await kakaoSearch(keyword);
      const target = normalize(primaryName(p.name));
      const hit = docs.find((d) => normalize(d.place_name).includes(target));
      if (!hit) {
        console.log(`⬜ [${p.category}] ${p.name} — 카카오에서 못 찾음`);
        continue;
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
