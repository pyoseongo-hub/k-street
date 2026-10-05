#!/usr/bin/env node
// 🍁 **가을 남산 인스타 카드 — 한 벌 12장을 한 번에 뽑는다.**
//
// 사장님 (2026-10-05): *"가을남산 인스타 쓰게 사진 찾아"* → 포토코리아에서 11장을
// 찾아 드렸고 **3·4·9·11번을 고르셨다.** 글은 사장님이 쓰신 것이다.
// 그 뒤 *"영어"* · *"텍스트 중국어 일어 반반"* 으로 세 벌이 됐다.
//
// ── 세 벌 ────────────────────────────────────────────────────────────────
//   en  영어 4장        cj  중국어·일본어 반반 4장
//   🚫 **한국어 벌은 뺐다** (사장님 2026-10-05: *"한글은 필요 없는데"*).
//      이 앱은 **외국 손님**에게 한국을 알리는 일이다 — 인스타도 그쪽을 본다.
//      한국어 글은 아래 영어·중·일의 **원문**으로 주석에 남겨 둔다.
//   ⚠️ cj 는 사장님이 영어 4번 카드의 **빈 오른쪽**을 동그라미 쳐서 생겼다.
//      한 칸에 두 말을 나란히 둔다 — 왼쪽 中文 · 오른쪽 日本語.
//
// ── 🪪 사진 (공공누리 제1유형 · 출처만 밝히면 상업적 이용 가능) ───────────
//   assets/photo-korea/namsan-*.jpg · 출처는 그 옆 credits.json 에 있다.
//   🚨 **출처는 카드에 박아 둔다.** 캡션은 지워질 수 있지만 그림은 안 지워진다.
//   🚨 **촬영자 이름은 로마자로 쓴다.** 중국어·일본어판에서도 그렇다 —
//      가타카나·한자로 옮기면 내가 지어내는 것이 된다(2026-10-05에 기계 번역이
//      「명지대학교」를 일본 「明治大学」로 옮긴 것을 잡았다. 사람 이름은 더 위험하다).
//
// ── 📐 왜 사진을 6:5(1080×900)로 자르나 ──────────────────────────────────
//   고른 넷이 **세로 둘·가로 둘**이다. 각자 비율대로 두면 넘길 때 들쭉날쭉하다.
//   4:5 로 자르면 3번 사진의 **남산타워가 잘려 나간다** — 6:5 는 가로 사진에서
//   폭을 256px 만 깎아 타워와 억새가 둘 다 산다. `focus` 가 어디를 남길지 정한다.
//
// ── 돌리는 법 ───────────────────────────────────────────────────────────
//   npm install --no-save playwright && npx playwright install chromium
//   node scripts/make-namsan-autumn-cards.mjs
//   → docs/가을남산-카드/ 에 12장(jpg, 1080×1350)
//
//   ⚠️ playwright 는 이 저장소의 식구가 아니다(검사 때만 쓴다). 위처럼 따로 받는다.
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const OUT = join(ROOT, "docs", "가을남산-카드");
const TMP = join(OUT, ".tmp");

/** 사진 넷. `focus` 는 자를 때 어디를 남길지 (0=왼쪽/위, 1=오른쪽/아래). */
const PHOTOS = {
  autumn: { file: "namsan-seonggwakgil-autumn.jpg",        focus: 0.42, by: "Lee Beom-su" },
  leaves: { file: "namsan-seonggwakgil-fallen-leaves.jpg", focus: 0.55, by: "Lee Beom-su" },
  tower:  { file: "namsan-hanyangdoseong-tower.jpg",       focus: 0.42, by: "Kim Min-su" },
  trail:  { file: "namsan-hanyangdoseong-trail.jpg",       focus: 0.50, by: "Kim Min-su" },
};

// 🖐️ **글은 사장님이 쓰신 것이다.** 영어·중국어·일본어는 직역하지 않고 같은 결로 옮겼다.
//    빈 문자열 "" 은 한 줄 띄움이다.
const SETS = {
  en: { lang: "en", serif: '"Gowun Batang",Georgia,"Times New Roman",serif', cards: [
    { p: "autumn", fs: 52, pad: 56, lines: ["In autumn,", "Namsan shows", "a different face."] },
    { p: "leaves", fs: 37, pad: 50, lines: ["It sits in the middle of the city.", "But walk the path a while and", "the noise falls away, until all you hear", "is leaves under your feet."] },
    { p: "tower",  fs: 38, pad: 50, lines: ["Seoul appears between trees", "turning gold and red —", "and above it all, Namsan Tower", "stands quietly."] },
    { p: "trail",  fs: 36, pad: 40, cta: 3, lines: ["Not a place to rush through,", "but one to slow down and walk.", "", "Want to feel Seoul in autumn?", "Go to Namsan."] },
  ]},
};

// 🀄🇯🇵 반반 벌. 좁은 칸이라 **줄을 내가 끊는다** — 저절로 접히면
//    「…というよ / り、」처럼 조사 한 글자가 넘어가 읽는 리듬이 깨진다.
const CJ = [
  { p: "autumn", fs: 34, pad: 54,
    zh: ["秋天的南山，", "会露出不一样的样子。"],
    ja: ["秋になると、南山は", "少し違う顔を", "見せてくれます。"] },
  { p: "leaves", fs: 28, pad: 46,
    zh: ["它就在城市中央。", "但沿着小路走一会儿，", "喧嚣渐渐远去，", "只剩下踩落叶的声音。"],
    ja: ["街のまんなかにあるのに、", "道を歩いていくうちに", "騒音は遠ざかり、", "落ち葉を踏む音だけが", "近づいてきます。"] },
  { p: "tower", fs: 28, pad: 46,
    zh: ["在染成金黄与火红的树间，", "能看见首尔；", "而在那之上，", "南山塔静静地立着。"],
    ja: ["黄色や赤に染まった木々の間から", "ソウルが見え、", "その上に南山タワーが", "静かに立っています。"] },
  { p: "trail", fs: 28, pad: 44, cta: 3,
    zh: ["这里不是匆匆走过的地方，", "而是放慢脚步散步的地方。", "", "想感受首尔的秋天？", "来南山吧。"],
    ja: ["急いで見てまわるより、", "少し速度をゆるめて", "歩くのにいい場所。", "", "ソウルの秋を感じたいなら、", "南山へ。"] },
];

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const para = (ls, cta) => ls.map((L, i) =>
  !L ? '<p class=sp></p>' : `<p${cta != null && i >= cta ? " class=cta" : ""}>${esc(L)}</p>`).join("");

const SHELL = (body, extra) => `<!doctype html><html><head><meta charset=utf-8>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Gowun+Batang:wght@400;700&display=swap">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:1080px;height:1350px}
  body{background:#1b1512;display:flex;flex-direction:column;overflow:hidden}
  /* 📐 6:5 자르기를 **브라우저가 한다** — 잘라 둔 사진을 저장소에 넣지 않아도 된다.
        object-position 의 % 가 위 PHOTOS 의 focus 와 같은 뜻이다. */
  .photo{width:1080px;height:900px;object-fit:cover;display:block}
  .pane{flex:1;position:relative;background:linear-gradient(180deg,#241b16 0%,#1b1512 100%)}
  .rule{width:72px;height:3px;background:#c9742f;margin-bottom:26px}
  p{color:#f2ece4;line-height:1.6;letter-spacing:-.005em}
  .cta{color:#e8a765;font-weight:700}
  .foot{position:absolute;bottom:32px;display:flex;justify-content:space-between;
        align-items:baseline;font-family:Arial,sans-serif;font-size:17px;
        color:#8d7f73;letter-spacing:.02em}
  .num{font-variant-numeric:tabular-nums}
${extra}</style></head><body>${body}</body></html>`;

function oneLang({ img, focus, lines, cta, fs, pad, serif, lang, by, n }) {
  return SHELL(
    `<img class=photo src="${img}" style="object-position:${focus * 100}% ${focus * 100}%">
     <div class=pane><div class=rule></div>${para(lines, cta)}
       <div class=foot><span>Photo: Korea Tourism Organization (Photo Korea) – ${by}</span><span class=num>${n} / 4</span></div>
     </div>`,
    `  .pane{padding:${pad}px 72px 0}
  p{font-family:${serif};font-size:${fs}px}
  p.sp{height:.55em}
  .foot{left:72px;right:72px}
  html{lang:${lang}}\n`);
}

function twoLang({ img, focus, zh, ja, cta, fs, pad, by, n }) {
  return SHELL(
    `<img class=photo src="${img}" style="object-position:${focus * 100}% ${focus * 100}%">
     <div class=pane>
       <div class="col zh"><div class=tag>中文</div>${para(zh, cta)}</div>
       <div class="col ja" lang=ja><div class=tag>日本語</div>${para(ja, cta)}</div>
       <div class=foot><span>Photo: Korea Tourism Organization (Photo Korea) – ${by}</span><span class=num>${n} / 4</span></div>
     </div>`,
    `  .pane{padding:${pad}px 64px 0;display:flex;gap:46px}
  .col{flex:1;min-width:0}
  .col + .col{border-left:1px solid #3b2e25;padding-left:46px}
  .tag{font-family:Arial,sans-serif;font-size:16px;letter-spacing:.14em;color:#c9742f;font-weight:700;margin-bottom:18px}
  p{font-size:${fs}px}
  .zh p{font-family:"Noto Sans CJK SC","Source Han Sans SC","Microsoft YaHei",sans-serif}
  .ja p{font-family:"Noto Sans CJK JP","Source Han Sans JP","Hiragino Sans","Yu Gothic",sans-serif}
  p.sp{height:.5em}
  .foot{left:64px;right:64px}\n`);
}

mkdirSync(TMP, { recursive: true });
const jobs = [];
for (const [key, set] of Object.entries(SETS))
  set.cards.forEach((c, i) => {
    const ph = PHOTOS[c.p];
    jobs.push({ name: `namsan-${key}-${i + 1}`, html: oneLang({
      ...c, n: i + 1, img: join(ROOT, "assets", "photo-korea", ph.file),
      focus: ph.focus, by: ph.by, serif: set.serif, lang: set.lang }) });
  });
CJ.forEach((c, i) => {
  const ph = PHOTOS[c.p];
  jobs.push({ name: `namsan-cj-${i + 1}`, html: twoLang({
    ...c, n: i + 1, img: join(ROOT, "assets", "photo-korea", ph.file),
    focus: ph.focus, by: ph.by }) });
});
for (const j of jobs) writeFileSync(join(TMP, j.name + ".html"), j.html);

const { chromium } = await import("playwright").catch(() => {
  console.error("❌ playwright 가 없다 — npm install --no-save playwright && npx playwright install chromium");
  process.exit(1);
});
const browser = await chromium.launch(
  process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
const page = await browser.newPage({ viewport: { width: 1080, height: 1350 } });
let 탈 = 0;
for (const j of jobs) {
  await page.goto("file://" + join(TMP, j.name + ".html"), { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(800);
  // 🔎 **글이 넘쳤나 · 저절로 접혔나** — 화면만 보면 잘린 걸 놓친다.
  const bad = await page.evaluate(() => {
    const foot = document.querySelector(".foot").getBoundingClientRect();
    const out = [];
    for (const col of document.querySelectorAll(".pane")) {
      const ps = [...col.querySelectorAll("p")].filter((p) => p.textContent.trim());
      if (!ps.length) continue;
      const last = ps[ps.length - 1].getBoundingClientRect();
      if (foot.top - last.bottom < 18) out.push("출처에 닿는다");
      const w = ps.filter((p) => p.getBoundingClientRect().height >
                 parseFloat(getComputedStyle(p).fontSize) * 1.95).length;
      if (w) out.push(`저절로 접힌 줄 ${w}개`);
    }
    return out;
  });
  // 🚫 PNG 가 아니라 **JPEG** 로 낸다 — PNG 는 사진에 안 맞는 꼴이라 한 장이 1.9MB 다.
  //    품질 88 이면 눈으로 구별이 안 되면서 300KB 대로 떨어진다(20MB → 3.7MB).
  await page.screenshot({ path: join(OUT, j.name + ".jpg"), type: "jpeg", quality: 88 });
  if (bad.length) { 탈++; console.log(`❌ ${j.name} — ${bad.join(" · ")}`); }
  else console.log(`✅ ${j.name}`);
}
await browser.close();
rmSync(TMP, { recursive: true, force: true });
// 🔢 **숫자를 박아 두지 않는다** — 한국어 벌을 뺐더니 8장인데도 「12장」이라고 말했다.
console.log(`\n${탈 ? `❌ 손볼 카드 ${탈}장` : `✅ ${jobs.length}장 다 깨끗하다 → ${OUT}`}`);
if (탈) process.exit(1);
