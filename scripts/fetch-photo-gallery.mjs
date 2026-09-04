#!/usr/bin/env node
// 📷 **사진이 없는 곳을 관광사진 갤러리(포토코리아)로 채운다.**
//
// 사용자 지시(2026-09-04): "쓸수있는 사진있나 전부 확인해 / 사진 있으면 여기
// 사진을 우선으로 띄워".
//
// ── 이 창구가 왜 따로 필요한가 ───────────────────────────────────────────
// 지금 쓰는 사진은 전부 KorService2(국문 관광정보)가 주는 **대표 이미지**다.
// 그런데 그 자료에 아예 등록이 안 된 곳이 149곳 있다 — 축제 24곳 + 사진이 없어
// 화면에서 가려 둔 곳 158곳(겹치는 이름을 빼면 149).
//
// 관광사진 갤러리(PhotoGalleryService1)는 **사진 자체를 낱말로 찾는** 별도 창구라
// 장소 자료에 없는 곳도 사진만 따로 올라와 있을 수 있다. 2026-09-04에 활용신청이
// 승인됐다(개발계정 2건 — 국문 관광정보 + 관광사진 정보).
//
// ── 🚨 남의 사진을 붙이지 않기 위한 잣대 ────────────────────────────────
// Kfood에서 데인 곳이다 — 검색 결과를 그대로 저장했다가 **엉뚱한 지역 남의 가게**
// 사진이 화면에 떴다. 그래서 여기서도 **제목에 그 곳 이름이 실제로 들어 있는 것만**
// 저장한다(titleMentions). 한글은 자모 분해형(NFD)으로 오는 일이 있어
// **비교 전에 NFC로 맞춘다** — 보이는 게 같다고 같은 문자열이 아니다.
//
// ── 🔀 왜 id가 아니라 '이름'을 열쇠로 쓰나 ──────────────────────────────
// seed의 id는 파일에 나오는 **순서대로** 매겨진다(ks_1, ks_2…). 항목 하나를 지우면
// 그 뒤가 전부 한 칸씩 당겨져서, 지운 곳의 사진이 **남의 곳에 그대로 붙는다.**
// 그래서 곁다리 자료는 이름(NFC)을 열쇠로 둔다.
//
// ── 돌리는 법 ───────────────────────────────────────────────────────────
//   npx vite build --ssr scripts/dump-links.ts --outDir .linkdump --logLevel error
//   node .linkdump/dump-links.js > links.json
//   TOUR_API_KEY=키 node scripts/fetch-photo-gallery.mjs links.json          # 맛보기(저장 안 함)
//   TOUR_API_KEY=키 node scripts/fetch-photo-gallery.mjs links.json --apply  # 저장
//
// ⚠️ 작업 세션(샌드박스)은 apis.data.go.kr이 막혀 있어 직접 못 돌린다.
//    .github/workflows/fetch-photo-gallery.yml 로 Actions에서 돌린다.

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { httpsPhoto } from "./lib/https-photo.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..", "src", "data", "photo-gallery.json");

const API_KEY = process.env.TOUR_API_KEY;
if (!API_KEY) {
  console.error("TOUR_API_KEY 환경변수가 없다.");
  process.exit(1);
}

const args = process.argv.slice(2);
const APPLY = args.includes("--apply");
const linksPath = args.find((a) => !a.startsWith("--")) ?? "links.json";
const argVal = (n) => {
  const i = args.indexOf(n);
  return i >= 0 ? args[i + 1] : null;
};
const LIMIT = Number(argVal("--limit")) || Infinity;

const ROOT = "https://apis.data.go.kr/B551011/PhotoGalleryService1";
/** 곳 하나에 저장할 사진 최대 장수. 카드에서 넘겨 볼 수 있는 정도면 충분하다. */
const MAX_PER_PLACE = 5;

// ── ① 사진이 없는 곳을 **앱과 똑같은 잣대로** 고른다 ─────────────────────
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

const nfc = (s) => (s ?? "").normalize("NFC");
const hasPhoto = (p) =>
  Boolean(p.image || p.thumb || tourImages[p.id]?.image || tourImages[p.id]?.thumb);

// 축제(사진 게이트가 없어 화면에 뜬다) + 가려 둔 곳(사진이 없어 안 보인다).
// 이름이 겹치는 것은 하나로 친다 — 어차피 이름을 열쇠로 저장한다.
const byName = new Map();
for (const p of [...dump.festivals, ...dump.hidden, ...dump.rows]) {
  if (hasPhoto(p)) continue;
  const key = nfc(p.name);
  if (!byName.has(key)) byName.set(key, p);
}
const targets = [...byName.values()].slice(0, LIMIT);

console.log(`사진이 없는 곳 **${byName.size}곳**을 갤러리에서 찾아본다.`);
if (targets.length !== byName.size) console.log(`(이번 실행은 앞 ${targets.length}곳만)`);
console.log(APPLY ? "저장: 켬\n" : "저장: 끔 (맛보기)\n");

// ── ② 창구 부르기 ────────────────────────────────────────────────────────
/** serviceKey를 URLSearchParams에 안 넣는 이유는 fetch-coords.mjs 주석 참고
 *  (data.go.kr '일반 인증키'가 이미 URL 인코딩된 값이라 이중 인코딩되면 깨진다). */
async function callOnce(path, extra) {
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
    if (!text.trim().startsWith("{")) return { http: res.status, text };
    return { http: res.status, json: JSON.parse(text), text };
  } catch (e) {
    return { err: String(e?.cause?.code ?? e.name ?? e.message).slice(0, 60) };
  }
}

/**
 * 🔁 **끊기면 다시 물어본다** (2026-09-04에 당했다).
 *
 * 두 번째 실행에서 **첫 호출 한 번이 CONNECT_TIMEOUT**이 나면서 149곳을 하나도
 * 못 보고 끝났다. 7분 전 같은 키로 전부 돌았으니 권한 문제가 아니라 그쪽 서버가
 * 잠깐 안 받은 것이다.
 *
 * 재시도를 안 하면 그런 한 번이 **"갤러리에 없다"로 둔갑한다** — 이 프로젝트가
 * 계속 경계하는 "실패를 없음이라고 말하는" 그 잘못이다.
 * 다만 재시도는 **연결이 안 된 경우와 5xx에만** 한다. 등록되지 않은 키 같은
 * 4xx는 몇 번을 물어도 같은 답이라 시간만 버린다.
 */
async function call(path, extra) {
  const waits = [1000, 3000, 6000];
  let last;
  for (let i = 0; ; i++) {
    last = await callOnce(path, extra);
    const worthRetry = last.err || (last.http >= 500 && last.http < 600);
    if (!worthRetry || i >= waits.length) return last;
    await new Promise((s) => setTimeout(s, waits[i]));
  }
}

/** 0건일 때 items가 빈 문자열로 오는 창구다. */
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
  return `HTTP ${r.http} · ${r.text?.replace(/\s+/g, " ").slice(0, 240) ?? "(빈 답)"}`;
}

// ── ③ 열쇠가 통하는지 먼저 본다 ──────────────────────────────────────────
console.log("① 이 키로 갤러리를 부를 수 있나 확인한다.");
const probe = await call("galleryList1", { numOfRows: "1", pageNo: "1", arrange: "A" });
const probeItems = probe.json ? itemsOf(probe.json) : [];
if (!probeItems.length) {
  console.log(`   ❌ 못 불렀다 — ${why(probe)}`);
  console.log(`
🪪 활용신청이 아직 안 됐을 수 있다. data.go.kr → 마이페이지 → 개발계정에서
   「한국관광공사_관광사진 정보_GW」가 **승인**으로 있는지 볼 것.
⚠️ 이 결과는 "사진이 없다"가 아니라 **"우리가 못 물어봤다"**는 뜻이다.`);
  process.exit(1);
}
console.log(`   ✅ 된다. 총 ${probe.json?.response?.body?.totalCount ?? "?"}장.`);
// 사진 한 장에 어떤 칸이 오는지 그대로 보여 준다 — 저작권 표시에 쓸 칸을
// 눈으로 확인하고 고르기 위해서다(추측으로 고르지 않는다).
console.log("   사진 한 장의 생김새:");
console.log(
  JSON.stringify(probeItems[0], null, 2)
    .split("\n")
    .map((l) => "     " + l)
    .join("\n")
);
console.log("");

// ── ④ 이름으로 하나씩 찾는다 ─────────────────────────────────────────────
/** 제목에 그 곳 이름이 실제로 들어 있는가. 등급 판정과 **같은 잣대 하나**를 쓴다 —
 *  잣대가 둘이면 수집은 통과하는데 화면은 틀린 상황이 생긴다. */
const norm = (s) => nfc(s).replace(/\s+/g, "");

/**
 * 🐞 **이름 앞에 한글이 더 붙어 있으면 다른 곳이다.**
 *
 * 2026-09-04 첫 조사에서 잡혔다 — 강남구 「관세박물관」을 찾는데 갤러리가
 * **「호남관세박물관」**(군산)을 줬고, 이름이 뒷부분에 들어 있다는 이유로 통과했다.
 * Kfood에서 남의 가게 사진이 화면에 떴던 바로 그 구멍이다.
 *
 * 그래서 **이름이 제목의 맨 앞이거나, 앞 글자가 한글이 아닐 때만** 인정한다.
 * 앞에 글자가 더 붙으면 대개 **다른 고유명사**가 된다(호남+관세박물관).
 * 뒤에 더 붙는 것은 괜찮다 — 남산 → 「남산자락숲길」처럼 **그 안의 더 좁은 곳**이라
 * 여전히 그곳 사진이다.
 *
 * ⚠️ 이 잣대는 놓치는 쪽으로 기운다("서울 남산"처럼 앞에 말이 붙은 제목은
 *    떨어진다). 그래도 이쪽이 맞다 — **빈 칸이 틀린 사진보다 낫다.**
 */
function containsAsName(title, name) {
  let i = title.indexOf(name);
  while (i >= 0) {
    if (i === 0 || !/[가-힣]/.test(title[i - 1])) return true;
    i = title.indexOf(name, i + 1);
  }
  return false;
}

function titleMentions(title, name) {
  const t = norm(title);
  const n = norm(name);
  if (!t || !n) return false;
  if (containsAsName(t, n)) return true;
  // "서울세계불꽃축제" ↔ "세계불꽃축제"처럼 앞의 '서울'만 다른 경우가 흔하다.
  const short = n.replace(/^서울/, "");
  return short.length >= 4 && containsAsName(t, short);
}

const out = existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf-8")) : {};
const hits = [];
const none = [];
const failed = [];

for (const p of targets) {
  const r = await call("gallerySearchList1", {
    numOfRows: "30",
    pageNo: "1",
    arrange: "A",
    keyword: p.name,
  });
  const ok = r.json?.response?.header?.resultCode === "0000" || (r.json && itemsOf(r.json).length);
  if (!ok) {
    failed.push([p, why(r)]);
    console.log(`⬜ ${p.name} — 조회 실패: ${why(r)}`);
    await new Promise((s) => setTimeout(s, 350));
    continue;
  }
  const items = itemsOf(r.json);
  const matched = items
    .filter((it) => titleMentions(it.galTitle, p.name))
    .filter((it) => it.galWebImageUrl)
    .slice(0, MAX_PER_PLACE);

  if (matched.length) {
    hits.push([p, matched]);
    console.log(`✅ ${p.name} (${p.gu}${p.dong ? " " + p.dong : ""}) — ${matched.length}장`);
    // 🚨 맛보기에서는 **제목을 하나도 빼놓지 않고** 찍는다. 앞 두 개만 보여 주다가
    //    「관세박물관 → 호남관세박물관」을 놓칠 뻔했다(2026-09-04). 저장하기 전에
    //    사람이 전부 눈으로 훑을 수 있어야 한다.
    for (const m of matched) console.log(`      · ${m.galTitle}`);
    // 🚨 **이름을 열쇠로** 저장한다(위 주석의 id 재사용 사고 참고).
    //    matchedTitle을 같이 적어 둬야 나중에 "이 사진이 왜 이 곳에 붙었나"를
    //    감사에서 되짚을 수 있다.
    out[nfc(p.name)] = {
      name: p.name,
      gu: p.gu,
      photos: matched.map((m) => ({
        url: httpsPhoto(m.galWebImageUrl),
        title: m.galTitle,
        photographer: m.galPhotographer ?? null,
        createdAt: m.galCreatedtime ?? null,
        contentId: m.galContentId ?? null,
      })),
      source: "한국관광공사 관광사진갤러리(포토코리아)",
      license: "공공누리 제1유형",
      fetchedAt: new Date().toISOString().slice(0, 10),
    };
  } else {
    none.push([p, items.length ? `${items.length}장 왔지만 이름이 안 맞음` : "0장"]);
  }
  await new Promise((s) => setTimeout(s, 350));
}

// 🚨 **없음과 실패를 갈라서 센다.** 뭉치면 "찾아봤더니 없더라"로 읽히는데,
//    실제로는 못 물어본 것일 수 있다(2026-09-04 첫 조사 판이 여기서 틀렸다).
console.log("\n" + "─".repeat(62));
console.log(`✅ 사진을 찾은 곳: ${hits.length}곳 / ${targets.length}곳`);
console.log(`❌ 갤러리에도 없는 곳: ${none.length}곳`);
if (failed.length) {
  console.log(`⬜ **못 물어본 곳: ${failed.length}곳** (없다는 뜻이 아니다)`);
  for (const [p, w] of failed.slice(0, 20)) console.log(`   · ${p.name} — ${w}`);
}

console.log("\n찾은 곳 전부:");
for (const [p, m] of hits) console.log(`   · ${p.name} (${p.gu}) — ${m.length}장`);

if (APPLY) {
  writeFileSync(OUT, JSON.stringify(out, null, 2) + "\n");
  console.log(`\n💾 ${Object.keys(out).length}곳을 src/data/photo-gallery.json 에 저장했다.`);
} else {
  console.log("\n👀 맛보기라 저장하지 않았다. --apply 를 붙이면 저장한다.");
}
