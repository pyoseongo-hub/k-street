// 🚇 **서울 지하철역 — 노선·좌표·영중일 이름을 받아 온다.**
//
// 사장님이 잡아 주신 3단계 중 셋째 (docs/비오는날-계획.md):
//   "1번 자료수집 / 2번 자료에 맞는 코스 만들기 / **지하철 코스로 만들기**"
//
// ─────────────────────────────────────────────────────────────────────────
// 🎯 왜 이 둘을 한 번에 받나
// ─────────────────────────────────────────────────────────────────────────
//   서울 열린데이터광장에 **이름을 직접 두드려서** 찾았다(probe-seoul-api.mjs).
//   쓸 만한 것이 둘이고, **서로 없는 것을 채워 준다**:
//
//     subwayStationMaster        784줄 · BLDN_NM · ROUTE · **LAT · LOT**
//     SearchSTNBySubwayLineInfo  799줄 · STATION_NM · LINE_NUM ·
//                                        **STATION_NM_ENG / CHN / JPN**
//
//   · 좌표는 앞쪽에만 있다 → **노선 위의 순서**(서쪽→동쪽)를 계산할 수 있다.
//   · 외국어 이름은 뒤쪽에만 있다 → 지금 12개 언어 페이지에 역 이름이
//     **한국어로만** 나오는 것을 고칠 수 있다.
//
// ⚠️ **한국어 이름은 그대로 같이 둔다.** 손님이 역무원이나 안내판에 대조해야 한다
//    (한식 메뉴 이름을 그대로 두는 것과 같은 이유).
//
// 🚨 **두 표를 이름으로 맞춘다 — 여기가 틀리기 쉬운 자리다.**
//    한쪽은 「서울역」, 다른 쪽은 「서울」처럼 **「역」이 붙고 안 붙고**가 다르고,
//    괄호로 부역명을 단 것(「동대문역사문화공원(DDP)」)이 있다. 맞추기 전에 턴다.
//    ⚠️ NFC 먼저 — 자모 분해형은 화면에 같아 보여도 다른 문자열이다.
//
// 🚨 **환승역은 노선마다 줄이 따로 온다.** 「서울역 1호선」·「서울역 4호선」이
//    다른 줄이다. 우리는 **역 하나에 노선 목록**으로 모은다 — 안 그러면
//    「9호선 코스」를 만들 때 같은 역이 두 번 나온다.

import { writeFileSync } from "node:fs";

const KEY = process.env.SEOUL_OPEN_API_KEY ?? "";
if (!KEY) {
  console.error("❌ SEOUL_OPEN_API_KEY 가 없다 — 워크플로에 시크릿을 넘겼는지 볼 것.");
  process.exit(1);
}
const APPLY = process.argv.includes("--apply");
const OUT = "src/data/subway-stations.json";

// 🕵️ UA 를 안 보내면 /json/ 을 달라고 해도 **XML 이 온다**(2026-09-12에 80번 헛돌았다).
const UA =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36";
const API = "http://openapi.seoul.go.kr:8088";

/** 한 번에 1,000줄까지 준다. 끝까지 받아 이어 붙인다. */
async function all(service) {
  const rows = [];
  for (let start = 1; start < 3001; start += 1000) {
    const url = `${API}/${KEY}/json/${service}/${start}/${start + 999}/`;
    const res = await fetch(url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(30000) });
    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(`${service}: JSON 이 아니다 — ${text.slice(0, 140).replace(/\s+/g, " ")}`);
    }
    const box = data[service] ?? data;
    const code = box?.RESULT?.CODE ?? data?.RESULT?.CODE;
    if (code && code !== "INFO-000") {
      if (code === "INFO-200") break; // 더 없다
      throw new Error(`${service}: ${code} ${box?.RESULT?.MESSAGE ?? ""}`);
    }
    const got = box?.row ?? [];
    rows.push(...got);
    if (got.length < 1000) break;
  }
  return rows;
}

/**
 * 역 이름 맞추기용 열쇠.
 * 「역」을 떼고, 괄호 속 부역명을 떼고, 기호·공백을 턴다.
 *   서울역 / 서울            → 서울
 *   동대문역사문화공원(DDP)  → 동대문역사문화공원
 */
function key(name) {
  return String(name ?? "")
    .normalize("NFC")
    .replace(/\([^)]*\)/g, "")
    .replace(/역$/, "")
    .replace(/[^0-9A-Za-z가-힣]/g, "")
    .trim();
}

/** 「01호선」·「1호선」·「수인분당선」을 보기 좋게. 숫자만 있으면 「N호선」. */
function line(v) {
  const s = String(v ?? "").trim();
  const m = /^0?(\d{1,2})호선$/.exec(s);
  return m ? `${Number(m[1])}호선` : s;
}

console.log("🚇 서울 지하철역 자료를 받는다\n");

const master = await all("subwayStationMaster"); // BLDN_NM · ROUTE · LAT · LOT
console.log(`  subwayStationMaster        ${master.length}줄`);
const names = await all("SearchSTNBySubwayLineInfo"); // STATION_NM · LINE_NUM · ENG/CHN/JPN
console.log(`  SearchSTNBySubwayLineInfo  ${names.length}줄\n`);

/** 열쇠 → 외국어 이름. 같은 역이 노선마다 반복되므로 **먼저 온 것만** 쓴다. */
const foreign = new Map();
for (const r of names) {
  const k = key(r.STATION_NM);
  if (!k || foreign.has(k)) continue;
  foreign.set(k, {
    en: String(r.STATION_NM_ENG ?? "").trim(),
    zh: String(r.STATION_NM_CHN ?? "").trim(),
    ja: String(r.STATION_NM_JPN ?? "").trim(),
  });
}

/** 열쇠 → 역 하나. 환승역은 **노선 목록**으로 모은다. */
const out = {};
for (const r of master) {
  const k = key(r.BLDN_NM);
  const lat = Number(r.LAT);
  const lng = Number(r.LOT);
  if (!k || !Number.isFinite(lat) || !Number.isFinite(lng)) continue;
  // 서울 밖 좌표가 섞이면 노선 순서가 통째로 틀어진다 — 넉넉히 잡되 걸러 둔다.
  if (lat < 37.2 || lat > 37.75 || lng < 126.6 || lng > 127.3) continue;
  const ln = line(r.ROUTE);
  if (!out[k]) out[k] = { name: String(r.BLDN_NM).normalize("NFC"), lines: [], lat, lng };
  if (ln && !out[k].lines.includes(ln)) out[k].lines.push(ln);
}
// 외국어 이름을 붙인다
let withForeign = 0;
for (const [k, v] of Object.entries(out)) {
  const f = foreign.get(k);
  if (!f) continue;
  if (f.en) v.en = f.en;
  if (f.zh) v.zh = f.zh;
  if (f.ja) v.ja = f.ja;
  if (f.en || f.zh || f.ja) withForeign++;
}

const n = Object.keys(out).length;
const transfer = Object.values(out).filter((v) => v.lines.length > 1).length;
const byLine = new Map();
for (const v of Object.values(out)) for (const l of v.lines) byLine.set(l, (byLine.get(l) ?? 0) + 1);

console.log(`역 ${n}곳 · 환승역 ${transfer}곳 · 외국어 이름이 붙은 곳 ${withForeign}곳\n`);
console.log("노선별 역 수:");
for (const [l, c] of [...byLine].sort((a, b) => b[1] - a[1]).slice(0, 14)) {
  console.log(`  ${l.padEnd(12)} ${c}`);
}

// 🔎 눈으로 한 번 본다 — 숫자만 맞고 내용이 엉뚱한 경우가 있다.
console.log("\n맛보기:");
for (const k of ["서울", "강남", "합정", "가양", "충정로"]) {
  const v = out[k];
  if (!v) { console.log(`  ${k} — 없다`); continue; }
  console.log(`  ${v.name.padEnd(8)} ${v.lines.join("·").padEnd(14)} ${v.lat},${v.lng}  ${v.en ?? "?"} / ${v.ja ?? "?"} / ${v.zh ?? "?"}`);
}

if (!n) {
  console.log("\n🚨 한 곳도 못 받았다. 키나 서비스 이름을 볼 것.");
  process.exit(1);
}
if (!APPLY) {
  console.log("\n📋 맛보기다(apply 를 안 켰다). 위 숫자를 보고 켤 것.");
  process.exit(0);
}
writeFileSync(
  OUT,
  JSON.stringify(
    { 받은날: new Date().toISOString().slice(0, 10), 출처: "서울 열린데이터광장 subwayStationMaster + SearchSTNBySubwayLineInfo", 역: out },
    null,
    1,
  ) + "\n",
);
console.log(`\n✅ ${OUT} 에 ${n}곳을 적었다`);
