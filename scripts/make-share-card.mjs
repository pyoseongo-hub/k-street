// 🖼️ 링크를 붙였을 때 뜨는 **미리보기 카드 그림**을 만든다 (public/share-card.png).
//
// 왜 필요한가 (2026-09-04 홍보 준비) — 지금 앱 주소를 카톡·트위터·레딧·문자에
// 붙이면 **아무 그림도 안 뜬다.** 밋밋한 글자 한 줄만 뜨는 링크는 아무도 안 누른다.
// 홍보를 시작하기 전에 반드시 있어야 하는 것이고, 한 번 만들어 두면 어디에
// 붙이든 같은 그림이 따라간다.
//
// 왜 그림 파일을 손으로 안 만들고 스크립트로 만드나 —
// **이름이 아직 가제**다(K-Street는 상표·스토어 중복 확인 전). 나중에 이름이
// 바뀌면 아래 CARD 한 곳만 고쳐 다시 돌리면 된다. 손으로 그린 그림이면 그때
// 처음부터 다시 그려야 한다.
//
// 실행:  node scripts/make-share-card.mjs
// (진짜 브라우저로 그려서 찍는다 — 앱과 같은 글꼴·색을 그대로 쓰기 위해서다.
//  글꼴 서버에 못 닿는 환경에서는 대체 서체로 그려지므로, 인터넷이 되는
//  곳에서 돌릴 것.)

import pw from "/opt/node22/lib/node_modules/playwright/index.js";
const { chromium } = pw;
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..", "public", "share-card.png");

// ── 여기만 고치면 된다 ──────────────────────────────────────────────────
const CARD = {
  name: "K-STREET",
  tagline: "서울의 길을 걷다",
  // 영어를 크게 둔다 — 이 그림을 볼 사람은 대부분 외국인 관광객이다.
  headline: "Seoul, street by street",
  sub: "Festivals · Markets · Flower walks · Trails · Museums",
  // 이 앱의 가장 큰 차별점. 여행 앱은 대부분 열자마자 가입을 요구한다.
  badges: ["Free forever", "No sign-up", "12 languages"],
};
// ────────────────────────────────────────────────────────────────────────

// 카카오톡·트위터·페이스북·레딧이 모두 1200×630을 기준으로 자른다.
const W = 1200;
const H = 630;

const html = `<!doctype html>
<html><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=DM+Sans:wght@400;500;700&family=IBM+Plex+Sans+KR:wght@500;600&family=IBM+Plex+Mono:wght@500&display=swap">
<style>
  * { box-sizing: border-box; margin: 0; }
  body {
    width: ${W}px; height: ${H}px; overflow: hidden;
    background: #131316;
    color: #EDEDF0;
    font-family: "DM Sans", "IBM Plex Sans KR", sans-serif;
    display: flex; flex-direction: column; justify-content: center;
    padding: 68px 76px;
    position: relative;
  }
  /* 칸(카테고리) 색을 옅게 깔아 둔다 — 앱을 열었을 때와 같은 색감이라
     "그 앱이구나" 하고 이어진다. */
  .glow {
    position: absolute; border-radius: 50%; filter: blur(90px); opacity: 0.30;
  }
  .g1 { width: 420px; height: 420px; background: #FF5A44; right: -90px; top: -130px; }
  .g2 { width: 360px; height: 360px; background: #4FE3CB; right: 130px; bottom: -170px; opacity: 0.22; }
  .g3 { width: 300px; height: 300px; background: #6FA894; left: -110px; bottom: -120px; opacity: 0.20; }

  .wordmark { display: flex; align-items: center; gap: 16px; margin-bottom: 34px; }
  .mark {
    width: 62px; height: 62px; border-radius: 17px; background: #FF5A44; color: #2A0F0B;
    display: flex; align-items: center; justify-content: center;
    font-family: "Cormorant Garamond", serif; font-weight: 700; font-size: 34px; line-height: 1;
  }
  .name { font-family: "Cormorant Garamond", serif; font-weight: 700; font-size: 40px; letter-spacing: 0.06em; }
  .tagline {
    font-family: "IBM Plex Mono", monospace; font-size: 15px; font-weight: 500;
    letter-spacing: 0.16em; color: #FF8A78; margin-top: 4px;
  }
  h1 {
    font-family: "Cormorant Garamond", serif; font-weight: 600;
    font-size: 78px; line-height: 1.08; letter-spacing: -0.01em; margin-bottom: 22px;
  }
  .sub { font-size: 25px; color: #A7A7B0; letter-spacing: 0.005em; }
  .badges { display: flex; gap: 12px; margin-top: 44px; }
  .badge {
    display: inline-flex; align-items: center; gap: 9px;
    padding: 11px 20px; border-radius: 100px;
    border: 1px solid #34343A; background: #1A1A1E;
    font-size: 19px; font-weight: 500; color: #EDEDF0;
  }
  .badge b { color: #4FE3CB; font-weight: 700; }
</style></head>
<body>
  <div class="glow g1"></div><div class="glow g2"></div><div class="glow g3"></div>
  <div class="wordmark">
    <div class="mark">K</div>
    <div>
      <div class="name">${CARD.name}</div>
      <div class="tagline">${CARD.tagline}</div>
    </div>
  </div>
  <h1>${CARD.headline}</h1>
  <div class="sub">${CARD.sub}</div>
  <div class="badges">
    ${CARD.badges.map((b) => `<span class="badge"><b>✓</b>${b}</span>`).join("")}
  </div>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
await page.setContent(html, { waitUntil: "load" });
// 글꼴이 늦게 오면 대체 서체로 찍힌다 — 조금 기다렸다가 찍는다.
await page.evaluate(() => document.fonts.ready).catch(() => {});
await page.waitForTimeout(1200);
await page.screenshot({ path: OUT });
await browser.close();

console.log(`✅ ${OUT} (${W}×${H})`);
console.log("   index.html의 og:image가 이 파일을 가리킨다 — 이름을 바꾸면 위 CARD만 고쳐 다시 돌릴 것.");
