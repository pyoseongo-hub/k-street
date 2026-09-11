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

import { writeFileSync, readFileSync } from "node:fs";
import { httpsPhoto } from "./lib/https-photo.mjs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { fetchWithRetry } from "./lib/tour-fetch.mjs";
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
  const res = await fetchWithRetry(`${ROOT}/${path}?serviceKey=${API_KEY}&${params.toString()}`);
  // 🚦 429는 "오늘 몫을 다 썼다"는 뜻이다 — 코드가 틀린 게 아니다. `HTTP 429` 한 줄만
  //    보면 무슨 일인지 알 수 없어서 무엇을 하면 되는지까지 적어 준다.
  if (res.status === 429) {
    throw new Error(
      "호출 한도 초과(429) — 오늘 관광공사에 물어볼 수 있는 몫을 다 썼다.\n" +
        "   자정이 지나면 초기화된다. 내일 다시 돌리면 된다.\n" +
        "   (공공데이터포털 → 마이페이지 → 활용신청 현황에서 남은 횟수를 볼 수 있다.)"
    );
  }
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${path}`);
  const text = await res.text();
  // 🚨 data.go.kr은 오류를 HTTP 200 + XML로 돌려주는 일이 잦다. 그대로 JSON.parse하면
  //    "0건"처럼 보여서, 자료가 없는 건지 호출이 틀린 건지 구분이 안 된다
  //    (2026-09-02: 여행코스(25)가 0건인데 이유를 알 수 없었다).
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`JSON이 아닌 응답: ${text.slice(0, 300).replace(/\s+/g, " ")}`);
  }
  const header = data?.response?.header;
  if (header?.resultCode && header.resultCode !== "0000") {
    throw new Error(`API 오류 ${header.resultCode} — ${header.resultMsg}`);
  }
  const body = data?.response?.body;
  const items = body?.items?.item;
  const list = !items ? [] : Array.isArray(items) ? items : [items];
  return { list, totalCount: Number(body?.totalCount ?? list.length) };
}

// contentTypeId별 서울(areaCode=1) 전체를 페이지네이션으로 다 받아온다.
async function fetchAllByContentType(contentTypeId) {
  const items = [];
  let pageNo = 1;
  let firstTotal = null;
  const numOfRows = 500;
  for (;;) {
    const { list, totalCount } = await callTourApi("areaBasedList2", {
      contentTypeId,
      areaCode: "1",
      numOfRows: String(numOfRows),
      pageNo: String(pageNo),
      arrange: "A",
    });
    if (firstTotal === null) firstTotal = totalCount;
    items.push(...list);
    if (items.length >= totalCount || list.length < numOfRows) break;
    pageNo++;
    if (pageNo > 10) break; // 안전장치
    await new Promise((r) => setTimeout(r, 200));
  }
  // 0건일 때는 **관광공사가 0이라고 답한 것**인지 우리가 잘못 부른 것인지 남긴다.
  if (items.length === 0) {
    console.log(`     ↳ 관광공사가 알려 준 전체 건수: ${firstTotal ?? "(응답 없음)"}`);
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
    // 📷 https로 올려 받는다 — 관광공사는 http로 주는데 앱은 https라 브라우저가
    //    막는다(scripts/lib/https-photo.mjs 주석 참고).
    image: httpsPhoto(it.firstimage) || undefined,
    thumb: httpsPhoto(it.firstimage2 || it.firstimage) || undefined,
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
//
// 2026-09-01 2차 수집(858건)의 제목을 전부 눈으로 읽고 아래 규칙을 만들었다.
// 검증 결과: festival 57 · market 65 · museum 64 · flower 2 · walk 21 · hike 20 · street 40 = 269곳.

// 서울의 실제 산. "산"이라는 글자만으로 거르면 용산·세계유산·절두산·심산기념문화센터처럼
// 산이 아닌 것이 무더기로 딸려 온다 — 그래서 산 이름을 직접 적는다.
const MTN = /(관악산|구룡산|배봉산|봉화산|북악산|북한산|불암산|지양산|청계산|초안산|남산|아차산|우면산|대모산|인왕산|호암산|목멱산|도봉산|수락산|용마산|백운대|족두리봉|국기봉)/;
// 산 이름이 들어갔지만 산이 아닌 것 — 배봉산숲속도서관·서울남산국악당·북한산 둘레캠프·
// 서울 서초 글램핑 청계산장이 실제로 걸려 나왔다.
const NOT_MTN = /(근린공원|체육공원|배수지|한옥마을|역광장|신학교|순교성지|의열사|인권숲|예장공원|가족공원|부분개방|세계유산|봉수대 터|사격장|캠핑|캠프|클라이밍|도서관|국악당|광장|글램핑|산장|타임캡슐)/;
// 골목·거리. 앱 이름이 K-Street인데 정작 "거리" 칸이 없었다(사용자 지시 2026-09-01).
const STREET = /(골목|거리|가로수길|경리단길|우사단길|서순라길|로렌스길|감고당길|차이나타운|떡볶이타운|로데오)/;
// 거리공원·우이동 먹거리마을·패션타운(동대문 도매상가)은 거리가 아니다.
const NOT_STREET = /(공원|마을|패션타운|나눔누리|체험관|기념비)/;
// 🚨 **한국어는 맨 뒤 낱말이 「그게 무엇인지」를 정한다** (2026-09-11).
//    위 NOT_STREET 가 「마을」만 보고 진짜 골목 둘을 버리고 있었다:
//      · 북촌한옥마을 감고당길   ← 북촌의 진짜 골목인데 「마을」 때문에 탈락
//      · 세종마을 음식문화거리   ← 서촌의 음식 거리인데 같은 이유로 탈락
//    둘 다 「마을」은 **어디에 있는지**를 말하는 앞머리고, 그것이 무엇인지는 맨 뒤의
//    「길·거리」가 말한다. 반대로 「거리공원」·「구로거리공원」은 뒤가 공원이라 공원이 맞다.
//    그래서 **이름이 거리 낱말로 끝나면 NOT_STREET 를 무시한다.**
//    ⚠️ STREET 규칙 자체는 넓히지 않았다 — 이미 STREET 에 걸린 것에만 적용되므로
//       쌈지길·초대길처럼 근거가 약한 것이 딸려 들어오지 않는다(돌려서 확인했다).
const ENDS_STREET = /(거리|골목|길)$/;

// ⚠️ 순서가 규칙의 일부다 — 앞에 있는 것이 이긴다. 한 곳이 두 칸에 겹쳐 들어가면
// 화면에 같은 곳이 두 번 뜬다. 예: "노룬산골목시장"은 골목이 아니라 시장이고,
// "안양천제방벚꽃길"은 산책로가 아니라 꽃길이며, "북한산 자락길"은 산이 아니라 산책로다.
const RULES = [
  { key: "market", re: /시장/ },
  { key: "museum", re: /(박물관|미술관|기념관|전시관)/ },
  { key: "flower", re: /(벚꽃|꽃길|철쭉|장미원|연꽃|수목원|화훼단지)/ },
  { key: "walk", re: /(둘레길|나들길|산책|숲길|자락길|하늘길|트레일|올레|계곡|생태공원|수변|돌담길|서울로 7017)/ },
  { key: "hike", re: MTN, not: NOT_MTN },
  { key: "street", re: STREET, not: NOT_STREET, ends: ENDS_STREET },
];

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

  // 한 곳은 한 칸에만 들어간다 — RULES 순서대로 먼저 맞는 칸이 가져간다.
  const result = { festival: festivals.map(toPlace) };
  for (const { key } of RULES) result[key] = [];
  for (const it of pool) {
    const name = it.title || "";
    // 「아니다」 규칙은 **이름이 그 갈래 낱말로 끝나면 무시한다** — 맨 뒤 낱말이
    // 그게 무엇인지를 정하기 때문이다(ENDS_STREET 주석 참고).
    const rule = RULES.find(
      (r) => r.re.test(name) && !(r.not && r.not.test(name) && !(r.ends && r.ends.test(name.trim())))
    );
    if (rule) result[rule.key].push(toPlace(it));
  }

  console.log("\n카테고리별 결과:");
  for (const [cat, list] of Object.entries(result)) {
    const withGu = list.filter((p) => p.gu).length;
    const withPhoto = list.filter((p) => p.image).length;
    console.log(`  ${cat}: ${list.length}건 (구 확인 ${withGu} / 사진 있음 ${withPhoto})`);
  }

  // 🚨 덮어쓰기 안전장치 (2026-09-02) — 이 스크립트는 지금 앱이 쓰는 자료를 통째로
  //    갈아엎는다. 관광공사가 하루 불안정해서 적게 주면 **화면에서 장소가 사라진다**
  //    (사진·좌표까지 함께 날아간다). 이전보다 20% 넘게 줄면 멈추고 사람에게 묻는다.
  //    일부러 줄이는 경우에는 --force 를 붙인다.
  const APPLY = process.argv.includes("--apply");
  const FORCE = process.argv.includes("--force");
  let prevCount = 0;
  try {
    const prev = JSON.parse(readFileSync(OUT_JSON, "utf-8"));
    prevCount = Object.values(prev).reduce((n, l) => n + (Array.isArray(l) ? l.length : 0), 0);
  } catch {
    /* 처음 만드는 경우 */
  }
  const newCount = Object.values(result).reduce((n, l) => n + l.length, 0);
  if (prevCount && newCount < prevCount * 0.8 && !FORCE) {
    console.log(
      `\n🚨 멈춤 — 지금 ${prevCount}곳인데 이번에 받은 건 ${newCount}곳이다(20% 넘게 줄었다).`
    );
    console.log("   관광공사가 불안정했을 가능성이 크다. 그대로 덮어쓰면 앱에서 장소가 사라진다.");
    console.log("   정말 줄이려는 것이면 --force 를 붙여 다시 실행할 것.");
    process.exit(1);
  }
  // 🔍 **무엇이 달라지나** (2026-09-10).
  //
  //    전에는 맛보기가 「269곳 → 260곳」처럼 **숫자만** 알려 줬다. 그런데 정작
  //    알아야 할 것은 **어느 곳이 사라지고 어느 곳이 새로 오나**다.
  //    관광공사는 끝난 축제를 내리므로, 그대로 덮어쓰면 **지금 살아 있는
  //    페이지가 사라진다** — 이미 구글에 들어간 주소들이다.
  //    20% 문턱만으로는 못 막는다(9곳이 줄어도 3%라 그냥 통과한다).
  const idMap = (obj) => {
    const m = new Map();
    for (const [cat, list] of Object.entries(obj ?? {}))
      for (const it of Array.isArray(list) ? list : [])
        if (it?.contentId) m.set(String(it.contentId), { name: it.name, cat });
    return m;
  };
  let prevRaw = {};
  try {
    prevRaw = JSON.parse(readFileSync(OUT_JSON, "utf-8"));
  } catch {
    /* 처음 만드는 경우 */
  }
  const before = idMap(prevRaw);
  const after = idMap(result);
  const gone = [...before].filter(([id]) => !after.has(id));
  const fresh = [...after].filter(([id]) => !before.has(id));

  console.log(`\n🔍 무엇이 달라지나 — 사라짐 ${gone.length}곳 · 새로 옴 ${fresh.length}곳`);
  if (gone.length) {
    console.log("   ❌ 사라지는 곳 (덮어쓰면 앱·검색에서 없어진다)");
    for (const [id, v] of gone) console.log(`        ${v.cat.padEnd(9)} ${v.name}  (tour_${id})`);
  }
  if (fresh.length) {
    console.log("   ✨ 새로 오는 곳");
    for (const [id, v] of fresh) console.log(`        ${v.cat.padEnd(9)} ${v.name}  (tour_${id})`);
  }

  // 🚨 **덮어쓰지 않고 합친다** (2026-09-11).
  //
  //    2026-09-11에 맛보기를 돌렸더니 「269곳 → 255곳」, **사라짐 14곳**이 나왔다.
  //    끝난 축제 10곳에 더해 독립문영천시장 · 대한민국역사박물관 · 남산공원 ·
  //    **충무로 인쇄골목**이 함께 빠졌다. 관광공사가 내린 것이지 **없어진 곳이 아니다.**
  //    그대로 저장했으면 곳 페이지 14장과 거기 쌓인 검색 순위가 통째로 날아갔다.
  //
  //    위 20% 안전장치는 이걸 못 막는다 — 14곳은 5%라서 그냥 통과한다.
  //    그래서 축제 날짜 스크립트와 **같은 방식**으로 바꾼다: 받은 것을 **보태고**,
  //    관광공사가 더 이상 안 주는 곳은 **그대로 둔다.**
  //
  //    ⚠️ 정말로 지워야 할 때(폐업·중복)는 `--prune` 를 붙인다. 그때만 덮어쓴다.
  //       기본이 「안 지움」인 이유는, 잘못 지우면 되돌리기가 훨씬 비싸기 때문이다 —
  //       곳 페이지 주소가 죽고 검색이 그걸 기억한다.
  const PRUNE = process.argv.includes("--prune");
  const merged = {};
  for (const cat of Object.keys(result)) {
    const byId = new Map();
    // 옛것을 먼저 깔고
    if (!PRUNE) for (const it of prevRaw[cat] ?? []) if (it?.contentId) byId.set(String(it.contentId), it);
    // 새로 받은 것으로 덮는다 — 사진·좌표가 갱신된다
    for (const it of result[cat]) if (it?.contentId) byId.set(String(it.contentId), it);
    merged[cat] = [...byId.values()];
  }
  const mergedCount = Object.values(merged).reduce((n, l) => n + l.length, 0);

  if (!APPLY) {
    console.log(`\n👀 맛보기만 했다 — 저장하지 않았다.`);
    console.log(`   지금 ${prevCount}곳 · 이번에 받은 것 ${newCount}곳 → ${PRUNE ? "지우면" : "합치면"} ${mergedCount}곳`);
    if (!PRUNE && gone.length)
      console.log(`   (위 ${gone.length}곳은 **그대로 남는다** — 합치기라서 안 사라진다)`);
    console.log("   저장하려면 --apply 를 붙일 것.");
    return;
  }

  writeFileSync(OUT_JSON, JSON.stringify(merged, null, 2) + "\n");
  console.log(
    `\n${OUT_JSON}에 저장함 — ${prevCount}곳 → ${mergedCount}곳` +
      (PRUNE ? " (--prune: 안 주는 곳은 지웠다)" : ` (합침 — 안 주는 ${gone.length}곳은 그대로 뒀다)`)
  );
  console.log("   seed.ts로 옮기기 전에 내용을 먼저 확인할 것.");

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
