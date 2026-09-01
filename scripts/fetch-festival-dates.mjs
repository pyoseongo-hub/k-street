#!/usr/bin/env node
// 축제가 **언제 열리는지**를 관광공사에서 받아온다.
//
// 왜 따로 부르나 —
// 처음 자료를 받을 때 쓴 areaBasedList2는 이름·주소·사진·좌표만 준다. 날짜 칸이
// 아예 없다. 그래서 관광공사 축제 57곳은 **열리는 달을 하나도 모르는 상태**였고,
// 계절·월로 고르는 화면에서는 통째로 사라졌다(2026-09-01에 확인).
// 축제 전용 창구인 searchFestival2는 eventstartdate·eventenddate를 함께 준다.
//
// 이름으로 맞추지 않는다 — **contentId로 잇는다.** 두 창구가 같은 번호를 쓰므로
// 대조가 필요 없다. 이름 대조는 이 저장소에서 이미 여러 번 실패했다(NFC 정규화,
// 띄어쓰기, 옛 이름 등) — 번호가 있는데 이름을 볼 이유가 없다.
//
//   TOUR_API_KEY=데이터포털_일반_인증키 node scripts/fetch-festival-dates.mjs
//
// 결과는 src/data/festival-dates.json 에 저장된다(공공누리 1유형, 비밀값 아님).

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..", "src", "data", "festival-dates.json");
const RAW = join(__dirname, "..", "src", "data", "tour-places-raw.json");

const API_KEY = process.env.TOUR_API_KEY;
if (!API_KEY) {
  console.error("TOUR_API_KEY 환경변수가 없다. 예) TOUR_API_KEY=xxxx node scripts/fetch-festival-dates.mjs");
  process.exit(1);
}

const ROOT = "https://apis.data.go.kr/B551011/KorService2";

async function callTourApi(path, extraParams) {
  // serviceKey를 URLSearchParams에 안 넣는다 — data.go.kr "일반 인증키"는 이미 URL
  // 인코딩된 값이라 한 번 더 인코딩되면 깨진다(fetch-tour-places.mjs와 같은 이유).
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

// 작년 1월 1일부터 훑는다. 축제는 해마다 같은 시기에 다시 열리므로, 지난 회차의
// 날짜만 있어도 "몇 월에 열리는 축제"인지는 알 수 있다. 올해 것만 받으면 아직
// 등록 안 된 하반기 축제가 통째로 빠진다.
const YEAR = new Date().getFullYear();
const FROM = `${YEAR - 1}0101`;

async function fetchAllFestivals() {
  const items = [];
  let pageNo = 1;
  const numOfRows = 500;
  for (;;) {
    const { list, totalCount } = await callTourApi("searchFestival2", {
      areaCode: "1", // 서울
      eventStartDate: FROM,
      numOfRows: String(numOfRows),
      pageNo: String(pageNo),
      arrange: "A",
    });
    items.push(...list);
    if (items.length >= totalCount || list.length < numOfRows) break;
    pageNo++;
    if (pageNo > 20) break; // 안전장치
    await new Promise((r) => setTimeout(r, 200));
  }
  return items;
}

const SEOUL_DISTRICTS = [
  "종로구", "중구", "용산구", "성동구", "광진구", "동대문구", "중랑구", "성북구",
  "강북구", "도봉구", "노원구", "은평구", "서대문구", "마포구", "양천구", "강서구",
  "구로구", "금천구", "영등포구", "동작구", "관악구", "서초구", "강남구", "송파구", "강동구",
];

function guOf(addr) {
  return SEOUL_DISTRICTS.find((g) => (addr || "").includes(g)) ?? null;
}

/** "20260919" → 9. 형식이 다르면 null — 지어내지 않는다. */
function monthOf(yyyymmdd) {
  const s = String(yyyymmdd ?? "");
  if (!/^\d{8}$/.test(s)) return null;
  const m = Number(s.slice(4, 6));
  return m >= 1 && m <= 12 ? m : null;
}

const raw = await fetchAllFestivals();
console.log(`searchFestival2 응답: ${raw.length}건`);

// 같은 축제가 회차별로 여러 건 올 수 있다(2025년치·2026년치). contentId마다
// **가장 최근 회차**만 남긴다 — 옛 회차의 날짜를 쓰면 요일이 어긋난다.
const byId = new Map();
for (const it of raw) {
  const id = String(it.contentid ?? "");
  if (!id) continue;
  const start = String(it.eventstartdate ?? "");
  const prev = byId.get(id);
  if (!prev || start > prev.start) {
    byId.set(id, {
      name: String(it.title ?? "").trim(),
      gu: guOf(it.addr1),
      addr: String(it.addr1 ?? "").trim() || null,
      start,
      end: String(it.eventenddate ?? ""),
      startMonth: monthOf(it.eventstartdate),
      endMonth: monthOf(it.eventenddate),
      image: it.firstimage || null,
      lat: it.mapy ? Number(it.mapy) : null,
      lng: it.mapx ? Number(it.mapx) : null,
    });
  }
}

// 날짜를 못 읽은 것은 아예 안 적는다 — 빈 칸이 틀린 값보다 낫다.
const dated = new Map();
for (const [id, v] of byId) {
  if (v.startMonth != null) dated.set(id, v);
}

// 🚨 이미 받아 둔 것과 **합친다. 덮어쓰지 않는다.**
// 2026-09-01 첫 실행 결과가 9~12월 57곳뿐이었다 — 관광공사 축제 창구는 이미 끝난
// 축제를 내리고 **다가올 것만** 올려 두기 때문이다(그날이 9월이라 가을·겨울만 있었다).
// 봄 축제는 봄이 가까워져야 올라온다. 그래서 이 스크립트는 **달마다 자동으로 돌고**,
// 돌 때마다 새로 뜬 것을 보태야 1년이면 열두 달이 다 찬다.
// 파일을 통째로 덮어쓰면 다음 달 실행이 이번에 받은 가을 축제를 지워 버린다.
let previous = {};
try {
  previous = JSON.parse(readFileSync(OUT, "utf-8"));
} catch {
  /* 첫 실행 */
}
const merged = { ...previous };
let added = 0;
let updated = 0;
for (const [id, v] of dated) {
  const old = merged[id];
  if (!old) added++;
  else if (old.start !== v.start) updated++;
  // 같은 축제가 새 회차로 다시 뜨면 최신으로 갈아 준다. 옛 회차보다 최신이 낫다.
  if (!old || v.start > old.start) merged[id] = v;
}
const out = Object.fromEntries(
  Object.entries(merged).sort((a, b) => Number(a[0]) - Number(b[0]))
);
writeFileSync(OUT, JSON.stringify(out, null, 2) + "\n");
console.log(
  `저장 대상: 새로 ${added}곳 · 회차 갱신 ${updated}곳 · 이미 있던 것 포함 모두 ${Object.keys(out).length}곳`
);

// ── 요약: 지금 앱이 가진 57곳 중 몇 곳이 채워졌나 ─────────────────────
let already = [];
try {
  already = JSON.parse(readFileSync(RAW, "utf-8")).festival ?? [];
} catch {
  /* 원본이 없으면 대조는 건너뛴다 */
}
const matched = already.filter((f) => out[String(f.contentId)]);
const missing = already.filter((f) => !out[String(f.contentId)]);
const brandNew = Object.keys(out).filter(
  (id) => !already.some((f) => String(f.contentId) === id)
);

console.log("");
console.log(`이번에 받은 축제: ${dated.size}곳 · 파일에 쌓인 전체: ${Object.keys(out).length}곳`);
console.log(`  · 앱에 이미 있는 ${already.length}곳 중 → ${matched.length}곳 채움, ${missing.length}곳 못 채움`);
console.log(`  · 앱에 없던 새 축제 → ${brandNew.length}곳`);

const byMonth = {};
for (const v of Object.values(out)) byMonth[v.startMonth] = (byMonth[v.startMonth] ?? 0) + 1;
console.log("");
console.log("달별 축제 수:");
for (let m = 1; m <= 12; m++) console.log(`  ${String(m).padStart(2)}월 — ${byMonth[m] ?? 0}곳`);

if (missing.length) {
  console.log("");
  console.log("날짜를 못 받은 곳(축제 창구에 등록이 없는 것들):");
  for (const f of missing.slice(0, 30)) console.log(`  · ${f.name} (${f.gu ?? "?"})`);
  if (missing.length > 30) console.log(`  … 그 밖에 ${missing.length - 30}곳`);
}

console.log("");
console.log(`저장: ${OUT}`);
