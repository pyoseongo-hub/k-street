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
  // 🐞 **두 번 훑는다** (2026-09-17에 여기서 틀렸다).
  //    처음엔 한 번에 훑으면서 배열을 만나면 곧바로 돌려줬는데,
  //    부산 창구의 답은 `body: { item: [...], numOfRows, pageNo, totalCount }` 라
  //    **item 을 먼저 만나 멈추는 바람에 옆칸 totalCount 를 못 봤다.**
  //    총 0건으로 나와 한 건도 안 받아졌다. 세는 것과 찾는 것을 갈라 둔다.
  let total = null;
  (function scanTotal(node) {
    if (node == null || typeof node !== "object") return;
    for (const [k, v] of Object.entries(node)) {
      if (/^totalCount$/i.test(k) && total == null) total = Number(v);
      if (v && typeof v === "object") scanTotal(v);
    }
  })(data);

  let found = null;
  (function scanItems(node) {
    if (found || node == null || typeof node !== "object") return;
    for (const v of Object.values(node)) {
      if (Array.isArray(v) && v.length && typeof v[0] === "object") { found = v; return; }
    }
    for (const v of Object.values(node)) {
      if (found) return;
      if (v && typeof v === "object" && !Array.isArray(v)) scanItems(v);
    }
  })(data);

  // 1건만 올 때는 배열이 아니라 객체로 온다 — 공공데이터포털 전체가 그렇다.
  if (!found) {
    const one = (function pick(node) {
      if (node == null || typeof node !== "object") return null;
      if (node.item && typeof node.item === "object" && !Array.isArray(node.item)) return [node.item];
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

/**
 * 🗓️ **날짜는 한글 문장으로 온다** — 2026-09-17에 날것을 보고 알았다.
 *
 *   "USAGE_DAY" 는 **비어 있고**, 진짜 날짜는 여기 있다:
 *     · "2025. 7. 5.(토) ~ 7. 13.(일) "
 *     · "2026. 05. 22. ~ 05. 31."
 *   끝나는 해가 따로 없고, 요일이 괄호로 붙고, 점과 공백이 제멋대로다.
 *
 *   🚨 **지난 해 날짜가 섞여 있다.** 이 창구는 「올해 일정표」가 아니라
 *      **축제 소개 목록**이라, 마지막으로 열린 회차가 그대로 남아 있다.
 *      그래서 아래 규칙을 지킨다 —
 *        · **달(月)은 쓴다.** 축제는 해마다 같은 시기에 다시 열린다.
 *          관광공사 쪽도 같은 이유로 작년치를 받는다(fetch-festival-dates.mjs).
 *        · **지난 해 날짜는 「날짜」로 쓰지 않는다.** 올해 그 날인 것처럼 보이면
 *          손님이 헛걸음한다. 연도가 올해 이상일 때만 정확한 날짜를 적는다.
 *
 * @returns {{y:number,m:number,d:number,em:number,ed:number}|null}
 */
function parseRange(raw) {
  if (!raw) return null;
  // 요일 괄호(토)·(일)만 걷어낸다. 다른 괄호는 건드리지 않는다.
  const t = String(raw).replace(/\([월화수목금토일]\)/g, " ").replace(/\s+/g, " ").trim();
  const parts = t.split(/[~∼–—]/);

  // 🚨 **숫자를 전부 긁어모으면 안 된다** (2026-09-17에 맛보기에서 잡았다).
  //    "2026. 5. 15. ~ 5. 24. 점등시간 매일 저녁 7시~새벽 1시" 를 숫자로 긁으면
  //    끝 쪽이 [5, 24, 7, 1] 이 되어 어느 규칙에도 안 맞고, 끝 날짜가 조용히
  //    **시작 날짜로 되돌아갔다** — 5/15~5/24 축제가 화면에 5/15 하루로 떴다.
  //    그래서 시각·회차 같은 뒤따라오는 숫자는 보지 않고, **앞에서부터 날짜 꼴만** 읽는다.
  const YMD = /(\d{4})\s*[.\-년/]\s*(\d{1,2})\s*[.\-월/]\s*(\d{1,2})/;      // 2026. 5. 15.
  const MD  = /^\D*(\d{1,2})\s*[.\-월/]\s*(\d{1,2})/;                        // 5. 24.
  const D   = /^\D*(\d{1,2})\s*[.일]/;                                        //    24.

  // 시작은 반드시 **연·월·일 셋 다** 있어야 한다. 연도를 모르면 「올해 것인지」를
  // 가릴 수 없고, 가릴 수 없으면 안 쓴다.
  const a = YMD.exec(parts[0] || "");
  if (!a) return null;
  const y = +a[1], m = +a[2], d = +a[3];
  if (y < 2000 || y > 2100 || m < 1 || m > 12 || d < 1 || d > 31) return null;

  // 끝은 세 가지 꼴을 차례로 본다. 하나도 안 맞으면 **하루짜리**로 본다.
  let em = m, ed = d, ey = y;
  const tail = parts[1] || "";
  let b;
  if ((b = YMD.exec(tail)))     { ey = +b[1]; em = +b[2]; ed = +b[3]; }
  else if ((b = MD.exec(tail))) { em = +b[1]; ed = +b[2]; }
  else if ((b = D.exec(tail)))  { ed = +b[1]; }
  if (em < 1 || em > 12 || ed < 1 || ed > 31) { ey = y; em = m; ed = d; }

  // 🔎 **끝이 시작보다 앞서면 날짜를 쓰지 않는다.** 창구 원문 자체가 틀린 것이 있다
  //    (자갈치축제: "2025. 10. 23. ~ 10. 06."). 해를 넘기는 것은 정상이므로 가른다.
  const 뒤집힘 = ey === y && (em < m || (em === m && ed < d));
  if (뒤집힘) return { y, m, d, em: m, ed: d, endUnsure: true };

  return { y, m, d, em, ed, crossYear: ey !== y, endYear: ey };
}

/**
 * 🏷️ 상호 뒤에 붙은 **언어 꼬리표**를 뗀다 — "센텀맥주축제(한,영,중간,중번,일)".
 *    ⚠️ 괄호를 다 떼면 안 된다. "○○축제(해운대)" 처럼 뜻이 있는 괄호가 있다.
 *    그래서 **언어를 가리키는 낱말만** 쉼표로 이어진 괄호일 때만 뗀다.
 */
function cleanName(name) {
  return String(name)
    .replace(/\s*\((?:\s*(?:한|영|중|일|중간|중번|러|베|태|독|불|스|아)\s*,)+\s*(?:한|영|중|일|중간|중번|러|베|태|독|불|스|아)\s*\)\s*$/, "")
    .trim();
}

const ymd = (y, m, d) => `${y}${String(m).padStart(2, "0")}${String(d).padStart(2, "0")}`;

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

  // ── 앱이 쓰는 모양으로 바꾼다 ────────────────────────────────────────
  //    칸 이름은 **추측하지 않았다.** 2026-09-17에 --dump 로 날것을 보고 적었다.
  const THIS_YEAR = new Date().getFullYear();
  const used = new Map();
  const made = [];
  const 버린것 = [];
  for (const row of rows) {
    const name = cleanName(pick(row, ["MAIN_TITLE", "PLACE", "TITLE"], used, "이름") ?? "");
    const gu   = pick(row, ["GUGUN_NM"], used, "구");
    const addr = pick(row, ["ADDR1"], used, "주소");
    const when = pick(row, ["USAGE_DAY_WEEK_AND_TIME", "USAGE_DAY"], used, "기간");
    const lat  = Number(pick(row, ["LAT"], used, "위도"));
    const lng  = Number(pick(row, ["LNG"], used, "경도"));
    const image = pick(row, ["MAIN_IMG_NORMAL"], used, "사진");
    const thumb = pick(row, ["MAIN_IMG_THUMB"], used, "작은사진");
    const home  = pick(row, ["HOMEPAGE_URL"], used, "홈페이지");
    const id    = pick(row, ["UC_SEQ"], used, "번호");

    const r = parseRange(when);
    // 🚫 **확인 못 한 것은 넣지 않는다.** 이름이 없거나 기간을 못 읽으면 버린다 —
    //    달을 모르는 축제는 달·계절 화면에서 어차피 가려진다.
    if (!name || !r) {
      버린것.push({ name: name || "(이름 없음)", 왜: !name ? "이름이 없다" : `기간을 못 읽었다 — "${when ?? ""}"` });
      continue;
    }
    // 🗓️ 올해 이후의 회차만 **정확한 날짜**를 적는다. 지난 해 것은 달만 남긴다.
    const 올해것 = r.y >= THIS_YEAR;
    made.push({
      id: id ? `busanfest-${id}` : `busanfest-${name}`,
      city: "busan",
      gu,
      category: "festival",
      name,
      addr,
      // 끝이 시작보다 앞선 원문(endUnsure)은 **끝 날짜를 안 적는다** — 시작 하루만 적는다.
      ...(올해것
        ? { start: ymd(r.y, r.m, r.d), end: ymd(r.endYear ?? r.y, r.em, r.ed) }
        : {}),
      startMonth: r.m,
      endMonth: r.em,
      // 🔒 달의 근거. 없으면 앱이 가린다(사용자 지시 2026-09-02).
      monthSource: 올해것
        ? "부산광역시 축제정보 창구(공공데이터포털)"
        : `부산광역시 축제정보 창구 — ${r.y}년 회차 기준(달만 사용)`,
      lat: Number.isFinite(lat) ? lat : undefined,
      lng: Number.isFinite(lng) ? lng : undefined,
      image,
      thumb,
      officialUrl: home,
      source: "busan-city",
      confirmed: true,
      // 사람이 볼 때 쓰는 원문. 화면에는 안 쓴다.
      _원문기간: when,
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
    const 달 = `${String(p.startMonth).padStart(2, " ")}월`;
    const 표시 = p.start ? `${p.start}~${p.end}` : `${달} (달만)`;
    console.log(`   ${(p.gu ?? "?").padEnd(5)} ${표시.padEnd(20)} ${p.name}${p.image ? "" : "  (사진 없음)"}`);
    console.log(`         원문: ${p._원문기간}`);
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
        곳: 새것.map(({ _원문기간, ...rest }) => rest),
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
