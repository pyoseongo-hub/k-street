#!/usr/bin/env node
// 💸 **「무료」라고 말하는 문구가 다시 기어들지 않게 막는다.**
//
// 사장님 지시 (2026-10-17): *"5번은 가입없음 만해"* —
// 화면 문구에서 **「평생 무료」를 떼고 「가입 없음」만** 남긴다.
//
// 🧭 왜 막아야 하나 — 앱이 무료라는 말이 **행사·장소도 다 무료**라는 뜻으로 읽힌다.
//    실제로는 입장료가 있는 곳이 섞여 있다(seed.ts 의 note 에 곳마다 「무료」가
//    따로 적혀 있는 이유가 그것이다). 점검서가 짚은 자리다.
//
// 🚨 **정책이 바뀐 게 아니다.** 앱은 여전히 평생 무료·가입 없음·결제 없음이다
//    (2026-09-04 사장님 결정). **화면에서 말하지 않기로 한 것**이다.
//
// ⚠️ 왜 사람 기억에 맡기면 안 되나 — 2026-10-17에 지운 자리가 **33곳**이었다
//    (앱 12 · 곳 페이지 푸터 12 · 색인 8 · 비 오는 날 12 중 겹침 제외).
//    언어를 하나 더 넣거나 문장을 새로 쓸 때 **한 언어만 빠뜨리면 그 언어에서만 살아난다** —
//    12개 언어를 다 열어 보는 사람은 없다.
//
//   node scripts/check-free-claim.mjs
//
// 🔓 **일부러 남겨 둔 것** — 역 사물함의 "how many are free right now" 는
//    「빈 칸이 몇 개냐」는 뜻이다. 값이 공짜라는 말이 아니라 **뜻이 다르다.**

import { readFileSync } from "node:fs";

const 볼파일 = ["src/lib/translations.ts", "scripts/lib/page-strings.ts"];

// 12개 언어의 「무료」. 낱말 하나만 보면 안 된다 — 언어마다 다른 말을 쓴다.
const 무료말 = /\bfree\b|무료|無料|免费|免費|\bgratis\b|\bgratuit\w*\b|\bkostenlos\w*\b|бесплатн\w*|[Mm]iễn phí|ฟรี/i;

// 🔓 뜻이 다른 자리. **줄 전체를 그대로 적어** 두어, 글이 바뀌면 검사가 다시 묻게 한다.
const 봐주는것 = [
  "The app's map shows how many are free right now",
];

const 걸린것 = [];
for (const f of 볼파일) {
  const 줄들 = readFileSync(f, "utf8").split("\n");
  줄들.forEach((줄, i) => {
    const 깎은것 = 줄.trim();
    // 주석은 설명이라 센다고 의미가 없다 — 이 파일 머리말에도 「무료」가 들어 있다.
    if (깎은것.startsWith("//") ||깎은것.startsWith("*") || 깎은것.startsWith("/*")) return;
    if (!무료말.test(줄)) return;
    if (봐주는것.some((x) => 줄.includes(x))) return;
    걸린것.push({ f, 줄번호: i + 1, 글: 깎은것.slice(0, 120) });
  });
}

console.log("💸 「무료」 문구 검사\n");
if (!걸린것.length) {
  console.log("✅ 화면 문구에 무료 주장이 없다. (역 사물함의 free 는 「빈 칸 수」라 봐준다)");
  process.exit(0);
}
console.error(`❌ 무료라고 말하는 문구가 ${걸린것.length}곳 있다. 사장님 지시는 「가입 없음」만이다.\n`);
for (const x of 걸린것) console.error(`   ${x.f}:${x.줄번호}\n      ${x.글}`);
console.error(`
   고치는 법 — 「무료」 조각만 떼고 「가입 없음」은 남긴다.
   뜻이 다른 free(빈 사물함 수 같은 것)라면 이 검사의 '봐주는것' 에 줄을 그대로 적는다.`);
process.exit(1);
