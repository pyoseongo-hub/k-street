// 🏛️ **축제의 확정 날짜를 「해당 구청」에서 받아온다.**
//
// 사장님 지시 (2026-09-12): "관광공사 말고 해당구청봐"
//
// ─────────────────────────────────────────────────────────────────────────
// 🚨 왜 관광공사로는 안 되는가 — 오늘 실제로 재 봤다
// ─────────────────────────────────────────────────────────────────────────
//   scripts/fetch-festival-dates.mjs 는 한국관광공사 searchFestival2 를 매일 부른다.
//   그런데 **올해 확정 날짜가 올라온 우리 축제는 0곳**이었다.
//   관광공사는 축제가 다 끝나고 나서 정리되는 자리라, 손님이 필요한 「이번 주에
//   열리나」를 못 알려 준다.
//
//   구청·구 문화재단은 다르다. 행사를 **자기가 주최하므로** 확정되는 즉시 올린다.
//   오늘 표본으로 본 등록일(RGSTDATE)이 그대로 근거다 —
//     · 2026 동작 빵도동 축제 (10/31)  → 8/31 등록
//     · 2026 서울 바비큐 페스티벌 (10/24) → 9/8 등록
//     · 2026 윤동주문학제 (10/17)      → 8/18 등록
//   사장님이 말한 "고지가 몇일전에 올라오거나 하니"가 숫자로 확인된다.
//
// ─────────────────────────────────────────────────────────────────────────
// 🏛️ 25개 구청을 따로따로 긁지 않는다 — **한 자리에 모인다**
// ─────────────────────────────────────────────────────────────────────────
//   구청 25곳 홈페이지는 도메인도 생김새도 제각각이다(성동 sd.go.kr/tour,
//   중구 junggu.seoul.kr/tour …). 25개를 따로 긁으면 **25개가 따로 망가진다.**
//
//   그럴 필요가 없다. 서울시 문화포털(culture.seoul.go.kr)이 **구청과 구 문화재단이
//   직접 등록하는 자리**이고, 그게 열린데이터광장 culturalEventInfo 로 그대로 나온다.
//   오늘 확인한 표본에 ORG_NAME 이 이렇게 찍혀 있다 —
//     「종로구청」 · 「성동문화재단」 · 「광진문화재단」 · 「동작문화재단」
//   즉 이건 "서울시 자료"가 아니라 **구청 자료가 모인 자리**다. 축제만 1,492건.
//
//   ⚠️ 그래서 **출처를 그대로 적어 둔다**(org·orgLink). 화면에서 「누가 알려 준
//      날짜인가」를 말할 수 있어야 한다. 출처 없는 날짜는 이 앱에 넣지 않는다.
//
// ─────────────────────────────────────────────────────────────────────────
// 🚨 이름으로 잇는다 — 그래서 더 깐깐하게 본다
// ─────────────────────────────────────────────────────────────────────────
//   관광공사 쪽은 contentId 로 이었다(fetch-festival-dates.mjs 주석). 여기는
//   **공통 번호가 없어서 이름으로 맞출 수밖에 없다.** 이 저장소가 이름 대조로
//   여러 번 데인 자리라(NFC 분해형, 띄어쓰기, 옛 이름), 두 가지로 막는다:
//     ① **정확히 맞은 것만 저장한다.** 비슷한 것은 저장하지 않고 「사람이 볼 후보」로만 낸다.
//     ② 구(GUNAME)까지 같아야 한다. 이름이 겹치는 행사가 다른 구에 있다.
//   ⏳ 지난 날짜는 아예 안 받는다 — 작년 회차를 올해 날짜처럼 보여 주면 헛걸음이다.
//
// ─────────────────────────────────────────────────────────────────────────
// 돌리는 법
// ─────────────────────────────────────────────────────────────────────────
//   진짜로 받기(저장) — 열린데이터광장 인증키가 있어야 한다:
//     SEOUL_OPEN_API_KEY=xxxx npm run gu-festival-dates -- --apply
//   맛보기(저장 안 함):
//     npm run gu-festival-dates
//
//   열쇠는 공짜다: https://data.seoul.go.kr → 인증키 신청 (즉시 발급)
//
//   🛑 **열쇠 없이는 사실상 못 돈다.** 시험용 'sample' 열쇠로도 되는 줄 알고
//      그 길을 만들어 뒀는데(한 번에 5줄), **몇 번 부르고 나면 막힌다** —
//      2026-09-12에 80곳을 돌렸더니 전부 INFO-100(인증키가 유효하지 않습니다)이었다.
//      손으로 한두 번 눌러 「어떻게 생긴 자료인가」를 보는 데까지만 쓸 수 있다.
import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { ALL_FESTIVALS, type Place } from "../src/data/seed";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "src", "data", "gu-festival-dates.json");

const APPLY = process.argv.includes("--apply");
const KEY = process.env.SEOUL_OPEN_API_KEY?.trim();
/** 열쇠가 없으면 시험용 'sample' 로 **맛보기만** 한다. 저장은 막는다. */
const USING_SAMPLE = !KEY;
const AUTH = KEY ?? "sample";

if (APPLY && USING_SAMPLE) {
  console.error(
    "❌ --apply 를 하려면 SEOUL_OPEN_API_KEY 가 있어야 한다.\n" +
      "   'sample' 열쇠는 한 번에 5줄까지만 주므로 그걸로 저장하면 **대부분이 빈 칸**이 된다.\n" +
      "   공짜 열쇠: https://data.seoul.go.kr → 인증키 신청",
  );
  process.exit(1);
}

const API = "http://openapi.seoul.go.kr:8088";
const TODAY = new Date().toISOString().slice(0, 10);

/**
 * 이름을 **대조용으로** 다듬는다.
 *
 * 문화포털 제목은 앞에 기관을 달고 나온다 — 「[성동문화재단] 2025 서울숲 재즈 페스티벌」.
 * 우리 이름은 「서울숲 재즈 페스티벌」이다. 그대로 비교하면 한 건도 안 맞는다.
 *
 * ⚠️ **NFC 정규화를 맨 앞에 한다.** 자모 분해형(NFD)이 섞여 오면 화면에는 똑같이
 *    보이는데 문자열이 달라 하나도 안 맞는다 — 유튜브 제목에서 똑같이 당한 적이 있다.
 */
function key(name: string): string {
  return name
    .normalize("NFC")
    .replace(/\[[^\]]*\]/g, " ") // [성동문화재단]
    .replace(/\([^)]*\)/g, " ") // (서울)
    .replace(/\b(19|20)\d{2}\b/g, " ") // 회차 연도 — 해마다 바뀌므로 뺀다
    .replace(/제\s*\d+\s*회/g, " ") // 제12회
    .replace(/[^0-9A-Za-z가-힣]/g, "") // 띄어쓰기·가운뎃점·물결 전부 뺀다
    .toLowerCase();
}

interface Row {
  CODENAME?: string;
  GUNAME?: string;
  TITLE?: string;
  DATE?: string;
  PLACE?: string;
  ORG_NAME?: string;
  ORG_LINK?: string;
  HMPG_ADDR?: string;
  STRTDATE?: string;
  END_DATE?: string;
  RGSTDATE?: string;
  USE_FEE?: string;
  PRO_TIME?: string;
  /** 경도·위도. 문자열로 온다 */
  LOT?: string;
  LAT?: string;
}

/**
 * 🗺️ 서울 안인가. 이상한 좌표는 **안 쓴다** — 지어내는 것보다 비워 두는 게 낫다.
 *    서울은 대략 위도 37.4~37.7 · 경도 126.7~127.2 안에 있다.
 */
function coord(lat?: string, lng?: string): { lat: number; lng: number } | undefined {
  const la = Number(lat);
  const ln = Number(lng);
  if (!Number.isFinite(la) || !Number.isFinite(ln)) return undefined;
  if (la < 37.3 || la > 37.75 || ln < 126.6 || ln > 127.25) return undefined;
  return { lat: la, lng: ln };
}

/** 「2026-10-17 00:00:00.0」 → 「2026-10-17」. 못 읽으면 undefined — 지어내지 않는다. */
const ymd = (s: string | undefined): string | undefined =>
  /^\d{4}-\d{2}-\d{2}/.test(s ?? "") ? s!.slice(0, 10) : undefined;

/**
 * 🕵️ **브라우저처럼 보이게 UA 를 붙인다.**
 *
 * 처음엔 안 붙였다가 **80번을 전부 실패**했다 — 열린데이터광장이 `/json/` 으로
 * 불러도 XML 오류를 돌려준다. 같은 주소를 fetch-page-text.mjs(UA 를 붙인다)로
 * 열면 멀쩡히 JSON 이 왔다. 그 차이가 UA 하나였다.
 */
const UA =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36";

async function call(path: string): Promise<Row[]> {
  const url = `${API}/${AUTH}/json/culturalEventInfo/${path}`;
  const res = await fetch(url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(30000) });
  if (!res.ok) throw new Error(`HTTP ${res.status} — ${url.replace(AUTH, "…")}`);
  const text = await res.text();
  let data: { culturalEventInfo?: { RESULT?: { CODE?: string; MESSAGE?: string }; row?: Row[] } };
  try {
    data = JSON.parse(text);
  } catch {
    // 🚨 **받은 글을 그대로 보여 준다.** 처음엔 "is not valid JSON" 만 찍혀서
    //    80줄이 똑같은 말만 하고 원인을 하나도 안 알려 줬다. 오류는 다음 사람이
    //    읽고 고칠 수 있어야 오류다.
    throw new Error(`JSON 이 아니다 — 받은 글: ${text.slice(0, 160).replace(/\s+/g, " ")}`);
  }
  const code = data.culturalEventInfo?.RESULT?.CODE;
  // INFO-200 = 해당하는 자료가 없다. 오류가 아니라 **없다는 답**이다.
  if (code === "INFO-200") return [];
  if (code && code !== "INFO-000")
    throw new Error(`${code} — ${data.culturalEventInfo?.RESULT?.MESSAGE ?? ""}`);
  return data.culturalEventInfo?.row ?? [];
}

/** 열쇠가 있을 때 — 축제를 통째로 받아 온다(1,000줄씩). */
async function fetchAllFestivals(): Promise<Row[]> {
  const out: Row[] = [];
  for (let start = 1; start <= 4001; start += 1000) {
    const rows = await call(`${start}/${start + 999}/${encodeURIComponent("축제")}/`);
    out.push(...rows);
    if (rows.length < 1000) break;
  }
  return out;
}

/** 열쇠가 없을 때 — 우리 축제 이름으로 하나씩 물어본다(한 번에 5줄). */
async function fetchByTitles(festivals: Place[]): Promise<Row[]> {
  const out: Row[] = [];
  for (const f of festivals) {
    // 제목 칸은 **부분 일치**로 찾는다. 앞머리 몇 글자가 가장 잘 맞는다 —
    // 「2025 서울한옥위크」처럼 연도가 붙어 오기 때문에 통째로 넣으면 0건이 된다.
    const q = f.name.normalize("NFC").replace(/\s*\(.*$/, "").split(/\s+/).slice(0, 2).join(" ");
    if (!q) continue;
    try {
      out.push(...(await call(`1/5/%20/${encodeURIComponent(q)}/`)));
    } catch (e) {
      const msg = (e as Error).message;
      // 🛑 **똑같은 오류를 80줄 찍지 않는다.** 시험용 'sample' 열쇠는 몇 번만 봐 주고
      //    그 뒤로는 INFO-100(인증키가 유효하지 않습니다)을 돌려준다 — 실제로 한 번
      //    80줄이 전부 같은 말이었고, 그 벽 때문에 진짜 원인을 늦게 찾았다.
      //    한 번 나오면 거기서 멈추고 **무엇을 해야 하는지**를 한 줄로 말한다.
      if (msg.includes("INFO-100")) {
        console.log(
          `\n🛑 시험용 'sample' 열쇠가 막혔다 (INFO-100). 몇 번까지만 봐 주는 열쇠라 여기까지다.\n` +
            `   공짜 열쇠를 받으면 한 번에 1,000줄씩 받는다: https://data.seoul.go.kr → 인증키 신청\n`,
        );
        break;
      }
      console.log(`   ⚠️ ${f.name} — ${msg}`);
    }
  }
  return out;
}

const festivals = ALL_FESTIVALS.filter((f) => f.gu);
console.log(
  `🎪 우리 축제 ${festivals.length}곳 · 열쇠 ${USING_SAMPLE ? "없음(맛보기, 이름으로 하나씩)" : "있음(통째로)"}\n`,
);

const rows = USING_SAMPLE ? await fetchByTitles(festivals) : await fetchAllFestivals();

// 축제만, 서울 25구만, **아직 안 끝난 것만**.
const live = rows.filter((r) => {
  if (!r.CODENAME?.startsWith("축제")) return false;
  if (!r.GUNAME) return false;
  const end = ymd(r.END_DATE) ?? ymd(r.STRTDATE);
  return !!end && end >= TODAY;
});
console.log(`🏛️ 받은 줄 ${rows.length}개 · 그중 축제이고 아직 안 끝난 것 ${live.length}개\n`);

// 같은 축제가 여러 줄로 올 수 있다(회차별). **가장 빨리 시작하는 것**을 쓴다 —
// 손님이 다음에 갈 수 있는 날짜가 그것이다.
const byKey = new Map<string, Row>();
for (const r of live) {
  const k = `${r.GUNAME}|${key(r.TITLE ?? "")}`;
  const cur = byKey.get(k);
  if (!cur || (ymd(r.STRTDATE) ?? "9999") < (ymd(cur.STRTDATE) ?? "9999")) byKey.set(k, r);
}

interface Hit {
  start: string;
  end?: string;
  title: string;
  /**
   * 🗺️ **그해 열리는 구.** 우리 자료와 다를 수 있고, 다르면 **이쪽이 맞다** —
   *    주최자가 올린 것이기 때문이다.
   *
   *    2026-09-12에 이걸로 실제 사고를 하나 잡았다. 서울라이트 한강 빛섬축제는
   *    **한강 6개 섬을 해마다 순회**한다(난지·여의·선유도·서래·노들·뚝섬).
   *    2025년은 뚝섬(광진구), **2026년은 노들섬(용산구)**. 우리 자료는 관광공사에서
   *    받은 **작년 회차**라 광진구로 적혀 있었다 — 손님을 한강 건너편으로 보낼 뻔했다.
   *    사장님이 공식 사이트에서 직접 확인해 줬다: 「10.2~10.11 · 노들섬」.
   *
   *    🚨 그래서 **손으로 고치지 않는다.** 손으로 고치면 내년에 또 틀리고,
   *       그때는 아무도 모른다. 해마다 받아서 따라가게 둔다.
   */
  gu: string;
  /** 「노들섬」처럼 주최 측이 적은 장소 이름 */
  place?: string;
  lat?: number;
  lng?: number;
  /** 「18:30~22:30」 */
  time?: string;
  org?: string;
  orgLink?: string;
  page?: string;
  registered?: string;
  source: "seoul-culture-portal";
  fetchedAt: string;
}

/**
 * 🗺️ **구는 깨는 패가 아니라 참고다** (2026-09-12에 고침).
 *
 * 처음엔 「이름이 같고 **구도 같아야** 맞은 것」으로 했다. 첫 실행에서 걸렸다 —
 *   우리    서울라이트 한강 빛섬축제 · **광진구** (뚝섬한강공원, 강변북로 2273)
 *   문화포털 서울라이트 한강 빛섬축제 · **용산구**
 * 같은 축제인데 구가 다르다. 한강 축제는 여러 한강공원에 걸쳐 열리고,
 * 문화포털은 **대표 장소 한 곳**의 구만 적기 때문이다. 구를 못 박으면 이런 것을
 * 영영 못 맞춘다 — 그리고 정작 손님이 가장 궁금해하는 게 이런 큰 축제다.
 *
 * 그래서 이렇게 가른다:
 *   · 이름이 **꼭 맞는 게 하나뿐**이면  → 받는다. 구가 다르면 ⚠️ 로 적어 사람이 보게 한다
 *   · 이름이 꼭 맞는 게 **여럿**이면    → 그중 구까지 같은 하나가 있을 때만 받는다
 *   · 그것도 아니면                    → 안 받는다. 「사람이 볼 후보」로만 낸다
 *
 * 느슨해진 게 아니다 — **이름은 여전히 꼭 맞아야 한다.** 다만 구 하나가
 * 어긋났다고 버리지 않을 뿐이다.
 */
const byName = new Map<string, Row[]>();
for (const r of byKey.values()) {
  const k = key(r.TITLE ?? "");
  const arr = byName.get(k);
  if (arr) arr.push(r);
  else byName.set(k, [r]);
}

const hits: Record<string, Hit> = {};
const near: string[] = [];
const guDiff: string[] = [];
const missed: Place[] = [];

for (const f of festivals) {
  const k = key(f.name);
  const cands = byName.get(k) ?? [];
  const exact =
    cands.length === 1
      ? cands[0]
      : cands.filter((c) => c.GUNAME === f.gu).length === 1
        ? cands.find((c) => c.GUNAME === f.gu)
        : undefined;
  if (exact) {
    const start = ymd(exact.STRTDATE);
    if (!start) continue;
    if (exact.GUNAME !== f.gu)
      guDiff.push(`   「${f.name}」 — 우리는 ${f.gu}, 문화포털은 ${exact.GUNAME}`);
    hits[f.id] = {
      start,
      ...(ymd(exact.END_DATE) && ymd(exact.END_DATE) !== start ? { end: ymd(exact.END_DATE)! } : {}),
      title: (exact.TITLE ?? "").normalize("NFC"),
      gu: exact.GUNAME!,
      // 🗺️ **장소도 같이 받는다.** 날짜만 받고 장소를 작년 것으로 두면
      //    「올해 날짜 · 작년 장소」라는 반쪽짜리가 화면에 뜬다 — 그게 제일 나쁘다.
      ...(exact.PLACE?.trim() ? { place: exact.PLACE.trim().normalize("NFC") } : {}),
      ...(coord(exact.LAT, exact.LOT) ?? {}),
      ...(exact.PRO_TIME?.trim() ? { time: exact.PRO_TIME.trim() } : {}),
      ...(exact.ORG_NAME ? { org: exact.ORG_NAME } : {}),
      ...(exact.ORG_LINK ? { orgLink: exact.ORG_LINK } : {}),
      ...(exact.HMPG_ADDR ? { page: exact.HMPG_ADDR } : {}),
      ...(ymd(exact.RGSTDATE) ? { registered: ymd(exact.RGSTDATE)! } : {}),
      source: "seoul-culture-portal",
      fetchedAt: TODAY,
    };
    continue;
  }
  // 🔎 **비슷한 것은 저장하지 않는다.** 사람이 볼 후보로만 낸다 —
  //    이름 대조는 이 저장소가 여러 번 틀린 자리다. 애매하면 비워 둔다.
  //    ⚠️ 여기서는 구를 안 본다. 위에서 구를 깨는 패로 안 쓰기로 했으니
  //       후보를 찾을 때도 같은 잣대여야 한다 — **잣대가 둘이면 반쪽 적용이 생긴다.**
  for (const r of byKey.values()) {
    const name = key(r.TITLE ?? "");
    // 너무 짧은 이름은 아무 데나 들어간다(「축제」 두 글자가 56곳에 다 걸린다).
    if (Math.min(name.length, k.length) < 5) continue;
    if (name.includes(k) || k.includes(name)) {
      near.push(
        `   「${f.name}」(${f.gu})  ≈  「${r.TITLE}」(${r.GUNAME})  ${r.DATE}`,
      );
      break;
    }
  }
  missed.push(f);
}

const n = Object.keys(hits).length;
console.log(`✅ 확정 날짜를 찾은 축제 ${n}곳`);
for (const [id, h] of Object.entries(hits).slice(0, 40))
  console.log(
    `   ${h.gu.padEnd(5)} ${h.start}${h.end ? `~${h.end}` : ""}  ${h.title}` +
      `${h.org ? `  · ${h.org}` : ""}${h.registered ? `  (등록 ${h.registered})` : ""}  [id ${id}]`,
  );

if (guDiff.length) {
  console.log(`\n⚠️ 이름은 같은데 **구가 다른** 것 ${guDiff.length}건 — 받긴 받았다:`);
  for (const l of guDiff) console.log(l);
  console.log("   한강 축제처럼 여러 구에 걸친 행사라 그렇다. 엉뚱한 축제면 여기서 보인다.");
}

if (near.length) {
  console.log(`\n🔎 **사람이 봐야 할 후보** ${near.length}건 — 저장하지 않았다:`);
  for (const l of near.slice(0, 30)) console.log(l);
  console.log("   같은 축제가 맞으면 src/data/name-aliases.json 에 적어 둔다.");
}

console.log(`\n⏳ 아직 확정 날짜가 없는 축제 ${missed.length}곳 — 정상이다.`);
console.log("   구청이 아직 안 올렸다는 뜻이고, 올라오면 이 작업이 다음 날 잡는다.");

// 🆕 **구청에는 올라왔는데 우리 화면에는 없는 축제** — 이 목록이 진짜 값나가는 자리다.
//
//    첫 실행(2026-09-12)에서 곧 열리는 축제 59개 중 우리 것과 맞은 건 2곳뿐이었다.
//    그 숫자만 보면 「대조가 잘 안 된다」로 읽히는데, **둘 중 무엇인지 갈라 봐야 한다** —
//      ① 이름 표기가 달라서 못 맞춘 것  → src/data/name-aliases.json 에 적으면 붙는다
//      ② 애초에 우리 앱에 **없는 축제**  → 들일지 사람이 정한다
//    이 목록을 안 찍으면 둘을 못 가른다. 그래서 **날짜순으로 전부** 내보낸다.
//
//    ⚠️ 여기 있는 것을 자동으로 앱에 넣지 않는다. 사진·좌표·번역이 따라와야 하고,
//       우리 앱은 「서울 관광객이 갈 만한 곳」을 고르는 자리지 행사 목록이 아니다.
const matchedKeys = new Set(
  Object.values(hits).map((h) => `${h.gu}|${key(h.title)}`),
);
const notOurs = [...byKey.entries()]
  .filter(([kk]) => !matchedKeys.has(kk))
  .map(([, r]) => r)
  .sort((a, b) => (ymd(a.STRTDATE) ?? "").localeCompare(ymd(b.STRTDATE) ?? ""));

if (notOurs.length) {
  console.log(`\n🆕 구청에는 있는데 우리 화면에 없는 축제 ${notOurs.length}곳:`);
  for (const r of notOurs)
    console.log(
      `   ${(r.GUNAME ?? "").padEnd(5)} ${r.DATE ?? ""}  ${(r.TITLE ?? "").normalize("NFC")}` +
        `${r.ORG_NAME ? `  · ${r.ORG_NAME}` : ""}`,
    );
  console.log(
    "   ① 이름만 다른 것이면 src/data/name-aliases.json 에 적는다 → 다음 실행부터 붙는다",
  );
  console.log("   ② 정말 없는 축제면 들일지 사람이 정한다 (사진·좌표·번역이 따라와야 한다)");
}

if (!APPLY) {
  console.log(
    `\n🔍 맛보기라 **저장하지 않았다**.${
      USING_SAMPLE ? " (열쇠가 없어 'sample' 로 봤다 — 한 번에 5줄까지라 놓친 것이 있다)" : ""
    }\n   저장하려면: SEOUL_OPEN_API_KEY=xxxx npm run gu-festival-dates -- --apply`,
  );
  process.exit(0);
}

// 🔀 **덮어쓰지 않고 합친다.** 오늘 못 받은 축제의 예전 날짜를 지우면, 한 번
//    실패한 날에 화면에서 날짜가 통째로 사라진다(fetch-tour-places 가 데인 자리다).
//    다만 **이미 지난 날짜는 버린다** — 작년 회차를 올해처럼 보여 주면 헛걸음이다.
const prev: Record<string, Hit> = existsSync(OUT)
  ? (JSON.parse(readFileSync(OUT, "utf-8")).곳 ?? {})
  : {};
const merged: Record<string, Hit> = {};
for (const [id, h] of Object.entries(prev)) if ((h.end ?? h.start) >= TODAY) merged[id] = h;
Object.assign(merged, hits);

writeFileSync(
  OUT,
  JSON.stringify(
    {
      설명:
        "구청·구 문화재단이 서울시 문화포털에 직접 올린 축제 확정 날짜. " +
        "scripts/fetch-gu-festival-dates.ts 가 받는다. 손으로 고치지 말 것.",
      받은날: TODAY,
      곳: merged,
    },
    null,
    1,
  ) + "\n",
);
console.log(`\n💾 ${Object.keys(merged).length}곳을 src/data/gu-festival-dates.json 에 저장했다.`);
