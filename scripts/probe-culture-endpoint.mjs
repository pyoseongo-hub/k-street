#!/usr/bin/env node
// 🏷️ **주소를 짐작하지 않는다 — 포털에서 긁어 온다.**
//
// 2026-10-11: 전국 축제 창구가 막혀 있었는데, 포털이 준 원인코드가 **12**였다.
//   30 = 열쇠 미등록(신청 문제) · **12 = 해당 서비스가 없거나 폐기됨(주소 문제)**
// 즉 사장님 신청이 아니라 **내가 적은 주소가 틀렸다.**
//
// 짐작으로 한 줄씩 고치면 한 번에 2분씩 태운다. 그래서 **안내문을 직접 읽는다** —
// 공공데이터포털의 그 자료 페이지 안에 상세기능별 호출 주소가 글로 박혀 있다.
//
// 🚫 아무것도 저장하지 않는다. 주소만 찾아 보여 준다.
//
//   node scripts/probe-culture-endpoint.mjs

// 📚 볼 자료들. 전부 「전국 공연·전시·축제」 쪽이다.
const 자료 = [
  { id: "15138937", 이름: "한국문화정보원_한눈에보는문화정보조회서비스" },
  { id: "15105238", 이름: "문화체육관광부_문체부 기관 공연정보" },
  { id: "15121487", 이름: "문화체육관광부_문화예술공연(통합)" },
];

const 머리 = {
  // 포털이 사람 브라우저만 받아 주는 일이 있어 이름표를 달아 준다.
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36",
  "Accept-Language": "ko-KR,ko;q=0.9",
};

for (const z of 자료) {
  console.log(`\n── ${z.이름}  (자료번호 ${z.id})`);
  const url = `https://www.data.go.kr/data/${z.id}/openapi.do`;
  try {
    const r = await fetch(url, { headers: 머리, signal: AbortSignal.timeout(30000) });
    const html = await r.text();
    console.log(`   상태 ${r.status} · 받은 글 ${html.length}자`);
    if (!r.ok) { console.log("   ❌ 페이지를 못 받았다"); continue; }

    // 1) 주소처럼 보이는 것을 전부 모은다 — apis.data.go.kr 또는 기관코드가 든 길.
    const 주소 = new Set();
    for (const m of html.matchAll(/https?:\/\/(?:apis?|api)\.data\.go\.kr[^\s"'<>\\)]+/g)) 주소.add(m[0]);
    for (const m of html.matchAll(/\/B\d{6}\/[A-Za-z0-9_\-/]{4,}/g)) 주소.add(m[0]);
    if (주소.size) {
      console.log(`   ✅ 주소처럼 보이는 것 ${주소.size}개:`);
      for (const a of [...주소].slice(0, 25)) console.log(`      ${a}`);
    } else {
      console.log("   ⚠️ 주소를 못 찾았다 — 페이지가 자바스크립트로 그려지는 것일 수 있다");
    }

    // 1-2) **길의 끝까지 본다.** 뿌리만 잡히면(`/B553457/cultureinfo`) 그 뒤가 빠진다.
    //      그래서 그 말이 나온 자리를 **글 그대로** 앞뒤로 떠서 보여 준다 —
    //      여기에 전체 경로와 요청변수 이름이 같이 들어 있다.
    for (const 말 of ["cultureinfo", "period2"]) {
      const 자리 = [...html.matchAll(new RegExp(말, "g"))].slice(0, 3);
      for (const m of 자리) {
        const 앞 = Math.max(0, m.index - 160);
        const 토막 = html.slice(앞, m.index + 260).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
        console.log(`   📄 「${말}」 자리: ${토막}`);
      }
    }

    // 2) 상세기능(오퍼레이션) 이름도 같이 본다 — 어느 길을 불러야 하는지 가린다.
    const 기능 = new Set();
    for (const m of html.matchAll(/(?:상세기능|오퍼레이션)[^<]{0,40}<\/[^>]+>\s*<[^>]+>([^<]{2,60})</g)) 기능.add(m[1].trim());
    for (const m of html.matchAll(/getList[A-Za-z0-9_]*|publicperformancedisplays\/[a-z0-9]+|period2?|realm|livelihood/g)) 기능.add(m[0]);
    if (기능.size) console.log(`   🧩 기능 이름 후보: ${[...기능].slice(0, 20).join(" · ")}`);
  } catch (e) {
    console.log(`   ❌ ${e?.message ?? "알 수 없는 오류"}`);
  }
}
console.log("\n🧭 위에 나온 주소를 그대로 써야 한다. 여기서 안 나오면 사장님께 자료 페이지의 「상세기능」 화면을 부탁한다.");
