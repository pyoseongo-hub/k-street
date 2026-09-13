#!/usr/bin/env node
// 📊 **서울 관광지에 사람이 얼마나 갔나** — 한국문화관광연구원 관광자원통계서비스.
//
// 사장님 (2026-09-13): *"제일 많이 가는 데 모아 놓는 거지"*
//
// ─────────────────────────────────────────────────────────────────────────
// 왜 이 자료인가 — **「유명하다」를 우리가 판정하지 않기 위해서**
// ─────────────────────────────────────────────────────────────────────────
//   새 갈래(명소)에 무엇을 넣을지 정해야 하는데, 「유명한 곳」이라는 잣대는
//   **우리 판단**이라 근거를 못 댄다. 이 저장소가 가장 피하는 종류의 값이다.
//   이 통계는 **기초지자체가 세어 문체부에 보고한 숫자**다. 우리가 정할 것이 없다.
//
//   🔑 게다가 이 창구는 **외국인과 내국인을 갈라서** 준다.
//      우리 손님은 외국인이므로 **외국인 방문객 수**로 줄을 세운다 —
//      「한국 사람이 많이 가는 곳」과 「외국인이 많이 가는 곳」은 다르다.
//
// ⚠️ **한계를 알고 쓴다.** 이 통계는 **입장객을 세는 곳**만 잡는다(유료 관광지·
//    고궁·박물관·타워). 홍대·성수·익선동처럼 **문이 없는 동네는 안 나온다** —
//    그건 원래 「골목·거리」 갈래로 갈 것들이라 이 목록에 없어도 맞다.
//    이 목록에 없다고 「사람이 안 간다」로 읽지 말 것.
//
// ─────────────────────────────────────────────────────────────────────────
// 🚨 이 스크립트는 **주소와 칸 이름을 모른 채** 짰다
// ─────────────────────────────────────────────────────────────────────────
//   작업 환경에서는 data.go.kr 에 접속이 안 되고 열쇠도 GitHub 시크릿에만 있어서,
//   내가 응답을 한 번도 못 봤다. 그래서 **지어내지 않고 두드려 본다**:
//     · 주소 후보를 순서대로 시도하고 **되는 것을 로그에 적는다**
//     · 칸 이름도 후보를 여러 개 두고 **실제로 있는 것을 골라 쓴다**
//     · 첫 항목의 **원문을 통째로 찍는다** — 다음 사람이 추측할 필요가 없게
//   되는 주소·칸 이름을 확인한 뒤 이 머리말에 적어 둘 것.
//
//   TOUR_API_KEY=데이터포털_일반_인증키 node scripts/fetch-visitor-stats.mjs
//     --months 24     몇 달치를 받을까 (기본 24 — 통계는 두세 달 늦게 올라온다)
//     --top 40        몇 곳을 보여 줄까 (기본 40)
//
// 결과: src/data/visitor-stats.json (공공누리, 비밀값 아님)

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { fetchWithRetry } from "./lib/tour-fetch.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..", "src", "data", "visitor-stats.json");

const API_KEY = process.env.TOUR_API_KEY;
if (!API_KEY) {
  console.error("TOUR_API_KEY 환경변수가 없다.");
  process.exit(1);
}

const arg = (name, dflt) => {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : dflt;
};
const MONTHS = Number(arg("months", 24));
const TOP = Number(arg("top", 40));
/**
 * 🔎 **응답 원문을 보는 모드.** 2026-09-13에 첫 실행이 「주소는 되는데 0줄」로 끝나서
 *    넣었다. 조건을 바꿔 가며 물어보고 **돌아온 것을 그대로 찍는다** —
 *    0줄이 「자료가 없다」인지 「조건이 틀렸다」인지는 원문을 봐야 갈린다.
 *    추측으로 고치면 또 한 판을 버린다(러너 왕복은 3분이다).
 */
const PROBE = process.argv.includes("--probe");

// 🚪 주소 후보. data.go.kr 은 같은 서비스를 두 주소로 열어 둔 적이 있어
//    (옛 openapi.tour.go.kr / 지금 apis.data.go.kr) 둘 다 두드려 본다.
// 🐞 **2026-09-13에 두 번 틀렸다. 둘 다 적어 둔다.**
//   ① 주소 — apis.data.go.kr/B551011/… 로 찍었는데 **B551011은 한국관광공사**다.
//      이 자료의 주인은 **한국문화관광연구원**이라 창구가 다르다(openapi.tour.go.kr).
//   ② 이름 — `getPchrgTrrs**r**tVisitorList` 인데 `Trrs**r**d` 로 썼다. **글자 하나.**
//   둘 다 같은 답이 돌아온다: 「해당 오픈API 서비스가 없거나 폐기됨」(errMsg
//   NO_OPENAPI_SERVICE_ERROR). **주소가 틀려도 열쇠가 틀려도 비슷해 보인다** —
//   그래서 원문을 안 찍었으면 「활용신청이 안 됐나」로 엉뚱한 데를 팠을 것이다.
// ✅ **맞는 창구를 2026-09-13에 확인했다** — 첫 줄이 이렇게 답했다:
//      HTTP 200 {"response":{"header":{"resultCode":30,
//                "resultMsg":"SERVICE KEY IS NOT REGISTERED ERROR."}}}
//    「열쇠가 없다」는 답을 **주소가 맞아야** 받을 수 있다. 주소가 틀리면
//    NO_OPENAPI_SERVICE_ERROR 가 온다. 그래서 이 답은 **주소가 맞다는 증거**다.
const BASES = [
  "http://openapi.tour.go.kr/openapi/service/TourismResourceStatsService", // ← 이것이 맞다
  "https://openapi.tour.go.kr/openapi/service/TourismResourceStatsService",
  "https://apis.data.go.kr/B551011/TourismResourceStatsService",
];
const OPS = ["getPchrgTrrsrtVisitorList", "getPchrgTrrsrdVisitorList"];
let OP = OPS[0];

/** 최근 N개월의 YYYYMM. 이번 달부터 거꾸로 — 최근 달은 아직 비어 있을 수 있다. */
function recentMonths(n) {
  const out = [];
  const d = new Date();
  for (let i = 0; i < n; i++) {
    out.push(`${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}`);
    d.setMonth(d.getMonth() - 1);
  }
  return out;
}

/**
 * 한 달치를 받는다.
 * 🚨 serviceKey 를 URLSearchParams 에 안 넣는다 — 데이터포털 「일반 인증키」는
 *    이미 URL 인코딩된 값이라 한 번 더 인코딩하면 깨진다(fetch-festival-dates 와 같은 이유).
 */
async function fetchMonth(base, ym) {
  const params = new URLSearchParams({
    MobileOS: "ETC",
    MobileApp: "KStreet",
    _type: "json",
    YM: ym,
    SIDO: "서울특별시",
    numOfRows: "1000",
    pageNo: "1",
  });
  const url = `${base}/${OP}?serviceKey=${API_KEY}&${params}`;
  const res = await fetchWithRetry(url, { tries: 3, waits: [3000, 8000] });
  const text = await res.text();
  // ⚠️ 데이터포털은 오류를 **XML 로** 돌려준다 — _type=json 을 줘도 그렇다.
  //    그대로 JSON.parse 하면 「Unexpected token <」만 보이고 진짜 이유를 못 본다.
  if (text.trimStart().startsWith("<")) {
    const why = /<returnAuthMsg>([^<]*)</.exec(text)?.[1]
      || /<errMsg>([^<]*)</.exec(text)?.[1]
      || text.slice(0, 200).replace(/\s+/g, " ");
    return { error: why, raw: text };
  }
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    return { error: `JSON 이 아니다: ${text.slice(0, 160)}`, raw: text };
  }
  // 🐞 **오류도 JSON 으로 온다** (2026-09-13에 여기서 데었다).
  //    XML 만 오류로 보게 짜 놨더니, 「해당 오픈API 서비스가 없거나 폐기됨」이
  //    **「자료 0줄」로 읽혔다.** 24개월을 0줄로 받아 놓고 「통계가 아직 없나 보다」
  //    했는데 실은 주소가 틀린 것이었다. **조용히 틀리는 쪽이 가장 나쁘다.**
  const cmm = json?.OpenAPI_ServiceResponse?.cmmMsgHeader;
  if (cmm) return { error: `${cmm.errMsg ?? ""} — ${cmm.returnAuthMsg ?? ""}`.trim(), raw: text };
  // 🚨 **HTTP 200 인데 오류인 경우가 있다** (2026-09-13). 이 창구는 열쇠가 없어도
  //    200 을 주고 머리말에만 사정을 적는다 — 상태 코드만 보면 성공으로 읽힌다.
  const head = json?.response?.header;
  const code = String(head?.resultCode ?? "");
  if (code && !/^0+$/.test(code)) {
    const why = code === "30" ? "열쇠가 이 서비스에 아직 등록되지 않았다 (활용신청 반영에 한두 시간 걸린다)" : head?.resultMsg;
    return { error: `resultCode ${code} — ${why}`, code, raw: text };
  }
  const body = json?.response?.body;
  const item = body?.items?.item;
  const list = Array.isArray(item) ? item : item ? [item] : [];
  return { list, total: Number(body?.totalCount ?? list.length), json };
}

/** 있을 법한 칸 이름 중 **실제로 있는 것**을 고른다 — 이름을 지어내지 않는다. */
const pick = (o, names) => {
  for (const n of names) if (o[n] != null && o[n] !== "") return o[n];
  return undefined;
};
const NAME_KEYS = ["resNm", "RES_NM", "resnm", "trrsrdNm"];
const CNT_KEYS = ["csCnt", "CS_CNT", "cscnt", "visitorCnt"];
const DIV_KEYS = ["csDivNm", "CS_DIV_NM", "csdivnm", "csDivCd"];
const GU_KEYS = ["gungu", "GUNGU", "sgg", "addr1"];

const isForeign = (v) => /외국|foreign/i.test(String(v ?? ""));

// ── 🔎 검사 모드 ────────────────────────────────────────────────────────
if (PROBE) {
  // 자료가 확실히 있을 만한 달(두세 달 지연을 감안해 작년 6월)로 두드린다.
  const YM = arg("ym", "202506");
  // 무엇이 문제인지 **한 번에 하나씩** 바꾼다 — 여러 개를 같이 바꾸면
  // 되더라도 무엇 때문에 됐는지 모른다.
  const TRIES = [
    ["조건 없음 (전국)", {}],
    ["SIDO=서울특별시", { SIDO: "서울특별시" }],
    ["SIDO=서울", { SIDO: "서울" }],
    ["SIDO=서울특별시 · GUNGU=종로구", { SIDO: "서울특별시", GUNGU: "종로구" }],
    ["RES_NM=경복궁", { RES_NM: "경복궁" }],
  ];
  // 🐞 **첫 판에는 여기 `break` 가 있었다** — 주소 셋을 두드리겠다고 해 놓고
  //    첫 주소만 보고 나갔다. 그래서 정작 맞는 주소(openapi.tour.go.kr)가
  //    **시험도 안 됐다.** 검사 모드가 검사를 안 한 셈이다.
  //    ⚠️ 먼저 **주소 × 이름**을 가려낸 뒤에 조건을 바꿔 본다 — 주소가 틀린 상태에서
  //       조건을 다섯 가지 바꿔 봐야 다섯 번 똑같이 틀린다(그게 첫 판이었다).
  // 🔑 **열쇠를 두 가지 모양으로 보내 본다** (2026-09-13에 세 번째 판에서 넣었다).
  //    공공데이터포털 인증키는 **Encoding**(%2B·%2F·%3D 가 든 것)과 **Decoding**
  //    (+·/·= 원본) 두 가지로 나온다. **창구마다 원하는 쪽이 다르다** —
  //    apis.data.go.kr 은 Encoding 을 그대로 받는데, 기관 자체 창구(openapi.tour.go.kr)는
  //    한 번 더 디코딩해 버려 **Encoding 을 주면 깨진 열쇠가 된다.**
  //    깨진 열쇠는 「없는 열쇠」와 **똑같은 답**을 준다(SERVICE KEY IS NOT REGISTERED).
  //    → 그래서 「승인은 났는데 안 된다」가 **승인 문제로 보이지만 열쇠 모양 문제**일 수 있다.
  //    ⚠️ Kfood CLAUDE.md 에도 같은 함정이 적혀 있다 — 「% 가 든 값」은 늘 의심한다.
  const KEYS = [["그대로(Encoding 으로 보임)", API_KEY]];
  try {
    const dec = decodeURIComponent(API_KEY);
    if (dec !== API_KEY) KEYS.push(["한 번 디코딩(Decoding)", dec]);
  } catch { /* 디코딩이 안 되면 그대로만 쓴다 */ }
  console.log(`🔑 열쇠 모양 ${KEYS.length}가지로 시험한다 (길이 ${API_KEY.length}자)`);

  // 🚨 **적게 두드린다** (2026-09-13에 데었다). 주소 3 × 이름 2 × 열쇠 2 = **12번**을
  //    30분 사이에 여러 판 돌렸더니 **서버가 우리를 안 받아 줬다**(ConnectTimeout).
  //    아까는 바로 답하던 주소까지 막혀서 **그 판은 아무것도 못 알아냈다.**
  //    맞는 주소·이름은 이미 안다(위 주석) — 검사는 **두 번**이면 된다.
  //    전부 훑고 싶으면 `--wide` 를 준다.
  const WIDE = process.argv.includes("--wide");
  const pBases = WIDE ? BASES : [BASES[0]];
  const pOps = WIDE ? OPS : [OPS[0]];
  console.log(`   (${pBases.length * pOps.length * KEYS.length}번만 부른다${WIDE ? "" : " — 전부 보려면 --wide"})`);

  let live = null;
  for (const b of pBases) {
    for (const op of pOps) {
      for (const [kname, key] of KEYS) {
      const params = new URLSearchParams({ MobileOS: "ETC", MobileApp: "KStreet", _type: "json", YM, numOfRows: "3", pageNo: "1" });
      // 디코딩한 열쇠는 **다시 인코딩해서** 보낸다 — 안 그러면 + 가 공백이 된다.
      const sk = key === API_KEY ? key : encodeURIComponent(key);
      const url = `${b}/${op}?serviceKey=${sk}&${params}`;
      process.stdout.write(`\n🚪 ${b.replace(/^https?:\/\//, "")}/${op} · 열쇠 ${kname}\n`);
      try {
        const res = await fetchWithRetry(url, { tries: 2, waits: [3000] });
        const text = await res.text();
        console.log(`   HTTP ${res.status} · ${text.length}바이트`);
        console.log("   " + text.slice(0, 600).replace(/\s+/g, " "));
        // 🛑 **「열쇠가 등록 안 됐다」가 오면 거기서 멈춘다.** 이건 주소 문제가 아니라
        //    승인 문제라, 다른 주소를 더 두드려 봐야 답이 안 바뀐다.
        //    2026-09-13에 계속 두드리다 **서버가 연결을 끊어서**(ConnectTimeout)
        //    로그가 「전부 실패」로 끝났다 — 정작 첫 줄에 답이 있었는데 묻혔다.
        // 🛑 **열쇠 모양을 다 써 본 뒤에야** 멈춘다. 전에는 첫 답에서 바로 나갔는데,
        //    그러면 「다른 모양이면 됐을 것」을 영영 못 본다.
        if (res.ok && !/NO_OPENAPI_SERVICE|NOT.REGISTERED|SERVICE_KEY|ERROR/i.test(text)) live = { b, op, kname, key };
      } catch (e) {
        console.log(`   실패: ${String(e).slice(0, 120)}`);
      }
      if (live) break;
      }
      if (live) break;
    }
    if (live) break;
  }

  if (!live) {
    console.log("\n🛑 **주소와 이름은 맞다**(그래야 「열쇠가 없다」는 답이 온다).");
    console.log("   어느 열쇠 모양으로도 안 열린다. 남은 가능성은 둘이다 —");
    console.log("   ① 승인이 API 서버까지 아직 안 퍼졌다(보통 한두 시간, 길면 하루)");
    console.log("   ② GitHub 시크릿의 TOUR_API_KEY 가 활용신청한 계정의 열쇠가 아니다");
    process.exit(0);
  }
  console.log(`\n✅ 열리는 창구: ${live.b}/${live.op} · 열쇠 ${live.kname}\n   이제 조건을 바꿔 본다.`);

  const LIVE_SK = live.key === API_KEY ? live.key : encodeURIComponent(live.key);
  for (const [label, extra] of TRIES) {
    const params = new URLSearchParams({ MobileOS: "ETC", MobileApp: "KStreet", _type: "json", YM, numOfRows: "5", pageNo: "1", ...extra });
    const url = `${live.b}/${live.op}?serviceKey=${LIVE_SK}&${params}`;
    process.stdout.write(`\n── ${label}\n`);
    try {
      const res = await fetchWithRetry(url, { tries: 2, waits: [3000] });
      const text = await res.text();
      console.log(`   HTTP ${res.status} · ${text.length}바이트`);
      console.log("   " + text.slice(0, 900).replace(/\s+/g, " "));
    } catch (e) {
      console.log(`   실패: ${String(e).slice(0, 120)}`);
    }
  }
  console.log("\n📌 위 원문에서 볼 것: totalCount 가 0 인가 · resultMsg 가 뭐라고 하나 · items 안의 칸 이름");
  process.exit(0);
}

// ── 돌린다 ──────────────────────────────────────────────────────────────
let base = null;
let firstRaw = null;
const months = recentMonths(MONTHS);

// 1) 되는 주소를 찾는다. 첫 달로 두드려 보고, 되면 그 주소로 나머지를 돈다.
// ⚠️ **주소와 이름을 같이 두드린다.** 2026-09-13에 둘 다 틀렸는데 돌아오는 말이
//    같아서, 주소만 바꿔 봤다가 원인을 못 찾았다.
outer: for (const b of BASES) {
  for (const op of OPS) {
    OP = op;
    process.stdout.write(`🚪 ${b.replace(/^https?:\/\//, "")}/${op} … `);
    try {
      const r = await fetchMonth(b, months[0]);
      if (r.error) {
        console.log(`안 됨 (${r.error})`);
        continue;
      }
      console.log(`된다 (${months[0]}: ${r.list.length}줄)`);
      base = b;
      if (r.list.length) firstRaw = r.list[0];
      break outer;
    } catch (e) {
      console.log(`안 됨 (${String(e).slice(0, 80)})`);
    }
  }
}
if (!base) {
  console.error("\n🚨 세 주소 모두 실패했다. 활용신청이 승인됐는지, 열쇠가 「일반 인증키(Encoding)」인지 볼 것.");
  process.exit(1);
}

// 2) 달마다 받아 합친다.
/** @type {Map<string, {name: string, gu?: string, foreign: number, local: number, months: number}>} */
const byPlace = new Map();
const monthsWithData = [];

for (const ym of months) {
  let r;
  try {
    r = await fetchMonth(base, ym);
  } catch (e) {
    console.log(`  ${ym} — 실패 (${String(e).slice(0, 60)})`);
    continue;
  }
  if (r.error) {
    console.log(`  ${ym} — ${r.error}`);
    continue;
  }
  if (!r.list.length) {
    console.log(`  ${ym} — 0줄 (아직 안 올라왔을 수 있다)`);
    continue;
  }
  if (!firstRaw) firstRaw = r.list[0];
  monthsWithData.push(ym);
  for (const it of r.list) {
    const name = String(pick(it, NAME_KEYS) ?? "").trim().normalize("NFC");
    if (!name) continue;
    const cnt = Number(String(pick(it, CNT_KEYS) ?? "0").replace(/[^0-9.-]/g, "")) || 0;
    const div = pick(it, DIV_KEYS);
    const gu = pick(it, GU_KEYS);
    if (!byPlace.has(name)) byPlace.set(name, { name, gu: gu ? String(gu) : undefined, foreign: 0, local: 0, months: 0 });
    const rec = byPlace.get(name);
    if (isForeign(div)) rec.foreign += cnt;
    else rec.local += cnt;
    rec.months++;
  }
  console.log(`  ${ym} — ${r.list.length}줄`);
}

if (!monthsWithData.length) {
  console.error("\n🚨 어느 달에도 자료가 없다. YM 형식이나 SIDO 값이 다를 수 있다.");
  process.exit(1);
}

// 3) 외국인 순으로 줄 세운다.
const rows = [...byPlace.values()].sort((a, b) => b.foreign - a.foreign);

// 🔎 **첫 항목의 원문을 통째로 찍는다.** 칸 이름을 다음 사람이 추측하지 않게.
console.log("\n📄 응답 한 줄의 원문 (칸 이름 확인용):");
console.log(JSON.stringify(firstRaw, null, 2));

console.log(`\n📊 받은 달: ${monthsWithData.length}개 (${monthsWithData.at(-1)} ~ ${monthsWithData[0]})`);
console.log(`   지점 ${rows.length}곳\n`);
console.log("순위  외국인       내국인       이름");
for (const [i, r] of rows.slice(0, TOP).entries()) {
  console.log(
    `${String(i + 1).padStart(3)}. ${String(r.foreign.toLocaleString()).padStart(11)} ${String(r.local.toLocaleString()).padStart(11)}  ${r.name}`,
  );
}

// ⚠️ 외국인이 0인 곳이 많으면 **구분 칸을 잘못 읽고 있다는 뜻**일 수 있다.
const zero = rows.filter((r) => r.foreign === 0).length;
if (zero > rows.length * 0.8) {
  console.log(`\n⚠️ ${rows.length}곳 중 ${zero}곳이 외국인 0이다. 구분 칸(${DIV_KEYS.join("/")})을 못 읽고 있을 수 있다 — 위 원문을 볼 것.`);
}

writeFileSync(
  OUT,
  JSON.stringify({ 기준: "한국문화관광연구원 관광자원통계서비스 · 유료관광지방문객수", 받은달: monthsWithData, 지점: rows }, null, 2) + "\n",
);
console.log(`\n💾 ${OUT}`);
