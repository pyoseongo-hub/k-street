#!/usr/bin/env node
// 🪪 **시·군·구 이름의 공식 일본어·중국어 표기를 받아 온다.** (2026-10-01)
//
// 일곱 도시를 열면서 새 시·군 63곳이 들어왔는데 `DISTRICT_NAME_JA`·`_ZH`·`_ZH_TW`
// 에 자리가 없어 `check-city-places` 가 푸시를 막았다. 처음에는 **한자를 확인할
// 자료가 없어 비워 두려고** 했다 — 「빈 칸이 틀린 글자보다 낫다」.
//
// ── 🔑 그런데 자료가 있었다 ────────────────────────────────────────────────
//   관광공사는 지역 목록(`areaCode2`)을 **언어별 서비스마다 따로** 낸다.
//   한국어 서비스는 「경주시」, 일본어 서비스는 「慶州市」를 주는데
//   **시군구 코드는 두 쪽이 같다.** 그래서 이름으로 비슷한 걸 찾는 게 아니라
//   **코드가 같은 줄끼리 이어 붙인다** — 틀릴 자리가 없다.
//
//   ⚠️ 영문 서비스(EngService2)는 이 열쇠로 **403** 이다(구독 안 됨).
//      그래서 영어는 여기서 안 받는다 — 로마자는 이미 손으로 확인해 뒀다.
//
// 🚨 **코드가 안 맞으면 그 줄은 버린다.** 짐작해서 붙이지 않는다.
//    한쪽에만 있는 시·군(새로 쪼개졌거나 이름이 바뀐 곳)은 빈 칸으로 남고,
//    앱은 로마자로 대신 보여 준다.
//
//   TOUR_API_KEY=… node scripts/fetch-district-names.mjs            ← 맛보기
//   TOUR_API_KEY=… node scripts/fetch-district-names.mjs --apply    ← 파일에 씀

import { readFileSync, writeFileSync } from "node:fs";
import { fetchWithRetry } from "./lib/tour-fetch.mjs";
import { readCities } from "./lib/city-registry.mjs";

const KEY = process.env.TOUR_API_KEY;
if (!KEY) { console.error("❌ TOUR_API_KEY 가 없다."); process.exit(1); }
const APPLY = process.argv.includes("--apply");
const OUT = "src/data/district-names-cjk.json";

/** 언어 열쇠 → 관광공사 서비스. 한국어가 **열쇠를 만드는 쪽**이라 맨 앞이다. */
const SERVICES = [
  ["ko", "KorService2", "국문"],
  ["ja", "JpnService2", "일문"],
  ["zh", "ChsService2", "중문 간체"],
  ["zh-TW", "ChtService2", "중문 번체"],
];

async function areaCode(service, areaCodeNum) {
  const q = new URLSearchParams({
    MobileOS: "ETC", MobileApp: "KStreet", _type: "json",
    areaCode: areaCodeNum, numOfRows: "100", pageNo: "1",
  });
  const res = await fetchWithRetry(`https://apis.data.go.kr/B551011/${service}/areaCode2?serviceKey=${KEY}&${q}`);
  const text = await res.text();
  if (!res.ok) throw new Error(`HTTP ${res.status} — ${text.slice(0, 110).replace(/\s+/g, " ")}`);
  let data;
  try { data = JSON.parse(text); }
  catch { throw new Error(`JSON 이 아니다 — ${text.slice(0, 140).replace(/\s+/g, " ")}`); }
  const h = data?.response?.header;
  if (h?.resultCode && h.resultCode !== "0000") throw new Error(`API ${h.resultCode} ${h.resultMsg}`);
  const it = data?.response?.body?.items?.item;
  return !it ? [] : Array.isArray(it) ? it : [it];
}

const CITIES = readCities().filter((c) => c.status === "공개" && c.areaCode);
console.log(`🗺️ 도시 ${CITIES.length}곳 — ${CITIES.map((c) => c.ko).join(" · ")}\n`);

// 우리가 자리를 만들어 둔 시·군·구만 담는다. 관광공사가 주는 것 중 우리 명부에
// 없는 것(합쳐지거나 없어진 곳)을 담으면 표만 커지고 화면에는 안 쓰인다.
const ours = new Set();
for (const c of CITIES) for (const u of c.units) ours.add(u);

/** 시군구코드 → { ko, ja, zh, zh-TW } */
const byCode = new Map();
let 못받음 = 0;

for (const [lang, svc, label] of SERVICES) {
  let 받은줄 = 0;
  for (const city of CITIES) {
    let rows;
    try { rows = await areaCode(svc, city.areaCode); }
    catch (e) {
      console.log(`   ⚠️ ${label} ${city.ko} — 못 받았다 (${String(e.message).slice(0, 70)})`);
      못받음++;
      continue;
    }
    for (const r of rows) {
      // 🚨 **열쇠는 「지역코드 + 시군구코드」**다. 시군구코드는 지역 안에서만
      //    고유해서(서울 1번과 부산 1번이 둘 다 있다) 코드만 쓰면 뒤섞인다.
      const key = `${city.areaCode}:${r.code}`;
      const slot = byCode.get(key) ?? { area: city.ko };
      slot[lang] = String(r.name ?? "").trim();
      byCode.set(key, slot);
      받은줄++;
    }
    await new Promise((s) => setTimeout(s, 150));
  }
  console.log(`── ${label}(${svc}) — ${받은줄}줄`);
}

const 표 = { ja: {}, zh: {}, "zh-TW": {} };
const 버린것 = [];
for (const [key, v] of byCode) {
  if (!v.ko) { 버린것.push(`${key} — 국문 이름이 없다`); continue; }
  if (!ours.has(v.ko)) continue; // 우리 명부에 자리가 없는 시·군
  for (const lang of ["ja", "zh", "zh-TW"]) {
    const name = v[lang];
    // 🚨 **한글이 그대로 온 것은 담지 않는다.** 그 서비스가 그 지역을 아직
    //    번역해 두지 않았다는 뜻이고, 한글을 일본어 표로 넣으면 화면에서
    //    번역이 된 것처럼 보인다 — 틀린 것보다 나쁘다.
    if (!name || /[가-힣]/.test(name)) { 버린것.push(`${v.ko} ${lang} — ${name || "빈 값"}`); continue; }
    표[lang][v.ko] = name;
  }
}

console.log("");
for (const lang of ["ja", "zh", "zh-TW"]) {
  const n = Object.keys(표[lang]).length;
  console.log(`${lang.padEnd(6)} ${n}곳`);
  for (const [ko, fo] of Object.entries(표[lang]).slice(0, 6)) console.log(`       ${ko.padEnd(8)} → ${fo}`);
}

// 🧾 우리 자리 중 **아직 못 채운 것**을 센다. 「다 됐다」와 「그만큼만 왔다」를 가른다.
const 빈자리 = [];
for (const u of ours) for (const lang of ["ja", "zh", "zh-TW"]) if (!표[lang][u]) 빈자리.push(`${u}(${lang})`);
console.log(`\n우리 자리 ${ours.size}곳 × 3언어 = ${ours.size * 3}칸 중 **못 채운 칸 ${빈자리.length}개**`);
if (빈자리.length) console.log(`   ${빈자리.slice(0, 20).join(" · ")}${빈자리.length > 20 ? " …" : ""}`);
if (버린것.length) console.log(`\n버린 줄 ${버린것.length}개 (한글이 그대로 왔거나 빈 값):\n   ${버린것.slice(0, 10).join("\n   ")}`);
if (못받음) console.log(`\n⚠️ **못 받은 판 ${못받음}개** — 「없다」가 아니라 「못 봤다」다. 다시 돌릴 것.`);

if (!APPLY) {
  console.log(`\n맛보기입니다 — 저장하지 않았습니다. 적으려면 --apply 를 붙이세요.`);
  process.exit(0);
}
const old = (() => { try { return JSON.parse(readFileSync(OUT, "utf-8")); } catch { return null; } })();
writeFileSync(
  OUT,
  JSON.stringify(
    {
      설명:
        "시·군·구 이름의 공식 일본어·중국어 표기. 관광공사가 **언어별로** 내는 지역 목록(areaCode2)을 " +
        "**시군구 코드로** 이어 붙인 것이다 — 이름으로 비슷한 걸 찾은 게 아니다. " +
        "영문은 이 열쇠로 403(구독 안 됨)이라 여기 없다 — 로마자는 districtNamesEn.ts 에 손으로 확인해 뒀다.",
      받은날: new Date().toISOString().slice(0, 10),
      출처: "한국관광공사 areaCode2 (KorService2 · JpnService2 · ChsService2 · ChtService2)",
      이름: 표,
    },
    null,
    2
  ) + "\n",
  "utf-8"
);
console.log(`\n저장: ${OUT}`);
if (old) {
  const before = Object.values(old.이름 ?? {}).reduce((s, x) => s + Object.keys(x).length, 0);
  const after = Object.values(표).reduce((s, x) => s + Object.keys(x).length, 0);
  console.log(`   ${before} → ${after}칸`);
}
