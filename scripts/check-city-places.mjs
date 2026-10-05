#!/usr/bin/env node
// 🧾 **새 도시 곳 목록이 성한가.** 푸시마다 돈다. 관광공사를 부르지 않는다.
//
// 여기서 보는 것은 **화면을 열어 봐도 안 보이는 사고**들이다:
//   ① id 가 겹치나 — 겹치면 **지운 곳의 사진이 새 곳에 붙는다**(케이푸드에서 당했다)
//   ② 동네 이름이 명부(cities.ts)에 있나 — 없으면 화면에 자리가 없어 조용히 사라진다
//   ③ 사진 주소가 http 인가 — https 페이지에서 http 사진은 **오류 없이 안 보인다**
//   ④ 좌표가 그 도시 안에 있나 — 한 곳이 엉뚱한 데 찍히면 길찾기가 손님을 딴 데로 보낸다
import { readdirSync, readFileSync } from "node:fs";

// 🧾 **명부는 공용 파일에서 읽는다** (2026-10-01에 고쳤다).
//    여기엔 cities.ts 를 **따로 파싱하는 함수가 있었다.** 그 함수가 `kind` 를
//    안 읽어서, 도(道)에도 대도시 자(60km)를 대고 **강원·경북 좌표 900곳을
//    「시청에서 100km 떨어졌다」고 잡았다.** 멀쩡한 좌표였다.
//    이 파일 머리말이 경계하던 「잣대가 둘」이 **명부 쪽에도 있었던 것**이다.
import { cityByKey } from "./lib/city-registry.mjs";
const city = (key) => cityByKey(key) ?? null;

// 🗺️ 잣대는 만드는 쪽과 **같은 파일**에서 가져온다 — 둘이 다르면 반쪽 적용이 생긴다.
// 🏝️ **잣대를 만드는 쪽과 같은 파일에서 가져온다.** 두 군데 적으면 반쪽 적용이 생긴다 —
//    실제로 그랬다(그 파일의 coordLooksRight 주석 참고): 만드는 쪽만 고쳤더니
//    여기가 울릉군 19곳을 「217km 떨어져 있다」고 막았다.
import { distanceKm as km, districtMedians, districtClusters, coordLooksRight } from "./lib/city-geo.mjs";

const seen = new Map();   // id → 어디서 나왔나
const bad = [];
// ⚠️ 막지는 않지만 짚고 넘어갈 것(시·군·구 한자 표기). 아래 주석 참고.
const warn = [];
// 서울 id 도 함께 넣어 **도시끼리 겹치는 것**을 잡는다.
for (const [k, v] of Object.entries(JSON.parse(readFileSync("src/data/tour-places-raw.json", "utf8"))))
  for (const p of v) seen.set(String(p.contentId), `서울 ${k}`);

// ── 🔂 ⑤ **같은 도시 안에 같은 이름이 두 번 있나** (2026-09-17에 더했다) ────
//
//   번호는 다른데 **같은 곳**인 경우가 있다. 서울 341곳을 넣을 때 실제로 5곳이 그랬다 —
//   사가정공원 · 백인제가옥 · 딜쿠샤 · 북서울꿈의숲 · 대안공간 루프. seed.ts 에 사람이
//   적어 둔 것과 관광공사 번호가 달라서, 번호 검사로는 하나도 안 걸렸다.
//   결과는 **12개 언어마다 같은 제목의 페이지 두 장**이었다(…/dilkusha 와 …/dilkusha-2).
//   화면을 열어 봐도 모른다 — 둘 다 멀쩡해 보이기 때문이다.
//
//   🚨 이름은 **같은 도시 안에서만** 본다. 「중앙시장」처럼 서울에도 부산에도 있는
//      이름이 있어서, 도시를 넘어 보면 멀쩡한 곳을 사고라고 부르게 된다.
const nfc = (t) => String(t ?? "").normalize("NFC").trim();
const seoulNames = new Map();
for (const [k, v] of Object.entries(JSON.parse(readFileSync("src/data/tour-places-raw.json", "utf8"))))
  for (const p of v) seoulNames.set(nfc(p.name), `서울 관광공사 ${k}`);
for (const m of readFileSync("src/data/seed.ts", "utf8").matchAll(/\bname: "([^"]+)"/g))
  if (!seoulNames.has(nfc(m[1]))) seoulNames.set(nfc(m[1]), "서울 seed.ts");
const namesByCity = new Map([["seoul", seoulNames]]);

const files = readdirSync("src/data").filter((f) => /-places\.json$/.test(f));
for (const f of files) {
  const key = f.replace("-places.json", "");
  const C = city(key);
  if (!C) { bad.push(`${f} — cities.ts 에 「${key}」가 없다`); continue; }
  const list = JSON.parse(readFileSync(`src/data/${f}`, "utf8"));
  let far = 0, noPic = 0, noXY = 0;
  // 🏝️ 이 도시 시·군마다 곳들이 모인 가운데 — 섬(울릉군)을 가르는 두 번째 자다.
  const medians = districtMedians(list);
  // 🏝️🏝️ 저희끼리 뭉친 자리 — 백령도(옹진군)를 가르는 **세 번째 자**다.
  //    🚨 **만드는 쪽과 똑같은 것을 넘겨야 한다.** 2026-10-05에 세 번째 그물을
  //       빌더에만 넣고 여기엔 안 넘겼더니, 빌더가 살린 백령도 8곳을 **검사가
  //       도로 막았다.** city-geo.mjs 주석이 경고하던 그대로다 —
  //       「잣대가 둘이면 반쪽 적용이 생긴다」. 그 주석을 적어 놓고 또 당했다.
  const clusters = districtClusters(list);
  for (const p of list) {
    if (seen.has(p.id)) bad.push(`${f} — id ${p.id} 가 이미 있다 (${seen.get(p.id)} · ${p.name})`);
    else seen.set(p.id, `${key} ${p.name}`);
    if (!C.units.includes(p.gu)) bad.push(`${f} — ${p.name}: 「${p.gu}」는 ${C.ko} 명부에 없다`);
    // 🔂 같은 도시 안에 같은 이름 (위 주석 참고)
    const names = namesByCity.get(key) ?? namesByCity.set(key, new Map()).get(key);
    const where = names.get(nfc(p.name));
    if (where) bad.push(`${f} — ${p.name}: 같은 이름이 이미 있다 (${where}) · 번호만 다르고 같은 곳일 수 있다`);
    else names.set(nfc(p.name), `${key} ${p.id}`);
    if (/^http:/.test(p.image ?? "") || /^http:/.test(p.thumb ?? ""))
      bad.push(`${f} — ${p.name}: 사진 주소가 http 다 (https 화면에서 안 보인다)`);
    // 좌표가 **없는 것**은 문제가 아니다 — 만드는 쪽이 일부러 버린 것일 수 있다
    // (관광공사가 틀린 값을 준 곳). 주소로 길을 찾는다. 세어서 보여만 준다.
    if (p.lat == null || p.lng == null) noXY++;
    else if (!coordLooksRight(C, medians, p.gu, p.lat, p.lng, clusters)) {
      far++;
      bad.push(
        `${f} — ${p.name}: ${C.ko} 시청에서 ${Math.round(km(C.lat, C.lng, p.lat, p.lng))}km 떨어져 있고` +
          ` 「${p.gu}」에 모인 곳들의 가운데에서도 멀다`
      );
    }
    if (!p.image) noPic++;
  }
  console.log(`📋 ${f} — ${list.length}곳 · 사진 ${list.length - noPic} · 좌표 ${list.length - noXY} · 도시 밖 좌표 ${far}`);
}

// 🌐 **그 동네 이름이 네 언어 표에 다 있나** (2026-09-16).
//    빠지면 그 구만 화면에 **한국어로 남는다** — 일본어 페이지 한가운데
//    「기장군」이 박혀 있어도 화면은 안 깨지므로 아무도 안 알려 준다.
//    서울에서 이미 같은 일을 겪었다(2026-08-28: "일본어 선택해도 여긴 영어인데 맞나").
const names = readFileSync("src/data/districtNamesEn.ts", "utf8");
const table = (name) => {
  const i = names.indexOf(`export const ${name}`);
  if (i < 0) return null;
  const body = names.slice(i, names.indexOf("\n};", i));
  return new Set([...body.matchAll(/"([^"]+)": "[^"]+"/g)].map((m) => m[1]));
};

/** 관광공사에서 받아 둔 시·군·구 한자 표기 — 표 이름 → 그 표가 이미 아는 시·군·구. */
const CJK_KEYS = (() => {
  let got = {};
  try {
    got = JSON.parse(readFileSync("src/data/district-names-cjk.json", "utf8"))["이름"] ?? {};
  } catch {
    got = {}; // 아직 안 받았을 수 있다. 그러면 TS 에 적힌 것만 센다.
  }
  return {
    DISTRICT_NAME_JA: Object.keys(got.ja ?? {}),
    DISTRICT_NAME_ZH: Object.keys(got.zh ?? {}),
    DISTRICT_NAME_ZH_TW: Object.keys(got["zh-TW"] ?? {}),
  };
})();
for (const f of files) {
  const key = f.replace("-places.json", "");
  const C = city(key);
  if (!C) continue;
  for (const t of ["DISTRICT_NAME_EN", "DISTRICT_NAME_JA", "DISTRICT_NAME_ZH_TW", "DISTRICT_NAME_ZH"]) {
    const set = table(t);
    if (!set) { bad.push(`districtNamesEn.ts 에 ${t} 가 없다`); continue; }
    // 🪪 **한자 표는 파일 안에만 있는 게 아니다** (2026-10-01).
    //    districtNamesEn.ts 가 관광공사에서 받은 district-names-cjk.json 을 먼저 깔고,
    //    그 위에 손으로 확인한 것을 덮는다. 여기서 TS 글자만 세면 **받아 온 63곳이
    //    안 보여서** 「없다」고 말한다 — 화면에는 멀쩡히 나오는데 검사만 막는 꼴이다.
    for (const k of CJK_KEYS[t] ?? []) set.add(k);
    const miss = C.units.filter((u) => !set.has(u));
    if (!miss.length) continue;
    const line = `${t} 에 ${C.ko} ${miss.length}곳이 없다 — ${miss.join(" · ")}`;
    // 🪪 **로마자는 막고, 한자는 짚는다** (2026-10-01에 갈랐다).
    //
    //   그전에는 넷을 똑같이 막았다. 그래서 일곱 도시를 열었을 때 **한자를 확인하지
    //   못했다는 이유로 배포가 멈췄고**, 녹색을 되찾는 길이 두 가지뿐이었다 —
    //   한자를 **지어내거나**, 검사를 끄거나. 둘 다 틀린 선택이다.
    //
    //   가른 근거는 **화면이 어떻게 되나**다:
    //     · 로마자(EN)가 없으면 → 한자권이 아닌 아홉 언어가 **한글을 보게 된다.**
    //       그 손님은 읽을 방법이 없다. 그래서 **막는다.**
    //     · 한자(JA·ZH·ZH-TW)가 없으면 → 앱이 **로마자로 대신 보여 준다.**
    //       화면은 안 깨지고, 「Gyeongju-si」는 읽힌다. 모자란 것이지 고장이 아니다.
    //       그래서 **짚기만 한다** — 「빈 칸이 틀린 글자보다 낫다」는 원칙 그대로다.
    //
    //   ⚠️ 그래도 **조용히 넘기지 않는다.** 아래 줄이 몇 칸이 비었는지 세어 말하고,
    //      채우는 방법(Actions → Fetch tour names)까지 같이 적는다.
    if (t === "DISTRICT_NAME_EN") bad.push(line);
    else warn.push(line);
  }
}

// 🪪 한자가 모자란 것은 **막지 않고 짚는다**(위 주석). 그래도 몇 칸인지 세어 말한다.
if (warn.length) {
  const 빈칸 = warn.reduce((n, l) => n + Number(/ (\d+)곳이 없다/.exec(l)?.[1] ?? 0), 0);
  console.warn(`\n⚠️ 시·군·구 한자 표기가 ${빈칸}칸 비어 있다 — 그 동네는 **로마자로 보여 준다**(화면은 안 깨진다).`);
  for (const w of warn.slice(0, 12)) console.warn("   " + w);
  if (warn.length > 12) console.warn(`   … 그리고 ${warn.length - 12}줄 더`);
  console.warn(`   🪪 채우는 법: Actions → **Fetch tour names** (apply 켜기).`);
  console.warn(`      관광공사가 언어별로 내는 지역 목록을 **시군구 코드로** 이어 붙인다 — 지어내지 않는다.`);
}

if (bad.length) {
  console.error(`\n❌ 문제 ${bad.length}가지`);
  for (const b of bad.slice(0, 30)) console.error("   " + b);
  if (bad.length > 30) console.error(`   … 그리고 ${bad.length - 30}가지 더`);
  process.exit(1);
}
console.log(`\n✅ 도시 곳 목록 ${files.length}개 — 이상 없음`);
