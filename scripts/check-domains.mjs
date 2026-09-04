// 🌐 도메인이 비어 있는지 **기계가 직접 확인**한다.
//
// 왜 이 파일이 생겼나 (2026-09-04) — 도메인을 정하다 한 번 헛걸음했다.
// "k-street.com 등록가능"이라고 전해 들어 그걸로 정하고 문서까지 적었는데,
// 가비아 화면을 실제로 보니 **「이미 등록된 도메인」**이었다.
//
// 작업 세션(에이전트 샌드박스)은 도메인 조회 서버가 전부 막혀 있어서
// (rdap·whois·dns.google·도메인 주소 자체까지 전부 차단) 확인할 방법이 없었다.
// **러너는 실제 인터넷이 된다.** 그러니 여기서 본다.
//
// 두 가지를 같이 본다 — 하나만 보면 틀린다:
//
//   ① RDAP  — 등록기관이 직접 답하는 공식 창구. **가장 확실하다.**
//             404 = 등록 안 됨 / 200 = 등록됨.
//             다만 .kr 처럼 RDAP를 안 여는 곳이 있다.
//   ② NS    — 그 도메인의 이름서버가 있나. 있으면 누가 쓰고 있다는 뜻이다.
//             RDAP를 못 쓰는 TLD의 대타. 다만 **사 두고 안 쓰는 도메인은
//             NS가 없을 수 있어서**, NS만으로 "비었다"고 단정하면 안 된다.
//
// 🚨 여기서 "비어 있는 것 같다"가 나와도 **살 수 있다는 보장은 아니다.**
//    프리미엄(비싸게 파는) 도메인, 예약어, 등록기관 정책에 걸리는 이름이 있다.
//    마지막 확인은 언제나 **등록 사이트 장바구니에서** 한다.

import { promises as dns } from "node:dns";

const DEFAULT = [
  "k-street.com",
  "k-street.net",
  "k-street.app",
  "k-street.io",
  "k-street.kr",
  "k-street.co.kr",
  "kstreet.kr",
  "kstreet.co.kr",
  "kstreet.app",
  "kstreetseoul.com",
  "kstreetseoul.kr",
  "seoulkstreet.com",
  "visitkstreet.com",
  "kstreet.travel",
];

const list = (process.env.DOMAINS || "").trim()
  ? process.env.DOMAINS.split(/[\s,]+/).filter(Boolean)
  : DEFAULT;

/** 등록기관 공식 창구. rdap.org가 알맞은 등록기관으로 넘겨 준다. */
async function rdap(name) {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 15000);
  try {
    const res = await fetch(`https://rdap.org/domain/${name}`, {
      redirect: "follow",
      signal: ctl.signal,
      headers: { Accept: "application/rdap+json" },
    });
    if (res.status === 404) return { known: true, registered: false };
    if (res.ok) {
      const j = await res.json().catch(() => null);
      // 등록 날짜가 같이 오면 그대로 적어 준다 — 오래된 도메인일수록 놓아줄 일이 없다.
      const ev = j?.events?.find((e) => e.eventAction === "registration");
      return { known: true, registered: true, since: ev?.eventDate?.slice(0, 10) };
    }
    // 501·400 등 = 이 TLD는 RDAP를 안 연다(.kr 등)
    return { known: false, why: `RDAP ${res.status}` };
  } catch (e) {
    return { known: false, why: String(e?.cause?.code ?? e?.name).slice(0, 24) };
  } finally {
    clearTimeout(timer);
  }
}

/** 이름서버가 있나. RDAP를 못 쓰는 TLD의 대타. */
async function hasNs(name) {
  try {
    const ns = await dns.resolveNs(name);
    return ns.length > 0;
  } catch (e) {
    if (e.code === "ENOTFOUND" || e.code === "NXDOMAIN") return false;
    return null; // 못 알아봄
  }
}

console.log(`도메인 ${list.length}개를 확인한다.\n`);
console.log("상태   도메인                     RDAP(공식)        이름서버");
console.log("─".repeat(74));

const free = [];
for (const name of list) {
  const [r, ns] = await Promise.all([rdap(name), hasNs(name)]);

  let mark, note;
  if (r.known) {
    if (r.registered) {
      mark = "❌";
      note = r.since ? `등록됨 (${r.since}~)` : "등록됨";
    } else {
      mark = "✅";
      note = "비어 있음";
      free.push(name);
    }
  } else if (ns === false) {
    mark = "🟡";
    note = `RDAP 없음 · 이름서버 없음`;
    free.push(name + " (확인 필요)");
  } else if (ns === true) {
    mark = "❌";
    note = "RDAP 없음 · 이름서버 있음 → 누가 쓰는 중";
  } else {
    mark = "⬜";
    note = `모름 (${r.why ?? "조회 실패"})`;
  }

  console.log(
    `${mark}    ${name.padEnd(24)} ${(r.known ? (r.registered ? "등록됨" : "없음") : "미지원").padEnd(16)} ${ns === null ? "?" : ns ? "있음" : "없음"}   ${note}`
  );
}

console.log("\n" + "─".repeat(74));
if (free.length) {
  console.log(`✅ 비어 있어 보이는 것 ${free.length}개:`);
  for (const f of free) console.log(`   · ${f}`);
} else {
  console.log("❌ 비어 있는 것이 없다.");
}
console.log(`
🚨 마지막 확인은 반드시 **등록 사이트 장바구니**에서 한다.
   여기서 "비어 있음"이 나와도 프리미엄(비싸게 파는) 도메인이거나
   등록기관 정책에 걸려 못 사는 경우가 있다.
   🟡 는 그 TLD가 공식 창구를 안 열어 이름서버로만 짐작한 것이라 특히 그렇다.`);
