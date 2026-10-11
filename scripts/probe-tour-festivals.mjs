#!/usr/bin/env node
// 🔎 **관광공사가 축제를 실제로 몇 개 주는지 직접 물어본다.**
//
// 사장님 (2026-10-11): *"경주같은데는 축제가 없나"* — 세어 보니 **0곳**이었다.
// 경북 전체가 5곳이고 전부 2025 날짜다. 우리 자료 126곳 중 **2026 날짜는 2곳**뿐.
// 그런데 `fetch-festival-dates` 는 매일 초록불로 돈다.
//
// 🧭 이 검사가 가르는 것 — **받는 쪽이 문제인가, 주는 쪽이 문제인가.**
//    · 관광공사가 많이 주는데 우리가 안 담고 있다 → 우리 코드 문제
//    · 관광공사가 적게 준다 → 창구를 더 찾아야 한다 (서울 밖은 이 창구 하나뿐이다)
//
// 🚫 아무것도 저장하지 않는다. 묻고 세기만 한다.
//
//   TOUR_API_KEY=... node scripts/probe-tour-festivals.mjs

const KEY = process.env.TOUR_API_KEY;
if (!KEY) { console.error("TOUR_API_KEY 가 없다"); process.exit(1); }
const ROOT = "https://apis.data.go.kr/B551011/KorService2";

// 지역 번호는 관광공사가 정한 값이다 — 우리 명부(cities.ts)와 같은 번호를 쓴다.
const 지역 = [
  ["서울", "1"], ["인천", "2"], ["대전", "3"], ["대구", "4"], ["광주", "5"],
  ["부산", "6"], ["울산", "7"], ["세종", "8"], ["경기", "31"], ["강원", "32"],
  ["충북", "33"], ["충남", "34"], ["경북", "35"], ["경남", "36"],
  ["전북", "37"], ["전남", "38"], ["제주", "39"],
];

async function 물어본다(areaCode, 언제부터) {
  const p = new URLSearchParams({
    MobileOS: "ETC", MobileApp: "KStreet", _type: "json",
    areaCode, eventStartDate: 언제부터, numOfRows: "500", pageNo: "1", arrange: "A",
  });
  const r = await fetch(`${ROOT}/searchFestival2?serviceKey=${KEY}&${p}`);
  if (!r.ok) return { 오류: `HTTP ${r.status}` };
  const j = await r.json();
  const b = j?.response?.body;
  const it = b?.items?.item;
  const list = !it ? [] : Array.isArray(it) ? it : [it];
  return { 총: Number(b?.totalCount ?? 0), 받음: list.length, list };
}

const 올해 = `${new Date().getFullYear()}0101`;
const 작년 = `${new Date().getFullYear() - 1}0101`;

console.log("🔎 관광공사 searchFestival2 — 지역마다 몇 개를 주나\n");
console.log("지역    작년1/1부터   올해1/1부터   우리 자료");
for (const [이름, code] of 지역) {
  const a = await 물어본다(code, 작년);
  const b = await 물어본다(code, 올해);
  if (a.오류 || b.오류) { console.log(`${이름.padEnd(5)} ❌ ${a.오류 ?? b.오류}`); continue; }
  console.log(`${이름.padEnd(5)} ${String(a.총).padStart(8)}개 ${String(b.총).padStart(10)}개`);
  await new Promise((r) => setTimeout(r, 200));
}

// 🏯 경주를 콕 집어 본다 — 사장님이 물어본 곳이다.
console.log("\n🏯 경북(35) 에서 **경주**만 추린다 (올해 1/1 부터)");
const 경북 = await 물어본다("35", 올해);
if (경북.list) {
  const 경주 = 경북.list.filter((x) => String(x.addr1 ?? "").includes("경주"));
  console.log(`   경북 ${경북.총}개 중 경주 ${경주.length}개`);
  for (const x of 경주.slice(0, 15))
    console.log(`   · ${x.eventstartdate}~${x.eventenddate}  ${x.title}`);
  if (!경주.length && 경북.list.length) {
    console.log("   (경주가 없다 — 경북에서 받은 것 몇 개를 보여 준다)");
    for (const x of 경북.list.slice(0, 8))
      console.log(`   · ${x.eventstartdate}  ${String(x.addr1 ?? "").slice(0, 14)}  ${x.title}`);
  }
}
