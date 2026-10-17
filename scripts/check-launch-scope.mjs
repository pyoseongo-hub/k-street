#!/usr/bin/env node
// 🇰🇷 **코드의 출시 범위와 CLAUDE.md 의 설명이 어긋나면 막는다.**
//
// 왜 만들었나 (2026-10-17) — 코드는 10-05에 이미 전국 17개 시·도를 열었는데
// CLAUDE.md 는 **8-24의 「서울만」에 12일 넘게 멈춰 있었다.** 그래서 내가 등산
// 적용안을 보고하면서 *"K-Street는 서울 한정이 지시입니다"* 라고 **거꾸로 말했다.**
// 사장님이 이미 열어 둔 것을 닫아야 할 것처럼 적은 것이다.
//
// 🧭 문서는 조용히 틀린다. 코드는 돌려 보면 드러나지만 문서는 아무도 안 돌린다 —
//    그래서 **문서를 돌릴 수 있게** 만든다.
//
//   node scripts/check-launch-scope.mjs
//
// ❌ 로 끝나면 둘 중 하나가 낡은 것이다. **둘을 같이 고친다.**

import { readFileSync } from "node:fs";

// 행정구역 17개 시·도. 이 저장소가 쓰는 **짧은 이름** 표기다
// (게이트도 districts 도 "경상북도" 가 아니라 "경북" 을 쓴다).
const 전국 = ["서울", "부산", "대구", "인천", "광주", "대전", "울산", "세종",
  "경기", "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주"];

const 게이트글 = readFileSync("src/config/launchScope.ts", "utf8");
const 뭉치 = 게이트글.match(/LAUNCH_REGIONS[^=]*=\s*\[(.*?)\]/s);
if (!뭉치) {
  console.error("❌ launchScope.ts 에서 LAUNCH_REGIONS 를 못 찾았다 — 이름이 바뀌었나?");
  process.exit(1);
}
const 열린것 = [...뭉치[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]);

const 빠진것 = 전국.filter((x) => !열린것.includes(x));
const 모르는이름 = 열린것.filter((x) => !전국.includes(x));
const 전국인가 = 빠진것.length === 0;

const 문서 = readFileSync("CLAUDE.md", "utf8");
const 제목 = 문서.match(/^##\s*출시 범위.*$/m)?.[0] ?? "";
// 제목이 「전국」이라고 말하나, 「서울만」이라고 말하나
const 문서가전국 = /전국/.test(제목);
const 문서가서울만 = /서울만|서울 한정/.test(제목);

console.log("🇰🇷 출시 범위 검사\n");
console.log(`  코드(launchScope.ts) : ${열린것.length}개 열림 — ${전국인가 ? "전국" : "일부"}`);
if (빠진것.length) console.log(`     빠진 시·도: ${빠진것.join(" · ")}`);
if (모르는이름.length) console.log(`     ⚠️ 17개 명부에 없는 이름: ${모르는이름.join(" · ")}`);
console.log(`  문서(CLAUDE.md)      : ${제목 || "(출시 범위 제목을 못 찾았다)"}`);
console.log();

const 탈 = [];
if (모르는이름.length)
  탈.push(`게이트에 17개 명부에 없는 이름이 있다: ${모르는이름.join(" · ")}`);
if (전국인가 && !문서가전국)
  탈.push("코드는 전국인데 문서 제목이 전국이라고 말하지 않는다 — 문서가 낡았다");
if (!전국인가 && 문서가전국)
  탈.push(`문서는 전국이라는데 코드에 ${빠진것.length}개가 빠져 있다 — 코드가 낡았다`);
if (전국인가 && 문서가서울만)
  탈.push("코드는 전국인데 문서가 「서울만」이라고 말한다 — 2026-10-17에 이걸로 거꾸로 보고했다");

if (탈.length) {
  console.error("❌ 코드와 문서가 어긋난다. **둘을 같이 고친다.**");
  for (const t of 탈) console.error(`   · ${t}`);
  console.error("\n   범위를 바꿀 때는 launchScope.ts 와 CLAUDE.md 의 「출시 범위」 문단을 한 번에 고친다.");
  process.exit(1);
}
console.log("✅ 코드와 문서가 같은 말을 한다.");
