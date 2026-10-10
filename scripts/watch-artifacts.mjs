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

// ── 📈 **잔량이 아니라 「며칠 뒤 터지나」를 본다** (2026-10-11) ──────────────
//
// 🚨 사장님: *"왜 자꾸 이런 일이 일어나는지 찾아서"* — 찾았다. 패턴이 하나다:
//    **문턱은 고정값으로 걸고, 늘어나는 속도는 아무도 안 쟀다.**
//      · 보관일 7일 — 하루 배포 10번 기준으로 괜찮았다. 오늘 **28번** 하니 깨졌다.
//      · Audit seed — 의정부 242곳에서 1초였다. 19만 곳에서 **74분**이 됐다.
//      · 대역폭 — 「정액 $5」로 적어 둬서 아무도 안 봤다. 9일에 **44.9GB** 였다.
//    셋 다 **「한 번에 얼마」 × 「하루 몇 번」** 이 변했는데 문턱만 고정이었다.
//
// → 그래서 날마다 적고, **지금 속도면 며칠 뒤 한도에 닿는지**로 경보한다.
//    "지금 70%" 는 안심하게 만들지만 "사흘 뒤 꽉 참" 은 움직이게 만든다.
const { readFileSync: RF, writeFileSync: WF, mkdirSync: MD } = await import("node:fs");
const { dirname: DN, join: JN } = await import("node:path");
const 장부길 = JN(process.cwd(), "data", "artifact-ledger.json");
let 장부 = { _읽어보세요: ["🗄️ 날마다 잰 보관 용량. 기계가 적는다 — 손으로 고치지 말 것.",
  "보는 것은 잔량이 아니라 **늘어나는 속도**다. 지금 속도면 며칠 뒤 한도에 닿는지를 센다."], 날: {} };
try { 장부 = JSON.parse(RF(장부길, "utf8")); 장부.날 ??= {}; } catch { /* 처음이면 새로 만든다 */ }
const 오늘 = new Date().toISOString().slice(0, 10);
장부.날[오늘] = Math.round(MB(총합));
// 60일치만 남긴다 — 더 오래된 것은 판단에 안 쓰이고 파일만 불린다.
for (const k of Object.keys(장부.날).sort().slice(0, -60)) delete 장부.날[k];
MD(DN(장부길), { recursive: true });
WF(장부길, JSON.stringify(장부, null, 2) + "\n");

const 날들 = Object.keys(장부.날).sort();
let 남은날 = null;
if (날들.length >= 2) {
  const 처음 = 날들[Math.max(0, 날들.length - 7)];
  const 일수 = Math.max(1, (Date.parse(오늘) - Date.parse(처음)) / 86400000);
  const 하루증가 = (장부.날[오늘] - 장부.날[처음]) / 일수;
  console.log(`📈 최근 ${일수.toFixed(0)}일 동안 하루 ${하루증가 >= 0 ? "+" : ""}${하루증가.toFixed(0)}MB`);
  if (하루증가 > 0) {
    남은날 = (LIMIT - MB(총합)) / 하루증가;
    console.log(`   이 속도면 한도까지 **${남은날 < 0 ? 0 : 남은날.toFixed(0)}일**`);
  }
} else {
  console.log("📈 (아직 하루치뿐이라 속도를 못 잰다 — 내일부터 센다)");
}
console.log("\n무엇이 먹나 (상위 6):");
for (const [k, v] of Object.entries(묶음).sort((a, b) => b[1] - a[1]).slice(0, 6))
  console.log(`   ${MB(v).toFixed(0).padStart(5)}MB  ${k}`);

// 🚦 **터지기 전에 운다.** 이레 안에 닿을 속도면 지금이 줄일 때다 —
//    꽉 찬 뒤에 우는 경보는 이미 돈이 나간 뒤다.
if (남은날 !== null && 남은날 >= 0 && 남은날 <= 7 && MB(총합) <= LIMIT) {
  console.log(`\n🚨 **이 속도면 ${남은날.toFixed(0)}일 뒤 한도에 닿는다.** 아직 안 넘었지만 지금 줄이는 게 싸다.`);
  process.exit(1);
}
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
