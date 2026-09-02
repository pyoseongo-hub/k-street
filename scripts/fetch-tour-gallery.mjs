#!/usr/bin/env node
// 📷 한 곳에 딸린 **사진 여러 장**을 관광공사에서 전수로 받아온다 (2026-09-02 사용자 지시:
// "사진 이쁜걸로 교체 / 전수조사 / 지금것보다 여기가 퀄리티좋다").
//
// 무엇이 문제였나 —
// 지금 앱이 쓰는 사진은 목록 API(areaBasedList2)가 주는 **대표 이미지 한 장**(firstimage)뿐이다.
// 그런데 관광콘텐츠랩(api.visitkorea.or.kr)을 열어 보면 한 곳에 사진이 여러 장 있다.
// 사용자가 캡처한 '북한산 둘레길'은 여덟 장이 넘었고, 그중에는 대표 이미지보다 훨씬
// 나은 풍경 사진이 있었다. 대표 이미지는 축제의 경우 **포스터**인 경우도 많다
// (정조대왕 능행차·서울건축문화제가 그랬다) — 손님이 보고 싶은 건 포스터가 아니다.
//
// 그래서 detailImage2로 곳마다 사진을 전부 받아 두고, 화면에서 고를 수 있게 한다.
//
//   TOUR_API_KEY=키 node scripts/fetch-tour-gallery.mjs --limit 20   # 맛보기(저장 안 함)
//   TOUR_API_KEY=키 node scripts/fetch-tour-gallery.mjs --apply      # 전수 + 저장
//
// 결과는 src/data/tour-gallery.json에 contentId를 열쇠로 저장한다.
// 전부 공공누리 제1유형(한국관광공사)이라 출처만 밝히면 상업적 이용도 된다.
//
// ⚠️ 이 세션(샌드박스)은 apis.data.go.kr에 접속이 막혀 있어 직접 못 돌린다.
//    .github/workflows/fetch-tour-gallery.yml 로 GitHub Actions에서 돌린다.

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const D = (f) => join(__dirname, "..", "src", "data", f);
const OUT = D("tour-gallery.json");

const API_KEY = process.env.TOUR_API_KEY;
if (!API_KEY) {
  console.error("TOUR_API_KEY 환경변수가 없다.");
  process.exit(1);
}

const args = process.argv.slice(2);
const APPLY = args.includes("--apply");
const argVal = (n) => {
  const i = args.indexOf(n);
  return i >= 0 ? args[i + 1] : null;
};
const LIMIT = Number(argVal("--limit")) || (APPLY ? Infinity : 20);

const ROOT = "https://apis.data.go.kr/B551011/KorService2";

async function callTourApi(path, extraParams) {
  // serviceKey를 URLSearchParams에 안 넣는 이유는 fetch-coords.mjs 주석 참고
  // (data.go.kr '일반 인증키'가 이미 URL 인코딩된 값이라 이중 인코딩되면 깨진다).
  const params = new URLSearchParams({
    MobileOS: "ETC",
    MobileApp: "KStreet",
    _type: "json",
    ...extraParams,
  });
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(`${ROOT}/${path}?serviceKey=${API_KEY}&${params.toString()}`, {
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const items = data?.response?.body?.items?.item;
    return !items ? [] : Array.isArray(items) ? items : [items];
  } finally {
    clearTimeout(timer);
  }
}

// ── 사진을 받을 대상: contentId가 있는 곳 전부 ──────────────────
const raw = JSON.parse(readFileSync(D("tour-places-raw.json"), "utf-8"));
const targets = [];
const seen = new Set();
for (const [category, arr] of Object.entries(raw)) {
  for (const p of arr) {
    if (!p.contentId || seen.has(p.contentId)) continue;
    seen.add(p.contentId);
    targets.push({ contentId: String(p.contentId), name: p.name, gu: p.gu ?? "", category });
  }
}

const prev = existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf-8")) : {};
// 이미 받아 둔 곳은 건너뛴다 — 다시 돌려도 호출을 낭비하지 않는다.
const todo = targets.filter((t) => !prev[t.contentId]).slice(0, LIMIT);

console.log(
  `사진을 받을 곳 ${targets.length}곳 중 ${todo.length}곳 처리 (${APPLY ? "저장함" : "맛보기 — 저장 안 함"})\n`
);

const result = { ...prev };
let withMany = 0;
let withNone = 0;
let total = 0;

for (const t of todo) {
  try {
    // imageYN=Y : 그 콘텐츠에 등록된 **사진** 목록. (N이면 지도 이미지가 온다)
    const items = await callTourApi("detailImage2", {
      contentId: t.contentId,
      imageYN: "Y",
      numOfRows: "30",
      pageNo: "1",
    });
    const photos = items
      .map((it) => ({
        // originimgurl이 원본(큰 것), smallimageurl이 썸네일이다.
        url: it.originimgurl || it.smallimageurl,
        thumb: it.smallimageurl || it.originimgurl,
        name: it.imgname || undefined,
      }))
      .filter((p) => p.url);

    if (!photos.length) {
      withNone++;
      console.log(`⬜ ${t.gu.padEnd(5)} ${t.name} — 사진 없음`);
    } else {
      if (photos.length > 1) withMany++;
      total += photos.length;
      result[t.contentId] = { name: t.name, gu: t.gu, category: t.category, photos };
      console.log(`✅ ${t.gu.padEnd(5)} ${t.name} — ${photos.length}장`);
    }
  } catch (err) {
    console.log(`❌ ${t.gu.padEnd(5)} ${t.name} — 오류: ${err.message}`);
  }
  await new Promise((r) => setTimeout(r, 120));
}

console.log(`\n사진 ${total}장 · 두 장 이상인 곳 ${withMany}곳 · 사진 없는 곳 ${withNone}곳`);

if (!APPLY) {
  console.log("맛보기만 했다 — 저장하려면 --apply를 붙일 것.");
  process.exit(0);
}

writeFileSync(OUT, JSON.stringify(result, null, 2) + "\n");
console.log(`tour-gallery.json에 ${Object.keys(result).length}곳을 저장했다.`);
