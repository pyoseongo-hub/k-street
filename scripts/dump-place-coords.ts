// 📍 **곳마다 좌표를 하나로 모아 내놓는다.**
//
// 왜 (2026-09-10): 좌표가 **두 군데**에 흩어져 있다 —
//   · src/data/coords.json      사람이 카카오·네이버로 확인해 둔 것 (36곳)
//   · 관광공사 자료 (tour-pool-all · tour-places-raw)  contentId 로 붙는다 (+247곳)
//
// 둘을 합치면 **285곳 중 283곳(99%)**에 좌표가 생긴다. 한쪽만 보면 13%다.
// 이걸 몰라서 「근처 짐보관」을 못 만들 뻔했다.
//
//   npx vite build --ssr scripts/dump-place-coords.ts --outDir dist-ssr
//   node dist-ssr/dump-place-coords.js

import { ALL_PLACES } from "../src/data/seed";
import { getCoords } from "../src/lib/coords";
import POOL from "../src/data/tour-pool-all.json";
import RAW from "../src/data/tour-places-raw.json";

interface Row {
  contentId?: string | number;
  lat?: number;
  lng?: number;
}

/** 관광공사 자료는 갈래별 묶음이라 펴서 contentId 로 찾을 수 있게 한다. */
const byContentId = new Map<string, { lat: number; lng: number }>();
function soak(o: unknown) {
  for (const arr of Object.values(o as Record<string, Row[]>)) {
    if (!Array.isArray(arr)) continue;
    for (const p of arr) if (p.contentId && p.lat && p.lng) byContentId.set(String(p.contentId), { lat: p.lat, lng: p.lng });
  }
}
soak(POOL);
soak(RAW);

export interface PlaceCoord {
  id: string;
  name: string;
  gu: string;
  category: string;
  lat: number;
  lng: number;
  /** 좌표가 어디서 왔나 — 나중에 의심스러울 때 되짚을 수 있어야 한다 */
  from: "coords.json" | "tour";
}

export const PLACES: PlaceCoord[] = [];
const missing: string[] = [];

for (const p of ALL_PLACES) {
  const c = getCoords(p.id, p.name);
  if (c) {
    PLACES.push({ id: p.id, name: p.name, gu: p.gu, category: p.category, lat: c.lat, lng: c.lng, from: "coords.json" });
    continue;
  }
  const cid = (p as { tourContentId?: string }).tourContentId;
  const t = cid ? byContentId.get(String(cid)) : undefined;
  if (t) {
    PLACES.push({ id: p.id, name: p.name, gu: p.gu, category: p.category, lat: t.lat, lng: t.lng, from: "tour" });
    continue;
  }
  missing.push(`${p.category}/${p.name}`);
}

// 이 파일을 직접 돌리면 숫자를 찍어 준다. 다른 스크립트가 불러 쓰면 조용하다.
if (process.argv[1]?.includes("dump-place-coords")) {
  console.log(`곳 ${ALL_PLACES.length}개 · 좌표 있는 곳 ${PLACES.length}개 (${Math.round((PLACES.length / ALL_PLACES.length) * 100)}%)`);
  console.log(`  coords.json 에서 ${PLACES.filter((p) => p.from === "coords.json").length}`);
  console.log(`  관광공사에서    ${PLACES.filter((p) => p.from === "tour").length}`);
  if (missing.length) console.log(`⚠️ 좌표 없는 곳 ${missing.length}: ${missing.join(" · ")}`);
}
