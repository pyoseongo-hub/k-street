// 🔎 **실제로 서비스되는 주소**를 열어 제대로 나오는지 본다.
//
// 왜 필요한가 (2026-09-04 도메인 연결) — 빌드가 맞게 나왔다는 것과, 그게 손님이
// 여는 주소에서 제대로 뜬다는 것은 다른 이야기다. 도메인을 붙이면 사이트가
// 하위 경로(/k-street/)에서 최상단(/)으로 옮겨지는데, 한 곳만 어긋나도
// **파일을 못 찾아 화면이 통째로 빈다.** 그런데 그건 오류 없이 조용히 일어난다.
//
// 작업 세션(에이전트 샌드박스)은 바깥 인터넷이 막혀 있다 — 러너에서 돌린다.
//
// 실행:  SITE=https://korea-street.com node scripts/check-live.mjs

const SITE = (process.env.SITE || "https://korea-street.com").replace(/\/$/, "");
let bad = 0;
const fail = (m) => { bad++; console.log(`   ❌ ${m}`); };
const ok = (m) => console.log(`   ✅ ${m}`);

console.log(`🔎 ${SITE} 를 열어 본다.\n`);

const res = await fetch(SITE + "/", { redirect: "follow" });
console.log(`첫 화면: HTTP ${res.status}${res.url !== SITE + "/" ? ` (${res.url})` : ""}`);
if (!res.ok) { fail("첫 화면이 안 열린다"); process.exit(1); }
const html = await res.text();

// ── ① 파일 주소가 최상단 기준인가 ──────────────────────────────────────
console.log("\n① 파일을 어디서 찾나");
const assets = [...html.matchAll(/(?:src|href)="(\/[^"]*\/assets\/[^"]+|\/assets\/[^"]+)"/g)].map((m) => m[1]);
if (!assets.length) fail("자바스크립트·스타일 주소를 못 찾았다");
for (const a of new Set(assets)) {
  if (a.startsWith("/k-street/")) fail(`아직 옛 경로다: ${a}`);
  else ok(a);
}

// ── ② 그 파일이 실제로 받아지나 (여기가 비면 화면이 빈다) ──────────────
console.log("\n② 그 파일이 진짜 받아지나");
for (const a of new Set(assets)) {
  const r = await fetch(SITE + a);
  r.ok ? ok(`${r.status}  ${a}`) : fail(`${r.status}  ${a}`);
  r.body?.cancel?.();
}

// ── ③ 링크 미리보기 카드 ───────────────────────────────────────────────
console.log("\n③ 링크 미리보기 카드");
const og = (p) => html.match(new RegExp(`property="og:${p}" content="([^"]+)"`))?.[1];
for (const [k, v] of [["url", og("url")], ["image", og("image")]]) {
  if (!v) fail(`og:${k} 가 없다`);
  else if (!v.startsWith(SITE)) fail(`og:${k} 가 다른 주소를 가리킨다: ${v}`);
  else ok(`og:${k} = ${v}`);
}
const img = og("image");
if (img) {
  const r = await fetch(img);
  const type = r.headers.get("content-type") ?? "";
  r.ok && type.startsWith("image/") ? ok(`카드 그림이 열린다 (${type})`) : fail(`카드 그림이 안 열린다 (${r.status} ${type})`);
  r.body?.cancel?.();
}

// ── ④ 앱으로 설치될 때 쓰는 정보 ───────────────────────────────────────
console.log("\n④ 홈 화면에 추가할 때");
try {
  const m = await (await fetch(SITE + "/manifest.webmanifest")).json();
  m.start_url === "/" ? ok(`start_url = ${m.start_url}`) : fail(`start_url 이 ${m.start_url} 이다 — 설치한 앱이 엉뚱한 데로 열린다`);
  m.scope === "/" ? ok(`scope = ${m.scope}`) : fail(`scope 가 ${m.scope} 이다`);
} catch { fail("manifest 를 못 읽었다"); }

// ── ⑤ 옛 주소는 어떻게 되나 ────────────────────────────────────────────
console.log("\n⑤ 옛 주소로 들어오면");
try {
  const r = await fetch("https://pyoseongo-hub.github.io/k-street/", { redirect: "manual" });
  const loc = r.headers.get("location");
  console.log(`   HTTP ${r.status}${loc ? ` → ${loc}` : ""}`);
  if (loc?.includes("korea-street.com")) ok("새 주소로 넘겨 준다");
  else console.log("   ⓘ 아직 안 넘어간다 — GitHub 쪽 반영에 시간이 걸릴 수 있다");
  r.body?.cancel?.();
} catch (e) { console.log(`   못 열었다 (${e?.cause?.code ?? e.name})`); }

// ── ⑥ 주소 끝 빗금 — 둘 다 열리나 ─────────────────────────────────────
//
// 왜 (2026-09-08, 밥집 연동) — 서로 링크를 걸기로 하면서 저쪽에서 물어 왔다.
// `/seoul/jongno-gu` 와 `/seoul/jongno-gu/` 는 **다른 주소**다. 한쪽만 열리면,
// 누군가 빗금을 붙이거나 떼는 날 **아무 소리 없이** 깨진다. 우리 페이지는
// 폴더 안 index.html 이라 호스팅(GitHub Pages)이 빗금 없는 쪽을 넘겨 주는데,
// 그건 **우리 코드가 아니라 남의 동작**이다 — 그러니 눈으로 확인해 둔다.
console.log("\n⑥ 주소 끝 빗금 (둘 다 열려야 한다)");
for (const path of ["/seoul/jongno-gu", "/seoul/", "/place/gwangjang-market"]) {
  for (const p of [path.replace(/\/$/, ""), path.replace(/\/$/, "") + "/"]) {
    try {
      const r = await fetch(SITE + p, { redirect: "follow" });
      const body = r.ok ? await r.text() : "";
      // 200 만으로는 모자란다 — 첫 화면(앱)이 대신 뜬 것일 수도 있다.
      // 그 페이지에만 있는 표시(canonical)가 있는지까지 본다.
      const isPage = body.includes('rel="canonical"');
      r.ok && isPage ? ok(`${r.status}  ${p}`) : fail(`${r.status}  ${p}${r.ok ? " — 열리긴 하는데 그 페이지가 아니다" : ""}`);
    } catch (e) {
      fail(`${p} — 못 열었다 (${e?.cause?.code ?? e.name})`);
    }
  }
}

// ── ⑦ 밥집 쪽 주소가 인터넷에서 열리나 ─────────────────────────────────
//
// 🚨 **우리가 링크를 켜기 전에 반드시 통과해야 하는 칸**이다
//    (src/lib/partnerLinks.ts 의 PARTNER_READY). 저쪽 확인은 「로컬로 열어 본 것」
//    이었다 — 로컬에서 되는 것과 인터넷에 올라간 것은 다른 이야기다.
//    눌렀는데 빈 화면이면 손님은 **두 앱 다** 못 믿는다.
//
// ⚠️ 남의 서버다. 몇 개만 두드린다.
const PARTNER = (process.env.PARTNER || "https://kfood-t493.onrender.com").replace(/\/$/, "");
if (process.env.SKIP_PARTNER !== "1") {
  console.log(`\n⑦ 밥집 쪽 (${PARTNER})`);
  for (const p of ["/seoul/jongno-gu", "/seoul/jongno-gu/", "/seoul/jongno-gu?hl=en", "/seoul/jung-gu?hl=ja"]) {
    try {
      const r = await fetch(PARTNER + p, { redirect: "follow" });
      const body = r.ok ? await r.text() : "";
      // 🈳 **영어로 열리나** — 200 만으로는 모자란다(연동 준비물 ④가 가장 중요한 칸이다).
      //    12개 언어로 안내해 놓고 마지막에 한글 화면으로 보내면 손님은 거기서 끝난다.
      //    제목과 한글 글자 수를 같이 적어 둔다 — 사람이 보고 판단할 수 있게.
      const title = body.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim() ?? "(제목 없음)";
      const hangul = (body.match(/[가-힣]/g) ?? []).length;
      console.log(`   HTTP ${r.status}  ${p}  (${body.length.toLocaleString()}자 · 한글 ${hangul}자)`);
      console.log(`      제목: ${title}`);
      if (!r.ok) fail(`${r.status}  ${p}`);
      else ok(`${p}`);
    } catch (e) {
      fail(`${p} — 못 열었다 (${e?.cause?.code ?? e.name})`);
    }
  }
}

// ── ⑧ 두 앱이 진짜로 이어졌나 (끝에서 끝까지) ──────────────────────────
//
// 앞의 ⑥⑦은 각자 열리는지만 봤다. 정작 중요한 것은 **손님이 밟는 길**이다 —
// 우리 구별 페이지에 그 줄이 실제로 붙어 있고, 거기 적힌 주소를 눌렀을 때
// 밥집 목록이 뜨는가. 우리가 켰다고 믿는 것과 손님 화면에 있는 것은 다르다.
console.log("\n⑧ 두 앱이 이어졌나 (우리 페이지 → 밥집)");
// 곳 페이지도 같이 본다 (2026-09-09) — 동네를 아는 곳은 동네로, 모르는 곳은 구로
// 가야 한다. 셋을 고른 이유: 광장시장은 이름으로 이은 곳, 상수동 카페거리는
// 주소의 법정동으로 이은 곳, 전쟁기념관은 **도로명 함정에 걸렸던 곳**이다
// (「이태원로」 때문에 이태원으로 갈 뻔했다 — 지금 용산구로 가야 맞다).
for (const path of [
  "/seoul/jongno-gu/",
  "/seoul/gangnam-gu/",
  "/place/gwangjang-market/",
  "/place/sangsu-dong-cafe-street/",
  "/place/war-memorial-museum/",
]) {
  try {
    const r = await fetch(`${SITE}${path}`);
    const html2 = await r.text();
    const m = html2.match(/<a class="eat" href="([^"]+)"[^>]*>([^<]*)</);
    if (!m) {
      fail(`${path} 에 밥집 줄이 없다`);
      continue;
    }
    ok(`${path} 에 「${m[2].trim()}」 있다`);
    const r2 = await fetch(m[1], { redirect: "follow" });
    const b2 = r2.ok ? await r2.text() : "";
    const t2 = b2.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim() ?? "";
    r2.ok ? ok(`   눌러 보니 ${r2.status} — ${t2}`) : fail(`   눌러 보니 ${r2.status} — ${m[1]}`);
  } catch (e) {
    fail(`${path} — ${e?.cause?.code ?? e.name}`);
  }
}

// ── ⑨ 2단계 후보 — 저쪽 「동네」 페이지 (알아만 본다, 실패로 안 센다) ────
//
// 저쪽이 구 25개 말고 **관광객이 아는 이름** 12곳(홍대·이태원·강남·북촌·을지로·
// 광장시장 …)에도 페이지를 만들었다고 알려 왔다. 우리 곳 페이지에서 이어 줄 때
// 훨씬 정확해진다 — 특히 **광장시장은 우리 곳 페이지에도 있는 이름**이다.
// 주소 규칙을 우리가 모르므로 몇 개 두드려 보고 **결과만 적는다.**
// 🚨 여기서 안 열리는 것은 사고가 아니다 — 이름을 잘못 짚었을 뿐이라 실패로 안 센다.
if (process.env.SKIP_PARTNER !== "1") {
  console.log("\n⑨ 2단계 후보 — 저쪽 동네 페이지 (알아보기만)");
  // 🚨 **우리가 실제로 링크를 거는 서울 동네 8곳 전부.** 2026-09-09에 세어 보니
//    myeongdong·itaewon·seongsu·gangnam 네 개는 **열어 보지도 않고 링크를 걸어 뒀다**
//    (곳 12장이 거기로 간다). 저쪽이 준 목록만 믿고 넘긴 것이다 — 목록은 근거가
//    아니라 주장이다. 여기에 넣어 매번 같이 확인한다.
for (const p of [
  "/seoul/myeongdong",
  "/seoul/hongdae",
  "/seoul/itaewon",
  "/seoul/seongsu",
  "/seoul/gangnam",
  "/seoul/bukchon",
  "/seoul/euljiro",
  "/seoul/gwangjang-market",
]) {
    try {
      const r = await fetch(PARTNER + p, { redirect: "follow" });
      const b = r.ok ? await r.text() : "";
      const t = b.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim() ?? "";
      console.log(`   ${r.status}  ${p}${t ? `  — ${t}` : ""}`);
    } catch (e) {
      console.log(`   못 열었다  ${p} (${e?.cause?.code ?? e.name})`);
    }
  }
}

// ── ⑩ 언어 페이지가 진짜로 서비스되나 ──────────────────────────────────
//
// 🌏 2026-09-09에 곳 페이지를 12개 언어로 늘렸다(3,684장). 그런데 **새로 만든
//    3,377장을 여기서 한 장도 안 보고 있었다** — 그날 이 검사는 전부 ✅ 였다.
//    안 보는 자리는 조용히 깨진다. 실제로 두 번 그랬다(/place/ · /seoul/).
//
// 언어마다 따로 걸릴 수 있는 사고가 있다:
//   · GitHub Pages 가 `zh-TW` 처럼 **대문자 섞인 폴더**를 그대로 내주나
//   · 언어 폴더에 진짜 HTML 이 아니라 **앱 첫 화면**이 나가지 않나
//   · hreflang 이 13줄(12개 언어 + x-default) 다 붙었나 — 하나라도 빠지면
//     구글이 언어판을 못 묶어 **서로 중복이라고 판정한다**
console.log("\n⑩ 언어 페이지 (12개 언어를 한 장씩 열어 본다)");
for (const lang of ["ko", "ja", "zh", "zh-TW", "vi", "es", "fr", "de", "ru", "id", "th", "en"]) {
  const path = lang === "en" ? "/place/gwangjang-market/" : `/${lang}/place/gwangjang-market/`;
  try {
    const r = await fetch(SITE + path, { redirect: "follow" });
    if (!r.ok) { fail(`${r.status}  ${path}`); continue; }
    const b = await r.text();
    const htmlLang = b.match(/<html[^>]*\slang="([^"]+)"/i)?.[1] ?? "";
    const canon = b.match(/rel="canonical" href="([^"]*)"/)?.[1] ?? "";
    const alts = (b.match(/rel="alternate"/g) ?? []).length;
    const title = b.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim() ?? "";
    if (b.includes('<div id="root">')) fail(`${path} — 진짜 페이지가 아니라 앱 첫 화면이 나왔다`);
    else if (htmlLang !== lang) fail(`${path} — html lang 이 "${htmlLang}" 이다 (${lang} 여야 한다)`);
    else if (canon !== SITE + path) fail(`${path} — canonical 이 ${canon || "(없음)"} 이다`);
    else if (alts !== 13) fail(`${path} — hreflang 이 ${alts}줄이다 (13줄이어야 한다)`);
    else ok(`${lang.padEnd(5)} ${title}`);
  } catch (e) {
    fail(`${path} — ${e?.cause?.code ?? e.name}`);
  }
}

// ── ⑪ 묶음 페이지의 언어판 ──────────────────────────────────────────────
//
// 🗂️ 묶음 44장 × **12개 언어 = 528장** (2026-09-10에 다 찼다).
//    일부러 자리를 골고루 섞었다 — 구별·달별·갈래별·대문 네 종류가 다 들어가게.
//    한 종류만 재면 다른 세 종류가 깨져도 통과한다.
console.log("\n⑪ 묶음 페이지의 언어판 (12개 언어 × 네 종류)");
for (const [lang, path] of [
  ["en", "/seoul/"],
  ["ja", "/ja/seoul/jongno-gu/"],
  ["zh", "/zh/seoul/festivals-in-october/"],
  ["zh-TW", "/zh-TW/seoul/traditional-markets/"],
  ["ko", "/ko/seoul/jongno-gu/"],
  ["vi", "/vi/seoul/festivals-in-october/"],
  ["th", "/th/seoul/museums/"],
  ["id", "/id/seoul/"],
  ["es", "/es/seoul/festivals-in-october/"],
  ["fr", "/fr/seoul/flower-walks/"],
  ["de", "/de/seoul/traditional-markets/"],
  ["ru", "/ru/seoul/"],
]) {
  try {
    const r = await fetch(SITE + path, { redirect: "follow" });
    if (!r.ok) { fail(`${r.status}  ${path}`); continue; }
    const b = await r.text();
    const htmlLang = b.match(/<html[^>]*\slang="([^"]+)"/i)?.[1] ?? "";
    const title = b.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim() ?? "";
    if (b.includes('<div id="root">')) fail(`${path} — 진짜 페이지가 아니라 앱 첫 화면이 나왔다`);
    else if (htmlLang !== lang) fail(`${path} — html lang 이 "${htmlLang}" 이다 (${lang} 여야 한다)`);
    else ok(`${lang.padEnd(5)} ${title}`);
  } catch (e) {
    fail(`${path} — ${e?.cause?.code ?? e.name}`);
  }
}

// ── ⑫ hreflang 이 가리키는 주소가 정말 열리나 ───────────────────────────
//
// 🔬 **줄 수를 세는 것으로는 부족하다** (2026-09-10에 잣대를 고쳤다).
//    전에는 「묶음은 5줄이어야 한다」로 숫자를 박아 뒀다. 그러면 언어를 더할 때마다
//    이 숫자를 손으로 고쳐야 하고, 무엇보다 **줄 수가 맞아도 그 주소가 없을 수 있다.**
//    묶음은 언어 수가 곳 페이지보다 적어서(아직 8개) 실수로 12개를 적으면
//    **없는 페이지 4장을 가리킨다** — 구글이 404 를 받고 hreflang 묶음을 못 믿는다.
//    그래서 한 장을 골라 **적혀 있는 대체 주소를 전부 두드려 본다.** 이게 진짜 검사다.
console.log("\n⑫ hreflang 이 가리키는 주소가 다 열리나 (묶음 한 장 · 곳 한 장)");
for (const path of ["/seoul/jongno-gu/", "/place/gwangjang-market/"]) {
  const r = await fetch(SITE + path, { redirect: "follow" });
  const b = r.ok ? await r.text() : "";
  const alts = [...b.matchAll(/rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)];
  if (!alts.length) { fail(`${path} — hreflang 이 한 줄도 없다`); continue; }
  let dead = 0;
  for (const [, lang, href] of alts) {
    const rr = await fetch(href, { redirect: "follow", method: "GET" });
    if (!rr.ok) { fail(`${path} 의 hreflang="${lang}" → ${rr.status} ${href}`); dead++; }
    rr.body?.cancel?.();
  }
  if (!dead) ok(`${path} — 대체 주소 ${alts.length}개 전부 열린다 (${alts.map((a) => a[1]).join(" ")})`);
}

console.log(`\n${"─".repeat(60)}\n${bad ? `❌ 손봐야 할 것 ${bad}가지` : "✅ 새 주소가 제대로 서비스되고 있다"}`);
process.exit(bad ? 1 : 0);
