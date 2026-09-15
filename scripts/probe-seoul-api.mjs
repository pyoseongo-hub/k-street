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

/**
 * 🔬 **칸 이름만 봐서는 모자랄 때가 있다** (2026-09-15).
 *
 * 엘리베이터(tbTraficElvtr)를 두드렸더니 「있다, 552줄」까지는 나왔는데,
 * 정작 알고 싶은 것 — **「○○역 3번 출구」의 출구 번호가 들어 있나** — 는
 * 칸 이름 줄만 봐서는 알 수 없었다. 이름이 애매하면 **값을 봐야 안다.**
 *
 * 그래서 DUMP=1 이면 첫 줄을 **통째로** 찍는다. 칸 이름 + 실제 값이라
 * 「NODE_WKT 가 좌표구나」 같은 것이 한 번에 갈린다.
 * 🚨 여전히 **보기만 한다** — 아무것도 저장하지 않는다.
 */
const DUMP = /^(1|true|yes|on)$/i.test(process.env.DUMP ?? "");

/**
 * 📏 **몇 줄을 받아 볼까** (기본 3줄, 최대 1000 — 열린데이터광장이 한 번에 주는 한도).
 *
 * 첫 줄만 봐서는 못 푸는 물음이 하나 더 있었다 (2026-09-15):
 *   엘리베이터 552줄이 **역 580개를 다 덮나, 반만 덮나.**
 *   반만 덮는데 「엘리베이터 2곳」이라고 써 붙이면, 실제로 5곳인 역에서
 *   휠체어 손님이 **없는 길을 찾아 헤맨다.** 빈 칸이 틀린 정보보다 낫다.
 * 그래서 ROWS 를 크게 주면 **칸마다 서로 다른 값이 몇 개인지**를 세어 준다.
 * 줄을 다 찍으면 로그가 넘치니, 이때는 요약만 낸다.
 */
const ROWS = Math.min(Math.max(Number(process.env.ROWS ?? 3) || 3, 1), 1000);

async function probe(name) {
  const url = `http://openapi.seoul.go.kr:8088/${KEY}/json/${name}/1/${ROWS}/`;
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
    return { ok: true, code, msg, total, cols, rows: box?.row ?? [] };
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
    if (r.cols.length) console.log(`   칸 ${r.cols.length}개: ${r.cols.join(" · ")}`);
    if (DUMP && r.rows.length) {
      // 첫 줄을 **통째로** — 칸 이름 옆에 실제 값을 붙여 놓아야 뜻이 갈린다.
      console.log(`   ── 첫 줄 전체 ──`);
      for (const [k, v] of Object.entries(r.rows[0])) {
        console.log(`   ${String(k).padEnd(18)} = ${JSON.stringify(v)}`);
      }
      // 값이 한 줄만 보면 헷갈리는 칸(코드·분류)이 있어서 두 줄째까지 곁들인다.
      if (r.rows[1]) {
        console.log(`   ── 둘째 줄 (견줘 볼 것) ──`);
        for (const [k, v] of Object.entries(r.rows[1])) {
          console.log(`   ${String(k).padEnd(18)} = ${JSON.stringify(v)}`);
        }
      }
    }
    // 📏 많이 받아 왔으면 **칸마다 다른 값이 몇 개인지**를 센다.
    //    「역이 몇 개나 덮이나」·「이 코드 칸은 값이 몇 가지냐」가 여기서 갈린다.
    if (r.rows.length > 3) {
      console.log(`   ── 받은 ${r.rows.length}줄 요약 (칸마다 서로 다른 값) ──`);
      for (const col of r.cols) {
        const vals = new Set(r.rows.map((row) => String(row[col] ?? "")));
        const head = [...vals].slice(0, 6).map((v) => (v.length > 24 ? v.slice(0, 24) + "…" : v));
        const tail = vals.size > 6 ? ` … 외 ${vals.size - 6}가지` : "";
        console.log(`   ${col.padEnd(18)} ${String(vals.size).padStart(5)}가지 : ${head.join(" · ")}${tail}`);
      }
    }
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
