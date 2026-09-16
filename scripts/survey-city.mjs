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

import { fetchWithRetry } from "./lib/tour-fetch.mjs";
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
const argOf = (flag) => {
  const i = args.indexOf(flag);
  const v = i >= 0 ? args[i + 1] : undefined;
  return v && !v.startsWith("--") ? v : undefined;
};
let areaCode = argOf("--area");
// 🏙️ **이름으로도 찾을 수 있다** (2026-09-16에 넣었다).
//    번호를 외워서 넣지 않는다는 원칙은 그대로다 — 이름을 줘도 **관광공사에 물어봐서**
//    번호를 알아내고, 무엇에 맞췄는지 화면에 찍는다. 사람이 눈으로 확인할 수 있어야 한다.
//    번호를 손으로 옮겨 적는 단계가 하나 줄면 그만큼 잘못 옮겨 적을 일도 없다.
const wantCity = argOf("--city");

const ROOT = "https://apis.data.go.kr/B551011/KorService2";


/**
 * 🚨 **한 군데가 안 되면 그 한 군데만 비운다 — 통째로 죽지 않는다.**
 *
 * 이게 이 스크립트에서 가장 중요한 규칙이다. 조사는 여러 번 물어봐야 끝나는데,
 * 서버가 되다 말다 하는 상황에서 「하나라도 실패하면 중단」이면 **아무것도 못 건진다.**
 * 실제로 두 번 그렇게 날아갔다. 절반이라도 받아 두면 그걸로 판단을 시작할 수 있고,
 * 무엇이 비었는지도 화면에 남는다 — **빈 것과 못 받은 것을 갈라서 적는 게 핵심이다.**
 */
const failures = [];
async function tryOr(label, fallback, fn) {
  try {
    return await fn();
  } catch (e) {
    const why = e?.cause?.code || e?.message || String(e);
    console.log(`   ⚠️ ${label} — 못 받았다 (${why})`);
    // 🚨 **원인을 단정하지 않는다** (2026-09-10에 내가 틀렸다).
    //    처음엔 무조건 "서버가 안 열린 것"이라고 적어 뒀는데, 실제로 온 것은
    //    **HTTP 400** 이었다 — 그건 서버 탓이 아니라 **내 호출이 틀렸다**는 뜻이다.
    //    원인을 잘못 적으면 다음 사람이 엉뚱한 데를 고치거나, 고칠 것을 안 고치고
    //    "다시 돌리면 되겠지" 하며 몇 번을 헛돌린다. 그래서 코드를 보고 갈라서 말한다.
    const isTimeout = /TIMEOUT|ECONN|ENOTFOUND|fetch failed/i.test(String(why));
    const is4xx = /HTTP 4\d\d/.test(String(why));
    if (isTimeout)
      console.log(`      → 서버가 안 열린 것이다. 자료가 없는 게 아니다 — 나중에 다시 돌리면 채워진다.`);
    else if (is4xx)
      console.log(`      → **부르는 쪽이 틀렸다.** 다시 돌려도 그대로다 — 이 호출을 고쳐야 한다.`);
    else console.log(`      → 원인이 위 한 줄 말고는 분명하지 않다. 그대로 옮겨 적어 두고 확인할 것.`);
    failures.push(`${label}(${why})`);
    return fallback;
  }
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
if (!areaCode || wantCity) {
  console.log("🗺️  관광공사가 쓰는 **지역 코드**를 물어본다 (외워서 넣지 않는다)\n");
  const { list } = await call("areaCode2", { numOfRows: "50" });
  for (const a of list) console.log(`   ${String(a.code).padStart(2)}  ${a.name}`);

  if (!wantCity) {
    console.log("\n다음 단계 — 위에서 고른 번호로 다시 돌린다:");
    console.log("   node scripts/survey-city.mjs --area <번호>   (또는 --city 부산)");
    process.exit(0);
  }

  // 🚨 **하나로 좁혀지지 않으면 멈춘다.** 여러 개에 걸리는데 아무거나 고르면
  //    조용히 엉뚱한 도(道) 자료를 받아 온다 — 그게 이 스크립트가 제일 무서워하는 사고다.
  const hits = list.filter((a) => String(a.name).includes(wantCity));
  if (hits.length !== 1) {
    console.error(`\n❌ 「${wantCity}」로는 한 곳으로 좁혀지지 않는다 (${hits.length}곳).`);
    if (hits.length) console.error(`   걸린 것 — ${hits.map((h) => `${h.code} ${h.name}`).join(" · ")}`);
    console.error("   위 목록에서 골라 --area <번호> 로 다시 돌릴 것.");
    process.exit(1);
  }
  areaCode = String(hits[0].code);
  console.log(`\n✅ 「${wantCity}」 → 관광공사 지역 ${areaCode} **${hits[0].name}**`);
  console.log("   (번호를 외워서 넣은 게 아니라 물어봐서 받은 것이다)\n");
}

// ── 그 지역의 시군구 목록 ───────────────────────────────────────────────
//
// 🚨 **여기가 이번 조사의 핵심이다.** 서울은 이 목록이 「○○구」 25개인데,
//    제주는 무엇으로 나오는지 봐야 우리 코드의 `gu` 칸에 무엇을 넣을지 정할 수 있다.
console.log(`🔍 지역 ${areaCode} 를 조사한다\n`);
console.log("① 이 지역은 무엇으로 나뉘나 (관광공사 기준)");
const sigungu = await tryOr("시군구 목록", [], async () => {
  const { list } = await call("sigunguCode2", { areaCode, numOfRows: "60" });
  return list;
});
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
  const items = await tryOr(`${t.label} 받기`, [], () => fetchAll(t.id));
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

// ── 📷 사진이 붙어 있나 ─────────────────────────────────────────────────
//
// 🚨 **이 도시를 열 수 있나 없나가 여기서 갈린다.**
//    사장님 (2026-09-16): *"사진 없으면 의미 없어."*
//    실제로 앱 코드가 그렇게 돼 있다 — ALL_PLACES 가 **사진 없는 곳을 걸러 낸다.**
//    곳을 1,000개 넣어도 사진이 없으면 화면에는 한 곳도 안 나온다.
//
//    관광공사 목록은 대표사진 주소(firstimage)를 같이 준다. 그래서 **자료를 받은
//    이 자리에서 바로 셀 수 있다** — 갤러리를 따로 뒤지기 전에 큰 그림이 나온다.
//
// ⚠️ **여기 숫자는 「대표사진이 있다」까지만 말한다.** 그 사진이 진짜 그 곳 사진인지는
//    이 단계가 모른다. 남의 가게 사진이 붙는 사고를 케이푸드에서 겪었다 —
//    받아서 쓸 때 이름 대조를 따로 해야 한다.
console.log("④ 📷 대표사진이 붙어 있는 곳 (없으면 앱 화면에 안 나온다)");
const hasPhoto = (it) => Boolean(String(it.firstimage ?? "").trim());
const photoAll = pool.filter(hasPhoto).length;
const pct = (n, d) => (d ? `${Math.round((n / d) * 100)}%` : "—");
console.log(`   전체        ${String(photoAll).padStart(5)} / ${String(pool.length).padStart(5)}곳  (${pct(photoAll, pool.length)})`);
for (const t of POOL_TYPES) {
  const mine = pool.filter((it) => it.__type === t.label);
  if (!mine.length) continue;
  const n = mine.filter(hasPhoto).length;
  console.log(`   ${t.label.padEnd(10)} ${String(n).padStart(5)} / ${String(mine.length).padStart(5)}곳  (${pct(n, mine.length)})`);
}
// 동네별로도 본다 — 사진이 한 동네에만 쏠려 있으면 「도시를 열었다」고 할 수 없다.
console.log("\n   동네별 (사진 있는 곳 기준 · 위 10곳)");
const byGu = new Map();
for (const it of pool) {
  const gu = String(it.addr1 ?? "").split(/\s+/)[1] || "(주소 없음)";
  const cur = byGu.get(gu) ?? { all: 0, pic: 0 };
  cur.all++;
  if (hasPhoto(it)) cur.pic++;
  byGu.set(gu, cur);
}
const guRows = [...byGu].sort((a, b) => b[1].pic - a[1].pic);
for (const [gu, v] of guRows.slice(0, 10))
  console.log(`   ${gu.padEnd(10)} ${String(v.pic).padStart(4)} / ${String(v.all).padStart(4)}곳  (${pct(v.pic, v.all)})`);
const empty = guRows.filter(([, v]) => v.pic === 0);
if (empty.length)
  console.log(`   ⚠️ 사진이 한 장도 없는 동네 ${empty.length}곳 — ${empty.map(([g]) => g).join(" · ")}`);
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

console.log("⑤ 서울 규칙을 그대로 대 보면");
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
console.log("⑥ 안 걸린 제목에 자주 나오는 낱말 (새 칸의 후보)");
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

// ⚠️ **못 받은 것과 없는 것을 갈라서 적는다.**
//    「시장 0곳」이 「이 도시엔 시장이 없다」인지 「서버가 안 열려 못 물어봤다」인지
//    구분이 안 되면, 없는 자료를 근거로 칸을 만들게 된다 — 그게 가장 나쁜 실수다.
if (failures.length) {
  console.log(`\n⚠️ 못 받은 것 ${failures.length}가지 — ${failures.join(" · ")}`);
  console.log("   위 숫자는 **그만큼 덜 센 것**이다. 「없다」로 읽으면 안 된다.");
  console.log("   관광공사 서버가 되다 말다 하는 날이 있다 — 나중에 다시 돌리면 채워진다.");
}

console.log(`\n💾 원본 ${pool.length}곳을 저장했다: src/data/survey-${areaCode}.json`);
console.log("   👉 이 파일과 위 요약을 세션에 알려 주면, 그걸 보고 칸(레지스트리)을 만든다.");
console.log("   ⚠️ seed.ts 는 건드리지 않았다 — 조사만 한 것이다.");
