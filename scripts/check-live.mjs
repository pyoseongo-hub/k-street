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
for (const gu of ["jongno-gu", "gangnam-gu"]) {
  try {
    const r = await fetch(`${SITE}/seoul/${gu}/`);
    const html2 = await r.text();
    const m = html2.match(/<a class="eat" href="([^"]+)"[^>]*>([^<]*)</);
    if (!m) {
      fail(`/seoul/${gu}/ 에 밥집 줄이 없다`);
      continue;
    }
    ok(`/seoul/${gu}/ 에 「${m[2].trim()}」 있다`);
    const r2 = await fetch(m[1], { redirect: "follow" });
    const b2 = r2.ok ? await r2.text() : "";
    const t2 = b2.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim() ?? "";
    r2.ok ? ok(`   눌러 보니 ${r2.status} — ${t2}`) : fail(`   눌러 보니 ${r2.status} — ${m[1]}`);
  } catch (e) {
    fail(`/seoul/${gu}/ — ${e?.cause?.code ?? e.name}`);
  }
}

console.log(`\n${"─".repeat(60)}\n${bad ? `❌ 손봐야 할 것 ${bad}가지` : "✅ 새 주소가 제대로 서비스되고 있다"}`);
process.exit(bad ? 1 : 0);
