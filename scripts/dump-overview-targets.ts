// 📝 **관광공사 소개글(overview)을 물어볼 곳 목록** — 사진도 설명도 없는 곳.
//
//   npx vite build --ssr scripts/dump-overview-targets.ts --outDir dist-ssr
//   node dist-ssr/dump-overview-targets.js
//
// 사장님 (2026-10-26): *"텍스트로 채워 / 이미지 없어도 번역도"* · *"50개씩 진행하고 보고"*.
// 사진 게이트를 풀자 글자 카드로 나온 516곳 중 **415곳이 설명 한 줄도 없었다** —
// 이름과 구만 있는 카드는 손님에게 「여기가 뭐 하는 곳인지」를 말해 주지 못한다.
//
// 🎯 대상: 앱에 나오는 곳(ALL_PLACES) 중 **사진 없음 · 설명 없음 · contentId 있음**.
//    서울을 먼저, 그다음 다른 시·도. contentId 를 찾는 법은 dump-intro-targets.ts 와 같다.

import { ALL_PLACES } from "../src/data/seed";
import POOL from "../src/data/tour-pool-all.json";
import RAW from "../src/data/tour-places-raw.json";

const byName = new Map<string, string>();
for (const o of [POOL, RAW]) {
  for (const arr of Object.values(o as Record<string, { name?: string; contentId?: string | number }[]>)) {
    if (!Array.isArray(arr)) continue;
    for (const p of arr) if (p.name && p.contentId) byName.set(p.name.normalize("NFC"), String(p.contentId));
  }
}

export interface OverviewTarget {
  id: string;
  name: string;
  city: string;
  gu: string;
  category: string;
  contentId: string;
}

export const TARGETS: OverviewTarget[] = ALL_PLACES.filter((p) => !(p.image ?? p.thumb) && !p.note)
  .flatMap((p) => {
    const cid = p.tourContentId ?? byName.get(p.name.normalize("NFC")) ?? (/^\d+$/.test(p.id) ? p.id : undefined);
    if (!cid) return [];
    return [{ id: p.id, name: p.name, city: p.city ?? "seoul", gu: p.gu, category: p.category, contentId: String(cid) }];
  })
  .sort((a, b) => Number(b.city === "seoul") - Number(a.city === "seoul"));

console.log(`🎯 소개글을 물어볼 곳 ${TARGETS.length}곳 (서울 ${TARGETS.filter((t) => t.city === "seoul").length})`);
