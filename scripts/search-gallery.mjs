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
/** 제목·검색어에 이 말이 있어야 통과. 빈 값이면 거르지 않는다. */
const AREA = argVal("--area", "");
const TOP = Number(argVal("--top", "5"));
/** 몇 장까지 받아 볼까. 걸러 내고 나면 줄어드니 넉넉히 받는다. */
const FETCH = Number(argVal("--fetch", "100"));

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

console.log(`🔎 「${KEYWORD}」로 찾는다${AREA ? ` · 「${AREA}」가 들어간 것만` : ""} · ${FETCH}장까지 받아 본다\n`);

const r = await call("gallerySearchList1", {
  numOfRows: String(FETCH),
  pageNo: "1",
  arrange: "A",
  keyword: KEYWORD,
});

const items = r.json ? itemsOf(r.json) : [];
if (!items.length) {
  console.log(`❌ 한 장도 못 받았다 — ${why(r)}`);
  console.log(`
⚠️ 이건 **"사진이 없다"는 뜻이 아니다.** "우리가 못 물어봤다"는 뜻일 수 있다.
   둘을 뭉개면 있는 사진을 영영 안 찾게 된다 (probe-photo-gallery.mjs 주석 참고).`);
  process.exit(0);
}

console.log(`받은 사진 ${items.length}장 (총 ${r.json?.response?.body?.totalCount ?? "?"}장 중)\n`);

// ── 어떤 칸이 오는지 **먼저 통째로 보여 준다** ───────────────────────────
// 공공누리 유형이 어느 칸에 오는지(오기는 하는지) 모른 채 골라 찍으면,
// 정작 저작권을 판단할 칸을 놓친다. 첫 장은 원문 그대로 둔다.
console.log("── 첫 장 원문 (어떤 칸이 오는지 보려고 그대로 찍는다) " + "─".repeat(12));
console.log(JSON.stringify(items[0], null, 2));
console.log("─".repeat(62) + "\n");

const picked = AREA
  ? items.filter(
      (it) =>
        norm(it.galTitle).includes(norm(AREA)) ||
        norm(it.galSearchKeyword).includes(norm(AREA)) ||
        norm(it.galPhotographyLocation).includes(norm(AREA))
    )
  : items;

console.log(
  AREA
    ? `「${AREA}」가 들어간 것 ${picked.length}장 / 받은 ${items.length}장\n`
    : `\n`
);

for (const [i, it] of picked.slice(0, TOP).entries()) {
  console.log(`${i + 1}. ${it.galTitle ?? "(제목 없음)"}`);
  console.log(`   사진   ${it.galWebImageUrl ?? "(없음)"}`);
  console.log(`   작은것 ${it.galThumbnailUrl ?? "(없음)"}`);
  console.log(`   촬영자 ${it.galPhotographer || "(빈칸)"}`);
  console.log(`   찍은곳 ${it.galPhotographyLocation || "(빈칸)"}`);
  console.log(`   검색어 ${it.galSearchKeyword || "(빈칸)"}`);
  console.log(`   등록일 ${it.galCreatedtime ?? "?"} · 번호 ${it.galContentId ?? "?"}`);
  console.log("");
}

if (picked.length < TOP) {
  console.log(`⚠️ ${TOP}장을 달라고 했는데 ${picked.length}장밖에 못 찾았다.`);
  console.log(`   --fetch 를 늘리거나 --area 를 빼고 다시 볼 것. **없는 것을 채워 넣지 않는다.**`);
}

console.log(`
🚨 **이 목록을 그대로 앱에 넣지 않는다.**
   갤러리 사진은 공공누리 유형이 사진마다 다르다. 위 원문에 유형 칸이 없다면
   사진 페이지에서 하나씩 확인하고, 확인 못 한 것은 **비워 둔다.**`);
