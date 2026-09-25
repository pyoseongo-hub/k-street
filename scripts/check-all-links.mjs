#!/usr/bin/env node
// 🔗 **자료에 들어 있는 바깥 링크를 전부 두드려 본다.**
//
// 사장님 지시 (2026-09-25): *"앱전체 오류 테스트 해봐 / 링크도 테스트 / 전기능 테스트해"*
//
// 왜 따로 만드나 — `check-guide-links.mjs` 는 **아직 자료에 안 넣은 후보**를 재 보는
// 자리다(그 머리말). 이쪽은 반대로 **이미 손님에게 보여 주고 있는 주소**를 훑는다.
// 축제 공식 홈페이지는 해마다 도메인이 바뀌거나 통째로 사라진다 — 넣을 때 살아 있었다고
// 지금 살아 있는 게 아니다. 죽은 링크를 누른 손님은 「이 앱은 링크도 안 되네」 하고 닫는다.
//
// 🚨 **이 검사는 러너에서만 뜻이 있다.** 저장소를 만드는 세션은 바깥 인터넷이 막혀 있어
//    77개가 전부 실패로 나온다(2026-09-25에 실제로 그랬다 — 연결 실패 71 · 프록시 403 6).
//    그걸 「죽은 링크 77개」로 읽으면 멀쩡한 주소를 지우게 된다.
//
// 🚨 **한 번 실패했다고 지우지 않는다.** 관공서 홈페이지는 로봇을 막거나(403)
//    잠깐 끊긴다. dead-links.json 머리말에 같은 말이 적혀 있다 — 같은 규칙을 쓴다.
//    여기서는 **보고만 한다. 아무것도 안 고친다.**
//
//   node scripts/check-all-links.mjs
import { readdirSync, statSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const DATA = "src/data";
/** 하나하나 두드릴 필요가 없는 것들 — 지도·사진·스토어는 우리가 만드는 주소다. */
const SKIP = /tong\.visitkorea|map\.kakao|map\.naver|korea-street\.com|schema\.org|play\.google|apps\.apple|fonts\.g|youtube\.com|youtu\.be|w3\.org/;
const URL_RE = /https?:\/\/[^"'\s\\)]+/g;

const found = new Map(); // 주소 → 어느 파일에서 나왔나
const files = [];
(function walk(d) {
  for (const e of readdirSync(d)) {
    const p = join(d, e);
    statSync(p).isDirectory() ? walk(p) : files.push(p);
  }
})(DATA);
files.push("src/data/seed.ts");

for (const p of files) {
  if (!/\.(json|ts)$/.test(p) || !existsSync(p)) continue;
  for (const m of readFileSync(p, "utf8").matchAll(URL_RE)) {
    const u = m[0].replace(/[.,]$/, "");
    if (SKIP.test(u)) continue;
    if (!found.has(u)) found.set(u, p.replace(/^src\/data\//, ""));
  }
}

// 🪦 이미 죽은 줄 알고 빼 둔 것은 다시 두드리지 않는다.
const dead = new Set();
if (existsSync("src/data/dead-links.json")) {
  for (const m of readFileSync("src/data/dead-links.json", "utf8").matchAll(URL_RE)) dead.add(m[0]);
}

const list = [...found].filter(([u]) => !dead.has(u));
console.log(`자료 속 바깥 링크 ${found.size}개 (이미 죽은 걸로 빼 둔 것 ${dead.size}개 제외 → ${list.length}개 두드린다)\n`);

const ping = async (u) => {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), 15000);
  try {
    // HEAD 를 막는 곳이 많다 — GET 으로 가되 본문은 안 읽는다.
    const r = await fetch(u, { redirect: "follow", signal: ctl.signal, headers: { "user-agent": "Mozilla/5.0 (compatible; k-street-linkcheck)" } });
    return { code: r.status, to: r.url !== u ? r.url : "" };
  } catch (e) {
    return { code: 0, to: "", err: String(e.message ?? e).slice(0, 60) };
  } finally {
    clearTimeout(t);
  }
};

const rows = [];
// 한 번에 6개씩 — 한꺼번에 다 던지면 상대 서버가 막는다.
for (let i = 0; i < list.length; i += 6) {
  const part = list.slice(i, i + 6);
  const res = await Promise.all(part.map(([u]) => ping(u)));
  part.forEach(([u, src], k) => rows.push({ u, src, ...res[k] }));
}

const good = rows.filter((r) => r.code >= 200 && r.code < 400);
const blocked = rows.filter((r) => r.code === 403 || r.code === 405 || r.code === 429);
const bad = rows.filter((r) => r.code === 0 || r.code >= 400).filter((r) => !blocked.includes(r));

console.log(`✅ 열린다 ${good.length}`);
console.log(`🤖 로봇을 막는다(살아 있을 확률이 높다) ${blocked.length}`);
console.log(`❌ 안 열린다 ${bad.length}\n`);
for (const r of blocked) console.log(`  🤖 ${r.code} ${r.u}  [${r.src}]`);
for (const r of bad) console.log(`  ❌ ${r.code || r.err} ${r.u}  [${r.src}]`);
const moved = good.filter((r) => r.to && new URL(r.to).host !== new URL(r.u).host);
if (moved.length) {
  console.log(`\n↪️ 다른 곳으로 튕긴다 ${moved.length}개 — **엉뚱한 페이지일 수 있다. 사람이 볼 것.**`);
  for (const r of moved) console.log(`  ${r.u}\n     → ${r.to}`);
}
// 🚦 아무것도 막지 않는다 — 한 번 실패로 지우지 않는 것이 이 저장소의 규칙이다.
console.log("\n(이 검사는 보고만 한다. 지우는 것은 사람이 두 번 확인하고 한다.)");
