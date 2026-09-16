#!/usr/bin/env node
// 🚨 **한자권 번역에 「확실히 틀린 말」이 들어 있나.**
//
// 왜 (2026-09-16) — 구글은 한국 이름을 한자로 옮길 때 소리만 맞는 엉뚱한 한자를 고른다.
// 뜻이 완전히 달라지는데 **화면은 멀쩡해 보여서** 한자를 읽는 손님만 이상하게 여긴다.
// 오늘 실제로 찾은 것들:
//   · 북한산        → 北朝鮮山   (= 북조선 산!)      ← 서울에서 손꼽히는 산이다
//   · 혼수상가      → 昏睡商店街 (= 혼수상태 상가!)
//   · 김장대축제     → 金枪鱼节   (= 참치 축제!)
//   · 공수어촌체험마을 → 空手漁村   (= 가라테 어촌!)
//   · 개봉중앙시장   → 開封中央市場 (開封은 중국 카이펑이다. 개봉동은 開峰)
//   · 잠수교        → ウェットスーツ (= 잠수복)
//
// ── 🚨 왜 「일본어와 중국어가 다르면 경고」로 안 했나 ──────────────────────
//   그렇게 만들어 돌려 봤더니 **681개 중 404개가 걸렸다.** 일본어는 가타카나를 섞고
//   중국어는 간화자를 쓰니 원래 다르다(広場/广藏 · 慶東/京洞 · 九徳/九德).
//   **다 빨개지면 아무도 안 본다.** 그래서 「다르다」가 아니라 **「이 말은 틀렸다」**로 바꿨다.
//
// ── 이 목록은 늘어난다 ────────────────────────────────────────────────
//   새로 찾을 때마다 여기 한 줄 적는다. 그러면 **같은 실수가 두 번은 안 지나간다.**
//   근본 해결은 관광공사 **다국어 서비스**다 — 서비스는 있는데 우리 인증키가 그쪽에
//   등록돼 있지 않다(2026-09-16 확인, HTTP 403). 등록하면 공식 표기를 그대로 받는다.
import { readdirSync, readFileSync } from "node:fs";
// 🀄 이름인지 낱말인지 가리는 잣대. **저장하는 쪽과 같은 파일을 쓴다.**
import { brokenCjkNames, loadPlaces } from "./lib/cjk-name-rules.mjs";
import { readTranslations } from "./lib/place-translations.mjs";

/** 한국 곳 이름에 들어가면 **틀린 것이 확실한** 말. [찾을 말, 왜 틀렸나] */
const WRONG = [
  ["北朝鮮", "북조선 — 북한산은 北漢山이다"],
  ["朝鮮民主", "북조선"],
  ["昏睡", "혼수상태 — 혼수(婚需)는 혼례 살림이다"],
  ["金枪鱼", "참치 — 김장은 김치를 담그는 일이다"],
  ["マグロ", "참치 — 김장"],
  ["空手", "가라테 — 공수(공수동)는 지명이다"],
  ["ウェットスーツ", "잠수복 — 잠수교(潛水橋)는 다리 이름이다"],
  ["トゥクトゥク", "태국 삼륜차 — 뚜벅뚜벅은 걷는 소리다"],
  ["明治", "메이지 — 명지동은 鳴旨洞이다"],
  ["国庁舎", "관공서 건물 — 국청사는 절(國淸寺)이다"],
  ["対抗", "맞서다 — 대항동은 大項洞이다"],
  ["開封", "중국 카이펑 — 개봉동은 開峰洞이다"],
  ["特性化距離", "거리(距離)가 아니라 거리(街)다"],
  ["北悪", "북악은 北岳이다"],
];

const T = readTranslations();
const CJK = ["ja", "zh", "zh-TW"];

const hits = [];
for (const lang of CJK) {
  for (const [ko, v] of Object.entries(T[lang] ?? {})) {
    for (const [bad, why] of WRONG) {
      if (String(v).includes(bad)) hits.push({ lang, ko, v, bad, why });
    }
  }
}

if (hits.length) {
  console.error(`❌ 한자권 번역에 확실히 틀린 말 ${hits.length}군데\n`);
  for (const h of hits)
    console.error(`   ${h.lang.padEnd(6)} 「${h.ko}」\n      → ${h.v}\n      ⚠️ 「${h.bad}」 ${h.why}`);
  console.error(`\n   🪪 고치는 곳 — src/data/name-overrides.json`);
  console.error(`      한자를 **확인 못 하면 null 을 적어 지운다**. 앱이 영어로 대신 보여 준다.`);
  console.error(`      고친 뒤: node scripts/translate-places.mjs --overrides-only`);
  process.exit(1);
}
console.log(`✅ 한자권 번역 — 알려진 잘못된 말 ${WRONG.length}가지 중 걸린 것 없음`);

// ── 🀄 **이름인가, 구글이 뜻으로 옮긴 낱말인가** (2026-09-17에 더했다) ────────
//
//   위 목록은 「이 말은 틀렸다」를 하나씩 적는 방식이라 **다음 도시의 새것은 못 잡는다.**
//   갈래를 알면 규칙으로 잡을 수 있다 — 절이면 寺, 산이면 山. 규칙은
//   scripts/lib/cjk-name-rules.mjs 에 있고, **저장하는 쪽(translate-places.mjs)과
//   같은 파일을 쓴다.**
//
//   🚨 여기는 **그물이지 고치는 도구가 아니다.** 실제로 걷어내는 일은 저장할 때 한다.
//      여기서 걸린다는 건 그 단계를 안 거친 자료가 들어왔다는 뜻이다.
{
  const broken = brokenCjkNames(T, loadPlaces(readFileSync, readdirSync));
  if (broken.length) {
    console.error(`\n❌ 이름이 아니라 낱말로 옮겨진 것 ${broken.length}군데`);
    for (const b of broken) console.error(`   [${b.label}] ${b.lang.padEnd(6)} 「${b.ko}」 → ${b.value}`);
    console.error(`\n   고치는 법: node scripts/translate-places.mjs --overrides-only --apply`);
    process.exit(1);
  }
  console.log(`✅ 절·산·공원 이름 — 낱말로 옮겨진 것 없음`);
}
