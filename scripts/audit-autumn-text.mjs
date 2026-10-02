#!/usr/bin/env node
// 🍁 **단풍길 110곳의 이름·설명이 손님 말로 나오나** (2026-10-01).
//
// 왜 (사장님이 Kfood 배너에 동그라미를 치고 *"이 링크로 들어가는 페이지 점검해봐"*):
//   korea-street.com/seoul/jung-gu/ 의 **첫 네 장이 한국어**였다. 영어에서도 일본어에서도.
//   단풍길이 번역 그물 두 개 사이로 빠져 **한 건도 번역이 안 돼 있었다.**
//
// 🚨 **이 사고는 조용하다.** 번역이 없으면 원문(한국어)을 그대로 보여 주는 것이
//    정상 동작이라, 화면이 깨지지 않는다. 한국어를 읽는 사람 눈에는 아무 이상이 없고,
//    **외국 손님만 겪는다.** 그래서 사람이 아니라 기계가 세어야 한다.
//
// 🔑 **문장을 통째로 찾는다.** 번역을 찾는 쪽(src/lib/placeText.ts)이 그렇게 한다 —
//    조각이 번역돼 있어도 화면의 긴 줄과 안 맞으면 소용없다. 그래서 여기서도
//    **seed.ts 가 짓는 모양 그대로** 지어서 맞춰 본다. 두 곳이 어긋나면 여기서 걸린다.
//
//   node scripts/audit-autumn-text.mjs
import { readFileSync } from "node:fs";
import { readTranslations } from "./lib/place-translations.mjs";

const roads = JSON.parse(readFileSync("src/data/autumn-roads.json", "utf-8")).길 ?? [];
const T = readTranslations();
// 앱이 실제로 보여 주는 말. 영어는 다른 말이 없을 때의 대역이기도 하다(placeText.ts).
const LANGS = ["en", "ja", "zh", "zh-TW", "vi", "th", "id", "es", "fr", "de", "ru"];

const rows = roads
  .filter((r) => String(r.구 ?? "").endsWith("구"))
  .map((r) => ({
    이름: String(r.이름 ?? ""),
    // ⚠️ seed.ts 의 AUTUMN_ROADS 와 **같은 모양**이어야 한다(그 파일 주석 참고).
    설명: [[r.수종, r.길이].filter(Boolean).join(" · ") || null, r.설명].filter(Boolean).join(" — "),
  }));

// 🚨 **묻는 것은 「번역이 있나」가 아니라 「손님이 한글을 보나」다.**
//
//   앱이 찾는 법(src/lib/placeText.ts)은 이렇다:
//       그 언어 → 없으면 **영어** → 그것도 없으면 한국어 원문
//   그러니 일본어 칸이 비어 있어도 **영어가 있으면 손님은 영어를 본다.** 멀쩡하다.
//
//   🐞 처음엔 「그 언어에 있나」만 봤다가 **일부러 지운 칸을 사고로 셌다.**
//      「북한산 → 北朝鮮山」처럼 번역기가 망친 일본어를 사람이 null 로 지우면
//      (name-overrides.json) 앱은 영어로 대신 보여 준다 — 그게 **고친 상태**인데
//      감사가 「3칸이 한국어로 나간다」고 말했다. 거짓 경보는 진짜 경보를 묻는다.
//   ✅ 그래서 **앱과 똑같은 잣대**를 쓴다. 잣대가 둘이면 반쪽 적용이 생긴다.
const EN = T.en ?? {};
let 빈칸 = 0;
const 보기 = [];
for (const lang of LANGS) {
  const t = T[lang] ?? {};
  let n = 0;
  let 영어로 = 0;
  for (const r of rows) {
    for (const [칸, ko] of [["이름", r.이름], ["설명", r.설명]]) {
      if (!ko || !/[가-힣]/.test(ko)) continue;
      if (t[ko]) continue;
      // 그 언어엔 없지만 영어가 있다 — 손님은 영어를 본다. 사고가 아니다.
      if (EN[ko]) { 영어로++; continue; }
      n++;
      if (보기.length < 6) 보기.push(`${lang} ${칸} — ${ko.slice(0, 40)}…`);
    }
  }
  console.log(
    `${lang.padEnd(6)} 한글로 나가는 칸 ${String(n).padStart(4)} / ${rows.length * 2}` +
      (영어로 ? `   (그 밖에 ${영어로}칸은 영어로 대신 나간다 — 사람이 지운 자리)` : "")
  );
  빈칸 += n;
}

console.log("");
if (빈칸) {
  console.error(
    `❌ 단풍길 ${rows.length}곳 중 **${빈칸}칸**이 한국어로 나간다(영어도 없다).\n` +
      보기.map((b) => "   " + b).join("\n") +
      `\n\n   고치는 법: Actions → **Translate places** (apply 켜기).\n` +
      `   그래도 남으면 열쇠가 어긋난 것이다 — scripts/translate-places.mjs 가 짓는\n` +
      `   설명 모양이 src/data/seed.ts 의 AUTUMN_ROADS 와 같은지 볼 것(두 곳 주석에 적어 뒀다).`
  );
  process.exit(1);
}
console.log(`✅ 단풍길 ${rows.length}곳 — 11개 언어가 다 채워져 있다`);
