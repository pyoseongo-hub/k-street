#!/usr/bin/env node
// 🔍 **새 도시를 만들기 전에, 그 도시 자료가 어떻게 생겼는지 먼저 본다.**
//
// 왜 (2026-09-10, 사용자 지시: "진행 자료가 중요해 만들기전에 … 자료받고 비교해서 만들어") —
// 지금 K-Street 은 **서울 모양으로 박혀 있다.** 'seoul' 이라는 글자가 20개 파일 290자리에
// 들어 있고, 구 이름 25개와 산 이름 목록이 손으로 적혀 있다.
//
// 여기에 제주를 넣으면 곧바로 어긋난다:
//   · 제주에는 **구가 없다** — 제주시·서귀포시 두 행정시고, 그 아래가 읍·면·동이다
//   · 제주에는 서울에 없는 갈래가 있다 — **오름**(수백 개)과 **올레길**
//   · 서울 규칙(MTN = 관악산|북한산|…)을 그대로 쓰면 제주에서는 **한 곳도 안 걸린다**
//
// 그래서 코드를 고치기 **전에** 이 스크립트로 자료를 먼저 받아 본다.
// 이 스크립트는 **seed.ts 를 건드리지 않는다.** 받아서 저장하고 세어 볼 뿐이다.
//
// 🚨 **지역 코드를 외워서 넣지 않는다.** 「제주는 39번」 같은 기억은 틀릴 수 있고,
//    틀리면 조용히 다른 도(道) 자료를 받아 온다. 그래서 코드 없이 돌리면
//    **관광공사에 지역 목록을 물어보고 그대로 보여 준다.** 사람이 눈으로 고른다.
//
// 실행 (윈도우 PowerShell — 인증키에 % 가 들어 있어서 작은따옴표가 필요하다):
//   $env:TOUR_API_KEY = '여기에_Encoding_인증키'
//   node scripts/survey-city.mjs                 ← 지역 목록만 보여 준다
//   node scripts/survey-city.mjs --area 39       ← 그 지역을 조사한다
//
// 결과: src/data/survey-<지역코드>.json (원본 그대로) + 화면 요약
import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "..", "src", "data");

const API_KEY = process.env.TOUR_API_KEY;
if (!API_KEY) {
  console.error("❌ TOUR_API_KEY 가 없다.");
  console.error("   PowerShell:  $env:TOUR_API_KEY = '여기에_Encoding_인증키'");
  console.error("   ⚠️ 작은따옴표로 감싼다 — 인증키의 % 가 변수 기호로 먹히면 키가 깨진다.");
  process.exit(1);
}

const args = process.argv.slice(2);
const areaCode = args[args.indexOf("--area") + 1];
const wantArea = args.includes("--area") && areaCode && !areaCode.startsWith("--");

const ROOT = "https://apis.data.go.kr/B551011/KorService2";

// 관광공사 서버는 하루에 몇 번씩 접속 자체가 안 열린다(fetch-tour-places.mjs 주석 참고).
async function fetchWithRetry(url, tries = 4) {
  const WAITS = [5000, 15000, 30000];
  let lastErr;
  for (let i = 1; i <= tries; i++) {
    try {
      return await fetch(url);
    } catch (e) {
      lastErr = e;
      if (i === tries) break;
      const why = e?.cause?.code || e?.cause?.message || e?.message;
      console.log(`     ↳ 접속 실패(${i}/${tries}, ${why}) — ${WAITS[i - 1] / 1000}초 뒤 다시`);
      await new Promise((r) => setTimeout(r, WAITS[i - 1]));
    }
  }
  throw lastErr;
}

async function call(path, extraParams) {
  // serviceKey 는 URLSearchParams 에 안 넣는다 — 일반 인증키가 이미 URL 인코딩된 값이라
  // 이중 인코딩되면 깨진다(fetch-tour-places.mjs 와 같은 이유).
  const params = new URLSearchParams({
    MobileOS: "ETC",
    MobileApp: "KStreet",
    _type: "json",
    ...extraParams,
  });
  const res = await fetchWithRetry(`${ROOT}/${path}?serviceKey=${API_KEY}&${params.toString()}`);
  if (res.status === 429) {
    throw new Error(
      "호출 한도 초과(429) — 오늘 몫을 다 썼다. 자정이 지나면 초기화된다.\n" +
        "   (공공데이터포털 → 마이페이지 → Open API → 활용 중 에서 남은 횟수를 볼 수 있다.)"
    );
  }
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${path}`);
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    // data.go.kr 은 오류를 HTTP 200 + XML 로 주는 일이 잦다 — 0건과 구분해야 한다.
    throw new Error(`JSON 이 아닌 응답: ${text.slice(0, 300).replace(/\s+/g, " ")}`);
  }
  const header = data?.response?.header;
  if (header?.resultCode && header.resultCode !== "0000")
    throw new Error(`API 오류 ${header.resultCode} — ${header.resultMsg}`);
  const body = data?.response?.body;
  const items = body?.items?.item;
  const list = !items ? [] : Array.isArray(items) ? items : [items];
  return { list, totalCount: Number(body?.totalCount ?? list.length) };
}

// ── 지역 코드를 물어본다 ────────────────────────────────────────────────
if (!wantArea) {
  console.log("🗺️  관광공사가 쓰는 **지역 코드**를 물어본다 (외워서 넣지 않는다)\n");
  const { list } = await call("areaCode2", { numOfRows: "50" });
  for (const a of list) console.log(`   ${String(a.code).padStart(2)}  ${a.name}`);
  console.log("\n다음 단계 — 위에서 고른 번호로 다시 돌린다:");
  console.log("   node scripts/survey-city.mjs --area <번호>");
  process.exit(0);
}

// ── 그 지역의 시군구 목록 ───────────────────────────────────────────────
//
// 🚨 **여기가 이번 조사의 핵심이다.** 서울은 이 목록이 「○○구」 25개인데,
//    제주는 무엇으로 나오는지 봐야 우리 코드의 `gu` 칸에 무엇을 넣을지 정할 수 있다.
console.log(`🔍 지역 ${areaCode} 를 조사한다\n`);
console.log("① 이 지역은 무엇으로 나뉘나 (관광공사 기준)");
const { list: sigungu } = await call("sigunguCode2", { areaCode, numOfRows: "60" });
for (const s of sigungu) console.log(`   ${String(s.code).padStart(2)}  ${s.name}`);
console.log(`   → ${sigungu.length}개\n`);

// ── 곳을 통째로 받는다 (거르지 않는다) ─────────────────────────────────
//
// 🚨 **하나도 안 버리고 저장한다.** 서울 1차 수집 때 616곳 중 551곳을 걸러 버렸는데
//    버린 목록이 안 남아 「왜 0건인지」 확인할 방법이 없었다. 규칙은 실제 제목을
//    보고 정하는 것이지, 추측으로 넓히면 엉뚱한 게 섞인다.
const POOL_TYPES = [
  { id: "12", label: "관광지" },
  { id: "14", label: "문화시설" },
  { id: "15", label: "축제공연행사" },
  { id: "25", label: "여행코스" },
  { id: "28", label: "레포츠" },
  { id: "38", label: "쇼핑" },
];

async function fetchAll(contentTypeId) {
  const items = [];
  let pageNo = 1;
  const numOfRows = 500;
  for (;;) {
    const { list, totalCount } = await call("areaBasedList2", {
      contentTypeId,
      areaCode,
      numOfRows: String(numOfRows),
      pageNo: String(pageNo),
      arrange: "A",
    });
    items.push(...list);
    if (items.length >= totalCount || list.length < numOfRows) break;
    if (++pageNo > 10) break;
    await new Promise((r) => setTimeout(r, 200));
  }
  return items;
}

console.log("② 곳을 받는다 (거르지 않고 통째로)");
const pool = [];
for (const t of POOL_TYPES) {
  const items = await fetchAll(t.id);
  items.forEach((it) => (it.__type = t.label));
  pool.push(...items);
  console.log(`   ${t.label.padEnd(8)} ${String(items.length).padStart(5)}곳`);
  await new Promise((r) => setTimeout(r, 300));
}
console.log(`   ${"합계".padEnd(8)} ${String(pool.length).padStart(5)}곳\n`);

mkdirSync(OUT_DIR, { recursive: true });
const OUT = join(OUT_DIR, `survey-${areaCode}.json`);
writeFileSync(OUT, JSON.stringify(pool, null, 2) + "\n");

// ── 주소가 어떻게 생겼나 ────────────────────────────────────────────────
//
// 서울은 주소에 「○○구」가 들어 있어서 그 글자로 동네를 뽑았다.
// 제주 주소에는 무엇이 들어 있는지 실제로 세어 본다.
console.log("③ 주소의 둘째 칸 (여기가 우리 코드의 `gu` 자리에 들어갈 후보다)");
const second = new Map();
for (const it of pool) {
  const parts = String(it.addr1 ?? "").split(/\s+/);
  const key = parts[1] || "(주소 없음)";
  second.set(key, (second.get(key) ?? 0) + 1);
}
for (const [k, n] of [...second].sort((a, b) => b[1] - a[1]).slice(0, 20))
  console.log(`   ${String(n).padStart(5)}곳  ${k}`);
console.log("");

// ── 서울 규칙을 그대로 대 보면 ──────────────────────────────────────────
//
// 🚨 이것이 「비교」다. 서울에서 쓰는 갈래 규칙을 이 도시 자료에 그대로 대 보고,
//    **몇 곳이 어느 칸에도 안 들어가는지** 센다. 그 수가 크면 = 서울 규칙이 이 도시에
//    안 맞는다는 증거이고, 무엇을 새로 만들어야 하는지도 아래 낱말 표가 알려 준다.
const SEOUL_MTN = /(관악산|구룡산|배봉산|봉화산|북악산|북한산|불암산|지양산|청계산|초안산|남산|아차산|우면산|대모산|인왕산|호암산|목멱산|도봉산|수락산|용마산|백운대|족두리봉|국기봉)/;
const RULES = [
  { key: "market", re: /시장/ },
  { key: "museum", re: /(박물관|미술관|기념관|전시관)/ },
  { key: "flower", re: /(벚꽃|꽃길|철쭉|장미원|연꽃|수목원|화훼단지)/ },
  { key: "walk", re: /(둘레길|나들길|산책|숲길|자락길|하늘길|트레일|올레|계곡|생태공원|수변|돌담길)/ },
  { key: "hike", re: SEOUL_MTN },
  { key: "street", re: /(골목|거리|가로수길|경리단길|우사단길|서순라길|로렌스길|감고당길|차이나타운|떡볶이타운|로데오)/ },
];

console.log("④ 서울 규칙을 그대로 대 보면");
const hit = new Map();
let miss = 0;
const missTitles = [];
for (const it of pool) {
  const title = String(it.title ?? "");
  if (it.__type === "축제공연행사") {
    hit.set("festival", (hit.get("festival") ?? 0) + 1);
    continue;
  }
  const r = RULES.find((x) => x.re.test(title));
  if (r) hit.set(r.key, (hit.get(r.key) ?? 0) + 1);
  else {
    miss++;
    missTitles.push(title);
  }
}
for (const [k, n] of [...hit].sort((a, b) => b[1] - a[1]))
  console.log(`   ${k.padEnd(9)} ${String(n).padStart(5)}곳`);
console.log(`   ${"어디에도 안 들어감".padEnd(6)} ${String(miss).padStart(5)}곳  ← 이 수가 크면 서울 규칙이 안 맞는다는 뜻`);
console.log("");

// ── 이 도시에만 있는 낱말 찾기 ──────────────────────────────────────────
//
// 안 걸린 제목들에서 자주 나오는 낱말을 센다. 제주라면 여기에 **오름·해수욕장·
// 올레·포구** 같은 것이 올라올 것이다 — 그게 곧 「새로 만들어야 할 칸」이다.
// 추측으로 칸을 만들지 않고 **실제 제목이 알려 주게** 한다.
console.log("⑤ 안 걸린 제목에 자주 나오는 낱말 (새 칸의 후보)");
const words = new Map();
for (const t of missTitles) {
  // 2~4글자 한글 덩어리를 센다. 너무 흔한 말은 아래에서 뺀다.
  for (const w of t.match(/[가-힣]{2,4}/g) ?? []) words.set(w, (words.get(w) ?? 0) + 1);
}
const TOO_COMMON = /^(서울|제주|부산|관광|여행|체험|공원|센터|마을|한국|우리|지역|문화|축제|행사)$/;
const top = [...words]
  .filter(([w, n]) => n >= 3 && !TOO_COMMON.test(w))
  .sort((a, b) => b[1] - a[1])
  .slice(0, 40);
for (const [w, n] of top) console.log(`   ${String(n).padStart(4)}회  ${w}`);

console.log(`\n💾 원본 ${pool.length}곳을 저장했다: src/data/survey-${areaCode}.json`);
console.log("   👉 이 파일과 위 요약을 세션에 알려 주면, 그걸 보고 칸(레지스트리)을 만든다.");
console.log("   ⚠️ seed.ts 는 건드리지 않았다 — 조사만 한 것이다.");
