// 📱 **폰 폭(390px)에서 글자가 화면 밖으로 나가지 않나** — 손으로 돌리는 검사.
//
// 왜 있나 (2026-09-10):
//   일본어 짐 보관 안내가 폰에서 **215px 가로로 넘쳤다.** 손님이 옆으로 밀어야
//   문장 끝을 읽을 수 있었다. 원인은 CSS 의 `word-break: keep-all` 이었다 —
//   띄어쓰기가 있는 한국어에는 맞지만, **띄어쓰기가 없는 일본어·중국어에서는
//   한 문장이 통째로 한 낱말**이 되어 줄바꿈 자리가 하나도 안 생긴다.
//   한국어·영어로만 확인하면 **절대 안 보이는 자리**다.
//
// 왜 자동(Actions)으로 안 돌리나:
//   재려면 진짜 브라우저가 있어야 하는데, 배포마다 크로미움을 내려받으면
//   시간과 비용이 는다. 이 앱의 초심은 "적은 비용으로 오래"다.
//   그래서 **글자 크기·CSS·새 언어를 건드린 뒤에만** 손으로 돌린다.
//
// 돌리는 법:
//   npm run build && npx vite build --ssr scripts/build-place-pages.ts --outDir dist-ssr
//   node dist-ssr/build-place-pages.js
//   npx http-server dist -p 8127 -s &
//   node scripts/check-phone-width.mjs 8127
//
// ⚠️ 이 검사는 **진짜로 실패할 수 있다는 것을 확인하고** 채택했다.
//    고치기 전에 돌렸더니 일본어 두 장을 ❌ 로 잡았다. 안 잡히는 검사는 검사가 아니다.
// playwright 는 이 저장소의 의존성이 아니다 (배포에 안 쓰니까 받아 둘 이유가 없다).
// 없을 때 `ERR_MODULE_NOT_FOUND` 만 뱉으면 무엇을 해야 할지 알 수 없으니 일러 준다.
let chromium;
// 이미 어딘가에 깔려 있으면 PLAYWRIGHT_MODULE 로 그 자리를 알려 줄 수 있다
// (ESM 은 NODE_PATH 를 안 본다 — 그래서 환경변수를 따로 받는다).
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
  console.error("❌ playwright 가 없다. 이 검사만 쓰려면 한 번 받아 두면 된다:\n   npx --yes playwright install --with-deps chromium");
  process.exit(2);
}

const PORT = process.argv[2] ?? "8127";
const BASE = `http://127.0.0.1:${PORT}`;

// 언어마다 **글자 성질이 다르다.** 표본은 그 성질을 하나씩 대표하게 골랐다:
//   ko  띄어쓰기 있는 한글      ja/zh  띄어쓰기 없는 글자
//   th  띄어쓰기 없는 태국어    de/ru  낱말이 긴 언어
const TARGETS = [
  ["ko 짐보관", "/ko/seoul/luggage/"],
  ["ja 짐보관", "/ja/seoul/luggage/"],
  ["zh 짐보관", "/zh/seoul/luggage/"],
  ["de 짐보관", "/de/seoul/luggage/"],
  ["ja 곳", "/ja/place/gwangjang-market/"],
  ["zh 곳", "/zh/place/gwangjang-market/"],
  ["th 곳", "/th/place/gwangjang-market/"],
  ["ru 곳", "/ru/place/gwangjang-market/"],
  ["ja 묶음", "/ja/seoul/jongno-gu/"],
  ["zh-TW 묶음", "/zh-TW/seoul/traditional-markets/"],
  ["de 묶음", "/de/seoul/jongno-gu/"],
];

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 390, height: 850 } });
const page = await ctx.newPage();

let bad = 0;
for (const [lab, path] of TARGETS) {
  const res = await page.goto(`${BASE}${path}`, { waitUntil: "domcontentloaded" });
  if (!res || res.status() !== 200) {
    bad++;
    console.log(`❌ ${lab.padEnd(12)} 페이지가 없다 (${res?.status() ?? "응답 없음"}) — ${path}`);
    continue;
  }
  const r = await page.evaluate(() => {
    const W = window.innerWidth;
    const over = document.documentElement.scrollWidth - W;
    if (over <= 1) return { over, culprits: [] };
    // 넘친 것 중 **가장 안쪽** 요소를 집는다. 바깥 상자는 안쪽 때문에 넘친
    // 것뿐이라, 그걸 보고하면 진짜 자리를 못 찾는다.
    const culprits = [];
    for (const el of document.querySelectorAll("body *")) {
      const q = el.getBoundingClientRect();
      if (q.right > W + 1 && el.children.length === 0)
        culprits.push({
          tag: el.tagName.toLowerCase(),
          cls: el.className || "",
          right: Math.round(q.right),
          wb: getComputedStyle(el).wordBreak,
          text: (el.textContent || "").trim().slice(0, 44),
        });
    }
    return { over, culprits: culprits.slice(0, 3) };
  });

  if (r.over > 1) {
    bad++;
    console.log(`❌ ${lab.padEnd(12)} ${r.over}px 넘침`);
    for (const c of r.culprits)
      console.log(`      <${c.tag} class="${c.cls}"> right=${c.right} word-break=${c.wb}  「${c.text}」`);
  } else {
    console.log(`✅ ${lab.padEnd(12)} 안 넘침`);
  }
}

await b.close();
console.log(
  bad
    ? `\n❌ ${bad}장이 폰 폭에서 넘친다 — word-break 를 언어별로 갈랐는지 먼저 볼 것`
    : `\n✅ ${TARGETS.length}장 전부 폰 폭(390px)에 들어간다`,
);
process.exit(bad ? 1 : 0);
