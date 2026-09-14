#!/usr/bin/env node
// 🌸 **서울 봄꽃길** — 단풍길의 짝을 찾는다.
//
// 사장님 (2026-09-14): *"테마로 빼서 강추 — 봄 꽃길 · 가을 단풍길 추천. 이게 있으면 좋겠는데."*
//
// 단풍길이 `storyw/autumn/list.do` 였으니 봄꽃길은 `spring` 일 것이라고 본다.
// **짐작이다.** 그래서 이 판은 엿보기다 — 주소 후보를 하나씩 두드려 보고,
// 200 이 오면 단풍길과 **같은 무늬인지**(box t · num · local · rlocation) 센다.
//
// 🚨 200 이 곧 "받았다"는 뜻이 아니다. autumn 때 m.html 이 200 을 주면서
//    오류 페이지로 넘겼다. **최종 주소**를 반드시 본다.

const UA =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36";

const TRY = [
  "https://www.seoul.go.kr/storyw/spring/list.do",
  "https://www.seoul.go.kr/story/spring/pc.html",
  "https://www.seoul.go.kr/storyw/flower/list.do",
  "https://www.seoul.go.kr/storyw/bomkkot/list.do",
  "https://www.seoul.go.kr/storyw/autumn/list.do", // 대조군 — 이건 된다는 걸 안다
];

for (const url of TRY) {
  console.log("\n" + "═".repeat(66));
  console.log(`🌸 ${url}`);
  console.log("═".repeat(66));
  let res;
  try {
    res = await fetch(url, {
      headers: { "User-Agent": UA, "Accept-Language": "ko-KR,ko;q=0.9" },
      signal: AbortSignal.timeout(25000),
      redirect: "follow",
    });
  } catch (e) {
    console.log(`   ⬜ 못 물어봤다 — ${e.name}: ${e.message}`);
    continue;
  }
  const bad = /errorAccess/.test(res.url);
  console.log(`   HTTP ${res.status} · 최종 ${res.url}${bad ? "  ← 오류 페이지로 넘어갔다" : ""}`);
  if (!res.ok || bad) continue;

  const html = await res.text();
  const n = (re) => (html.match(re) ?? []).length;
  console.log(`   원문 ${html.length}자`);
  console.log(
    `   무늬: box t${n(/<div class="box t\d"/g)} · num ${n(/<span class="num">/g)} · ` +
      `local ${n(/<p class="local">/g)} · rlocation ${n(/class=['"]rlocation['"]/g)}`
  );
  console.log(`   낱말: 벚꽃 ${n(/벚꽃/g)} · 꽃길 ${n(/꽃길/g)} · 단풍 ${n(/단풍/g)}`);

  // 앞 세 항목의 이름만 뽑아 본다 — 무늬가 같으면 그대로 읽힌다.
  const names = [...html.matchAll(/<h3>([\s\S]*?)<\/h3>/g)]
    .slice(0, 4)
    .map((m) =>
      m[1]
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .normalize("NFC")
    );
  console.log(`   앞 이름: ${names.join(" | ") || "(없음)"}`);

  // 갈래 머리글이 있나 — 단풍길에서 못 맞춘 그 갈래다.
  const heads = [...new Set((html.match(/[가-힣 ]{4,20}(?:꽃길|단풍길)/g) ?? []))].slice(0, 14);
  console.log(`   '…꽃길/단풍길' 로 끝나는 말: ${heads.join(" · ") || "(없음)"}`);
}

console.log(`

👀 **엿보기다 — 아무것도 저장하지 않았다.**`);
