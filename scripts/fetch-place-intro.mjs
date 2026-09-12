// 🏪 **곳마다 「속사정」을 관광공사에서 받아 온다** — 판매품목 · 영업시간 · 휴무일 · 요금.
//
// 사장님 지시 (2026-09-12):
//   "방산 시장 동대문 시장처럼 먹거리나 그런 것이 아닌 **특성화된 장소**도 있으니
//    시장 자료 올려줘야 해"
//
// 지금 우리 목록은 이렇게만 나온다 — 「방산 종합시장 · 중구 · 을지로4가역 252m」.
// 외국인이 이걸 보고 아는 것은 **아무것도 없다.** 방산시장은 포장재·인쇄·제과 재료
// 전문이고 동대문종합시장은 원단·부자재·한복이다. **그걸 알아야 안내다.**
//
// ─────────────────────────────────────────────────────────────────────────
// 🎯 무엇을 받나 — 갈래(contentTypeId)마다 칸 이름이 다르다
// ─────────────────────────────────────────────────────────────────────────
//   38 쇼핑   : saleitem(판매품목) · opentime · restdateshopping · parkingshopping
//   12 관광지 : usetime · restdate · parking
//   14 문화시설: usetimeculture · restdateculture · **usefee** · parkingculture
//   15 행사   : (따로 있다 — 축제는 구청 자료를 쓰므로 여기선 안 받는다)
//   우리는 이 다른 이름들을 **우리 이름 넷**으로 모은다: 판매품목 · 영업시간 · 휴무 · 요금.
//
// 🚨 **없는 것과 잘못 물어본 것을 가른다.** detailIntro 는 갈래를 같이 넘겨야 하고,
//    틀리면 빈 답이 온다. 그래서 detailCommon 으로 **갈래부터 물어보고** 그 갈래로 묻는다.
//    (찔러보기에서 확인했다 — 6곳 전부 갈래 38 이었고 6곳 다 칸이 찼다.)
//
// 🚨 **쓸모없는 값은 버린다.** 「점포 별로 상이함」만 적힌 영업시간은 손님에게
//    아무것도 안 알려 준다. 그런 값은 **빈 칸으로 둔다** — 빈 칸이 소음보다 낫다.
//
// ⚠️ 인증키는 시크릿에서만 온다. 저장소에 한 글자도 안 적는다.
// ⚠️ **id 를 열쇠로 저장한다.** 이름을 열쇠로 쓰면 이름이 바뀌는 날 자료가 남의 것이 된다.

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fetchWithRetry } from "./lib/tour-fetch.mjs";

const KEY = process.env.TOUR_API_KEY ?? "";
if (!KEY) {
  console.error("❌ TOUR_API_KEY 가 없다 — 워크플로에 시크릿을 넘겼는지 볼 것.");
  process.exit(1);
}
const APPLY = process.argv.includes("--apply");
const ONLY = (process.env.ONLY ?? "").trim(); // 갈래 하나만 받고 싶을 때
const LIMIT = Number(process.env.LIMIT || 0);
/**
 * ⏱️ **한 곳에 오래 매달리지 않는다** (2026-09-12에 배웠다).
 *
 * tour-fetch 의 기본은 **6번 재시도(최대 2분 15초)**다. 그건 「한 번 받아 오면
 * 끝인 작업」에 맞는 값이다 — 20분짜리 수집이 첫 호출에서 날아가지 않게.
 *
 * 🚨 그런데 여기는 **128번 물어본다**(64곳 × 2). 곱하면 최악이 **몇 시간**이다.
 *    실제로 한 판을 20분 넘게 돌리다 껐다. **같은 재시도 값이 작업 성격에 따라
 *    약이 되기도 독이 되기도 한다** — 「잣대는 하나」가 여기서는 안 맞는다.
 *
 * ✅ 대신 **빨리 포기하고 다음으로 간다.** 이 스크립트는 **덮어쓰지 않고 합치니까**
 *    나중에 다시 돌리면 빈 곳만 채워진다. 한 판에 다 받을 이유가 없다.
 */
const TRIES = Number(process.env.TRIES || 2);
/** ⏳ 전체 시간 상한(분). 넘으면 **받은 것까지 저장하고** 끝낸다. */
const MAX_MIN = Number(process.env.MAX_MIN || 12);
const STARTED = Date.now();
const OUT = "src/data/place-intro.json";

const DUMP = "dist-ssr/dump-intro-targets.js";
if (!existsSync(DUMP)) {
  console.error("❌ dist-ssr/dump-intro-targets.js 가 없다. 먼저 목록을 뽑는다:");
  console.error("   npx vite build --ssr scripts/dump-intro-targets.ts --outDir dist-ssr");
  process.exit(1);
}
const { TARGETS } = await import(`../${DUMP}`);

let targets = TARGETS;
if (ONLY) targets = targets.filter((t) => t.category === ONLY);
if (LIMIT) targets = targets.slice(0, LIMIT);

const ROOT = "https://apis.data.go.kr/B551011/KorService2";
const q = (o) => new URLSearchParams({ MobileOS: "ETC", MobileApp: "KStreet", _type: "json", ...o });

/**
 * 🚨 **한 곳이 안 돼도 나머지는 계속 간다** (2026-09-12에 당했다).
 *
 * 처음엔 fetchWithRetry 를 그냥 불렀다. 그런데 그 함수는 6번 다 실패하면 **던진다.**
 * 잡는 쪽이 없어서 **첫 곳에서 64곳짜리 수집이 통째로 죽었다** — 3분을 쓰고 0곳.
 *
 * 관광공사는 「닫혔다/열렸다」가 아니라 **되다 말다 한다**(tour-fetch.mjs 머리말:
 * 호출 7번 중 4번이 ConnectTimeout 이었다). 그런 상대에게 **전부 아니면 전무**는
 * 최악의 방식이다 — 한 곳이 안 되는 날 **아무것도 못 받는다.**
 * 그래서 여기서 잡고, 실패한 곳은 세어서 끝에 보여 준다. **받은 만큼은 남긴다.**
 */
async function ask(path, params) {
  let t;
  try {
    const r = await fetchWithRetry(`${ROOT}/${path}?serviceKey=${KEY}&${q(params)}`, {
      tries: TRIES,
      // 짧게 두 번이면 「지금 열려 있나」를 보기에 충분하다. 더 기다릴 값은 다음 판에 쓴다.
      waits: [4000, 8000],
    });
    t = await r.text();
  } catch (e) {
    return { ok: false, why: e?.message ?? String(e) };
  }
  try {
    const item = JSON.parse(t)?.response?.body?.items?.item;
    return { ok: true, row: Array.isArray(item) ? item[0] : item };
  } catch {
    return { ok: false, why: t.slice(0, 120).replace(/\s+/g, " ") };
  }
}

/**
 * 관광공사 값 다듬기.
 * `<br>` 같은 표시가 섞여 오고, 같은 뜻을 「점포별 상이」/「점포 별로 상이함」처럼
 * 여러 꼴로 적어 온다. **표시를 벗기고 공백을 하나로** 줄인다.
 */
const clean = (v) =>
  String(v ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/**
 * 🚨 **손님에게 아무것도 안 알려 주는 값은 버린다.**
 *
 * 「점포 별로 상이함」만 적힌 영업시간은 화면에 넣어 봐야 자리만 차지하고,
 * 손님은 「그래서 몇 시야?」를 다시 검색해야 한다. **빈 칸이 소음보다 낫다.**
 * 다만 **시간이 같이 적혀 있으면 살린다** — 「09:00~21:00 ※ 점포 별로 상이함」은
 * 쓸모 있는 값이고, 뒤에 붙은 단서까지 그대로 두는 편이 정직하다.
 */
const USELESS = /^(점포\s*별?로?\s*상이(함)?|상시|연중무휴|없음|-|없다)$/;
function keep(v) {
  const c = clean(v);
  if (!c) return "";
  if (USELESS.test(c)) return "";
  // 숫자가 하나도 없고 「상이」만 들어 있으면 역시 버린다
  if (/상이/.test(c) && !/\d/.test(c)) return "";
  return c;
}

/** 갈래마다 다른 칸 이름 → 우리 이름 넷. */
const MAP = {
  38: { sells: "saleitem", hours: "opentime", closed: "restdateshopping", fee: null, tel: "infocentershopping" },
  12: { sells: null, hours: "usetime", closed: "restdate", fee: null, tel: "infocenter" },
  14: { sells: null, hours: "usetimeculture", closed: "restdateculture", fee: "usefee", tel: "infocenterculture" },
  28: { sells: null, hours: "usetimeleports", closed: "restdateleports", fee: "usefeeleports", tel: "infocenterleports" },
  25: { sells: null, hours: null, closed: null, fee: null, tel: "infocentertourcourse" },
};

console.log(`🏪 ${targets.length}곳의 속사정을 받아 온다${ONLY ? ` (갈래 ${ONLY}만)` : ""}\n`);

const out = {};
const stat = { sells: 0, hours: 0, closed: 0, fee: 0, tel: 0, none: 0, failed: 0 };

let stopped = 0;
for (const t of targets) {
  // ⏳ 시간이 다 되면 **받은 것까지 저장하고** 끝낸다. 끝까지 붙들고 있다가
  //    워크플로가 잘리면 **그날 받은 것이 전부 날아간다.**
  if ((Date.now() - STARTED) / 60000 > MAX_MIN) {
    stopped = targets.length - targets.indexOf(t);
    console.log(`\n⏳ ${MAX_MIN}분이 지났다 — 남은 ${stopped}곳은 다음 판에 받는다(합쳐진다).`);
    break;
  }
  const c = await ask("detailCommon2", { contentId: t.contentId });
  if (!c.ok || !c.row?.contenttypeid) {
    console.log(`❌ ${t.name} — 갈래를 못 물어봤다${c.why ? `: ${c.why}` : ""}`);
    stat.failed++;
    continue;
  }
  const type = String(c.row.contenttypeid);
  const m = MAP[type];
  if (!m) {
    console.log(`·  ${t.name} — 갈래 ${type} 은 아직 표에 없다`);
    continue;
  }
  const r = await ask("detailIntro2", { contentId: t.contentId, contentTypeId: type });
  if (!r.ok) {
    console.log(`❌ ${t.name} — 속사정을 못 물어봤다: ${r.why}`);
    stat.failed++;
    continue;
  }
  const row = r.row ?? {};
  const got = {
    sells: m.sells ? keep(row[m.sells]) : "",
    hours: m.hours ? keep(row[m.hours]) : "",
    closed: m.closed ? keep(row[m.closed]) : "",
    fee: m.fee ? keep(row[m.fee]) : "",
    tel: m.tel ? keep(row[m.tel]) : "",
  };
  for (const k of Object.keys(stat)) if (got[k]) stat[k]++;
  const any = Object.values(got).some(Boolean);
  if (!any) {
    stat.none++;
    console.log(`·  ${t.name.padEnd(22)} 쓸 만한 칸이 없다`);
    continue;
  }
  // 🔎 **관광공사가 부른 이름을 같이 남긴다.** 나중에 「이 자료가 정말 이 곳 것인가」를
  //    다시 대조할 수 있어야 한다 — 사진에서 남의 가게가 붙었던 사고와 같은 대비다.
  out[t.id] = { ...Object.fromEntries(Object.entries(got).filter(([, v]) => v)), tourName: clean(c.row.title), type };
  const bits = [];
  if (got.sells) bits.push(`팝니다: ${got.sells.slice(0, 60)}`);
  if (got.hours) bits.push(`시간: ${got.hours.slice(0, 40)}`);
  if (got.fee) bits.push(`요금: ${got.fee.slice(0, 40)}`);
  console.log(`✅ ${t.name.padEnd(22)} ${bits.join(" | ")}`);
  await new Promise((f) => setTimeout(f, 80));
}

const n = Object.keys(out).length;
console.log(`\n─────────────────────────────────────────`);
console.log(`받은 곳 ${n}/${targets.length}`);
console.log(`  판매품목 ${stat.sells} · 영업시간 ${stat.hours} · 휴무 ${stat.closed} · 요금 ${stat.fee} · 전화 ${stat.tel}`);
console.log(`  쓸 만한 칸이 없던 곳 ${stat.none} · 못 물어본 곳 ${stat.failed}`);
if (stopped) console.log(`  시간이 다 되어 안 물어본 곳 ${stopped} — **다시 돌리면 채워진다**`);

// 🚨 **다 실패했는데 조용히 끝나면 안 된다.** 「받은 곳 0」은 성공이 아니다.
if (!n) {
  console.log("\n🚨 **한 곳도 못 받았다.** 관광공사 서버가 닫혀 있을 때가 있다 —");
  console.log("   조금 뒤에 다시 돌려 볼 것. (찔러보기 때는 6/6 다 됐다)");
  process.exit(1);
}
if (stat.failed > targets.length / 2) {
  console.log(`\n⚠️ **절반 넘게(${stat.failed}/${targets.length}) 못 받았다.** 서버가 되다 말다 하는 중이다.`);
  console.log("   저장하더라도 나중에 다시 돌려 빈 곳을 채울 것 — 이 스크립트는 **덮어쓰지 않고 합친다.**");
}

if (!APPLY) {
  console.log("\n📋 맛보기다(apply 를 안 켰다). 위 숫자를 보고 켤 것.");
  process.exit(0);
}
// 이미 있는 것과 합친다 — 갈래별로 나눠 돌릴 수 있게.
const old = existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf-8")) : {};
const merged = { ...(old["곳"] ?? {}), ...out };
writeFileSync(
  OUT,
  JSON.stringify(
    { 받은날: new Date().toISOString().slice(0, 10), 출처: "한국관광공사 TourAPI detailIntro2", 곳: merged },
    null,
    1,
  ) + "\n",
);
console.log(`\n✅ ${OUT} 에 모두 ${Object.keys(merged).length}곳을 적었다`);
