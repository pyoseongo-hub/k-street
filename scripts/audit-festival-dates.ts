// 📅 **축제에 「며칟날」이 붙어 있나**를 센다 — 일자 빈칸 검사.
//
// 왜 (2026-10-09, 사장님: *"네이버만 찾아도 나오는데 / 관리하는거 맞아?"*) —
// 맞는 지적이었다. 사장님이 네이버 축제정보 카드 하나를 보여 줬는데,
// **노원 북 페스티벌**은 우리 자료에 곳도 사진도 이미 있는데 **날짜만 비어** 있었다.
// 네이버에는 「2026.10.17.(토)~10.18.(일)」이 그냥 적혀 있었다.
//
// 🚨 **왜 비어 있었나 — 우리 창구 셋이 전부 「주최 측이 올려 줄 때까지」 기다린다.**
//   · 관광공사(searchFestival2) — 2026 회차를 아직 안 올렸다 (2025 날짜만 있다)
//   · 서울시 문화포털          — 구청이 올려야 뜬다
//   · 펀서울                   — 서울시가 모아 두는 자리라 한 다리 건너다
//   그런데 **구청 보도자료에는 2주 전에 이미 나와 있었다.** 즉 자료가 없던 게
//   아니라 **우리가 보는 자리에 없었다.**
//
// 🧮 그래서 이 검사가 하는 일 — **「모른다」를 숫자로 만든다.**
//   루틴이 셋이나 도는데도 빈 칸이 생기는 것을 아무도 안 세고 있었다.
//   audit-festival-freshness 는 「이 축제가 올해도 열리나」를 보고,
//   audit-festivals 는 「좌표·사진」을 본다. **「며칟날인가」를 보는 것이 없었다.**
//
// 🔔 빨간불은 **곧 열리는데 날짜를 모르는 것**에만 켠다.
//   관광공사가 반년 뒤 축제를 안 올려 둔 것은 정상이다 — 매주 빨간불이면 아무도 안 본다.
//   D-14 안에 드는 달(이번 달·다음 달)의 축제가 **열흘 안에 시작할 수도 있는데**
//   날짜를 모르면, 그건 손님이 지금 헛걸음할 수 있다는 뜻이라 울린다.
//
//   npm run festival-dates
import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { ALL_FESTIVALS } from "../src/data/seed";
import { guFestivalDate } from "../src/lib/guFestival";

const OUT = join(process.cwd(), "docs", "축제-일자-빈칸.md");

const 오늘 = new Date();
const 이번달 = 오늘.getMonth() + 1;
const 다음달 = (이번달 % 12) + 1;

/** 그 축제가 이번 달·다음 달에 걸치나 — 손님이 지금 고르는 범위다. */
function 지금범위(p: { startMonth?: number | null; endMonth?: number | null }): boolean {
  const s = p.startMonth ?? 0;
  if (!s) return false;
  const e = p.endMonth ?? s;
  // 12→1 처럼 해를 넘는 축제가 있다. 달을 펼쳐서 본다.
  const 달들: number[] = [];
  for (let i = 0, m = s; i < 12; i++, m = (m % 12) + 1) {
    달들.push(m);
    if (m === e) break;
  }
  return 달들.includes(이번달) || 달들.includes(다음달);
}

const 서울축제 = ALL_FESTIVALS.filter((p) => (p.city ?? "seoul") === "seoul");
const 범위안 = 서울축제.filter(지금범위);
const 있음 = 범위안.filter((p) => guFestivalDate(p.id));
const 없음 = 범위안.filter((p) => !guFestivalDate(p.id));

// 🚦 이번 달에 걸치는데 날짜를 모르는 것 — 열흘 안에 시작할 수 있다
const 급한것 = 없음.filter((p) => 지금범위({ startMonth: p.startMonth, endMonth: p.endMonth }) && (p.startMonth === 이번달 || (p.endMonth ?? p.startMonth) === 이번달));

console.log(`🎪 서울 축제 ${서울축제.length}곳 — 이번 달(${이번달})·다음 달(${다음달})에 걸치는 것 ${범위안.length}곳`);
console.log(`   📅 확정 일자 있음 ${있음.length}곳 · ❓ 없음 ${없음.length}곳`);
if (없음.length) {
  console.log(`\n❓ 며칟날인지 모르는 축제 (${없음.length}곳)`);
  for (const p of 없음) console.log(`   ${p.id.padEnd(14)} ${p.gu.padEnd(5)} ${p.name}`);
}

mkdirSync(dirname(OUT), { recursive: true });
const ymd = `${오늘.getFullYear()}-${String(이번달).padStart(2, "0")}-${String(오늘.getDate()).padStart(2, "0")}`;
writeFileSync(
  OUT,
  [
    "# 📅 며칟날인지 모르는 축제",
    "",
    `**${ymd} 기준 · 기계가 적는다** (scripts/audit-festival-dates.ts — 손으로 고치지 말 것).`,
    "",
    `서울 축제 ${서울축제.length}곳 중 이번 달(${이번달})·다음 달(${다음달})에 걸치는 것은 **${범위안.length}곳**이고,`,
    `그중 **${있음.length}곳**에 확정 일자가 붙어 있다. 남은 **${없음.length}곳**은 「몇 월」만 안다.`,
    "",
    "## 어디서 채우나",
    "",
    "① 주최 기관(구청·재단) 누리집·보도자료 → ② 서로 다른 매체 둘 이상 → ③ **요일이 올해 달력과 맞아야 한다.**",
    "확인한 것은 `src/data/festival-dates-manual.json` 에 적는다. 기계가 받아 오면 저절로 뒤로 물러난다.",
    "",
    "| id | 구 | 축제 | 아는 달 |",
    "|---|---|---|---|",
    ...없음.map((p) => `| \`${p.id}\` | ${p.gu} | ${p.name} | ${p.startMonth}${p.endMonth && p.endMonth !== p.startMonth ? `~${p.endMonth}` : ""}월 |`),
    "",
  ].join("\n"),
  "utf8",
);
console.log(`\n📝 ${OUT.replace(process.cwd() + "/", "")} 에 적었다`);

if (급한것.length) {
  console.log(`\n🚨 이번 달에 걸치는데 날짜를 모르는 축제가 ${급한것.length}곳이다 — 손님이 헛걸음할 수 있다`);
  process.exit(1);
}
