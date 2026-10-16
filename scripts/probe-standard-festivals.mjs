#!/usr/bin/env node
// 🔎 **전국 「표준데이터」 축제 창구가 우리 열쇠로 열리나.**
//
// 사장님 (2026-10-15): *"서울 외 대도시 축제 채울수 있는 방법있나 조사해"*
//
// 🧭 왜 이 창구인가 — 지금 쓰는 두 창구는 서울 밖이 비어 있다. 실측:
//    · 관광공사 searchFestival2 … 경북 3개 · 대구 1개 · 광주 1개 (2025/1/1 이후)
//    · 문화정보 realm2(F000) …… 전국 통틀어 52개
//    컬러풀대구 · 대구치맥 · 광주김치 · 대전사이언스 · 울산마두희 ·
//    해운대모래 · 펜타포트 — **일곱 개가 둘 다에 없다.**
//
// 📌 「표준데이터」는 성격이 다르다. 전국 **지자체가 직접 올리는** 칸이라
//    시청·구청이 자기 축제를 적어 넣는다. 대도시가 비는 이유를 정면으로 때린다.
//
// 🏷️ 주소는 **짐작한 게 아니다** — 포털 자료 페이지에서 긁어왔다(2026-10-16):
//      전국문화축제표준데이터      api.data.go.kr/openapi/tn_pubr_public_cltur_fstvl_api
//      전국공연행사정보표준데이터  api.data.go.kr/openapi/tn_pubr_public_pblprfr_event_info_api
//
// 🚫 아무것도 저장하지 않는다. 묻고 세기만 한다.
// ⚠️ 열쇠를 encodeURIComponent 로 감싸지 않는다 — 두 번 감싸면 %2B 가 %252B 가
//    되어 「등록되지 않은 서비스키(원인코드 30)」로 보인다. 2026-10-14에 데인 자리다.
//
//   TOUR_API_KEY=... node scripts/probe-standard-festivals.mjs

const KEY = process.env.TOUR_API_KEY;
if (!KEY) { console.error("TOUR_API_KEY 가 없다"); process.exit(1); }

const 원인 = {
  "1": "제공기관 서비스 상태가 이상하다",
  "4": "오늘 몫을 다 썼다 (하루 한도)",
  "12": "그런 서비스가 없다 → 주소가 틀렸다",
  "20": "접근 거부",
  "22": "오늘 몫을 다 썼다 (하루 한도)",
  "30": "열쇠가 이 자료에 등록 안 됐다 → 활용신청이 필요하다",
  "31": "열쇠 사용기간이 끝났다",
  "32": "허용되지 않은 호출 위치",
};

const 창구 = [
  {
    이름: "전국문화축제표준데이터",
    번호: "15013104",
    url: "https://api.data.go.kr/openapi/tn_pubr_public_cltur_fstvl_api",
    왜: "지자체가 직접 올린 축제. 대도시 빈칸을 때리는 길",
  },
  {
    이름: "전국공연행사정보표준데이터",
    번호: "15013106",
    url: "https://api.data.go.kr/openapi/tn_pubr_public_pblprfr_event_info_api",
    왜: "축제가 아닌 '행사'까지. 축제 없는 달을 메우는 길",
  },
];

for (const c of 창구) {
  console.log(`\n── ${c.이름}  (자료번호 ${c.번호})`);
  console.log(`   ${c.왜}`);
  const p = new URLSearchParams({ pageNo: "1", numOfRows: "5", type: "json" });
  let r;
  try {
    r = await fetch(`${c.url}?serviceKey=${KEY}&${p}`);
  } catch (e) {
    console.log(`   ❌ 연결 자체가 안 됐다 — ${e?.cause?.code ?? e.message}`);
    continue;
  }
  const 글 = await r.text();
  console.log(`   상태 ${r.status} · 받은 글 ${글.length}자`);

  const 코드 = 글.match(/<returnReasonCode>(\d+)<\/returnReasonCode>/)?.[1]
    ?? 글.match(/"resultCode"\s*:\s*"?(\d+)"?/)?.[1];
  if (/NOT_REGISTERED|NO_OPENAPI|LIMITED_NUMBER|errMsg/.test(글)) {
    console.log(`   ❌ 막혔다 — 원인코드 ${코드 ?? "?"} · ${원인[코드] ?? "알 수 없다"}`);
    console.log(`      받은 글: ${글.slice(0, 400)}`);
    continue;
  }

  let j;
  try { j = JSON.parse(글); } catch {
    console.log(`   ⚠️ JSON 이 아니다 — 앞부분: ${글.slice(0, 400)}`);
    continue;
  }
  const b = j?.response?.body ?? j?.body ?? j;
  const 총 = Number(b?.totalCount ?? 0);
  const 목록 = b?.items ?? b?.item ?? [];
  const list = Array.isArray(목록) ? 목록 : [목록].filter(Boolean);
  console.log(`   ✅ 된다 — 총 ${총.toLocaleString()}건`);
  if (list[0]) {
    console.log(`   🧱 칸 이름: ${Object.keys(list[0]).join(" · ")}`);
    for (const x of list.slice(0, 3)) {
      const 이름 = x.fstvlNm ?? x.pblprfrEventNm ?? x.사업명 ?? "(이름칸 모름)";
      const 곳 = x.opar ?? x.rdnmadr ?? x.lnmadr ?? "";
      const 언제 = `${x.fstvlStartDate ?? x.pblprfrEventStartDate ?? ""}~${x.fstvlEndDate ?? x.pblprfrEventEndDate ?? ""}`;
      console.log(`      · ${언제}  ${이름}  ${String(곳).slice(0, 30)}`);
    }
  }
}

console.log("\n🧭 ✅ 면 바로 붙일 수 있다. 원인코드 30 이면 사장님이 포털에서 그 자료에 「활용신청」을 한 번 눌러 주셔야 한다.");
