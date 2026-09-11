// ✂️ **단추 안에서 글씨가 잘리지 않나** — 손으로 돌리는 검사.
//
// 왜 따로 있나 (2026-09-11):
//   `check-phone-width.mjs` 는 **줄 밖으로 넘쳤나**를 잰다. 그런데 이 사고는
//   줄 안에서 났다 — 단추는 얌전히 줄 안에 있었고, **글씨만 잘려 있었다.**
//   그래서 저 검사는 「넘침 0 ✅」을 돌려줬고, 12개 언어 중 9개에서 글씨가
//   잘린 채로 하루를 넘겼다. 사장님이 화면 사진을 보내 주셔서야 찾았다.
//
//   ⚠️ **재는 자리가 틀리면 초록불이 거짓말을 한다.** 이 저장소가 여러 번 데인
//      자리다(데스크톱 검사도 두 번 똑같이 틀렸다). 그래서 「넘쳤나」와
//      「잘렸나」를 **다른 검사로 갈라 둔다.**
//
// 무엇을 재나:
//   `scrollWidth > clientWidth` — 요소가 제 글씨를 다 못 담고 있다는 뜻이다.
//   눈으로는 「…」도 안 뜨고 그냥 잘려서, 화면만 봐서는 **알아채기 어렵다**
//   (`overflow: hidden` + `white-space: nowrap` 이면 말없이 잘린다).
//
// 원인이 뭐였나 — 앞으로 같은 걸 만나면 여기부터 볼 것:
//   `flex: 1` 은 `flex-basis: 0` 이라 브라우저가 **글씨 길이를 아예 안 본다.**
//   거기에 `min-width: 0` 까지 있으면 "글씨보다 좁아져도 된다"가 되어,
//   줄바꿈(`flex-wrap: wrap`)이 켜져 있어도 **넘친다는 사실 자체를 모른다.**
//   고친 방법은 `min-width: max-content` 다(src/index.css 의 .map-btn 주석).
//
// 왜 자동(Actions)으로 안 돌리나:
//   진짜 브라우저가 있어야 한다. 배포마다 크로미움을 내려받으면 시간과 비용이
//   는다 — 이 앱의 초심은 "적은 비용으로 오래"다. **CSS·글자·번역을 건드린
//   뒤에만** 손으로 돌린다(check-phone-width.mjs 와 같은 규칙).
//
// 돌리는 법:
//   npm run build && npm run place-pages
//   (cd dist && python3 -m http.server 8127 &)
//   node scripts/check-btn-clip.mjs 8127
//
// ⚠️ 이 검사는 **진짜로 실패하는 것을 보고** 채택했다. 고치기 전에 돌렸더니
//    12개 언어 중 9개를 ❌ 로 잡았다(독일어 「Essen in der Nähe ↗」가 가장 심해
//    93px 자리에 115px 필요). 안 잡히는 검사는 검사가 아니다.
let chromium;
// ESM 은 NODE_PATH 를 안 본다 — 이미 깔린 자리를 PLAYWRIGHT_MODULE 로 알려 준다.
for (const src of [process.env.PLAYWRIGHT_MODULE, "playwright"]) {
  if (!src) continue;
  try {
    const m = await import(src);
    // playwright 는 CommonJS 라 자리에 따라 default 안에 들어오기도 한다.
    chromium = m.chromium ?? m.default?.chromium;
    if (chromium) break;
  } catch {
    /* 다음 자리를 본다 */
  }
}
if (!chromium) {
  console.error(
    "❌ playwright 가 없다. 이 검사만 쓰려면 한 번 받아 두면 된다:\n   npx --yes playwright install --with-deps chromium",
  );
  process.exit(2);
}

const PORT = process.argv[2] ?? "8127";
const BASE = `http://127.0.0.1:${PORT}`;

// 12개 언어를 다 본다. 셋뿐이라 빠르고, **언어마다 낱말 길이가 달라서**
// 영어만 보면 독일어·인도네시아어가 안 잡힌다 — 실제로 그래서 놓쳤다.
const LANGS = ["ko", "en", "ja", "zh", "zh-TW", "vi", "es", "fr", "de", "ru", "id", "th"];

// 글씨가 든 단추·딱지들. 늘어나면 여기에 더한다.
const SELECTORS = [".map-btn", ".meta-share", ".tab-btn", ".chip", ".season-btn"];

const b = await chromium.launch();
let bad = 0;

for (const lang of LANGS) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 850 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  // 손님이 고른 언어가 언제나 이긴다(useLanguage.tsx) — 그 열쇠에 직접 넣는다.
  await page.addInitScript((l) => localStorage.setItem("k-street-language", l), lang);
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);

  const clipped = await page.evaluate((sels) => {
    const out = [];
    for (const sel of sels) {
      for (const el of document.querySelectorAll(sel)) {
        // 안 보이는 것은 재지 않는다 — 접힌 화면의 단추까지 잡으면 잡음이 된다.
        if (el.offsetParent === null) continue;
        if (el.scrollWidth > el.clientWidth + 1)
          out.push({
            sel,
            text: (el.innerText || "").trim().replace(/\n/g, " ").slice(0, 32),
            have: el.clientWidth,
            need: el.scrollWidth,
          });
      }
    }
    // 같은 단추가 카드마다 되풀이되므로 글씨로 한 번만 센다.
    const seen = new Set();
    return out.filter((x) => !seen.has(x.text) && seen.add(x.text));
  }, SELECTORS);

  if (clipped.length) {
    bad++;
    console.log(`❌ ${lang.padEnd(6)} ${clipped.length}개 잘림`);
    for (const c of clipped)
      console.log(`      <${c.sel}> ${c.have}px 자리에 ${c.need}px 필요  「${c.text}」`);
  } else {
    console.log(`✅ ${lang.padEnd(6)} 안 잘림`);
  }
  await ctx.close();
}

await b.close();
console.log(
  bad
    ? `\n❌ ${bad}개 언어에서 단추 글씨가 잘린다 — flex:1 과 min-width:0 부터 볼 것 (맨 위 주석)`
    : `\n✅ ${LANGS.length}개 언어 전부, 단추 글씨가 안 잘린다`,
);
process.exit(bad ? 1 : 0);
