#!/usr/bin/env node
// 🔎 **이름을 대면 관광공사가 아는 것을 그대로 보여 준다.** 아무것도 저장하지 않는다.
//
// 사장님 (2026-09-13): 앱에 **경복궁·창덕궁·종묘·홍대·명동·가로수길이 없다**는 것을
// 확인하고 "시작하고"라고 하셨다. 외국 손님이 서울 와서 제일 먼저 찾는 이름들이
// 통째로 빠져 있었다 — 오늘 표지로 쓴 창덕궁·종묘 사진은 있는데 그 장소가 앱에 없다.
//
// ── 왜 fetch-tour-places.mjs 를 안 쓰나 ─────────────────────────────────
// 그건 **지역 전체를 쓸어 오는** 스크립트다(areaBasedList → 수천 건 → 규칙으로 거름).
// 지금 필요한 건 **이름 여섯 개**뿐이다. 쓸어 오면 호출 한도(429)만 축낸다.
// 여기서는 searchKeyword2 로 이름마다 한 번씩만 묻는다.
//
// ── 🚨 검색 결과를 그대로 믿지 않는다 ───────────────────────────────────
// Kfood 에서 데인 자리다 — 검색 결과를 그 가게 자료로 저장했다가 **남의 가게**가 들어갔다.
// 그래서 여기서도 **화면에 찍기만** 한다. seed.ts 에 넣는 것은 사람이 눈으로 보고 정한다.
//  · 서울 것만 남긴다(주소에 '서울'). 「명동」은 전국에 여럿이다.
//  · 제목에 찾는 이름이 실제로 들어 있는지 따로 표시한다(NFC 로 맞춘 뒤 비교).
//
// ── 돌리는 법 ───────────────────────────────────────────────────────────
//   TOUR_API_KEY=키 node scripts/lookup-places.mjs 경복궁 창덕궁 종묘
//
// ⚠️ 작업 세션(샌드박스)은 apis.data.go.kr 이 막혀 있어 직접 못 돌린다.
//    .github/workflows/lookup-places.yml 로 Actions 에서 돌린다.

const API_KEY = process.env.TOUR_API_KEY;
if (!API_KEY) {
  console.error("TOUR_API_KEY 환경변수가 없다.");
  process.exit(1);
}

const argv = process.argv.slice(2);
const args = argv.filter((a) => !a.startsWith("--"));
const NAMES = args.length ? args : ["경복궁", "창덕궁", "종묘", "홍대", "명동", "가로수길"];
const PER = 8;

/**
 * 🏙️ **어느 도시에서 찾나** (2026-09-24에 이걸로 헛돌았다).
 *
 * 이 파일은 areaCode 를 **"1"(서울)로 박아 두고**, 주소에 「서울」이 든 것만 남기고 있었다.
 * 그래서 부산 곳 열 개를 물었더니 **열 개 다 「서울에서는 안 나온다」**로 끝났다.
 * 워크플로는 초록이었고 오류도 없었다 — 그냥 서울에서 찾고 있었던 것이다.
 *
 * 도시가 둘이 된 뒤로 「서울만」은 더 이상 기본값이 아니다. 그래서 밖에서 받는다.
 * 지역 번호는 관광공사 areaCode 다 — 서울 1 · 부산 6.
 */
const CITIES = {
  "1": { code: "1", label: "서울", addr: "서울" },
  "6": { code: "6", label: "부산", addr: "부산" },
};
const areaArg = (argv.find((a) => a.startsWith("--area=")) ?? "").split("=")[1] ?? "1";
const CITY = CITIES[areaArg] ?? CITIES["1"];
if (!CITIES[areaArg]) console.log(`⚠️ 모르는 지역 번호 「${areaArg}」 — 서울로 찾는다`);
console.log(`🏙️ ${CITY.label}에서 찾는다 (areaCode ${CITY.code})\n`);

const ROOT = "https://apis.data.go.kr/B551011/KorService2";

/** serviceKey 를 URLSearchParams 에 안 넣는 이유 — 이미 URL 인코딩된 값이라
 *  이중 인코딩되면 깨진다 (fetch-coords.mjs 주석 참고). */
async function call(path, extra) {
  const params = new URLSearchParams({
    MobileOS: "ETC",
    MobileApp: "KStreet",
    _type: "json",
    ...extra,
  });
  const url = `${ROOT}/${path}?serviceKey=${API_KEY}&${params.toString()}`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
    const text = await res.text();
    if (res.status === 429) return { why: "호출 한도 초과(429) — 자정이 지나면 초기화된다" };
    let json = null;
    if (text.trim().startsWith("{")) {
      try {
        json = JSON.parse(text);
      } catch {
        /* 아래 raw */
      }
    }
    if (!json) return { why: `HTTP ${res.status} · ${text.replace(/\s+/g, " ").slice(0, 240)}` };
    return { json };
  } catch (e) {
    return { why: `못 열었다 (${String(e?.cause?.code ?? e.name).slice(0, 40)})` };
  }
}

function itemsOf(json) {
  const it = json?.response?.body?.items;
  if (!it || typeof it === "string") return [];
  const arr = it.item;
  return Array.isArray(arr) ? arr : arr ? [arr] : [];
}

// 🚨 한글은 자모 분해형(NFD)으로 오는 일이 있다. 보이는 게 같다고 같은 문자열이 아니다.
const norm = (s) => (s ?? "").normalize("NFC").replace(/\s+/g, "");

/** 관광공사 분류 번호 → 우리 갈래. 확실한 것만 적고 나머지는 사람이 정한다. */
const TYPE = {
  12: "관광지 (→ street? museum? 사람이 정할 것)",
  14: "문화시설 (→ museum)",
  15: "축제·공연·행사 (→ festival)",
  25: "여행코스",
  28: "레포츠",
  32: "숙박",
  38: "쇼핑 (→ market)",
  39: "음식점",
};

for (const name of NAMES) {
  console.log("\n" + "═".repeat(66));
  console.log(`🔎 「${name}」`);
  console.log("═".repeat(66));

  const r = await call("searchKeyword2", {
    numOfRows: String(PER * 4),
    pageNo: "1",
    arrange: "O",
    keyword: name,
    areaCode: CITY.code,
  });
  if (r.why) {
    console.log(`   ⬜ 못 물어봤다 — ${r.why}`);
    console.log(`   ⚠️ 이건 "없다"는 뜻이 아니다. 둘을 뭉개지 않는다.`);
    await new Promise((s) => setTimeout(s, 600));
    continue;
  }

  const items = itemsOf(r.json);
  const inCity = items.filter((it) => (it.addr1 ?? "").includes(CITY.addr));
  console.log(`   받은 것 ${items.length}건 · ${CITY.label} ${inCity.length}건`);
  if (!inCity.length) {
    console.log(`   ❌ ${CITY.label}에서는 안 나온다. 다른 낱말로 다시 찾아볼 것.`);
    await new Promise((s) => setTimeout(s, 600));
    continue;
  }

  for (const [i, it] of inCity.slice(0, PER).entries()) {
    const hit = norm(it.title).includes(norm(name));
    console.log(`\n   ${hit ? "✅" : "△ "} ${i + 1}. ${it.title}`);
    console.log(`      주소   ${it.addr1 ?? "?"} ${it.addr2 ?? ""}`.trimEnd());
    console.log(`      갈래   ${TYPE[Number(it.contenttypeid)] ?? `분류 ${it.contenttypeid}`}`);
    console.log(`      좌표   ${it.mapy ?? "?"}, ${it.mapx ?? "?"}`);
    console.log(`      사진   ${it.firstimage || "(없음)"}`);
    console.log(`      번호   contentid ${it.contentid}`);
    if (!hit) console.log(`      ⚠️ 제목에 「${name}」이 없다 — 다른 곳일 수 있다`);
  }
  // 연달아 두드리면 막는다. 천천히.
  await new Promise((s) => setTimeout(s, 600));
}

console.log(`
${"─".repeat(66)}
🚨 **이 목록을 그대로 seed.ts 에 넣지 않는다.**
   ✅ 는 제목에 이름이 든 것, △ 는 아닌 것이다. 같은 이름이 여러 건이면
   주소와 분류를 보고 **사람이** 고른다. 애매하면 비워 둔다 — 빈 칸이 틀린 것보다 낫다.`);
