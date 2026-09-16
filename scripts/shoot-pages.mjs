// 📸 **주소 목록을 폰 화면 크기로 찍는다.**
//
// 사장님 (2026-09-16): *"모든 링크 다보고 스샷찍고 확인"*
//
// ── 왜 필요한가 ─────────────────────────────────────────────────────
//   링크 검사는 **200이 떴다**까지만 말해 준다. 200이 떠도 화면이 깨져 있을 수
//   있고, 빈 칸일 수도 있고, 옛 내용일 수도 있다. **눈으로 봐야 아는 것**이 있다.
//   이 저장소는 그걸로 여러 번 데였다 — 짐보관 카드가 어두운 화면에서 혼자
//   흰색이던 것도, 릴스 자막이 양옆 잘린 것도 열어 보고서야 알았다.
//
// ── 왜 폰 크기인가 ──────────────────────────────────────────────────
//   손님은 거의 다 폰으로 본다. 넓은 화면으로 찍으면 **폰에서만 깨지는 것**을 놓친다.
//
// ⚠️ 작업 환경(샌드박스)에서는 korea-street.com 이 막혀 있다. 러너에서 돌린다.
//
// 환경변수 — URLS(쉼표) · OUT(담을 폴더) · WIDTH · HEIGHT · FULL(1이면 페이지 전체)

import { mkdirSync, writeFileSync } from "node:fs";
import { chromium } from "playwright";

const URLS = (process.env.URLS || "https://korea-street.com")
  .split(",").map((s) => s.trim()).filter(Boolean);
const OUT = process.env.OUT || "docs/화면-확인";
const WIDTH = Number(process.env.WIDTH || 390);
const HEIGHT = Number(process.env.HEIGHT || 844);
const FULL = process.env.FULL === "1";

mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
// 🚨 **캐시를 쓰지 않는 새 브라우저**로 연다. 사장님이 겪으신 「예전 페이지」가
//    폰에 저장된 화면 때문인지, 서버가 옛것을 주는 것인지 가르려면
//    **아무것도 저장 안 된 상태**에서 봐야 한다.
const ctx = await browser.newContext({
  viewport: { width: WIDTH, height: HEIGHT },
  deviceScaleFactor: 2,
  locale: "en-US",
  userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 "
    + "(KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
});

const rows = [];
for (const [i, url] of URLS.entries()) {
  const page = await ctx.newPage();
  const name = `${String(i + 1).padStart(2, "0")}-`
    + (url.replace(/^https?:\/\//, "").replace(/[^a-zA-Z0-9.-]+/g, "-").slice(0, 60) || "page");
  let note = "";
  try {
    const res = await page.goto(url, { waitUntil: "networkidle", timeout: 45000 });
    // 화면이 다 그려질 틈을 준다 — 이 앱은 자바스크립트로 그린다.
    await page.waitForTimeout(1200);
    const title = await page.title();
    // 👀 **본문에 글자가 있나.** 200 이 떠도 빈 화면일 수 있다.
    const text = (await page.evaluate(() => document.body?.innerText ?? "")).trim();
    await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: FULL });
    note = `${res?.status() ?? "?"} · 글자 ${text.length}자 · ${title}`;
    if (text.length < 40) note += "  ⚠️ **글자가 거의 없다 — 빈 화면일 수 있다**";
    console.log(`✅ ${url}\n   ${note}`);
  } catch (e) {
    note = `❌ ${e.message.split("\n")[0]}`;
    console.log(`❌ ${url}\n   ${note}`);
    try { await page.screenshot({ path: `${OUT}/${name}.png` }); } catch {}
  }
  rows.push({ url, 파일: `${name}.png`, 결과: note });
  await page.close();
}

await browser.close();

writeFileSync(`${OUT}/읽어보세요.md`,
  `# 📸 화면 확인 — ${new Date().toISOString().slice(0, 10)}\n\n`
  + `\`scripts/shoot-pages.mjs\` 가 **폰 크기(${WIDTH}×${HEIGHT})**로 찍은 것입니다.\n`
  + `캐시를 쓰지 않는 새 브라우저로 열었습니다 — 「예전 페이지」가 폰 탓인지\n`
  + `서버 탓인지 가르려면 그래야 합니다.\n\n`
  + `| 파일 | 주소 | 결과 |\n|---|---|---|\n`
  + rows.map((r) => `| \`${r.파일}\` | ${r.url} | ${r.결과} |`).join("\n") + "\n",
  "utf-8");

console.log(`\n📸 ${rows.length}장 → ${OUT}/`);
