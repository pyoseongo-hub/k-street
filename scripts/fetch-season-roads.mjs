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
// ── 🌸 봄꽃길도 같은 틀이다 (2026-09-14) ───────────────────────────────
// 처음엔 `storyw/spring/list.do` 를 두드렸다가 404 를 맞았다. 그런데 앱의 꽃길
// 항목 설명에 *"봄꽃길 175선 공식 예시"* 라고 적혀 있었다 — **앱이 이미 알고
// 있었다.** 주소는 `storyw/springflowerway/` 였다(175곳 · 총 248km · 4개 테마).
//
// 그래서 **파서를 하나로 합쳤다.** 둘로 두면 한쪽만 고쳐지는 일이 생긴다
// (Kfood 에서 배운 것 — 잣대가 둘이면 반쪽 적용이 생긴다).
//
// ── 돌리는 법 ───────────────────────────────────────────────────────────
//   node scripts/fetch-season-roads.mjs --season autumn           # 맛보기
//   node scripts/fetch-season-roads.mjs --season spring --apply   # 저장
//
// ⚠️ 작업 세션(샌드박스)은 seoul.go.kr 이 막혀 있다.
//    .github/workflows/fetch-season-roads.yml 로 Actions 에서 돌린다.

import { writeFileSync } from "node:fs";

const APPLY = process.argv.includes("--apply");
const SEASON = (process.argv[process.argv.indexOf("--season") + 1] ?? "autumn").toLowerCase();

const SEASONS = {
  autumn: {
    이름: "서울 단풍길",
    urls: ["https://www.seoul.go.kr/storyw/autumn/list.do"],
    out: "src/data/autumn-roads.json",
    발표곳수: 110,
    출처: "서울특별시 「서울 단풍길」 (www.seoul.go.kr/storyw/autumn/list.do)",
  },
  spring: {
    이름: "서울 봄꽃길 175선",
    // 검색에서 실제로 본 주소는 listm.do(모바일)였다. 둘 다 적어 두고 되는 쪽을 쓴다 —
    // 하나가 404 여도 "자료가 없다"고 단정하지 않기 위해서다.
    urls: [
      "https://www.seoul.go.kr/storyw/springflowerway/list.do",
      "https://www.seoul.go.kr/storyw/springflowerway/listm.do",
    ],
    out: "src/data/spring-roads.json",
    발표곳수: 175,
    출처: "서울특별시 「서울 봄꽃길 175선」 (www.seoul.go.kr/storyw/springflowerway)",
  },
};

const CFG = SEASONS[SEASON];
if (!CFG) {
  console.error(`❌ --season 은 ${Object.keys(SEASONS).join(" 또는 ")} 다. 받은 값: ${SEASON}`);
  process.exit(1);
}
const OUT = CFG.out;
const UA =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36";

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
/**
 * 🍁 네 갈래. 서울시가 발표한 갈래별 곳 수가 **검산 열쇠**다 —
 * 항목을 싸고 있는 `<div class="box t1">` 의 t1~t4 가 갈래일 것이라고 짐작했는데,
 * 짐작이 맞으면 아래 수와 딱 맞아떨어진다. **안 맞으면 갈래를 비워 둔다.**
 * (짐작을 사실처럼 저장하지 않는다 — 빈 칸이 틀린 것보다 낫다.)
 */
const THEMES = [
  { 이름: "도심 속 걷기 좋은 단풍길", 표지: /도심\s*속\s*걷기\s*좋은/, 발표곳수: 20 },
  { 이름: "물을 따라 걷는 단풍길", 표지: /물을?\s*따라\s*걷는/, 발표곳수: 19 },
  { 이름: "공원과 함께 만나는 단풍길", 표지: /공원과\s*함께\s*만나는/, 발표곳수: 28 },
  { 이름: "산책길에서 만나는 단풍길", 표지: /산책길에?\s*(?:서\s*)?만나는/, 발표곳수: 43 },
];

/**
 * 갈래는 **머리글 위치**로 가른다.
 *
 * 🧨 처음엔 `<div class="box t«숫자»">` 의 숫자가 갈래인 줄 알았다. 아니었다 —
 *    받아 보니 t1/t4/t5/t6 에 55/34/5/16 이 들어 있었다(발표는 20/19/28/43).
 *    그건 갈래가 아니라 **화면 모양**이었다. 검산을 걸어 둔 덕에 틀린 값이
 *    저장되지 않고 비워졌다(2026-09-14).
 *
 * 그래서 이번엔 갈래 **머리글 글자**를 찾아 그 뒤에 오는 항목들을 그 갈래로 본다.
 * 머리글 글자는 소개문·차례에도 나오므로, 항목보다 **앞에 있는 것 중 가장 가까운**
 * 머리글을 고른다. 그리고 이번에도 **발표 수와 대조해서 맞을 때만** 붙인다.
 */
function themeAt(offset, marks) {
  let best = null;
  for (const m of marks) if (m.at < offset && (!best || m.at > best.at)) best = m;
  return best ? best.이름 : null;
}

function parse(html) {
  // 갈래 머리글이 원문 어디에 있는지 모두 적어 둔다.
  const marks = [];
  for (const t of THEMES) {
    const re = new RegExp(t.표지.source, "g");
    let m;
    while ((m = re.exec(html))) marks.push({ 이름: t.이름, at: m.index });
  }

  // 항목은 `<div class="box t…">` 로 싸여 있다. 자르되 **원문 위치를 기억한다.**
  const re = /<div class="box t\d"[^>]*>/g;
  const starts = [];
  let m;
  while ((m = re.exec(html))) starts.push(m.index + m[0].length);

  const chunks = starts.map((s, i) => ({
    at: s,
    html: html.slice(s, starts[i + 1] ?? html.length),
  }));

  const out = [];
  for (const { at, html: c } of chunks) {
    const t = themeAt(at, marks);
    const num = Number(clean((c.match(/<span class="num">([\s\S]*?)<\/span>/) ?? [])[1]));
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
      갈래: t,
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

console.log(`🌿 ${CFG.이름} — ${CFG.발표곳수}곳을 기대한다.\n`);

// 주소 후보를 하나씩 두드린다. 하나가 404 여도 "자료가 없다"고 단정하지 않는다.
let first = null;
let URL_LIST = "";
for (const u of CFG.urls) {
  const r = await grab(u);
  if (r.why) {
    console.log(`   ⬜ ${u} — ${r.why}`);
    continue;
  }
  console.log(`   ✅ ${u}`);
  first = r;
  URL_LIST = u;
  break;
}
if (!first) {
  console.error(`❌ 후보 주소를 다 두드렸는데 하나도 못 받았다.`);
  console.error(`   ⚠️ 이건 "자료가 없다"는 뜻이 아니다. 둘을 뭉개지 않는다.`);
  process.exit(1);
}

let rows = parse(first.html);
console.log(`한 판에서 ${rows.length}곳을 읽었다.`);

// 다 안 왔으면 다음 장을 찾아본다.
if (rows.length < CFG.발표곳수) {
  for (const key of ["pageIndex", "page", "cPage", "curPage"]) {
    for (let p = 2; p <= 6; p++) {
      const r = await grab(`${URL_LIST}?${key}=${p}`);
      if (r.why) break;
      const more = parse(r.html).filter((x) => !rows.some((y) => y.번호 === x.번호));
      if (!more.length) break;
      rows.push(...more);
      console.log(`   ${key}=${p} 에서 ${more.length}곳 더 (누적 ${rows.length})`);
      await new Promise((x) => setTimeout(x, 400));
    }
    if (rows.length >= CFG.발표곳수) break;
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

// ── 🍁 갈래 검산 ────────────────────────────────────────────────────────
// 갈래를 **머리글 위치**로 갈랐다. 맞는지는 서울시가 발표한 갈래별 곳 수로 판가름한다.
// 하나라도 어긋나면 내가 모르는 것이다 — 그때는 **갈래를 통째로 비운다.**
// 짐작을 사실로 저장하지 않는다. 빈 칸이 틀린 것보다 낫다.
//
// ⚠️ 아래 THEMES 는 **단풍길 갈래**다. 봄꽃길도 네 테마로 나뉘지만 갈래별 곳 수를
//    아직 모른다 — 대조할 숫자가 없으면 검산이 아니다. 그래서 봄은 **아예 비운다.**
console.log(`\n── 갈래 검산 ${"─".repeat(46)}`);
let themeOk = SEASON === "autumn";
if (SEASON !== "autumn") {
  console.log(`   ⬜ ${CFG.이름} 은 갈래별 발표 수를 모른다 — 대조할 수가 없어 갈래를 비운다.`);
}
for (const info of themeOk ? THEMES : []) {
  const got = rows.filter((r) => r.갈래 === info.이름).length;
  const ok = got === info.발표곳수;
  if (!ok) themeOk = false;
  console.log(
    `   ${info.이름.padEnd(24)} 받은 ${String(got).padStart(3)} / 발표 ${info.발표곳수}  ${ok ? "✅" : "❌"}`
  );
}
const stray = rows.filter((r) => !r.갈래).length;
if (themeOk && stray) {
  themeOk = false;
  console.log(`   ⚠️ 어느 갈래에도 안 붙은 것 ${stray}곳`);
}

// 어긋났을 때 어디서 갈렸는지 보여 준다 — 숫자만 보면 왜 틀렸는지 모른다.
for (const info of THEMES) {
  const l = rows.filter((r) => r.갈래 === info.이름);
  if (l.length) {
    console.log(
      `     · ${info.이름} : ${l[0].번호}번 ${l[0].이름} … ${l[l.length - 1].번호}번 ${l[l.length - 1].이름}`
    );
  }
}

if (themeOk) {
  console.log(`   ✅ **네 갈래가 발표 수와 하나도 안 틀린다.** 머리글로 가른 것이 맞다.`);
} else {
  console.log(`   ❌ 어긋난다. **갈래를 비운다** — 짐작을 사실로 저장하지 않는다.
      (곳 수는 서울시가 해마다 바꾸므로, 올해 발표 수를 확인하고 THEMES 를 고칠 것)`);
  for (const r of rows) r.갈래 = null;
}

if (rows.length !== CFG.발표곳수) {
  console.log(`\n⚠️ ${CFG.발표곳수}곳이 아니라 ${rows.length}곳이다. 서울시가 해마다 수를 바꾸므로
   그 자체로 틀렸다는 뜻은 아니다. 다만 **왜 다른지 알기 전에는 넣지 않는다.**`);
}

if (APPLY) {
  writeFileSync(
    OUT,
    JSON.stringify(
      {
        받은날: new Date().toISOString().slice(0, 10),
        출처: CFG.출처,
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
