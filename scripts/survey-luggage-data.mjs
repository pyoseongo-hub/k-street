#!/usr/bin/env node
// 🧳 **짐 보관 위치 자료가 세상에 있나 훑어본다.** (2026-09-10)
//
// 왜 (사장님 지적):
//   "특정 관광지 명동 강남 홍대 이런데 창고 길안내 / 지하철이면 몇 번 출구라던가
//    설명 있을 줄 알았지 / 이 정도면 그냥 가이드 한 페이지로 만들고 말지"
//
//   맞는 말이다. 지금 짐 보관 안내에는 **위치가 한 곳도 없다.**
//   필요한 것은 「홍대입구역 몇 번 출구 쪽」인데, 그건 **기억으로 적으면 안 되는**
//   종류의 정보다. 틀리면 손님이 캐리어를 끌고 반대편으로 걸어간다.
//
// 🚨 1차(11:16)에서 배운 것 — **빈손과 못 읽은 것을 갈라야 한다.**
//    · 한국관광공사: 진짜 0건 (여기엔 없다)
//    · 공공데이터포털: 200 인데 제목을 못 뽑았다 → **내 검사가 못 읽은 것**
//    · 서울 열린데이터광장: 자료 이름을 내가 찍어서 넣었는데 전부 틀렸다
//    그래서 2차는 **찾은 척하지 않고 증거를 그대로 뿌린다** — 키워드가 나온
//    자리의 앞뒤 글자를 찍어서, 자료가 그 안에 있기는 한지 눈으로 본다.
//
// ⚠️ 아무것도 저장하지 않는다. 무엇을 쓸지는 이걸 읽고 사람이 정한다.

const KEY = process.env.TOUR_API_KEY ?? "";
const UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36";

async function get(url) {
  try {
    const r = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(30000), headers: { "User-Agent": UA } });
    const text = await r.text();
    return { ok: r.ok, status: r.status, text, final: r.url };
  } catch (e) {
    return { ok: false, status: 0, text: "", err: e?.cause?.code || e?.name || e?.message };
  }
}

/** 키워드가 나온 자리의 앞뒤를 그대로 보여 준다 — 찾은 척하지 않기 위해. */
function evidence(text, kw, max = 6) {
  const out = [];
  let i = -1;
  while (out.length < max && (i = text.indexOf(kw, i + 1)) !== -1) {
    const chunk = text.slice(Math.max(0, i - 110), i + 110).replace(/\s+/g, " ");
    out.push(chunk);
  }
  return out;
}

console.log("═══ ① 공공데이터포털 — 검색 결과 안에 자료 이름이 있기는 한가 ═══");
console.log("   1차에서 제목을 못 뽑았다. 자료가 없어서인지 내가 못 읽어서인지 가른다.\n");

for (const kw of ["물품보관함", "관광안내소"]) {
  const url = `https://www.data.go.kr/tcs/dss/selectDataSetList.do?keyword=${encodeURIComponent(kw)}`;
  const r = await get(url);
  console.log(`── ${kw}  →  ${r.ok ? "✅" : "❌"} ${r.status} · ${r.text.length.toLocaleString()}자`);
  const ev = evidence(r.text, kw);
  if (!ev.length) {
    console.log(`   ⚠️ 받은 글 안에 「${kw}」가 **한 번도 안 나온다** → 목록을 자바스크립트로 그린다는 뜻`);
  } else {
    console.log(`   「${kw}」가 ${ev.length}군데 나온다. 앞뒤를 그대로 보인다:`);
    ev.forEach((e, n) => console.log(`     ${n + 1}) …${e}…`));
  }
  console.log("");
}

console.log("\n═══ ② 서울 열린데이터 광장 — 자료 목록을 검색해서 **진짜 이름**을 찾는다 ═══");
console.log("   1차에서는 이름을 내가 찍었다. 이번엔 검색 페이지에서 뽑는다.\n");

for (const kw of ["물품보관함", "관광안내소"]) {
  const url = `https://data.seoul.go.kr/dataList/datasetList.do?srchKeyword=${encodeURIComponent(kw)}`;
  const r = await get(url);
  console.log(`── ${kw}  →  ${r.ok ? "✅" : "❌"} ${r.status} · ${r.text.length.toLocaleString()}자${r.err ? ` (${r.err})` : ""}`);
  // 열린데이터광장 자료는 OA-숫자 로 번호가 붙는다. 그게 보이면 실마리다.
  const oa = [...new Set([...r.text.matchAll(/OA-\d+/g)].map((m) => m[0]))].slice(0, 15);
  if (oa.length) console.log(`   자료 번호: ${oa.join(" · ")}`);
  const ev = evidence(r.text, kw, 4);
  if (!ev.length) console.log(`   ⚠️ 받은 글 안에 「${kw}」가 안 나온다`);
  else ev.forEach((e, n) => console.log(`     ${n + 1}) …${e}…`));
  console.log("");
}

console.log("\n═══ ③ 실제 운영자 쪽 — 주소가 살아 있나 ═══");
console.log("   ⚠️ 여기 주소는 **내 기억**이다. 그래서 두드려 본다. 1차 때 3개가 틀렸다.\n");

for (const [label, url] of [
  ["서울교통공사", "https://www.seoulmetro.co.kr/kr/page.do?menuIdx=546"],
  ["또타라커", "https://www.ttalocker.co.kr/"],
  ["코레일 유통 물품보관함", "https://www.korailretail.com/"],
  ["서울관광재단 안내소", "https://www.sto.or.kr/"],
  ["비지트서울 짐보관", "https://english.visitseoul.net/luggage"],
]) {
  const r = await get(url);
  const title = r.text.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim().replace(/\s+/g, " ") ?? "";
  console.log(`── ${label}  →  ${r.ok ? "✅" : "❌"} ${r.status}${r.err ? ` (${r.err})` : ""}`);
  console.log(`   ${url}${r.final && r.final !== url ? `\n   ↪ 튕긴 곳: ${r.final}` : ""}`);
  if (r.ok) console.log(`   제목: ${title.slice(0, 80) || "(없음)"}`);
}

console.log("\n\n═══ ④ 한국관광공사 — 1차에서 0건이었다. 갈래를 넓혀 다시 확인 ═══");
if (!KEY) console.log("   ⚠️ TOUR_API_KEY 없음 — 건너뜀");
else {
  const base = "https://apis.data.go.kr/B551011/KorService2";
  const common = `serviceKey=${KEY}&MobileOS=ETC&MobileApp=kstreet&_type=json&numOfRows=3&pageNo=1`;
  // 갈래를 안 걸고 전국에서 찾아본다 — 서울에 없을 뿐일 수도 있다
  for (const kw of ["물품보관함", "관광안내"]) {
    const r = await get(`${base}/searchKeyword2?${common}&keyword=${encodeURIComponent(kw)}`);
    let total = "?";
    try { total = JSON.parse(r.text)?.response?.body?.totalCount ?? "?"; } catch { /* 그대로 둔다 */ }
    console.log(`── 전국 「${kw}」 → ${total}건`);
  }
}

console.log("\n\n═══ 정리 ═══");
console.log("증거를 그대로 뿌렸다. **없는 것과 못 읽은 것을 갈라서** 다음을 정한다.");
