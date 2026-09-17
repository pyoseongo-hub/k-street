#!/usr/bin/env node
// 🎪 **부산 축제를 「부산광역시」에서 직접 받아온다.**
//
// ── 왜 관광공사만으로는 모자란가 (2026-09-17에 숫자로 확인) ──────────────
//   관광공사(searchFestival2, 지역 6)로 받은 부산 축제는 **14곳**이다.
//   그런데 그 14곳에 **부산국제영화제도, 부산불꽃축제도, 부산바다축제도 없다.**
//   부산에 축제가 없어서가 아니라, 관광공사 축제 창구는 「등록한 곳」만 나오는
//   자리이기 때문이다. 손님이 「부산 하면 떠올리는 것」이 통째로 빠져 있으면
//   달·계절 화면이 부산에서는 거짓말이 된다.
//
//   부산광역시가 자기 축제를 직접 올리는 창구가 따로 있다 —
//   공공데이터포털 「부산광역시_부산축제정보 서비스」.
//   구청 축제를 서울시 문화포털에서 받아오는 것과 **같은 생각**이다
//   (scripts/fetch-gu-festival-dates.ts 머리말): 주최자가 올린 자리가 가장 빠르고 정확하다.
//
// ── 🪪 활용신청이 있어야 열린다 ──────────────────────────────────────────
//   공공데이터포털은 **계정마다 인증키가 하나**이고, 그 키로 열리는 창구는
//   「활용신청」을 눌러 승인받은 것뿐이다. 승인 전에는 SERVICE_KEY_IS_NOT_REGISTERED 로
//   막힌다 — **키가 틀린 게 아니다.** 열렸는지는 `scripts/probe-datagokr.mjs` 로 잰다.
//   ⏳ 화면에 [승인]이 떠도 창구에 반영되기까지 시간이 걸린다(포털 안내: 최대 1시간).
//
// ── 돌리는 법 ────────────────────────────────────────────────────────────
//   맛보기(저장 안 함) — 무엇이 오는지 표로 보여 준다:
//     TOUR_API_KEY=키 node scripts/fetch-busan-festivals.mjs
//   날것 보기 — 창구가 준 칸 이름을 **그대로** 찍는다(칸 이름을 추측하지 않으려고 둔다):
//     TOUR_API_KEY=키 node scripts/fetch-busan-festivals.mjs --dump
//   저장:
//     TOUR_API_KEY=키 node scripts/fetch-busan-festivals.mjs --apply
//
//   🚨 **`--apply` 는 맛보기를 보고 나서 켠다.** 이 저장소의 규칙이다.
//
// 결과는 src/data/busan-festivals.json (공공누리 1유형 — 출처 표시 필수, 비밀값 아님).

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { fetchWithRetry } from "./lib/tour-fetch.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "src", "data", "busan-festivals.json");
const BUSAN_PLACES = join(ROOT, "src", "data", "busan-places.json");

const APPLY = process.argv.includes("--apply");
const DUMP = process.argv.includes("--dump");

const KEY = process.env.TOUR_API_KEY;
if (!KEY) {
  console.error("❌ TOUR_API_KEY 가 없다. 예) TOUR_API_KEY=xxxx node scripts/fetch-busan-festivals.mjs");
  process.exit(1);
}

const BASE = "https://apis.data.go.kr/6260000/FestivalService/getFestivalKr";

/**
 * 창구에 물어본다.
 * 🚨 **인증키를 URLSearchParams 에 넣지 않는다.** 공공데이터포털 인증키는 이미 URL
 *    인코딩된 값이라(%2B·%2F·%3D) 한 번 더 인코딩되면 깨진다. 이 저장소가 한 번
 *    당한 자리다(probe-datagokr.mjs 주석).
 */
async function call(pageNo, numOfRows) {
  const params = new URLSearchParams({ pageNo: String(pageNo), numOfRows: String(numOfRows), resultType: "json" });
  const res = await fetchWithRetry(`${BASE}?serviceKey=${KEY}&${params.toString()}`);
  const text = await res.text();
  if (/SERVICE_KEY_IS_NOT_REGISTERED/.test(text)) {
    throw new Error(
      "활용신청이 안 돼 있다 — 공공데이터포털에서 「부산광역시_부산축제정보 서비스」에 활용신청을 누르면 된다.\n" +
        "   (화면에 [승인]이 떠 있어도 창구에 반영되기까지 최대 1시간 걸린다. probe-datagokr 로 다시 재 볼 것)"
    );
  }
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`JSON 이 아니다 — 앞 200자: ${text.slice(0, 200)}`);
  }
  return data;
}

/**
 * 부산시 창구들은 답을 `{ getFestivalKr: { header, body: { items: [...] } } }` 꼴로 주는데,
 * 서비스마다 껍데기 이름이 조금씩 다르다. **이름을 외워서 꺼내지 않는다** —
 * 배열이 들어 있는 자리를 찾아 쓴다. 껍데기가 바뀌어도 안 깨지고,
 * 무엇보다 **내가 칸 이름을 추측해서 틀리는 일**을 막는다.
 */
function findItems(data) {
  let found = null;
  let total = null;
  (function walk(node) {
    if (found || node == null || typeof node !== "object") return;
    for (const [k, v] of Object.entries(node)) {
      if (/^totalCount$/i.test(k) && total == null) total = Number(v);
      if (Array.isArray(v) && v.length && typeof v[0] === "object") {
        found = v;
        return;
      }
      if (v && typeof v === "object") walk(v);
    }
  })(data);
  // 1건만 올 때는 배열이 아니라 객체로 온다 — 공공데이터포털 전체가 그렇다.
  if (!found) {
    const one = (function pick(node) {
      if (node == null || typeof node !== "object") return null;
      if (node.item && typeof node.item === "object") return [node.item];
      for (const v of Object.values(node)) {
        const r = pick(v);
        if (r) return r;
      }
      return null;
    })(data);
    if (one) found = one;
  }
  return { items: found ?? [], total };
}

/** 여러 후보 칸 이름 중 **값이 실제로 있는** 첫 칸을 쓰고, 어느 칸을 썼는지 기억한다. */
function pick(row, candidates, used, label) {
  for (const c of candidates) {
    for (const k of Object.keys(row)) {
      if (k.toUpperCase() !== c.toUpperCase()) continue;
      const v = row[k];
      if (v == null) continue;
      const s = String(v).trim();
      if (!s || s === "null") continue;
      used.set(label, k);
      return s;
    }
  }
  return undefined;
}

/** "2026-10-01" · "20261001" · "2026.10.01" 을 모두 YYYYMMDD 로. 못 읽으면 undefined. */
function toYmd(s) {
  if (!s) return undefined;
  const d = String(s).replace(/[^0-9]/g, "");
  if (d.length < 8) return undefined;
  const ymd = d.slice(0, 8);
  const m = Number(ymd.slice(4, 6));
  const day = Number(ymd.slice(6, 8));
  if (m < 1 || m > 12 || day < 1 || day > 31) return undefined;
  return ymd;
}

const main = async () => {
  // 먼저 1건만 불러 총 건수를 본다 — 몇 쪽인지 모르고 100씩 긁으면 호출을 버린다.
  const first = await call(1, 1);
  if (DUMP) {
    const three = await call(1, 3);
    console.log("🧾 창구가 준 날것 (칸 이름을 추측하지 않으려고 그대로 찍는다):\n");
    console.log(JSON.stringify(three, null, 1));
    return;
  }
  const { total } = findItems(first);
  const totalCount = Number.isFinite(total) ? total : 0;
  if (!totalCount) {
    console.log("⚠️ 총 건수가 0이다. --dump 로 창구가 무엇을 주는지 먼저 볼 것.");
    return;
  }
  console.log(`📡 부산광역시 축제정보 — 총 ${totalCount}건`);

  const rows = [];
  const PER = 100;
  for (let page = 1; (page - 1) * PER < totalCount; page++) {
    const data = await call(page, PER);
    const { items } = findItems(data);
    rows.push(...items);
    console.log(`   ${page}쪽 — ${items.length}건 (누적 ${rows.length})`);
    if (!items.length) break;
  }

  // ── 앱이 쓰는 모양으로 바꾼다 ──────────────────────────────────────────
  const used = new Map();
  const made = [];
  const 버린것 = [];
  for (const row of rows) {
    const name = pick(row, ["MAIN_TITLE", "TITLE", "FESTIVAL_NM", "SUBTITLE"], used, "이름");
    const gu = pick(row, ["GUGUN_NM", "GUGUN", "SIGUNGU_NM"], used, "구");
    const addr = pick(row, ["ADDR1", "ADDR", "PLACE_ADDR", "ROAD_ADDR"], used, "주소");
    const place = pick(row, ["PLACE", "PLACE_NM", "LOCATION"], used, "장소");
    const start = toYmd(pick(row, ["START_DATE", "FESTIVAL_START_DATE", "USAGE_DAY", "BEGIN_DE"], used, "시작"));
    const end = toYmd(pick(row, ["END_DATE", "FESTIVAL_END_DATE", "END_DE"], used, "끝"));
    const lat = Number(pick(row, ["LAT", "LATITUDE", "Y", "GPS_Y"], used, "위도"));
    const lng = Number(pick(row, ["LNG", "LONGITUDE", "X", "GPS_X"], used, "경도"));
    const image = pick(row, ["MAIN_IMG_NORMAL", "MAIN_IMG", "IMG_URL", "MAIN_IMG_THUMB"], used, "사진");
    const thumb = pick(row, ["MAIN_IMG_THUMB", "THUMB_URL"], used, "작은사진");
    const homepage = pick(row, ["HOMEPAGE_URL", "HOMEPAGE", "URL", "CNTCT_URL"], used, "홈페이지");
    const id = pick(row, ["UC_SEQ", "SEQ", "ID", "CONTENT_ID"], used, "번호");

    // 🚫 **확인 못 한 것은 넣지 않는다.** 이름·시작일이 없으면 버린다 —
    //    달이 없는 축제는 달·계절 화면에서 어차피 가려지고(seed.ts 의 monthSource 게이트),
    //    이름이 없으면 카드를 그릴 수가 없다.
    if (!name || !start) {
      버린것.push({ name: name ?? "(이름 없음)", 왜: !name ? "이름이 없다" : "시작일을 못 읽었다" });
      continue;
    }
    made.push({
      id: id ? `busanfest-${id}` : `busanfest-${name}`,
      city: "busan",
      gu,
      category: "festival",
      name,
      addr: addr ?? place,
      start,
      end: end ?? start,
      startMonth: Number(start.slice(4, 6)),
      endMonth: Number((end ?? start).slice(4, 6)),
      // 🔒 달의 근거를 여기 적어 둔다 — 없으면 앱이 가린다(사용자 지시 2026-09-02).
      monthSource: "부산광역시 축제정보 창구(공공데이터포털)",
      lat: Number.isFinite(lat) ? lat : undefined,
      lng: Number.isFinite(lng) ? lng : undefined,
      image,
      thumb,
      officialUrl: homepage,
      source: "busan-city",
      confirmed: true,
    });
  }

  // ── 🔁 이미 있는 14곳과 겹치는 것을 가른다 ────────────────────────────
  //    ⚠️ **한글은 NFC 로 맞추고 비교한다.** 화면엔 똑같이 보이는데 자모 분해형이라
  //       못 찾는 사고를 이 저장소가 이미 겪었다(유튜브 제목 대조).
  const 열쇠 = (s) => s.normalize("NFC").replace(/[\s·・-]/g, "").toLowerCase();
  const 이미 = new Set();
  if (existsSync(BUSAN_PLACES)) {
    for (const p of JSON.parse(readFileSync(BUSAN_PLACES, "utf8"))) {
      if (p.category === "festival") 이미.add(열쇠(p.name));
    }
  }
  const 새것 = made.filter((p) => !이미.has(열쇠(p.name)));
  const 겹침 = made.length - 새것.length;

  console.log(`\n🗂️ 어느 칸에서 가져왔나 (창구가 이름을 바꾸면 여기가 먼저 달라진다):`);
  for (const [무엇, 칸] of used) console.log(`   ${무엇.padEnd(6)} ← ${칸}`);

  console.log(`\n📊 받은 ${rows.length}건 → 쓸 수 있는 것 ${made.length}건`);
  console.log(`   · 이미 있는 것과 겹침: ${겹침}건`);
  console.log(`   · 새로 들어올 것:      ${새것.length}건`);
  if (버린것.length) {
    console.log(`   · 버린 것:            ${버린것.length}건`);
    for (const b of 버린것.slice(0, 10)) console.log(`       ${b.name} — ${b.왜}`);
    if (버린것.length > 10) console.log(`       … 그 밖에 ${버린것.length - 10}건`);
  }

  console.log(`\n🎪 새로 들어올 축제:`);
  for (const p of 새것) {
    console.log(`   ${(p.gu ?? "?").padEnd(5)} ${p.start}~${p.end}  ${p.name}${p.image ? "" : "  (사진 없음)"}`);
  }

  if (!APPLY) {
    console.log(`\n👀 맛보기였다 — 아무것도 저장하지 않았다. 위 표가 맞으면 --apply 로 다시 돌린다.`);
    return;
  }

  writeFileSync(
    OUT,
    JSON.stringify(
      {
        설명:
          "부산광역시가 공공데이터포털에 직접 올린 축제. scripts/fetch-busan-festivals.mjs 가 받는다. 손으로 고치지 말 것.",
        출처: "부산광역시_부산축제정보 서비스 (공공데이터포털, 공공누리 1유형)",
        받은날: new Date().toISOString().slice(0, 10),
        곳: 새것,
      },
      null,
      1
    ) + "\n",
    "utf8"
  );
  console.log(`\n💾 ${새것.length}곳을 저장했다 → src/data/busan-festivals.json`);
};

main().catch((e) => {
  console.error(`❌ ${e.message}`);
  process.exit(1);
});
