#!/usr/bin/env node
// 🗺️ **우리 명부(cities.ts)의 시·군·구가 관광공사와 맞나.**
//
// 🐞 왜 만들었나 (2026-10-05, 인천을 열다 걸렸다) —
//    관광공사가 돌려준 인천 주소가 **영종구 · 제물포구 · 서해구 · 검단구** 였다.
//    그런데 cities.ts 에는 **중구 · 동구 · 서구** 로 적혀 있었다. 인천이 행정구역을
//    새로 짠 것을 우리 명부가 못 따라간 것이다.
//    결과 — `build-city-places` 가 그 주소들을 「명부에 없는 동네」로 보고
//    **114곳 중 73곳을 통째로 버렸다.** 차이나타운·월미도가 있는 자리다.
//
// 🚨 **화면은 안 깨진다.** 그 구가 그냥 **없는 채로** 앱이 멀쩡히 돈다 —
//    벌집 지도에 칸이 없으니 빈 곳으로도 안 보인다. 이 저장소가 여러 번 적어 둔
//    「칸이 없으면 빈 곳이 안 보인다」가 그대로 재현됐다.
//    행정구역은 앞으로도 바뀐다. 그래서 **기계가 묻게** 해 둔다.
//
// 돌리기 (관광공사를 부르므로 Actions 에서 — Check district registry):
//   TOUR_API_KEY=… node scripts/check-district-registry.mjs
//   TOUR_API_KEY=… node scripts/check-district-registry.mjs --all   ← 빈칸 도시까지
//
// ⚠️ **고치지는 않는다. 알려만 준다.** 명부를 기계가 덮어쓰면 손으로 맞춰 둔 것이
//    날아간다(벌집 지도·번역된 이름이 그 이름을 열쇠로 쓴다). 사람이 보고 고친다.
import { readCities } from "./lib/city-registry.mjs";
// 🚨 **관광공사는 공용 함수로 부른다.** 처음에 맨 `fetch` 를 쓰고 세 번만 다시
//    물어봤더니 **17곳이 전부 「fetch failed」** 로 떨어졌다 — 그 한 줄로는
//    원인을 알 수 없다(tour-fetch.mjs 주석이 그걸 적어 뒀는데 안 읽고 새로 짰다).
//    공용 함수는 30초 천장을 걸고 5~60초씩 여섯 번 다시 물어보며,
//    **진짜 이유(cause)** 를 꺼내 찍어 준다.
import { fetchWithRetry } from "./lib/tour-fetch.mjs";

const KEY = process.env.TOUR_API_KEY;
if (!KEY) { console.error("❌ TOUR_API_KEY 가 없다 — 워크플로에 시크릿을 넘겼는지 볼 것."); process.exit(1); }
const ALL = process.argv.includes("--all");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function sigungu(areaCodeNum) {
  const q = new URLSearchParams({
    MobileOS: "ETC", MobileApp: "KStreet", _type: "json",
    areaCode: String(areaCodeNum), numOfRows: "100", pageNo: "1",
  });
  const url = `https://apis.data.go.kr/B551011/KorService2/areaCode2?serviceKey=${KEY}&${q}`;
  const res = await fetchWithRetry(url, { log: (m) => console.log(m) });
  const text = await res.text();
  if (!res.ok) throw new Error(`HTTP ${res.status} — ${text.slice(0, 100).replace(/\s+/g, " ")}`);
  let data;
  try { data = JSON.parse(text); }
  catch { throw new Error(`JSON 이 아니다 — ${text.slice(0, 120).replace(/\s+/g, " ")}`); }
  const h = data?.response?.header;
  if (h?.resultCode && h.resultCode !== "0000") throw new Error(`API ${h.resultCode} ${h.resultMsg}`);
  const it = data?.response?.body?.items?.item;
  const list = !it ? [] : Array.isArray(it) ? it : [it];
  if (!list.length) throw new Error("빈 목록이 왔다");
  return list.map((x) => String(x.name).trim());
}

const cities = readCities().filter((c) => c.areaCode && (ALL || c.status === "공개"));
console.log(`🗺️ 대 볼 도시 ${cities.length}곳 — ${cities.map((c) => c.ko).join(" · ")}\n`);

let 안맞음 = 0, 못물어봄 = 0;
for (const c of cities) {
  let theirs;
  try { theirs = await sigungu(c.areaCode); }
  catch (e) { console.error(`❌ ${c.ko} — 못 물어봤다: ${e.message}`); 못물어봄++; continue; }
  const ours = new Set(c.units);
  const 그들 = new Set(theirs);
  // 🚨 **「못 물어본 것」과 「없는 것」을 가른다** — 위에서 실패하면 여기 안 온다.
  const 우리만 = c.units.filter((u) => !그들.has(u));
  const 그들만 = theirs.filter((u) => !ours.has(u));
  if (!우리만.length && !그들만.length) {
    console.log(`✅ ${c.ko.padEnd(4)} ${String(c.units.length).padStart(2)}칸 — 그대로 맞는다`);
    continue;
  }
  안맞음++;
  console.log(`❌ ${c.ko.padEnd(4)} [${c.status}] 우리 ${c.units.length}칸 · 관광공사 ${theirs.length}칸`);
  if (우리만.length) console.log(`      우리에만 있다 (없어졌거나 이름이 바뀌었다): ${우리만.join(" · ")}`);
  if (그들만.length) console.log(`      관광공사에만 있다 (칸을 만들어야 한다): ${그들만.join(" · ")}`);
  await sleep(300);
}

console.log("");
// 🚨 **「못 물어봤다」를 「안 맞는다」로 세지 않는다.** 처음에 그렇게 적었더니
//    접속이 전부 실패한 판에서 「17곳이 안 맞는다」가 떴다 — 명부는 멀쩡한데.
//    모르는 것과 틀린 것을 가르는 것은 이 저장소의 기본 규칙이다.
if (못물어봄) console.log(`⚠️ 못 물어본 도시 ${못물어봄}곳 — 명부가 틀렸다는 뜻이 아니다. 다시 돌릴 것.`);
if (안맞음) {
  console.log(`❌ 명부가 안 맞는 도시 ${안맞음}곳 — src/data/cities.ts 의 units 를 손으로 맞출 것.`);
  console.log("   ⚠️ 이름을 바꾸면 cityHexMaps.ts 의 벌집 배치도 같이 고쳐야 한다(check-hex-maps 가 잡아 준다).");
}
if (안맞음 || 못물어봄) process.exit(1);
console.log("✅ 모든 도시의 시·군·구가 관광공사와 맞는다.");
