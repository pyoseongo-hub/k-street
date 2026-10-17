#!/usr/bin/env node
// 🔒 **AI 배너가 공유·검색으로 새어 나가지 않았나.**
//
// 사장님이 사진 없는 곳에 AI 그림을 쓰기로 하셨다(2026-10-17). 카드에는
// 「AI 제작 이미지」가 붙지만 **그 표시는 공유 카드로 안 따라간다** —
// og:image 는 그림만 나가고 1.91:1 로 잘린다. 카톡·페북·구글·ChatGPT 가
// 그걸 「그 곳 사진」으로 보여 준다.
//
// 🧭 지금은 build-place-pages.ts 가 배너를 아예 안 쓴다(photo 계산에 없다).
//    이 검사는 **나중에 누가 무심코 넣는 것**을 막는다. 사람 기억에 맡기면 안 되는 자리다.
//
//   npm run ai-banner        (곳 페이지를 만든 뒤에 돈다)

import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const 뿌리 = "dist";
if (!existsSync(뿌리)) {
  console.error(`❌ ${뿌리} 가 없다 — npm run build && npm run place-pages 를 먼저 돌린다`);
  process.exit(1);
}
// 머리(<head>)에 배너가 있으면 공유·검색으로 나간다
const 머리에배너 = /<meta[^>]+(og:image|twitter:image)[^>]*\/images\/banner\//i;
const 걸린것 = [];
let 본쪽 = 0;
const 훑기 = (디렉) => {
  for (const e of readdirSync(디렉, { withFileTypes: true })) {
    const 길 = join(디렉, e.name);
    if (e.isDirectory()) { 훑기(길); continue; }
    if (!e.name.endsWith(".html")) continue;
    본쪽++;
    const 글 = readFileSync(길, "utf8");
    if (머리에배너.test(글)) 걸린것.push(길);
  }
};
훑기(뿌리);

console.log(`🔒 AI 배너 새어 나감 검사 — ${본쪽.toLocaleString()}쪽을 봤다\n`);
if (!걸린것.length) {
  console.log("✅ og:image·twitter:image 에 AI 배너가 없다.");
  process.exit(0);
}
console.error(`❌ AI 배너가 공유 이미지로 나가고 있다 — ${걸린것.length}쪽\n`);
for (const f of 걸린것.slice(0, 10)) console.error(`   ${f}`);
console.error(`
   고치는 법 — build-place-pages.ts 의 photo 계산에서 배너를 빼라.
   배너가 없는 곳은 share-card.png 로 떨어지는 것이 맞다. 까닭은 그 줄의 주석에 있다.`);
process.exit(1);
