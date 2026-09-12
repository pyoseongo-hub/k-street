// 🚇 **가까운 지하철역을 우리 자료로 직접 계산한다** — 카카오를 안 부른다. (2026-09-12)
//
// 사장님: "진행중인가 내일로 할것인가"
//
// ─────────────────────────────────────────────────────────────────────────
// 🎯 왜 이 파일이 생겼나 — **카카오가 이제 필요 없어졌다**
// ─────────────────────────────────────────────────────────────────────────
//   원래(find-nearest-station.mjs)는 카카오에 좌표를 주고 「가까운 지하철역」을
//   물었다. 그 머리말에 이렇게 적혀 있다: **"역 목록이 필요 없다."**
//   그때는 역 목록이 없었기 때문이다.
//
//   그런데 **오늘 아침에 역 580곳을 받았다**(fetch-subway-stations.mjs,
//   서울 열린데이터광장). 이름·노선·**좌표**가 다 있다.
//   카카오가 주는 distance 도 **직선거리**라, 우리가 직접 재면 같은 값이 나온다.
//
//   그래서 바꾼다. 얻는 것:
//     · **한도가 없다.** 카카오 카테고리 검색은 2026-09-12에 하루치를 다 써서
//       상가 33곳이 **하루를 기다려야 하는 상황**이었다. 이제 그럴 일이 없다.
//     · **곧바로 끝난다.** 33곳이 1초. 카카오로는 판마다 1~15분이었다.
//     · **노선을 안다.** 카카오는 한 줄만 주는데 우리 자료는 환승 노선을 다 준다.
//
// 🚨 **그래도 카카오 쪽을 지우지 않는다.** 우리 역 목록에 빠진 역이 있다
//    (자양역 — 서울시 자료 784줄에 없다). 두 자료가 **서로를 검산**한다.
//    이 스크립트를 만들 때 **이미 아는 262곳을 다시 재서 카카오 답과 맞춰 봤다** —
//    그 숫자가 아래 --verify 가 하는 일이다. 맞지 않으면 고치고 나서 쓴다.
//
// ⚠️ 카카오가 주던 `url`(카카오맵 역 페이지)은 이 길로는 못 만든다.
//    화면은 `nearestStation()` 을 거치고 거기서 url 을 안 쓰므로 괜찮다.
//    옛 기록의 url 은 **덮지 않고 그대로 남긴다.**
//
//   node scripts/find-nearest-station-local.mjs --verify   # 아는 곳과 맞춰만 본다
//   node scripts/find-nearest-station-local.mjs            # 맛보기
//   node scripts/find-nearest-station-local.mjs --apply    # 파일에 씀

import { writeFileSync, readFileSync, existsSync } from "node:fs";

const APPLY = process.argv.includes("--apply");
const VERIFY = process.argv.includes("--verify");
const ALL = process.argv.includes("--all");
const OUT = "src/data/nearest-station.json";

const { PLACES } = await import("../dist-ssr/dump-place-coords.js").catch(() => ({ PLACES: null }));
if (!PLACES) {
  console.error("❌ dist-ssr/dump-place-coords.js 가 없다. 먼저:");
  console.error("   npx vite build --ssr scripts/dump-place-coords.ts --outDir dist-ssr");
  console.error("   node dist-ssr/dump-place-coords.js");
  process.exit(1);
}

const 역 = JSON.parse(readFileSync("src/data/subway-stations.json", "utf-8"))["역"] ?? {};
const STATIONS = Object.values(역).filter((v) => Number.isFinite(v.lat) && Number.isFinite(v.lng));
if (!STATIONS.length) {
  console.error("❌ subway-stations.json 에 역이 없다. Actions → Fetch subway stations 를 먼저 돌릴 것.");
  process.exit(1);
}

/** 두 점 사이 직선거리(m). 카카오 distance 와 같은 잣대다. */
function metres(aLat, aLng, bLat, bLng) {
  const R = 6371000;
  const r = (x) => (x * Math.PI) / 180;
  const dLat = r(bLat - aLat);
  const dLng = r(bLng - aLng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(r(aLat)) * Math.cos(r(bLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/**
 * 카카오가 적어 주던 것과 **같은 모양**으로 만든다: 「가양역 9호선」.
 *
 * 🚨 두 가지를 맞춰야 한다 — 안 맞추면 화면에서 역 이름이 통째로 안 붙는다
 *    (src/lib/stationName.ts 가 이 모양을 뜯어 읽는다):
 *    ① **「역」을 붙인다.** 서울시 자료는 「시청」·「종로3가」처럼 대개 안 붙어 있다.
 *    ② **노선은 하나만.** 환승역은 노선이 여럿인데, 숫자 노선을 먼저 고른다
 *       (「서울역 1호선」). 카카오도 한 줄만 줬다.
 */
function label(st) {
  // 🐞 **부역명(괄호)을 뗀다.** 서울시 자료는 「회현(남대문시장)」·「공릉(서울과학기술대)」
  //    처럼 괄호를 달아 준다. 그대로 두면 화면이 **괄호 안에 괄호**가 된다 —
  //    stationName.ts 가 한국어 이름을 괄호로 덧붙이기 때문이다:
  //        Hoehyeon Station Line 4 (회현(남대문시장)역)   ← 이렇게 나온다
  //    카카오가 적어 주던 모양(「회현역 4호선」)과도 이래야 같아진다.
  const bare = st.name.replace(/\([^)]*\)/g, "").trim();
  const name = bare.endsWith("역") ? bare : `${bare}역`;
  const numbered = st.lines.find((l) => /^\d{1,2}호선$/.test(l));
  const line = numbered ?? st.lines[0] ?? "";
  return line ? `${name} ${line}` : name;
}

// 1.5km 밖이면 "가깝다"고 할 수 없다 — 카카오 쪽과 같은 잣대를 쓴다.
const RADIUS = 1500;

function nearest(p) {
  let best = null;
  for (const st of STATIONS) {
    const d = metres(p.lat, p.lng, st.lat, st.lng);
    if (!best || d < best.d) best = { st, d };
  }
  if (!best || best.d > RADIUS) return null;
  return { station: label(best.st), dist: Math.round(best.d), lat: best.st.lat, lng: best.st.lng };
}

const oldRaw = existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf-8"))["곳"] ?? {} : {};

/**
 * 🚫 **믿지 않기로 한 좌표로 잰 역 기록은 버린다** (2026-09-12).
 *
 * 2026-09-10에 카카오로 받을 때는 bad-coords.json 이 이 길을 막지 않았다
 * (dump-place-coords.ts 머리말 참고). 그래서 **틀린 좌표로 잰 역**이 파일에 남았다:
 *
 *   「북악하늘길 하늘한마당~하늘마루」 → **동대문역 4호선 280m**
 *   성북동 산길인데 8km 떨어진 동대문이다. 화면에 그대로 나가고 있었다.
 *
 * 🚨 `nearestStation()` 은 **지금 좌표로 다시 재서** 낡은 기록을 걸러 내는데,
 *    좌표를 뺀 곳은 **잴 것이 없어서 그 검사를 통과해 버린다.** 그러니
 *    기록 자체를 없애는 수밖에 없다. 「역을 모른다」가 틀린 역보다 낫다.
 */
const BAD = JSON.parse(readFileSync("src/data/bad-coords.json", "utf-8"));
const 못믿을곳 = new Set(Object.keys(BAD).filter((k) => !k.startsWith("_")));
const 버린것 = Object.keys(oldRaw).filter((id) => 못믿을곳.has(id));
const old = Object.fromEntries(Object.entries(oldRaw).filter(([id]) => !못믿을곳.has(id)));
if (버린것.length) {
  console.log(`🚫 믿지 않기로 한 좌표로 잰 역 기록 ${버린것.length}곳을 버린다: ${버린것.join(" · ")}\n`);
}

// ── --verify: 카카오가 적어 둔 답과 맞춰 본다 ───────────────────────────
if (VERIFY) {
  let same = 0;
  const diff = [];
  let none = 0;
  for (const p of PLACES) {
    const r = old[p.id];
    if (!r || r.none || !r.station) continue;
    const mine = nearest(p);
    if (!mine) {
      none++;
      continue;
    }
    // 역 이름만 본다 — 좌표가 살짝 달라 거리는 몇 m 어긋날 수 있다.
    // 🐞 괄호(부역명)를 떼고 견준다 — 「회현」과 「회현(남대문시장)」은 같은 역이다.
    const bare = (s) => s.split(/\s+/)[0].replace(/\([^)]*\)/g, "").normalize("NFC");
    const a = bare(r.station);
    const b = bare(mine.station);
    if (a === b) same++;
    else diff.push({ name: p.name, 카카오: r.station, 우리: mine.station, 카거리: r.dist, 우거리: mine.dist });
  }
  const total = same + diff.length;
  console.log(`🔎 카카오가 적어 둔 ${total}곳을 우리 자료로 다시 재 봤다\n`);
  console.log(`   같은 역  ${same}곳  (${((same / total) * 100).toFixed(1)}%)`);
  console.log(`   다른 역  ${diff.length}곳`);
  if (none) console.log(`   우리 자료로는 1.5km 안에 역이 없다고 나온 곳  ${none}곳`);
  if (diff.length) {
    console.log("\n다른 곳:");
    for (const d of diff.slice(0, 40)) {
      console.log(`   ${d.name.padEnd(22)} 카카오 ${d.카카오}(${d.카거리}m)  ↔  우리 ${d.우리}(${d.우거리}m)`);
    }
    if (diff.length > 40) console.log(`   … ${diff.length - 40}곳 더`);
  }
  // 거리 차이도 본다 — 이름이 같아도 거리가 크게 다르면 좌표가 어긋난 것이다.
  const gaps = [];
  for (const p of PLACES) {
    const r = old[p.id];
    if (!r?.station || r.dist == null) continue;
    const mine = nearest(p);
    if (!mine) continue;
    const bare = (s) => s.split(/\s+/)[0].replace(/\([^)]*\)/g, "").normalize("NFC");
    if (bare(r.station) === bare(mine.station)) gaps.push(Math.abs(mine.dist - r.dist));
  }
  gaps.sort((a, b) => a - b);
  if (gaps.length) {
    const mid = gaps[Math.floor(gaps.length / 2)];
    console.log(`\n같은 역인 곳의 거리 차이 — 가운데값 ${mid}m · 가장 큰 것 ${gaps[gaps.length - 1]}m`);
  }
  process.exit(0);
}

// ── 채우기 ────────────────────────────────────────────────────────────
const out = { ...old };
const todo = ALL ? PLACES : PLACES.filter((p) => !old[p.id]);
let near = 0;
let far = 0;
console.log(`🚇 곳 ${PLACES.length}개 중 **${todo.length}곳**을 우리 자료로 계산한다 (역 ${STATIONS.length}곳 · 둘레 ${RADIUS}m)\n`);
for (const p of todo) {
  const mine = nearest(p);
  if (!mine) {
    far++;
    out[p.id] = { none: true };
    console.log(`   ⬜ ${p.name.padEnd(24)} 1.5km 안에 역이 없다 ← 이것도 답이다`);
    continue;
  }
  near++;
  // ⚠️ 옛 기록의 url 은 살려 둔다(카카오맵 역 페이지). 우리는 그걸 못 만든다.
  // 🏷️ **우리 계산으로 채운 것은 표를 달아 둔다.**
  //    카카오는 큰 환승역을 **노선별 출입구**로 갖고 있어 우리보다 촘촘하다
  //    (263곳을 맞춰 보니 91.3%는 같은 역인데, 다른 23곳은 우리가 더 멀게 나왔다).
  //    그래서 카카오 답이 있으면 그쪽이 낫다 — 이 표가 있는 곳만
  //    나중에 카카오에게 **다시 물어** 덧쓴다(find-nearest-station.mjs).
  out[p.id] = { ...mine, local: true, ...(old[p.id]?.url ? { url: old[p.id].url } : {}) };
  console.log(`   ✅ ${p.name.padEnd(24)} ${mine.station.padEnd(18)} ${mine.dist}m`);
}
console.log(`\n역을 찾은 곳 ${near} · 1.5km 안에 역이 없는 곳 ${far}`);

if (!APPLY) {
  console.log("\n📋 맛보기다(apply 를 안 켰다). 위 목록을 보고 켤 것.");
  process.exit(0);
}
writeFileSync(
  OUT,
  JSON.stringify(
    { 받은날: new Date().toISOString().slice(0, 10), 출처: "서울 열린데이터광장 지하철역 좌표로 직접 계산 (옛 기록은 카카오 지역검색)", 곳: out },
    null,
    2,
  ) + "\n",
);
console.log(`\n📄 ${OUT} 에 ${Object.keys(out).length}곳을 적었다 (이번에 ${near + far}곳).`);
