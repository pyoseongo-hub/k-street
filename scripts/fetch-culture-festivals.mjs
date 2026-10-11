#!/usr/bin/env node
// 🎪 **전국 축제를 받아 온다** — 한국문화정보원 「한눈에보는문화정보」.
//
// 왜 이 창구인가 (2026-10-11, 사장님: "경주같은데는 축제가 없나")
//   세어 보니 경주 축제가 **0곳**이었다. 범인은 우리가 아니라 **쓰던 창구**였다 —
//   관광공사 searchFestival2 는 경북 전체에 **3곳**(전부 작년 것)뿐이고, 경주는 0이다.
//   경주 시군구 번호가 틀린 게 아니다. 번호표를 받아 **경주시 = 2** 임을 확인했다.
//
// 열쇠 (여기서 두 번 데였다)
//   · 주소 뿌리는 `/B553457/cultureinfo` 다. `/nopenapi/rest/publicperformancedisplays`
//     는 **없는 길**이다(원인코드 12). 설명서를 긁어서 알았다 — scripts/probe-culture-endpoint.mjs
//   · **열쇠를 감싸지 않는다.** encodeURIComponent 로 한 번 더 감싸면 %2B 가 %252B 가 되어
//     「등록되지 않은 서비스키」(원인코드 30)로 돌아온다. 관광공사 쪽과 잣대를 맞춘다.
//   · 요청변수는 **numOfrows**(rows 의 r 이 소문자) · **PageNo**(P 가 대문자) 다.
//
// 🚫 이 파일은 **받아 적기만** 한다. 화면에 붙이는 판정은 따로 한다 —
//    "빈 칸이 틀린 정보보다 낫다".
//
//   TOUR_API_KEY=... node scripts/fetch-culture-festivals.mjs --dry
//   TOUR_API_KEY=... node scripts/fetch-culture-festivals.mjs --apply

import { writeFileSync } from "node:fs";

const KEY = process.env.TOUR_API_KEY;
if (!KEY) { console.error("TOUR_API_KEY 가 없다"); process.exit(1); }

const 인자 = new Set(process.argv.slice(2));
const 맛보기 = !인자.has("--apply");
const 날수 = Number(process.argv.find((a) => a.startsWith("--days="))?.slice(7)) || 120;

const 뿌리 = "https://apis.data.go.kr/B553457/cultureinfo";
const ymd = (d) => `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
const 오늘 = new Date();
const 끝날 = new Date(오늘.getTime() + 날수 * 86400000);

// 🔁 끊겨도 한 번에 포기하지 않는다. 다만 무한정 두드리지도 않는다 — 두드리면 더 막힌다.
async function 받기(url, 횟수 = 3) {
  let 마지막;
  for (let i = 0; i < 횟수; i++) {
    if (i > 0) await new Promise((r) => setTimeout(r, 4000 * i));
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(30000) });
      const t = await r.text();
      const 막힘 = t.match(/<returnReasonCode>(\d+)<\/returnReasonCode>/);
      if (막힘) throw new Error(`포털 원인코드 ${막힘[1]} — ${t.match(/<returnAuthMsg>([^<]*)/)?.[1] ?? ""}`);
      return t;
    } catch (e) { 마지막 = e; }
  }
  throw 마지막;
}

// 📦 XML 한 덩이를 칸 이름 그대로 뜬다. **칸 이름을 짐작하지 않는다** —
//    들어 있는 것을 그대로 담아, 쓸 때 고른다.
function 항목들(xml) {
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((m) => {
    const 칸 = {};
    for (const t of m[1].matchAll(/<([A-Za-z0-9_]+)>([\s\S]*?)<\/\1>/g)) {
      칸[t[1]] = t[2].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").trim();
    }
    return 칸;
  });
}
const 총건수 = (xml) => Number(xml.match(/<totalCount>(\d+)<\/totalCount>/)?.[1] ?? 0);

async function 한장(길, 칸, 쪽, 수 = 100) {
  const q = new URLSearchParams({ PageNo: String(쪽), numOfrows: String(수), ...칸 });
  // ⚠️ 열쇠는 **감싸지 않고** 그대로 붙인다. URLSearchParams 에 넣으면 또 감싼다.
  return await 받기(`${뿌리}/${길}?serviceKey=${KEY}&${q}`);
}

if (맛보기) {
  console.log(`🧪 맛보기 — 아무것도 저장하지 않는다. ${ymd(오늘)} ~ ${ymd(끝날)}\n`);
  for (const [길, 칸] of [
    ["period2", { from: ymd(오늘), to: ymd(끝날), serviceTp: "B" }],
    ["realm2", { from: ymd(오늘), to: ymd(끝날), realmCode: "F000", sortStdr: "1" }],
    ["area2", { from: ymd(오늘), to: ymd(끝날), serviceTp: "B", sido: "경상북도" }],
    ["area2", { from: ymd(오늘), to: ymd(끝날), serviceTp: "B", sido: "경상북도", sigungu: "경주시" }],
  ]) {
    const 이름 = `${길} ${Object.entries(칸).filter(([k]) => k !== "from" && k !== "to").map(([k, v]) => `${k}=${v}`).join(" ")}`;
    try {
      const xml = await 한장(길, 칸, 1, 5);
      const 것들 = 항목들(xml);
      console.log(`── ${이름}\n   ✅ 총 ${총건수(xml)}건 · 이 장 ${것들.length}개`);
      if (것들[0]) {
        console.log(`   📋 첫 항목의 칸 이름과 값:`);
        for (const [k, v] of Object.entries(것들[0])) console.log(`      ${k} = ${String(v).slice(0, 70)}`);
      }
    } catch (e) {
      console.log(`── ${이름}\n   ❌ ${e?.message ?? e}`);
    }
    console.log("");
  }
  console.log("🧭 칸 이름을 확인한 뒤에 --apply 로 저장한다. 그 전에는 아무것도 안 바꾼다.");
  process.exit(0);
}

console.error("아직 --apply 는 막아 뒀다. 칸 이름을 확인한 뒤에 연다.");
process.exit(1);
