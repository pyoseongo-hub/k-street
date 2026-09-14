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
// 한 줄에 **구 · 이름 · 수종 · 길이 · 설명 · 스마트서울맵 열쇠**가 다 들어 있다.
//
// 🚨 **손으로 옮겨 적지 않는다.** 110줄을 눈으로 베끼면 반드시 틀린다.
//
// ── 여기까지 오는 데 엿보기를 세 판 돌렸다 (2026-09-14) ──────────────────
//  1판 — mediahub 기사는 **예시만** 든다("…등 20개소"). 전체 목록이 없다.
//  2판 — `storyw/autumn/list.do` 가 진짜 목록이다. 다만 내가 건 거르개
//        ("구 이름 + 길/로 + 90자 이하")가 **설명·문의 줄만** 잡고 정작
//        **이름 줄을 놓쳤다.** 거르개로 고르면 고른 만큼만 보인다.
//        `story/autumn/m.html` 은 **200 을 주면서 오류 페이지로 넘긴다** —
//        HTTP 200 이 곧 "받았다"는 뜻이 아니다. 최종 주소를 찍어서 알았다.
//  3판 — 고르지 말고 원문을 그대로 보니 무늬가 드러났다(아래 ITEM 참고).
//
// ── 저작권 ──────────────────────────────────────────────────────────────
// 목록·설명 글은 서울특별시 공공저작물이다. 출처를 「서울특별시」로 밝힌다.
// ⚠️ **사진은 가져오지 않는다.** 개별 사진의 이용 조건을 확인하지 못했다 —
//    확인 못 한 것은 안 쓴다(이 저장소 규칙).
//
// ── 돌리는 법 ───────────────────────────────────────────────────────────
//   node scripts/fetch-autumn-roads.mjs          # 맛보기 (아무것도 저장 안 함)
//   node scripts/fetch-autumn-roads.mjs --apply  # src/data/autumn-roads.json 에 저장
//
// ⚠️ 작업 세션(샌드박스)은 seoul.go.kr 이 막혀 있다.
//    .github/workflows/fetch-autumn-roads.yml 로 Actions 에서 돌린다.

import { writeFileSync } from "node:fs";

const APPLY = process.argv.includes("--apply");
const OUT = "src/data/autumn-roads.json";
const UA =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36";
const URL_LIST = "https://www.seoul.go.kr/storyw/autumn/list.do";

/** 태그를 털고 실체참조를 되돌린다. */
const clean = (s) =>
  String(s ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lsquo;|&rsquo;|&#39;/g, "'")
    .replace(/&ldquo;|&rdquo;|&quot;/g, '"')
    .replace(/&middot;/g, "·")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim()
    .normalize("NFC"); // ⚠️ 한글 비교 전에 NFC — 보이는 게 같다고 같은 문자열이 아니다.

/**
 * 항목 하나의 무늬 (3판 엿보기에서 확인한 실제 모양):
 *   <span class="num">2</span>
 *   <p class="local">중구</p>
 *   <h3> 덕수궁길<br /><span class='rlocation'>가을단풍길(덕수궁길)</span></h3>
 *   ... poiViewMap?ti=100023&pi=DanGil_002 ...
 *   <dt><span>수종</span></dt><dd>은행나무, 느티나무</dd>
 *   <dt><span>길이</span></dt><dd class="last">0.3km</dd>
 *   <p>덕수궁 옛 돌담과 … <br /><br />문의 : 02-3396-5862 (중구청 공원녹지과)</p>
 */
function parse(html) {
  // 'num' 을 경계로 자른다 — 항목마다 반드시 하나씩 있다.
  const chunks = html.split(/<span class="num">/).slice(1);
  const out = [];
  for (const c of chunks) {
    const num = Number(clean(c.slice(0, c.indexOf("<"))));
    const gu = clean((c.match(/<p class="local">([\s\S]*?)<\/p>/) ?? [])[1]);
    const h3 = (c.match(/<h3>([\s\S]*?)<\/h3>/) ?? [])[1] ?? "";
    // h3 는 「이름<br><span class=rlocation>정식표기</span>」 — 둘을 갈라 담는다.
    const rlocation = clean((h3.match(/class=['"]rlocation['"]>([\s\S]*?)<\/span>/) ?? [])[1]);
    const name = clean(h3.replace(/<span[\s\S]*?<\/span>/g, ""));
    const poi = (c.match(/[?&]pi=([A-Za-z0-9_]+)/) ?? [])[1] ?? "";
    const dds = [...c.matchAll(/<dd[^>]*>([\s\S]*?)<\/dd>/g)].map((m) => clean(m[1]));
    const body = clean((c.match(/<div class="content">[\s\S]*?<p>([\s\S]*?)<\/p>/) ?? [])[1]);
    const note = body.split(/문의\s*:/)[0].trim();
    if (!name || !gu) continue;
    out.push({
      번호: num,
      구: gu,
      이름: name,
      정식표기: rlocation || null,
      수종: dds[0] ?? null,
      길이: dds[1] ?? null,
      설명: note || null,
      지도열쇠: poi || null,
    });
  }
  return out;
}

async function grab(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, "Accept-Language": "ko-KR,ko;q=0.9" },
    signal: AbortSignal.timeout(30000),
    redirect: "follow",
  });
  // 🚨 200 이어도 오류 페이지로 넘어갔을 수 있다(2판에서 당했다). 최종 주소를 본다.
  if (!res.ok || /errorAccess/.test(res.url)) {
    return { why: `HTTP ${res.status} · 최종 ${res.url}` };
  }
  return { html: await res.text() };
}

const first = await grab(URL_LIST);
if (first.why) {
  console.error(`❌ 못 받았다 — ${first.why}`);
  console.error(`   ⚠️ 이건 "자료가 없다"는 뜻이 아니다. 둘을 뭉개지 않는다.`);
  process.exit(1);
}

let rows = parse(first.html);
console.log(`한 판에서 ${rows.length}곳을 읽었다.`);

// 110곳이 한 판에 다 안 왔으면 다음 장을 찾아본다.
if (rows.length < 110) {
  for (const key of ["pageIndex", "page", "cPage", "curPage"]) {
    for (let p = 2; p <= 4; p++) {
      const r = await grab(`${URL_LIST}?${key}=${p}`);
      if (r.why) break;
      const more = parse(r.html).filter((x) => !rows.some((y) => y.번호 === x.번호));
      if (!more.length) break;
      rows.push(...more);
      console.log(`   ${key}=${p} 에서 ${more.length}곳 더 (누적 ${rows.length})`);
      await new Promise((x) => setTimeout(x, 400));
    }
    if (rows.length >= 110) break;
  }
}

rows.sort((a, b) => a.번호 - b.번호);

// ── 받은 것을 눈으로 확인할 수 있게 찍는다 ──────────────────────────────
console.log(`\n받은 것 ${rows.length}곳\n`);
console.log("── 첫 줄 통째로 " + "─".repeat(44));
console.log(JSON.stringify(rows[0], null, 2));
console.log("─".repeat(60) + "\n");

const byGu = new Map();
for (const r of rows) {
  if (!byGu.has(r.구)) byGu.set(r.구, []);
  byGu.get(r.구).push(r);
}
for (const gu of [...byGu.keys()].sort((a, b) => a.localeCompare(b, "ko"))) {
  const l = byGu.get(gu);
  console.log(`【${gu}】 ${l.length}곳`);
  for (const r of l) {
    const bits = [r.수종, r.길이].filter(Boolean).join(" · ");
    console.log(`   ${String(r.번호).padStart(3)}. ${r.이름}${bits ? `  — ${bits}` : ""}`);
  }
}
console.log(`\n합계 ${rows.length}곳 / ${byGu.size}개 구`);

// 빠진 칸을 세어 둔다 — 빈 칸이 틀린 정보보다 낫지만, 몇 개인지는 알아야 한다.
const missing = (k) => rows.filter((r) => !r[k]).length;
console.log(
  `빈 칸: 수종 ${missing("수종")} · 길이 ${missing("길이")} · 설명 ${missing("설명")} · 지도열쇠 ${missing("지도열쇠")}`
);

if (rows.length !== 110) {
  console.log(`\n⚠️ 110곳이 아니라 ${rows.length}곳이다. 서울시가 해마다 수를 바꾸므로
   그 자체로 틀렸다는 뜻은 아니다. 다만 **왜 다른지 알기 전에는 넣지 않는다.**`);
}

if (APPLY) {
  writeFileSync(
    OUT,
    JSON.stringify(
      {
        받은날: new Date().toISOString().slice(0, 10),
        출처: "서울특별시 「서울 단풍길」 (www.seoul.go.kr/storyw/autumn/list.do)",
        저작권: "서울특별시 공공저작물 — 출처표시. 사진은 가져오지 않았다(이용 조건 미확인).",
        곳수: rows.length,
        길: rows,
      },
      null,
      2
    ) + "\n",
    "utf8"
  );
  console.log(`\n💾 ${OUT} 에 저장했다.`);
} else {
  console.log(`\n👀 **맛보기다 — 아무것도 저장하지 않았다.** 넣으려면 --apply.`);
}
