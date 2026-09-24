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

// 🚨 2026-09-12에 새는 자리를 찾았다 — **bad-coords.json 이 앱 화면만 지키고 있었다.**
//
//    관광공사가 준 좌표 중 「가리키는 곳 자체가 엉뚱한」 것은 bad-coords.json 에
//    적어 두고 앱이 읽을 때 뺀다(src/data/tourPlaces.ts). 그런데 **이 파일은**
//    tour-places-raw.json 에서 **좌표를 직접** 읽어서 그 필터를 **지나쳐 갔다.**
//    그래서 이 파일을 쓰는 것들(가까운 역 찾기·짐보관)은 **믿지 않기로 한 좌표를
//    그대로 쓰고 있었다.** 화면에는 안 보이니 티도 안 났다.
//
//    걸린 계기: 상가 두 곳이 「1.5km 안에 역이 없다」고 나왔다 —
//    한 곳은 중구 한복판, 한 곳은 김포공항역 위다. 좌표를 열어 보니
//    남중국해(19.69, 117.99)와 충남 아산(36.98, 126.93)이었다.
//
// 📌 **막는 자리는 한 곳이어야 한다.** 자료를 읽는 길이 둘이면 필터도 둘이 되고,
//    한쪽만 고쳐 놓고 다른 쪽이 새는 것이 오늘 일어난 일이다.
import { ALL_PLACES } from "../src/data/seed";
import { getCoords } from "../src/lib/coords";
import POOL from "../src/data/tour-pool-all.json";
import RAW from "../src/data/tour-places-raw.json";
import BAD from "../src/data/bad-coords.json";

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

/**
 * 🚫 **믿지 않기로 한 좌표의 열쇠**(`tour_<contentId>`). `_…`로 시작하는 것은 설명이다.
 *    tourPlaces.ts 의 BAD_COORDS 와 **같은 파일·같은 규칙**을 읽는다 — 갈리면 또 샌다.
 */
const DISTRUSTED = new Set(Object.keys(BAD as Record<string, unknown>).filter((k) => !k.startsWith("_")));
for (const key of DISTRUSTED) byContentId.delete(key.replace(/^tour_/, ""));

export interface PlaceCoord {
  id: string;
  name: string;
  gu: string;
  category: string;
  lat: number;
  lng: number;
  /** 좌표가 어디서 왔나 — 나중에 의심스러울 때 되짚을 수 있어야 한다 */
  from: "coords.json" | "self" | "tour";
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

  // 🚨 **곳이 좌표를 제 안에 들고 있으면 그걸 쓴다** (2026-09-24에 이걸로 데였다).
  //
  //    부산 202곳은 busan-places.json 에 **lat/lng 가 항목 안에 박혀** 있다.
  //    그런데 여기는 coords.json 과 관광공사 pool 두 군데만 보고 있었다 —
  //    **부산 곳이 통째로 「좌표 없음」으로 분류**되어, 이 파일을 쓰는 것들
  //    (가까운 역 찾기 · 짐보관)에서 **부산이 한 곳도 안 걸렸다.**
  //
  //    사장님이 Nearest station 을 **두 판 돌리고 210곳을 받았는데 부산은 0건**이었다.
  //    워크플로는 멀쩡했고 로그도 초록이었다. 새는 자리는 여기였다.
  //
  // ⚠️ **믿지 않기로 한 좌표는 여기서도 막는다.** 항목 안의 lat/lng 가 관광공사에서
  //    베껴 온 것일 수 있어서, 그대로 받으면 이 파일 머리말이 경고한 **두 번째 길**이
  //    또 생긴다. 그래서 distrust 를 먼저 본다 — 막는 자리는 한 곳이어야 한다.
  const own = p.lat != null && p.lng != null && !(cid && DISTRUSTED.has(`tour_${cid}`))
    ? { lat: p.lat, lng: p.lng }
    : undefined;
  if (own) {
    PLACES.push({ id: p.id, name: p.name, gu: p.gu, category: p.category, lat: own.lat, lng: own.lng, from: "self" });
    continue;
  }

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
  console.log(`  곳 자료 자체에서 ${PLACES.filter((p) => p.from === "self").length}`);
  console.log(`  관광공사에서    ${PLACES.filter((p) => p.from === "tour").length}`);
  if (missing.length) console.log(`⚠️ 좌표 없는 곳 ${missing.length}: ${missing.join(" · ")}`);
  console.log(`🚫 믿지 않기로 한 좌표 ${DISTRUSTED.size}곳은 뺐다 (src/data/bad-coords.json)`);
}
