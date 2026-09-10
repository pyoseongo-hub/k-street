#!/usr/bin/env node
// 📸 **스토어와 설치 창에 쓸 화면 사진을 진짜 브라우저로 찍는다.** (2026-09-10)
//
// 왜 (사장님: "어플화하는게 맞는거 같은데"):
//   구글 플레이에 올리려면 **폰 화면 사진이 최소 2장** 있어야 한다.
//   그리고 사진이 manifest 에 있으면 안드로이드 크롬이 설치 창을
//   **사진과 함께 크게** 띄워 준다 — 그냥 "설치하시겠습니까?"보다 훨씬 낫다.
//
// ⚠️ 예전 사진(public/screenshots/*.png)은 **2026-09-01 것**이라 그 뒤에 바뀐
//    화면이 안 들어가 있었다. 사진은 손으로 찍어 두면 반드시 낡는다 —
//    그래서 **다시 찍는 명령**으로 만들어 둔다.
//
// 🚨 손님이 실제로 보는 화면을 찍는다. 꾸미거나 없는 기능을 넣지 않는다.
//
//   npx http-server dist -p 8131 -s &
//   node scripts/make-screenshots.mjs 8131
//
// 플레이스토어 폰 사진 규격(2026-09 기준, 올리기 전에 콘솔에서 다시 볼 것):
//   · 세로로 긴 사진, 짧은 변 최소 320px · 긴 변 최대 3840px
//   · 1080×1920 이면 넉넉히 맞는다

let chromium;
for (const src of [process.env.PLAYWRIGHT_MODULE, "playwright"]) {
  if (!src) continue;
  try {
    const m = await import(src);
    chromium = m.chromium ?? m.default?.chromium;
    if (chromium) break;
  } catch {
    /* 다음 자리를 본다 */
  }
}
if (!chromium) {
  console.error("❌ playwright 가 없다:\n   npx --yes playwright install --with-deps chromium");
  process.exit(2);
}

import { mkdirSync } from "node:fs";

const PORT = process.argv[2] ?? "8131";
const BASE = `http://127.0.0.1:${PORT}`;
const OUT = "public/screenshots";
mkdirSync(OUT, { recursive: true });

// 폰 크기로 그린 뒤 3배로 키워 찍는다(1080×1920). 폰에서 보이는 것과 같은
// 배치에, 스토어가 요구하는 크기가 나온다.
const W = 360;
const H = 640;
const SCALE = 3;

// 무엇을 보여 줄까 — **손님이 처음 궁금해할 순서**로 고른다.
//   ① 첫 화면(계절·동네) ② 동네 하나를 연 화면 ③ 곳 하나를 연 화면
const SHOTS = [
  { file: "phone-1-home.png", path: "/", wait: 1500, what: "첫 화면" },
  // ⚠️ 단추를 **글자로 찾지 않는다.** 처음에 「동네」로 찾았더니 영어 화면에서
  //    못 찾아 첫 화면이 두 번 찍혔다(단추 이름이 "Neighborhoods"였다).
  //    12개 언어를 도는 물건이라 글자는 매번 바뀐다 — **자리로 누른다.**
  { file: "phone-2-district.png", path: "/", wait: 1500, what: "동네", tab: 1 },
  { file: "phone-3-place.png", path: "/seoul/luggage/", wait: 900, what: "짐 보관 안내" },
];

const LANG = process.env.SHOT_LANG ?? "en";

const b = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined });
const ctx = await b.newContext({
  viewport: { width: W, height: H },
  deviceScaleFactor: SCALE,
  locale: LANG,
  isMobile: true,
  hasTouch: true,
});
const page = await ctx.newPage();
await page.addInitScript((l) => localStorage.setItem("k-street-language", l), LANG);

let made = 0;
for (const shot of SHOTS) {
  const res = await page.goto(`${BASE}${shot.path}`, { waitUntil: "networkidle" });
  if (!res || res.status() !== 200) {
    console.log(`❌ ${shot.what} — 페이지가 없다 (${res?.status() ?? "응답 없음"}) ${shot.path}`);
    continue;
  }
  await page.waitForTimeout(shot.wait);

  // 설치 안내 띠가 사진에 끼어들면 스토어 사진이 지저분해진다 — 닫아 둔다.
  await page.evaluate(() => {
    try {
      localStorage.setItem("k-street-install-hint-dismissed", "1");
    } catch {
      /* 저장소를 막아 둔 브라우저 — 그냥 넘어간다 */
    }
  });

  if (shot.tab !== undefined) {
    const tabs = page.locator(".home-tab");
    const n = await tabs.count();
    if (n > shot.tab) {
      await tabs.nth(shot.tab).click();
      await page.waitForTimeout(1000);
    } else {
      // 조용히 첫 화면을 두 번 찍으면 **똑같은 사진 두 장**이 스토어에 올라간다.
      // 시끄럽게 알린다.
      console.log(`   ❌ 탭이 ${n}개뿐이라 ${shot.tab}번을 못 눌렀다 — 이 사진은 쓰면 안 된다`);
    }
  }

  await page.screenshot({ path: `${OUT}/${shot.file}` });
  made++;
  console.log(`✅ ${shot.what.padEnd(12)} ${OUT}/${shot.file}  (${W * SCALE}×${H * SCALE})`);
}

await b.close();
console.log(
  made === SHOTS.length
    ? `\n✅ ${made}장 찍었다. manifest 의 screenshots 와 이름이 맞는지 볼 것.`
    : `\n❌ ${SHOTS.length - made}장을 못 찍었다 — 위 줄을 볼 것`,
);
process.exit(made === SHOTS.length ? 0 : 1);
