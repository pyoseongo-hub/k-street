// 🔙 **뒤로가기 한 번에 화면 한 장만 닫히나** — 진짜 브라우저로 눌러 본다.
//
// 사장님 지시 (2026-09-25): *"짐보관에서 뒤로가기하면 꺼짐 뒤로가기 활성화 시켜"*.
//
// 무엇이 문제였나 — 짐보관 카드는 혼자 뜨지 않는다. **비 오는 날 화면 → 곳 카드 →
// 짐보관** 처럼 전체화면 위에 겹쳐 뜬다. 그런데 popstate 는 window 에 붙는 전역
// 사건이라, 화면마다 처리기를 달아 놓으면 뒤로가기 **한 번에 전부가 반응**했다 —
// 짐보관만 닫으려던 한 번이 그 밑 화면까지 닫고, 안 먹힌 기록 칸이 남아
// 그다음 한 번이 **앱을 껐다**. (lib/useOverlay.ts 머리말 ④)
//
// 🚨 **이건 tsc 도 눈으로 보는 것도 못 잡는다.** 화면은 멀쩡히 그려지고,
//    PC 에서는 ✕ 단추로 닫으니 티가 안 난다. 폰 뒤로가기로만 드러난다.
//    그래서 기계가 눌러 봐야 한다.
//
// 무엇을 보나:
//   ① 비 오는 날 화면을 열고 짐보관을 겹쳐 띄운다
//   ② 뒤로가기 → **짐보관만** 닫히고 비 오는 날은 남아 있나
//   ③ 뒤로가기 → 비 오는 날이 닫히고 **앱은 그대로**인가 (주소가 앱 안인가)
//   ④ 여기서 한 번 더 → 그제서야 앱 밖으로 나가나 (헛발이 없나)
//
// 돌리는 법:
//   npm run build && (cd dist && python3 -m http.server 8129 &)
//   node scripts/check-back-view.mjs 8129
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

const PORT = process.argv[2] ?? "8129";
const BASE = `http://127.0.0.1:${PORT}`;
const fails = [];
const ok = (m) => console.log(`✅ ${m}`);
const bad = (m) => {
  fails.push(m);
  console.log(`❌ ${m}`);
};

const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_EXECUTABLE });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

// 🌤️ **날씨를 꾸며 준다.** 「비 오는 날」로 들어가는 문은 날씨 칸 하나뿐인데,
//    날씨를 못 받으면 그 칸이 아예 안 그려진다(WeatherCard: `if (error || !weather) return null`).
//    검사 상자는 바깥 인터넷이 막혀 있어 늘 못 받는다 — 그러면 검사가 **버그가 아니라
//    인터넷 때문에** 실패한다. 값 자체는 이 검사와 상관없으니 아무 값이나 돌려준다.
await page.route("**/api.open-meteo.com/**", (route) =>
  route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({
      current: { temperature_2m: 21, apparent_temperature: 21, precipitation: 1, weather_code: 61, time: "2026-09-25T10:00" },
      daily: { precipitation_probability_max: [80] },
    }),
  }),
);

// 앱에 들어오기 **전** 페이지를 하나 둔다. 뒤로가기가 앱을 꺼뜨리는지 보려면
// 「나간 자리」가 있어야 한다. about:blank 로는 나갔는지 알 수 없다.
await page.goto(`${BASE}/?ksback=outside`, { waitUntil: "load" });
await page.goto(BASE, { waitUntil: "load" });
await page.waitForTimeout(600);

const inApp = () => page.evaluate(() => location.search);

// ── ① 비 오는 날 화면을 연다 ────────────────────────────────────────────────
// 「비 오는 날」은 **날씨 카드를 눌러야** 열린다(App.tsx: WeatherCard onOpen).
const opener = page.locator("button.weather-card").first();
if (!(await opener.count())) {
  bad("날씨 카드를 못 찾았다 — 화면 구조가 바뀌었으면 이 검사도 고쳐야 한다");
} else {
  await opener.click();
  await page.waitForTimeout(500);
}
const rainyOpen = () => page.locator(".rainy-panel").count();
if (await rainyOpen()) ok("① 비 오는 날 화면이 떴다");
else bad("① 비 오는 날 화면이 안 떴다");

// 곳 카드를 펴고 짐보관을 누른다
const row = page.locator(".rainy-panel .rp-head").first();
if (await row.count()) {
  // ⚠️ `force` 로 누른다. 이 화면은 머리줄이 **붙박이(sticky)** 라 줄 위에 겹치는데,
  //    playwright 는 「무언가 가리고 있다」며 끝까지 안 누르고 시간만 보낸다.
  //    우리가 보려는 것은 뒤로가기지 겹침이 아니다.
  await row.scrollIntoViewIfNeeded();
  await row.click({ force: true });
  await page.waitForTimeout(400);
}
const lug = page.locator(".rainy-panel .map-btn--luggage").first();
if (!(await lug.count())) {
  bad("짐보관 단추를 못 찾았다 (서울 곳이 안 나왔거나 화면이 바뀌었다)");
} else {
  await lug.scrollIntoViewIfNeeded();
  await lug.click({ force: true });
  await page.waitForTimeout(400);
}
const lugOpen = () => page.locator(".luggage-back").count();
if (await lugOpen()) ok("① 짐보관이 그 위에 겹쳐 떴다");
else bad("① 짐보관이 안 떴다");

// ── ② 뒤로가기 한 번 — 짐보관만 닫혀야 한다 ────────────────────────────────
await page.goBack();
await page.waitForTimeout(400);
if (!(await lugOpen())) ok("② 뒤로가기 한 번에 짐보관이 닫혔다");
else bad("② 뒤로가기를 눌렀는데 짐보관이 그대로다");
if (await rainyOpen()) ok("② 그 밑 비 오는 날 화면은 **남아 있다**");
else bad("② 짐보관만 닫혀야 하는데 그 밑 화면까지 같이 닫혔다 (이게 그 버그다)");

// ── ③ 한 번 더 — 비 오는 날이 닫히고 앱은 살아 있어야 한다 ────────────────
await page.goBack();
await page.waitForTimeout(400);
if (!(await rainyOpen())) ok("③ 뒤로가기 한 번에 비 오는 날이 닫혔다");
else bad("③ 비 오는 날이 안 닫혔다 — 기록 칸이 남아 헛발이 됐다");
if ((await inApp()) === "") ok("③ 앱은 그대로다 (아직 안 나갔다)");
else bad(`③ 앱 밖으로 나가 버렸다 — 주소가 ${await inApp()}`);

// ── ④ 한 번 더 — 그제서야 앱 밖으로 ───────────────────────────────────────
await page.goBack();
await page.waitForTimeout(400);
if ((await inApp()).includes("ksback=outside")) ok("④ 한 번 더 누르니 앱 밖으로 나갔다 (헛발 없음)");
else bad(`④ 헛발이 남아 있다 — 한 번 더 눌러도 앱 안이다 (${await inApp()})`);

await browser.close();
console.log(fails.length ? `\n❌ ${fails.length}개 실패` : "\n✅ 뒤로가기 전부 통과");
process.exit(fails.length ? 1 : 0);
