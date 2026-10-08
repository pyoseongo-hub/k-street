#!/usr/bin/env node
// 📡 **25개 구청의 RSS 주소를 서울시에서 받아 온다.**
//
// 사장님 결정 (2026-10-08): 구청 메일을 25번 신청하는 대신 **RSS 로 간다.**
//   메일은 사람이 읽어야 하고 구마다 따로 신청해야 한다. 25개 구 중 메일을
//   보내 주는 곳은 **6곳뿐**이었다(docs/구청-메일-소식지.md).
//   RSS 는 **기계가 매일 받아 온다** — 지금 축제 날짜를 받는 방식과 같다.
//
// 🎁 왜 이게 되나 — 서울시가 **25개 구의 RSS 주소를 한자리에 모아** 두고 있다.
//    https://www.seoul.go.kr/news/rssboard/siteList.do
//    구를 고르는 자리가 자바스크립트라 주소로는 안 바뀌는데, 안을 뜯어 보니
//    `<form method="post" action="siteList.do">` 에 `schGu` 라는 칸 하나다.
//    그래서 **POST 로 구 이름을 넣어** 25번 부른다.
//    · 강남구에는 「보도자료」·「공지사항」·「**행사안내**」 세 가지가 있었다.
//      우리에게 쓸모 있는 것은 **행사안내**다.
//
// 🚨 **구 이름을 짐작하지 않는다.** 첫 화면의 `schGuSite('강남')` 에서 그대로 긁는다
//    ('중구' 만 「구」가 붙어 있다 — 짐작했으면 틀렸다).
//
//   node scripts/fetch-gu-rss.mjs          # 맛보기(파일 안 씀)
//   node scripts/fetch-gu-rss.mjs --apply  # src/data/gu-rss-feeds.json 에 반영

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { UA } from "./lib/html-text.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_JSON = join(__dirname, "..", "src", "data", "gu-rss-feeds.json");
const OUT_MD = join(__dirname, "..", "docs", "구청-RSS-목록.md");
const APPLY = process.argv.includes("--apply");

const 목록쪽 = "https://www.seoul.go.kr/news/rssboard/siteList.do";

async function 받기(body) {
  const r = await fetch(목록쪽, {
    method: body ? "POST" : "GET",
    redirect: "follow",
    signal: AbortSignal.timeout(30000),
    headers: {
      "User-Agent": UA,
      ...(body ? { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" } : {}),
    },
    body,
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.text();
}

// 한 구의 쪽에서 (이름, RSS 주소) 짝을 뽑는다.
// 쪽 모양: 표 한 줄에 게시판 이름과 주소가 같이 있다.
function 짝뽑기(html) {
  const out = [];
  // <tr> 단위로 자른다 — 줄 밖의 주소(안내문 속 보기글)를 끌어오지 않으려고.
  for (const tr of html.split(/<tr\b/i).slice(1)) {
    const url = tr.match(/https?:\/\/[^\s"'<>]*rss[^\s"'<>]*/i)?.[0];
    if (!url) continue;
    const 글 = tr
      .replace(/<[^>]+>/g, "\n")
      .replace(/&amp;/g, "&")
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    // 이름은 주소가 아닌 첫 줄. 「복사」 같은 단추 글은 버린다.
    const 이름 = 글.find((l) => !/^https?:/i.test(l) && !/복사|보기|RSS 주소/.test(l) && l.length > 1);
    out.push({ 이름: 이름 ?? "(이름 없음)", url: url.replace(/&amp;/g, "&") });
  }
  // 같은 주소는 한 번만
  const seen = new Set();
  return out.filter((f) => (seen.has(f.url) ? false : (seen.add(f.url), true)));
}

// 우리에게 쓸모 있는 것 — 행사·축제·문화. 보도자료도 축제 발표가 자주 나온다.
const 쓸모 = /행사|축제|문화|관광|보도\s*자료|새소식|구정\s*소식/;

const 첫쪽 = await 받기(null);
const 구이름 = [...new Set([...첫쪽.matchAll(/schGuSite\(\s*'([^']+)'\s*\)/g)].map((m) => m[1]))];
if (구이름.length < 20) {
  throw new Error(
    `구 고르는 자리를 ${구이름.length}개만 찾았다 (25개여야 한다). 쪽 모양이 바뀐 것이다 — 멈춘다.`,
  );
}
console.log(`🗂️ 구 ${구이름.length}개: ${구이름.join(" · ")}`);
console.log("");

const 모음 = {};
let 빈곳 = 0;
for (const 구 of 구이름) {
  let feeds = [];
  try {
    const html = await 받기(new URLSearchParams({ schGu: 구 }).toString());
    feeds = 짝뽑기(html);
  } catch (e) {
    console.log(`❌ ${구} — ${e.message}`);
    모음[구] = { feeds: [], 오류: e.message };
    빈곳++;
    continue;
  }
  if (!feeds.length) {
    // 🚨 **조용히 넘기지 않는다.** 0개는 「RSS 가 없다」일 수도 있고
    //    「우리가 쪽을 잘못 읽었다」일 수도 있다. 둘은 할 일이 다르다.
    console.log(`· ${구} — RSS 0개 (쪽은 열렸다)`);
    모음[구] = { feeds: [] };
    빈곳++;
    continue;
  }
  모음[구] = { feeds };
  const 쓸것 = feeds.filter((f) => 쓸모.test(f.이름));
  console.log(`✅ ${구} — RSS ${feeds.length}개 (쓸모 있는 것 ${쓸것.length}개: ${쓸것.map((f) => f.이름).join(", ") || "없음"})`);
}

const 총 = Object.values(모음).reduce((a, v) => a + v.feeds.length, 0);
const 쓸모총 = Object.values(모음).reduce(
  (a, v) => a + v.feeds.filter((f) => 쓸모.test(f.이름)).length,
  0,
);
console.log("");
console.log(`📡 RSS ${총}개 · 그중 행사·문화·보도자료 ${쓸모총}개 · RSS 를 못 찾은 구 ${빈곳}곳`);

const 자료 = {
  _읽어보세요: [
    "📡 **25개 구청의 RSS 주소.** scripts/fetch-gu-rss.mjs 가 서울시에서 받아 온다.",
    "손으로 고치지 말 것 — 다음 실행이 덮어쓴다.",
    "받는 곳: https://www.seoul.go.kr/news/rssboard/siteList.do (schGu 칸에 구 이름을 넣어 POST)",
    "왜 메일이 아니라 RSS 인가: docs/구청-메일-소식지.md 참고 (메일을 보내는 구는 6곳뿐이었다)",
  ],
  받은날: new Date().toISOString().slice(0, 10),
  구: 모음,
};

if (APPLY) {
  writeFileSync(OUT_JSON, JSON.stringify(자료, null, 2) + "\n");
  const md = ["# 📡 구청 RSS 목록", "", `받은 날: **${자료.받은날}** · RSS ${총}개 · 행사·문화·보도자료 ${쓸모총}개`, ""];
  md.push("🤖 `scripts/fetch-gu-rss.mjs` 가 서울시 「자치구 RSS」 쪽에서 받아 온다. 손으로 적은 것이 아니다.");
  md.push("");
  md.push("| 구 | 게시판 | RSS 주소 |");
  md.push("|---|---|---|");
  for (const [구, v] of Object.entries(모음))
    for (const f of v.feeds)
      md.push(`| ${구} | ${쓸모.test(f.이름) ? `**${f.이름}**` : f.이름} | ${f.url} |`);
  md.push("");
  md.push("**굵은 글씨**가 우리에게 쓸모 있는 것이다 — 행사·축제·문화·관광·보도자료.");
  writeFileSync(OUT_MD, md.join("\n") + "\n");
  console.log(`💾 src/data/gu-rss-feeds.json · docs/구청-RSS-목록.md 에 적었다.`);
} else {
  console.log("👀 맛보기였다. 파일에 적으려면 --apply 를 붙인다.");
}
