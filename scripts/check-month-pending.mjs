#!/usr/bin/env node
// 🔁 **이번 달 축제 중 날짜가 확정 안 된 것을 날마다 세 창구에 물어본다.**
//
// 사장님 (2026-11-05): *"해당 달의 행사는 날짜 지나기 전까지 날짜 확정 없으면 매일 확인하게
// 루틴에 넣어 — 관광공사 · 시청 · 구청 확인"*.
//
// 묻는 곳 — 셋 다 묻고 **각각 무엇이라 답했는지 따로 적는다** (check-one-festival.mjs 와 같은 방식):
//   ① 관광공사 searchFestival2 — 전국. 이번 달 1일부터 시작하는 축제를 다 받아 이름으로 맞춘다
//   ② 서울시 문화포털(culturalEventInfo) — 구청·구 문화재단이 직접 올리는 자리(서울만)
//   ③ 그 축제의 **공식 누리집**(seed 의 officialUrl — 대개 구청·시청 페이지)에 올해 날짜가 떴나
//
// 🚨 **여기서 날짜를 앱에 넣지 않는다.** 찾은 것을 data/month-pending.json 에 적기만 한다.
//    「오늘 전달사항」(todo-board ⑤)이 그걸 보여 주고, 매일 아침 루틴이 사장님께 보고한다.
//    넣을지는 사람이 정한다 — 이름이 비슷한 남의 축제가 걸릴 수 있다(이름 맞추기는 느슨하다).
// 🚨 **「없다」와 「못 물어봤다」를 섞지 않는다.** 서버가 죽은 날 「없다」고 적으면 안 된다.
//
//   npx vite build --ssr scripts/dump-month-pending.ts --outDir dist-ssr && \
//   SEOUL_OPEN_API_KEY=… TOUR_API_KEY=… node scripts/check-month-pending.mjs
import { writeFileSync, existsSync } from "node:fs";
import { fetchWithRetry } from "./lib/tour-fetch.mjs";

const DUMP = "dist-ssr/dump-month-pending.js";
if (!existsSync(DUMP)) { console.error(`❌ ${DUMP} 가 없다 — 먼저 목록을 뽑는다`); process.exit(1); }
const { TARGETS, MONTH } = await import(`../${DUMP}`);
const SEOUL_KEY = (process.env.SEOUL_OPEN_API_KEY ?? "").trim();
const TOUR_KEY = (process.env.TOUR_API_KEY ?? "").trim();
const UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36";
const YEAR = new Date(Date.now() + 9 * 3600_000).getUTCFullYear();

// 이름 맞추기 — 띄어쓰기·기호·「2025」「제12회」 같은 머리를 떼고 본다.
const key = (s) =>
  String(s ?? "").normalize("NFC")
    .replace(/20\d{2}(-20\d{2})?/g, "").replace(/제\s*\d+\s*회/g, "")
    .replace(/[^가-힣a-zA-Z0-9]/g, "");
const same = (a, b) => { const x = key(a), y = key(b); return x.length >= 3 && y.length >= 3 && (x.includes(y) || y.includes(x)); };

console.log(`📋 ${MONTH}월 — 날짜가 확정 안 된 축제 ${TARGETS.length}곳을 묻는다\n`);

// ── ① 관광공사 ─────────────────────────────────────────────────────────────
let tourRows = null; // null = 못 물어봤다
if (TOUR_KEY) {
  tourRows = [];
  const from = `${YEAR}${String(MONTH).padStart(2, "0")}01`;
  for (let page = 1; page <= 20; page++) {
    const q = new URLSearchParams({ MobileOS: "ETC", MobileApp: "KStreet", _type: "json", eventStartDate: from, numOfRows: "500", pageNo: String(page), arrange: "A" });
    try {
      const res = await fetchWithRetry(`https://apis.data.go.kr/B551011/KorService2/searchFestival2?serviceKey=${TOUR_KEY}&${q}`, { tries: 3 });
      const text = await res.text();
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const body = JSON.parse(text)?.response?.body;
      const it = body?.items?.item;
      const list = !it ? [] : Array.isArray(it) ? it : [it];
      tourRows.push(...list);
      if (!list.length || page * 500 >= Number(body?.totalCount ?? 0)) break;
    } catch (e) {
      console.log(`⚠️ 관광공사 ${page}쪽을 못 받았다 (${String(e.message).slice(0, 60)}) — 이후는 「못 물어봄」`);
      tourRows = null;
      break;
    }
  }
  console.log(`① 관광공사: ${tourRows ? `${tourRows.length}건 받음` : "못 물어봄"}`);
} else console.log("① 관광공사: 열쇠 없음 — 못 물어봄");

// ── ② 서울시 문화포털 ───────────────────────────────────────────────────────
let portalRows = null;
if (SEOUL_KEY) {
  portalRows = [];
  for (let start = 1; start < 8001; start += 1000) {
    try {
      const r = await fetch(`http://openapi.seoul.go.kr:8088/${SEOUL_KEY}/json/culturalEventInfo/${start}/${start + 999}/`, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(30000) });
      const data = JSON.parse(await r.text());
      const code = data?.culturalEventInfo?.RESULT?.CODE;
      if (code === "INFO-200") break;
      if (code && code !== "INFO-000") throw new Error(code);
      const rows = data?.culturalEventInfo?.row ?? [];
      if (!rows.length) break;
      portalRows.push(...rows);
    } catch (e) {
      console.log(`⚠️ 문화포털 ${start}~ 를 못 받았다 (${String(e.message).slice(0, 60)}) — 「못 물어봄」`);
      portalRows = null;
      break;
    }
  }
  console.log(`② 문화포털: ${portalRows ? `${portalRows.length}건 받음` : "못 물어봄"}`);
} else console.log("② 문화포털: 열쇠 없음 — 못 물어봄");

// ── ③ 공식 누리집 — 올해 날짜가 적혀 있나 ────────────────────────────────────
const yy = String(YEAR);
const dateRe = new RegExp(`(${yy}\\s*[.\\-년/]\\s*\\d{1,2}\\s*[.\\-월/]\\s*\\d{1,2}\\s*일?[^\\n]{0,40})`, "g");
async function officialCheck(url) {
  if (!/^https?:\/\//.test(url)) return { state: "없음" };
  try {
    const r = await fetch(url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(20000), redirect: "follow" });
    if (!r.ok) return { state: "못 열림", why: `HTTP ${r.status}` };
    const text = (await r.text()).replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ");
    const hits = [...new Set([...text.matchAll(dateRe)].map((m) => m[1].trim()))].slice(0, 3);
    return hits.length ? { state: "올해 날짜 보임", snippets: hits } : { state: "올해 날짜 없음" };
  } catch (e) {
    return { state: "못 열림", why: String(e.message).slice(0, 60) };
  }
}

const out = [];
for (const t of TARGETS) {
  const tour = tourRows === null ? "못 물어봄" : tourRows.filter((r) => same(r.title, t.name)).slice(0, 2).map((r) => ({ title: r.title, start: r.eventstartdate, end: r.eventenddate, contentId: r.contentid }));
  const portal = t.city !== "seoul" ? "서울 아님" : portalRows === null ? "못 물어봄" :
    portalRows.filter((r) => same(r.TITLE, t.name)).slice(0, 2).map((r) => ({ title: r.TITLE, start: r.STRTDATE?.slice(0, 10), end: r.END_DATE?.slice(0, 10), org: r.ORG_NAME, link: r.ORG_LINK || r.HMPG_ADDR || "" }));
  const official = await officialCheck(t.officialUrl);
  const found = (Array.isArray(tour) && tour.length) || (Array.isArray(portal) && portal.length) || official.state === "올해 날짜 보임";
  out.push({ ...t, found: Boolean(found), tour, portal, official: { url: t.officialUrl, ...official } });
  console.log(`${found ? "🔎" : "⬜"} ${t.name} (${t.gu}) — 관광공사 ${Array.isArray(tour) ? tour.length : tour} · 문화포털 ${Array.isArray(portal) ? portal.length : portal} · 공식 ${official.state}`);
}

writeFileSync("data/month-pending.json", JSON.stringify({
  _읽어보세요: [
    "🤖 기계가 날마다 다시 쓴다(check-month-pending). 손으로 고치지 말 것.",
    "이번 달 축제 중 날짜가 확정 안 된 곳을 관광공사·서울시 문화포털·공식 누리집에 물어본 결과다.",
    "🚨 여기 적힌 날짜를 그대로 앱에 넣지 않는다 — 이름 맞추기가 느슨해 남의 축제가 걸릴 수 있다. 사람이 보고 정한다.",
  ],
  checkedAt: new Date().toISOString(),
  month: MONTH,
  items: out,
}, null, 1) + "\n");
const n = out.filter((x) => x.found).length;
console.log(`\n📊 ${MONTH}월 미확정 ${out.length}곳 — 단서 찾음 ${n} · 아직 없음 ${out.length - n}`);
