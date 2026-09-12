// 🔎 **서울 열린데이터광장에 어떤 서비스가 있나 — 이름을 직접 두드려 본다.**
//
// 왜 이렇게 하나 (2026-09-12):
//   데이터셋 안내 페이지(data.seoul.go.kr/dataList/OA-1176/…)는 **자바스크립트로
//   그려진다.** 러너가 받아 온 79,301자 안에 「서비스명」도 샘플 주소도 없었다.
//   글로는 못 읽으니 **API 에게 직접 물어본다.**
//
// 열린데이터광장은 없는 이름에 또렷하게 답한다:
//   · ERROR-300/310 → **그런 서비스가 없다**
//   · INFO-200      → 서비스는 있는데 그 범위에 자료가 없다
//   · INFO-000      → **있다.** 첫 줄의 칸 이름을 그대로 보여 준다
// 그래서 한 번 돌리면 「있다/없다」가 갈린다. 찍어서 맞히는 게 아니라 **재는 것**이다.
//
// ⚠️ 인증키는 시크릿에서만 온다. 저장소에 한 글자도 안 적는다.
// 🚨 아무것도 커밋하지 않는다. **보기만 한다.**

const KEY = process.env.SEOUL_OPEN_API_KEY ?? "";
if (!KEY) {
  console.error("❌ SEOUL_OPEN_API_KEY 가 없다 — 워크플로에 시크릿을 넘겼는지 볼 것.");
  process.exit(1);
}

// 🕵️ UA 를 안 보내면 /json/ 을 달라고 해도 **XML 이 온다** (2026-09-12에 80번 헛돌았다).
const UA =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36";

/**
 * 두드려 볼 이름들. 열린데이터광장의 서비스 이름은 **영문 낙타표기**다
 * (culturalEventInfo · SearchSTNBySubwayLineInfo …).
 * 찾는 것은 둘 —
 *   ① 전통시장 (아케이드·지붕이 있는지 알 수 있으면 「비 오는 날」에 넣는다)
 *   ② 지하도상가 (서울시설공단 25곳)
 * 덤으로 지하철역 좌표도 물어본다 — 지하도상가는 전부 역에 붙어 있어서,
 * 역 좌표를 알면 상가 자리도 안다.
 */
const CANDIDATES = [
  // ① 전통시장
  "TraditionalMarket",
  "SdeTraditionalMarket",
  "TbTraditionalMarket",
  "ListTraditionalMarket",
  "traditionalMarket",
  "SeoulTraditionalMarket",
  "InfoTraditionalMarket",
  // ② 지하도상가
  "UndergroundShoppingMall",
  "TbUndergroundShop",
  "undergroundShop",
  "SdeUndergroundMall",
  "ListUndergroundShoppingMall",
  // ③ 지하철역 (덤)
  "subwayStationMaster",
  "SearchSTNBySubwayLineInfo",
  "subwayStationInfo",
  // ④ 잘 되는 것 하나 — **재는 자가 맞는지 먼저 확인한다.**
  //    이게 INFO-000 이 아니면 문제는 이름이 아니라 키나 그물이다.
  "culturalEventInfo",
];

// 🔧 워크플로에서 이름을 따로 넘길 수 있게 한다 — 한 번 돌리고 나서
//    「이건 어때?」 하고 **다시 고쳐 커밋하지 않아도** 되게.
const EXTRA = (process.env.NAMES ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const NAMES = EXTRA.length ? EXTRA : CANDIDATES;

async function probe(name) {
  const url = `http://openapi.seoul.go.kr:8088/${KEY}/json/${name}/1/3/`;
  try {
    const r = await fetch(url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(20000) });
    const text = await r.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return { ok: false, why: `JSON 이 아니다 — ${text.slice(0, 90).replace(/\s+/g, " ")}` };
    }
    // 응답 모양이 두 가지다: { RESULT: {...} } 또는 { <서비스명>: { RESULT, row } }
    const box = data[name] ?? data;
    const code = box?.RESULT?.CODE ?? data?.RESULT?.CODE ?? "(코드 없음)";
    const msg = box?.RESULT?.MESSAGE ?? data?.RESULT?.MESSAGE ?? "";
    const total = box?.list_total_count;
    const cols = box?.row?.[0] ? Object.keys(box.row[0]) : [];
    return { ok: true, code, msg, total, cols };
  } catch (e) {
    return { ok: false, why: e?.cause?.code || e?.name || e?.message };
  }
}

console.log(`🔎 서울 열린데이터광장에 ${NAMES.length}개 이름을 두드려 본다\n`);

const found = [];
for (const name of NAMES) {
  const r = await probe(name);
  if (!r.ok) {
    console.log(`❌ ${name.padEnd(30)} 못 물어봤다: ${r.why}`);
    continue;
  }
  if (r.code === "INFO-000") {
    found.push({ name, total: r.total, cols: r.cols });
    console.log(`✅ ${name.padEnd(30)} 있다! 모두 ${r.total ?? "?"}줄`);
    if (r.cols.length) console.log(`   칸: ${r.cols.join(" · ")}`);
  } else {
    console.log(`·  ${name.padEnd(30)} ${r.code} ${r.msg}`);
  }
  await new Promise((f) => setTimeout(f, 150));
}

console.log(`\n찾은 서비스 ${found.length}개`);
if (NAMES.includes("culturalEventInfo") && !found.some((f) => f.name === "culturalEventInfo")) {
  console.log("🚨 **잘 되는 줄 알았던 culturalEventInfo 도 안 됐다.**");
  console.log("   그러면 문제는 이름이 아니라 **인증키나 길**이다. 그쪽부터 볼 것.");
}
