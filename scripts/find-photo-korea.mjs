#!/usr/bin/env node
// 📷 **쓸 수 있는 사진을 찾는다 — 포토코리아(한국관광공사).**
//
// ── 왜 여기인가 (2026-09-17에 갈라 봤다) ─────────────────────────────────
//   사진은 「예쁜 것」이 아니라 **써도 되는 것**을 찾아야 한다. 오늘 확인한 것:
//
//   | 어디 | 공공누리 | 우리가 쓸 수 있나 |
//   |---|---|---|
//   | 서울시 뉴스(news.seoul.go.kr) | **제4유형** 출처표시+상업적이용금지+변경금지 | ❌ |
//   | 한강사업본부 홈페이지 | 대체로 제4유형 | ❌ |
//   | 남의 인스타·블로그 | 저작권자 개인 | ❌ |
//   | **포토코리아(한국관광공사)** | **제1유형** 출처표시만 | ✅ |
//
//   K-Street 는 앱을 알리는 일이라 「상업적 이용」쪽에 선다. 그래서 제4유형은
//   아무리 좋아도 못 쓴다. **제1유형만 쓴다.**
//
// ── 🚨 이름이 비슷한 남의 사진을 물어오지 않게 ──────────────────────────
//   포토코리아 검색은 **지역 코드가 없다.** "드론"으로 찾으면 전국 드론 사진이
//   다 온다. 이 저장소는 「검색 결과를 그 가게 자료로 저장하는」 사고를 이미
//   겪었다(유튜브·사진). 그래서 여기서는 **저장하지 않는다** —
//   제목·촬영장소·촬영시기를 **사람이 보게 찍어 주기만** 한다. 고르는 건 사람이다.
//
// ── 돌리는 법 ────────────────────────────────────────────────────────────
//   TOUR_API_KEY=키 node scripts/find-photo-korea.mjs --keywords "드론,한강 불빛,뚝섬"
//   TOUR_API_KEY=키 node scripts/find-photo-korea.mjs --keywords "드론" --dump
//
//   🪪 「한국관광공사_국문 관광정보 서비스」 활용신청이 돼 있으면 같이 열린다
//      (2026-09-17 확인: ✅ "한강" 700건).

import { fetchWithRetry } from "./lib/tour-fetch.mjs";

const KEY = process.env.TOUR_API_KEY;
if (!KEY) {
  console.error("❌ TOUR_API_KEY 가 없다.");
  process.exit(1);
}

const argv = process.argv.slice(2);
const DUMP = argv.includes("--dump");
const kwArg = argv[argv.indexOf("--keywords") + 1];
const KEYWORDS = (argv.includes("--keywords") && kwArg ? kwArg : "드론")
  .split(",").map((s) => s.trim()).filter(Boolean);
const PER = 30;

const BASE = "https://apis.data.go.kr/B551011/PhotoGalleryService1/gallerySearchList1";

async function search(keyword, pageNo) {
  // 🚨 인증키는 URLSearchParams 에 안 넣는다 — 이미 URL 인코딩된 값이라 깨진다.
  const params = new URLSearchParams({
    MobileOS: "ETC",
    MobileApp: "KStreet",
    _type: "json",
    arrange: "A",
    pageNo: String(pageNo),
    numOfRows: String(PER),
    keyword,
  });
  const res = await fetchWithRetry(`${BASE}?serviceKey=${KEY}&${params.toString()}`);
  const text = await res.text();
  if (/SERVICE_KEY_IS_NOT_REGISTERED/.test(text)) {
    throw new Error("포토코리아 활용신청이 안 돼 있다 — probe-datagokr 로 먼저 재 볼 것");
  }
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  let data;
  try { data = JSON.parse(text); }
  catch { throw new Error(`JSON 이 아니다 — 앞 200자: ${text.slice(0, 200)}`); }
  const body = data?.response?.body;
  const items = body?.items?.item;
  const list = !items ? [] : Array.isArray(items) ? items : [items];
  return { list, total: Number(body?.totalCount ?? list.length) };
}

/** 값이 있는 칸만 고른다. 없으면 undefined — **빈 칸을 지어내지 않는다.** */
const val = (row, ...names) => {
  for (const n of names) {
    const v = row[n];
    if (v == null) continue;
    const s = String(v).trim();
    if (s && s !== "null") return s;
  }
  return undefined;
};

const main = async () => {
  for (const kw of KEYWORDS) {
    const { list, total } = await search(kw, 1);
    console.log(`\n${"═".repeat(70)}\n🔎 "${kw}" — 총 ${total}건 (앞 ${list.length}건)\n${"═".repeat(70)}`);

    if (DUMP && list.length) {
      console.log("🧾 첫 건 날것 (칸 이름 확인용):\n" + JSON.stringify(list[0], null, 1) + "\n");
    }
    if (!list.length) { console.log("   (없다)"); continue; }

    for (const r of list) {
      const title = val(r, "galTitle") ?? "(제목 없음)";
      const where = val(r, "galPhotographyLocation") ?? "—";
      const when  = val(r, "galPhotographyMonth") ?? val(r, "galCreatedtime") ?? "—";
      const who   = val(r, "galPhotographer") ?? "—";
      const url   = val(r, "galWebImageUrl") ?? "—";
      const tags  = val(r, "galSearchKeyword") ?? "";

      console.log(`\n· ${title}`);
      console.log(`   촬영장소 ${where}   |  촬영시기 ${when}  |  촬영자 ${who}`);
      if (tags) console.log(`   검색어   ${tags.slice(0, 110)}`);
      console.log(`   ${url}`);
    }
  }

  console.log(`
${"─".repeat(70)}
🪪 **여기 사진은 공공누리 제1유형이다** — 출처만 밝히면 상업적으로도 쓸 수 있다.
   올릴 때 이렇게 적는다:  사진: 한국관광공사 포토코리아 – <촬영자 이름>

🚨 **자동으로 고르지 않았다.** 포토코리아 검색은 지역 코드가 없어서
   「드론」으로 찾으면 전국 드론 사진이 섞여 온다. 위 촬영장소·제목을 보고
   **사람이 고른다.** 이름만 비슷한 남의 사진을 붙이는 사고를 이 저장소는
   이미 여러 번 겪었다(유튜브 제목·구글 사진).`);
};

main().catch((e) => { console.error(`❌ ${e.message}`); process.exit(1); });
