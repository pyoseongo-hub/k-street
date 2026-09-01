#!/usr/bin/env node
// 🌐 장소·축제 이름과 설명을 11개 언어로 번역한다 — 구글 번역 (사용자 결정 2026-09-01).
//
// 문제: 앱 화면의 **틀**(버튼·안내문)은 12개 언어인데, 그 안에 담기는 **내용**
//      (장소 이름·설명·기간 문구)은 전부 한국어였다. 영어로 바꿔도
//      "광장시장 / 9월 말~10월 초"가 그대로 떴다.
//
// ── 무엇을 번역하고 무엇을 안 하나 ─────────────────────────────────
//
// ✅ 번역한다 — 이름(name) · 설명(note) · 기간 문구(dateLabel)
// ❌ 번역하지 않는다 — **주소(addr)**
//    주소는 뜻을 아는 게 아니라 **택시 기사에게 보여주는 것**이다. "효창원로 276"을
//    뜻으로 풀면 아무 데도 못 간다. 한국어 그대로 두는 게 외국인에게 더 쓸모 있다.
//    (덤으로 번역할 글자가 5,831자 줄어든다.)
//
// 🚨 **이름 안의 동네 이름은 번역기에 맡기지 않는다** — Kfood(dongne-hanip)에서
//    실제로 크게 데인 부분이다. 구글은 한자 지명을 뜻으로 풀어 버린다:
//      · 영화동 → 「映画館」(영화관!)   · 구운동 → 「運動」(운동!)
//      · 중동  → 「中東」(중동 지역!)
//    그래서 구·동 이름은 우리가 확인해 둔 표기(districtNamesEn.ts)로 못박고
//    `format=html` + `<span class="notranslate">`로 감싼다(구글이 정한 방식).
//
// ⚠️ 기계 번역이라 이름이 어색할 수 있다. 그래서 화면에서는 **번역 이름 옆에
//    한국어 원문을 항상 같이 보여준다**(src/lib/placeText.ts) — 번역이 이상해도
//    한국어를 보여주면 길은 찾을 수 있다.
//
// 열쇠는 id가 아니라 **한국어 원문 자체**다. seed.ts의 id(ks_1, ks_2…)는 항목을
// 하나 넣거나 빼면 뒤가 통째로 밀려서, id로 저장하면 번역이 엉뚱한 곳에 붙는다
// (CLAUDE.md의 id 재사용 사고와 같은 구조). 원문을 열쇠로 쓰면 같은 말은 한 번만
// 번역되고, 다시 돌려도 새로 생긴 것만 번역한다.
//
// 실행:
//   맛보기  : GOOGLE_TRANSLATE_API_KEY=... node scripts/translate-places.mjs
//   실제 반영: GOOGLE_TRANSLATE_API_KEY=... node scripts/translate-places.mjs --apply
//   한 언어만: node scripts/translate-places.mjs --apply --lang ja

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SEED = join(__dirname, "..", "src", "data", "seed.ts");
const TOUR = join(__dirname, "..", "src", "data", "tour-places-raw.json");
const NAMES_TS = join(__dirname, "..", "src", "data", "districtNamesEn.ts");
const OUT = join(__dirname, "..", "src", "data", "place-translations.json");

const args = process.argv.slice(2);
const APPLY = args.includes("--apply");
const ONLY = args.includes("--lang") ? args[args.indexOf("--lang") + 1] : null;

// ⚠️ **반드시 trim한다.** 시크릿에 붙여 넣을 때 줄바꿈이 한 칸 따라 들어오면
//    구글이 400 "API key not valid"를 주는데, 키 자체는 멀쩡해 보여서 원인이 안 보인다.
//    (Kfood에서 겪은 일이다.)
const KEY = (process.env.GOOGLE_TRANSLATE_API_KEY || "").trim();
if (!KEY) {
  console.error("❌ GOOGLE_TRANSLATE_API_KEY가 없습니다.");
  console.error("   Google Cloud Console → Cloud Translation API 사용 설정 → API 키 만들기");
  console.error("   무료 한도는 매달 50만 자입니다.");
  process.exit(1);
}
const API = "https://translation.googleapis.com/language/translate/v2";

// 앱이 지원하는 12개 언어 중 한국어를 뺀 11개. code는 앱이 쓰는 값,
// google은 구글이 받는 값이다(zh-TW처럼 다른 것이 있다).
const TARGETS = [
  { code: "en", google: "en" },
  { code: "ja", google: "ja" },
  { code: "zh", google: "zh-CN" },
  { code: "zh-TW", google: "zh-TW" },
  { code: "vi", google: "vi" },
  { code: "es", google: "es" },
  { code: "fr", google: "fr" },
  { code: "de", google: "de" },
  { code: "ru", google: "ru" },
  { code: "id", google: "id" },
  { code: "th", google: "th" },
].filter((t) => !ONLY || t.code.toLowerCase() === ONLY.toLowerCase());

if (!TARGETS.length) {
  console.error("❌ --lang 값이 잘못됐습니다. 쓸 수 있는 값: en ja zh zh-TW vi es fr de ru id th");
  process.exit(1);
}

// ── 못박을 지명 표 ────────────────────────────────────────────────
// districtNamesEn.ts에서 구·동 표기를 그대로 읽는다. 화면에 뜨는 바로 그 값이라야
// 번역문과 화면의 동네 이름이 어긋나지 않는다.
function readTable(src, name) {
  const m = src.match(new RegExp(`export const ${name}[^{]*\\{([\\s\\S]*?)\\n\\};`));
  if (!m) return {};
  const out = {};
  for (const [, k, v] of m[1].matchAll(/"([^"]+)":\s*"([^"]*)"/g)) out[k] = v;
  return out;
}
const namesSrc = readFileSync(NAMES_TS, "utf-8");
const GU_EN = readTable(namesSrc, "DISTRICT_NAME_EN");
const GU_JA = readTable(namesSrc, "DISTRICT_NAME_JA");
const DONG_EN = readTable(namesSrc, "DONG_NAME_EN");

/** 그 언어에서 이 지명을 뭐라고 적을지 — 검증된 한자가 있으면 그것, 없으면 로마자. */
function placeLabel(ko, code) {
  const bare = (s) => String(s || "").replace(/\(.*?\)/g, "").trim();
  if ((code === "ja" || code === "zh" || code === "zh-TW") && GU_JA[ko]) return bare(GU_JA[ko]);
  return bare(GU_EN[ko] || DONG_EN[ko] || "");
}

// 이름 안에 자주 나오는 지명은 '구'·'동'이 붙지 않은 짧은 형태다
// (여의도 봄꽃축제 · 석촌호수 벚꽃축제 · 이태원 지구촌축제). 그래서 표의 열쇠에서
// 접미사를 떼어 낸 형태도 함께 본다. 긴 것부터 봐야 "강남구"가 "강남"보다 먼저 걸린다.
const PLACE_KEYS = [
  ...Object.keys(GU_EN),
  ...Object.keys(DONG_EN),
  ...Object.keys(GU_EN).map((k) => k.replace(/구$/, "")),
  ...Object.keys(DONG_EN).map((k) => k.replace(/동$/, "")),
]
  .filter((k) => k.length >= 2)
  .sort((a, b) => b.length - a.length);

/** 접미사를 뗀 형태로 찾을 때 원래 열쇠로 되돌린다. */
function fullKeyOf(short) {
  if (GU_EN[short] || DONG_EN[short]) return short;
  return GU_EN[short + "구"] ? short + "구" : DONG_EN[short + "동"] ? short + "동" : null;
}

const NOTRANSLATE = (s) => `<span class="notranslate">${s}</span>`;

/** 원문에 든 지명을 검증된 표기로 바꾸고 번역 금지 표시를 씌운다. */
function protect(text, code) {
  let out = text;
  const done = new Set();
  for (const key of PLACE_KEYS) {
    if (!out.includes(key)) continue;
    const full = fullKeyOf(key);
    if (!full || done.has(full)) continue;
    const label = placeLabel(full, code);
    if (!label) continue;
    // 접미사를 뗀 형태로 걸렸으면 라벨에서도 -gu/-dong을 떼어 자연스럽게 맞춘다.
    const label2 = key !== full ? label.replace(/-(gu|dong)$/i, "").replace(/[区洞]$/, "") : label;
    out = out.split(key).join(NOTRANSLATE(label2));
    done.add(full);
  }
  return out;
}

// 태그를 걷어내고 HTML 엔티티를 되돌린다. format=html을 쓰면 반드시 필요하다.
const UNESCAPE = (s) =>
  String(s)
    .replace(/<[^>]*>/g, "")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    // &amp;는 **맨 끝**에 — 먼저 풀면 &amp;lt;가 <가 된다.
    .replace(/&amp;/g, "&")
    // 태그를 걷어낸 자리에 빈칸이 남는다("Seoul Forest ." 처럼).
    .replace(/\s+([.,;:!?)\]}»」』）］｝。、，．！？])/g, "$1")
    .replace(/([(\[{«「『（［｛])\s+/g, "$1")
    .replace(/[ \t]{2,}/g, " ")
    .trim();

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** 구글은 한 번에 여러 문장을 받는다. 50개씩 묶어 호출 수를 줄인다. */
async function translateBatch(texts, googleLang) {
  const body = new URLSearchParams();
  for (const t of texts) body.append("q", t);
  body.append("source", "ko");
  body.append("target", googleLang);
  // ⚠️ text가 아니라 html이다 — notranslate를 쓰려면 html이어야 한다.
  body.append("format", "html");
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(`${API}?key=${encodeURIComponent(KEY)}`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    if (res.ok) return (await res.json()).data.translations.map((t) => UNESCAPE(t.translatedText));
    const txt = await res.text();
    if (res.status === 403 && /quota|rateLimit/i.test(txt)) {
      throw new Error("구글 번역 한도를 다 썼습니다(월 50만 자). 다음 달에 이어서 하세요.");
    }
    if (res.status === 400 || res.status === 403) {
      // 구글이 주는 말이 세 갈래라 각각 할 일이 다르다. 뭉뚱그리면 사용자가
      // 엉뚱한 데를 고치느라 며칠을 쓴다(2026-09-01에 실제로 겪었다).
      let hint;
      if (/blocked/i.test(txt)) {
        // "Requests to this API translate method ... are blocked."
        hint =
          `👉 **열쇠에 걸린 'API 제한사항' 때문입니다.** 키 자체는 멀쩡합니다.\n` +
          `   Google Cloud Console → API 및 서비스 → 사용자 인증 정보 → 그 키를 클릭\n` +
          `   → 아래 'API 제한사항'에서 **Cloud Translation API**를 골라 저장하세요.\n` +
          `   (또는 '키 제한 안함'). 목록에 Cloud Translation API가 안 보이면,\n` +
          `   그 프로젝트에서 아직 사용 설정을 안 한 것입니다 — 먼저 켜야 목록에 뜹니다.`;
      } else if (/has not been used|is disabled|SERVICE_DISABLED/i.test(txt)) {
        hint =
          `👉 **이 프로젝트에서 Cloud Translation API가 꺼져 있습니다.**\n` +
          `   Google Cloud Console → API 및 서비스 → 라이브러리 → "Cloud Translation API"\n` +
          `   → 사용 설정. 응답 안에 있는 주소를 눌러도 바로 갑니다.`;
      } else if (/API key not valid|expired|INVALID_ARGUMENT/i.test(txt)) {
        hint =
          `👉 **키 값 자체가 안 맞습니다.** 시크릿에 줄바꿈이나 앞뒤 공백이 섞였을 수 있습니다.\n` +
          `   시크릿을 지우고 다시 붙여 넣으세요.`;
      } else {
        hint =
          `👉 아래 구글 응답을 보세요. 흔한 원인 셋입니다 —\n` +
          `   ① 열쇠의 'API 제한사항'에 Cloud Translation API가 빠짐\n` +
          `   ② 그 프로젝트에서 Cloud Translation API를 아직 안 켬\n` +
          `   ③ 시크릿에 줄바꿈·공백이 섞임`;
      }
      throw new Error(
        `구글이 거절했습니다 (HTTP ${res.status}).\n\n${hint}\n\n` +
          `구글 응답 원문:\n${txt.slice(0, 900)}`
      );
    }
    if (attempt >= 4) throw new Error(`구글 호출 실패 (HTTP ${res.status}): ${txt.slice(0, 200)}`);
    await sleep(attempt * 1500);
  }
}

// ── 번역할 한국어 모으기 ──────────────────────────────────────────
const seedSrc = readFileSync(SEED, "utf-8");
const tour = JSON.parse(readFileSync(TOUR, "utf-8"));

const source = new Set();
const addAll = (re, src) => {
  for (const [, v] of src.matchAll(re)) if (/[가-힣]/.test(v)) source.add(v);
};
// seed.ts는 TS라 그냥 못 읽는다 — 다른 스크립트들과 같은 방식으로 정규식으로 뽑는다.
// ⚠️ 들여쓰기 4칸 이하만 본다. 8칸 이상은 메뉴 같은 안쪽 칸이다(Kfood에서 번역 2,148칸이
//    메뉴 설명 자리에 박힌 사고가 있었다 — 같은 이름의 칸이 안쪽에도 있기 때문이다).
for (const line of seedSrc.split("\n")) {
  if (/^\s{5,}/.test(line)) continue;
  addAll(/name: "([^"]+)"/g, line);
  addAll(/note: "([^"]+)"/g, line);
  addAll(/dateLabel: "([^"]+)"/g, line);
}
for (const p of Object.values(tour).flat()) {
  if (p?.name && /[가-힣]/.test(p.name)) source.add(p.name);
}

const all = [...source].sort();
const chars = all.reduce((s, x) => s + x.length, 0);
console.log(`번역 대상: ${all.length}개 문구 / ${chars}자`);
console.log(`언어 ${TARGETS.length}개 → 최대 ${chars * TARGETS.length}자 (무료 한도 월 50만 자)`);
console.log("");

let store = {};
try {
  store = JSON.parse(readFileSync(OUT, "utf-8"));
} catch {
  /* 첫 실행 */
}

// 언어별로 열쇠를 정렬해 두면 다음 실행의 diff가 읽기 쉽다.
function save() {
  const sorted = {};
  for (const code of Object.keys(store).sort()) {
    sorted[code] = Object.fromEntries(
      Object.entries(store[code]).sort(([a], [b]) => a.localeCompare(b, "ko"))
    );
  }
  writeFileSync(OUT, JSON.stringify(sorted, null, 1) + "\n");
  return sorted;
}

let spent = 0;
for (const { code, google } of TARGETS) {
  const have = (store[code] ??= {});
  const todo = all.filter((s) => !have[s]);
  if (!todo.length) {
    console.log(`${code.padEnd(6)} 이미 다 돼 있음 (${Object.keys(have).length}개)`);
    continue;
  }
  const need = todo.reduce((s, x) => s + x.length, 0);
  console.log(`${code.padEnd(6)} 새로 번역할 것 ${todo.length}개 / ${need}자`);
  spent += need;
  if (!APPLY) {
    // 맛보기 — 실제로 부르지 않고 무엇이 번역될지만 보여준다.
    for (const s of todo.slice(0, 3)) console.log(`         · ${s}`);
    continue;
  }
  for (let i = 0; i < todo.length; i += 50) {
    const chunk = todo.slice(i, i + 50);
    const out = await translateBatch(chunk.map((s) => protect(s, code)), google);
    chunk.forEach((ko, j) => {
      const v = out[j];
      // 빈 값이나 한국어가 그대로 돌아온 것은 저장하지 않는다 — 빈 칸이 낫다.
      if (v && v !== ko) have[ko] = v;
    });
    process.stdout.write(`         ${Math.min(i + 50, todo.length)}/${todo.length}\r`);
    await sleep(200);
  }
  // 🚨 **한 언어가 끝날 때마다 저장한다.**
  // 2026-09-01 사고: 맨 끝에서 한 번만 저장했더니, 중간에 한 번 실패하는 순간
  // 그때까지 번역한 것이 통째로 사라졌다. 게다가 그 글자 수는 **이미 구글에서
  // 차감된 뒤**라 되돌릴 수도 없다. 다시 돌리면 이미 된 언어는 건너뛴다.
  save();
  console.log(`         ✅ ${Object.keys(have).length}개 저장`);
}

console.log("");
if (!APPLY) {
  console.log(`맛보기입니다 — 저장하지 않았습니다. 실제로 돌리려면 --apply를 붙이세요.`);
  console.log(`이번에 쓸 글자 수: 약 ${spent}자`);
  process.exit(0);
}

const sorted = save();
console.log(`저장: ${OUT}`);
for (const code of Object.keys(sorted)) {
  console.log(`  ${code.padEnd(6)} ${Object.keys(sorted[code]).length}개 / 원문 ${all.length}개`);
}
