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
  // 🎯 **서울 밖 대도시를 메울 가장 큰 후보** (사장님 2026-10-16: "서울 외 대도시 축제
  //    채울 수 있는 방법 있나 조사해"). 세어 보니 도시가 작아서가 아니었다 —
  //    유명 축제 20개 중 **8개가 우리 자료에 아예 없었다**(치맥·펜타포트·0시축제 …).
  //    창구가 얇은 것이다.
  //    「표준데이터」는 전국 지자체가 **같은 형식으로** 올리는 자리라, 한 번 뚫으면
  //    대도시만이 아니라 전국이 같이 메워진다.
  { id: "15013104", 이름: "전국문화축제표준데이터", 꼴: "standard" },
  { id: "15013106", 이름: "전국공연행사정보표준데이터", 꼴: "standard" },
  { id: "15138937", 이름: "한국문화정보원_한눈에보는문화정보조회서비스" },
];

const 머리 = {
  // 포털이 사람 브라우저만 받아 주는 일이 있어 이름표를 달아 준다.
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36",
  "Accept-Language": "ko-KR,ko;q=0.9",
};

for (const z of 자료) {
  console.log(`\n── ${z.이름}  (자료번호 ${z.id})`);
  // 🏷️ **자료마다 페이지 주소 끝이 다르다.** 일반 오픈API 는 `openapi.do`,
  //    행정표준데이터는 `standard.do` 다. 틀리면 빈 페이지를 긁고 「못 찾았다」고 말한다.
  const url = `https://www.data.go.kr/data/${z.id}/${z.꼴 === "standard" ? "standard" : "openapi"}.do`;
  try {
    const r = await 다시부르기(url);
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

    // 1-3) 🎯 **설명서를 통째로 읽는다.** 이 페이지 안에는 API 설명서(Swagger) 가
    //      JSON 으로 박혀 있다. 글을 눈으로 훑지 말고 **그걸 파서** 길과 요청변수를
    //      이름 그대로 뽑는다 — 「PageNo 인가 pageNo 인가」로 또 돌리지 않으려면 이게 유일한 길이다.
    const 설명서 = 스웨거찾기(html);
    if (설명서) {
      console.log(`   🎯 설명서를 찾았다 — host: ${설명서.host}${설명서.basePath ?? ""}`);
      for (const [길, 몸] of Object.entries(설명서.paths ?? {})) {
        const get = 몸.get ?? {};
        console.log(`      ${길}   「${get.summary ?? "?"}」`);
        for (const v of 몸.parameters ?? get.parameters ?? []) {
          console.log(`         · ${v.name}${v.required ? " (필수)" : ""} — ${v.description ?? ""}`);
        }
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

// 📦 페이지 글 속에 박힌 설명서(JSON) 를 떠낸다.
//    `"swagger":"2.0"` 자리에서 시작해 **괄호 수를 세어** 짝이 맞는 데까지 자른다 —
//    정규식으로는 중첩된 괄호를 못 센다.
function 스웨거찾기(html) {
  const 시작표 = ['{"swagger"', '{ "swagger"'];
  let i = -1;
  for (const t of 시작표) { i = html.indexOf(t); if (i >= 0) break; }
  if (i < 0) {
    const k = html.indexOf('"swagger"');
    if (k < 0) return null;
    i = html.lastIndexOf("{", k);
    if (i < 0) return null;
  }
  let 깊이 = 0, 글속 = false, 피함 = false;
  for (let j = i; j < html.length; j++) {
    const c = html[j];
    if (글속) {
      if (피함) { 피함 = false; }
      else if (c === "\\") 피함 = true;
      else if (c === '"') 글속 = false;
      continue;
    }
    if (c === '"') { 글속 = true; continue; }
    if (c === "{") 깊이++;
    else if (c === "}") {
      깊이--;
      if (깊이 === 0) {
        try { return JSON.parse(html.slice(i, j + 1)); } catch (e) { return null; }
      }
    }
  }
  return null;
}

// 🔁 **한 번 끊겼다고 포기하지 않는다.** 포털이 잠깐 막으면 fetch 가 통째로 시간 초과된다.
//    2026-10-11 에 세 자료가 전부 그렇게 끊겨 **한 번을 통째로 버렸다.**
//    그렇다고 무한정 두드리지도 않는다 — 두드리면 더 막힌다. 세 번, 간격을 늘려 가며.
async function 다시부르기(url, 횟수 = 3) {
  let 마지막;
  for (let i = 0; i < 횟수; i++) {
    if (i > 0) {
      const 쉼 = 5000 * i;
      console.log(`   ⏳ ${쉼 / 1000}초 쉬고 다시 부른다 (${i + 1}/${횟수})`);
      await new Promise((r) => setTimeout(r, 쉼));
    }
    try {
      return await fetch(url, { headers: 머리, signal: AbortSignal.timeout(30000) });
    } catch (e) { 마지막 = e; }
  }
  throw 마지막;
}
