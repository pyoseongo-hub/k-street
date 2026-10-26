// 📝 **관광공사 소개글(overview)의 첫 문장을 받아 온다** — 사진도 설명도 없는 곳의 한 줄.
//
// 사장님 (2026-10-26): *"텍스트로 채워 / 이미지 없어도 번역도"* · *"50개씩 진행하고 보고"*.
//
// 🎯 무엇을 — detailCommon2 의 overview 를 받아 **첫 문장 하나**만 남긴다.
//    카드에 들어가는 자리는 한 줄이다. 소개글 전체는 길고(수백 자) 번역 한도를 금방 먹는다.
// 🚨 **이름을 대조한다.** 관광공사가 돌려준 제목(title)과 우리 이름이 다르면 저장은 하되
//    `이름다름: true` 를 단다 — seed 는 그 줄을 안 쓴다(남의 곳 설명이 붙는 사고를 막는다).
// ✋ 사람이 읽고 뺄 줄은 `안씀: "이유"` 를 단다(홍보 문구·추측·남의 곳 이야기) — seed·번역 둘 다 건너뛴다.
// 🔁 이미 받은 곳은 건너뛴다. LIMIT 으로 **50곳씩** 끊어 받는다.
// ⚠️ 인증키는 시크릿에서만 온다. 저장소에 한 글자도 안 적는다.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fetchWithRetry } from "./lib/tour-fetch.mjs";

const KEY = process.env.TOUR_API_KEY ?? "";
if (!KEY) { console.error("❌ TOUR_API_KEY 가 없다"); process.exit(1); }
const APPLY = process.argv.includes("--apply");
const LIMIT = Number(process.env.LIMIT || 50);
const GAP_MS = Number(process.env.GAP_MS || 500);
const OUT = "src/data/tour-overview.json";
const DUMP = "dist-ssr/dump-overview-targets.js";
if (!existsSync(DUMP)) { console.error(`❌ ${DUMP} 가 없다 — 먼저 목록을 뽑는다`); process.exit(1); }
const { TARGETS } = await import(`../${DUMP}`);

const saved = existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf-8")) : { 곳: {} };
const done = new Set(Object.keys(saved.곳 ?? {}));
const todo = TARGETS.filter((t) => !done.has(t.id)).slice(0, LIMIT);
console.log(`🔁 이미 받은 ${done.size}곳은 건너뛴다 · 이번에 ${todo.length}곳 (남은 대상 ${TARGETS.length - done.size})\n`);

const ROOT = "https://apis.data.go.kr/B551011/KorService2";
const q = (o) => new URLSearchParams({ MobileOS: "ETC", MobileApp: "KStreet", _type: "json", ...o });
const clean = (v) => String(v ?? "").replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/&[a-z]+;/g, " ").replace(/\s+/g, " ").trim();
const nk = (s) => String(s ?? "").normalize("NFC").replace(/[^가-힣a-zA-Z0-9]/g, "");

/** 첫 문장. 「…이다.」「…있다.」처럼 끝나는 곳에서 자른다. 너무 길면 쉼표 앞에서 줄인다. */
function firstSentence(text) {
  // 🐞 「…이다.다섯 개의…」처럼 마침표 뒤에 띄어쓰기가 없는 소개글이 있다(노을공원). 뒤가 글자여도 자른다.
  const m = text.match(/^(.+?[다요음함]\.)(?=\s|$|[가-힣A-Z])/) ?? text.match(/^(.+?[.!?])(\s|$)/);
  let s = (m ? m[1] : text).trim();
  if (s.length > 120) {
    const cut = s.slice(0, 120);
    const at = Math.max(cut.lastIndexOf(","), cut.lastIndexOf("，"), cut.lastIndexOf(" "));
    s = (at > 40 ? cut.slice(0, at) : cut).trim() + "…";
  }
  return s;
}

const got = {};
let ok = 0, empty = 0, fail = 0, diff = 0;
for (const t of todo) {
  await new Promise((r) => setTimeout(r, GAP_MS));
  let row;
  try {
    const r = await fetchWithRetry(`${ROOT}/detailCommon2?serviceKey=${KEY}&${q({ contentId: t.contentId })}`, { tries: 2, waits: [4000, 8000] });
    const j = JSON.parse(await r.text());
    const item = j?.response?.body?.items?.item;
    row = Array.isArray(item) ? item[0] : item;
  } catch (e) {
    fail++; console.log(`   ⬜ ${t.name} — 못 물어봤다 (${String(e?.message ?? e).slice(0, 60)})`); continue;
  }
  const ov = clean(row?.overview);
  if (!ov) { empty++; got[t.id] = { name: t.name, contentId: t.contentId, short: "", fetchedAt: new Date().toISOString().slice(0, 10) }; console.log(`   ∅ ${t.name} — 소개글 없음`); continue; }
  const same = nk(row?.title) === nk(t.name) || nk(row?.title).includes(nk(t.name)) || nk(t.name).includes(nk(row?.title));
  const short = firstSentence(ov);
  got[t.id] = { name: t.name, contentId: t.contentId, tourTitle: clean(row?.title), short, ...(same ? {} : { 이름다름: true }), fetchedAt: new Date().toISOString().slice(0, 10) };
  if (!same) diff++; else ok++;
  console.log(`   ${same ? "✅" : "⚠️ 이름다름"} [${t.city}·${t.gu}] ${t.name}${same ? "" : ` ≠ ${clean(row?.title)}`}\n      ${short}`);
}
console.log(`\n📊 이번 판 — 설명 채움 ${ok} · 이름 달라 안 씀 ${diff} · 소개글 없음 ${empty} · 못 물어봄 ${fail}`);

if (!APPLY) { console.log("🔍 맛보기라 저장하지 않았다. 저장하려면 --apply"); process.exit(0); }
saved.설명 = "관광공사 detailCommon2 소개글(overview)의 첫 문장. scripts/fetch-tour-overview.mjs 가 받는다. 손으로 고치지 말 것.";
saved.곳 = { ...(saved.곳 ?? {}), ...got };
writeFileSync(OUT, JSON.stringify(saved, null, 1) + "\n");
console.log(`💾 저장 — 모두 ${Object.keys(saved.곳).length}곳`);
