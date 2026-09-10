// 🎪 **축제가 아직 유효한가**를 잰다 — 「신선도」 검사.
//
// 왜 (2026-09-10, 사장님: "축제는 내가 계속 업데이트 하라고 했는데 루틴화시켜") —
// 축제는 이 앱에서 **혼자 상하는 자료**다. 시장·산책로는 10년 뒤에도 그 자리에
// 있지만, 축제는 해마다 날짜가 바뀌고 아예 없어지기도 한다.
//
// 🚨 **루틴이 이미 있었는데도 1년치가 썩어 있었다.** 그게 이 검사를 만든 이유다:
//   · fetch-festival-dates 는 매일 돈다 — 그런데 **날짜만** 갱신한다
//   · audit-festivals 는 **좌표·사진** 빈 칸만 센다
//   → 「이 축제가 아직 열리는가」를 보는 것이 **하나도 없었다.**
//   그 사이에 이름에 2025 가 박힌 축제 11곳이 그대로 살아, 「2026년 10월 축제」
//   페이지에 「2025 서울한옥위크」가 올라가 있었다. 다른 AI 평가가 짚어 줘서 알았다 —
//   **사람이 짚어 줘야 찾아지는 구조**였다는 뜻이라, 기계가 먼저 잡게 한다.
//
// 무엇을 세나 (전부 **아는 것과 모르는 것을 가르는** 잣대다):
//   ① 이름에 지난 연도가 박힌 축제      — 작년 회차가 그대로 남아 있다
//   ② 근거(monthSource)가 작년 이전인 축제 — 올해 열리는지 확인한 적이 없다
//   ③ confirmed 가 아닌 축제            — 달조차 확인 못 했다
//   ④ 축제가 한 곳도 없는 달            — 그 달 묶음 페이지가 아예 안 만들어진다
//
// 결과는 화면에 요약하고 docs/축제-신선도.md 에 표로 남긴다.
//
//   npm run festival-freshness
import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { ALL_FESTIVALS, type Place } from "../src/data/seed";
import { pastEditionYear } from "../src/lib/pastEdition";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const NOW = new Date();
const THIS_YEAR = NOW.getFullYear();
const MONTHS = ["", "1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];

/**
 * 근거 글에 적힌 **가장 최근 연도**. 「강남구 보도자료 (2025 9.25–10.3)」 → 2025.
 *
 * 🚨 가장 **큰** 연도를 쓴다. 「2024년 10월, 2025년 9월」처럼 여러 해가 적힌 근거가
 *    있는데, 첫 번째를 집으면 실제보다 낡았다고 잘못 말한다.
 */
function sourceYear(p: Place): number | undefined {
  const src = (p as { monthSource?: string }).monthSource;
  if (!src) return undefined;
  const years = [...src.matchAll(/\b(20[0-4]\d)\b/g)].map((m) => Number(m[1]));
  return years.length ? Math.max(...years) : undefined;
}

const F = ALL_FESTIVALS;

// ── ① 이름에 지난 연도 ──────────────────────────────────────────────────
const pastNamed = F.map((p) => ({ p, y: pastEditionYear(p.name, NOW) }))
  .filter((x) => x.y !== undefined)
  .sort((a, b) => (a.y ?? 0) - (b.y ?? 0));

// ── ② 근거가 낡음 ───────────────────────────────────────────────────────
//    이름엔 연도가 없지만, 우리가 근거로 적어 둔 것이 작년 이전인 축제.
//    「올해도 열린다」고 말할 근거가 우리에게 없다는 뜻이다.
const staleSource = F.map((p) => ({ p, y: sourceYear(p) }))
  .filter((x) => x.y !== undefined && x.y < THIS_YEAR && !pastEditionYear(x.p.name, NOW))
  .sort((a, b) => (a.y ?? 0) - (b.y ?? 0));

// ── ③ 확인 안 된 것 ─────────────────────────────────────────────────────
const unconfirmed = F.filter((p) => (p as { confirmed?: boolean }).confirmed !== true);

// ── ④ 빈 달 ─────────────────────────────────────────────────────────────
const byMonth = new Map<number, number>();
for (const p of F) {
  if (p.startMonth == null) continue;
  for (let m = p.startMonth; m <= (p.endMonth ?? p.startMonth); m++)
    byMonth.set(m, (byMonth.get(m) ?? 0) + 1);
}
const emptyMonths = [...Array(12).keys()].map((i) => i + 1).filter((m) => !byMonth.get(m));

// ── 화면 요약 ───────────────────────────────────────────────────────────
const line = (n: number) => String(n).padStart(4);
console.log(`🎪 축제 신선도 — ${THIS_YEAR}년 ${NOW.getMonth() + 1}월 ${NOW.getDate()}일 기준, 축제 ${F.length}곳\n`);
console.log(`${line(pastNamed.length)}곳  ① 이름에 지난 연도가 박혔다 (작년 회차가 그대로)`);
console.log(`${line(staleSource.length)}곳  ② 근거가 작년 이전이다 (올해 열리는지 확인한 적 없음)`);
console.log(`${line(unconfirmed.length)}곳  ③ 달조차 확인 못 했다 (confirmed 아님)`);
console.log(`${line(emptyMonths.length)}개  ④ 축제가 한 곳도 없는 달${emptyMonths.length ? ` — ${emptyMonths.map((m) => MONTHS[m]).join(" · ")}` : ""}`);
console.log("");

if (pastNamed.length) {
  console.log("① 이름에 지난 연도 — 여기부터 손봐야 한다");
  for (const { p, y } of pastNamed.slice(0, 15)) console.log(`     ${y}  ${p.name}`);
  if (pastNamed.length > 15) console.log(`     … 그 밖 ${pastNamed.length - 15}곳`);
  console.log("");
}
if (staleSource.length) {
  console.log("② 근거가 낡음 — 올해 것도 열리는지 확인이 필요하다");
  for (const { p, y } of staleSource.slice(0, 15)) console.log(`     ${y}  ${p.name}`);
  if (staleSource.length > 15) console.log(`     … 그 밖 ${staleSource.length - 15}곳`);
  console.log("");
}

// ── 파일로 남긴다 ───────────────────────────────────────────────────────
//    화면 로그는 흘러가 버린다. 다음 사람이 「무엇이 남았나」를 볼 자리가 있어야
//    루틴이 루틴이 된다 — 이게 없어서 지난 1년을 놓쳤다.
const rows = (list: { p: Place; y?: number }[]) =>
  list.map(({ p, y }) => {
    const url = (p as { officialUrl?: string }).officialUrl;
    const when = p.startMonth == null ? "" : MONTHS[p.startMonth] + (p.endMonth && p.endMonth !== p.startMonth ? `–${MONTHS[p.endMonth]}` : "");
    return `| ${y ?? ""} | ${p.name} | ${p.gu} | ${when} | ${url ? `[공식](${url})` : ""} |`;
  }).join("\n");

const md = `# 🎪 축제 신선도

**${THIS_YEAR}-${String(NOW.getMonth() + 1).padStart(2, "0")}-${String(NOW.getDate()).padStart(2, "0")} 기준 · 축제 ${F.length}곳**

이 파일은 \`npm run festival-freshness\` 가 **자동으로 덮어쓴다.** 손으로 고치지 말 것.

축제는 이 앱에서 **혼자 상하는 자료**다. 시장·산책로는 10년 뒤에도 그 자리에 있지만
축제는 해마다 날짜가 바뀌고 아예 없어지기도 한다. 그런데 예전 루틴은 **날짜**와
**사진·좌표**만 봤고 「아직 열리는가」는 아무도 안 봤다 — 그 사이 작년 회차가
1년 가까이 화면에 남아 있었다.

| 무엇 | 몇 곳 |
|---|---|
| ① 이름에 지난 연도가 박혔다 | **${pastNamed.length}곳** |
| ② 근거가 작년 이전이다 | **${staleSource.length}곳** |
| ③ 달조차 확인 못 했다 | ${unconfirmed.length}곳 |
| ④ 축제가 없는 달 | ${emptyMonths.length}개${emptyMonths.length ? ` (${emptyMonths.map((m) => MONTHS[m]).join(" · ")})` : ""} |

## ① 이름에 지난 연도가 박힌 축제

관광공사 원본의 제목이 곧 **그 해 회차의 이름**이라 이렇게 된다.
화면에서는 이미 가려 준다 — 달별 묶음에서 빼고, 곳 페이지에는 「${THIS_YEAR - 1}년 회차 기록」이라고 밝힌다.
다만 **자료 자체는 그대로**이므로, 올해 회차가 올라오면 새로 받아 바꿔 줘야 한다.

${pastNamed.length ? `| 연도 | 이름 | 구 | 시기 | 공식 |\n|---|---|---|---|---|\n${rows(pastNamed)}` : "_없다._"}

## ② 근거가 작년 이전인 축제

이름엔 연도가 없지만, 우리가 \`monthSource\` 에 적어 둔 근거가 작년 이전이다.
**「올해도 열린다」고 말할 근거가 우리에게 없다**는 뜻이다.

${staleSource.length ? `| 근거 연도 | 이름 | 구 | 시기 | 공식 |\n|---|---|---|---|---|\n${rows(staleSource)}` : "_없다._"}

## ④ 축제가 한 곳도 없는 달

그 달의 묶음 페이지가 **아예 안 만들어진다**(\`/seoul/festivals-in-july/\` 가 없다는 뜻).
「7월에 서울 축제」로 검색하는 손님을 받을 문이 없다.

${emptyMonths.length ? emptyMonths.map((m) => `- **${MONTHS[m]}**`).join("\n") : "_없다._"}
`;

mkdirSync(join(ROOT, "docs"), { recursive: true });
writeFileSync(join(ROOT, "docs", "축제-신선도.md"), md);
console.log("💾 docs/축제-신선도.md 에 표로 남겼다.");

// ⚠️ **일부러 실패로 끝내지 않는다.** 이건 「사람이 볼 일감」이지 「배포를 막을 사고」가
//    아니다. 매일 빨간불이 뜨면 곧 아무도 안 본다 — 그러면 지금과 똑같아진다.
