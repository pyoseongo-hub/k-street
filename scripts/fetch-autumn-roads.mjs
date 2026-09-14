#!/usr/bin/env node
// 🍁 **서울 단풍길 110선** — 서울시 공식 목록을 받아 온다.
//
// 사장님 (2026-09-14): *"서울 산책로 카테고리 잘 손봐. 가을 단풍 거리 아주 좋은 테마야."*
//
// ── 왜 이 자료인가 ──────────────────────────────────────────────────────
// 앱의 산책로 칸은 지금 **25개 구에 하나씩, 26곳**뿐이다. 가을에 어디를 걸으면
// 좋은지는 한 줄도 없다. 그런데 서울시가 매년 **「서울 단풍길 110선」**을 뽑아
// 발표한다(2025년 기준 110곳 — 작년 103곳에서 7곳 추가). 갈래까지 이미 나뉘어 있다:
//   · 산책길에서 만나는 단풍길 43  · 공원과 함께 만나는 단풍길 28
//   · 도심 속 걷기 좋은 단풍길 20   · 물을 따라 걷는 단풍길 19
// 우리가 만들 「가을 단풍」 테마와 모양이 그대로 맞는다.
//
// 🚨 **손으로 옮겨 적지 않는다.** 110줄을 눈으로 베끼면 반드시 틀린다.
//    (2026-07 Kfood 에서 메뉴판 6장 중 5장이 웹 자료와 달랐던 것과 같은 이유 —
//     사람이 옮기는 단계가 곧 틀리는 단계다.)
//
// ── 이 판은 '엿보기'다 ──────────────────────────────────────────────────
// 어느 주소에서 어떤 모양으로 오는지 **먼저 보고** 나서 파싱을 짠다.
// 골라 찍으면 정작 필요한 칸을 놓친다(관광거리에서 이름 칸을 찍었다가 영어판에서
// 구 이름이 거리 이름인 척 134줄 나온 적이 있다 — 2026-09-14).
//
// ⚠️ 작업 세션(샌드박스)은 seoul.go.kr 이 막혀 있다.
//    .github/workflows/fetch-autumn-roads.yml 로 Actions 에서 돌린다.

const UA =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36";

/** 후보 주소. 하나가 막혀도 나머지를 본다 — "못 물어봤다"와 "없다"를 가른다. */
const TARGETS = [
  { why: "서울시 단풍길 특집 (PC)", url: "https://www.seoul.go.kr/story/autumn/pc.html" },
  { why: "서울시 단풍길 특집 (목록)", url: "https://www.seoul.go.kr/storyw/autumn/list.do" },
  { why: "내 손안에 서울 — 테마별 110선", url: "https://mediahub.seoul.go.kr/archives/2016017" },
  { why: "내 손안에 서울 — 새로 오른 단풍길", url: "https://mediahub.seoul.go.kr/archives/2016109" },
];

/** 태그를 털어 읽을 수 있는 글로 만든다. */
function toText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|tr|h\d)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n+/g, "\n")
    .trim();
}

const GU =
  /(종로구|중구|용산구|성동구|광진구|동대문구|중랑구|성북구|강북구|도봉구|노원구|은평구|서대문구|마포구|양천구|강서구|구로구|금천구|영등포구|동작구|관악구|서초구|강남구|송파구|강동구)/;

for (const t of TARGETS) {
  console.log("\n" + "═".repeat(70));
  console.log(`🍁 ${t.why}`);
  console.log(`   ${t.url}`);
  console.log("═".repeat(70));

  let res;
  try {
    res = await fetch(t.url, {
      headers: { "User-Agent": UA, "Accept-Language": "ko-KR,ko;q=0.9" },
      signal: AbortSignal.timeout(30000),
    });
  } catch (e) {
    console.log(`   ⬜ 못 물어봤다 — ${e.name}: ${e.message}`);
    console.log(`   ⚠️ 이건 "자료가 없다"는 뜻이 아니다. 둘을 뭉개지 않는다.`);
    continue;
  }

  console.log(`   HTTP ${res.status} · ${res.headers.get("content-type") ?? "?"}`);
  if (!res.ok) {
    console.log(`   ⬜ 200 이 아니다 — 여기서 멈춘다.`);
    continue;
  }

  const html = await res.text();
  const text = toText(html);
  console.log(`   원문 ${html.length}자 → 글 ${text.length}자`);

  const hits = (text.match(/단풍/g) ?? []).length;
  const guHits = [...new Set((text.match(new RegExp(GU.source, "g")) ?? []))];
  console.log(`   '단풍' ${hits}번 · 구 이름 ${guHits.length}종 ${guHits.slice(0, 8).join(" ")}`);

  // 목록을 품고 있을 법한 덩어리 — JSON 이 박혀 있으면 그게 제일 깨끗하다.
  const json = html.match(/\{[^{}]*"[^"]*(?:단풍|name|title)[^"]*"[^{}]*\}/g);
  if (json) {
    console.log(`\n   ── 박혀 있는 JSON 조각 ${json.length}개 중 앞 3개 ──`);
    json.slice(0, 3).forEach((j) => console.log("   " + j.slice(0, 300)));
  }

  console.log(`\n   ── 글 앞 2,500자 ${"─".repeat(36)}`);
  console.log(
    text
      .slice(0, 2500)
      .split("\n")
      .map((l) => "   | " + l)
      .join("\n")
  );
  console.log("   " + "─".repeat(60));
}

console.log(`

👀 **엿보기다 — 아무것도 저장하지 않았다.**
   어디서 어떤 모양으로 오는지 보고 나서 파싱을 짠다.
   ⚠️ 110줄을 눈으로 베끼지 않는다. 사람이 옮기는 단계가 곧 틀리는 단계다.`);
