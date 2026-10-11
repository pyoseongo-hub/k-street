#!/usr/bin/env node
// 🔑 **전국 축제 창구를 붙일 수 있나** — 쓰던 열쇠로 되는지부터 본다.
//
// 사장님 (2026-10-11): 경주 축제가 0곳이라 "창구를 더 붙이자"로 정했다.
// 그런데 **공공데이터 열쇠는 서비스마다 따로 신청**해야 한다.
// 새 열쇠가 필요하면 사장님이 직접 신청하셔야 하므로, **만들기 전에 확인한다.**
//
// 🚫 아무것도 저장하지 않는다. 열쇠가 먹히는지만 본다.
//
//   TOUR_API_KEY=... node scripts/probe-culture-api.mjs

const KEY = process.env.TOUR_API_KEY;
if (!KEY) { console.error("TOUR_API_KEY 가 없다"); process.exit(1); }

const 오늘 = new Date();
const ymd = (d) => d.toISOString().slice(0, 10).replace(/-/g, "");
const 한달뒤 = new Date(오늘.getTime() + 30 * 86400000);

// 후보 창구들. 전부 **공공데이터포털(data.go.kr)** 이라 같은 「일반 인증키」를 쓴다 —
// 다만 서비스마다 **활용신청**이 따로라, 승인 안 된 것은 열쇠가 안 먹는다.
const 후보 = [
  // 🏷️ **설명서(Swagger)를 끝까지 읽어서 적었다** (2026-10-11). 짐작한 데가 한 자도 없다.
  //    뿌리  apis.data.go.kr/B553457/cultureinfo
  //    길    /period2(기간별) · /area2(지역별) · /realm2(분야별) · /detail2(상세) · /livelihood2(달력)
  //    필수  serviceKey · PageNo · **numOfrows** ← 「rows」의 r 이 **소문자**다. 여기서 많이 틀린다.
  //    축제  realmCode=**F000** (행사/축제) · 또는 serviceTp=**B** (행사/축제)
  //    ⚠️ 내가 처음 쓴 /nopenapi/rest/publicperformancedisplays/... 는 **없는 길**이었다(원인코드 12).
  {
    이름: "★ 문화정보 realm2 — 행사/축제(F000) 전국",
    url: `https://apis.data.go.kr/B553457/cultureinfo/realm2?serviceKey=${encodeURIComponent(KEY)}&PageNo=1&numOfrows=10&realmCode=F000&from=${ymd(오늘)}&to=${ymd(한달뒤)}&sortStdr=1`,
    메모: "이게 되면 전국 축제 창구가 열린다",
  },
  {
    이름: "★ 문화정보 area2 — 경상북도 행사/축제",
    url: `https://apis.data.go.kr/B553457/cultureinfo/area2?serviceKey=${encodeURIComponent(KEY)}&PageNo=1&numOfrows=10&sido=${encodeURIComponent("경상북도")}&sigungu=${encodeURIComponent("경주시")}&serviceTp=B&from=${ymd(오늘)}&to=${ymd(한달뒤)}`,
    메모: "경주를 바로 확인한다. 시군구까지 넣을 수 있다",
  },
  {
    이름: "문화정보 period2 — 기간별 행사/축제",
    url: `https://apis.data.go.kr/B553457/cultureinfo/period2?serviceKey=${encodeURIComponent(KEY)}&PageNo=1&numOfrows=10&from=${ymd(오늘)}&to=${ymd(한달뒤)}&serviceTp=B`,
    메모: "날짜로 훑는 길. 달마다 돌릴 때 쓴다",
  },
  {
    // 🔑 **열쇠를 새로 안 받아도 되는 길.** searchFestival2 는 「행사 날짜가 등록된 것」만
    //    주는데, areaBasedList2(contentTypeId=15 = 축제·공연·행사)는 **그 갈래의 곳을 전부** 준다.
    //    날짜는 detailIntro2 로 따로 물으면 된다. 되면 신청서가 필요 없다.
    이름: "★ 관광공사 지역기반 목록 — 축제갈래 전부 (경북)",
    url: `https://apis.data.go.kr/B551011/KorService2/areaBasedList2?serviceKey=${KEY}&MobileOS=ETC&MobileApp=KStreet&_type=json&areaCode=35&contentTypeId=15&numOfRows=10&pageNo=1&arrange=A`,
    메모: "열쇠를 새로 안 받아도 되는 길. 이게 많이 나오면 신청서가 필요 없다",
  },
  {
    이름: "★ 같은 길 — 경주(시군구 2)만",
    url: `https://apis.data.go.kr/B551011/KorService2/areaBasedList2?serviceKey=${KEY}&MobileOS=ETC&MobileApp=KStreet&_type=json&areaCode=35&sigunguCode=2&contentTypeId=15&numOfRows=10&pageNo=1&arrange=A`,
    메모: "경북(35) 안에서 경주 시군구 번호로 좁혀 본다",
  },
  {
    이름: "한국관광공사 지역기반 (지금 쓰는 열쇠가 맞나 확인용)",
    url: `https://apis.data.go.kr/B551011/KorService2/searchFestival2?serviceKey=${KEY}&MobileOS=ETC&MobileApp=KStreet&_type=json&areaCode=35&eventStartDate=20260101&numOfRows=5&pageNo=1`,
    메모: "이게 되면 열쇠 자체는 멀쩡한 것이다",
  },
  {
    // 🏯 **경주 시군구 번호를 짐작하지 않는다.** 0건이 나온 게 「축제가 없어서」인지
    //    「번호가 틀려서」인지 가른다 — 번호표를 직접 받아 본다.
    이름: "★ 관광공사 — 경북(35) 시군구 번호표",
    url: `https://apis.data.go.kr/B551011/KorService2/areaCode2?serviceKey=${KEY}&MobileOS=ETC&MobileApp=KStreet&_type=json&areaCode=35&numOfRows=30&pageNo=1`,
    메모: "경주가 몇 번인지 눈으로 본다. 0건의 원인을 가른다",
  },
];

for (const c of 후보) {
  console.log(`\n── ${c.이름}`);
  console.log(`   ${c.메모}`);
  try {
    const r = await fetch(c.url, { signal: AbortSignal.timeout(20000) });
    const t = await r.text();
    console.log(`   상태 ${r.status} · 받은 글 ${t.length}자`);
    // 🚦 공공데이터포털은 **실패도 200 으로 돌려준다.** 글을 봐야 안다.
    const 막힘 = t.match(/SERVICE_KEY_IS_NOT_REGISTERED|NOT_REGISTERED_ERROR|SERVICE ERROR|등록되지\s*않은|<errMsg>([^<]*)/i);
    if (막힘) {
      // 🔎 **왜 막혔는지를 가른다.** 포털이 주는 숫자가 원인을 말해 준다 —
      //    30 = 열쇠가 이 서비스에 등록 안 됨(활용신청 필요/반영 전)
      //    12 = 그런 서비스가 없음(주소가 틀렸거나 폐기됨)
      //    22/ 4 = 하루 한도 초과
      const 코드 = t.match(/<returnReasonCode>(\d+)<\/returnReasonCode>/)?.[1]
        ?? t.match(/"returnReasonCode"\s*:\s*"?(\d+)/)?.[1];
      const 뜻 = { "30": "열쇠가 이 서비스에 아직 등록 안 됐다 (활용신청 또는 반영 대기)",
                   "12": "그런 서비스가 없다 — **주소가 틀렸다**",
                   "22": "하루 한도 초과", "4": "하루 한도 초과",
                   "31": "기간 만료", "20": "접근 거부" }[코드] ?? "뜻을 모르는 코드";
      console.log(`   ❌ 막혔다 — ${막힘[0].slice(0, 60)}`);
      console.log(`      원인코드 ${코드 ?? "없음"} → ${뜻}`);
      console.log(`      받은 글 전부: ${t.replace(/\s+/g, " ").slice(0, 600)}`);
      continue;
    }
    const 건수 = t.match(/<totalCount>(\d+)<\/totalCount>/)?.[1]
      ?? t.match(/"totalCount"\s*:\s*"?(\d+)/)?.[1];
    if (건수 != null) console.log(`   ✅ 된다 — 총 ${건수}건`);
    else console.log(`   ⚠️ 왔는데 건수를 못 찾았다. 앞부분: ${t.replace(/\s+/g, " ").slice(0, 200)}`);
    // 이름 몇 개를 보여 준다 — 진짜 축제가 오는지 눈으로 본다
    const 이름들 = [...t.matchAll(/<title>([^<]{2,40})<\/title>|"title"\s*:\s*"([^"]{2,40})"/g)]
      .map((m) => m[1] ?? m[2]).filter(Boolean).slice(0, 5);
    if (이름들.length) console.log(`   보기: ${이름들.join(" · ")}`);
  } catch (e) {
    console.log(`   ❌ ${e?.message ?? "알 수 없는 오류"}`);
  }
}
console.log("\n🧭 ✅ 가 하나라도 있으면 그 창구를 붙이면 된다. 전부 ❌ 면 사장님이 공공데이터포털에서 활용신청을 해 주셔야 한다.");
