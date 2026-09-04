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

console.log(`\n${"─".repeat(60)}\n${bad ? `❌ 손봐야 할 것 ${bad}가지` : "✅ 새 주소가 제대로 서비스되고 있다"}`);
process.exit(bad ? 1 : 0);
