#!/usr/bin/env node
// 📷 **서울시 단풍길 사진을 써도 되나** — 이용 조건과 실물을 같이 본다.
//
// 사장님 (2026-09-14): *"A로 하되 찾아보고 … 단풍 사진 넣는 방법."*
//   A = 서울시 페이지 사진을 쓴다. 다만 **확인 먼저.**
//
// ── 무엇을 확인하나 ─────────────────────────────────────────────────────
// ① 페이지에 **공공누리 표시**가 붙어 있나. 제1유형이면 출처만 밝히고 쓸 수 있다.
//    (지금 앱이 쓰는 관광공사 사진이 그 등급이다 — docs/사진-저작권.md)
// ② 사진이 정말 `roadimg/001.jpg ~ 110.jpg` 로 규칙적으로 있나.
// ③ 한 장이 몇 KB 인가. 110장을 저장소에 담을지, 주소만 걸지 가르는 숫자다.
//
// 🚨 **확인 못 한 것은 안 쓴다.** 이 판은 보기만 한다 — 한 장도 내려받지 않는다.
//
// ⚠️ 작업 세션(샌드박스)은 seoul.go.kr 이 막혀 있다.
//    .github/workflows/check-seoul-photos.yml 로 Actions 에서 돌린다.

const UA =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36";
const PAGE = "https://www.seoul.go.kr/storyw/autumn/list.do";
const IMG = (n) =>
  `https://www.seoul.go.kr/res_newseoul_story/autumn/roadimg/${String(n).padStart(3, "0")}.jpg`;

// ── ① 이용 조건 ─────────────────────────────────────────────────────────
console.log("═".repeat(66));
console.log("① 이용 조건 — 페이지에 공공누리 표시가 있나");
console.log("═".repeat(66));

const res = await fetch(PAGE, {
  headers: { "User-Agent": UA, "Accept-Language": "ko-KR,ko;q=0.9" },
  signal: AbortSignal.timeout(30000),
});
if (!res.ok || /errorAccess/.test(res.url)) {
  console.error(`❌ 페이지를 못 받았다 — HTTP ${res.status} · 최종 ${res.url}`);
  process.exit(1);
}
const html = await res.text();

// 공공누리는 보통 배너 이미지(kogl) + "제N유형" 글자로 함께 나온다. 둘 다 찾는다.
const marks = {
  "공공누리(글자)": /공공누리/g,
  "kogl(주소)": /kogl/gi,
  "제1유형": /제\s*1\s*유형/g,
  "제2유형": /제\s*2\s*유형/g,
  "제3유형": /제\s*3\s*유형/g,
  "제4유형": /제\s*4\s*유형/g,
  "출처표시": /출처\s*표시/g,
  "저작권": /저작권/g,
};
for (const [k, re] of Object.entries(marks)) {
  console.log(`   ${k.padEnd(14)} ${(html.match(re) ?? []).length}`);
}

// 표시가 있으면 그 앞뒤 글을 그대로 보여 준다 — 등급은 눈으로 읽어야 한다.
for (const word of ["공공누리", "kogl", "저작권"]) {
  const at = html.search(new RegExp(word, "i"));
  if (at < 0) continue;
  const around = html
    .slice(Math.max(0, at - 400), at + 400)
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  console.log(`\n   ── "${word}" 앞뒤 ${"─".repeat(38)}`);
  console.log("   " + around);
}

// ── ② ③ 사진 실물 ───────────────────────────────────────────────────────
console.log("\n" + "═".repeat(66));
console.log("② 사진이 번호대로 있나  ③ 한 장이 몇 KB 인가");
console.log("═".repeat(66));

// 처음·중간·끝을 찍어 본다. 110장을 다 두드릴 필요가 없다.
let total = 0;
let ok = 0;
for (const n of [1, 2, 55, 109, 110, 111]) {
  try {
    const r = await fetch(IMG(n), {
      headers: { "User-Agent": UA, Referer: PAGE },
      signal: AbortSignal.timeout(20000),
    });
    const type = r.headers.get("content-type") ?? "?";
    const len = Number(r.headers.get("content-length") ?? 0);
    const good = r.ok && /image/.test(type);
    if (good) {
      ok++;
      total += len;
    }
    console.log(
      `   ${String(n).padStart(3)}.jpg  HTTP ${r.status}  ${type}  ${len ? (len / 1024).toFixed(0) + "KB" : "크기 모름"}` +
        (n === 111 ? "   ← 없어야 정상(110장이니까)" : "")
    );
  } catch (e) {
    console.log(`   ${String(n).padStart(3)}.jpg  ⬜ 못 물어봤다 — ${e.name}`);
  }
  await new Promise((x) => setTimeout(x, 300));
}

if (ok) {
  const avg = total / ok / 1024;
  console.log(`\n   평균 약 ${avg.toFixed(0)}KB → 110장이면 약 ${((avg * 110) / 1024).toFixed(1)}MB`);
  console.log(`   (저장소에 담을지 주소만 걸지는 이 숫자로 정한다)`);
}

console.log(`
👀 **보기만 했다 — 한 장도 내려받지 않았다.**
   ⚠️ 위 ①에서 공공누리 등급이 눈으로 확인되기 전에는 쓰지 않는다.`);
