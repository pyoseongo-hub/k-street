// 🖼️ **사진이 없는 곳을 센다** — 어디부터 채울지 고르려고.
//   npm run no-photo
import { ALL_PLACES } from "../src/data/seed";
import { ALL_FESTIVALS } from "../src/data/seed";
const 모두 = [...ALL_PLACES, ...ALL_FESTIVALS].filter(
  (p, i, a) => a.findIndex((x) => x.id === p.id) === i,
);
const 없 = 모두.filter((p) => !(p as { image?: string }).image && !(p as { thumb?: string }).thumb);
const 셈 = (목록: typeof 없, 키: (p: (typeof 없)[0]) => string) => {
  const m = new Map<string, number>();
  for (const p of 목록) m.set(키(p), (m.get(키(p)) ?? 0) + 1);
  return [...m].sort((a, b) => b[1] - a[1]);
};
console.log(`🖼️ 전체 ${모두.length}곳 · 사진 없는 곳 ${없.length}곳 (${Math.round((없.length / 모두.length) * 100)}%)\n`);
console.log("갈래별:");
for (const [k, v] of 셈(없, (p) => p.category)) console.log(`   ${k.padEnd(10)} ${v}`);
console.log("\n서울 안에서 구별 (많은 곳 10):");
for (const [k, v] of 셈(없.filter((p) => !(p as { city?: string }).city || (p as { city?: string }).city === "seoul"), (p) => p.gu).slice(0, 10))
  console.log(`   ${k.padEnd(10)} ${v}`);
