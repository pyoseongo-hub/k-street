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

let 빈칸 = 0;
const 보기 = [];
for (const lang of LANGS) {
  const t = T[lang] ?? {};
  let n = 0;
  for (const r of rows) {
    for (const [칸, ko] of [["이름", r.이름], ["설명", r.설명]]) {
      if (!ko || !/[가-힣]/.test(ko)) continue;
      if (!t[ko]) {
        n++;
        if (보기.length < 6) 보기.push(`${lang} ${칸} — ${ko.slice(0, 40)}…`);
      }
    }
  }
  console.log(`${lang.padEnd(6)} 못 옮긴 칸 ${String(n).padStart(4)} / ${rows.length * 2}`);
  빈칸 += n;
}

console.log("");
if (빈칸) {
  console.error(
    `❌ 단풍길 ${rows.length}곳 중 **${빈칸}칸**이 한국어로 나간다.\n` +
      보기.map((b) => "   " + b).join("\n") +
      `\n\n   고치는 법: Actions → **Translate places** (apply 켜기).\n` +
      `   그래도 남으면 열쇠가 어긋난 것이다 — scripts/translate-places.mjs 가 짓는\n` +
      `   설명 모양이 src/data/seed.ts 의 AUTUMN_ROADS 와 같은지 볼 것(두 곳 주석에 적어 뒀다).`
  );
  process.exit(1);
}
console.log(`✅ 단풍길 ${rows.length}곳 — 11개 언어가 다 채워져 있다`);
