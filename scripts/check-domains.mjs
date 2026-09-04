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
// ── 왜 whois 인가 ────────────────────────────────────────────────────────
// 처음에는 RDAP(등록기관의 요즘 창구)를 썼는데 **러너에서 하나도 안 열렸다**
// (rdap.org 가 전부 실패 → 결과가 죄다 "확인 필요"로 나와 쓸모가 없었다).
//
// whois 는 그보다 오래된 방식이지만 **등록기관이 직접 답하고, .kr 까지 답한다.**
// RDAP를 안 여는 국가 도메인이 많아서 우리에게는 이쪽이 맞다.
//
// 🚨 whois 는 답하는 말투가 등록기관마다 다르다. 그래서 "없다"는 말을 여러 표현으로
//    찾고, **어느 표현에도 안 걸리면 '모름'으로 남긴다** — 못 알아본 것을 "비었다"고
//    말하지 않는다. 틀린 확신이 빈 칸보다 나쁘다(이 프로젝트 정확도 원칙 그대로).

import { execFile } from "node:child_process";
import { promisify } from "node:util";
const run = promisify(execFile);

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

/** "이 도메인은 없다"고 말하는 표현들. 등록기관마다 말투가 다르다. */
const FREE_RE =
  /(no match|not found|no data found|no entries found|no object found|nothing found|available for registration|status:\s*free|등록되지\s*않은|검색된 결과가 없습니다)/i;

/** "이 도메인은 있다"고 말하는 표현들. */
const TAKEN_RE =
  /(creation date|created on|created:|registered date|registration time|registrar:|registry domain id|등록일|name server)/i;

async function whois(name) {
  try {
    // whois 서버가 느린 곳이 있어 넉넉히 준다. 답이 길면 앞부분만 본다.
    const { stdout } = await run("whois", [name], {
      timeout: 25000,
      maxBuffer: 4 * 1024 * 1024,
    });
    return { text: stdout };
  } catch (e) {
    // whois 는 "없는 도메인"에 0이 아닌 종료코드를 주는 경우가 있다 —
    // 그때도 stdout 에 답이 들어 있으므로 그걸 본다.
    if (e.stdout) return { text: e.stdout };
    return { err: String(e.code ?? e.message).slice(0, 40) };
  }
}

console.log(`도메인 ${list.length}개를 whois 로 확인한다.\n`);

const free = [];
const taken = [];
const unknown = [];

for (const name of list) {
  const r = await whois(name);
  if (r.err) {
    unknown.push([name, r.err]);
    console.log(`⬜  ${name.padEnd(20)} 조회 실패 (${r.err})`);
    continue;
  }
  const head = r.text.slice(0, 4000);
  const saysFree = FREE_RE.test(head);
  const saysTaken = TAKEN_RE.test(head);

  if (saysFree && !saysTaken) {
    free.push(name);
    console.log(`✅  ${name.padEnd(20)} 비어 있다`);
  } else if (saysTaken) {
    // 언제 등록됐는지 같이 보여 준다 — 오래된 것일수록 놓아줄 일이 없다.
    const when = head.match(/(creation date|created on|created|등록일)\s*:?\s*([0-9]{4}[-./][0-9]{2}[-./][0-9]{2})/i);
    taken.push(name);
    console.log(`❌  ${name.padEnd(20)} 이미 등록됨${when ? ` (${when[2]}~)` : ""}`);
  } else {
    unknown.push([name, "답을 못 알아봄"]);
    console.log(`⬜  ${name.padEnd(20)} 모름 — whois 답이 낯선 형식이다`);
  }
  // 등록기관이 연달아 물으면 막는다. 천천히.
  await new Promise((s) => setTimeout(s, 700));
}

console.log("\n" + "─".repeat(60));
console.log(`✅ 비어 있다: ${free.length}개`);
for (const f of free) console.log(`   · ${f}`);
console.log(`\n❌ 이미 등록됨: ${taken.length}개 — ${taken.join(", ") || "없음"}`);
if (unknown.length) {
  console.log(`\n⬜ 못 알아본 것: ${unknown.length}개 (사람이 등록 사이트에서 볼 것)`);
  for (const [n, why] of unknown) console.log(`   · ${n} — ${why}`);
}
console.log(`
🚨 "비어 있다"가 나와도 **살 수 있다는 보장은 아니다.**
   프리미엄(비싸게 파는) 도메인, 예약어, 등록기관 정책에 걸리는 이름이 있다.
   마지막 확인은 언제나 **등록 사이트 장바구니**에서 한다.`);
