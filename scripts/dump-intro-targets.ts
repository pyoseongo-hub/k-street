// 🎯 **속사정(detailIntro)을 물어볼 곳 목록을 내놓는다.**
//
//   npx vite build --ssr scripts/dump-intro-targets.ts --outDir dist-ssr
//   node dist-ssr/dump-intro-targets.js
//
// 왜 따로 만드나 — 관광공사에 물어보려면 **contentId** 가 있어야 하는데,
// 그 번호는 자료 파일 여러 군데에 흩어져 있다(tour-places-raw · tour-pool-all ·
// seed 의 tourContentId). 앱이 실제로 쓰는 목록(ALL_PLACES)을 한 번 훑어
// **id → contentId** 를 한 장으로 만든다. 스크립트마다 다시 뒤지지 않게.
//
// 🚨 **id 를 열쇠로 쓴다.** 이름을 열쇠로 쓰면 이름이 바뀌는 날(오늘 청량리가 그랬다)
//    자료가 통째로 남의 것이 되거나 사라진다. 이 저장소의 오랜 규칙이다.

import { ALL_PLACES } from "../src/data/seed";
import POOL from "../src/data/tour-pool-all.json";
import RAW from "../src/data/tour-places-raw.json";

interface Row {
  name?: string;
  contentId?: string | number;
}

/** 관광공사 자료는 갈래별 묶음이라, 펴서 **이름 → contentId** 로 찾을 수 있게 한다. */
const byName = new Map<string, string>();
function soak(o: unknown) {
  for (const arr of Object.values(o as Record<string, Row[]>)) {
    if (!Array.isArray(arr)) continue;
    for (const p of arr) {
      if (p.name && p.contentId) byName.set(p.name.normalize("NFC"), String(p.contentId));
    }
  }
}
soak(POOL);
soak(RAW);

export interface IntroTarget {
  id: string;
  name: string;
  gu: string;
  category: string;
  contentId: string;
}

export const TARGETS: IntroTarget[] = ALL_PLACES.flatMap((p) => {
  // 사람이 적어 둔 tourContentId 가 먼저다 — 합쳐진 곳은 이름이 달라졌을 수 있다.
  const cid = p.tourContentId ?? byName.get(p.name.normalize("NFC"));
  if (!cid) return [];
  return [{ id: p.id, name: p.name, gu: p.gu, category: p.category, contentId: String(cid) }];
});

const byCat = new Map<string, number>();
for (const t of TARGETS) byCat.set(t.category, (byCat.get(t.category) ?? 0) + 1);

console.log(`🎯 물어볼 곳 ${TARGETS.length}곳 / 전체 ${ALL_PLACES.length}곳`);
for (const [c, n] of [...byCat].sort((a, b) => b[1] - a[1])) console.log(`   ${c.padEnd(10)} ${n}`);
const missing = ALL_PLACES.length - TARGETS.length;
if (missing) console.log(`\n⚠️ contentId 를 못 찾은 곳 ${missing}곳 — 사람이 조사해 넣은 곳이다(관광공사에 없다)`);
