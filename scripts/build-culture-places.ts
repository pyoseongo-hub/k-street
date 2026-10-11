// 🎪 **전국 축제를 우리 곳 목록에 앉힌다.**
//
// 사장님 (2026-10-11): *"경주같은데는 축제가 없나"* — 세어 보니 **경주 0곳**이었다.
// 받아 보니 있었다. 없는 게 아니라 **끝난 것**이었다 (대릉원돌담길 4월, 국공립극단 7월).
//
// 받아 적는 쪽은 scripts/fetch-culture-festivals.mjs 가 한다 (culture-festivals.json).
// 이 파일은 그걸 **우리 틀에 맞춰 앉히기만** 한다. 포털을 두드리지 않는다.
//
// ── 🚨 여기서 틀리기 쉬운 세 군데 ────────────────────────────────────────
// ① **지역 이름이 제멋대로다.** 「경북」·「전북특별자치도」·「전남광주통합」이 섞여 온다.
//    「경상북도」로 물으면 0건이 오는 것도 같은 까닭이다. 그래서 명부(cities.ts)의
//    ko·koFull 과 맞춰 보고, 안 맞으면 **버린다.** 억지로 끼워 넣지 않는다.
// ② **「전남광주통합」은 두 곳이 한 이름으로 묶여 있다.** 광주광역시냐 전라남도냐를
//    시군구로 가른다 — 광주의 단위는 전부 「구」, 전남은 전부 「시·군」이라 갈린다.
//    그래도 안 갈리면 버린다.
// ③ **사진은 안 가져온다.** 문화포털 썸네일의 이용 조건을 확인하지 못했다.
//    저작권은 틀리면 되돌릴 수 없다 — 빈 칸이 낫다. 대신 nameOnly 로 두어
//    카드에 「자료가 아직 없다」는 안내가 뜨게 한다.
//
// 🔀 id 는 `cf_<포털 일련번호>` 다. 순번으로 만들지 않는다 — 하나를 지우면 뒤가
//    밀리고, 그러면 **지운 곳의 사진·언급이 새 곳에 붙는다.**
//
//   npm run culture-places

import { writeFileSync } from "node:fs";
import { CITIES } from "../src/data/cities";
import { ALL_PLACES } from "../src/data/seed";
import type { Place } from "../src/data/seed";
import 받은것 from "../src/data/culture-festivals.json";

interface 한건 {
  seq: string; title: string; start: string; end?: string;
  place?: string; area?: string; sigungu?: string; realm?: string;
  thumb?: string; lat?: number; lng?: number; page?: string;
}
const 곳들 = (받은것 as { 곳: 한건[] }).곳 ?? [];

// 🗺️ 포털이 쓰는 지역 이름 → 우리 열쇠. 명부에서 만든다 — **손으로 베끼지 않는다.**
//    베끼면 명부가 바뀔 때 둘이 어긋나고, 어긋난 쪽은 조용히 버려진다.
const 이름으로 = new Map<string, string>();
for (const c of CITIES) {
  이름으로.set(c.ko, c.key);
  이름으로.set(c.koFull, c.key);
}
const 단위 = new Map(CITIES.map((c) => [c.key, new Set(c.units)]));

// 📮 **포털의 시군구를 우리 단위로 줄인다.** 포털은 「수원시 팔달구」처럼
//    시와 구를 붙여 준다. 우리 명부는 「수원시」까지다 — 앞 토막을 쓴다.
//    (특례시·대도시가 다 그렇다: 수원·고양·용인·창원·청주·포항·부천·화성.)
const 줄인단위 = (sigungu?: string) => sigungu?.trim().split(/\s+/)[0];

// 🔎 그 시군구를 가진 시·도를 전부 찾는다. 「중구」처럼 여러 곳에 있는 이름도 있어서
//    **하나로 좁혀질 때만** 쓴다.
function 시군구로찾기(unit?: string): string[] {
  if (!unit) return [];
  return [...단위].filter(([, set]) => set.has(unit)).map(([k]) => k);
}

/**
 * 포털의 area + sigungu 로 우리 시·도 열쇠를 찾는다. 못 찾으면 undefined.
 *
 * 🚨 **area 를 곧이곧대로 믿지 않는다** (2026-10-11에 걸렸다).
 *    「광주 / 순천시」· 「광주 / 여수시」가 온다 — 순천·여수는 **전남**이다.
 *    포털이 광주·전남을 한 묶음(「전남광주통합」)으로 쓰다 보니 생긴 일이다.
 *    그래서 area 로 고른 뒤 **시군구가 그 시·도에 실제로 있는지** 반드시 본다.
 *    안 맞으면 시군구 쪽을 믿는다 — 시·군 이름이 시·도 이름보다 잘게 갈라진다.
 */
function 어느시도(area?: string, sigungu?: string): string | undefined {
  const unit = 줄인단위(sigungu);
  const 가진곳 = 시군구로찾기(unit);

  const 후보 = (() => {
    if (!area) return [];
    const 바로 = 이름으로.get(area);
    if (바로) return [바로];
    // 🔀 「전남광주통합」처럼 둘이 묶인 이름.
    return [...new Set([...이름으로.keys()].filter((n) => area.includes(n)).map((n) => 이름으로.get(n)!))];
  })();

  // ① area 와 시군구가 같이 가리키는 곳이 있으면 그것이다 — 가장 확실하다.
  const 겹침 = 후보.filter((k) => 가진곳.includes(k));
  if (겹침.length === 1) return 겹침[0];
  // ② 안 겹치면 **시군구를 믿는다.** 단, 하나로 좁혀질 때만.
  if (가진곳.length === 1) return 가진곳[0];
  // ③ 시군구가 아예 없는 곳(세종)은 area 하나로 간다.
  if (!unit && 후보.length === 1) return 후보[0];
  return undefined;   // 못 가르면 버린다. 억지로 끼워 넣지 않는다
}

const 올해 = new Date().getFullYear();
const 버린이유 = new Map<string, number>();
const 버린다 = (왜: string) => 버린이유.set(왜, (버린이유.get(왜) ?? 0) + 1);

// 🪞 이미 우리가 아는 축제는 겹쳐 넣지 않는다. 이름의 **연도·회차·군더더기를 떼고** 본다 —
//    「2026 김천김밥축제」와 「김천김밥축제」는 같은 축제다.
const 뼈대 = (s: string) =>
  s.replace(/\(.*?\)|\[.*?\]/g, " ")
    .replace(/제?\s*\d+\s*회/g, " ")
    .replace(/\b(19|20)\d{2}\s*년?/g, " ")
    .replace(/[^0-9A-Za-z가-힣]/g, "")
    .toLowerCase();
//    🚨 **제가 만든 것은 빼고 본다** (2026-10-11에 바로 걸렸다).
//       이 결과를 seed 에 이어 붙이자마자, 다음 번 실행에서 ALL_PLACES 안에
//       **자기 자신**이 들어 있게 됐다. 그래서 357곳이 전부 「이미 아는 축제」로
//       걸러져 **0곳이 됐다.** 파일이 통째로 비는데 오류는 안 난다 —
//       숫자를 안 봤으면 그대로 올라갔다.
const 이미있는것 = new Set(
  ALL_PLACES.filter((p) => !p.id.startsWith("cf_")).map((p) => `${p.gu}|${뼈대(p.name)}`),
);

const 곳결과: Place[] = [];
const 날짜결과: Record<string, unknown> = {};

for (const it of 곳들) {
  if (!it.seq || !it.title || !it.start) { 버린다("일련번호·이름·날짜가 없다"); continue; }
  const city = 어느시도(it.area, it.sigungu);
  if (!city) { 버린다(`시·도를 못 가렸다 (${it.area ?? "빈칸"})`); continue; }
  const gu = 줄인단위(it.sigungu);
  // 🚨 시군구가 명부에 없으면 버린다. 억지로 넣으면 **없는 동네 칸**이 생긴다.
  //    (세종은 시군구가 없고 읍·면이 바로 밑이라, 포털이 빈 칸으로 준다 — 그래서 빠진다.)
  if (!gu || !단위.get(city)?.has(gu)) { 버린다(`시군구가 명부에 없다 (${it.area ?? "빈칸"}/${it.sigungu ?? "빈칸"})`); continue; }
  const 끝 = it.end ?? it.start;
  if (Number(끝.slice(0, 4)) < 올해) { 버린다("작년 이전에 끝났다"); continue; }
  if (이미있는것.has(`${gu}|${뼈대(it.title)}`)) { 버린다("이미 아는 축제다"); continue; }

  const id = `cf_${it.seq}`;
  곳결과.push({
    id, city, gu,
    category: "festival",
    name: it.title,
    // 📝 사진도 소개 글도 없다. 지어내지 않고 빈 칸으로 두되, 카드에 안내가 뜨게 한다.
    nameOnly: true,
    ...(it.lat && it.lng ? { lat: it.lat, lng: it.lng } : {}),
    startMonth: Number(it.start.slice(5, 7)),
    endMonth: Number(끝.slice(5, 7)),
    // 🔒 **달에는 근거가 있어야 화면에 나온다** (사장님 지시 2026-09-02:
    //    "부정확한건 가리고 서치가 맞을때 개시"). 근거 없는 달은 seed.ts 가 거른다.
    //    이 달은 지어낸 게 아니라 **포털이 적어 둔 시작일**에서 그대로 뽑은 것이고,
    //    날마다 다시 받아 대조된다 — 관광공사 축제 창구를 통과시키는 것과 같은 까닭이다.
    monthSource: "한국문화정보원 문화정보 창구",
    ...(it.page ? { officialUrl: it.page } : {}),
  } as Place);

  날짜결과[id] = {
    start: it.start,
    ...(it.end && it.end !== it.start ? { end: it.end } : {}),
    title: it.title,
    gu,
    ...(it.place ? { place: it.place } : {}),
    ...(it.lat && it.lng ? { lat: it.lat, lng: it.lng } : {}),
    ...(it.page ? { page: it.page } : {}),
    source: "한국문화정보원 한눈에보는문화정보 (공공데이터포털)",
    fetchedAt: (받은것 as { 받은날?: string }).받은날 ?? new Date().toISOString().slice(0, 10),
  };
}

const 오늘 = new Date().toISOString().slice(0, 10);
const 끝난것 = 곳결과.filter((p) => {
  const d = 날짜결과[p.id] as { start: string; end?: string };
  return (d.end ?? d.start) < 오늘;
});
const 시도별 = new Map<string, number>();
for (const p of 곳결과) 시도별.set(p.city!, (시도별.get(p.city!) ?? 0) + 1);

console.log(`🎪 받은 것 ${곳들.length}건 → 앉힌 것 ${곳결과.length}곳`);
console.log(`   그중 올해 이미 끝난 것 ${끝난것.length}곳 — 지우지 않는다. 회색 「내년에 또」로 보여 준다`);
console.log(`   시·도별: ${[...시도별].sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(" · ")}`);
if (버린이유.size) {
  console.log(`\n🗑️ 버린 것 (억지로 끼워 넣지 않는다)`);
  for (const [왜, n] of [...버린이유].sort((a, b) => b[1] - a[1])) console.log(`   ${n}건 — ${왜}`);
}
const 경주 = 곳결과.filter((p) => p.gu === "경주시");
console.log(`\n🏯 경주 ${경주.length}곳${경주.length ? " — " + 경주.map((p) => p.name).join(" · ") : ""}`);

// 🏷️ **이름 끝을 `-places.json` 으로 두지 않는다** (2026-10-11에 걸렸다).
//    check-city-places.mjs 가 `*-places.json` 을 **시·도 하나의 곳 목록**으로 보고
//    파일 이름에서 시·도 열쇠를 뽑는다. 그래서 「culture-festival 이라는 시·도가 없다」며
//    점검이 빨간불이 됐다. 이 파일은 한 시·도의 목록이 아니라 **전국이 섞인 것**이라
//    그 틀에 안 맞는다 — 이름으로 갈라 둔다.
writeFileSync("src/data/culture-festival-spots.json",
  JSON.stringify(곳결과, null, 2) + "\n", "utf8");
writeFileSync("src/data/culture-festival-dates.json",
  JSON.stringify({
    _읽어보세요: [
      "🎪 **전국 축제의 확정 일정** — 한국문화정보원 「한눈에보는문화정보」.",
      "기계가 덮어쓴다 — 손으로 고치지 말 것.",
      "받기: scripts/fetch-culture-festivals.mjs · 앉히기: scripts/build-culture-places.ts",
      "서울은 구청·펀서울 쪽이 더 앞선 사실이라 그쪽이 이긴다 (src/lib/guFestival.ts).",
    ],
    곳: 날짜결과,
  }, null, 2) + "\n", "utf8");
console.log(`\n✅ culture-festival-places.json · culture-festival-dates.json 에 적었다.`);
