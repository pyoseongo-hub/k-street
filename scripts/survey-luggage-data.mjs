#!/usr/bin/env node
// 🧳 **짐 보관 위치 자료 찾기** (2026-09-10)
//
// 왜 (사장님 지적):
//   "특정 관광지 명동 강남 홍대 이런데 창고 길안내 / 지하철이면 몇 번 출구라던가
//    설명 있을 줄 알았지 / 이 정도면 그냥 가이드 한 페이지로 만들고 말지"
//
//   맞다. 지금 짐 보관 안내에는 **위치가 한 곳도 없다.**
//   그런데 「몇 번 출구」는 **기억으로 적으면 안 되는** 종류다 —
//   틀리면 손님이 캐리어를 끌고 반대편으로 200m 걸어갔다 돌아온다.
//
// ─────────────────────────────────────────────────────────────────────
// 🪦 **이미 두드려 보고 안 된 곳 — 다음 세션은 여기 다시 가지 말 것**
//   (1·2차, 2026-09-10 11:16 / 11:18. 실행 기록은 Actions 에 남아 있다)
//
//   ❌ 한국관광공사 KorService2  「물품보관·관광안내소·짐」 → 서울 0건. 진짜 없다
//   ❌ 공공데이터포털 검색 페이지  1차 200(자바스크립트로 그림) · 2차 아예 못 받음
//   ❌ 서울 열린데이터광장 검색   200 인데 srchKeyword 를 **무시한다**
//                              (키워드를 바꿔도 84,973자로 똑같고 자료 번호도 같다)
//   ❌ 열린데이터광장 sample 열쇠 자료 이름을 내가 찍어 넣어서 전부 서버 오류
//   ❌ seoulmetro.co.kr          인증서 오류(브라우저도 경고)
//   ❌ ttalocker.co.kr           없는 도메인 — 내 기억이 틀렸다
//   ❌ english.visitseoul.net/luggage  404 — 내 기억이 틀렸다
//   ✅ korailretail.com          살아 있음 (제목: 코레일유통)
//   ✅ sto.or.kr                 살아 있음 (서울관광재단)
//
// 🚨 2차에서 **검사가 나를 속였다.** 못 받은 것(0자)을 두고
//    "글 안에 그 말이 없다"고 찍었다. 없는 것과 못 받은 것을 가르려고 만든
//    검사가 그 둘을 또 섞은 것이다. 아래 report() 가 그걸 갈라 준다.
// ─────────────────────────────────────────────────────────────────────
//
// 💡 3차: **카카오 지역검색.** 열쇠(KAKAO_REST_API_KEY)를 이미 갖고 있다
//    (fetch-coords.mjs·prelaunch-check 가 쓴다). 상호·지번·도로명·좌표를 준다.
//
// ⚠️ 좌표를 내 기억으로 적지 않는다. **카카오에게 「명동역」이 어디냐고 먼저 묻고**,
//    그 좌표 둘레를 다시 묻는다. 그래야 출발점부터 근거가 있다.
//
// ⚠️ 아무것도 저장하지 않는다. 무엇을 쓸지는 이걸 읽고 사람이 정한다.

const KAKAO = process.env.KAKAO_REST_API_KEY ?? "";

// 📄 찾은 것을 **파일로도 남긴다.** 로그를 보고 사람이 손으로 옮겨 적으면
//    거기서 오타가 난다(상호 한 글자, 주소 숫자 하나). 러너가 받은 것을
//    그대로 저장하고, 고르는 것만 사람이 한다.
const OUT = process.env.OUT_JSON ?? "";
const found = [];

/** 받은 것 / 못 받은 것을 **갈라서** 돌려준다 (2차에서 이걸 섞어 헛짚었다). */
async function kakao(path, params) {
  const qs = new URLSearchParams(params).toString();
  const url = `https://dapi.kakao.com/v2/local/${path}?${qs}`;
  try {
    const r = await fetch(url, {
      headers: { Authorization: `KakaoAK ${KAKAO}` },
      signal: AbortSignal.timeout(20000),
    });
    const text = await r.text();
    if (!r.ok) return { got: true, ok: false, why: `HTTP ${r.status} — ${text.slice(0, 120)}` };
    return { got: true, ok: true, docs: JSON.parse(text).documents ?? [] };
  } catch (e) {
    // 못 받았다. **"결과가 없다"와 절대 같이 적지 않는다.**
    return { got: false, ok: false, why: e?.cause?.code || e?.name || e?.message };
  }
}

if (!KAKAO) {
  console.error("❌ KAKAO_REST_API_KEY 가 없다. Actions 시크릿을 워크플로에 넘겼는지 볼 것.");
  process.exit(1);
}

// 손님이 실제로 가는 곳. 25개 구를 다 하지 않는다 — 사장님 말씀대로
// "25개구 정도는 아녀도" 사람이 몰리는 데를 제대로 하는 게 먼저다.
//
// 2026-09-10 2차 확장: 다섯 곳 → 열여섯 곳.
// 첫 다섯 곳에서 강남·경복궁이 통째로 빠졌는데(월세 창고밖에 없었다),
// 그게 **그 동네에 없어서인지 내가 좁게 봐서인지** 알 수가 없었다. 넓혀서 본다.
const SPOTS = [
  // 이미 올린 곳
  "명동역", "홍대입구역", "서울역",
  // 빠진 곳 — 다시 본다
  "강남역", "경복궁역",
  // 새로 보는 곳 (손님이 실제로 가는 데)
  "이태원역", "안국역", "동대문역사문화공원역", "잠실역", "신촌역",
  "광화문역", "성수역", "압구정로데오역", "여의도역", "김포공항역", "건대입구역",
];

// 카카오에 뭐라고 물어야 보관함이 나오나 — 말을 여러 개 던져 본다.
const TERMS = ["물품보관함", "짐보관", "코인락커", "무인보관함", "러기지", "luggage storage"];

// 🚨 **월세 창고를 걸러낼 근거를 같이 모은다.**
//    1차에서 「짐프리」(여행자용)와 「박스풀 공유창고」(월세)가 카카오에서
//    **똑같이 「서비스,산업 > 보관,저장」**이었다. 업종으로는 못 가른다.
//    그래서 반대쪽 말로도 찾아 보고, **거기 걸린 곳에 표를 달아 둔다.**
//    표가 달렸다고 자동으로 빼지 않는다 — 사람이 볼 때 쓰는 단서다.
const NEGATIVE_TERMS = ["셀프스토리지", "공유창고", "개인창고"];

console.log("═══ 카카오 지역검색으로 짐 보관 자리를 찾는다 ═══");
console.log("⚠️ 좌표는 내 기억이 아니라 카카오가 준 것을 쓴다.\n");

for (const spot of SPOTS) {
  // ① 그 역이 어디인지 카카오에게 묻는다
  const anchor = await kakao("search/keyword.json", { query: spot, size: 1 });
  if (!anchor.got) {
    console.log(`\n■ ${spot} — ❌ 카카오에 **못 물어봤다** (${anchor.why}). 결과 없음이 아니다.`);
    continue;
  }
  if (!anchor.ok || !anchor.docs.length) {
    console.log(`\n■ ${spot} — ❌ 이 이름으로는 자리를 못 찾았다 ${anchor.why ? `(${anchor.why})` : ""}`);
    continue;
  }
  const a = anchor.docs[0];
  console.log(`\n■ ${spot}  →  ${a.place_name} · ${a.address_name}`);
  const seen = new Set(); // 같은 곳이 여러 검색어로 겹쳐 나온다 — 한 번만 적는다

  // 먼저 **반대쪽 말**로 찾아 표를 만든다. 여기 걸린 곳은 월세 창고일 수 있다.
  const suspect = new Set();
  for (const term of NEGATIVE_TERMS) {
    const r = await kakao("search/keyword.json", { query: term, x: a.x, y: a.y, radius: 900, size: 15, sort: "distance" });
    if (r.ok) for (const d of r.docs) suspect.add(d.id);
  }
  if (suspect.size) console.log(`   (창고쪽 말로 먼저 걸린 곳 ${suspect.size}개 — 아래에 ⚠️ 로 표시한다)`);

  // ② 그 둘레 700m 안에서 보관함을 찾는다
  for (const term of TERMS) {
    const r = await kakao("search/keyword.json", {
      query: term,
      x: a.x,
      y: a.y,
      radius: 800,
      size: 15,
      sort: "distance",
    });
    if (!r.got) {
      console.log(`   ⟨${term}⟩ ❌ 못 물어봤다 (${r.why})`);
      continue;
    }
    if (!r.ok) {
      console.log(`   ⟨${term}⟩ ❌ ${r.why}`);
      continue;
    }
    if (!r.docs.length) {
      console.log(`   ⟨${term}⟩ 없음`);
      continue;
    }
    console.log(`   ⟨${term}⟩ ${r.docs.length}곳`);
    for (const d of r.docs) {
      if (seen.has(d.id)) continue; // 말만 바꿔 다시 나온 같은 곳
      seen.add(d.id);
      // 🚨 **업종을 반드시 같이 본다.** 3차에서 「다락」·「박스풀」이 잡혔는데
      //    그건 **월세 창고**지 여행자가 몇 시간 맡기는 데가 아니다.
      //    「아트래블 명동서울호스텔」은 호스텔이었다.
      //    상호만 보고 넣으면 손님이 캐리어를 끌고 월세 창고 문 앞에 선다.
      found.push({
        area: spot,
        anchor: { name: a.place_name, address: a.address_name, x: a.x, y: a.y },
        id: d.id,
        name: d.place_name,
        category: d.category_name,
        jibun: d.address_name,
        road: d.road_address_name || "",
        phone: d.phone || "",
        distance: Number(d.distance),
        // ⚠️ 「셀프스토리지·공유창고·개인창고」로도 걸린 곳. 월세 창고일 수 있다.
        //    자동으로 빼지 않는다 — 사람이 고를 때 쓰는 단서다.
        창고쪽: suspect.has(d.id),
        x: d.x,
        y: d.y,
        url: d.place_url,
      });
      console.log(
        `      · ${d.place_name}  (${d.distance}m)${suspect.has(d.id) ? "  ⚠️창고쪽" : ""}\n` +
          `        업종: ${d.category_name}\n` +
          `        지번: ${d.address_name}\n` +
          `        도로명: ${d.road_address_name || "(없음)"}${d.phone ? ` · ☎ ${d.phone}` : ""}\n` +
          `        카카오: ${d.place_url}`,
      );
    }
  }
}

console.log("\n\n═══ 정리 ═══");
console.log("여기 나온 것은 **카카오가 지금 들고 있는 자리**다. 그대로 쓰지 않는다 —");
console.log("무엇을 안내에 올릴지는 이 목록을 보고 사람이 고른다.");
console.log("⚠️ 「몇 번 출구」는 여기 안 나온다. 그건 따로 확인해야 한다.");

if (OUT) {
  const { writeFileSync } = await import("node:fs");
  found.sort((p, q) => p.area.localeCompare(q.area) || p.distance - q.distance);
  writeFileSync(OUT, JSON.stringify({ 받은날: new Date().toISOString().slice(0, 10), 출처: "카카오 지역검색", 곳: found }, null, 2) + "\n");
  console.log(`\n📄 ${OUT} 에 ${found.length}곳을 적었다.`);
}
