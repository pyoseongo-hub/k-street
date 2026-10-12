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
/** ⏳ 살아 있는 꾸러미가 **언제 저절로 빠지는지**. 보관일이 걸려 있어 날짜가 정해져 있다. */
const 만료표 = [];

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
      // ⏳ **언제 저절로 빠지는지 같이 적어 둔다.** 아래에서 「쌓이는 속도」에서 뺀다.
      const 만료 = Date.parse(a.expires_at ?? "");
      if (Number.isFinite(만료)) 만료표.push({ 때: 만료, 크기: a.size_in_bytes });
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

// ⏳ **빠지는 쪽도 센다** (2026-10-12 에 고쳤다).
//
// 🐞 **하루에 몰린 것과 계속 느는 것을 못 갈랐다.** 10/11 에 K-Street 로 열아홉 번
//    푸시했더니 배포 꾸러미가 하루에 19개(337MB) 쌓였다. 이틀치로 속도를 재니
//    「하루 +205MB → 이레 안에 터짐」이 되어 **빨간불이 떴는데, 실제로는 그 19개가
//    모두 24시간 안에 만료**돼 다음 날이면 55MB로 돌아갈 참이었다.
//    꺼야 할 경보를 켠 것이다 — 그런 경보는 몇 번 겪으면 **안 보게 된다.**
//
// 👉 고친 방법은 짐작이 아니다. 꾸러미마다 **만료 시각이 이미 적혀 있다**(expires_at).
//    쌓이는 속도에서 **24시간 안에 빠질 양**을 빼고 **순증**으로 본다.
//    · 순증이 0 이하면 줄고 있는 것이다 — 경보하지 않는다.
//    · 배포가 계속 잦아도 빠지는 양이 같이 커지므로 제자리걸음으로 잡힌다. 맞는 판단이다.
//    · 보관일이 긴 꾸러미가 진짜로 쌓이면 빠지는 양이 적어 순증이 남는다 — 그때는 운다.
const 지금 = Date.now();
const 빠질24 = MB(만료표.filter((x) => x.때 - 지금 <= 86400000).reduce((a, b) => a + b.크기, 0));
const 내일남음 = MB(총합) - 빠질24;
if (빠질24 >= 1) {
  console.log(`⏳ 24시간 안에 저절로 빠질 것 ${빠질24.toFixed(0)}MB → 내일 이맘때 약 ${내일남음.toFixed(0)}MB`);
}

const 날들 = Object.keys(장부.날).sort();
let 남은날 = null;
if (날들.length >= 2) {
  const 처음 = 날들[Math.max(0, 날들.length - 7)];
  const 일수 = Math.max(1, (Date.parse(오늘) - Date.parse(처음)) / 86400000);
  const 하루증가 = (장부.날[오늘] - 장부.날[처음]) / 일수;
  const 순증 = 하루증가 - 빠질24;
  console.log(`📈 최근 ${일수.toFixed(0)}일 동안 하루 ${하루증가 >= 0 ? "+" : ""}${하루증가.toFixed(0)}MB` +
    ` · 빠지는 것까지 셈하면 하루 ${순증 >= 0 ? "+" : ""}${순증.toFixed(0)}MB`);
  if (순증 > 0) {
    남은날 = (LIMIT - MB(총합)) / 순증;
    console.log(`   이 속도면 한도까지 **${남은날 < 0 ? 0 : 남은날.toFixed(0)}일**`);
  } else {
    console.log(`   쌓이는 것보다 빠지는 것이 많다 — 줄고 있다. 경보하지 않는다.`);
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
  // 🧯 **「저절로 빠질 양」을 같이 말한다.** 안 그러면 놀라서 손으로 지우게 되는데,
  //    오늘 안에 빠질 것을 지우는 것은 헛일이다.
  const 덧 = 내일남음 <= WARN
    ? ` 다만 ${빠질24.toFixed(0)}MB 가 24시간 안에 저절로 빠져 **내일이면 약 ${내일남음.toFixed(0)}MB** 다 — 손댈 것 없다.`
    : "";
  console.log(`\n⚠️ ${WARN}MB 를 넘었다 — 한도(${LIMIT}MB)가 가깝다.${덧 || " 지금 줄여 두는 게 싸다."}`);
  process.exit(0);
}
console.log("\n✅ 넉넉하다.");
