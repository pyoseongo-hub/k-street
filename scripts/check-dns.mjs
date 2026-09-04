// 📡 도메인이 **GitHub 쪽을 제대로 가리키는지** 본다.
//
// 왜 필요한가 (2026-09-04 도메인 연결) — 가비아에서 DNS를 저장해도 그게 인터넷
// 전체에 퍼지는 데 10분~1시간이 걸린다. 그전에 GitHub에 도메인을 적으면
// **지금 잘 되는 사이트가 통째로 안 열린다**(github.io 주소가 아직 아무 데도
// 안 닿는 도메인으로 넘겨진다).
//
// 그래서 "이제 GitHub 설정을 해도 되는 때"를 사람이 감으로 찍지 않고 여기서 본다.
//
// 작업 세션(에이전트 샌드박스)은 DNS 조회가 막혀 있다 — 러너에서 돌린다.
//
// 실행:  DOMAIN=korea-street.com node scripts/check-dns.mjs

import { promises as dns } from "node:dns";

const DOMAIN = (process.env.DOMAIN || "korea-street.com").trim();

/** GitHub Pages 가 쓰는 주소. 이 넷 중 하나라도 다르면 안 된다. */
const GITHUB_IPS = [
  "185.199.108.153",
  "185.199.109.153",
  "185.199.110.153",
  "185.199.111.153",
];

console.log(`📡 ${DOMAIN} 이 어디를 가리키는지 본다.\n`);

let ok = true;

// ── ① A 레코드 ──────────────────────────────────────────────────────────
try {
  const got = (await dns.resolve4(DOMAIN)).sort();
  const want = [...GITHUB_IPS].sort();
  console.log("A 레코드(우리가 넣은 IP):");
  for (const ip of got) {
    const good = GITHUB_IPS.includes(ip);
    console.log(`   ${good ? "✅" : "❌"} ${ip}${good ? "" : "  ← GitHub 주소가 아니다"}`);
    if (!good) ok = false;
  }
  const missing = want.filter((w) => !got.includes(w));
  if (missing.length) {
    console.log(`   ⚠️ 아직 안 보이는 것: ${missing.join(", ")}`);
    console.log("      (넷 다 있어야 가장 튼튼하지만, 하나만 있어도 사이트는 열린다)");
  }
  if (!got.length) ok = false;
} catch (e) {
  ok = false;
  const why = e.code === "ENOTFOUND" || e.code === "ENODATA" ? "아직 안 퍼졌다" : e.code;
  console.log(`❌ A 레코드를 못 찾았다 (${why})`);
  console.log("   가비아에서 저장은 했는데 아직 퍼지는 중일 수 있다 — 10분쯤 뒤에 다시 본다.");
}

// ── ② www 는 있어도 되고 없어도 된다 ────────────────────────────────────
try {
  const cname = await dns.resolveCname(`www.${DOMAIN}`);
  console.log(`\nwww: ✅ ${cname.join(", ")}`);
} catch {
  console.log(`\nwww: ⬜ 없음 (안 넣어도 된다 — www 없이 쓰면 그만이다)`);
}

// ── ③ 지금 그 주소로 열어 보면 무엇이 나오나 ────────────────────────────
for (const url of [`http://${DOMAIN}`, `https://${DOMAIN}`]) {
  try {
    const res = await fetch(url, { redirect: "manual", signal: AbortSignal.timeout(15000) });
    const loc = res.headers.get("location");
    console.log(`\n${url}\n   → HTTP ${res.status}${loc ? `  (${loc} 로 넘김)` : ""}`);
    if (res.status === 404) {
      console.log("   ⓘ 404 는 **정상일 수 있다** — DNS는 닿았는데 GitHub에 아직");
      console.log("     이 도메인을 등록 안 한 상태다(3단계). 그때 이 화면이 바뀐다.");
    }
  } catch (e) {
    console.log(`\n${url}\n   → 못 열었다 (${e?.cause?.code ?? e.name})`);
  }
}

console.log(
  `\n${"─".repeat(60)}\n${
    ok
      ? "✅ DNS가 GitHub 쪽을 가리킨다 — 이제 GitHub 설정(3단계)을 해도 된다."
      : "⏳ 아직이다. 10~30분 뒤에 다시 돌려 볼 것."
  }`
);
