#!/usr/bin/env node
// 🔑 **우리 인증키로 어느 창구까지 열리나** — 물어보기 전에 재 본다.
//
// 왜 필요한가 (2026-09-17) —
//   공공데이터포털은 **계정마다 인증키가 하나**다. 그 키로 열리는 창구는
//   「활용신청」을 해서 승인받은 것뿐이다. 승인 안 된 창구는 **HTTP 403 +
//   SERVICE_KEY_IS_NOT_REGISTERED** 로 막힌다 — 키가 틀린 게 아니다.
//
//   일문·중문 관광정보 때 이걸로 한 번 겪었다. 그때는 「키가 잘못됐나」부터
//   의심했는데, 실제로는 **신청을 안 했을 뿐**이었다. 그래서 다음부터는
//   **사장님께 신청을 부탁드리기 전에 여기서 먼저 재 본다** — 이미 열려 있으면
//   부탁드릴 일이 없다.
//
// 🚨 샌드박스에서는 apis.data.go.kr 이 막혀 있다. Actions 에서 돌린다.
//
//   TOUR_API_KEY=키 node scripts/probe-datagokr.mjs
import { TOUR_TIMEOUT_MS } from "./lib/tour-fetch.mjs";

const KEY = process.env.TOUR_API_KEY;
if (!KEY) {
  console.error("❌ TOUR_API_KEY 가 없다.");
  process.exit(1);
}

/** 재 볼 창구. [기관, 보여 줄 이름, 주소, 붙일 것] */
const TARGETS = [
  ["한국관광공사", "국문 관광정보 (지금 쓰는 것)", "https://apis.data.go.kr/B551011/KorService2/areaCode2", { numOfRows: "1" }],
  ["부산광역시", "부산축제정보", "https://apis.data.go.kr/6260000/FestivalService/getFestivalKr", { pageNo: "1", numOfRows: "3", resultType: "json" }],
  ["부산광역시", "부산명소정보", "https://apis.data.go.kr/6260000/AttractionService/getAttractionKr", { pageNo: "1", numOfRows: "3", resultType: "json" }],
];

for (const [기관, 이름, base, extra] of TARGETS) {
  const url = new URL(base);
  url.searchParams.set("serviceKey", KEY);
  url.searchParams.set("MobileOS", "ETC");
  url.searchParams.set("MobileApp", "KStreet");
  url.searchParams.set("_type", "json");
  for (const [k, v] of Object.entries(extra)) url.searchParams.set(k, v);

  let 결과;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(TOUR_TIMEOUT_MS) });
    const text = await res.text();
    if (/SERVICE_KEY_IS_NOT_REGISTERED/.test(text)) 결과 = "❌ 활용신청이 안 돼 있다 (키 문제가 아니다)";
    else if (!res.ok) 결과 = `❌ HTTP ${res.status}`;
    else {
      // 몇 건이 오는지까지 본다 — 200 인데 0건이면 「열렸지만 비었다」다.
      const n =
        text.match(/"totalCount"\s*:\s*"?(\d+)/)?.[1] ??
        text.match(/<totalCount>(\d+)</)?.[1] ??
        "?";
      결과 = `✅ 열린다 (총 ${n}건)`;
    }
  } catch (e) {
    결과 = `❌ ${e.name === "TimeoutError" ? "30초 안에 답이 없다" : e.message}`;
  }
  console.log(`${기관.padEnd(8)} ${이름.padEnd(24)} ${결과}`);
}

console.log(`
🪪 ❌「활용신청이 안 돼 있다」가 뜨면 — 공공데이터포털에서 그 서비스에 **활용신청**을
   한 번 누르면 된다(무료·대개 자동승인). 계정마다 인증키는 **하나**라,
   승인만 되면 GitHub Secrets 의 TOUR_API_KEY 는 **손댈 것이 없다.**`);
