#!/usr/bin/env node
// 📖 **페이지를 열어서 글을 그대로 가져온다.**
//
// 왜 (2026-09-10):
//   이 저장소를 만드는 세션은 **바깥 인터넷이 막혀 있다.** 그래서 사장님이
//   "이거 봐" 하고 주소를 주셔도 내가 열어 볼 수가 없다. 러너는 열 수 있다.
//
//   check-guide-links.mjs 는 **살아 있나**만 본다(200 인지, 제목이 뭔지).
//   이건 **뭐라고 적혀 있나**를 본다. 둘은 하는 일이 다르다.
//
// 🚨 여기서 가져온 글을 그대로 앱에 넣지 않는다. **읽고 사람이 정한다.**
//    특히 값은 이 저장소가 여러 번 데인 자리다.
//
// ⚠️ https 인증서가 깨진 곳이 있다(서울교통공사가 그렇다). 그럴 때 http 로
//    다시 두드린다 — **다만 그 사실을 화면에 크게 적는다.** 조용히 낮춰서
//    받으면 다음 사람이 그게 안전한 줄 안다.
//
//   URLS="https://a.com,https://b.com" node scripts/fetch-page-text.mjs

const UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36";
const LIMIT = Number(process.env.CHARS ?? 6000);

const URLS = (process.env.URLS ?? "")
  .split(/[\s,]+/)
  .map((t) => t.trim())
  .filter(Boolean);

if (!URLS.length) {
  console.error("❌ URLS 가 비었다. 예: URLS=\"http://example.com\" node scripts/fetch-page-text.mjs");
  process.exit(1);
}

/** 태그를 걷어내고 사람이 읽을 글만 남긴다. 표는 줄로 편다. */
function toText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    // 표 칸은 붙어 버리면 「3,0004,000」처럼 읽을 수 없게 된다 — 갈라 준다
    .replace(/<\/(td|th)>/gi, " | ")
    .replace(/<\/(tr|p|div|li|h[1-6])>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .split("\n")
    .map((l) => l.replace(/[ \t|]+/g, (m) => (m.includes("|") ? " | " : " ")).trim())
    .filter((l) => l && l !== "|")
    .join("\n")
    .replace(/\n{3,}/g, "\n\n");
}

async function get(url) {
  const r = await fetch(url, {
    redirect: "follow",
    signal: AbortSignal.timeout(30000),
    headers: { "User-Agent": UA },
  });
  return { status: r.status, final: r.url, html: await r.text() };
}

for (const url of URLS) {
  console.log(`\n${"═".repeat(70)}`);
  console.log(`📖 ${url}`);
  console.log("═".repeat(70));
  let r;
  try {
    r = await get(url);
  } catch (e) {
    const why = e?.cause?.code || e?.name || e?.message;
    // 인증서가 깨진 곳은 http 로 한 번 더 본다. **낮춰서 받았다고 크게 적는다.**
    if (String(why).includes("CERT") || String(why).includes("SIGNATURE")) {
      const plain = url.replace(/^https:/, "http:");
      console.log(`⚠️ https 인증서가 깨져 있다 (${why}).`);
      console.log(`⚠️ **http 로 낮춰서** 다시 본다 — ${plain}`);
      console.log("⚠️ 낮춰 받은 글이다. 중요한 값은 사람이 브라우저로 한 번 더 볼 것.");
      try {
        r = await get(plain);
      } catch (e2) {
        console.log(`❌ http 로도 못 열었다 (${e2?.cause?.code || e2?.name})`);
        continue;
      }
    } else {
      console.log(`❌ 못 열었다 (${why})`);
      continue;
    }
  }

  console.log(`상태 ${r.status}${r.final !== url ? ` · ↪ ${r.final}` : ""} · 받은 글 ${r.html.length.toLocaleString()}자\n`);

  // 🔗 **링크도 같이 뽑는다.** 글만 보면 「지점」이라는 메뉴가 있는 건 알겠는데
  //    그게 어느 주소인지 몰라 다음 걸음을 못 뗀다. 한 번에 다음 자리를 알려 준다.
  if (process.env.LINKS !== "0") {
    const base = new URL(r.final);
    const seen = new Map();
    for (const m of r.html.matchAll(/<a\b[^>]*href="([^"#][^"]*)"[^>]*>([\s\S]*?)<\/a>/gi)) {
      const label = m[2].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      if (!label || label.length > 30) continue;
      let abs;
      try { abs = new URL(m[1], base).href; } catch { continue; }
      if (!/^https?:/.test(abs)) continue;
      if (!seen.has(abs)) seen.set(abs, label);
    }
    const rows = [...seen].filter(([u]) => u.startsWith(`${base.protocol}//${base.host}`));
    if (rows.length) {
      console.log(`🔗 이 페이지 안의 링크 ${rows.length}개 (같은 집 안만):`);
      for (const [u, label] of rows.slice(0, 40)) console.log(`   · ${label.padEnd(18)} ${u}`);
      console.log("");
    }
  }
  const text = toText(r.html);

  // 🔎 **찾는 말 근처만** 뽑는다. 공공기관 페이지는 앞이 전부 사이트 메뉴라
  //    앞에서부터 읽으면 본문에 닿기 전에 잘린다(서울교통공사가 그랬다).
  const FIND = (process.env.FIND ?? "").split(/[,|]/).map((t) => t.trim()).filter(Boolean);
  if (FIND.length) {
    let hit = 0;
    for (const kw of FIND) {
      let i = -1;
      while ((i = text.indexOf(kw, i + 1)) !== -1 && hit < 12) {
        hit++;
        console.log(`\n──── 「${kw}」 둘레 ────`);
        // 찾는 말 **앞**에 있는 표를 봐야 할 때가 있다 (지점표가 요금표 앞에 있었다).
        const BEFORE = Number(process.env.BEFORE ?? 200);
        console.log(text.slice(Math.max(0, i - BEFORE), i + LIMIT));
        break; // 같은 말은 첫 자리만
      }
    }
    if (!hit) console.log(`⚠️ 찾는 말이 글 안에 없다: ${FIND.join(" · ")}\n   (글 ${text.length.toLocaleString()}자를 받기는 했다 — 없는 것과 못 받은 것은 다르다)`);
  } else {
    console.log(text.slice(0, LIMIT));
    if (text.length > LIMIT) console.log(`\n… (${(text.length - LIMIT).toLocaleString()}자 더 있다. CHARS 를 키우거나 FIND 로 찾는 말을 주면 된다)`);
  }
}
