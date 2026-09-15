// 🔗 **사슬 검사 — 좌표 → 가까운 역 → 짐 보관.**
//
// ─────────────────────────────────────────────────────────────────────────
// 왜 이 검사가 생겼나 (2026-09-15)
// ─────────────────────────────────────────────────────────────────────────
//   단풍길 110곳을 넣고 화면까지 확인했다. 목록에도 뜨고, 길찾기도 되고,
//   갈래 칩도 붙었다. **그런데 좌표를 안 넣었다.**
//
//   좌표가 없으면 이렇게 된다:
//       좌표 없음 → dump-place-coords 가 안 실음 → 가까운 역 없음
//                → 짐 보관 화면이 「가까운 지하철역 없음」
//   삼청동길은 안국역이 걸어서 갈 거리인데 「없음」이 떴다.
//   **화면을 열어 봐도 티가 안 난다** — 그 화면은 단추 두 번 안에 숨어 있고,
//   떠 있는 글자도 그럴듯하다. 사장님이 폰에서 눌러 보고서야 나왔다.
//
//   사장님: *"역까지 안내를 해야 다음 있는데 그게 없어. **항상 만들고 검사 좀 해.**
//            어떻게 이렇게 많이 없을 수 있어"*
//
//   그때 잰 숫자 — 곳 425개 중 **좌표 없음 111곳 · 역 기록 없음 112곳**.
//   거의 전부(106·107곳)가 그날 새로 넣은 단풍길이었다.
//
// ─────────────────────────────────────────────────────────────────────────
// 무엇을 막나
// ─────────────────────────────────────────────────────────────────────────
//   ❌ **새 갈래를 통째로 빠뜨리는 것.** 한 갈래의 좌표가 절반도 안 차 있으면 막는다.
//      이게 이번에 일어난 일이고, 하나씩 세는 검사로는 안 잡힌다 —
//      「몇 곳이 비었나」가 아니라 **「어느 갈래가 통째로 비었나」**를 봐야 한다.
//   ⚠️ 그 밖의 빈 칸은 **세어서 보여만 준다.** 관광공사 자료가 좌표를 안 준 곳이
//      늘 조금 있는데, 그것 때문에 배포가 막히면 검사를 꺼 버리게 된다.
//      막는 검사는 **적고 확실해야** 살아남는다.
//
// 🚨 「역 없음(none)」과 「역 모름(기록 없음)」을 **갈라서 센다.** 둘을 합치면
//    이번 사고가 그대로 숨는다 — 화면이 저지른 잘못이 바로 그 합치기였다.
//
//   npm run check-station-chain

// 🚨 **좌표를 여기서 다시 계산하지 않는다.** 처음엔 coords.json 만 보고 셌다가
//    「전 갈래가 0~15%」라는 엉뚱한 답을 얻었다 — 좌표는 **두 군데**에서 온다
//    (사람이 확인한 coords.json + 관광공사 자료). 그걸 합치는 자리가
//    dump-place-coords.ts 고, **가까운 역 찾기가 실제로 쓰는 것도 그 파일**이다.
//    검사가 다른 잣대를 쓰면 배포를 막는 이유가 거짓이 된다. 같은 파일을 읽는다.
import { ALL_PLACES } from "../src/data/seed";
import { PLACES } from "./dump-place-coords";
import stationData from "../src/data/nearest-station.json";

/** 실제로 길찾기·역 찾기에 쓰이는 좌표를 가진 곳들. */
const HAS_COORD = new Set(PLACES.map((p) => p.id));

const ROWS = (stationData as { 곳?: Record<string, { none?: boolean; station?: string }> })["곳"] ?? {};

/**
 * 좌표가 이 비율보다 덜 차 있으면 **막는다**.
 *
 * 0.5 인 이유 — 한 갈래를 새로 넣고 좌표를 아예 안 받으면 0% 가 된다(이번 일).
 * 반대로 관광공사가 몇 곳을 못 준 정도로는 90% 아래로 안 내려간다.
 * 절반은 그 둘 사이에 넉넉히 있다 — **사고만 잡고 잔소리는 안 한다.**
 */
const MIN_COORD_RATE = 0.5;

/** 갈래가 이보다 작으면 비율을 따지지 않는다 — 3곳 중 1곳 빈 것은 사고가 아니다. */
const MIN_SIZE = 8;

interface Tally {
  전체: number;
  좌표: number;
  역있음: number;
  역없음: number;
  역모름: number;
}

const 갈래 = new Map<string, Tally>();

for (const p of ALL_PLACES) {
  const t =
    갈래.get(p.category) ??
    갈래.set(p.category, { 전체: 0, 좌표: 0, 역있음: 0, 역없음: 0, 역모름: 0 }).get(p.category)!;
  t.전체++;
  if (HAS_COORD.has(p.id)) t.좌표++;
  const r = ROWS[p.id];
  if (!r) t.역모름++;
  else if (r.none) t.역없음++;
  else if (r.station) t.역있음++;
  else t.역모름++; // 기록은 있는데 역 이름이 없다 — 이것도 답이 아니다
}

const 줄 = [...갈래.entries()].sort((a, b) => b[1].전체 - a[1].전체);

console.log("🔗 좌표 → 가까운 역 → 짐 보관, 사슬이 이어져 있나\n");
console.log("갈래          곳수   좌표      역 있음  역 없음  역 모름");
console.log("──────────────────────────────────────────────────────────");

const 막을것: string[] = [];
let 좌표합 = 0;
let 역모름합 = 0;

for (const [cat, t] of 줄) {
  const rate = t.전체 ? t.좌표 / t.전체 : 1;
  좌표합 += t.좌표;
  역모름합 += t.역모름;
  const 낮음 = t.전체 >= MIN_SIZE && rate < MIN_COORD_RATE;
  if (낮음) 막을것.push(`${cat} — 곳 ${t.전체}개 중 좌표가 ${t.좌표}개뿐 (${Math.round(rate * 100)}%)`);
  console.log(
    `${(낮음 ? "❌ " : "   ") + cat.padEnd(11)}` +
      `${String(t.전체).padStart(4)}  ` +
      `${String(t.좌표).padStart(4)} (${String(Math.round(rate * 100)).padStart(3)}%)  ` +
      `${String(t.역있음).padStart(6)}  ${String(t.역없음).padStart(6)}  ${String(t.역모름).padStart(6)}`,
  );
}

const 전체 = ALL_PLACES.length;
console.log("──────────────────────────────────────────────────────────");
console.log(
  `   ${"합계".padEnd(11)}${String(전체).padStart(4)}  ` +
    `${String(좌표합).padStart(4)} (${String(Math.round((좌표합 / 전체) * 100)).padStart(3)}%)  ` +
    `역을 모르는 곳 ${역모름합}곳`,
);

if (역모름합 > 0) {
  console.log(
    `\n⚠️ 역을 모르는 곳이 ${역모름합}곳 있다. 화면은 이걸 「없음」이 아니라 ` +
      `**「아직 확인 못 했어요」**로 말한다(LuggageCard). 채우려면:`,
  );
  console.log("   Actions → Nearest station — 좌표부터 받고 역을 찾는 한 판이다.");
}

if (막을것.length) {
  console.error("\n❌ **좌표가 통째로 빈 갈래가 있다.** 여기서 막는다.\n");
  for (const m of 막을것) console.error(`   · ${m}`);
  console.error(
    "\n   좌표가 없으면 가까운 역도 없고, 짐 보관 화면이 아무것도 못 알려 준다.\n" +
      "   Actions → **Nearest station** 을 돌려서 채운 뒤에 다시 올릴 것.\n" +
      "   (단풍길처럼 새 갈래를 넣었다면 그 갈래를 받는 스크립트가 있는지 먼저 볼 것 —\n" +
      "    scripts/fetch-autumn-coords.mjs 가 그 본보기다.)",
  );
  process.exit(1);
}

console.log("\n✅ 통째로 빈 갈래는 없다.");
