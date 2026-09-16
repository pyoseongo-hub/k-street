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
// 🔁 **재시도를 쓴다.** 이 서버는 연결이 되다 말다 한다 — 실측으로 7번 중 4번이
//    ConnectTimeout 이었다(scripts/lib/tour-fetch.mjs 머리말). 한 번 물어보고
//    「안 된다」고 적으면 **멀쩡한 창구를 막혔다고 보고하게 된다.**
//    실제로 그렇게 나왔다: 잘 쓰고 있는 국문 창구가 ❌ 로 찍혔다.
import { fetchWithRetry } from "./lib/tour-fetch.mjs";

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
  // 🚨 **인증키를 URLSearchParams 에 넣지 않는다** (2026-09-17에 여기서 틀렸다).
  //    공공데이터포털 인증키는 **이미 URL 인코딩된 값**이다(%2B·%2F·%3D 가 들어 있다).
  //    URLSearchParams 에 넣으면 한 번 더 인코딩돼(%25 2B) 키가 깨진다 —
  //    그러면 **잘 되는 창구까지 「활용신청이 안 돼 있다」로 나온다.**
  //    처음 만들 때 이 실수를 했고, **잘 쓰고 있는 국문 창구를 대조군으로 넣어 둔 덕에**
  //    바로 드러났다. 셋 다 ❌ 면 내 검사가 틀린 것이지 키가 틀린 게 아니다.
  //    저장소의 다른 스크립트도 전부 이렇게 붙인다(fetch-festival-dates.mjs 주석 참고).
  const params = new URLSearchParams({
    MobileOS: "ETC",
    MobileApp: "KStreet",
    _type: "json",
    ...extra,
  });
  const url = `${base}?serviceKey=${KEY}&${params.toString()}`;

  let 결과;
  try {
    // 세 번이면 충분하다 — 재 보는 것이지 자료를 받는 게 아니다.
    const res = await fetchWithRetry(url, { tries: 3, waits: [3000, 6000], log: () => {} });
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
    // 🚨 「fetch failed」 한 줄만 적으면 원인을 못 찾는다 — 진짜 이유는 cause 에 있다.
    결과 = `❌ ${e?.cause?.code ?? e?.cause?.message ?? e.message}`;
  }
  console.log(`${기관.padEnd(8)} ${이름.padEnd(24)} ${결과}`);
}

console.log(`
🧪 **맨 윗줄(국문 관광정보)은 대조군이다.** 그건 지금 일곱 개 워크플로가 쓰고 있어
   반드시 ✅ 여야 한다. 그게 ❌ 면 **아래 결과를 믿지 말 것** — 키가 아니라
   이 검사가 틀린 것이다(인증키를 한 번 더 인코딩하면 그렇게 된다).

🪪 ❌「활용신청이 안 돼 있다」가 뜨면 — 공공데이터포털에서 그 서비스에 **활용신청**을
   한 번 누르면 된다(무료·대개 자동승인). 계정마다 인증키는 **하나**라,
   승인만 되면 GitHub Secrets 의 TOUR_API_KEY 는 **손댈 것이 없다.**`);
