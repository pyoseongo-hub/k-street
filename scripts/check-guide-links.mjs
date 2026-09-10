#!/usr/bin/env node
// 🔗 **안내 글에 넣을 바깥 링크가 진짜 열리나 두드려 본다.**
//
// 왜 (2026-09-10, 짐 보관 안내를 만들면서) — 안내에는 공식 링크가 들어가야 하는데,
// 이 저장소를 만드는 세션은 **바깥 인터넷이 막혀 있어** 그 주소를 열어 볼 수가 없다.
// 기억으로 주소를 적으면 십중팔구 틀리고, 그러면 **캐리어를 끌고 간 손님이 404를 만난다.**
// 축제 날짜를 지어내지 않는 것과 같은 이유다 — 확인 못 한 것은 넣지 않는다.
//
// 🚨 **200 이 떴다고 다 쓰면 안 된다.** 공식 사이트는 회사 첫 화면으로 튕기는 일이 잦아서,
//    주소는 살아 있는데 **엉뚱한 페이지**인 경우가 많다. 그래서 **어디로 튕겼는지와
//    제목까지** 찍는다. 고르는 것은 사람이 한다.
//
// (기존 scripts/check-links.mjs 는 links.json 을 받아 seed 의 사진·공식주소를 훑는
//  다른 물건이다. 이쪽은 **아직 자료에 안 넣은 후보**를 재 보는 자리다.)
//
//   node scripts/check-guide-links.mjs
//
// 📌 **다른 주소를 두드려 보고 싶으면** URLS 에 넣는다(쉼표나 줄바꿈으로 나눈다).
//    Actions 의 「Check guide links」 입력칸이 그대로 이 자리로 들어온다.
//    우리 페이지가 진짜 올라갔는지 확인할 때도 쓴다 — **배포가 성공했다는 것과
//    주소가 열린다는 것은 다른 이야기**다(그 사이에 Pages·도메인·서비스워커가 있다).
//
//   URLS="https://korea-street.com/ja/seoul/luggage/" node scripts/check-guide-links.mjs

const DEFAULT_CANDIDATES = [
  // ── 공공·공식 ────────────────────────────────────────────────────────
  ["서울교통공사", "https://www.seoulmetro.co.kr/"],
  ["티라커 (지하철 물품보관함)", "https://www.t-locker.co.kr/"],
  ["씨티라커", "https://www.citylocker.co.kr/"],
  ["비지트서울 (한국어)", "https://korean.visitseoul.net/"],
  ["비지트서울 (영어)", "https://english.visitseoul.net/"],
  ["대한민국구석구석", "https://korean.visitkorea.or.kr/"],
  ["VisitKorea (영어)", "https://english.visitkorea.or.kr/"],
  ["코레일", "https://www.letskorail.com/"],
  ["김포공항", "https://www.airport.co.kr/gimpo/"],
  ["인천공항", "https://www.airport.kr/"],

  // ── 민간 예약 서비스 ────────────────────────────────────────────────
  // 💡 사장님 결정(2026-09-10): **수익화 안 한다.** 제휴 추적코드 없이
  //    정보로만 적는다. 넣더라도 「공식」과 **눈에 띄게 갈라서** 적을 것.
  ["Radical Storage", "https://radicalstorage.com/"],
  ["Bounce", "https://usebounce.com/"],
];

// 준 게 있으면 그것만 본다. 없으면 위 후보를 본다.
const FROM_ENV = (process.env.URLS ?? "")
  .split(/[\s,]+/)
  .map((t) => t.trim())
  .filter(Boolean)
  .map((url) => [url.replace(/^https?:\/\//, ""), url]);
const CANDIDATES = FROM_ENV.length ? FROM_ENV : DEFAULT_CANDIDATES;

let ok = 0;
let bad = 0;
console.log(`🔗 후보 ${CANDIDATES.length}개를 두드려 본다\n`);

for (const [label, url] of CANDIDATES) {
  try {
    const r = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(20000) });
    const body = r.ok ? await r.text() : "";
    const title =
      body.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim().replace(/\s+/g, " ") ?? "";
    const moved = r.url !== url ? `\n        ↪ 튕긴 곳: ${r.url}` : "";
    if (r.ok) {
      ok++;
      console.log(`   ✅ ${r.status}  ${label}`);
      console.log(`        ${url}${moved}`);
      console.log(`        제목: ${title.slice(0, 90) || "(제목 없음)"}`);
    } else {
      bad++;
      console.log(`   ❌ ${r.status}  ${label}  ${url}${moved}`);
    }
  } catch (e) {
    bad++;
    const why = e?.cause?.code || e?.name || e?.message;
    console.log(`   ❌ 못 열었다  ${label}  ${url}  (${why})`);
  }
}

console.log(`\n열린 것 ${ok}개 · 안 열린 것 ${bad}개`);
console.log("⚠️ 200 이 떴다고 다 쓰지 않는다 — **제목과 튕긴 곳**을 보고 사람이 고른다.");
