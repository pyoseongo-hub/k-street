#!/usr/bin/env node
// 🍁 **서울 단풍길 110선** — 서울시 공식 목록을 받아 온다.
//
// 사장님 (2026-09-14): *"서울 산책로 카테고리 잘 손봐. 가을 단풍 거리 아주 좋은 테마야."*
//
// ── 왜 이 자료인가 ──────────────────────────────────────────────────────
// 앱의 산책로 칸은 **25개 구에 하나씩, 26곳**뿐이다. 가을에 어디를 걸으면 좋은지는
// 한 줄도 없다. 서울시가 해마다 「서울 단풍길 110선」을 뽑는다(2025년 110곳,
// 총 167km, 나무 약 72,000주). 갈래까지 이미 나뉘어 있다:
//   · 산책길에서 만나는 단풍길 43  · 공원과 함께 만나는 단풍길 28
//   · 도심 속 걷기 좋은 단풍길 20   · 물을 따라 걷는 단풍길 19
//
// 🚨 **손으로 옮겨 적지 않는다.** 110줄을 눈으로 베끼면 반드시 틀린다.
//
// ── 찾아가는 과정 (엿보기를 세 판 돌렸다, 2026-09-14) ────────────────────
//  1판 — mediahub 기사 두 개는 **예시만** 든다("…등 20개소"). 전체 목록이 없다.
//  2판 — `storyw/autumn/list.do` 가 진짜 목록이다(200, 165,729자).
//        다만 내가 건 거르개("구 이름 + 길/로 + 90자 이하")가 **설명·문의 줄만**
//        잡고 정작 **이름 줄을 놓쳤다.** 거르개로 고르면 고른 만큼만 보인다.
//        `story/autumn/m.html` 은 200 을 주지만 실은 오류 페이지로 넘긴다 —
//        **HTTP 200 이 곧 "받았다"는 뜻이 아니다.**
//  3판(지금) — 거르지 않고 **원문 구조를 그대로** 본다. 항목 하나가 어떤 태그로
//        싸여 있는지 보고 나서 파싱을 짠다.
//
// ⚠️ 작업 세션(샌드박스)은 seoul.go.kr 이 막혀 있다.
//    .github/workflows/fetch-autumn-roads.yml 로 Actions 에서 돌린다.

const UA =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36";
const URL_LIST = "https://www.seoul.go.kr/storyw/autumn/list.do";

const res = await fetch(URL_LIST, {
  headers: { "User-Agent": UA, "Accept-Language": "ko-KR,ko;q=0.9" },
  signal: AbortSignal.timeout(30000),
});
console.log(`HTTP ${res.status} · 최종 ${res.url}`);
const html = await res.text();
console.log(`원문 ${html.length}자\n`);

// ① 항목이 몇 개인가 — 눈에 띄는 표지를 여럿 세어 본다.
const marks = {
  "문의 :": /문의\s*:/g,
  "공원녹지과": /공원녹지과/g,
  "<li": /<li[\s>]/g,
  "<dl": /<dl[\s>]/g,
  "class=.*item": /class="[^"]*item[^"]*"/g,
  "class=.*list": /class="[^"]*list[^"]*"/g,
  "단풍": /단풍/g,
};
console.log("── 표지별 개수 " + "─".repeat(40));
for (const [k, re] of Object.entries(marks)) {
  console.log(`   ${k.padEnd(16)} ${(html.match(re) ?? []).length}`);
}

// ② 페이지가 나뉘어 있나 — 110개가 한 판에 다 안 올 수 있다.
const pager = [
  ...new Set(
    (html.match(/(?:page|pageIndex|pageNo|currPage|cPage)\s*[=:]\s*['"]?\d+/gi) ?? []).slice(0, 20)
  ),
];
console.log(`\n── 페이지 나눔 흔적 ${pager.length}개: ${pager.slice(0, 12).join(" | ") || "(없음)"}`);
const forms = [...new Set((html.match(/name="[a-zA-Z_]*[Pp]age[a-zA-Z_]*"/g) ?? []))];
console.log(`   폼 칸: ${forms.join(" ") || "(없음)"}`);

// ③ 🔎 **항목 하나를 통째로 본다.** 여기가 핵심이다 —
//    골라 찍으면 정작 필요한 칸을 놓친다(2판에서 그렇게 놓쳤다).
const at = html.search(/문의\s*:/);
if (at < 0) {
  console.log("\n⬜ '문의 :' 를 못 찾았다. 아래 원문 앞머리를 보고 다시 짠다.");
  console.log(html.slice(0, 3000));
} else {
  console.log(`\n── 첫 '문의 :' 앞뒤 원문 (그대로) ${"─".repeat(28)}`);
  console.log(html.slice(Math.max(0, at - 2600), at + 400));
  console.log("─".repeat(60));

  // 같은 모양이 반복되는지 두 번째 항목도 본다 — 되풀이 무늬를 확인해야 파싱이 선다.
  const at2 = html.indexOf("문의", at + 10);
  if (at2 > 0) {
    console.log(`\n── 두 번째 항목 앞뒤 원문 ${"─".repeat(34)}`);
    console.log(html.slice(Math.max(0, at2 - 1600), at2 + 200));
    console.log("─".repeat(60));
  }
}

console.log(`

👀 **엿보기다 — 아무것도 저장하지 않았다.**
   ⚠️ 110줄을 눈으로 베끼지 않는다. 사람이 옮기는 단계가 곧 틀리는 단계다.`);
