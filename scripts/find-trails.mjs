#!/usr/bin/env node
// 🥾 둘레길·자락길·숲길을 **이름으로 직접** 찾아본다. 아무것도 저장하지 않는다 —
//    보기만 하는 스크립트다.
//
// 왜 필요한가 (2026-09-02) — 사용자가 "둘레길 사진 엄청 많던데 구마다 자리 만들어
// 등록해"라고 했는데, 우리가 가진 건 12곳뿐이고 그마저 다 등록돼 있다.
// 자료를 받는 창구(areaBasedList2)를 의심했는데, 관광공사가 스스로
// **"여행코스(25) 서울 전체 건수 0"**이라고 답했다. 우리 호출이 틀린 게 아니다.
//
// 남은 가능성이 하나 있다 — areaBasedList2는 **지역코드가 '서울'로 붙은 것만**
// 돌려준다. 서울둘레길처럼 여러 구를 가로지르는 코스는 지역코드를 못 붙이는
// 일이 흔하고, 그러면 우리 그물에 아예 안 걸린다.
//
// 그래서 여기서는 지역을 걸지 않고 **이름으로** 훑는다(searchKeyword2).
// 서울 주소를 가진 것만 남겨서, 지금 가진 것과 견줘 **새로 나온 것**을 보여 준다.
//
//   TOUR_API_KEY=... node scripts/find-trails.mjs
//
// ⚠️ 이 스크립트는 판단하지 않는다. 목록을 사람이 보고 정한다(정확도 원칙:
//    확인 못 한 것은 넣지 않는다).

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const D = (f) => join(__dirname, "..", "src", "data", f);

const API_KEY = process.env.TOUR_API_KEY;
if (!API_KEY) {
  console.error("TOUR_API_KEY 환경변수가 없다.");
  process.exit(1);
}

const ROOT = "https://apis.data.go.kr/B551011/KorService2";

// 관광공사 서버는 하루에 몇 번씩 접속 자체가 안 열린다 — fetch-tour-places.mjs와 같은 이유.
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
      console.log(`     ↳ 접속 실패(${i}/${tries}, ${why}) — ${WAITS[i - 1] / 1000}초 뒤 다시 시도`);
      await new Promise((r) => setTimeout(r, WAITS[i - 1]));
    }
  }
  const why = lastErr?.cause?.code || lastErr?.cause?.message || lastErr?.message;
  throw new Error(`관광공사 서버에 ${tries}번 다 연결하지 못했다 (${why})`);
}

// 🚦 429는 "오늘 몫을 다 썼다"는 뜻이다 — 코드가 틀린 게 아니다. 그런데 `HTTP 429`
//    한 줄만 보면 무슨 일인지 알 수가 없어서, 무엇을 하면 되는지까지 적어 준다
//    (2026-09-02: 사진 246곳 받고 자료를 여러 번 다시 받은 날 이걸 만났다).
function checkStatus(res) {
  if (res.ok) return;
  if (res.status === 429) {
    throw new Error(
      "호출 한도 초과(429) — 오늘 관광공사에 물어볼 수 있는 몫을 다 썼다.\n" +
        "   자정이 지나면 초기화된다. 내일 다시 돌리면 된다.\n" +
        "   (공공데이터포털 → 마이페이지 → 활용신청 현황에서 남은 횟수를 볼 수 있다.)"
    );
  }
  throw new Error(`HTTP ${res.status}`);
}

async function searchKeyword(keyword, { areaCode } = {}) {
  const items = [];
  let pageNo = 1;
  let firstTotal = null;
  const numOfRows = 100;
  for (;;) {
    const params = new URLSearchParams({
      MobileOS: "ETC",
      MobileApp: "KStreet",
      _type: "json",
      keyword,
      numOfRows: String(numOfRows),
      pageNo: String(pageNo),
      arrange: "A",
      ...(areaCode ? { areaCode } : {}),
    });
    const res = await fetchWithRetry(`${ROOT}/searchKeyword2?serviceKey=${API_KEY}&${params}`);
    checkStatus(res);
    const text = await res.text();
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
    const raw = body?.items?.item;
    const list = !raw ? [] : Array.isArray(raw) ? raw : [raw];
    const total = Number(body?.totalCount ?? list.length);
    if (firstTotal === null) firstTotal = total;
    items.push(...list);
    if (items.length >= total || list.length < numOfRows) break;
    pageNo++;
    if (pageNo > 10) break;
    await new Promise((r) => setTimeout(r, 200));
  }
  return { items, total: firstTotal ?? 0 };
}

const SEOUL_DISTRICTS = [
  "종로구", "중구", "용산구", "성동구", "광진구", "동대문구", "중랑구", "성북구",
  "강북구", "도봉구", "노원구", "은평구", "서대문구", "마포구", "양천구", "강서구",
  "구로구", "금천구", "영등포구", "동작구", "관악구", "서초구", "강남구", "송파구",
  "강동구",
];
const guOf = (addr) => SEOUL_DISTRICTS.find((g) => (addr || "").includes(g));
const nfc = (s) => String(s ?? "").normalize("NFC");
const squash = (s) => nfc(s).replace(/[^가-힣a-zA-Z0-9]/g, "");

// 지금 가진 것 — 이걸로 "새로 나온 것"을 가른다.
const known = new Set();
{
  const raw = JSON.parse(readFileSync(D("tour-places-raw.json"), "utf-8"));
  for (const list of Object.values(raw)) {
    if (Array.isArray(list)) for (const p of list) known.add(squash(p.name));
  }
  const seedSrc = readFileSync(D("seed.ts"), "utf-8");
  for (const m of seedSrc.matchAll(/name: "([^"]+)"/g)) known.add(squash(m[1]));
}

const KEYWORDS = ["둘레길", "자락길", "숲길", "산책로", "생태길", "나들길", "성곽길", "코스"];

const seen = new Map(); // contentId → 항목

console.log("이름으로 직접 찾아본다 (지역 제한 없이).\n");
for (const kw of KEYWORDS) {
  const { items, total } = await searchKeyword(kw);
  const seoul = items.filter((it) => guOf(it.addr1));
  console.log(`「${kw}」 전국 ${total}건 → 서울 주소 ${seoul.length}건`);
  for (const it of seoul) {
    if (!seen.has(it.contentid)) seen.set(it.contentid, it);
  }
  await new Promise((r) => setTimeout(r, 300));
}

const all = [...seen.values()];
const fresh = all.filter((it) => !known.has(squash(it.title)));

console.log(`\n서울 주소로 찾은 것 ${all.length}곳 · 그중 **처음 보는 것 ${fresh.length}곳**\n`);

if (fresh.length === 0) {
  console.log("새로 나온 게 없다 — 이미 다 가지고 있다는 뜻이다.");
} else {
  const byGu = new Map();
  for (const it of fresh) {
    const gu = guOf(it.addr1) ?? "(구 모름)";
    if (!byGu.has(gu)) byGu.set(gu, []);
    byGu.get(gu).push(it);
  }
  for (const gu of SEOUL_DISTRICTS) {
    const list = byGu.get(gu);
    if (!list?.length) continue;
    console.log(`\n### ${gu} (${list.length}곳)`);
    for (const it of list) {
      const photo = it.firstimage ? "📷" : "⬜";
      const type = it.contenttypeid;
      console.log(`  ${photo} ${it.title}  [type ${type} · id ${it.contentid}]`);
      console.log(`       ${it.addr1 ?? "(주소 없음)"}`);
    }
  }
  const withPhoto = fresh.filter((it) => it.firstimage).length;
  console.log(`\n요약 — 처음 보는 것 ${fresh.length}곳 중 사진 있는 것 ${withPhoto}곳.`);
}

console.log("\n👀 아무것도 저장하지 않았다. 목록을 보고 무엇을 넣을지 사람이 정한다.");
