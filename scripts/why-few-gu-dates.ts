// 🔎 **왜 3곳뿐인가** — 짐작하지 않고 센다.
//
// 사장님 (2026-09-12): "겨우 세개야"
//
// 맞는 지적이다. 우리 축제 80곳인데 확정 날짜가 3곳이면 적다.
// 그런데 **원인이 무엇인지에 따라 할 일이 완전히 달라진다:**
//
//   ① 구청이 아직 안 올렸다        → 기다리면 된다. 매일 도니까 저절로 찬다
//   ② 이름이 달라서 못 맞췄다       → name-aliases.json 에 적으면 오늘 붙는다
//   ③ 우리 목록에 그 축제가 없다    → 사람이 들여야 한다
//
// **셋을 안 가르면 엉뚱한 데 힘을 쓴다.** 그래서 달별로 갈라서 센다.
//
//   npx vite build --ssr scripts/why-few-gu-dates.ts --outDir dist-ssr && node dist-ssr/why-few-gu-dates.js
import { ALL_FESTIVALS } from "../src/data/seed";
import { guFestivalDate } from "../src/lib/guFestival";

const NOW = new Date();
const THIS_MONTH = NOW.getMonth() + 1;

const fests = ALL_FESTIVALS.filter((f) => f.gu);
const withDate = fests.filter((f) => guFestivalDate(f.id));

console.log(`🎪 우리 축제 ${fests.length}곳 · 확정 날짜가 온 것 ${withDate.length}곳\n`);

// ── 달별로 가른다 ────────────────────────────────────────────────
// 구청은 **곧 열리는 것부터** 올린다. 12월 축제를 9월에 올리지 않는다.
// 그러니 「지금 달·다음 달」 축제가 몇 곳인지가 진짜 잣대다.
const soon: typeof fests = [];
const later: typeof fests = [];
const unknown: typeof fests = [];
for (const f of fests) {
  if (f.startMonth == null) {
    unknown.push(f);
    continue;
  }
  // 이번 달과 다음 달 — 구청이 올렸을 법한 때
  const gap = (f.startMonth - THIS_MONTH + 12) % 12;
  (gap <= 1 ? soon : later).push(f);
}

const hit = (f: { id: string }) => !!guFestivalDate(f.id);

console.log(`📅 지금 ${THIS_MONTH}월 기준`);
console.log(
  `   이번·다음 달 축제      ${String(soon.length).padStart(3)}곳 → 확정 ${soon.filter(hit).length}곳`,
);
console.log(
  `   그 뒤에 열리는 축제    ${String(later.length).padStart(3)}곳 → 확정 ${later.filter(hit).length}곳` +
    `   (구청이 아직 올릴 때가 아니다)`,
);
console.log(`   달을 모르는 축제       ${String(unknown.length).padStart(3)}곳`);

console.log(`\n🔎 이번·다음 달인데 **확정 날짜가 없는** 축제 — 여기가 진짜 손볼 자리다:`);
for (const f of soon.filter((f) => !hit(f)))
  console.log(`   ${f.gu.padEnd(5)} ${String(f.startMonth).padStart(2)}월  ${f.name}`);

console.log(
  `\n📌 이 목록이 곧 할 일이다. 하나씩 문화포털에서 찾아보고 —\n` +
    `   · 있는데 이름이 다르면 → src/data/name-aliases.json 에 적는다 (오늘 붙는다)\n` +
    `   · 없으면              → 구청이 아직 안 올린 것이다. 기다린다\n` +
    `   · 아예 안 열리면       → 우리 목록에서 빼야 한다 (축제 신선도 검사가 짚어 준다)`,
);
