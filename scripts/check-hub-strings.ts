// 🔢 **묶음 페이지의 셈 문장을 12개 언어로 재 본다.**
//
// 왜 (2026-09-10) — 묶음 페이지는 곳 페이지와 달리 **문장 안에 숫자가 박힌다**:
//   「4 traditional markets, 1 flower walk in 12 districts」
// 그래서 언어마다 단수·복수 규칙을 타는데, **화면을 열어 봐도 안 걸린다.**
// 지금 자료에 마침 1개짜리·11개짜리가 없으면 그 갈래가 틀려 있어도 안 보이고,
// 나중에 곳을 하나 더 넣는 순간 「1 mercados」·「11 музей」가 페이지에 뜬다.
//
// 그 숫자를 **자료가 아니라 여기서** 만들어 넣는다. 실제 HUB_STRINGS 를 그대로
// 불러 쓰므로(잣대를 두 벌로 만들지 않는다) 규칙을 고치면 여기서 바로 걸린다.
//
// 실행:  npm run check-hub-strings
import { HUB_STRINGS, HUB_LANGS, type HubStrings } from "./lib/page-strings";
import { getTranslations, type Language } from "../src/lib/translations";

const CATS = ["market", "flower", "walk", "walkFlower", "hike", "museum", "festival", "street"];

/** 재 볼 숫자 — 경계와 함정을 고른다. 11~14 는 러시아어에서 1 처럼 보이지만 다르다. */
const NS = [1, 2, 4, 5, 11, 12, 14, 21, 22, 25, 101, 111];

const CATEGORY_EN: Record<string, string> = {
  market: "Traditional markets", flower: "Flower walks", walk: "Walking paths",
  walkFlower: "Walks & flowers", hike: "Hiking trails", museum: "Museums",
  festival: "Festivals", street: "Streets & alleys",
};

const label = (cat: string, lang: Language) =>
  lang === "en"
    ? CATEGORY_EN[cat]
    : getTranslations(lang).categoryLabels[cat] ?? CATEGORY_EN[cat];

let bad = 0;
const fail = (m: string) => { bad++; console.log(`   ❌ ${m}`); };

// ── ① 어느 언어·갈래·숫자에서도 빈 말이 나오지 않나 ─────────────────────
for (const lang of HUB_LANGS) {
  const S = HUB_STRINGS[lang] as HubStrings;
  if (!S) { fail(`${lang}: HUB_STRINGS 에 없다 (HUB_LANGS 에만 적혀 있다)`); continue; }
  for (const cat of CATS)
    for (const n of NS) {
      const out = S.kindCount(cat, label(cat, lang), n);
      if (!out || out.includes("undefined") || !out.includes(String(n)))
        fail(`${lang} ${cat} ${n} → 「${out}」`);
    }
}

// ── ② 단수·복수가 실제로 갈리나 ─────────────────────────────────────────
//
// 스페인어·프랑스어·독일어는 앱 딱지가 복수형이라, 단수형 표를 안 타면
// 1개일 때 「1 mercados」가 된다. **1과 2가 같은 낱말로 나오면 표를 안 탄 것이다.**
for (const lang of ["es", "fr", "de"] as Language[]) {
  const S = HUB_STRINGS[lang] as HubStrings;
  for (const cat of CATS) {
    const one = S.kindCount(cat, label(cat, lang), 1).replace(/^1\s*/, "");
    const two = S.kindCount(cat, label(cat, lang), 2).replace(/^2\s*/, "");
    if (one === two) fail(`${lang} ${cat}: 1개와 2개가 같은 꼴이다 (「${one}」) — 단수형 표를 안 탔다`);
  }
}

// ── ③ 러시아어 세 갈래 ──────────────────────────────────────────────────
//
// 🚨 11~14 가 함정이다. 끝자리만 보면 11 을 1 처럼 처리해 「11 музей」를 만드는데,
//    맞는 말은 「11 музеев」다. 21 은 반대로 단수라서, 둘을 같이 재야 규칙이 확인된다.
const RU = HUB_STRINGS.ru as HubStrings;
const ruWant: Record<number, string> = {
  1: "музей", 2: "музея", 4: "музея", 5: "музеев",
  11: "музеев", 12: "музеев", 14: "музеев",
  21: "музей", 22: "музея", 25: "музеев",
  101: "музей", 111: "музеев",
};
for (const [n, want] of Object.entries(ruWant)) {
  const got = RU.kindCount("museum", label("museum", "ru"), Number(n));
  if (got !== `${n} ${want}`) fail(`ru ${n} → 「${got}」 (「${n} ${want}」여야 한다)`);
}

// ── ④ 러시아어 달 이름이 전치격으로 바뀌나 ──────────────────────────────
//
// 앱에는 주격(Октябрь)으로 있어서 소문자로만 낮추면 「в октябрь」가 된다 — 틀린 말이다.
//
// 🐞 처음엔 「주격이 부분 문자열로 들어 있나」로 쟀다가 **맞는 것을 틀렸다고 했다** —
//    март 는 марте 의 앞부분이라 「в марте」가 걸렸다. 부분 문자열은 잣대가 아니다.
//    전치격은 **끝이 바뀐다**(март→марте · май→мае). 그러니 문장이 주격으로
//    **끝나는지**를 본다: 「в март」면 걸리고 「в марте」면 안 걸린다.
for (let m = 1; m <= 12; m++) {
  const nom = String((getTranslations("ru").months as Record<number, string>)[m]);
  const h1 = RU.monthH1(nom);
  if (h1.endsWith(nom.toLowerCase()) || h1.endsWith(nom))
    fail(`ru ${m}월: 「${h1}」 — 주격 그대로다(전치격이어야 한다: ${nom} → …е)`);
}

// ── 결과 ────────────────────────────────────────────────────────────────
console.log(`🔢 셈 문장 — 언어 ${HUB_LANGS.length}개 × 갈래 ${CATS.length}개 × 숫자 ${NS.length}개`);
console.log("\n보기 (시장 · 1/2/5/11개):");
for (const lang of HUB_LANGS) {
  const S = HUB_STRINGS[lang] as HubStrings;
  const row = [1, 2, 5, 11].map((n) => S.kindCount("market", label("market", lang), n)).join("  ·  ");
  console.log(`   ${String(lang).padEnd(6)} ${row}`);
}
console.log(bad ? `\n❌ 손볼 것 ${bad}가지` : "\n✅ 12개 언어의 셈 문장이 다 맞다");
process.exit(bad ? 1 : 0);
