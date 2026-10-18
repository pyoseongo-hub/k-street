// 🖼️ **그림이 실제로 몇 곳을 덮었나** — 들어온 그림만 세어 진도를 본다.
import { ALL_PLACES, ALL_FESTIVALS } from "../src/data/seed";
import { 배너갈래고르기, 있는배너 } from "../src/lib/placeBanner";
const 모두 = [...ALL_PLACES, ...ALL_FESTIVALS].filter((p, i, a) => a.findIndex((x) => x.id === p.id) === i);
const 없 = 모두.filter((p) => !(p as { image?: string }).image && !(p as { thumb?: string }).thumb);
let 덮음 = 0;
const 아직 = new Map<string, number>();
for (const p of 없) {
  const g = 배너갈래고르기(p);
  if (g && 있는배너.has(g)) 덮음++;
  else 아직.set(g ?? "(갈래 없음)", (아직.get(g ?? "(갈래 없음)") ?? 0) + 1);
}
console.log(`🖼️ 사진 없는 곳 ${없.length}곳 · 그림이 뜨는 곳 ${덮음}곳 (${Math.round((덮음 / 없.length) * 100)}%)\n`);
if (아직.size) {
  console.log("아직 그림이 없어 빈 곳:");
  for (const [k, v] of [...아직].sort((a, b) => b[1] - a[1])) console.log(`   ${k.padEnd(20)} ${String(v).padStart(4)}곳`);
}
