#!/usr/bin/env node
// 🧳 **짐 보관함 — 서울 밖 여덟 도시에도 있나 찾아본다.** (2026-10-01)
//
// 사장님: *"기능은 서울에서처럼 카카오 네이버 지하철 있는데는 서치해
//          보관함 등 자료 있으면 있는 만큼 해"*
//
// 지금 짐 보관 단추는 **서울에서만** 뜬다(src/lib/seoulOnly.ts). 그건 또타러기지가
// **서울메트로 역에만** 있어서 내린 결정이고, 그 결정 자체는 여전히 맞다.
// 다만 또타러기지가 없다는 것이 **보관함이 없다**는 뜻은 아니다. 그래서 찾아본다.
//
// ─────────────────────────────────────────────────────────────────────────
// 🚨 **자리를 내 기억으로 찍지 않는다 — 우리 자료에서 뽑는다.**
// ─────────────────────────────────────────────────────────────────────────
//   서울판(survey-luggage-data.mjs)은 「명동역·홍대입구역…」 열여섯 곳을 손으로 적었다.
//   서울은 내가 아는 동네라 그게 됐지만, 거제·영주·남원에 손님이 어디로 모이는지는
//   **내가 모른다.** 모르는 것을 찍으면 엉뚱한 자리만 뒤지고 「없다」고 적게 된다.
//
//   그래서 닻을 **우리 곳 목록에서** 뽑는다:
//     · 🚇 가까운 역이 있는 곳 → 그 **역**을 닻으로 (손님은 역에서 내려 걷는다)
//     · 🏪 시장·거리·상점 → 그 **곳**을 닻으로 (역이 없는 도시의 번화가다)
//   둘 다 우리가 이미 받아 둔 자료라 근거가 있고, 도시가 늘어도 손댈 게 없다.
//
// ⚠️ **아무것도 앱에 바로 띄우지 않는다.** 받은 것을 파일로 적어 두고(후보),
//    무엇을 쓸지는 사람이 본 뒤에 정한다 — 서울판과 같은 규칙이다.
//    카카오는 「짐프리」(여행자용)와 「박스풀 공유창고」(월세)를 **같은 업종**으로
//    돌려준다. 업종으로는 못 가른다. 그래서 창고쪽 말로도 찾아 표를 달아 둔다.
//
// 실행:
//   KAKAO_REST_API_KEY=… node scripts/survey-city-luggage.mjs                # 전부
//   KAKAO_REST_API_KEY=… node scripts/survey-city-luggage.mjs --city busan   # 한 도시
//   KAKAO_REST_API_KEY=… node scripts/survey-city-luggage.mjs --apply        # 파일에 적는다
//
// 🚨 카카오는 **분당 한도**가 있다. 몰아치면 전부 400이 온다(2026-09-12에 당했다).
//    GAP_MS 로 쉬어 가고, 한도라고 하면 기다렸다 다시 묻는다.

import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { readCities } from "./lib/city-registry.mjs";
import { argValue } from "./lib/args.mjs";

const KEY = process.env.KAKAO_REST_API_KEY ?? "";
const APPLY = process.argv.includes("--apply");
// 🎚️ 🐞 **여기가 조용히 터졌던 자리다.** `--city` 를 안 주면 indexOf 가 -1 이라
//    argv[0](node 실행 파일 경로)이 들어와 **여덟 도시를 전부 건너뛰었다.**
//    카카오를 한 번도 안 부르고 29초에 끝났는데 워크플로는 초록불이었다.
//    자세한 것은 lib/args.mjs 머리말에.
const ONLY = argValue("--city");
const GAP_MS = Number(process.env.GAP_MS ?? 300);
const LIMIT = Number(process.env.LIMIT ?? 0); // 닻을 몇 개까지만 (0 = 전부)
const OUT = "src/data/city-luggage-candidates.json";

if (!KEY) {
  console.error("❌ KAKAO_REST_API_KEY 가 없다. 워크플로에 시크릿을 넘겼는지 볼 것.");
  process.exit(1);
}

const { PLACES } = await import("../dist-ssr/dump-place-coords.js").catch(() => ({ PLACES: null }));
if (!PLACES) {
  console.error("❌ dist-ssr/dump-place-coords.js 가 없다. 먼저 좌표를 뽑아야 한다:");
  console.error("   npx vite build --ssr scripts/dump-place-coords.ts --outDir dist-ssr");
  console.error("   node dist-ssr/dump-place-coords.js");
  process.exit(1);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** 받은 것 / 못 받은 것을 **갈라서** 돌려준다 — 섞으면 「없다」고 잘못 적는다. */
async function kakao(params) {
  const url = `https://dapi.kakao.com/v2/local/search/keyword.json?${new URLSearchParams(params)}`;
  for (let try_ = 0; ; try_++) {
    try {
      const r = await fetch(url, {
        headers: { Authorization: `KakaoAK ${KEY}` },
        signal: AbortSignal.timeout(20000),
      });
      const text = await r.text();
      if (!r.ok) {
        // 🚨 「API limit has been exceeded」는 답이 아니라 「조금 있다 다시 물어」다.
        const limited = /API limit has been exceeded/i.test(text) || r.status === 429;
        if (limited && try_ < 3) {
          await sleep(2000 * 2 ** try_);
          continue;
        }
        return { got: true, ok: false, why: `HTTP ${r.status} — ${text.slice(0, 100)}` };
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

// 🧳 보관함을 찾는 말. 서울판과 **같은 목록**이다 — 갈리면 도시끼리 비교가 안 된다.
const TERMS = ["물품보관함", "코인락커", "짐보관"];
// 🏚️ 월세 창고를 가려 낼 반대쪽 말. 여기 걸린 곳에는 표를 달아 둔다(자동으로 빼지 않는다).
const NEGATIVE = ["셀프스토리지", "공유창고", "개인창고"];
// 🏪 역이 없는 도시의 번화가 — 시장·거리·상점을 닻으로 쓴다.
const ANCHOR_CATS = new Set(["market", "street", "shop"]);
// 캐리어를 끌고 갈 거리. 가까운 역 기준(1.5km)보다 짧게 본다 — 보관함은 역 바로 옆이다.
const RADIUS = 800;

const CITIES = readCities().filter((c) => c.status === "공개");
const 역표 = existsSync("src/data/nearest-station.json")
  ? JSON.parse(readFileSync("src/data/nearest-station.json", "utf-8"))["곳"] ?? {}
  : {};
const 구에서도시 = new Map();
for (const c of CITIES) for (const u of c.units) 구에서도시.set(u, c.key);

/** 그 도시의 닻 목록 — 역이 먼저, 없으면 번화가. 같은 자리는 한 번만. */
function anchorsFor(cityKey) {
  const mine = PLACES.filter((p) => 구에서도시.get(p.gu) === cityKey);
  const out = new Map();
  for (const p of mine) {
    const 역 = 역표[p.id];
    if (역?.station && 역.lat && 역.lng) {
      // 🚇 역을 닻으로. 환승역은 호선마다 줄이 달라도 자리는 거의 같으니 이름으로 묶는다.
      const 이름 = 역.station.split(/\s+/)[0];
      if (!out.has(`역:${이름}`)) out.set(`역:${이름}`, { kind: "역", name: 이름, lat: 역.lat, lng: 역.lng });
    } else if (ANCHOR_CATS.has(p.category)) {
      out.set(`곳:${p.name}`, { kind: "번화가", name: p.name, lat: p.lat, lng: p.lng });
    }
  }
  return [...out.values()];
}

const 결과 = {
  설명:
    "카카오 지역검색으로 찾은 **짐 보관함 후보**. 아직 앱에 안 띄운다 — 사람이 고른 뒤에 쓴다. " +
    "닻(어디 둘레를 뒤졌나)은 우리 곳 자료에서 뽑았다(가까운 역 > 시장·거리·상점).",
  받은날: new Date().toISOString().slice(0, 10),
  출처: "카카오 지역검색 (dapi.kakao.com/v2/local/search/keyword.json)",
  잣대: { 둘레_m: RADIUS, 검색어: TERMS, 창고쪽_검색어: NEGATIVE },
  도시: {},
};

let 부름 = 0;
let 못물어봄 = 0;

for (const city of CITIES) {
  if (ONLY && city.key !== ONLY) continue;
  if (city.key === "seoul") continue; // 서울은 이미 따로 있다(luggage-candidates.json)
  const anchors0 = anchorsFor(city.key);
  const anchors = LIMIT > 0 ? anchors0.slice(0, LIMIT) : anchors0;
  console.log(
    `\n═══ ${city.ko} — 닻 ${anchors0.length}개` +
      (anchors.length < anchors0.length ? ` (이번 판은 ${anchors.length}개)` : "") +
      ` · 역 ${anchors.filter((a) => a.kind === "역").length} · 번화가 ${anchors.filter((a) => a.kind === "번화가").length} ═══`
  );
  if (!anchors.length) {
    console.log("   닻이 없다 — 가까운 역도, 시장·거리·상점도 없다. 먼저 그걸 채워야 한다.");
    결과.도시[city.key] = { 이름: city.ko, 닻: 0, 곳: [], 못물어본_닻: 0 };
    continue;
  }

  const 곳 = new Map(); // 카카오 id → 한 줄 (도시 안에서 겹치는 것을 한 번만)
  let 실패닻 = 0;

  for (const a of anchors) {
    const 창고쪽 = new Set();
    let 이닻실패 = false;
    for (const term of NEGATIVE) {
      await sleep(GAP_MS);
      부름++;
      const r = await kakao({ query: term, x: String(a.lng), y: String(a.lat), radius: String(RADIUS), size: "15", sort: "distance" });
      if (!r.got) { 이닻실패 = true; 못물어봄++; continue; }
      if (r.ok) for (const d of r.docs) 창고쪽.add(d.id);
    }
    for (const term of TERMS) {
      await sleep(GAP_MS);
      부름++;
      const r = await kakao({ query: term, x: String(a.lng), y: String(a.lat), radius: String(RADIUS), size: "15", sort: "distance" });
      if (!r.got) { 이닻실패 = true; 못물어봄++; continue; }
      if (!r.ok) { console.log(`   ⟨${a.name} / ${term}⟩ ❌ ${r.why}`); 이닻실패 = true; continue; }
      for (const d of r.docs) {
        if (곳.has(d.id)) continue;
        곳.set(d.id, {
          닻: a.name,
          닻종류: a.kind,
          이름: d.place_name,
          업종: d.category_name,
          지번: d.address_name,
          도로명: d.road_address_name || "",
          전화: d.phone || "",
          거리_m: Number(d.distance),
          // ⚠️ 창고쪽 말로도 걸린 곳. 월세 창고일 수 있다 — 자동으로 빼지 않는다.
          창고쪽: 창고쪽.has(d.id),
          lat: Number(d.y),
          lng: Number(d.x),
          url: d.place_url,
        });
      }
    }
    // 🚨 못 물어본 닻을 세어 둔다. 「0곳」이 **없다**는 뜻인지 **못 봤다**는 뜻인지
    //    가르는 유일한 단서다(서울판에서 이 둘을 섞어 헛짚었다).
    if (이닻실패) 실패닻++;
  }

  const list = [...곳.values()].sort((x, y) => x.거리_m - y.거리_m);
  const 창고 = list.filter((x) => x.창고쪽).length;
  결과.도시[city.key] = { 이름: city.ko, 닻: anchors.length, 못물어본_닻: 실패닻, 곳: list };
  console.log(
    `   찾은 곳 ${list.length}개 (창고쪽 표 ${창고}개)` +
      (실패닻 ? `  ⚠️ 못 물어본 닻 ${실패닻}개 — 「없다」고 적지 말 것` : "")
  );
  for (const x of list.slice(0, 8)) {
    console.log(`      · ${x.이름} — ${x.거리_m}m (${x.닻})${x.창고쪽 ? " ⚠️창고쪽" : ""}`);
    console.log(`        업종: ${x.업종} · ${x.도로명 || x.지번}`);
  }
  if (list.length > 8) console.log(`      … 그리고 ${list.length - 8}곳 더 (파일에 다 있다)`);
}

// 🚨 **한 도시도 안 봤으면 초록불을 주지 않는다** (2026-10-01에 당하고 넣었다).
//    `--city` 를 잘못 읽어 여덟 도시를 전부 건너뛰었는데 **exit 0 에 파일까지 저장**됐다.
//    `"도시": {}` 만 들어 있는 파일이 커밋되고 워크플로는 성공으로 떴다.
//    「아무것도 안 했다」와 「해 봤더니 없더라」는 **다른 말**이다 — 섞이면 아무도 모른다.
if (!Object.keys(결과.도시).length) {
  console.error(
    `\n❌ **한 도시도 보지 않았다.** 찾을 도시가 하나도 안 걸렸다는 뜻이다.\n` +
      `   · --city 에 적은 열쇠(${ONLY || "(없음)"})가 cities.ts 에 있는지\n` +
      `   · cities.ts 에 status: "공개" 인 도시가 서울 말고 또 있는지\n` +
      `   둘을 보라. 「없다」가 아니라 **안 봤다**이므로 저장하지 않는다.`
  );
  process.exit(1);
}

console.log("\n═══ 합계 ═══");
for (const [k, v] of Object.entries(결과.도시)) {
  console.log(
    `${v.이름.padEnd(8)} 닻 ${String(v.닻).padStart(3)} → 보관함 후보 ${String(v.곳.length).padStart(3)}곳` +
      (v.못물어본_닻 ? `  ⚠️ 못 물어본 닻 ${v.못물어본_닻}` : "")
  );
}
console.log(`\n카카오를 ${부름}번 불렀다` + (못물어봄 ? ` · 그중 ${못물어봄}번은 **못 물어봤다**` : ""));

if (!APPLY) {
  console.log(`\n맛보기입니다 — 저장하지 않았습니다. 적으려면 --apply 를 붙이세요.`);
  process.exit(0);
}
writeFileSync(OUT, JSON.stringify(결과, null, 2) + "\n", "utf-8");
console.log(`\n저장: ${OUT}`);
console.log("⚠️ 이건 **후보**다. 앱에 띄우기 전에 사람이 고른다 — 월세 창고가 섞여 있다.");
