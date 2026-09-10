#!/usr/bin/env node
// 🧳 **짐 보관 위치 자료가 세상에 있나 훑어본다.** (2026-09-10)
//
// 왜 (사장님 지적):
//   "특정 관광지 명동 강남 홍대 이런데 창고 길안내 / 지하철이면 몇 번 출구라던가
//    설명 있을 줄 알았지 / 이 정도면 그냥 가이드 한 페이지로 만들고 말지"
//
//   맞는 말이다. 지금 짐 보관 안내에는 **위치가 한 곳도 없다.** "큰 역에는 보관함이
//   있습니다"는 손님이 이미 아는 얘기다. 필요한 것은 「홍대입구역 몇 번 출구 쪽」이다.
//
// 🚨 그런데 **기억으로 적으면 안 된다.** 이 저장소 규칙이자 이미 데인 자리다 —
//    지난번 짐 보관 링크 12개 중 내가 기억으로 적은 3개가 전부 틀렸다.
//    출구 번호를 틀리면 손님이 캐리어를 끌고 반대편으로 걸어간다.
//    그러니 **자료를 구해 와서** 넣어야 한다. 이 스크립트는 그 자료가
//    실제로 있는지, 있으면 어떤 모양인지 **보기만** 한다.
//
// ⚠️ 아무것도 저장하지 않는다. 찾아서 화면에 뿌리기만 한다.
//    무엇을 쓸지는 이걸 읽고 사람이 정한다.
//
//   node scripts/survey-luggage-data.mjs

const KEY = process.env.TOUR_API_KEY ?? "";

const short = (s, n = 90) => (s ?? "").replace(/\s+/g, " ").trim().slice(0, n);

async function knock(label, url, { asJson = false } = {}) {
  process.stdout.write(`\n── ${label}\n   ${url}\n`);
  try {
    const r = await fetch(url, {
      redirect: "follow",
      signal: AbortSignal.timeout(25000),
      // 검색 페이지는 브라우저가 아니면 막는 곳이 있다
      headers: { "User-Agent": "Mozilla/5.0 (compatible; k-street-survey/1.0)" },
    });
    const text = await r.text();
    console.log(`   ${r.ok ? "✅" : "❌"} ${r.status} · ${text.length.toLocaleString()}자${r.url !== url ? `\n   ↪ 튕긴 곳: ${r.url}` : ""}`);
    if (!r.ok) return { ok: false, text: "" };
    if (asJson) {
      try {
        return { ok: true, json: JSON.parse(text), text };
      } catch {
        console.log(`   ⚠️ JSON 이 아니다 — 앞부분: ${short(text, 160)}`);
        return { ok: true, text };
      }
    }
    return { ok: true, text };
  } catch (e) {
    console.log(`   ❌ 못 열었다 (${e?.cause?.code || e?.name || e?.message})`);
    return { ok: false, text: "" };
  }
}

// ─────────────────────────────────────────────────────────────────────
// ① 공공데이터포털 — 무엇이 등록돼 있나
//    검색 결과 페이지에서 **자료 이름만** 뽑는다. 이름을 봐야
//    다음에 어느 API 를 신청할지 정할 수 있다.
// ─────────────────────────────────────────────────────────────────────
console.log("═══ ① 공공데이터포털 (data.go.kr) 에 뭐가 있나 ═══");

for (const kw of ["물품보관함", "관광안내소", "짐보관", "코인로커"]) {
  const { ok, text } = await knock(
    `검색: ${kw}`,
    `https://www.data.go.kr/tcs/dss/selectDataSetList.do?keyword=${encodeURIComponent(kw)}`,
  );
  if (!ok) continue;
  // 자료 제목은 검색 결과 카드의 링크 글자에 있다. 태그 이름은 바뀔 수 있으니
  // **키워드가 들어간 줄**을 통째로 훑는 쪽이 덜 깨진다.
  const hits = [...text.matchAll(/>([^<>]{6,80})</g)]
    .map((m) => m[1].trim())
    .filter((t) => t.includes(kw))
    .filter((t, i, a) => a.indexOf(t) === i)
    .slice(0, 12);
  console.log(hits.length ? hits.map((h) => `      · ${h}`).join("\n") : "      (제목을 못 뽑았다 — 화면을 자바스크립트로 그리는 듯)");
}

// ─────────────────────────────────────────────────────────────────────
// ② 서울 열린데이터 광장 — 열쇠 없이 맛보기(sample)로 5줄 받아 본다
//    자료 이름(SERVICE)을 알아야 하는데, 후보를 몇 개 두드려 본다.
//    ⚠️ 이름은 **추측이다.** 되는 게 있으면 그때부터 진짜 자료다.
// ─────────────────────────────────────────────────────────────────────
console.log("\n\n═══ ② 서울 열린데이터 광장 (data.seoul.go.kr) 맛보기 ═══");
console.log("   sample 열쇠는 5줄까지 준다. 되는 이름이 있으면 그게 실마리다.");

for (const svc of [
  "tbTourStorage",
  "TbTouristInfoCenter",
  "SebcTourInfoKor",
  "subwayStorage",
  "tnTourGuideHouse",
]) {
  const { ok, json } = await knock(
    `맛보기: ${svc}`,
    `http://openapi.seoul.go.kr:8088/sample/json/${svc}/1/5/`,
    { asJson: true },
  );
  if (!ok || !json) continue;
  const box = json[svc] ?? Object.values(json)[0];
  const msg = box?.RESULT?.MESSAGE ?? box?.MESSAGE ?? "";
  const rows = box?.row ?? [];
  console.log(`      결과: ${short(msg, 60) || "(메시지 없음)"} · 줄 ${rows.length}개`);
  if (rows.length) console.log(`      칸: ${Object.keys(rows[0]).join(" · ")}`);
}

// ─────────────────────────────────────────────────────────────────────
// ③ 한국관광공사 — 이미 열쇠가 있는 곳이다. 관광안내소가 여기 있나?
//    KorService2 는 우리가 이미 쓰고 있다(축제·곳). 짐 보관과 가장 가까운 것은
//    **관광안내소**인데, 갈래(contentTypeId)에 있는지 확인한다.
// ─────────────────────────────────────────────────────────────────────
console.log("\n\n═══ ③ 한국관광공사 KorService2 — 우리가 이미 열쇠를 가진 곳 ═══");

if (!KEY) {
  console.log("   ⚠️ TOUR_API_KEY 가 없다 — 이 단계는 건너뛴다");
} else {
  const base = `https://apis.data.go.kr/B551011/KorService2`;
  const common = `serviceKey=${KEY}&MobileOS=ETC&MobileApp=kstreet&_type=json&numOfRows=5&pageNo=1`;

  // 키워드 검색으로 「보관」·「짐」이 들어간 곳이 서울(areaCode=1)에 있나
  for (const kw of ["물품보관", "관광안내소", "짐"]) {
    const { ok, json } = await knock(
      `키워드 검색: ${kw}`,
      `${base}/searchKeyword2?${common}&areaCode=1&keyword=${encodeURIComponent(kw)}`,
      { asJson: true },
    );
    if (!ok || !json) continue;
    const body = json?.response?.body;
    const items = body?.items?.item ?? [];
    console.log(`      전체 ${body?.totalCount ?? "?"}건`);
    for (const it of [].concat(items).slice(0, 5))
      console.log(`      · ${short(it.title, 40)}  [${it.contenttypeid}]  ${short(it.addr1, 45)}`);
  }
}

console.log("\n\n═══ 정리 ═══");
console.log("여기서 **되는 것만** 다음 단계로 넘긴다.");
console.log("안 되는 것은 안 되는 대로 적어 둔다 — 다음 세션이 같은 걸 또 두드리지 않게.");
