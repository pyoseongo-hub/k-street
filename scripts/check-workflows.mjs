#!/usr/bin/env node
// 🧾 **워크플로 파일이 깨졌나 본다.**
//
// 왜 (2026-09-16에 실제로 깨뜨렸다) —
//   `run: |` 블록 안에서 `git commit -m "여러
//   줄짜리 메시지"` 를 썼더니, 이어지는 줄이 **1열에서 시작**해 그 자리에서
//   블록이 끝나 버렸다. 그러면 파일 전체가 안 읽히고, GitHub 은
//   **"이 워크플로에는 workflow_dispatch 트리거가 없다"** 고만 말한다 —
//   진짜 원인(들여쓰기)과는 아무 상관 없어 보이는 말이라 한참 헤맨다.
//   푸시는 성공하고 아무 데도 안 빨개진다. 다음에 돌리려 할 때 알게 된다.
//
// 🚨 **YAML 파서를 새로 받지 않는다.** 이 저장소에는 yaml 꾸러미가 없고,
//    이거 하나 보자고 꾸러미를 늘리지 않는다. 우리가 실제로 당한 사고는
//    **들여쓰기 하나**였으므로 그걸 곧바로 잡는다:
//      · 블록 스칼라(`|`) 안인데 들여쓰기가 없는 줄
//      · 최상위에 `on:` 이 없는 파일
//      · 탭 문자 (YAML 은 탭을 들여쓰기로 못 쓴다)
//
// 돌리기: node scripts/check-workflows.mjs
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const DIR = ".github/workflows";
const bad = [];

for (const name of readdirSync(DIR).filter((f) => /\.ya?ml$/.test(f))) {
  const path = join(DIR, name);
  const lines = readFileSync(path, "utf8").split("\n");
  const say = (n, why) => bad.push(`${path}:${n}  ${why}`);

  if (!lines.some((l) => /^on:\s*$/.test(l) || /^on:\s+\S/.test(l)))
    say(1, "최상위에 `on:` 이 없다 — GitHub 이 이 파일을 실행할 수 없다");

  let blockIndent = null; // 블록 스칼라가 열려 있으면 그 안쪽 들여쓰기 칸수
  lines.forEach((line, i) => {
    const n = i + 1;
    if (/^\s*\t/.test(line)) say(n, "탭으로 들여썼다 — YAML 은 탭을 못 쓴다");

    if (blockIndent !== null) {
      if (line.trim() === "") return;              // 빈 줄은 블록을 안 닫는다
      const indent = line.match(/^ */)[0].length;
      if (indent >= blockIndent) return;           // 아직 블록 안이다
      blockIndent = null;                          // 블록이 여기서 끝났다
      if (indent === 0)
        say(n, "`|` 블록 안이어야 할 줄이 1열에서 시작한다 — 여기서 블록이 끊긴다"
              + ` (여러 줄 -m 메시지를 쓰지 말 것: ${line.trim().slice(0, 40)})`);
    }
    // `something: |` 또는 `- run: |-` 처럼 블록 스칼라가 열리는 줄
    const open = line.match(/^(\s*)(?:- )?[\w.\-]+:\s*[|>][-+]?\s*$/);
    if (open) blockIndent = open[1].length + 1;
  });
}

if (bad.length) {
  console.error(`❌ 워크플로에 문제 ${bad.length}가지\n`);
  for (const b of bad) console.error("   " + b);
  console.error("\n   푸시는 되지만 **다음에 돌릴 때 실패한다.** 지금 고칠 것.");
  process.exit(1);
}
console.log(`✅ 워크플로 ${readdirSync(DIR).filter((f) => /\.ya?ml$/.test(f)).length}개 — 이상 없음`);
