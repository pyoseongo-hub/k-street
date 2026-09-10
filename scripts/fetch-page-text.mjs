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
  const text = toText(r.html);
  console.log(text.slice(0, LIMIT));
  if (text.length > LIMIT) console.log(`\n… (${(text.length - LIMIT).toLocaleString()}자 더 있다. CHARS 를 키우면 더 나온다)`);
}
