#!/usr/bin/env node
// 📐 **배너 그림이 규격에 맞나** — 1200x800 · 180KB 이하.
//
// 사장님 (2026-10-18): *"이미지 크기 조절해서 넣어 그전처럼 그냥 넣고 나중에 조절하지 말고"*
//
// 🧭 왜 검사로 막나 — 실제로 단풍길만 218KB 로 들어갔고 나는 「그대로 둔다」고 했다.
//    그게 「나중에 조절」이다. 사람이 기억으로 맞추면 장마다 달라진다.
//    넣을 때는 scripts/add-banner.py 를 쓰고, 이 검사가 그걸 지킨다.
//
//   npm run banner-size

import { readdirSync, statSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const 방 = "public/images/banner";
const 한도 = 180 * 1024;
if (!existsSync(방)) { console.log("🖼️ 배너 방이 아직 없다 — 넘어간다."); process.exit(0); }

// PNG·JPEG 머리에서 가로·세로를 읽는다 (라이브러리 없이).
function 크기(길) {
  const b = readFileSync(길);
  if (b[0] === 0xff && b[1] === 0xd8) { // JPEG
    let i = 2;
    while (i < b.length) {
      if (b[i] !== 0xff) { i++; continue; }
      const m = b[i + 1];
      if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc)
        return { h: b.readUInt16BE(i + 5), w: b.readUInt16BE(i + 7) };
      i += 2 + b.readUInt16BE(i + 2);
    }
  }
  return null;
}

const 탈 = [];
const 목록 = readdirSync(방).filter((f) => f.endsWith(".jpg"));
console.log(`📐 배너 ${목록.length}장\n`);
for (const f of 목록.sort()) {
  const 길 = join(방, f);
  const 바이트 = statSync(길).size;
  const 재기 = 크기(길);
  const 줄 = `   ${f.padEnd(24)} ${String(Math.round(바이트 / 1024)).padStart(4)}KB  ${재기 ? `${재기.w}x${재기.h}` : "?"}`;
  const 나쁨 = [];
  if (바이트 > 한도) 나쁨.push(`${Math.round(바이트 / 1024)}KB > ${한도 / 1024}KB`);
  if (!재기 || 재기.w !== 1200 || 재기.h !== 800) 나쁨.push("1200x800 이 아니다");
  if (나쁨.length) { 탈.push(`${f} — ${나쁨.join(" · ")}`); console.log(`${줄}  ❌`); }
  else console.log(줄);
}
if (!탈.length) { console.log("\n✅ 전부 1200x800 · 180KB 이하다."); process.exit(0); }
console.error(`\n❌ 규격에 안 맞는 그림 ${탈.length}장\n`);
for (const t of 탈) console.error(`   ${t}`);
console.error(`
   고치는 법 — 받은 원본으로 다시 넣는다:
     python3 scripts/add-banner.py <받은파일> <이름>
   품질만 낮추지 말 것. 그 도구가 잔무늬를 먼저 줄여 품질 70 을 지킨다.`);
process.exit(1);
