// 🧭 **「내 주변 코스」가 진짜로 그려지나** — 진짜 브라우저로, 위치를 꾸며서 본다.
//
// 자료 검사(check-nearby-course.ts)는 **계산**이 맞는지만 본다. 화면은 다른 문제다 —
// 위치 권한, 접힌 단추, 12개 언어 글자 길이는 브라우저에서만 드러난다.
//
// 무엇을 보나:
//   ① 동네 탭에 접힌 단추가 있나
//   ② **펴도 위치를 안 묻나** — 앱을 켜자마자 권한 창이 뜨면 대부분 거절한다.
//      「코스 만들기」를 눌러야 묻는 것이 이 화면의 약속이다(NearbyCourse.tsx 머리말).
//   ③ 만들기를 누르면 곳과 **거리**가 나오나
//   ④ 🚨 **시간을 뜻하는 글자가 한 자도 없나** — 이 앱에서 가장 중요한 검사다.
//      사장님이 2026-09-11에 못박았다: "그시간을 잴수없어 거기에 머무르는 시간은
//      개개인이 틀리니". 나중에 누군가 「약 40분」을 친절하게 넣어도 tsc 는 통과한다.
//      **기계가 지켜야 안 돌아온다.**
//   ⑤ 12개 언어에서 고르는 단추 글씨가 안 잘리나
//
// 돌리는 법:
//   npm run build && (cd dist && python3 -m http.server 8127 &)
//   node scripts/check-nearby-view.mjs 8127
//   (작업 환경처럼 브라우저를 새로 못 받는 곳에서는 PLAYWRIGHT_EXECUTABLE 로 가리킨다 —
//    check-distance-view.mjs 의 같은 주석 참고.)
let chromium;
for (const src of [process.env.PLAYWRIGHT_MODULE, "playwright"]) {
  if (!src) continue;
  try {
    ({ chromium } = await import(src));
    break;
  } catch {
    /* 다음 것을 본다 */
  }
}
if (!chromium) {
  console.error("❌ playwright 가 없다:\n   npx --yes playwright install --with-deps chromium");
  process.exit(2);
}

const PORT = process.argv[2] ?? "8127";
const BASE = `http://127.0.0.1:${PORT}`;
const LANGS = ["ko", "en", "ja", "zh", "zh-TW", "vi", "es", "fr", "de", "ru", "id", "th"];
/** 안국역 언저리 — 종로에 곳이 가장 많다. 여기 서 있다고 꾸민다. */
const HERE = { latitude: 37.5760, longitude: 126.9856 };

/**
 * 🚨 **시간을 뜻하는 말.** 하나라도 화면에 있으면 실패다.
 *
 * 사장님이 2026-09-11에 못박은 것 — "그시간을 잴수없어 거기에 머무르는 시간은
 * 개개인이 틀리니". 나중에 누가 친절하게 「약 40분」을 넣어도 tsc 는 통과한다.
 *
 * ⚠️ **둘로 가른다.** 안 그러면 애먼 것을 잡는다 —
 *    · `UNITS` 는 **숫자가 앞에 붙었을 때만** 잡는다. 「분」 하나만 보고 잡으면
 *      「분식」·「분당」 같은 **곳 이름**이 걸린다. 「40분」만 잡아야 한다.
 *      (「min」도 같다 — 영어 이름 안에 얼마든지 들어간다.)
 *    · `WORDS` 는 그 자체로 시간을 뜻하는 말이라 그냥 잡는다(「반나절」).
 *
 * ⚠️ 12개 언어를 다 적지는 못한다 — 다 적을 수 있다고 믿는 것이 더 위험하다.
 *    여기 있는 것은 **사장님 설계안에 실제로 있던 말들**과 그 번역이다
 *    (「1시간·2시간·반나절·하루」·「예상 소요시간 2시간 10분」).
 *    새 문구를 넣을 때 이 목록도 같이 늘린다.
 */
const UNITS = [
  "분", "시간", "時間", "小时", "小時", "分鐘", "分钟",
  "min", "minute", "hour", "hr",
  "giờ", "phút", "hora", "minuto", "heure", "Stunde", "Minute",
  "час", "минут", "jam", "menit", "ชั่วโมง", "นาที",
];
const WORDS = ["반나절", "소요시간", "半日", "半天", "half-day", "half day", "nửa ngày"];

/** 화면 글에서 시간을 뜻하는 대목을 찾는다. 없으면 빈 배열. */
function timeHits(text) {
  const out = [];
  for (const w of WORDS) if (text.toLowerCase().includes(w.toLowerCase())) out.push(w);
  for (const u of UNITS) {
    // **숫자 바로 뒤에 붙은 것만** — 곳 이름 속의 같은 글자는 건드리지 않는다
    const re = new RegExp(`\\d\\s*${u.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "i");
    if (re.test(text)) out.push(u);
  }
  return out;
}

const b = await chromium.launch(
  process.env.PLAYWRIGHT_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE } : {},
);
let bad = 0;
const fail = (m) => { bad++; console.log(`❌ ${m}`); };

async function newPage(lang) {
  const ctx = await b.newContext({
    locale: lang,
    permissions: ["geolocation"],
    geolocation: HERE,
    viewport: { width: 390, height: 844 },
  });
  const page = await ctx.newPage();
  // 📍 **위치를 몇 번 물었는지 센다.** ②번 검사의 전부다.
  await page.addInitScript(() => {
    window.__geoAsks = 0;
    const real = navigator.geolocation.getCurrentPosition.bind(navigator.geolocation);
    navigator.geolocation.getCurrentPosition = (...a) => { window.__geoAsks++; return real(...a); };
  });
  await page.goto(`${BASE}/?lang=${lang}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  // 동네 탭은 두 번째 .home-tab 이다(계절 · 동네).
  await page.locator(".home-tab").nth(1).click();
  await page.waitForTimeout(300);
  return { ctx, page };
}

// ── ①②③④ 영어 화면에서 ──────────────────────────────────────────────
{
  const { ctx, page } = await newPage("en");
  const open = page.locator(".nc-open");
  if (await open.count()) console.log("✅ ① 동네 탭에 「내 주변 코스」 단추가 있다");
  else fail("① 접힌 단추(.nc-open)가 없다");

  await open.click();
  await page.waitForTimeout(400);
  const asksAfterOpen = await page.evaluate(() => window.__geoAsks);
  if (asksAfterOpen === 0) console.log("✅ ② 펴기만 해서는 위치를 안 묻는다");
  else fail(`② 펴자마자 위치를 물었다 (${asksAfterOpen}번) — 앱을 켜자마자 묻는 것과 같아진다`);

  await page.locator(".nc-make").click();
  await page.waitForTimeout(2500);
  const stops = await page.locator(".nc-stop").count();
  const legs = await page.locator(".nc-leg-m").count();
  const total = (await page.locator(".nc-total").textContent()) ?? "";
  if (stops >= 2 && legs === stops) console.log(`✅ ③ 코스가 나온다 — ${stops}곳 · ${total.trim()}`);
  else fail(`③ 코스가 안 나온다 (곳 ${stops} · 거리딱지 ${legs})`);

  const asksAfterMake = await page.evaluate(() => window.__geoAsks);
  if (asksAfterMake > 0) console.log("✅ ② 만들기를 눌렀을 때 비로소 묻는다");
  else fail("② 만들기를 눌렀는데도 위치를 안 물었다 — 캐시가 아니라면 기능이 죽은 것이다");

  const hit = timeHits(await page.locator(".nearby-course").innerText());
  if (!hit.length) console.log("✅ ④ 시간을 뜻하는 글자가 한 자도 없다 (영어)");
  else fail(`④ 🚨 시간이 화면에 있다: ${hit.join(" · ")} — docs/코스-추천.md 를 읽을 것`);
  await ctx.close();
}

// ── ④⑤ 12개 언어 — 글씨 잘림 · 시간 표기 ────────────────────────────
//    ④ 를 여기서 **한 번 더** 돈다. 번역은 12벌이라, 영어만 보면 한 언어에만
//    「약 40분」이 들어가 있어도 못 잡는다 — 이 저장소가 번역에서 여러 번 데인 자리다.
{
  let clipped = 0;
  let timed = 0;
  for (const lang of LANGS) {
    const { ctx, page } = await newPage(lang);
    await page.locator(".nc-open").click();
    await page.waitForTimeout(300);
    const over = await page.evaluate(() =>
      [...document.querySelectorAll(".nc-open, .nc-opt, .nc-make")]
        .filter((el) => el.scrollWidth > el.clientWidth + 1)
        .map((el) => el.textContent.trim()),
    );
    if (over.length) {
      clipped++;
      fail(`⑤ ${lang} — 글씨가 잘린다: ${over.join(" / ")}`);
    }
    await page.locator(".nc-make").click();
    await page.waitForTimeout(2000);
    const hit = timeHits(await page.locator(".nearby-course").innerText());
    if (hit.length) {
      timed++;
      fail(`④ 🚨 ${lang} — 시간이 화면에 있다: ${hit.join(" · ")}`);
    }
    await ctx.close();
  }
  if (!clipped) console.log("✅ ⑤ 12개 언어 전부, 고르는 단추 글씨가 안 잘린다");
  if (!timed) console.log("✅ ④ 12개 언어 전부, 시간을 뜻하는 글자가 없다");
}

await b.close();
console.log(bad ? `\n❌ ${bad}건` : "\n✅ 내 주변 코스 이상 없다");
process.exit(bad ? 1 : 0);
