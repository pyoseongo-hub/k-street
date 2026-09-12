// 🎬 **앱 설명 릴스용 스틸컷을 찍는다** — 세로 1080×1920 · 다크모드 · 12개 언어 중 셋.
//
// 사장님 (2026-09-12): "인스타 자막 소리 넣어 만들 스틸컷과 대본 만들어줘 …
//                     스샷에는 손으로 터치하는 제스처나 모양 넣어서 어떻게
//                     작동하고 다음 페이지 넘어가는지 보여줄 수 있게"
//                     → 그다음: "내가 원한 건 비 오는 날 설명이 아니고
//                       **전체 사용 설명** 인스타야"
//
// ─────────────────────────────────────────────────────────────────────────
// 🚨 왜 **러너**에서 찍나 — 작업 환경에서는 사진이 안 나온다
// ─────────────────────────────────────────────────────────────────────────
//   곳 사진은 관광공사 서버(tong.visitkorea.or.kr)에서 온다. 이 저장소를 만드는
//   세션은 바깥 인터넷이 막혀 있어(403) **축제 카드가 회색 빈칸으로 찍힌다.**
//   앱 설명 릴스에서 사진은 빼놓을 수 없는 것이라, **인터넷이 되는 러너**가 찍는다.
//   찍은 것은 docs/홍보-사진/릴스/ 에 커밋한다 — 그 폴더는 이미 홍보용 사진을
//   모아 두는 자리다(사장님이 폰으로 찍어 둔 8장이 거기 있다).
//
// 📌 **BASE 를 바꿔 로컬에서도 돌린다.** 화면 이름(선택자)이 맞는지는 여기서
//    확인하고, 사진이 필요한 최종 촬영만 러너에 맡긴다 — 왕복을 줄인다.
//      BASE=http://localhost:4300 node scripts/shoot-reel.mjs
//
// ⚠️ **화면을 지어내지 않는다.** 이 스크립트는 돌아가는 앱을 누르고 찍을 뿐이다.
//    광고와 앱이 다르면 눌러 본 손님이 속았다고 느낀다.

import { mkdirSync } from "node:fs";
import { chromium } from "playwright";

const BASE = process.env.BASE || "https://korea-street.com";
const OUT = process.env.OUT || "docs/홍보-사진/릴스";
const LANGS = (process.env.LANGS || "en,ja,zh").split(",").map((s) => s.trim()).filter(Boolean);
const EXEC = process.env.CHROME_PATH || undefined;

// 📱 **폰 비율로 찍는다.** 405×720 은 9:16 이고 405px 이라 앱이 폰 화면으로 그려진다
//    (1080 폭으로 바로 찍으면 PC 3단 화면이 나온다 — 인스타에 쓸 수 없다).
//    deviceScaleFactor 2.6667 → 1080×1920 으로 나온다.
const VIEW = { width: 405, height: 720 };
const DSF = 2.6667;

mkdirSync(OUT, { recursive: true });

// ── 화면에 얹는 표시 ────────────────────────────────────────────────────
// 👆 손가락이 누른 자리. 영상 만드는 쪽이 「여기를 눌렀다」를 알아봐야 한다.
const TOUCH = ({ sel, idx, label }) => {
  const list = document.querySelectorAll(sel);
  const el = idx != null ? list[idx] : list[0];
  if (!el) return false;
  const r = el.getBoundingClientRect();
  const x = r.left + r.width / 2;
  const y = r.top + r.height / 2;
  const w = document.createElement("div");
  w.setAttribute("data-shot", "1");
  w.style.cssText = "position:fixed;left:0;top:0;width:100%;height:100%;z-index:99999;pointer-events:none";
  w.innerHTML =
    `<div style="position:absolute;left:${x - 27}px;top:${y - 27}px;width:54px;height:54px;border-radius:50%;border:2px solid rgba(255,255,255,.42)"></div>` +
    `<div style="position:absolute;left:${x - 13}px;top:${y - 13}px;width:26px;height:26px;border-radius:50%;background:rgba(255,255,255,.95);box-shadow:0 0 18px rgba(255,255,255,.6)"></div>` +
    (label
      ? `<div style="position:absolute;left:${Math.max(8, Math.min(x + 32, innerWidth - 100))}px;top:${y - 11}px;padding:3px 9px;border-radius:100px;background:rgba(255,255,255,.95);color:#111;font:600 12px/1.2 system-ui,sans-serif;white-space:nowrap">${label}</div>`
      : "");
  document.body.appendChild(w);
  return true;
};
// 👉 옆으로 미는 표시
const SWIPE = ({ sel }) => {
  const el = document.querySelector(sel);
  if (!el) return false;
  const r = el.getBoundingClientRect();
  const y = r.top + r.height / 2;
  const d = document.createElement("div");
  d.setAttribute("data-shot", "1");
  d.style.cssText = "position:fixed;left:0;top:0;width:100%;height:100%;z-index:99999;pointer-events:none";
  d.innerHTML =
    `<div style="position:absolute;left:${r.right - 84}px;top:${y - 12}px;width:24px;height:24px;border-radius:50%;background:rgba(255,255,255,.95)"></div>` +
    `<div style="position:absolute;left:${r.right - 176}px;top:${y - 2}px;width:100px;height:4px;border-radius:4px;background:linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,.85))"></div>`;
  document.body.appendChild(d);
  return true;
};
const CLEAR = () => document.querySelectorAll("[data-shot]").forEach((n) => n.remove());
// 🌙 **다크로 못 박는다.** 손님 설정에 맡기면 영상마다 색이 달라진다.
const DARK = () => document.documentElement.setAttribute("data-theme", "dark");

const b = await chromium.launch({ executablePath: EXEC });
let ok = 0;
const failed = [];

for (const lang of LANGS) {
  const ctx = await b.newContext({ viewport: VIEW, deviceScaleFactor: DSF, colorScheme: "dark" });
  const p = await ctx.newPage();
  await p.goto(BASE, { waitUntil: "domcontentloaded" });
  await p.evaluate((l) => localStorage.setItem("k-street-language", l), lang);

  const home = async () => {
    await p.goto(BASE, { waitUntil: "networkidle" });
    await p.evaluate(DARK);
    // 🖼️ 사진이 다 뜨기를 기다린다 — 빈칸으로 찍히면 이 스크립트를 돌린 뜻이 없다.
    await p.waitForTimeout(1800);
  };
  await home();

  const shot = (n, name) => p.screenshot({ path: `${OUT}/${lang}-${String(n).padStart(2, "0")}-${name}.png` });
  /**
   * 컷 하나. **실패해도 멈추지 않는다** — 한 컷이 안 되면 그 컷만 빼고 나머지를
   * 다 찍고 무엇이 안 됐는지 알려 준다. 러너 왕복을 아끼려면 이게 낫다.
   */
  const cut = async (n, name, fn) => {
    try {
      await fn();
      await shot(n, name);
      await p.evaluate(CLEAR);
      ok++;
    } catch (e) {
      failed.push(`${lang}-${n}-${name}: ${String(e).slice(0, 90)}`);
      await p.evaluate(CLEAR).catch(() => {});
    }
  };

  // ① 첫 화면 — 계절 표지 사진
  await cut(1, "home", async () => {});

  // ② 계절을 고른다
  await cut(2, "tap-season", async () => {
    await p.evaluate(TOUCH, { sel: ".season-chip", idx: 2, label: "tap" });
  });

  // ③ 달을 고른다
  await cut(3, "tap-month", async () => {
    await p.evaluate(() => document.querySelector(".month-strip")?.scrollIntoView({ block: "center" }));
    await p.waitForTimeout(400);
    await p.evaluate(TOUCH, { sel: ".month-chip", idx: 1, label: "tap" });
  });

  // ④ 갈래를 옆으로 민다 (꽃·빛·음악·먹거리…)
  await cut(4, "swipe-themes", async () => {
    await p.evaluate(() => document.querySelector(".theme-row")?.scrollIntoView({ block: "center" }));
    await p.waitForTimeout(400);
    await p.evaluate(SWIPE, { sel: ".theme-row" });
  });

  // ⑤ 축제 카드 — **사진이 나오는 컷**
  await cut(5, "cards", async () => {
    await p.evaluate(() => document.querySelector(".festival-card")?.scrollIntoView({ block: "start" }));
    await p.waitForTimeout(1200);
  });

  // ⑥ 카카오맵을 누른다
  await cut(6, "tap-map", async () => {
    await p.evaluate(TOUCH, { sel: ".map-btn--kakao", label: "tap" });
  });

  // ⑦ 기사에게 보여 주는 화면 — 우리만 있는 것
  await cut(7, "driver", async () => {
    await p.click(".map-btn--driver");
    await p.waitForTimeout(900);
  });

  // ⑧ 동네 탭을 누른다
  await cut(8, "tap-district", async () => {
    await home();
    await p.evaluate(TOUCH, { sel: ".home-tab", idx: 1, label: "tap" });
  });

  // ⑨ 25개 구 육각 지도
  await cut(9, "hexmap", async () => {
    await p.evaluate(() => document.querySelectorAll(".home-tab")[1].click());
    await p.waitForTimeout(900);
    await p.evaluate(() => document.querySelector(".district-hexgrid")?.scrollIntoView({ block: "center" }));
    await p.waitForTimeout(400);
  });

  // ⑩ 구 하나를 누른다
  await cut(10, "tap-gu", async () => {
    await p.evaluate(TOUCH, { sel: ".hex-tile.has-data", idx: 6, label: "tap" });
  });

  // ⑪ 그 구의 곳들
  //    🐞 처음에는 `.category-chip-row` 로 내려갔는데 그건 **지도 위쪽**이라
  //       지도를 다시 찍었다(구를 누른 결과가 안 보였다). 목록은 `.place-list` 다.
  await cut(11, "gu-places", async () => {
    await p.evaluate(() => document.querySelectorAll(".hex-tile.has-data")[6].click());
    await p.waitForTimeout(1400);
    await p.evaluate(() => document.querySelector(".place-list")?.scrollIntoView({ block: "start" }));
    // 🖼️ 목록에도 사진이 있다 — 스크롤한 뒤 뜨기를 기다린다.
    await p.waitForTimeout(1600);
  });

  // ⑫ 하트를 누른다
  await cut(12, "tap-save", async () => {
    await p.evaluate(TOUCH, { sel: ".save-btn", label: "tap" });
  });

  // ⑬ 저장한 곳
  await cut(13, "saved", async () => {
    await p.evaluate(() => document.querySelector(".save-btn")?.click());
    await p.waitForTimeout(500);
    await p.evaluate(() => document.querySelectorAll(".tab")[1].click());
    await p.waitForTimeout(1200);
  });

  // ⑭ ☂️ 비 오는 날 — 한 컷만
  await cut(14, "rainy", async () => {
    await home();
    await p.click(".rainy-btn");
    await p.waitForTimeout(900);
  });

  // ⑮ ✈️ 도착 안내
  await cut(15, "arrival", async () => {
    await home();
    await p.click(".arrival-btn");
    await p.waitForTimeout(900);
  });

  // ⑯ 🌐 12개 언어
  await cut(16, "tap-language", async () => {
    await home();
    await p.evaluate(TOUCH, { sel: ".language-selector", label: "12" });
  });

  await ctx.close();
  console.log(`  ${lang} 찍었다`);
}
await b.close();

console.log(`\n✅ ${ok}장 (${LANGS.length}개 언어 × 16컷 = ${LANGS.length * 16} 목표)`);
if (failed.length) {
  console.log(`\n⚠️ 못 찍은 컷 ${failed.length}개 — 화면 이름이 바뀌었을 수 있다:`);
  for (const f of failed) console.log(`   ${f}`);
}
// 🚨 절반도 못 찍었으면 **빨갛게 죽는다.** 몇 장 남은 것을 「됐다」고 넘기면
//    다음 사람이 빈 폴더를 보고 원인을 다시 찾아야 한다.
if (ok < LANGS.length * 16 * 0.5) {
  console.error("\n🚨 절반도 못 찍었다. 화면 이름(선택자)을 먼저 볼 것.");
  process.exit(1);
}
