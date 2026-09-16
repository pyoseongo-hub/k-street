// 🔎 **한국 여행을 찍는 「작은」 유튜브 채널을 찾는다.**
//
// 사장님 (2026-09-16): *"아직 초보 구독자 작은 체널"*
//
// ── 왜 작은 채널인가 ─────────────────────────────────────────────────
//   큰 채널은 메일을 안 읽는다. 하루에 영업 메일이 수십 통 온다.
//   구독자 1천~2만 쯤이면 **본인이 직접 읽고 답장도 한다.**
//   우리는 돈을 안 준다(수익화 전이다). 그러니 **읽히는 것**이 전부다.
//
// ── 왜 API 인가 ──────────────────────────────────────────────────────
//   유튜브 검색 화면을 긁어도 채널 이름은 나온다. 실제로 해 봤다.
//   그런데 **구독자 수 자리에 핸들(@id)이 들어온다** — 로그인 안 한 화면이라 그렇다.
//   구독자 수로 거르는 건 API 말고 길이 없고, 거르지 못하면 이 일의 뜻이 없다.
//
// ── 돈(할당량) ───────────────────────────────────────────────────────
//   search.list 는 한 번에 **100단위**, 하루 10,000단위가 기본이다.
//   검색어 하나에 100단위이므로 **하루 90번쯤** 돌릴 수 있다. 넉넉하다.
//   channels.list 는 1단위라 사실상 공짜다. 그래서 **채널은 한꺼번에(50개씩) 묻는다.**
//
// 🚨 **열쇠를 로그에 찍지 않는다.** 주소를 그대로 출력하면 열쇠가 딸려 나간다 —
//    이 파일은 오류를 낼 때도 주소가 아니라 **무엇을 물었는지**만 적는다.
//
// 돌리는 법 (Actions → Find creators):
//   YOUTUBE_API_KEY=… node scripts/find-creators.mjs
//   환경변수 — KEYWORDS · MIN_SUBS · MAX_SUBS · DAYS · REGION

const KEY = process.env.YOUTUBE_API_KEY;
if (!KEY) {
  console.error("❌ YOUTUBE_API_KEY 가 없다. 저장소 Secrets 에 넣을 것.");
  process.exit(1);
}

const KEYWORDS = (process.env.KEYWORDS ||
  "韓国旅行 vlog,ソウル 旅行,ソウル グルメ,首爾 旅行,韓國 自由行,Seoul travel vlog")
  .split(",").map((s) => s.trim()).filter(Boolean);
const MIN_SUBS = Number(process.env.MIN_SUBS || 500);
const MAX_SUBS = Number(process.env.MAX_SUBS || 20000);
const DAYS = Number(process.env.DAYS || 120);
const PER = Number(process.env.PER || 50);

const since = new Date(Date.now() - DAYS * 86400e3).toISOString();

/** 유튜브에 묻는다. 🚨 실패해도 **주소를 찍지 않는다**(열쇠가 딸려 나간다). */
async function ask(path, params) {
  const url = new URL(`https://www.googleapis.com/youtube/v3/${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  url.searchParams.set("key", KEY);
  const r = await fetch(url);
  if (!r.ok) {
    const body = await r.text();
    // 본문에도 열쇠가 실릴 일은 없지만, 길면 앞부분만 보여 준다.
    throw new Error(`${path} ${r.status} — ${body.slice(0, 300)}`);
  }
  return r.json();
}

/** 검색어 하나로 최근 영상을 훑어 **채널 id** 만 모은다. */
async function channelsFor(q) {
  const j = await ask("search", {
    part: "snippet", type: "video", q,
    maxResults: PER, order: "viewCount", publishedAfter: since,
  });
  const ids = new Map();
  for (const it of j.items ?? []) {
    ids.set(it.snippet.channelId, it.snippet.channelTitle);
  }
  return ids;
}

/** 채널 속사정을 한꺼번에 묻는다 (50개씩 · 1단위라 사실상 공짜). */
async function stats(ids) {
  const out = [];
  for (let i = 0; i < ids.length; i += 50) {
    const j = await ask("channels", {
      part: "snippet,statistics", id: ids.slice(i, i + 50).join(","),
    });
    out.push(...(j.items ?? []));
  }
  return out;
}

const found = new Map();
for (const q of KEYWORDS) {
  try {
    const m = await channelsFor(q);
    for (const [id, title] of m) {
      if (!found.has(id)) found.set(id, { id, title, 검색어: [] });
      found.get(id).검색어.push(q);
    }
    console.log(`🔎 「${q}」 — 채널 ${m.size}곳`);
  } catch (e) {
    console.error(`⚠️ 「${q}」 실패 — ${e.message}`);
  }
}

const items = await stats([...found.keys()]);
const rows = items.map((c) => ({
  이름: c.snippet.title,
  핸들: c.snippet.customUrl ? `@${c.snippet.customUrl.replace(/^@/, "")}` : "",
  구독자: Number(c.statistics.subscriberCount ?? 0),
  영상: Number(c.statistics.videoCount ?? 0),
  조회수: Number(c.statistics.viewCount ?? 0),
  나라: c.snippet.country ?? "",
  만든날: (c.snippet.publishedAt ?? "").slice(0, 10),
  검색어: found.get(c.id)?.검색어 ?? [],
  // 🚨 구독자 수를 **숨긴 채널**이 있다. statistics 가 0 으로 온다.
  //    0 을 「작은 채널」로 읽으면 안 된다 — 모르는 것과 작은 것은 다르다.
  숨김: c.statistics.hiddenSubscriberCount === true,
}));

// 🚨 **한국을 찍는 채널만 남긴다** (2026-09-16에 첫 판을 돌려 보고 넣었다).
//    첫 판에서 「福岡グルメ」(후쿠오카 음식) · 「旅するイタリア食堂」(이탈리아) ·
//    Stray Kids 까지 걸렸다. 검색어가 「Seoul food tour」인데도 그렇다 —
//    유튜브 검색은 말이 안 맞아도 **사람들이 많이 본 것**을 먼저 준다.
//    그런 채널에 서울 앱을 보내면 그게 스팸이다. 한 번 스팸으로 찍히면 끝이다.
//    → 채널 **이름이나 소개글**에 한국이 들어간 것만 남긴다. 언어마다 다르게 쓴다.
const 한국 = /한국|서울|韓国|韓國|ソウル|首爾|首尔|korea|seoul|corea|corée|kordd|hàn quốc|เกาหลี|โซล/i;
function 한국채널인가(c) {
  return 한국.test(`${c.snippet.title} ${c.snippet.description ?? ""}`);
}
const 한국것 = new Set(items.filter(한국채널인가).map((c) => c.snippet.title));

const 작은곳 = rows
  .filter((r) => !r.숨김 && r.구독자 >= MIN_SUBS && r.구독자 <= MAX_SUBS)
  .filter((r) => 한국것.has(r.이름))
  .sort((a, b) => a.구독자 - b.구독자);

console.log(`\n${"═".repeat(74)}`);
console.log(`📋 채널 ${rows.length}곳을 봤다 · 그중 한국을 찍는 곳 ${한국것.size}곳 ·`
  + ` 구독자 ${MIN_SUBS.toLocaleString()}~${MAX_SUBS.toLocaleString()}명은 **${작은곳.length}곳**\n`);
console.log("  구독자   영상   채널".padEnd(46) + "핸들");
console.log("─".repeat(74));
for (const r of 작은곳) {
  console.log(
    `${r.구독자.toLocaleString().padStart(8)}  ${String(r.영상).padStart(5)}   `
    + `${r.이름.slice(0, 26).padEnd(28)}${r.핸들}`);
}

const 숨긴곳 = rows.filter((r) => r.숨김);
if (숨긴곳.length) {
  console.log(`\n🙈 구독자 수를 숨긴 채널 ${숨긴곳.length}곳 — 크기를 모르니 따로 둔다:`);
  for (const r of 숨긴곳) console.log(`   ${r.이름}  ${r.핸들}`);
}

const 큰곳 = rows.filter((r) => !r.숨김 && r.구독자 > MAX_SUBS && 한국것.has(r.이름))
  .sort((a, b) => b.구독자 - a.구독자);
console.log(`\n📈 ${MAX_SUBS.toLocaleString()}명을 넘는 채널 ${큰곳.length}곳 — `
  + `메일을 안 읽을 가능성이 크다(참고용 위 5곳):`);
for (const r of 큰곳.slice(0, 5)) {
  console.log(`   ${r.구독자.toLocaleString().padStart(9)}  ${r.이름}  ${r.핸들}`);
}

console.log(`\n🚨 여기 나온 것을 그대로 보내지 않는다.`);
console.log(`   채널을 **열어 보고** 한국 여행을 실제로 찍는지, 우리 앱(서울 전용)과`);
console.log(`   맞는지 본다. 부산만 찍는 채널에 서울 앱을 보내면 그게 스팸이다.`);
console.log(`   메일 주소는 채널 「정보」의 비즈니스 문의에 있다 — 없으면 보내지 않는다.`);
