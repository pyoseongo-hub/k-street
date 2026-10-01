#!/usr/bin/env node
// 🔎 **축제 하나를 공식 창구에 직접 물어본다.** (2026-10-01)
//
// 왜 (사장님이 인스타 캡처를 보내며): *"확인해"*
//   「2026-2027 서울 빛초롱축제 · 청계천 · 12/4~1/31」이라는 글이었다.
//
// 🚨 **인스타 글은 근거가 아니다.** 그 계정은 소개란에 스스로 「AI 콘텐츠」라고 적어 뒀고,
//    글머리도 「일정 최초 공개」였다 — 공식 발표 **전**이라는 뜻이다. 그때가 가장 틀리기 쉽다.
//    CLAUDE.md 의 근거 등급 그대로다: 공식 기관 > 집계 사이트 > 블로그·SNS.
//    ✅ 그래도 **버리지 않는다.** 글은 「찾아볼 단서」로 쓰고, 날짜는 창구에서 받는다.
//
// 어디에 묻나 — 둘 다 묻고 **각각 무엇이라 답했는지 따로 적는다**:
//   ① 서울시 문화포털(culturalEventInfo) — 구청·구 문화재단이 **직접 등록**하는 자리.
//      확정되면 바로 올라온다(fetch-gu-festival-dates.ts 머리말에 근거를 적어 뒀다).
//   ② 한국관광공사 searchFestival2 — 전국이 들어 있지만 **늦다.**
//
// 🚨 **「없다」와 「못 물어봤다」를 섞지 않는다.** 섞으면 서버가 죽은 날에
//    「그런 축제 없다」고 적게 된다 — 이 저장소가 여러 번 데인 자리다.
//
//   SEOUL_OPEN_API_KEY=… TOUR_API_KEY=… node scripts/check-one-festival.mjs --name 빛초롱

import { fetchWithRetry } from "./lib/tour-fetch.mjs";
import { argValue } from "./lib/args.mjs";

// 🎚️ **쓴 적이 있을 때만 값을 본다**(lib/args.mjs) — indexOf 가 -1 이면 argv[0],
//    즉 node 실행 파일 경로가 「찾을 말」로 들어온다.
const NAME = argValue("--name");
if (!NAME) {
  console.error("❌ 쓰는 법: node scripts/check-one-festival.mjs --name 빛초롱");
  process.exit(1);
}
const SEOUL_KEY = (process.env.SEOUL_OPEN_API_KEY ?? "").trim();
const TOUR_KEY = (process.env.TOUR_API_KEY ?? "").trim();
// 🕵️ UA 를 안 보내면 /json/ 을 달라고 해도 XML 이 온다(2026-09-12에 80번 헛돌았다).
const UA =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36";

const nfc = (s) => String(s ?? "").normalize("NFC");
const hit = (s) => nfc(s).replace(/\s+/g, "").includes(nfc(NAME).replace(/\s+/g, ""));

console.log(`🔎 「${NAME}」 — 공식 창구 두 곳에 물어본다\n`);

// ── ① 서울시 문화포털 ───────────────────────────────────────────────────────
console.log("── ① 서울시 문화포털 (구청·구 문화재단이 직접 등록) ──");
if (!SEOUL_KEY) {
  console.log("   ⚠️ SEOUL_OPEN_API_KEY 가 없다 — **못 물어봤다.** 「없다」가 아니다.\n");
} else {
  const found = [];
  let 못받은쪽 = 0;
  // 한 번에 1,000줄. 축제는 수천 건이라 끝까지 훑는다.
  for (let start = 1; start < 8001; start += 1000) {
    const url = `http://openapi.seoul.go.kr:8088/${SEOUL_KEY}/json/culturalEventInfo/${start}/${start + 999}/`;
    let rows;
    try {
      const r = await fetch(url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(30000) });
      const text = await r.text();
      const data = JSON.parse(text);
      const code = data?.culturalEventInfo?.RESULT?.CODE;
      if (code && code !== "INFO-000") {
        if (code === "INFO-200") break; // 더 없다
        throw new Error(`${code} ${data.culturalEventInfo.RESULT.MESSAGE ?? ""}`);
      }
      rows = data?.culturalEventInfo?.row ?? [];
    } catch (e) {
      console.log(`   ⚠️ ${start}~ 쪽을 **못 받았다** (${String(e.message).slice(0, 70)})`);
      못받은쪽++;
      continue;
    }
    if (!rows.length) break;
    for (const r of rows) if (hit(r.TITLE)) found.push(r);
  }
  if (found.length) {
    console.log(`   ✅ ${found.length}건`);
    for (const r of found)
      console.log(
        `      · ${r.TITLE}\n` +
          `        날짜 ${r.STRTDATE?.slice(0, 10)} ~ ${r.END_DATE?.slice(0, 10)}\n` +
          `        곳 ${r.GUNAME} · ${r.PLACE}\n` +
          `        올린 곳 ${r.ORG_NAME} · 등록 ${r.RGSTDATE?.slice(0, 10)}\n` +
          `        안내 ${r.ORG_LINK || r.HMPG_ADDR || "(없음)"}`
      );
  } else if (못받은쪽) {
    console.log(`   ⬜ 못 찾았다 — 그런데 **${못받은쪽}쪽을 못 받았다.** 「없다」고 적지 말 것.`);
  } else {
    console.log("   ⬜ **없다** (다 받아 보고 못 찾았다 — 아직 등록 전일 수 있다)");
  }
  console.log("");
}

// ── ② 한국관광공사 ─────────────────────────────────────────────────────────
console.log("── ② 한국관광공사 searchFestival2 (전국. 올라오는 게 늦다) ──");
if (!TOUR_KEY) {
  console.log("   ⚠️ TOUR_API_KEY 가 없다 — **못 물어봤다.** 「없다」가 아니다.");
} else {
  // 오늘부터 1년치. 겨울 축제는 해를 넘기므로 넉넉히 본다.
  const d = new Date();
  const from = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}01`;
  const found = [];
  let 못받음 = false;
  for (let page = 1; page <= 20; page++) {
    const q = new URLSearchParams({
      MobileOS: "ETC", MobileApp: "KStreet", _type: "json",
      eventStartDate: from, numOfRows: "500", pageNo: String(page), arrange: "A",
    });
    let body;
    try {
      const res = await fetchWithRetry(
        `https://apis.data.go.kr/B551011/KorService2/searchFestival2?serviceKey=${TOUR_KEY}&${q}`,
        { tries: 3 }
      );
      const text = await res.text();
      if (!res.ok) throw new Error(`HTTP ${res.status} — ${text.slice(0, 90)}`);
      body = JSON.parse(text)?.response?.body;
    } catch (e) {
      console.log(`   ⚠️ ${page}쪽을 **못 받았다** (${String(e.message).slice(0, 70)})`);
      못받음 = true;
      break;
    }
    const it = body?.items?.item;
    const list = !it ? [] : Array.isArray(it) ? it : [it];
    for (const r of list) if (hit(r.title)) found.push(r);
    if (!list.length || page * 500 >= Number(body?.totalCount ?? 0)) break;
  }
  if (found.length) {
    console.log(`   ✅ ${found.length}건`);
    for (const r of found)
      console.log(
        `      · ${r.title}\n` +
          `        날짜 ${r.eventstartdate} ~ ${r.eventenddate}\n` +
          `        곳 ${r.addr1 ?? ""}\n` +
          `        번호 ${r.contentid} · 수정 ${r.modifiedtime?.slice(0, 8)}`
      );
  } else if (못받음) {
    console.log("   ⬜ 못 찾았다 — 그런데 **못 받은 쪽이 있다.** 「없다」고 적지 말 것.");
  } else {
    console.log("   ⬜ **없다** (다 받아 보고 못 찾았다)");
  }
}

console.log(`\n🪪 두 창구가 모두 「없다」면 **아직 공식 발표 전**이다 — 그때는 날짜를 적지 않는다.`);
console.log(`   빈 칸이 틀린 날짜보다 낫다. 손님은 그 날짜를 보고 비행기표를 끊는다.`);
