// 📏 **화면을 덮는 카드가 위로 잘리지 않나** — 손으로 돌리는 검사. (2026-09-11)
//
// 왜 있나 (사장님: "위 화면 짤려"):
//   창을 `justify-content: center` 로 두면 **내용이 화면보다 길 때 위아래로 반씩**
//   밀려 나간다. 그런데 스크롤은 아래쪽만 따라가므로 **위쪽은 영영 못 본다** —
//   제목과 역 이름이 잘린 채로 열렸다. 폰에서만 드러나고, 내용이 짧을 때는 멀쩡하다.
//   짐 보관 카드가 둘이 되면서 터졌다.
//
// ⚠️ 이 검사는 **실제로 실패하는 것을 확인하고** 채택했다 —
//    예전 상태(center)를 일부러 입히면 제목이 119px 잘린다고 잡아낸다.
//
//   npx http-server dist -p 8127 -s &
//
// 🐞 2026-09-12: 여기만 **주소가 박혀 있어서** 다른 포트로 띄우면 연결 거부로 죽었다.
//    옆 검사들(check-phone-width·check-btn-clip·check-distance-view)은 전부
//    `node scripts/… <포트>` 로 받는데 이것만 달랐다 — **잣대가 둘이면 반쪽만 돈다.**
//    검사를 한 줄로 죽 돌릴 때 이것만 조용히 빠져 있었다.
//   PLAYWRIGHT_MODULE=... node scripts/check-card-top.mjs

const m = await import(process.env.PLAYWRIGHT_MODULE);
const chromium = m.chromium ?? m.default?.chromium;
const D = process.env.SHOT_DIR ?? "/tmp";
const PORT = process.argv[2] ?? "8127";
const BASE = `http://127.0.0.1:${PORT}`;

const b = await chromium.launch();
let bad = 0;
for (const h of [640, 720, 850]) {
  const ctx = await b.newContext({ viewport: { width: 390, height: h } });
  const p = await ctx.newPage();
  await p.goto(BASE, { waitUntil: "networkidle" });
  await p.locator("select").first().selectOption("ko").catch(()=>{});
  await p.waitForTimeout(700);
  await p.locator(".home-tab").nth(1).click();
  await p.waitForTimeout(900);
  await p.locator(".hex-tile.has-data").first().click();
  await p.waitForTimeout(1200);
  await p.locator(".map-btn--luggage:visible").first().click();
  await p.waitForTimeout(700);
  const r = await p.evaluate(() => {
    const back = document.querySelector(".luggage-back");
    const title = document.querySelector(".lg-title");
    const t = title.getBoundingClientRect();
    return { scrollTop: back.scrollTop, titleTop: Math.round(t.top), scrollH: back.scrollHeight, clientH: back.clientHeight };
  });
  const ok = r.titleTop >= 0;
  if (!ok) { bad++; console.log(`❌ 높이 ${h}px — 제목이 화면 위로 ${-r.titleTop}px 잘려 있다`); }
  else console.log(`✅ 높이 ${h}px — 제목이 보인다 (위에서 ${r.titleTop}px). 내용 ${r.scrollH}px / 화면 ${r.clientH}px`);
  if (h === 720) await p.screenshot({ path: `${D}/card-top-720.png` });
  await ctx.close();
}
await b.close();
console.log(bad ? `\n❌ ${bad}개 크기에서 잘린다` : "\n✅ 세 크기 다 제목부터 보인다");
process.exit(bad ? 1 : 0);
