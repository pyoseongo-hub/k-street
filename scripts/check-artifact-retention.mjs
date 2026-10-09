// 💾 **아티팩트에 보관일이 빠지지 않았나 본다.**
//
// 사장님이 2026-10-07에 요금 메일을 받고 찾은 것 —
//   「Discover local」의 upload-artifact 에 retention-days 가 없었다.
//   기본값은 **90일**이다. 그 사이 **331개 · 4.7GB** 가 쌓였고,
//   포함량 0.5GB 를 아홉 배 넘겨 깃허브가 「저장공간 100%」 메일을 보냈다.
//
// 🚨 **이건 조용히 쌓인다.** 작업은 매번 초록불로 끝나고, 화면도 안 바뀌고,
//    아무 데도 안 적힌다. 메일이 올 때쯤이면 이미 몇 기가다.
//    그래서 **푸시마다 본다** — 사람이 기억해서 보는 검사는 결국 안 보게 된다.
//
//   node scripts/check-artifact-retention.mjs
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const DIR = join(dirname(fileURLToPath(import.meta.url)), "..", ".github", "workflows");

const 탈 = [];
let 본것 = 0;

/**
 * 🧩 **단계(step) 단위로 자른다.**
 *
 * 🐞 처음엔 들여쓰기 깊이로 묶음을 찾았는데 **멀쩡한 네 군데가 걸렸다**(거짓 경보).
 *    `- uses:` 의 `- ` 때문에 깊이 셈이 어긋나서다. 거짓 경보가 한 번 울리면
 *    다음부터 그 경보를 안 믿게 된다 — 그게 제일 비싸다.
 *    그래서 **깊이를 세지 않고** 「새 단계가 시작되는 줄」로만 자른다.
 *    단계는 `- name:` 또는 `- uses:` 로 시작한다.
 */
const 새단계 = (l) => /^\s*-\s+(name|uses):/.test(l);

for (const f of readdirSync(DIR).filter((n) => n.endsWith(".yml") || n.endsWith(".yaml"))) {
  const 줄 = readFileSync(join(DIR, f), "utf-8").split("\n");
  const 자리 = [];
  for (let i = 0; i < 줄.length; i++) if (새단계(줄[i])) 자리.push(i);
  자리.push(줄.length);
  for (let k = 0; k < 자리.length - 1; k++) {
    const 묶음 = 줄.slice(자리[k], 자리[k + 1]);
    if (!묶음.some((l) => /uses:\s*actions\/upload-artifact/.test(l))) continue;
    본것++;
    if (!묶음.some((l) => /^\s*retention-days:\s*\d+/.test(l)))
      탈.push(`❌ ${f}:${자리[k] + 1} — upload-artifact 에 retention-days 가 없다 (기본 90일)`);
  }
}

console.log(`💾 아티팩트를 올리는 자리 ${본것}군데`);
if (탈.length) {
  console.log(`\n${탈.join("\n")}`);
  console.log(
    "\n   보관일을 적어 주세요. 저장소에도 커밋되는 자료면 3일이면 넉넉합니다.\n" +
      "   포함량은 한 달 0.5GB 이고, 넘으면 하루 단위로 돈이 붙습니다.",
  );
  process.exit(1);
}
console.log("✅ 전부 보관일이 적혀 있다");
