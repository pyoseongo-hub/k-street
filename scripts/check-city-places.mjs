#!/usr/bin/env node
// 🧾 **새 도시 곳 목록이 성한가.** 푸시마다 돈다. 관광공사를 부르지 않는다.
//
// 여기서 보는 것은 **화면을 열어 봐도 안 보이는 사고**들이다:
//   ① id 가 겹치나 — 겹치면 **지운 곳의 사진이 새 곳에 붙는다**(케이푸드에서 당했다)
//   ② 동네 이름이 명부(cities.ts)에 있나 — 없으면 화면에 자리가 없어 조용히 사라진다
//   ③ 사진 주소가 http 인가 — https 페이지에서 http 사진은 **오류 없이 안 보인다**
//   ④ 좌표가 그 도시 안에 있나 — 한 곳이 엉뚱한 데 찍히면 길찾기가 손님을 딴 데로 보낸다
import { readdirSync, readFileSync } from "node:fs";

const cities = readFileSync("src/data/cities.ts", "utf8");
function city(key) {
  const b = cities.split(/\n  \{\n/).slice(1).find((x) => new RegExp(`key: "${key}"`).test(x));
  if (!b) return null;
  return {
    ko: b.match(/ko:\s*"([^"]+)"/)?.[1],
    lat: Number(b.match(/lat:\s*([\d.]+)/)?.[1]),
    lng: Number(b.match(/lng:\s*([\d.]+)/)?.[1]),
    units: [...(b.match(/units:\s*\[([\s\S]*?)\]/)?.[1] ?? "").matchAll(/"([^"]+)"/g)].map((m) => m[1]),
  };
}

// 🗺️ 잣대는 만드는 쪽과 **같은 파일**에서 가져온다 — 둘이 다르면 반쪽 적용이 생긴다.
import { distanceKm as km, MAX_KM } from "./lib/city-geo.mjs";

const seen = new Map();   // id → 어디서 나왔나
const bad = [];
// 서울 id 도 함께 넣어 **도시끼리 겹치는 것**을 잡는다.
for (const [k, v] of Object.entries(JSON.parse(readFileSync("src/data/tour-places-raw.json", "utf8"))))
  for (const p of v) seen.set(String(p.contentId), `서울 ${k}`);

const files = readdirSync("src/data").filter((f) => /-places\.json$/.test(f));
for (const f of files) {
  const key = f.replace("-places.json", "");
  const C = city(key);
  if (!C) { bad.push(`${f} — cities.ts 에 「${key}」가 없다`); continue; }
  const list = JSON.parse(readFileSync(`src/data/${f}`, "utf8"));
  let far = 0, noPic = 0, noXY = 0;
  for (const p of list) {
    if (seen.has(p.id)) bad.push(`${f} — id ${p.id} 가 이미 있다 (${seen.get(p.id)} · ${p.name})`);
    else seen.set(p.id, `${key} ${p.name}`);
    if (!C.units.includes(p.gu)) bad.push(`${f} — ${p.name}: 「${p.gu}」는 ${C.ko} 명부에 없다`);
    if (/^http:/.test(p.image ?? "") || /^http:/.test(p.thumb ?? ""))
      bad.push(`${f} — ${p.name}: 사진 주소가 http 다 (https 화면에서 안 보인다)`);
    // 좌표가 **없는 것**은 문제가 아니다 — 만드는 쪽이 일부러 버린 것일 수 있다
    // (관광공사가 틀린 값을 준 곳). 주소로 길을 찾는다. 세어서 보여만 준다.
    if (p.lat == null || p.lng == null) noXY++;
    else if (km(C.lat, C.lng, p.lat, p.lng) > MAX_KM) {
      far++;
      bad.push(`${f} — ${p.name}: ${C.ko} 시청에서 ${Math.round(km(C.lat, C.lng, p.lat, p.lng))}km 떨어져 있다`);
    }
    if (!p.image) noPic++;
  }
  console.log(`📋 ${f} — ${list.length}곳 · 사진 ${list.length - noPic} · 좌표 ${list.length - noXY} · 도시 밖 좌표 ${far}`);
}

if (bad.length) {
  console.error(`\n❌ 문제 ${bad.length}가지`);
  for (const b of bad.slice(0, 30)) console.error("   " + b);
  if (bad.length > 30) console.error(`   … 그리고 ${bad.length - 30}가지 더`);
  process.exit(1);
}
console.log(`\n✅ 도시 곳 목록 ${files.length}개 — 이상 없음`);
