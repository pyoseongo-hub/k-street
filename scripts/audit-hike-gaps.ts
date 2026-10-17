// 🥾 **등산 32곳에 무엇이 비었는지 센다.**
//
// 사장님 (2026-10-16): *"등산에 관한 외국인 을 위한 서비스가 늘었다는데 찾아보고
// 어떻게 적용할지 생각해"* → (2026-10-17) *"추측없고 사실만 모르면 표기안하고 안내문구"*
//
// 🧭 이 검사가 가르는 것 — **채울 수 있는 칸**과 **자료가 없어 안내문구로 보낼 칸**.
//    외국인이 산을 고를 때 보는 것은 이름이 아니라 **얼마나 걸리나 · 어떻게 가나**다.
//
// 🚫 아무것도 저장하지 않는다. 세기만 한다.
//
//   npm run hike-gaps

import { ALL_PLACES } from "../src/data/seed";
import nearestStation from "../src/data/nearest-station.json";
import coords from "../src/data/coords.json";

type 역표 = Record<string, { none?: true; name?: string; line?: string } | undefined>;
const 역 = ((nearestStation as Record<string, unknown>).곳 ?? nearestStation) as 역표;
const 좌 = ((coords as Record<string, unknown>).곳 ?? coords) as Record<string, unknown>;

const 산 = ALL_PLACES.filter((p) => p.category === "hike");
console.log(`🥾 hike ${산.length}곳\n`);

// 📏 **이름에 숫자가 섞여 있는 것까지 센다.** note 에 "18.6km" 처럼 박아 둔 것이 있는데,
//    칸이 아니라 글이라 화면에서 걸러 쓸 수 없다 — 그래서 '있다'로 세면 틀린다.
const 거리글 = /\d+(\.\d+)?\s?km/i;
const 시간글 = /\d+\s?(시간|분)/;

let 좌표있음 = 0, 역있음 = 0, 역없다고확인 = 0, 거리 = 0, 시간 = 0, 링크 = 0, 설명 = 0;
const 좌표없는것: string[] = [];
for (const p of 산) {
  const n = (p as { note?: string }).note ?? "";
  if (좌[p.id]) 좌표있음++; else 좌표없는것.push(p.name);
  const r = 역[p.id];
  if (r && !r.none) 역있음++;
  else if (r?.none) 역없다고확인++;
  if (거리글.test(n)) 거리++;
  if (시간글.test(n)) 시간++;
  if ((p as { officialUrl?: string }).officialUrl) 링크++;
  if (n) 설명++;
}

const 줄 = (칸: string, 수: number, 뜻: string) =>
  console.log(`  ${칸.padEnd(22)} ${String(수).padStart(3)} / ${산.length}   ${뜻}`);

console.log("📦 지금 들어 있는 것");
줄("note(아무 글이나)", 설명, `나머지 ${산.length - 설명}곳은 이름뿐이다`);
줄("거리(km)가 글에 섞임", 거리, "칸이 아니라 글 — 화면에서 못 걸러 쓴다");
줄("소요시간이 글에 섞임", 시간, "같다");
줄("공식 링크", 링크, "확인하러 갈 자리");
console.log();
console.log("🚉 우리가 **이미 가진 자료로 채울 수 있는 것**");
줄("좌표", 좌표있음, "역을 계산하려면 이게 먼저다");
줄("가까운 역(찾음)", 역있음, "nearest-station.json 에 들어 있다");
줄("가까운 역(없음 확인)", 역없다고확인, "찾아봤고 역이 없는 곳 — 이것도 사실이다");
if (좌표없는것.length)
  console.log(`\n  ⚠️ 좌표가 없어 역을 못 뽑는 곳 ${좌표없는것.length}곳: ${좌표없는것.slice(0, 5).join(" · ")}${좌표없는것.length > 5 ? " …" : ""}`);

// 🔔 **안내문구가 실제로 몇 곳에 붙나** (2026-10-17). 화면의 조건과 **같은 식**을 쓴다 —
//    DistrictExplorer.tsx 의 `category === "hike" && !note && !nameOnly`.
//    잣대가 둘이면 반쪽 적용이 생긴다(유튜브 titleMentions 때 데인 자리).
const 안내붙음 = 산.filter(
  (p) => !((p as { note?: string }).note) && !((p as { nameOnly?: boolean }).nameOnly),
).length;
const 이미안내 = 산.filter((p) => (p as { nameOnly?: boolean }).nameOnly).length;
console.log("🔔 안내문구");
줄("등산 안내문구가 붙음", 안내붙음, "거리·시간이 없어 빈 칸으로 두고 한 줄을 띄운다");
줄("이미 nameOnly 안내", 이미안내, "서울시 등록 출처가 맞는 곳 — 그 줄을 그대로 둔다");
줄("아무 안내도 없음", 산.length - 안내붙음 - 이미안내, "note 가 있어 안내가 필요 없는 곳");
console.log();

console.log(`
🧭 판정
   · 역·좌표는 **우리 자료**다 → 추측 없이 채울 수 있다.
   · 거리·소요시간·난이도는 **공식 자료가 있어야** 한다 → 없으면 적지 않고 안내문구.
   · 안내문구는 **등산용으로 따로 만들었다**(translations.ts 의 hikeNoDetailNote).
     nameOnlyNote 를 돌려쓰면 "서울시에 등록된"이라는 **없는 출처**를 부산 산에 붙이게 된다.`);
