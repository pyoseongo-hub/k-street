// 📏 **「가까운 순 보기」가 진짜로 그려지나** — 진짜 브라우저로 보는 검사.
//
// 왜 필요한가 (2026-09-12):
//   이 화면은 **CSS 가 없으면 조용히 망가진다.** 띠 제목(.band-head)·보기 전환
//   (.view-toggle)은 `.place-list` 의 자식인데, 1080px 이상에서 그 목록이
//   **3칸 격자**가 된다(src/index.css 2208줄). 그러면 줄 제목이 칸 하나를 차지해
//   **카드 사이에 끼어 버린다.** 문법 오류도, 타입 오류도 아니라 `tsc` 는 통과한다.
//   폰 화면만 봐도 안 보인다 — 폰은 flex 라 멀쩡하다.
//
// 무엇을 보나:
//   ① 구를 고르면 보기 전환이 뜨나 (역 자료가 있는 구)
//   ② 「거리순」을 누르면 띠 제목(.band-head)과 거리 딱지(.pr-dist)가 뜨나
//   ③ 거리가 **커지는 순서**로 늘어서나 — 뒤죽박죽이면 이 화면의 존재 이유가 없다
//   ④ 1200px 에서 줄 제목이 **한 줄을 통째로** 쓰나 (격자 사고)
//   ⑤ 12개 언어에서 전환 단추 글씨가 안 잘리나 (check-btn-clip.mjs 와 같은 잣대)
//
// 돌리는 법:
//   npm run build && npm run place-pages
//   (cd dist && python3 -m http.server 8127 &)
//   node scripts/check-distance-view.mjs 8127
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

const PORT = process.argv[2] ?? "8127";
const BASE = `http://127.0.0.1:${PORT}`;
const LANGS = ["ko", "en", "ja", "zh", "zh-TW", "vi", "es", "fr", "de", "ru", "id", "th"];

const b = await chromium.launch();
let bad = 0;
const fail = (m) => {
  bad++;
  console.log(`❌ ${m}`);
};

/**
 * 첫 화면 → 동네 탭 → 구 하나를 고른다.
 *
 * ⚠️ **아무 칸이나 고르면 검사가 헐거워진다.** 처음엔 `.has-data` 첫 칸을 눌렀는데
 *    곳이 3개뿐인 구가 걸려서, 「거리 순서가 맞나」를 3개로만 재고 있었다.
 *    그래서 기본(영어) 화면에서는 **Jongno(종로, 55곳)** 를 집어 준다 — 띠가 네 개 다 나온다.
 *    언어를 바꾸면 칸 이름도 바뀌므로(한국어면 「종로」) 그때는 첫 칸으로 둔다(거기선 글씨 잘림만 본다).
 */
async function openDistrict(page, label) {
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  // 동네 탭은 두 번째 .home-tab 이다(계절 · 동네).
  const tabs = page.locator(".home-tab");
  if ((await tabs.count()) >= 2) await tabs.nth(1).click();
  await page.waitForTimeout(300);
  let tile = page.locator(".hex-tile.has-data").first();
  if (label) {
    const want = page.locator(`.hex-tile.has-data:has-text("${label}")`).first();
    if (await want.count()) tile = want;
  }
  await tile.click();
  await page.waitForTimeout(400);
}

// ── ①②③ 폰 화면에서 동작 확인 ──────────────────────────────────────
{
  const ctx = await b.newContext({ viewport: { width: 390, height: 850 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  await openDistrict(page, "Jongno");

  const toggle = page.locator(".view-toggle .view-tab");
  const n = await toggle.count();
  if (n !== 2) fail(`보기 전환이 2칸이 아니다 (${n}칸)`);
  else console.log("✅ 구를 고르면 보기 전환 2칸이 뜬다");

  if (n === 2) {
    await toggle.nth(1).click(); // 거리순
    await page.waitForTimeout(300);

    const heads = await page.locator(".band-head").count();
    if (!heads) fail("거리순인데 띠 제목(.band-head)이 하나도 없다");
    else console.log(`✅ 거리 띠 ${heads}개가 뜬다`);

    const note = await page.locator(".band-note").count();
    if (!note) fail("기준점 안내(.band-note)가 없다 — 어디서 잰 거리인지 안 밝히면 안 된다");
    else console.log("✅ 기준점(대표 역) 안내가 뜬다");

    // ③ 거리가 커지는 순서인가
    const metres = await page.$$eval(".pr-dist", (els) =>
      els.map((e) => {
        const s = (e.textContent || "").trim();
        const v = parseFloat(s);
        return s.endsWith("km") ? v * 1000 : v;
      }),
    );
    if (metres.length < 2) fail(`거리 딱지(.pr-dist)가 ${metres.length}개뿐이다`);
    else {
      // m 은 반올림, km 은 소수 한 자리라 **표시값끼리는** 살짝 되밀릴 수 있다.
      // 50m 넘게 거꾸로 가면 그건 정렬이 깨진 것이다.
      const back = metres.findIndex((v, i) => i > 0 && v < metres[i - 1] - 50);
      if (back > 0) fail(`거리가 거꾸로 간다: ${metres[back - 1]}m → ${metres[back]}m`);
      else console.log(`✅ ${metres.length}곳이 가까운 순으로 늘어선다 (${metres[0]}m … ${metres.at(-1)}m)`);
    }
  }
  await ctx.close();
}

// ── ④ 넓은 화면: 줄 제목이 한 줄을 통째로 쓰나 ─────────────────────
{
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  await openDistrict(page, "Jongno");
  const toggle = page.locator(".view-toggle .view-tab");
  if ((await toggle.count()) === 2) {
    await toggle.nth(1).click();
    await page.waitForTimeout(300);
    const wrong = await page.evaluate(() => {
      const list = document.querySelector(".place-list");
      if (!list) return ["목록이 없다"];
      const listW = list.getBoundingClientRect().width;
      const out = [];
      for (const sel of [".view-toggle", ".band-note", ".band-head"]) {
        for (const el of list.querySelectorAll(sel)) {
          const w = el.getBoundingClientRect().width;
          // 한 줄을 다 쓰면 목록 폭과 같다. 칸 하나만 차지하면 3분의 1쯤 된다.
          if (w < listW * 0.9) out.push(`${sel} 가 ${Math.round(w)}px — 목록은 ${Math.round(listW)}px`);
        }
      }
      return out;
    });
    if (wrong.length) {
      fail("1280px 에서 줄 제목이 칸 하나에 끼었다 (grid-column: 1 / -1 확인)");
      for (const w of new Set(wrong)) console.log(`      ${w}`);
    } else console.log("✅ 1280px 3칸 격자에서도 줄 제목이 한 줄을 통째로 쓴다");
  }
  await ctx.close();
}

// ── ⑤ 12개 언어에서 전환 단추 글씨가 안 잘리나 ──────────────────────
{
  const clippedLangs = [];
  for (const lang of LANGS) {
    const ctx = await b.newContext({ viewport: { width: 390, height: 850 }, isMobile: true, hasTouch: true });
    const page = await ctx.newPage();
    await page.addInitScript((l) => localStorage.setItem("k-street-language", l), lang);
    await openDistrict(page);
    const clipped = await page.$$eval(".view-tab", (els) =>
      els
        .filter((e) => e.offsetParent !== null && e.scrollWidth > e.clientWidth + 1)
        .map((e) => `${(e.innerText || "").trim()} — ${e.clientWidth}px 자리에 ${e.scrollWidth}px 필요`),
    );
    if (clipped.length) {
      clippedLangs.push(lang);
      console.log(`❌ ${lang.padEnd(6)} 전환 단추 글씨 잘림`);
      for (const c of clipped) console.log(`      ${c}`);
    }
    await ctx.close();
  }
  if (clippedLangs.length) bad++;
  else console.log(`✅ ${LANGS.length}개 언어 전부, 전환 단추 글씨가 안 잘린다`);
}

await b.close();
console.log(bad ? `\n❌ ${bad}군데가 잘못됐다` : "\n✅ 가까운 순 보기 이상 없다");
process.exit(bad ? 1 : 0);
