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

// ── ② 갤러리 서비스 ──────────────────────────────────────────────────────
const ROOT = "https://apis.data.go.kr/B551011/PhotoGalleryService1";

/** serviceKey를 URLSearchParams에 안 넣는 이유는 fetch-coords.mjs 주석 참고
 *  (data.go.kr '일반 인증키'가 이미 URL 인코딩된 값이라 이중 인코딩되면 깨진다). */
async function call(path, extra) {
  const params = new URLSearchParams({
    MobileOS: "ETC",
    MobileApp: "KStreet",
    _type: "json",
    ...extra,
  });
  const url = `${ROOT}/${path}?serviceKey=${API_KEY}&${params.toString()}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
  const text = await res.text();
  // 거절당하면 JSON이 아니라 **XML 오류문**이 온다. 그 말을 그대로 보여 줘야
  // 사장님이 공공데이터포털에서 무엇을 신청할지 알 수 있다.
  if (!text.trim().startsWith("{")) {
    return { http: res.status, raw: text.slice(0, 700) };
  }
  try {
    return { http: res.status, json: JSON.parse(text) };
  } catch {
    return { http: res.status, raw: text.slice(0, 700) };
  }
}

/** 응답에서 사진 목록을 꺼낸다. 0건일 때 items가 빈 문자열로 오는 창구다. */
function itemsOf(json) {
  const body = json?.response?.body;
  const it = body?.items;
  if (!it || typeof it === "string") return [];
  const arr = it.item;
  return Array.isArray(arr) ? arr : arr ? [arr] : [];
}

// ── ③ 먼저 **키가 이 서비스에 들어갈 수 있는지** 한 번 물어본다 ──────────
console.log("① 이 키로 「관광사진 갤러리」를 부를 수 있나 확인한다.");
const probe = await call("galleryList1", { numOfRows: "1", pageNo: "1", arrange: "A" });

const header = probe.json?.response?.header;
if (probe.raw) {
  console.log(`\n❌ 부를 수 없다 (HTTP ${probe.http}). 돌아온 답:\n`);
  console.log(probe.raw.split("\n").map((l) => "   " + l).join("\n"));
  console.log(`
${"─".repeat(62)}
🪪 **무엇을 하면 되나** — 공공데이터포털(data.go.kr)에 로그인해서
   「한국관광공사_관광사진정보」를 찾아 **활용신청**을 누른다.
   지금 쓰는 키(TOUR_API_KEY)와 **같은 계정**이면 키는 그대로 쓰면 되고,
   승인은 보통 바로 난다(자동승인 서비스다).
   신청한 뒤 이 워크플로를 다시 돌리면 여기서부터 이어진다.`);
  process.exit(0);
}
if (header && header.resultCode !== "0000") {
  console.log(`\n❌ 서비스가 거절했다 — ${header.resultCode} ${header.resultMsg}`);
  console.log("   (SERVICE_KEY_IS_NOT_REGISTERED_ERROR 라면 활용신청이 안 된 것이다.)");
  process.exit(0);
}

const total = probe.json?.response?.body?.totalCount;
console.log(`   ✅ 부를 수 있다. 갤러리에 사진 ${total ?? "?"}장이 있다.\n`);

// ── ④ 사진 없는 축제 이름으로 하나씩 찾아본다 ────────────────────────────
console.log("② 사진 없는 축제 이름으로 하나씩 찾아본다.\n");

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
const misses = [];

for (const f of photoless) {
  const r = await call("gallerySearchList1", {
    numOfRows: "20",
    pageNo: "1",
    arrange: "A",
    keyword: f.name,
  });
  if (r.raw || r.json?.response?.header?.resultCode !== "0000") {
    console.log(`⬜ ${f.name} — 조회 실패`);
    misses.push([f, "조회 실패"]);
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
    misses.push([f, items.length ? `${items.length}장 왔지만 이름이 안 맞음` : "0장"]);
    console.log(`❌ ${f.name} (${f.gu}) — ${items.length ? `${items.length}장 왔지만 이름이 안 맞는다` : "없다"}`);
  }
  // 연달아 부르면 막는다. 천천히.
  await new Promise((s) => setTimeout(s, 400));
}

console.log("\n" + "─".repeat(62));
console.log(`✅ 채울 수 있는 축제: ${hits.length}곳 / ${photoless.length}곳`);
for (const [f] of hits) console.log(`   · ${f.name} (${f.gu})`);
console.log(`\n❌ 여기에도 없는 축제: ${misses.length}곳`);
for (const [f, why] of misses) console.log(`   · ${f.name} (${f.gu}) — ${why}`);
console.log(`
🚨 **이 목록을 그대로 앱에 넣지 않는다.**
   갤러리 사진은 공공누리 유형이 사진마다 다르다. 쓰기 전에 사진마다
   유형을 확인하고, 확인 못 한 것은 **비워 둔다** — 빈 칸이 틀린 것보다 낫다.
   화면에는 이미 "사진은 사용 권한이 없어 싣지 못했습니다"라고 적어 두었으므로
   빈 자리가 그대로 남아도 손님이 앱을 부실하다고 읽지는 않는다.`);
