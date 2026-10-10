#!/usr/bin/env node
// 🗄️ **아티팩트가 얼마나 쌓였나**를 재고, 넘치면 빨간불을 켠다.
//
// 사장님: **"돈이 필요 이상 새는 거 감시해야 하는데"** (2026-10-11).
//
// ── 🚨 왜 — 두 번째로 넘쳤다 ────────────────────────────────────────────
//   깃허브 계정 전체 **무료 보관은 0.5GB(512MB)** 뿐이다. 넘으면 날마다 돈이 붙는다.
//   · 2026-10-03 — 100% 를 찍어서 쌓인 것을 지우고 **보관일**을 걸었다.
//   · 2026-10-11 — **또 662MB.** 그중 **498MB 가 배포 꾸러미(github-pages)** 였다.
//     한 번에 17MB 인데 배포할 때마다 새로 생기고 7일을 머문다 — 29개가 쌓였다.
//   👉 보관일을 걸어 둔 것만으로는 모자랐다. **배포가 잦으면 보관일이 짧아야 한다.**
//
// ── 🧯 그리고 **아무도 안 보고 있었다** ─────────────────────────────────
//   요금 장부(actions-spend)는 **돌아간 분(minutes)** 만 센다. 보관은 안 센다.
//   그래서 10/03 에 지우고도 **또 넘칠 때까지 몰랐다.** 이 저장소가 거듭 데인 자리다 —
//   「검사를 만들었으면 저절로 돌게 걸고, 울려 봐야 한다」.
//
//   GH_TOKEN=... node scripts/watch-artifacts.mjs --repo owner/name[,owner/name2]
//   --limit 512   넘으면 빨간불 (MB, 기본 512)
//   --warn 400    여기부터 노란불 (MB, 기본 400)

const arg = (n, d) => {
  const i = process.argv.indexOf(`--${n}`);
  return i >= 0 ? process.argv[i + 1] : d;
};
const REPOS = String(arg("repo", "")).split(",").map((s) => s.trim()).filter(Boolean);
const LIMIT = Number(arg("limit", 512));
const WARN = Number(arg("warn", 400));
const TOKEN = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
if (!REPOS.length || !TOKEN) {
  console.error("쓰는 법: GH_TOKEN=... node scripts/watch-artifacts.mjs --repo owner/name");
  process.exit(1);
}

const MB = (n) => n / 1048576;
let 총합 = 0;
const 묶음 = {};

for (const repo of REPOS) {
  let page = 1;
  let repoSum = 0;
  for (;;) {
    const r = await fetch(
      `https://api.github.com/repos/${repo}/actions/artifacts?per_page=100&page=${page}`,
      { headers: { Authorization: `Bearer ${TOKEN}`, Accept: "application/vnd.github+json" } },
    );
    if (!r.ok) {
      console.error(`❌ ${repo} — HTTP ${r.status}`);
      process.exit(1);
    }
    const j = await r.json();
    const list = j.artifacts ?? [];
    for (const a of list) {
      if (a.expired) continue; // 만료된 것은 자리를 안 먹는다
      repoSum += a.size_in_bytes;
      묶음[`${repo} · ${a.name}`] = (묶음[`${repo} · ${a.name}`] ?? 0) + a.size_in_bytes;
    }
    if (list.length < 100) break;
    page++;
    if (page > 20) break; // 안전장치
  }
  총합 += repoSum;
  console.log(`📦 ${repo} — ${MB(repoSum).toFixed(0)}MB`);
}

console.log(`\n🗄️ 합계 ${MB(총합).toFixed(0)}MB / 무료 ${LIMIT}MB`);
console.log("\n무엇이 먹나 (상위 6):");
for (const [k, v] of Object.entries(묶음).sort((a, b) => b[1] - a[1]).slice(0, 6))
  console.log(`   ${MB(v).toFixed(0).padStart(5)}MB  ${k}`);

if (MB(총합) > LIMIT) {
  console.log(
    `\n🚨 **무료 한도를 넘었다** — 넘은 만큼 날마다 돈이 붙는다.\n` +
      `   줄이는 길 둘: ① 큰 꾸러미의 보관일을 줄인다 ② 다 쓴 옛 꾸러미를 지운다`,
  );
  process.exit(1);
}
if (MB(총합) > WARN) {
  console.log(`\n⚠️ ${WARN}MB 를 넘었다 — 한도(${LIMIT}MB)가 가깝다. 지금 줄여 두는 게 싸다.`);
  process.exit(0);
}
console.log("\n✅ 넉넉하다.");
