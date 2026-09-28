#!/usr/bin/env node
// 🎪 **구석구석 축제 상세 페이지에서 확정 날짜를 받아 온다.**
//
// 사장님 (2026-09-28): *"만들어 유용할거 같다"*
//
// ── 왜 이게 필요한가 ──────────────────────────────────────────────────
//   `src/data/festival-dates.json` 의 확정 날짜 **71건이 전부 2025년**이다.
//   매일 도는 갱신이 관광공사 API 하나만 보는데, 그쪽에 2026년 회차가 아직 없다.
//   그래서 지금은 사장님이 **화면을 캡처해 보내 주셔야** 내가 날짜를 넣는다.
//
//   구석구석(kfes) 상세 페이지에는 **2026년 날짜가 이미 올라와 있다.**
//   2026-09-28에 경복궁 별빛야행으로 확인했다 —
//   「날짜 2026.09.02 ~ 2026.10.24 · 최종 업데이트 2026.08.19」.
//
// ── 🚨 주소를 받는다. 이름으로는 못 찾는다 ────────────────────────────
//   같은 날 재 봤다. **목록도 검색도 껍데기만 온다** —
//     · `wntyFstvlList.do?searchArea=서울특별시&searchDate=10` → 조건을 안 읽는다.
//       무엇을 적든 **63,975자로 똑같은 쪽**이 오고 경북·경남·광주 3건만 들어 있다.
//     · `search_list.do?keyword=경복궁 별빛야행` → **「검색결과 0 개」**.
//     · `festivalCalendar.do` → 날짜 0건.
//   목록·검색은 화면이 뜬 뒤 따로 채워진다. **상세 페이지만 서버가 통째로 준다.**
//   → 그래서 이 도구는 **사장님이 주신 주소**만 읽는다. 이름 검색은 넣지 않았다 —
//     안 되는 걸 되는 척 만들면 조용히 빈 값을 넣게 된다.
//
// 🚨 **아무것도 저장하지 않는다.** 읽어서 보여 주고, 붙여 넣을 꼴로 찍어 준다.
//    넣을지 말지는 사람이 정한다.
//
// ── 돌리는 법 ────────────────────────────────────────────────────────
//   node scripts/fetch-kfes-festival.mjs --urls "https://korean.visitkorea.or.kr/kfes/detail/fstvlDetail.do?fstvlCntntsId=…"

const UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36";

const argv = process.argv.slice(2);
const raw = argv.includes("--urls") ? (argv[argv.indexOf("--urls") + 1] ?? "") : (process.env.URLS ?? "");
const URLS = raw.split(",").map((s) => s.trim()).filter(Boolean);
if (!URLS.length) {
  console.error("❌ 주소가 없다. --urls 로 구석구석 축제 상세 주소를 준다.");
  process.exit(1);
}

/** fetch-page-text.mjs 와 같은 방식으로 글만 남긴다. */
function toText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<\/(td|th)>/gi, "\n")
    .replace(/<\/(tr|p|div|li|h[1-6]|dt|dd|span)>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .split("\n").map((l) => l.replace(/\s+/g, " ").trim()).filter(Boolean)
    .join("\n");
}

/**
 * 「날짜」 같은 이름표 **바로 다음 줄**을 집는다.
 * 구석구석 상세는 이름표와 값이 줄로 갈려 온다:
 *     날짜
 *     2026.09.02 ~ 2026.10.24
 */
function after(lines, label, test) {
  for (let i = 0; i < lines.length - 1; i++) {
    if (lines[i] !== label) continue;
    const v = lines[i + 1];
    if (v && v !== label && (!test || test.test(v))) return v;
  }
  return null;
}

const DATE = /^(20\d{2})\.(\d{2})\.(\d{2})(?:\s*~\s*(20\d{2})\.(\d{2})\.(\d{2}))?$/;
const iso = (y, m, d) => `${y}-${m}-${d}`;

let ok = 0;
for (const url of URLS) {
  console.log("\n" + "═".repeat(70));
  console.log("🎪 " + url);
  console.log("═".repeat(70));
  let text;
  try {
    const r = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(30000), headers: { "User-Agent": UA } });
    if (!r.ok) { console.log(`❌ HTTP ${r.status}`); continue; }
    text = toText(await r.text());
  } catch (e) {
    console.log(`❌ 못 받았다 — ${e.message}`);
    continue;
  }
  const lines = text.split("\n");

  const when = after(lines, "날짜", DATE);
  const name = after(lines, "축제 진행 중") ?? after(lines, "축제 종료") ?? after(lines, "개최예정");
  const where = after(lines, "위치");
  const tel = after(lines, "전화번호");
  const host = after(lines, "업체");
  const price = after(lines, "가격");
  const updated = lines.find((l) => l.startsWith("* 최종 업데이트"))?.replace("* 최종 업데이트 :", "").trim();

  // 🚨 날짜가 없으면 **아무것도 지어내지 않는다.** 쪽이 바뀌었거나 껍데기가 온 것이다.
  if (!when) {
    console.log("❌ 「날짜」 줄을 못 찾았다 — 쪽 모양이 바뀌었거나 축제 상세가 아닐 수 있다.");
    console.log("   받은 글 앞 12줄:");
    lines.slice(0, 12).forEach((l) => console.log("     " + l));
    continue;
  }
  ok++;

  const put = (k, v) => v && console.log(`   ${k.padEnd(10)} ${v}`);
  put("이름", name);
  put("날짜", when);
  put("위치", where);
  put("전화", tel);
  put("주최", host);
  put("가격", price);
  put("갱신", updated);

  const m = when.match(DATE);
  const start = iso(m[1], m[2], m[3]);
  const end = m[4] ? iso(m[4], m[5], m[6]) : start;
  console.log("\n   📋 gu-festival-dates.json 에 붙일 꼴 (우리 곳 id 를 열쇠로 적는다):");
  console.log(JSON.stringify({
    "<우리 id>": {
      start, end,
      source: "대한민국 구석구석 축제 (한국관광공사)",
      sourceUrl: url,
      fetchedAt: new Date().toISOString().slice(0, 10),
      ...(updated ? { siteUpdatedAt: updated.replace(/\./g, "-").replace(/-$/, "") } : {}),
    },
  }, null, 2).split("\n").map((l) => "   " + l).join("\n"));
}

console.log(`\n읽은 것 ${ok}/${URLS.length}`);
console.log("🚨 **아무것도 저장하지 않았다.** 넣을지 말지는 사람이 정한다 —");
console.log("   구석구석 자료도 주최 측이 낸 것이라 바뀔 수 있다. 우리 안내문은 그대로 단다.");
if (!ok) process.exit(1);
