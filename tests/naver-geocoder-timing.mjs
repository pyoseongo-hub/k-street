// 🧪 「내 위치」 한 박자 사고를 그대로 재현해서, 고친 코드가 견디는지 본다.
//
// 네이버가 하는 그대로 흉내 낸다 — maps.js 본체가 먼저 붙고(그때 Service 는 없다),
// 서브모듈은 조금 뒤에 붙으면서 onJSContentLoaded 를 부른다.
// 예전 코드는 본체가 붙은 순간 "다 됐다"고 답해서 Service 가 undefined 였다.
//
// ── 왜 이 파일을 남겨 두나 (2026-09-05) ─────────────────────────────────────
// 이 사고는 **폰에서만 났고 여기서는 안 났다.** 작업 환경은 네이버 서버가 막혀
// 있어 진짜 SDK 로는 이 버그를 영영 못 본다. 그래서 네이버 대신 **가짜 응답을
// 끼워 넣어** 같은 상황을 만든다.
//
// 고치기 전 코드로 돌려 보면 세 줄 다 ❌ (no-geocoder) 가 뜬다 — 사장님 폰에 뜬
// 바로 그 글자다. 고친 뒤에는 세 줄 다 ✅ 「서울 밖에 계세요」가 된다(의정부 좌표).
// 즉 **이 시험이 그 사고를 실제로 잡는다.** 로더를 건드릴 때 다시 돌려 볼 것.
//
//   1) npm run build
//   2) npx vite preview --port 4337   (다른 칸을 쓰면 아래 주소도 같이 고친다)
//   3) node tests/naver-geocoder-timing.mjs
//
// ⚠️ 이 앱은 좌표를 서울 25개 구로만 옮긴다. 그래서 '서울 밖'이 정답인 의정부
//    좌표를 쓴다 — 서울 좌표로 시험하면 구 이름 목록까지 흉내 내야 해서
//    시험이 지저분해진다.
import pw from "/opt/node22/lib/node_modules/playwright/index.js";
const { chromium } = pw;
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });

// 서브모듈이 늦게 오는 정도를 바꿔 가며 본다. 0ms 는 예전에도 되던 경우다.
for (const delay of [0, 600, 2500]) {
  const ctx = await b.newContext({
    viewport: { width: 390, height: 844 },
    // 의정부 시청 — 서울 밖이다. 「서울 밖에 계세요」가 떠야 맞다.
    geolocation: { latitude: 37.7381, longitude: 127.0337 },
    permissions: ["geolocation"],
  });
  await ctx.route("**/oapi.map.naver.com/**", (route) =>
    route.fulfill({
      contentType: "application/javascript",
      body: `
        // ① 본체 — 이 시점에 Service 는 아직 없다(네이버와 같다).
        window.naver = { maps: {
          LatLng: function (a, c) { this.lat = a; this.lng = c; },
        } };
        // ② 서브모듈 — ${delay}ms 뒤에 붙으면서 손잡이를 부른다.
        setTimeout(function () {
          window.naver.maps.Service = {
            Status: { OK: "OK" },
            reverseGeocode: function (o, cb) {
              cb("OK", { v2: { results: [ { region: {
                area1: { name: "경기도" }, area2: { name: "의정부시" }
              } } ] } });
            },
          };
          if (window.naver.maps.onJSContentLoaded) window.naver.maps.onJSContentLoaded();
        }, ${delay});
      `,
    })
  );
  const p = await ctx.newPage();
  const errs = []; p.on("pageerror", (e) => errs.push(String(e)));
  await p.goto("http://localhost:4337/", { waitUntil: "networkidle" });
  for (const bt of await p.$$(".home-tab")) {
    if ((await bt.innerText()).includes("Neighbo")) { await bt.click(); break; }
  }
  await p.waitForTimeout(500);
  await p.locator(".myloc-btn").click();
  await p.waitForTimeout(Math.max(1500, delay + 1200));
  const said = (await p.locator(".myloc").innerText()).trim();
  const ok = said.includes("outside") || said.includes("Seoul");
  console.log(`서브모듈 ${String(delay).padStart(4)}ms 늦음 → ${ok ? "✅" : "❌"} "${said}"`);
  if (errs.length) console.log("   에러:", errs);
  await ctx.close();
}
await b.close();
