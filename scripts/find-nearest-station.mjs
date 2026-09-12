#!/usr/bin/env node
// 🚇 **곳마다 가장 가까운 지하철역을 찾아 둔다.** (2026-09-10)
//
// 왜 (사장님):
//   "가까운 지하철역 없으면 소비자가 알아야지 거긴 없구나 / 대부분 지하 타니 가까운 지하철"
//
//   이 한 줄이 막혀 있던 걸 풀었다. 나는 **또타라커 273개 역 목록**을 구하려고
//   공식 페이지를 뒤지고 있었는데(없었다), 사실 필요한 건 그게 아니었다:
//
//   · 손님은 대부분 지하철로 움직인다
//   · 또타라커는 **273개 역**에 있다 — 역을 알면 보관함은 거의 따라온다
//   · 그리고 **역이 멀면 「여긴 없구나」를 아는 것 자체가 쓸모**다.
//     빈칸이 아니라 **답**이다 — "미리 맡기고 오세요"가 되니까
//
// 🔑 역 목록이 필요 없다. 카카오에 **좌표를 주고 「가까운 지하철역」**을 물으면 된다.
//    category_group_code=SW8 이 지하철역이다.
//
// ⚠️ 여기서 가져오는 것은 **역과 거리**뿐이다. 그 역에 보관함이 있는지는
//    **모른다** — 273/약 340역이라 대부분 있지만 전부는 아니다.
//    화면에서 "있습니다"라고 하지 않는다. 그건 지어내는 것이다.
//
//   KAKAO_REST_API_KEY=xxx node scripts/find-nearest-station.mjs            # 맛보기
//   KAKAO_REST_API_KEY=xxx node scripts/find-nearest-station.mjs --apply    # 파일에 씀

// ─────────────────────────────────────────────────────────────────────────
// 🚨 2026-09-12에 한 번 크게 당할 뻔했다 — 세 가지를 여기서 고쳤다.
// ─────────────────────────────────────────────────────────────────────────
//   상가 33곳을 새로 넣고 다시 돌렸더니 **317곳이 전부 실패**했다:
//       ❌ 퇴계로 오토바이상가 — HTTP 400 — "API limit has been exceeded."
//
//   ① **분당 한도였다.** 바로 뒤 또타러기지 6곳은 **같은 키로 성공**했다 —
//      실패는 09:18:16~09:19:15, 성공은 **그 다음 분**이었다. 일일 한도면
//      6곳도 막힌다. 317건을 **0.18초 간격**으로 몰아친 것이 원인이다.
//      → `GAP_MS` 로 쉬어 가고, 한도라고 하면 **기다렸다 다시 묻는다.**
//
//   ② 🚨 **실패해도 가진 것을 잃지 않는다.** 그전에는 받은 것만으로 파일을
//      **새로 썼다.** 그날 `apply` 를 켰더라면 이미 아는 262곳이
//      **텅 빈 채로 커밋**됐을 것이다. 맛보기 먼저 돌리는 규칙이 자료를 구했다.
//      → 이제 **기존 파일에 합친다.** 못 물어본 곳은 **옛 값이 그대로 남는다.**
//
//   ③ **이미 아는 곳은 안 묻는다**(`--all` 로 전부 다시 받을 수 있다).
//      새로 들어온 33곳만 물으면 호출이 317 → 33으로 줄어 한도에 안 닿는다.
//      곳이 움직이지 않는 한 역도 안 바뀐다 — 해마다 한 번 `--all` 이면 된다.

import { writeFileSync, readFileSync, existsSync } from "node:fs";

const KEY = process.env.KAKAO_REST_API_KEY ?? "";
const APPLY = process.argv.includes("--apply");
/** 이미 아는 곳까지 전부 다시 받는다(좌표를 크게 고친 뒤에만 쓴다). */
const ALL = process.argv.includes("--all");
/** 🐢 호출 사이에 쉬는 시간(ms). 분당 한도에 안 닿게 하는 유일한 장치다. */
const GAP_MS = Number(process.env.GAP_MS ?? 250);
const OUT = "src/data/nearest-station.json";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

if (!KEY) {
  console.error("❌ KAKAO_REST_API_KEY 가 없다. Actions 시크릿을 워크플로에 넘겼는지 볼 것.");
  process.exit(1);
}

// 곳과 좌표는 만들어 둔 파일에서 읽는다 (scripts/dump-place-coords 가 만든다).
const { PLACES } = await import("../dist-ssr/dump-place-coords.js").catch(() => ({ PLACES: null }));
if (!PLACES) {
  console.error("❌ dist-ssr/dump-place-coords.js 가 없다. 먼저 좌표를 뽑아야 한다:");
  console.error("   npx vite build --ssr scripts/dump-place-coords.ts --outDir dist-ssr");
  console.error("   node dist-ssr/dump-place-coords.js");
  process.exit(1);
}

/**
 * 받은 것 / 못 받은 것을 갈라서 돌려준다 — 섞으면 "없다"고 잘못 적는다.
 *
 * 🚨 **「API limit has been exceeded」는 답이 아니라 「조금 있다 다시 물어」다.**
 *    이걸 실패로 세면 그 곳은 「역이 없다」가 되어 **화면에 틀린 말이 나간다.**
 *    분당 한도라 **몇 초만 쉬면 풀린다** — 2초 · 4초 · 8초로 세 번 더 물어본다.
 */
async function kakao(params) {
  const url = `https://dapi.kakao.com/v2/local/search/category.json?${new URLSearchParams(params)}`;
  for (let try_ = 0; ; try_++) {
    try {
      const r = await fetch(url, {
        headers: { Authorization: `KakaoAK ${KEY}` },
        signal: AbortSignal.timeout(20000),
      });
      const text = await r.text();
      if (!r.ok) {
        const limited = /API limit has been exceeded/i.test(text) || r.status === 429;
        if (limited && try_ < 3) {
          await sleep(2000 * 2 ** try_);
          continue;
        }
        return { got: true, ok: false, why: `HTTP ${r.status} — ${text.slice(0, 100)}`, limited };
      }
      return { got: true, ok: true, docs: JSON.parse(text).documents ?? [] };
    } catch (e) {
      if (try_ < 3) {
        await sleep(2000 * 2 ** try_);
        continue;
      }
      return { got: false, ok: false, why: e?.cause?.code || e?.name || e?.message };
    }
  }
}

// 1.5km 밖이면 "가깝다"고 할 수 없다. 캐리어를 끌고 갈 거리가 아니다.
const RADIUS = 1500;

// 🚨 **가진 것부터 깔고 시작한다.** 이 판에서 못 물어본 곳은 옛 값이 그대로 남는다
//    (머리말 ②). 실패한 판이 자료를 지우는 일은 이제 없다.
const old = existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf-8"))["곳"] ?? {} : {};
const out = { ...old };

// 이미 아는 곳은 안 묻는다 — 곳이 움직이지 않는 한 역도 안 바뀐다(머리말 ③).
const 남은곳 = ALL ? PLACES : PLACES.filter((p) => !old[p.id]);
/**
 * ✂️ **한 판에 몇 곳까지만** (사장님 2026-09-12: "잘라서 해").
 *
 * 한 판을 짧게 끊으면 세 가지가 좋다:
 *   ① **결과를 빨리 본다.** 15분을 기다려서 「전부 실패」를 아는 것보다,
 *      1분에 10곳을 보고 되는지 안 되는지 아는 편이 낫다.
 *   ② **한도를 조금씩 쓴다.** 하루치를 한 판에 다 태우지 않는다.
 *   ③ **받은 것은 남는다.** 이 스크립트는 합쳐서 쓰므로(머리말 ②)
 *      끊어서 여러 번 돌려도 앞판이 받은 것이 안 사라진다.
 */
const LIMIT = Number(process.env.LIMIT ?? 0);
const todo = LIMIT > 0 ? 남은곳.slice(0, LIMIT) : 남은곳;
let near = 0;
let far = 0;
let failed = 0;
let limitHit = 0;
const buckets = { 300: 0, 500: 0, 1000: 0, 1500: 0 };

console.log(`🚇 곳 ${PLACES.length}개 중 역을 모르는 곳 ${남은곳.length}곳 — 이번 판에 **${todo.length}곳**을 묻는다 (둘레 ${RADIUS}m)`);
if (LIMIT > 0 && 남은곳.length > todo.length) {
  console.log(`   ✂️ 한 판에 ${LIMIT}곳까지만 (LIMIT). 남는 ${남은곳.length - todo.length}곳은 **다시 돌리면 이어진다** — 받은 것은 합쳐서 쓴다`);
}
console.log(`   호출 사이 ${GAP_MS}ms 쉰다 (카카오는 **분당 한도**가 있다)\n`);

/**
 * 🛑 **연달아 한도가 오면 바로 멈춘다** (2026-09-12에 15분을 헛돌았다).
 *
 * 한 곳마다 2·4·8초를 기다렸다 다시 묻는데, 한도가 안 풀린 상태면
 * 그걸 55번 되풀이한다 = **13분을 기다려서 「전부 실패」를 아는 것**이다.
 * 다섯 번 내리 막히면 **오늘은 안 열린 것**이다 — 그때는 바로 나와서
 * 사람에게 알린다. 받은 곳은 이미 `out` 에 있으니 잃는 게 없다.
 */
const GIVE_UP_AFTER = 5;
let streak = 0;

let first = true;
for (const p of todo) {
  if (streak >= GIVE_UP_AFTER) {
    console.log(`\n🛑 카카오가 **${GIVE_UP_AFTER}번 내리** 한도라고 했다 — 오늘은 안 열린다. 여기서 멈춘다.`);
    console.log(`   남은 ${남은곳.length - (near + far + failed)}곳은 **내일 다시 돌리면 이어진다.**`);
    break;
  }
  if (!first) await sleep(GAP_MS);
  first = false;
  const r = await kakao({
    category_group_code: "SW8",
    x: String(p.lng),
    y: String(p.lat),
    radius: String(RADIUS),
    size: "1",
    sort: "distance",
  });

  if (!r.got) {
    failed++;
    console.log(`   ❌ ${p.name} — 카카오에 **못 물어봤다** (${r.why}). 역이 없다는 뜻이 아니다`);
    continue;
  }
  if (!r.ok) {
    failed++;
    if (r.limited) {
      limitHit++;
      streak++;
    } else streak = 0;
    console.log(`   ❌ ${p.name} — ${r.why}`);
    continue;
  }
  streak = 0; // 한 번이라도 답이 오면 다시 센다 — 「연달아」가 뜻이 있으려면 끊겨야 한다
  if (!r.docs.length) {
    far++;
    // 🚨 이건 **빈칸이 아니라 답**이다. 화면에서 "가까운 역이 없습니다"라고 말해 준다.
    out[p.id] = { none: true };
    continue;
  }

  const d = r.docs[0];
  const dist = Number(d.distance);
  for (const b of [300, 500, 1000, 1500]) {
    if (dist <= b) {
      buckets[b]++;
      break;
    }
  }
  near++;
  out[p.id] = {
    // 역 이름은 한국어 그대로 — 손님이 역 표지판에서 그 글자를 찾는다
    station: d.place_name,
    dist,
    lat: Number(d.y),
    lng: Number(d.x),
    url: d.place_url,
  };
}

console.log(`\n가까운 역이 있는 곳  ${near}`);
for (const b of [300, 500, 1000, 1500]) console.log(`   ${String(b).padStart(4)}m 안  ${buckets[b]}`);
console.log(`${RADIUS}m 안에 역이 없는 곳  ${far}   ← 이것도 답이다("미리 맡기고 오세요")`);
if (failed) console.log(`❌ 못 물어본 곳  ${failed}  — 다시 돌릴 것 (옛 값은 그대로 남는다)`);
if (limitHit) {
  console.log(
    `\n🚨 그중 ${limitHit}곳은 **카카오 분당 한도**에 걸린 것이다 — 우리 코드나 키가 틀린 게 아니다.` +
      `\n   GAP_MS 를 올려서(지금 ${GAP_MS}ms) 다시 돌리면 된다. 받은 곳은 이미 파일에 남는다.`,
  );
}

if (APPLY) {
  // 🚨 **합쳐서 쓴다.** 이 판에서 못 받은 곳은 옛 값이 그대로다(머리말 ②).
  writeFileSync(OUT, JSON.stringify({ 받은날: new Date().toISOString().slice(0, 10), 출처: "카카오 지역검색 (SW8 지하철역)", 곳: out }, null, 2) + "\n");
  console.log(`\n📄 ${OUT} 에 ${Object.keys(out).length}곳을 적었다 (이번에 새로 받은 것 ${near + far}곳).`);
} else {
  console.log("\n(맛보기였다. 파일에 쓰려면 --apply)");
}
