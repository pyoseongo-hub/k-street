#!/usr/bin/env node
// 📷 **사진이 없는 축제를 관광공사 「관광사진 갤러리」로 채울 수 있나** 물어본다.
//
// 사용자 지시(2026-09-04): "B 시도해봐 포스터 사용도 안되나".
//
// ── 무엇이 문제인가 ──────────────────────────────────────────────────────
// 축제 80곳 중 **24곳에 사진이 없다.** 지금 쓰는 사진은 전부 관광공사 자료인데
// (공공누리 제1유형 — 출처만 밝히면 상업적 이용까지 된다), 그 24곳은 관광공사의
// **장소·행사 자료(KorService2)에 아예 등록이 안 되어 있다.** 이름을 다 대조해
// 봤다 — 운현궁·정동문화축제만 비슷한 항목이 있었고 나머지는 없었다.
//
// 그러니 detailImage2(fetch-tour-gallery.mjs)로도 못 채운다. 그건 **이미 있는
// contentId에 딸린 사진**을 더 받아오는 것이라, 자료 자체가 없는 곳에는 쓸 수 없다.
//
// ── 그래서 다른 창구를 본다 ─────────────────────────────────────────────
// 관광공사에는 「관광사진 갤러리」(PhotoGalleryService1)라는 **별도 서비스**가 있다.
// 장소 자료와 이어져 있지 않고 **사진 자체를 낱말로 찾는** 창구라, 장소 자료에
// 없는 축제도 사진만 따로 올라와 있을 수 있다.
//
// 🚨 이건 **따로 활용신청을 해야 하는 서비스다.** 지금 우리 키(TOUR_API_KEY)가
//    KorService2만 신청돼 있으면 여기서는 거절당한다. 그 답을 사람이 감으로
//    찍지 말고 **기계가 직접 물어보고 그대로 옮긴다** — 이 프로젝트의 원칙
//    그대로다(도메인 때 전해 들은 말로 헛걸음한 적이 있다).
//
// ── 저작권 ──────────────────────────────────────────────────────────────
// 갤러리 사진도 관광공사가 공공누리로 여는 자료지만 **유형이 사진마다 다르다.**
// 응답에 오는 galPhotographer(촬영자)·galSearchKeyword를 같이 적어 두고,
// 실제로 쓸 때 유형을 확인한다. **확인 못 한 사진은 안 쓴다.**
//
// ── 돌리는 법 ───────────────────────────────────────────────────────────
//   npx vite build --ssr scripts/dump-links.ts --outDir .linkdump --logLevel error
//   node .linkdump/dump-links.js > links.json
//   TOUR_API_KEY=키 node scripts/probe-photo-gallery.mjs links.json
//
// ⚠️ 작업 세션(샌드박스)은 apis.data.go.kr이 막혀 있어 직접 못 돌린다.
//    .github/workflows/probe-photo-gallery.yml 로 Actions에서 돌린다.
//
// **아무것도 저장하지 않는다.** 될지 안 될지 먼저 보는 자리다.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const API_KEY = process.env.TOUR_API_KEY;
if (!API_KEY) {
  console.error("TOUR_API_KEY 환경변수가 없다.");
  process.exit(1);
}

const linksPath = process.argv[2] ?? "links.json";

// ── ① 사진이 없는 축제가 무엇인지 **앱과 똑같은 잣대로** 고른다 ──────────
// 손으로 목록을 적어 두면 축제가 늘거나 사진을 채운 뒤에 목록만 옛날 것으로 남는다.
// dump-links.ts가 앱 코드를 그대로 불러 뽑아 준 결과를 쓴다.
let dump;
try {
  dump = JSON.parse(readFileSync(linksPath, "utf-8"));
} catch {
  console.error(`${linksPath} 를 못 읽었다. 먼저 dump-links 를 돌릴 것 (위 주석 참고).`);
  process.exit(1);
}

const tourImages = JSON.parse(
  readFileSync(join(__dirname, "..", "src", "data", "tour-images.json"), "utf-8")
);

// 화면(MonthlyFestivalPanel)이 사진을 고르는 순서와 같다: image → thumb → tour-images.
const photoless = dump.festivals.filter(
  (f) => !f.image && !f.thumb && !tourImages[f.id]?.image && !tourImages[f.id]?.thumb
);

console.log(`축제 ${dump.festivals.length}곳 중 **사진 없는 곳 ${photoless.length}곳**을 찾아본다.\n`);

// ── ② 어느 창구가 실제로 답하는지 **먼저 찾는다** ──────────────────────────
//
// 🐞 2026-09-04 첫 판이 이 자리에서 틀렸다. 창구 주소를 하나로 못 박아 두고,
//    답이 안 오면 "조회 실패"라고만 적은 뒤 **마지막 요약에서는 "여기에도 없는
//    축제 24곳"이라고 말했다.** 실패와 없음은 전혀 다른 말인데 하나로 뭉갠 것이다.
//    게다가 ①에서 사진이 몇 장인지도 못 읽었으면서 "✅ 부를 수 있다"라고 적었다.
//    **틀린 확신이 빈 칸보다 나쁘다** — 이 프로젝트가 계속 되뇌는 그 잘못이다.
//
// 그래서 고친 것 —
//  · 후보 창구를 **여러 개 대 보고**, 돌아온 답을 **그대로 화면에 찍는다.**
//  · 사진이 실제로 한 장이라도 왔을 때만 "부를 수 있다"고 말한다.
//  · 마지막 요약에서 **없음 · 조회 실패**를 갈라서 센다.

const ROOTS = [
  "https://apis.data.go.kr/B551011/PhotoGalleryService1",
  "https://apis.data.go.kr/B551011/PhotoGalleryService",
];
/** 목록 창구 후보 → 그 창구에 딸린 검색 창구 */
const OPS = [
  { list: "galleryList1", search: "gallerySearchList1" },
  { list: "galleryList", search: "gallerySearchList" },
];

/** serviceKey를 URLSearchParams에 안 넣는 이유는 fetch-coords.mjs 주석 참고
 *  (data.go.kr '일반 인증키'가 이미 URL 인코딩된 값이라 이중 인코딩되면 깨진다). */
async function call(root, path, extra) {
  const params = new URLSearchParams({
    MobileOS: "ETC",
    MobileApp: "KStreet",
    _type: "json",
    ...extra,
  });
  const url = `${root}/${path}?serviceKey=${API_KEY}&${params.toString()}`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
    const text = await res.text();
    let json = null;
    if (text.trim().startsWith("{")) {
      try {
        json = JSON.parse(text);
      } catch {
        /* 아래 raw로 보여 준다 */
      }
    }
    return { http: res.status, json, text };
  } catch (e) {
    return { err: String(e?.cause?.code ?? e.name ?? e.message).slice(0, 60) };
  }
}

/** 응답에서 사진 목록을 꺼낸다. 0건일 때 items가 빈 문자열로 오는 창구다. */
function itemsOf(json) {
  const it = json?.response?.body?.items;
  if (!it || typeof it === "string") return [];
  const arr = it.item;
  return Array.isArray(arr) ? arr : arr ? [arr] : [];
}

/** 응답이 무슨 말을 하는지 한 줄로. 못 알아보면 앞부분을 그대로 보여 준다. */
function why(r) {
  if (r.err) return `못 열었다 (${r.err})`;
  const h = r.json?.response?.header;
  if (h?.resultCode) return `${h.resultCode} ${h.resultMsg ?? ""}`.trim();
  // 거절당하면 JSON이 아니라 XML 오류문이 온다. 그 말을 그대로 옮겨야
  // 공공데이터포털에서 무엇을 신청할지 알 수 있다.
  return `HTTP ${r.http} · ${r.text?.replace(/\s+/g, " ").slice(0, 300) ?? "(빈 답)"}`;
}

console.log("① 어느 창구가 답하는지 하나씩 대 본다.\n");

let live = null;
for (const root of ROOTS) {
  for (const op of OPS) {
    const r = await call(root, op.list, { numOfRows: "3", pageNo: "1", arrange: "A" });
    const items = r.json ? itemsOf(r.json) : [];
    const tag = `${root.split("/").pop()}/${op.list}`;
    if (items.length) {
      console.log(`   ✅ ${tag} — 사진 ${items.length}장이 실제로 왔다`);
      console.log(`      보기: ${items[0].galTitle ?? JSON.stringify(items[0]).slice(0, 120)}`);
      live = { root, op };
      break;
    }
    console.log(`   ❌ ${tag} — ${why(r)}`);
    await new Promise((s) => setTimeout(s, 400));
  }
  if (live) break;
}

if (!live) {
  console.log(`
${"─".repeat(62)}
❌ **어느 창구도 사진을 주지 않았다.**
   위에 그대로 옮긴 답이 이유다. 대개 둘 중 하나다:

   · SERVICE_KEY_IS_NOT_REGISTERED / SERVICE ACCESS DENIED
     → 이 서비스는 **따로 활용신청을 해야 한다.**
   · NO_OPENAPI_SERVICE_ERROR
     → 창구 주소가 바뀐 것이다. 포털의 '참고문서'에서 지금 주소를 봐야 한다.

🪪 **사장님이 하실 일** — 공공데이터포털(data.go.kr)에 로그인해서
   「한국관광공사_관광사진정보」를 찾아 **활용신청**을 누른다.
   지금 쓰는 키(TOUR_API_KEY)와 **같은 계정**이면 키는 그대로 쓰면 되고,
   승인은 보통 바로 난다(자동승인 서비스다).
   신청한 뒤 이 워크플로를 다시 돌리면 여기서부터 이어진다.

⚠️ 이 결과는 **"사진이 없다"는 뜻이 아니다.** "우리가 못 물어봤다"는 뜻이다.
   둘을 뭉개면 있는 사진을 영영 안 찾게 된다.`);
  process.exit(0);
}

// ── ③ 사진 없는 축제 이름으로 하나씩 찾아본다 ────────────────────────────
console.log("\n② 사진 없는 축제 이름으로 하나씩 찾아본다.\n");

/** 제목에 상호(축제 이름)가 실제로 들어 있는가.
 *  🚨 검색 결과를 **그 축제 자료로 그냥 저장하지 않는다**(Kfood에서 데인 곳이다 —
 *     엉뚱한 지역 남의 자료가 채워졌다). 한글은 자모 분해형(NFD)으로 오는 일이
 *     있어 **비교 전에 NFC로 맞춘다** — 보이는 게 같다고 같은 문자열이 아니다. */
const norm = (s) => (s ?? "").normalize("NFC").replace(/\s+/g, "");
function titleMentions(title, name) {
  const t = norm(title);
  const n = norm(name);
  if (!t || !n) return false;
  if (t.includes(n)) return true;
  // "서울세계불꽃축제" ↔ "세계불꽃축제"처럼 앞의 '서울'만 다른 경우가 흔하다.
  const short = n.replace(/^서울/, "");
  return short.length >= 4 && t.includes(short);
}

const hits = [];
const none = [];
const failed = [];

for (const f of photoless) {
  const r = await call(live.root, live.op.search, {
    numOfRows: "20",
    pageNo: "1",
    arrange: "A",
    keyword: f.name,
  });
  const ok = r.json?.response?.header?.resultCode === "0000" || (r.json && itemsOf(r.json).length);
  if (!ok) {
    failed.push([f, why(r)]);
    console.log(`⬜ ${f.name} (${f.gu}) — 조회 실패: ${why(r)}`);
    await new Promise((s) => setTimeout(s, 400));
    continue;
  }
  const items = itemsOf(r.json);
  const matched = items.filter((it) => titleMentions(it.galTitle, f.name));
  if (matched.length) {
    hits.push([f, matched]);
    console.log(`✅ ${f.name} (${f.gu}) — 이름이 맞는 사진 ${matched.length}장`);
    for (const m of matched.slice(0, 3)) {
      console.log(`      · ${m.galTitle}`);
      console.log(`        ${m.galWebImageUrl}`);
      console.log(`        촬영: ${m.galPhotographer ?? "(없음)"} · 등록: ${m.galCreatedtime ?? "?"}`);
    }
  } else {
    none.push([f, items.length ? `${items.length}장 왔지만 이름이 안 맞음` : "0장"]);
    console.log(`❌ ${f.name} (${f.gu}) — ${items.length ? `${items.length}장 왔지만 이름이 안 맞는다` : "없다"}`);
  }
  // 연달아 부르면 막는다. 천천히.
  await new Promise((s) => setTimeout(s, 400));
}

// 🚨 **없음과 실패를 갈라서 센다.** 뭉치면 "찾아봤더니 없더라"로 읽히는데,
//    실제로는 못 물어본 것일 수 있다(첫 판이 여기서 틀렸다).
console.log("\n" + "─".repeat(62));
console.log(`✅ 채울 수 있는 축제: ${hits.length}곳 / ${photoless.length}곳`);
for (const [f] of hits) console.log(`   · ${f.name} (${f.gu})`);
console.log(`\n❌ 갤러리에도 없는 축제: ${none.length}곳`);
for (const [f, w] of none) console.log(`   · ${f.name} (${f.gu}) — ${w}`);
if (failed.length) {
  console.log(`\n⬜ **못 물어본 축제: ${failed.length}곳** (없다는 뜻이 아니다)`);
  for (const [f, w] of failed) console.log(`   · ${f.name} (${f.gu}) — ${w}`);
}
console.log(`
🚨 **이 목록을 그대로 앱에 넣지 않는다.**
   갤러리 사진은 공공누리 유형이 사진마다 다르다. 쓰기 전에 사진마다
   유형을 확인하고, 확인 못 한 것은 **비워 둔다** — 빈 칸이 틀린 것보다 낫다.
   화면에는 이미 "사진은 사용 권한이 없어 싣지 못했습니다"라고 적어 두었으므로
   빈 자리가 그대로 남아도 손님이 앱을 부실하다고 읽지는 않는다.`);
