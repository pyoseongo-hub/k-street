// 🏪 **시장이 무엇을 파는가 — 낱말 사전을 12개 언어로 만든다.**
//
// 사장님 지시 (2026-09-12):
//   "방산 시장 동대문 시장처럼 먹거리나 그런 것이 아닌 **특성화된 장소**도 있으니
//    시장 자료 올려줘야 해"
//
// 관광공사에서 받은 판매품목은 이렇게 생겼다 (place-intro.json):
//     방산 종합시장   「인쇄 / 지류 등」
//     광장시장       「공예 / 구제 / 직물 / 한복 등」
//     동대문종합시장   「원단·의류부자재 / 액세서리 부자재 / 혼수용품 및 홈인테리어 등」
//
// ─────────────────────────────────────────────────────────────────────────
// 🎯 왜 **문장이 아니라 낱말**을 번역하나
// ─────────────────────────────────────────────────────────────────────────
//   문장 63개를 통째로 번역할 수도 있지만, **낱말로 쪼개면 69개**뿐이다.
//   그리고 낱말 쪽이 세 가지로 낫다:
//     ① **되쓸 수 있다.** 다음 도시의 시장도 같은 낱말을 쓴다(농산물·의류·잡화…).
//        문장은 시장마다 다르니 갈 때마다 새로 번역해야 한다.
//     ② **싸다.** 낱말 69개(약 280자)  vs  문장 63개(약 1,600자).
//        구글 무료 한도가 **월 50만 자**라 아낄수록 다른 데 쓸 수 있다.
//     ③ **사람이 눈으로 볼 수 있다.** 69개는 훑어보고 고칠 수 있지만
//        63문장 × 12언어 = 756줄은 아무도 안 본다. **못 보는 것은 못 고친다.**
//
// 🚨 **「등」은 낱말이 아니다.** 「인쇄 / 지류 **등**」의 그것이라 떼고 번역한다.
//    화면에서 다시 붙일지는 각 언어가 정한다(영어는 「and more」를 안 붙여도 된다).
//
// ⚠️ 인증키는 시크릿에서만 온다. 저장소에 한 글자도 안 적는다.

import { readFileSync, writeFileSync, existsSync } from "node:fs";

const KEY = (process.env.GOOGLE_TRANSLATE_API_KEY || "").trim();
if (!KEY) {
  console.error("❌ GOOGLE_TRANSLATE_API_KEY 가 없다 — 워크플로에 시크릿을 넘겼는지 볼 것.");
  process.exit(1);
}
const APPLY = process.argv.includes("--apply");
const IN = "src/data/place-intro.json";
const OUT = "src/data/sells-words.json";
const API = "https://translation.googleapis.com/language/translate/v2";

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
];

/**
 * 판매품목 한 줄을 낱말로 쪼갠다.
 *
 * 「원단·의류부자재 / 액세서리 부자재 / 혼수용품 및 홈인테리어 등」
 *   → 원단 · 의류부자재 · 액세서리 부자재 · 혼수용품 및 홈인테리어
 *
 * 🚨 **가운뎃점(·)으로도 쪼갠다** — 관광공사가 슬래시와 섞어 쓴다.
 * ⚠️ 「및」은 안 쪼갠다 — 「혼수용품 및 홈인테리어」는 한 덩어리로 읽는 편이 낫다.
 */
export function splitSells(s) {
  return String(s ?? "")
    .split(/[\/,·]/)
    .map((t) => t.trim().replace(/\s*등$/, "").trim())
    .filter(Boolean);
}

if (!existsSync(IN)) {
  console.error(`❌ ${IN} 이 없다. 먼저 Actions → Fetch place intro 를 돌릴 것.`);
  process.exit(1);
}
const 곳 = JSON.parse(readFileSync(IN, "utf-8"))["곳"] ?? {};

// 낱말 모으기 — 많이 나온 순으로 줄 세운다(사람이 볼 때 중요한 것이 위에 온다).
const count = new Map();
for (const v of Object.values(곳)) for (const w of splitSells(v.sells)) count.set(w, (count.get(w) ?? 0) + 1);
const words = [...count.keys()].sort((a, b) => count.get(b) - count.get(a) || a.localeCompare(b, "ko"));

const old = existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf-8")) : { 낱말: {} };
const table = old["낱말"] ?? {};

// 🔁 **이미 번역한 낱말은 다시 안 보낸다.** 무료 한도를 아끼는 가장 큰 자리다.
const todo = words.filter((w) => !table[w]?.en);
const chars = todo.reduce((n, w) => n + w.length, 0);

console.log(`🏪 판매품목 낱말 ${words.length}개 (새로 번역할 것 ${todo.length}개)`);
console.log(`   이번에 쓸 글자 수: 약 ${chars * TARGETS.length}자 (구글 무료 한도 월 50만 자)\n`);
console.log(`   많이 나온 것: ${words.slice(0, 12).map((w) => `${w}(${count.get(w)})`).join(" · ")}\n`);

if (!todo.length) {
  console.log("✅ 새로 번역할 낱말이 없다.");
  process.exit(0);
}

async function batch(texts, google) {
  const body = new URLSearchParams();
  for (const t of texts) body.append("q", t);
  body.append("source", "ko");
  body.append("target", google);
  body.append("format", "text");
  const res = await fetch(`${API}?key=${encodeURIComponent(KEY)}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) {
    const txt = await res.text();
    if (res.status === 403 && /quota|rateLimit/i.test(txt)) {
      throw new Error("구글 번역 한도를 다 썼다(월 50만 자). 다음 달에 이어서 한다.");
    }
    throw new Error(`구글 ${res.status} — ${txt.slice(0, 200)}`);
  }
  return (await res.json()).data.translations.map((t) => t.translatedText.trim());
}

for (const { code, google } of TARGETS) {
  const got = await batch(todo, google);
  todo.forEach((w, i) => {
    table[w] ??= {};
    table[w][code] = got[i];
  });
  console.log(`  ${code.padEnd(6)} ${got.slice(0, 6).join(" · ")}${got.length > 6 ? " …" : ""}`);
}

// 많이 나온 순서를 파일에도 남긴다 — 사람이 위에서부터 훑어보면 된다.
const sorted = Object.fromEntries(
  words.filter((w) => table[w]).map((w) => [w, { 나온횟수: count.get(w), ...table[w] }]),
);

console.log(`\n낱말 ${Object.keys(sorted).length}개 × ${TARGETS.length}개 언어`);
if (!APPLY) {
  console.log("\n📋 맛보기다(apply 를 안 켰다). 위 번역을 보고 켤 것.");
  process.exit(0);
}
writeFileSync(
  OUT,
  JSON.stringify({ 만든날: new Date().toISOString().slice(0, 10), 출처: "구글 번역 (원문: 한국관광공사 판매품목)", 낱말: sorted }, null, 1) + "\n",
);
console.log(`\n✅ ${OUT} 에 적었다`);
