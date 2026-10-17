// 🌏 사진 없는 곳이 **서울 안인가 밖인가** — 그림에 서울 랜드마크를 넣어도 되는지 가른다.
import { ALL_PLACES, ALL_FESTIVALS } from "../src/data/seed";
const 모두 = [...ALL_PLACES, ...ALL_FESTIVALS].filter((p, i, a) => a.findIndex((x) => x.id === p.id) === i);
const 없 = 모두.filter((p) => !(p as { image?: string }).image && !(p as { thumb?: string }).thumb);
const m = new Map<string, number>();
for (const p of 없) {
  const c = (p as { city?: string }).city ?? "seoul";
  m.set(c, (m.get(c) ?? 0) + 1);
}
const 서울 = m.get("seoul") ?? 0;
console.log(`🖼️ 사진 없는 곳 ${없.length}곳\n`);
for (const [k, v] of [...m].sort((a, b) => b[1] - a[1])) console.log(`   ${k.padEnd(12)} ${String(v).padStart(4)}곳`);
console.log(`\n   서울 ${서울}곳 · 서울 밖 ${없.length - 서울}곳 (${Math.round(((없.length - 서울) / 없.length) * 100)}%)`);
