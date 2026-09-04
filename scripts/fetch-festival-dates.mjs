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
import { httpsPhoto } from "./lib/https-photo.mjs";
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

// 🔁 관광공사 서버는 하루에 몇 번씩 접속 자체가 안 열린다(ConnectTimeoutError).
//    한 번 실패하면 통째로 멈추던 구조라, 기다렸다 다시 물어본다
//    (fetch-tour-places.mjs와 같은 이유).
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

async function callTourApi(path, extraParams) {
  // serviceKey를 URLSearchParams에 안 넣는다 — data.go.kr "일반 인증키"는 이미 URL
  // 인코딩된 값이라 한 번 더 인코딩되면 깨진다(fetch-tour-places.mjs와 같은 이유).
  const params = new URLSearchParams({
    MobileOS: "ETC",
    MobileApp: "KStreet",
    _type: "json",
    ...extraParams,
  });
  const res = await fetchWithRetry(`${ROOT}/${path}?serviceKey=${API_KEY}&${params.toString()}`);
  // 🚦 429는 "오늘 몫을 다 썼다"는 뜻이다 — 코드가 틀린 게 아니다. 하루 한 번 도는
  //    작업이라 이 글이 그대로 로그에 남아야 다음 사람이 헤매지 않는다.
  if (res.status === 429) {
    throw new Error(
      "호출 한도 초과(429) — 오늘 관광공사에 물어볼 수 있는 몫을 다 썼다. 자정이 지나면 초기화된다"
    );
  }
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

// 🔗 축제의 **공식 홈페이지**를 받아온다 (2026-09-02 사용자 지적: "이런거 카드
//    이름 누르면 네이버 들어가면 홈페이지 뜨는데 니가 못해?").
//
//    맞는 지적이다 — 하나씩 사람에게 물어볼 일이 아니다. 관광공사는 축제마다
//    공식 홈페이지를 이미 갖고 있고(detailCommon2의 homepage 칸), 이름이 아니라
//    **contentId로 잇기 때문에** 엉뚱한 축제에 남의 주소가 붙을 일이 없다.
//    웹 검색으로 찾으면 "서울숲 재즈"에 "서울 재즈" 주소가 붙는 사고가 난다.
//
//    homepage 칸은 <a href="http://...">...</a> 같은 HTML 조각으로 온다.
//    첫 주소만 뽑아 쓰고, http(s)가 아니면 버린다.
function homepageOf(html) {
  if (!html) return null;
  const s = String(html);
  const href = s.match(/href\s*=\s*["']([^"']+)["']/i)?.[1];
  const url = href ?? s.match(/https?:\/\/[^\s"'<>]+/)?.[0];
  if (!url || !/^https?:\/\//i.test(url)) return null;
  // &amp; 같은 것이 그대로 오는 경우가 있다 — 주소로 쓰려면 되돌려야 한다.
  return url.replace(/&amp;/g, "&").trim();
}

async function fetchHomepage(contentId) {
  try {
    const { list } = await callTourApi("detailCommon2", { contentId: String(contentId) });
    return homepageOf(list[0]?.homepage);
  } catch (e) {
    // 한 곳이 실패해도 전체를 멈추지 않는다 — 날짜 받기가 본업이다.
    // 다만 한도 초과(429)는 그 뒤 전부 실패하므로 위로 던진다.
    if (String(e.message).includes("429")) throw e;
    console.log(`  ↳ 홈페이지 못 받음 (${contentId}): ${e.message}`);
    return null;
  }
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
      // 📷 https로 올려 받는다(scripts/lib/https-photo.mjs 주석 참고).
      image: httpsPhoto(it.firstimage) || null,
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

// ── 공식 홈페이지 채우기 ─────────────────────────────────────────────
// 한 번에 다 부르지 않는다 — 축제마다 한 번씩 부르므로 호출 한도(하루치)를
// 금세 먹는다. **아직 없는 것부터 조금씩** 채운다. 하루 한 번 도니까 며칠이면 다 찬다.
const HOMEPAGE_BATCH = Number(process.env.HOMEPAGE_BATCH ?? 40);
const needHomepage = Object.keys(merged).filter((id) => merged[id].homepage === undefined);
let gotHomepage = 0;
if (needHomepage.length) {
  console.log(`\n공식 홈페이지 받는 중 — 아직 안 본 ${needHomepage.length}곳 중 ${Math.min(HOMEPAGE_BATCH, needHomepage.length)}곳...`);
  for (const id of needHomepage.slice(0, HOMEPAGE_BATCH)) {
    const url = await fetchHomepage(id);
    // null도 저장한다 — "물어봤는데 없더라"와 "아직 안 물어봤다"를 갈라야
    // 다음 실행이 같은 곳을 또 묻지 않는다(undefined = 아직 안 물어봄).
    merged[id].homepage = url;
    if (url) {
      gotHomepage++;
      console.log(`  🔗 ${merged[id].name} → ${url}`);
    }
    await new Promise((r) => setTimeout(r, 150));
  }
  console.log(`  → ${gotHomepage}곳에서 공식 홈페이지를 받았다.`);
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

// ── 🚨 우리가 적어 둔 달이 관광공사와 어긋나지 않는가 ────────────────────
//
// 사용자 지시(2026-09-02): "하루 한번 몇개 안되니 계속 서치해서 최신자료로 업로드".
//
// 여태 이 작업은 **받아서 저장만** 했다. 그래서 우리가 손으로 적어 둔 달이 틀려도
// 아무도 몰랐다 — 한성백제문화제가 10월로 적혀 있었는데 실제로는 2024·2025년
// 두 해 다 9월이었고, 사용자가 "하나하나 수동검사 해"라고 해서야 찾았다.
// 1년 넘게 손님을 엉뚱한 달에 보내고 있었던 셈이다.
//
// 이제 하루 한 번 돌면서 **우리 값과 관광공사 값을 대조해 어긋나면 알린다.**
// 고치지는 않는다 — 관광공사 쪽이 늘 옳은 것도 아니고(장소표처럼 사람이 근거를
// 확인해 적은 값이 이기는 자리가 있다), 자동으로 덮어쓰면 그 판단이 사라진다.
// 사람이 보고 정하도록 **목록만** 낸다.
{
  const seedSrc = readFileSync(new URL("../src/data/seed.ts", import.meta.url), "utf-8");
  const nfc = (s) => String(s ?? "").normalize("NFC");
  const sq = (s) => nfc(s).replace(/[^가-힣a-zA-Z0-9]/g, "");
  const hand = [];
  for (const line of seedSrc.split("\n")) {
    if (!/category: "festival"/.test(line)) continue;
    const name = line.match(/name: "([^"]+)"/)?.[1];
    const start = Number(line.match(/startMonth: (\d+)/)?.[1]);
    const end = Number(line.match(/endMonth: (\d+)/)?.[1] ?? start);
    if (name && start) hand.push({ name, start, end });
  }
  const mismatches = [];
  for (const h of hand) {
    // 이름이 같은 관광공사 축제를 찾는다. 못 찾으면 대조할 것이 없다.
    const hit = Object.values(out).find((v) => {
      const a = sq(v.name), b = sq(h.name);
      return a && (a.includes(b) || b.includes(a));
    });
    if (!hit?.startMonth) continue;
    // 우리가 적어 둔 달 범위 안에 들어오면 문제없다(달이 겹치는 축제 포함).
    const span = [];
    for (let m = h.start, guard = 0; guard < 12; guard++) {
      span.push(m);
      if (m === h.end) break;
      m = m === 12 ? 1 : m + 1;
    }
    if (span.includes(hit.startMonth)) continue;
    mismatches.push(
      `  · ${h.name} — 우리는 ${span.join("·")}월, 관광공사는 ${hit.startMonth}월 (${hit.start})`
    );
  }
  console.log("");
  if (mismatches.length) {
    console.log(`🚨 우리 달과 관광공사가 어긋나는 축제 ${mismatches.length}곳 — 사람이 확인할 것:`);
    mismatches.forEach((m) => console.log(m));
    console.log("   (관광공사 날짜는 지난 회차일 수 있다. 공식 안내를 보고 정할 것.)");
  } else {
    console.log("✅ 우리가 적어 둔 달과 관광공사 날짜가 어긋나는 축제 없음.");
  }
}

console.log("");
console.log(`저장: ${OUT}`);
