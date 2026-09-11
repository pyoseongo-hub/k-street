import { ALL_PLACES } from "../src/data/seed";
import { districtOrigin, rankByDistance, toBands } from "../src/lib/districtDistance";

const GU = [...new Set(ALL_PLACES.map((p) => p.gu))].sort();
let noOrigin = 0, noCoord = 0;
console.log("구별 — 대표 역 · 좌표 있는 곳 · 띠 개수");
for (const gu of GU) {
  const ps = ALL_PLACES.filter((p) => p.gu === gu);
  const o = districtOrigin(ps);
  if (!o) { noOrigin++; console.log(`   ❌ ${gu.padEnd(6)} 대표 역 없음 (곳 ${ps.length})`); continue; }
  const r = rankByDistance(ps, o);
  if (!r.length) { noCoord++; console.log(`   ❌ ${gu.padEnd(6)} 좌표 있는 곳 0`); continue; }
  const b = toBands(r);
  const far = Math.round(r[r.length - 1].meters);
  console.log(
    `   ${gu.padEnd(6)} ${String(ps.length).padStart(3)}곳 · 좌표 ${String(r.length).padStart(3)} · ` +
    `띠 ${b.length}개 · 가장 먼 곳 ${far}m · 🚇 ${o.station} (${o.places}곳)`
  );
}
console.log(`\n대표 역 못 찾은 구: ${noOrigin} · 좌표 0인 구: ${noCoord}`);
