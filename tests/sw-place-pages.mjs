// 🧪 **서비스워커가 곳 페이지를 가로채지 않는지** 진짜 브라우저로 확인한다.
//
// 왜 이 시험이 있나 (2026-09-05) — 곳 페이지 307장을 만들고 나서 dist/sw.js 를
// 열어 봤더니 `NavigationRoute → createHandlerBoundToURL("index.html")` 이 있었다.
// 서비스워커는 기본으로 **모든 화면 이동을 가로채 앱 한 장을 준다.** SPA 라면
// 그게 맞지만, 우리는 /place/… 에 진짜 HTML 파일을 따로 만들어 뒀다.
//
// 그래서 이렇게 갈릴 뻔했다:
//   · 처음 오는 손님·크롤러 → 서비스워커가 없으니 진짜 페이지 ✅
//   · 앱에 한 번이라도 들어온 적 있는 사람 → 앱 첫 화면 ❌
//
// **검색은 멀쩡한데 사람이 링크를 나눠 주면 엉뚱한 화면이 뜬다.** 오류도 안 나서
// 티가 안 난다 — 그래서 눈으로는 못 잡고, 이렇게 기계로 잡아야 한다.
//
// 시험 방법: 먼저 홈을 열어 **서비스워커를 실제로 설치시키고**(returning visitor 를
// 만든다), 그 상태에서 곳 페이지로 간다. 앱 첫 화면이 뜨면 실패다.
//
//   1) npm run build && npm run place-pages
//   2) npx vite preview --port 4361
//   3) node tests/sw-place-pages.mjs
import pw from "/opt/node22/lib/node_modules/playwright/index.js";
const { chromium } = pw;

const BASE = process.env.BASE ?? "http://localhost:4361";
const SLUG = process.env.SLUG ?? "gwangjang-market";

const browser = await chromium.launch({
  executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
});
// 🚨 서비스워커는 **한 브라우저 프로필 안에서만** 산다. 새 context 를 쓰면
//    설치한 적 없는 손님이 되어 시험이 통째로 무의미해진다 — 같은 context 를 쓴다.
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
let bad = 0;

// ① 홈을 열어 서비스워커를 설치시킨다.
const home = await ctx.newPage();
await home.goto(BASE + "/", { waitUntil: "networkidle" });
const installed = await home.evaluate(async () => {
  const r = await navigator.serviceWorker.ready.catch(() => null);
  return Boolean(r && navigator.serviceWorker.controller);
});
// 첫 방문은 아직 controller 가 없을 수 있다 — 한 번 더 열어 확실히 물린다.
await home.reload({ waitUntil: "networkidle" });
const controlled = await home.evaluate(() => Boolean(navigator.serviceWorker.controller));
console.log(`서비스워커 설치됨: ${installed || controlled ? "✅" : "⬜ (이 환경에선 안 붙음)"}`);
if (!controlled) {
  console.log("⚠️ 서비스워커가 안 물렸다 — 이 시험은 아무것도 증명하지 못한다. 그대로 실패로 둔다.");
  bad++;
}

// ② 그 상태에서 곳 페이지로 간다. 여기서 앱 첫 화면이 뜨면 사고다.
const page = await ctx.newPage();
await page.goto(`${BASE}/place/${SLUG}/`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(400);

const h1 = (await page.locator("h1").first().innerText().catch(() => "")).trim();
const isApp = (await page.locator(".home-tab").count()) > 0;
const hasLd = (await page.locator('script[type="application/ld+json"]').count()) > 0;

console.log(`곳 페이지 h1        : ${h1 || "(없음)"}`);
console.log(`앱 첫 화면이 떴나    : ${isApp ? "❌ 그렇다 — 가로채였다" : "✅ 아니다"}`);
console.log(`구조화 자료가 있나   : ${hasLd ? "✅" : "❌"}`);
if (isApp || !hasLd || !h1) bad++;

// ③ sitemap 도 같이 본다 — 여기가 앱으로 바뀌면 구글이 사이트맵을 못 읽는다.
const sm = await ctx.request.get(`${BASE}/sitemap.xml`);
const smText = await sm.text();
const smOk = smText.trimStart().startsWith("<?xml");
console.log(`sitemap.xml 이 XML 인가: ${smOk ? "✅" : "❌ 앱 화면이 왔다"}`);
if (!smOk) bad++;

console.log(bad ? `\n❌ 문제 ${bad}건` : "\n✅ 서비스워커가 곳 페이지를 안 건드린다.");
await browser.close();
process.exit(bad ? 1 : 0);
