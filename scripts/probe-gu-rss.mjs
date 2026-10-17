#!/usr/bin/env node
// 📡 **축제 글이 올 리 없는 게시판을 읽고 있는 구**를 고치기 위해, 다른 RSS 를 **실제로 열어 본다.**
//
// 사장님 (2026-10-17): *"구청 수집기 넓혀"*
//
// 🧭 왜 필요한가 — 서울시 RSS 안내는 **구마다 하나씩만** 준다. 그 하나가
//    강서는 「입찰정보」, 마포는 「공고/고시」, 은평은 「강좌안내」, 종로는 「교육」이고
//    동대문·용산·송파는 아예 없다. 인스타 야간축제 17곳 중 **우리에게 0곳**이던 까닭이다.
//
// 🚫 **주소를 짐작해서 자료에 적지 않는다.** 여기서 하는 일은 **두드려 보는 것**이다.
//    ✅ 가 뜬 것만 사람이 `src/data/gu-rss-extra.json` 에 옮겨 적는다.
//    (작업 환경은 go.kr 에 못 닿는다 — 그래서 이 일은 Actions 에서만 된다.)
//
// 🚨 아무것도 저장하지 않는다. 열어 보고 세기만 한다.
//
//   node scripts/probe-gu-rss.mjs

import { fetchHtml } from "./lib/html-text.mjs";
import feeds from "../src/data/gu-rss-feeds.json" with { type: "json" };

// 축제 글이 올 자리가 아닌 게시판 이름
const 헛자리 = /입찰|공고|고시|강좌|교육|채용|모집|구인/;

const 구목록 = feeds["구"];
const 볼구 = [];
for (const [구, v] of Object.entries(구목록)) {
  const fs = v.feeds ?? [];
  if (!fs.length) 볼구.push([구, "RSS 가 아예 없다"]);
  else if (fs.every((f) => 헛자리.test(f.이름))) 볼구.push([구, `지금 보는 곳: ${fs.map((f) => f.이름).join(", ")}`]);
}
console.log(`🔎 손봐야 할 구 ${볼구.length}곳\n`);
for (const [구, 왜] of 볼구) console.log(`   ${구.padEnd(5)} — ${왜}`);

// 🏗️ 구청 누리집은 몇 가지 **틀**을 돌려 쓴다. 그 틀의 RSS 주소를 두드려 본다.
//    ⚠️ 이것은 **짐작이다.** 그래서 자료에 적지 않고, 200 이면서 <item> 이 들어 있는 것만
//       사람에게 보고한다. 아니면 그냥 버린다.
const 틀 = (호스트) => [
  { 이름: "보도자료(틀A)", url: `https://${호스트}/portal/rss/rssList.do?bbsId=B_000031&recordCountPerPage=10` },
  { 이름: "새소식(틀B)", url: `https://${호스트}/site/main/rss/notice` },
  { 이름: "공지사항(틀C)", url: `https://${호스트}/rss/notice.do` },
  { 이름: "보도자료(틀D)", url: `https://${호스트}/news/rss.do` },
];
// 구 이름 → 누리집 호스트. **서울시 RSS 목록에 이미 들어 있는 주소에서 뽑는다** — 짐작이 아니다.
const 호스트 = {};
for (const [구, v] of Object.entries(구목록)) {
  const u = v.feeds?.[0]?.url;
  if (u) try { 호스트[구] = new URL(u).host; } catch { /* 주소가 아니면 넘긴다 */ }
}

// 🏠 **RSS 가 아예 없는 구**는 호스트를 뽑을 데가 없다. 누리집 주소 후보를 적어 둔다.
//    ⚠️ 이것도 **짐작이다.** 그래서 자료에 적지 않고 **열어 보고 되는 것만** 보고한다.
const 후보호스트 = { 동대문: ["www.ddm.go.kr"], 용산: ["www.yongsan.go.kr"], 송파: ["www.songpa.go.kr"] };

// 🔎 **틀을 짐작하는 대신 누리집에서 RSS 링크를 직접 읽는다.**
//    2026-10-17 첫 실행에서 틀 네 개를 두드려 7곳 중 **1곳(마포)** 만 맞췄다.
//    강서는 모두 500, 은평·종로는 모두 404 였다 — 틀이 구마다 다르다는 뜻이다.
//    누리집 머리에 <link rel="alternate" type="application/rss+xml"> 가 있거나
//    본문에 rss 가 든 주소가 있다. 그걸 긁는 쪽이 짐작보다 낫다.
async function 누리집에서찾기(host) {
  let r;
  try { r = await fetchHtml(`https://${host}/`, { timeoutMs: 15000 }); } catch { return []; }
  const 글 = r?.html ?? "";
  const 찾음 = new Set();
  for (const m of 글.matchAll(/<link[^>]+type=["']application\/(?:rss|atom)\+xml["'][^>]*>/gi)) {
    const u = m[0].match(/href=["']([^"']+)["']/i)?.[1];
    if (u) 찾음.add(new URL(u, `https://${host}/`).href);
  }
  for (const m of 글.matchAll(/href=["']([^"']*rss[^"']*)["']/gi)) {
    try { 찾음.add(new URL(m[1], `https://${host}/`).href); } catch { /* 주소가 아니면 넘긴다 */ }
  }
  return [...찾음].slice(0, 6);
}

console.log("\n── 두드려 본다 (200 이고 <item> 이 있으면 ✅)\n");
for (const [구] of 볼구) {
  const h = 호스트[구] ?? 후보호스트[구]?.[0];
  if (!h) { console.log(`   ${구} — 호스트를 모른다. 사람이 찾아야 한다`); continue; }
  // 누리집에서 실제로 걸려 있는 RSS 주소를 먼저 찾고, 그다음에 틀을 두드린다
  const 누리집것 = (await 누리집에서찾기(h)).map((u, i) => ({ 이름: `누리집에 걸린 RSS ${i + 1}`, url: u }));
  if (누리집것.length) console.log(`   🏠 ${구} — 누리집에서 RSS 주소 ${누리집것.length}개를 찾았다`);
  for (const f of [...누리집것, ...틀(h)]) {
    // ⚠️ fetchHtml 은 **글자가 아니라 `{ status, final, html }`** 를 준다.
    //    2026-10-17 첫 실행에서 이걸 글자처럼 써서 첫 호출에 터졌다.
    let r;
    try { r = await fetchHtml(f.url, { timeoutMs: 15000 }); }
    catch (e) { console.log(`   ❌ ${구} ${f.이름} — ${String(e.message ?? e).slice(0, 60)}`); continue; }
    const 글 = r?.html ?? "";
    if (r?.status !== 200) { console.log(`   ·  ${구} ${f.이름} — 상태 ${r?.status}`); continue; }
    const 건수 = (글.match(/<item\b/gi) ?? []).length + (글.match(/<entry\b/gi) ?? []).length;
    // 첫 <title> 은 피드 이름이라 건너뛰고 글 제목 두 개만 보여 준다
    const 제목 = [...글.matchAll(/<title>\s*(?:<!\[CDATA\[)?\s*([^<\]]{4,60})/gi)]
      .slice(1, 3).map((m) => m[1].trim());
    console.log(건수 > 0
      ? `   ✅ ${구} ${f.이름} — 글 ${건수}건\n        ${f.url}\n        보기: ${제목.join(" / ") || "(제목을 못 읽었다)"}`
      : `   ·  ${구} ${f.이름} — 글 0건`);
    await new Promise((r) => setTimeout(r, 400));
  }
}
console.log(`
🧭 ✅ 가 뜬 것만 src/data/gu-rss-extra.json 에 옮겨 적는다.
   하나도 없으면 그 구는 **사람이 누리집에서 RSS 자리를 찾아 줘야 한다** — 짐작으로 적지 않는다.`);
