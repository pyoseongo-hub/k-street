// 💻 **PC 창에서 화면을 얼마나 쓰나** — 손으로 돌리는 검사. (2026-09-11)
//
// 왜 있나 (사장님이 모니터 사진을 보내 주셨다: "링크 여니까 컴퓨터에 이렇게 보이는데"):
//   PC용 배치를 「축제 | 동네」 2단으로 짜 뒀는데, 이 앱은 탭으로 **한 번에 하나만**
//   보여 준다. 그래서 어느 탭에 있든 **오른쪽 절반이 늘 비어 있었다.**
//   1920px 창에서는 화면의 40%가 빈 채였다 — 처음 들어온 사람에게는 덜 만든 앱으로 보인다.
//   폰으로만 보면 절대 안 드러나는 자리다.
//
// 무엇을 재나: 내용이 실제로 차지하는 폭과, 양옆에 남는 빈 자리.
//
//   node scripts/check-desktop-width.mjs      (SHOT_DIR 을 주면 사진도 찍는다)

const m = await import(process.env.PLAYWRIGHT_MODULE);
const chromium = m.chromium ?? m.default?.chromium;
const D = process.env.SHOT_DIR;
const b = await chromium.launch();
let bad = 0;
for (const [w, h] of [[1440, 900], [1920, 1080]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h } });
  const p = await ctx.newPage();
  await p.goto("http://127.0.0.1:8127/", { waitUntil: "domcontentloaded" });
  await waitSettled(p);
  await p.locator("select").first().selectOption("ko").catch(()=>{});
  await p.waitForTimeout(900);
  const r = await p.evaluate(() => {
    const main = document.querySelector(".app-main");
    const cs = getComputedStyle(main);
    // 🚨 **칸 수를 센다.** 예전 사고는 「쏠림」이 아니라 **빈 칸이 하나 더 있는 것**이었다 —
    //    2단 배치에서 한쪽 칸에는 보이는 패널이, 다른 칸에는 작은 글줄 하나만 있었다.
    //    폭이나 여백으로는 안 잡힌다. 칸이 둘이면 그 순간 사고다.
    const tracks = cs.gridTemplateColumns.split(/\s+/).filter(Boolean);
    const mb = main.getBoundingClientRect();
    const kids = [...main.children].filter((el) => el.getBoundingClientRect().width > 0);
    const used = Math.max(...kids.map((el) => el.getBoundingClientRect().width));
    return { win: innerWidth, shell: Math.round(mb.width), used: Math.round(used), tracks: tracks.length, cols: cs.gridTemplateColumns };
  });

  const ok = r.tracks === 1;
  console.log(`${ok ? "✅" : "❌"} 창 ${w}px — 껍데기 ${r.shell}px · 내용 ${r.used}px · **세로 칸 ${r.tracks}개** (${r.cols})`);
  if (!ok) { bad++; console.log("      칸이 둘이면 한쪽이 빈다 — PC 배치는 가운데 한 줄이어야 한다"); }
  if (D) await p.screenshot({ path: `${D}/desk-${w}.png` });
  await ctx.close();
}
await b.close();
console.log(bad ? `\n❌ ${bad}개 창 크기에서 칸이 둘이다 — 2단 배치가 되살아났다` : "\n✅ 두 창 크기 다 가운데 한 줄이다");
process.exit(bad ? 1 : 0);

// ⏳ **화면이 자리를 잡을 때까지 기다린다 — `networkidle` 은 안 쓴다.** (2026-10-03)
//
// 🐞 주말 점검을 러너에 걸었더니 이 검사들이 **30초 시간 초과**로 줄줄이 떨어졌다:
//      page.goto: Timeout 30000ms exceeded — waiting until "networkidle"
//    앱이 고장난 게 아니다. 이 앱은 **서비스 워커**가 새 판을 지켜보고(swUpdate.ts)
//    **날씨**를 계속 다시 물어본다. 그래서 네트워크가 **영영 조용해지지 않는다.**
//    내 컴퓨터에서는 어쩌다 조용해져서 됐을 뿐이라, 「되는 날과 안 되는 날」이 갈렸다.
//
// ✅ 그래서 **글자와 글꼴이 다 왔는지**로 바꿔 기다린다 — 폭을 재는 데 필요한 건 그것뿐이다.
//    (네트워크가 한가한지는 폭과 아무 상관이 없다.)
async function waitSettled(pg) {
  await pg.waitForLoadState("load").catch(() => {});
  // 글꼴이 늦게 오면 글자 폭이 달라진다 — 폭을 재는 검사라 이걸 꼭 기다린다.
  await pg.evaluate(() => document.fonts?.ready).catch(() => {});
  await pg.waitForTimeout(1200);
}
