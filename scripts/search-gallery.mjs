#!/usr/bin/env node
// 🔎 **관광사진 갤러리에서 낱말로 사진을 찾는다.** 아무것도 저장하지 않는다.
//
// 사장님(2026-09-13): *"관광공사 서울 단풍 사진 찾아줘 5장"*
//
// ── 왜 따로 만들었나 ────────────────────────────────────────────────────
// 이미 있는 두 스크립트는 **곳 이름으로** 찾는다 —
//   · probe-photo-gallery.mjs  — 사진 없는 축제 이름으로
//   · fetch-photo-gallery.mjs  — seed 의 모든 곳 이름으로
// 그런데 「단풍」은 곳 이름이 아니라 **주제**다. 곳 이름 잣대(titleMentions)로는
// 아예 물어볼 수가 없다. 그래서 낱말을 사람이 넣어 찾아보는 자리를 하나 둔다.
//
// ── 🚨 저작권 — 찾은 것을 그대로 쓰지 않는다 ────────────────────────────
// 갤러리 사진은 관광공사가 공공누리로 여는 자료지만 **유형이 사진마다 다르다.**
// 제1유형(출처만 밝히면 상업적 이용까지)인 것도 있고, 변경금지·비상업만 되는 것도 있다.
// 그래서 여기서는 **응답이 준 칸을 통째로 그대로 찍는다.** 촬영자·등록일·검색어까지.
// 쓸지 말지는 그걸 보고 사람이 정한다 — **확인 못 한 사진은 안 쓴다.**
//
// ── 돌리는 법 ───────────────────────────────────────────────────────────
//   TOUR_API_KEY=키 node scripts/search-gallery.mjs --keyword 단풍 --area 서울 --top 5
//
// ⚠️ 작업 세션(샌드박스)은 apis.data.go.kr 이 막혀 있어 직접 못 돌린다.
//    .github/workflows/search-gallery.yml 로 Actions 에서 돌린다.

const API_KEY = process.env.TOUR_API_KEY;
if (!API_KEY) {
  console.error("TOUR_API_KEY 환경변수가 없다.");
  process.exit(1);
}

const args = process.argv.slice(2);
const argVal = (n, d) => {
  const i = args.indexOf(n);
  return i >= 0 && args[i + 1] ? args[i + 1] : d;
};
const KEYWORD = argVal("--keyword", "단풍");
/** 제목·검색어·촬영지에 이 말이 있어야 통과. 빈 값이면 거르지 않는다. */
const AREA = argVal("--area", "");
const TOP = Number(argVal("--top", "5"));
/** 한 번에 몇 장씩 받을까 (창구 한도 100). */
const FETCH = Number(argVal("--fetch", "100"));
/** 🐞 **첫 판이 여기서 틀렸다** (2026-09-13). 「단풍」 사진이 3,518장 있는데
 *     앞 100장만 받아 보고 "서울 0장"이라고 적었다. 제목 가나다순이라 앞쪽은
 *     전부 지방 산이었다 — **없는 게 아니라 안 넘겨 본 것**이다.
 *     ⚠️ 이 프로젝트가 되뇌는 그 잘못이다: **없음과 못 물어봄을 뭉개지 않는다.**
 *     그래서 필요한 만큼 장을 넘긴다. 다 찾으면 거기서 멈춘다. */
const MAX_PAGES = Number(argVal("--pages", "40"));
/** 🗺️ **끝까지 훑고 장소별로 묶어 보여 준다.**
 *     원하는 장수를 채우는 순간 멈추면 **제목 가나다순 앞쪽에만 쏠린다** —
 *     실제로 그랬다: 12장을 달라니 전부 영등포구 두 곳(양화한강공원·선유도공원)이었다.
 *     서울에 단풍 사진이 있는 곳이 어디어디인지를 봐야 고를 수 있다.
 *     (Kfood 의 coverage-map 과 같은 생각 — **볼 자리를 만들어야 빈 곳이 보인다.**) */
const SURVEY = args.includes("--survey");
/** 한 곳에서 몇 장까지 보여 줄까 (--survey 일 때). 같은 곳 사진이 20장씩 있다. */
const PER_PLACE = Number(argVal("--per-place", "1"));

const ROOT = "https://apis.data.go.kr/B551011/PhotoGalleryService1";

/** serviceKey 를 URLSearchParams 에 안 넣는 이유 — data.go.kr '일반 인증키'가
 *  이미 URL 인코딩된 값이라 이중 인코딩되면 깨진다 (fetch-coords.mjs 주석 참고). */
async function call(path, extra) {
  const params = new URLSearchParams({
    MobileOS: "ETC",
    MobileApp: "KStreet",
    _type: "json",
    ...extra,
  });
  const url = `${ROOT}/${path}?serviceKey=${API_KEY}&${params.toString()}`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
    const text = await res.text();
    let json = null;
    if (text.trim().startsWith("{")) {
      try {
        json = JSON.parse(text);
      } catch {
        /* 아래 raw 로 보여 준다 */
      }
    }
    return { http: res.status, json, text };
  } catch (e) {
    return { err: String(e?.cause?.code ?? e.name ?? e.message).slice(0, 60) };
  }
}

/** 0건일 때 items 가 빈 문자열로 오는 창구다. */
function itemsOf(json) {
  const it = json?.response?.body?.items;
  if (!it || typeof it === "string") return [];
  const arr = it.item;
  return Array.isArray(arr) ? arr : arr ? [arr] : [];
}

function why(r) {
  if (r.err) return `못 열었다 (${r.err})`;
  const h = r.json?.response?.header;
  if (h?.resultCode) return `${h.resultCode} ${h.resultMsg ?? ""}`.trim();
  return `HTTP ${r.http} · ${r.text?.replace(/\s+/g, " ").slice(0, 300) ?? "(빈 답)"}`;
}

// 🚨 한글은 자모 분해형(NFD)으로 오는 일이 있다. **비교 전에 NFC 로 맞춘다** —
//    보이는 게 같다고 같은 문자열이 아니다 (Kfood 에서 유튜브 제목으로 데인 곳).
const norm = (s) => (s ?? "").normalize("NFC").replace(/\s+/g, "");

console.log(
  `🔎 「${KEYWORD}」로 찾는다${AREA ? ` · 「${AREA}」가 들어간 것만` : ""} · 한 장에 ${FETCH}장씩 최대 ${MAX_PAGES}장까지 넘겨 본다\n`
);

const matches = (it) =>
  !AREA ||
  norm(it.galTitle).includes(norm(AREA)) ||
  norm(it.galSearchKeyword).includes(norm(AREA)) ||
  norm(it.galPhotographyLocation).includes(norm(AREA));

const picked = [];
let seen = 0;
let total = null;
let firstItem = null;

for (let page = 1; page <= MAX_PAGES; page++) {
  const r = await call("gallerySearchList1", {
    numOfRows: String(FETCH),
    pageNo: String(page),
    arrange: "A",
    keyword: KEYWORD,
  });
  const items = r.json ? itemsOf(r.json) : [];
  if (page === 1) {
    total = r.json?.response?.body?.totalCount ?? null;
    if (!items.length) {
      console.log(`❌ 한 장도 못 받았다 — ${why(r)}`);
      console.log(`
⚠️ 이건 **"사진이 없다"는 뜻이 아니다.** "우리가 못 물어봤다"는 뜻일 수 있다.
   둘을 뭉개면 있는 사진을 영영 안 찾게 된다 (probe-photo-gallery.mjs 주석 참고).`);
      process.exit(0);
    }
    firstItem = items[0];
    console.log(`총 ${total ?? "?"}장이 있다고 한다.\n`);
    // ── 어떤 칸이 오는지 **먼저 통째로 보여 준다** ─────────────────────────
    // 공공누리 유형이 어느 칸에 오는지(오기는 하는지) 모른 채 골라 찍으면,
    // 정작 저작권을 판단할 칸을 놓친다. 첫 장은 원문 그대로 둔다.
    console.log("── 첫 장 원문 (어떤 칸이 오는지 보려고 그대로 찍는다) " + "─".repeat(12));
    console.log(JSON.stringify(firstItem, null, 2));
    console.log("─".repeat(62) + "\n");
  }
  if (!items.length) break;
  seen += items.length;
  for (const it of items) if (matches(it)) picked.push(it);
  if (page % 5 === 0 || page === 1)
    process.stdout.write(`   ${page}장째 — 본 것 ${seen}장 · 맞는 것 ${picked.length}장\n`);
  // 🚨 --survey 일 때는 **채웠다고 멈추지 않는다.** 멈추면 가나다순 앞쪽에만 쏠린다.
  if (!SURVEY && picked.length >= TOP) break;
  if (total != null && seen >= Number(total)) break;
  // 연달아 부르면 막는다. 천천히.
  await new Promise((s) => setTimeout(s, 300));
}

console.log(
  AREA
    ? `\n「${AREA}」가 들어간 것 ${picked.length}장 / 넘겨 본 ${seen}장\n`
    : `\n`
);

// ── 🗺️ 장소별로 묶어서 **어디에 있는지 먼저 보여 준다** ──────────────────
let show = picked;
if (SURVEY) {
  const byPlace = new Map();
  for (const it of picked) {
    const key = `${norm(it.galTitle)}|${(it.galPhotographyLocation ?? "").split(" ")[1] ?? ""}`;
    if (!byPlace.has(key)) byPlace.set(key, []);
    byPlace.get(key).push(it);
  }
  const places = [...byPlace.entries()].sort((a, b) => b[1].length - a[1].length);
  console.log(`── 장소 ${places.length}곳 ` + "─".repeat(40));
  for (const [, arr] of places) {
    const f = arr[0];
    console.log(
      `   ${String(arr.length).padStart(3)}장  ${f.galTitle} — ${f.galPhotographyLocation ?? "?"}`
    );
  }
  console.log("─".repeat(62) + "\n");
  // 한 곳에서 PER_PLACE 장씩만 골라 **여러 곳이 골고루** 나오게 한다.
  show = places.flatMap(([, arr]) => arr.slice(0, PER_PLACE));
}

for (const [i, it] of show.slice(0, TOP).entries()) {
  console.log(`${i + 1}. ${it.galTitle ?? "(제목 없음)"}`);
  console.log(`   사진   ${it.galWebImageUrl ?? "(없음)"}`);
  console.log(`   작은것 ${it.galThumbnailUrl ?? "(없음)"}`);
  console.log(`   촬영자 ${it.galPhotographer || "(빈칸)"}`);
  console.log(`   찍은곳 ${it.galPhotographyLocation || "(빈칸)"}`);
  console.log(`   검색어 ${it.galSearchKeyword || "(빈칸)"}`);
  console.log(`   등록일 ${it.galCreatedtime ?? "?"} · 번호 ${it.galContentId ?? "?"}`);
  console.log("");
}

if (show.length < TOP) {
  console.log(`⚠️ ${TOP}장을 달라고 했는데 ${show.length}장밖에 못 찾았다.`);
  console.log(
    `   넘겨 본 ${seen}장 / 전체 ${total ?? "?"}장. ${
      total != null && seen < Number(total)
        ? "**아직 다 안 넘겨 봤다** — --pages 를 늘릴 것."
        : "끝까지 넘겨 봤다. 정말 없는 것이다."
    }`
  );
  console.log(`   **없는 것을 채워 넣지 않는다.**`);
}

console.log(`
🚨 **이 목록을 그대로 앱에 넣지 않는다.**
   갤러리 사진은 공공누리 유형이 사진마다 다르다. 위 원문에 유형 칸이 없다면
   사진 페이지에서 하나씩 확인하고, 확인 못 한 것은 **비워 둔다.**`);
