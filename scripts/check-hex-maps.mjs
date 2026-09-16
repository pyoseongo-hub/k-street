#!/usr/bin/env node
// 🧾 **육각형 지도에 적힌 동네가 명부와 맞나.**
//
// 이름 하나가 다르면 그 동네가 **화면에서 조용히 빠진다** — 벌집에 구멍이 나는데
// 앱을 열어 봐도 「원래 그런가 보다」 싶다. 서울에서 이미 같은 걱정을 적어 뒀고
// (seoulHexMap.ts: "원소가 정확히 같아야 한다"), 사람 눈으로는 25개도 못 세었다.
import { readFileSync } from "node:fs";

const cities = readFileSync("src/data/cities.ts", "utf8");
const hex = readFileSync("src/data/cityHexMaps.ts", "utf8")
  + readFileSync("src/data/seoulHexMap.ts", "utf8");

function unitsOf(key) {
  const b = cities.split(/\n  \{\n/).slice(1).find((x) => new RegExp(`key: "${key}"`).test(x));
  if (!b) return null;
  return [...(b.match(/units:\s*\[([\s\S]*?)\]/)?.[1] ?? "").matchAll(/"([^"]+)"/g)].map((m) => m[1]);
}
// cityHexMaps.ts 의 `키: 배열이름` 짝에서 어느 도시가 어느 배열을 쓰는지 읽는다.
const pairs = [...hex.matchAll(/^\s{2}(\w+): ([A-Z_]+),$/gm)].map((m) => [m[1], m[2]]);
let bad = 0;
for (const [key, arrName] of pairs) {
  const units = unitsOf(key);
  if (!units) { console.error(`❌ cities.ts 에 「${key}」가 없다`); bad++; continue; }
  // 🚨 **선언부를 찾는다.** 처음엔 이름만 찾았는데, `import { SEOUL_HEX_ROWS ... }`
  //    줄에 먼저 걸려서 **엉뚱한 배열(부산)을 서울 것으로 읽고 있었다.**
  //    돌려 보지 않았으면 「서울 지도에 25곳 중 23곳이 없다」는 거짓 경고를 믿을 뻔했다.
  const decl = new RegExp(`const ${arrName}\\s*(?::[^=]*)?=\\s*\\[`);
  const at = hex.search(decl);
  if (at < 0) { console.error(`❌ ${arrName} 선언을 못 찾았다`); bad++; continue; }
  const block = hex.slice(at);
  const gus = [...block.slice(0, block.indexOf("];")).matchAll(/"([^"]+)"/g)].map((m) => m[1]);
  const missing = units.filter((u) => !gus.includes(u));
  const extra = gus.filter((g) => !units.includes(g));
  const dup = gus.filter((g, i) => gus.indexOf(g) !== i);
  console.log(`📋 ${key} — 지도 ${gus.length}칸 / 명부 ${units.length}곳`);
  if (missing.length) { console.error(`   ❌ 지도에 없는 동네: ${missing.join(" · ")}`); bad++; }
  if (extra.length) { console.error(`   ❌ 명부에 없는 이름: ${extra.join(" · ")}`); bad++; }
  if (dup.length) { console.error(`   ❌ 두 번 적힌 동네: ${dup.join(" · ")}`); bad++; }
}
if (!pairs.length) { console.error("❌ 도시별 배치를 한 개도 못 읽었다 — 파일 모양이 바뀌었나?"); bad++; }
if (bad) process.exit(1);
console.log("\n✅ 육각형 지도 — 명부와 정확히 맞는다");
