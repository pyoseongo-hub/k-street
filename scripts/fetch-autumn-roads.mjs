#!/usr/bin/env node
// 🍁 **서울 단풍길 110선** — 서울시 공식 목록을 받아 온다.
//
// 사장님 (2026-09-14): *"서울 산책로 카테고리 잘 손봐. 가을 단풍 거리 아주 좋은 테마야."*
//
// ── 왜 이 자료인가 ──────────────────────────────────────────────────────
// 앱의 산책로 칸은 지금 **25개 구에 하나씩, 26곳**뿐이다. 가을에 어디를 걸으면
// 좋은지는 한 줄도 없다. 그런데 서울시가 해마다 **「서울 단풍길 110선」**을 뽑아
// 발표한다(2025년 110곳 — 작년 103곳에서 7곳 추가, 총 167km, 나무 약 72,000주).
// 갈래까지 이미 나뉘어 있다:
//   · 산책길에서 만나는 단풍길 43  · 공원과 함께 만나는 단풍길 28
//   · 도심 속 걷기 좋은 단풍길 20   · 물을 따라 걷는 단풍길 19
// 우리가 만들 「가을 단풍」 테마와 모양이 그대로 맞는다.
//
// 🚨 **손으로 옮겨 적지 않는다.** 110줄을 눈으로 베끼면 반드시 틀린다.
//
// ── 1판에서 배운 것 (2026-09-14) ────────────────────────────────────────
// mediahub 기사 두 개는 **예시만** 든다("삼청동길·정동길·위례성길 등 20개소").
// 전체 110줄은 없다. 그래서 2판은 **특집 페이지와 스마트서울맵**을 본다.
// 로그가 길면 정작 볼 것을 못 보니, **목록처럼 생긴 줄만** 골라 찍는다.
//
// ⚠️ 작업 세션(샌드박스)은 seoul.go.kr 이 막혀 있다.
//    .github/workflows/fetch-autumn-roads.yml 로 Actions 에서 돌린다.

const UA =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36";

const TARGETS = [
  { why: "서울시 단풍길 특집 (PC)", url: "https://www.seoul.go.kr/story/autumn/pc.html" },
  { why: "서울시 단풍길 특집 (모바일)", url: "https://www.seoul.go.kr/story/autumn/m.html" },
  { why: "서울시 단풍길 특집 (목록)", url: "https://www.seoul.go.kr/storyw/autumn/list.do" },
  { why: "스마트서울맵 단풍길 주제도", url: "https://map.seoul.go.kr/smgis2/short/tmap/danpung" },
];

function toText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|tr|td|h\d|span)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lsquo;|&rsquo;/g, "'")
    .replace(/&ldquo;|&rdquo;/g, '"')
    .replace(/&middot;/g, "·")
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+/g, " ");
}

const GU =
  "종로구|중구|용산구|성동구|광진구|동대문구|중랑구|성북구|강북구|도봉구|노원구|은평구|서대문구|마포구|양천구|강서구|구로구|금천구|영등포구|동작구|관악구|서초구|강남구|송파구|강동구";

/** 목록 한 줄처럼 생겼나 — 구 이름 + 길/로/공원/천 이 함께 있는 짧은 줄. */
const looksLikeRow = (l) =>
  new RegExp(`(${GU})`).test(l) && /(길|로|공원|천|둘레|산책|숲)/.test(l) && l.length < 90;

for (const t of TARGETS) {
  console.log("\n" + "═".repeat(70));
  console.log(`🍁 ${t.why}\n   ${t.url}`);
  console.log("═".repeat(70));

  let res;
  try {
    res = await fetch(t.url, {
      headers: { "User-Agent": UA, "Accept-Language": "ko-KR,ko;q=0.9" },
      signal: AbortSignal.timeout(30000),
      redirect: "follow",
    });
  } catch (e) {
    console.log(`   ⬜ 못 물어봤다 — ${e.name}: ${e.message}`);
    console.log(`   ⚠️ 이건 "자료가 없다"는 뜻이 아니다. 둘을 뭉개지 않는다.`);
    continue;
  }
  console.log(`   HTTP ${res.status} · ${res.headers.get("content-type") ?? "?"} · 최종 ${res.url}`);
  if (!res.ok) continue;

  const html = await res.text();
  console.log(`   원문 ${html.length}자`);

  // 🔎 목록을 진짜로 들고 있는 곳은 대개 따로 있는 데이터 파일이다. 그 주소를 찾는다.
  const feeds = [
    ...new Set(
      (html.match(/["'`]([^"'`\s]+\.(?:json|geojson|js|xlsx|csv)(?:\?[^"'`\s]*)?)["'`]/gi) ?? [])
        .map((m) => m.slice(1, -1))
        .filter((u) => !/jquery|bootstrap|swiper|slick|common|analytics|polyfill/i.test(u))
    ),
  ];
  if (feeds.length) {
    console.log(`\n   ── 안에서 가리키는 데이터 파일 ${feeds.length}개 (앞 12개)`);
    feeds.slice(0, 12).forEach((f) => console.log("     · " + f));
  }

  const lines = toText(html)
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const rows = [...new Set(lines.filter(looksLikeRow))];
  console.log(`\n   ── 목록처럼 생긴 줄 ${rows.length}개`);
  rows.slice(0, 130).forEach((r, i) => console.log(`     ${String(i + 1).padStart(3)}. ${r}`));
  if (!rows.length) {
    console.log("     (없다 — 목록이 화면에서 그려지는 자료일 수 있다. 위 데이터 파일을 볼 것)");
  }
}

console.log(`

👀 **엿보기다 — 아무것도 저장하지 않았다.**
   ⚠️ 110줄을 눈으로 베끼지 않는다. 사람이 옮기는 단계가 곧 틀리는 단계다.`);
