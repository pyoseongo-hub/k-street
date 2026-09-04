// 🔗 출시 전 링크 검사 — 앱이 손님에게 내보내는 주소가 **실제로 열리는지** 확인한다.
//
// 왜 GitHub Actions에서만 도나 — 작업 세션(에이전트 샌드박스)은 바깥 인터넷이
// 막혀 있어(agent proxy) 어떤 주소도 못 열어 본다. 러너는 실제 인터넷이 된다.
//
// 무엇을 보나
//   ① 카드 사진 — 지금 자료에 http:// 로 적혀 있다. 앱은 https:// 로 서비스되므로
//      브라우저가 http 이미지를 막거나(혼합 콘텐츠) https로 자동 승격한다.
//      그래서 **https로 바꿔도 열리는지**를 확인한다. 열리면 자료를 https로 바꾸면 되고,
//      안 열리면 사진을 다른 곳에서 받아야 한다. 이건 출시를 막을 만한 문제다.
//   ② 이름 링크 — 공식 홈페이지(OFFICIAL)가 살아 있는지. 죽은 주소로 보내면
//      네이버 검색으로 보내느니만 못하다.
//   ③ 길찾기 링크 — 지도 3사 주소는 형식만 맞으면 되므로 표본만 본다.
//
// 저장하는 것은 없다. 결과만 Actions Summary에 찍는다.

import fs from "node:fs";

const file = process.argv[2] ?? "links.json";
const D = JSON.parse(fs.readFileSync(file, "utf8"));

const ONLY = process.argv.find((a) => a.startsWith("--only="))?.slice(7);
const CONCURRENCY = Number(process.argv.find((a) => a.startsWith("--concurrency="))?.slice(14) ?? 8);
const TIMEOUT = 20000;

/** 한 주소를 열어 본다. 브라우저처럼 굴어야 막히지 않는다(일부 관공서가 봇을 막는다). */
async function probe(url) {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), TIMEOUT);
  try {
    // HEAD를 안 받아 주는 서버가 많아 GET으로 열되, 몸통은 읽지 않고 바로 끊는다.
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: ctl.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        Accept: "*/*",
      },
    });
    const type = res.headers.get("content-type") ?? "";
    res.body?.cancel?.();
    return { ok: res.ok, status: res.status, type, finalUrl: res.url };
  } catch (e) {
    const why = e?.cause?.code || e?.cause?.message || e?.name || String(e);
    return { ok: false, status: 0, why: String(why).slice(0, 60) };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * 한 번 실패했다고 죽은 주소로 단정하지 않는다 — **세 번 본다.**
 *
 * 사장님 지시(2026-09-04): "두번세번 검수해서 결과만 보고해".
 * 실제로 첫 검사에서 안 열린 10곳 중에는 그때 잠깐 끊긴 것(TIMEOUT·ECONNRESET),
 * 로봇을 막는 것(403), 진짜로 없어진 도메인(ENOTFOUND)이 섞여 있었다.
 * 셋을 갈라야 **살아 있는 주소를 실수로 빼는 일**이 없다.
 *
 * 세 번 다 같은 이유로 실패해야 "죽었다"고 적는다.
 */
async function probe3(url) {
  const tries = [];
  for (let i = 0; i < 3; i++) {
    const r = await probe(url);
    tries.push(r);
    if (r.ok) return { ...r, tries: i + 1 };
    if (i < 2) await new Promise((s) => setTimeout(s, 2500 * (i + 1)));
  }
  return { ...tries[2], tries: 3, all: tries.map((t) => t.status || t.why) };
}

async function runAll(items, fn) {
  const out = new Array(items.length);
  let i = 0;
  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, items.length) }, async () => {
      for (;;) {
        const n = i++;
        if (n >= items.length) return;
        out[n] = await fn(items[n], n);
      }
    })
  );
  return out;
}

const everyone = [...D.rows, ...D.festivals, ...D.hidden];
const byId = new Map();
for (const r of everyone) if (!byId.has(r.id)) byId.set(r.id, r);
const places = [...byId.values()];

const section = (t) => console.log(`\n${"─".repeat(60)}\n${t}\n${"─".repeat(60)}`);
let problems = 0;

// ── ① 사진 ─────────────────────────────────────────────────────────────
if (!ONLY || ONLY === "photos") {
  const urls = new Set();
  for (const p of places) {
    if (p.image) urls.add(p.image);
    if (p.thumb) urls.add(p.thumb);
  }
  const list = [...urls];
  const http = list.filter((u) => u.startsWith("http://"));
  section(`① 카드 사진 ${list.length}개`);
  if (http.length) {
    console.log(`   🚨 아직 http:// 인 사진이 ${http.length}개 있다 — https 앱에서는 안 보인다.`);
    console.log("      (scripts/lib/https-photo.mjs · 감사 ❌B11 참고)\n");
  } else {
    console.log("   전부 https:// 다. 실제로 열리는지 한 장씩 확인한다.\n");
  }

  // http로 남아 있는 것은 https로 바꿔서, 이미 https인 것은 그대로 열어 본다.
  const res = await runAll(list, async (u) => ({ u, r: await probe3(u.replace(/^http:/, "https:")) }));
  const bad = res.filter((x) => !x.r.ok);
  const notImage = res.filter((x) => x.r.ok && x.r.type && !x.r.type.startsWith("image/"));
  console.log(`   ✅ https로 열림 : ${res.length - bad.length}개`);
  console.log(`   ❌ https 실패   : ${bad.length}개`);
  console.log(`   ⚠️ 사진이 아닌 응답: ${notImage.length}개`);
  bad.slice(0, 20).forEach((x) => console.log(`      ${x.r.status || x.r.why}  ${x.u}`));
  if (bad.length) problems++;
}

// ── ② 이름 링크 ────────────────────────────────────────────────────────
if (!ONLY || ONLY === "official") {
  const officials = places.filter((p) => p.info?.label === "OFFICIAL");
  const seen = new Map();
  for (const p of officials) if (!seen.has(p.info.url)) seen.set(p.info.url, p);
  const list = [...seen.entries()];
  section(`② 이름을 눌렀을 때 가는 공식 홈페이지 ${list.length}개`);

  const res = await runAll(list, async ([u, p]) => ({ u, p, r: await probe3(u) }));
  const bad = res.filter((x) => !x.r.ok);
  console.log(`   ✅ 열림: ${res.length - bad.length}개   ❌ 안 열림: ${bad.length}개\n`);
  for (const x of res) {
    const mark = x.r.ok ? "✅" : "❌";
    const moved = x.r.ok && x.r.finalUrl && x.r.finalUrl.replace(/\/$/, "") !== x.u.replace(/\/$/, "");
    console.log(
      `   ${mark} ${String(x.r.status || x.r.why).padEnd(14)} ${x.p.name}  ${x.u}` +
        (moved ? `\n        ↳ 실제로는 ${x.r.finalUrl} 로 넘어간다` : "") +
        // 세 번 다 실패했으면 그 세 번의 결과를 같이 적는다 — 매번 다른 이유로
        // 실패했다면 그때그때 끊긴 것이고, 세 번 다 같은 이유면 진짜 죽은 것이다.
        (x.r.all ? `\n        ↳ 세 번 다 실패: ${x.r.all.join(" / ")}` : "")
    );
  }
  if (bad.length) problems++;
}

// ── ③ 길찾기 링크 (표본) ───────────────────────────────────────────────
if (!ONLY || ONLY === "maps") {
  const sample = places.filter((p) => typeof p.lat === "number").slice(0, 6);
  section(`③ 길찾기 링크 표본 ${sample.length}곳 × 3사`);
  for (const p of sample) {
    console.log(`   ${p.gu} ${p.name}`);
    for (const m of p.maps) {
      const r = await probe(m.url);
      console.log(`      ${r.ok ? "✅" : "⚠️"} ${String(r.status || r.why).padEnd(14)} ${m.label}  ${m.url.slice(0, 100)}`);
    }
  }
  console.log("\n   ※ 지도 3사는 주소가 틀려도 200을 주는 경우가 있어 이 검사는 참고용이다.");
  console.log("      목적지가 실제로 맞는지는 좌표 검사(check-coords)가 본다.");
}

section(problems ? `❌ 고쳐야 할 것이 있다 (${problems}가지)` : "✅ 링크 쪽에 막는 문제 없음");
