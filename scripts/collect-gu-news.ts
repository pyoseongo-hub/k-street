// 📡 **구청 새소식에서 축제 글을 모은다** — 우리에게 없는 것만 추려 보고한다.
//
// 사장님: **"구청 자료 모아"** (2026-10-10). 10/8에 「구청 보류」로 멈춰 뒀던
// 2단계다. 1단계(25개 구청 RSS 주소 찾기)는 그때 끝나 있었다.
//
// ── 🚨 왜 이게 필요한가 — 숫자로 드러났다 ───────────────────────────────
//   우리 창구 셋(관광공사 · 서울시 문화포털 · 펀서울)은 **전부 주최 측이
//   올려 줄 때까지 기다린다.** 그런데 **구청 보도자료는 2주쯤 앞서 나온다.**
//   · 노원 북 페스티벌 — 네이버엔 날짜가 있었고 우리 셋엔 없었다.
//     찾아보니 **노원구 보도자료에 이미 있었다.**
//   · 강남페스티벌 10.3–5 — **강남구청 보도자료**에서 찾았다. 우리 셋엔 없었다.
//   오늘 기준 10·11월 서울 축제 중 **27곳이 아직 며칟날을 모른다.**
//   그 빈칸을 메우는 자리가 여기다.
//
// ── ✋ 이 스크립트가 **하지 않는** 것 ────────────────────────────────────
//   🚫 **seed 에 아무것도 넣지 않는다.** 날짜도 안 적는다.
//      제목 한 줄로 「무슨 축제가 언제」를 알 수 없다 — 사람이 글을 열어 봐야 한다.
//      이 저장소가 지켜 온 잣대 그대로다: **확인 못 한 것은 넣지 않는다.**
//   → 하는 일은 하나다. **「구청이 알리는데 우리는 모르는 것」을 목록으로 내민다.**
//
// ── 🔎 고르는 법 ────────────────────────────────────────────────────────
//   ① 제목에 축제말이 있어야 한다 (축제·페스티벌·문화제·야행·한마당 …)
//   ② 행정말이 있으면 버린다 (입찰·공고·용역·채용·낙찰 …) — 같은 칸에 섞여 온다
//   ③ 최근 글만 본다 (기본 60일) — 작년 보도자료가 올해 것처럼 읽히면 안 된다
//   ④ 우리 축제 이름이 제목에 들어 있으면 **「이미 있음」**으로 가른다
//
//   npm run gu-news
import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fetchHtml } from "./lib/html-text.mjs";
import feeds from "../src/data/gu-rss-feeds.json";
import { ALL_FESTIVALS } from "../src/data/seed";

const ROOT = process.cwd();
const OUT_MD = join(ROOT, "docs", "구청-새소식-축제.md");
const OUT_JSON = join(ROOT, "src", "data", "gu-news-festivals.json");
const TODAY = new Date().toISOString().slice(0, 10);
const 며칠 = Number(process.argv.find((a) => a.startsWith("--days="))?.split("=")[1] ?? 60);

/**
 * 🔎 **축제말** — 처음엔 「주간·박람회·공연·음악회·마켓」까지 넣었다가 **되물렸다**
 *    (2026-10-10 첫 실행). 93건이 나왔는데 그 안에 「고교입시 박람회」·「지진안전주간」·
 *    「가계보탬 페이백 주간」·「진로진학박람회」가 섞여 있었다. 손님과 상관없는 글이
 *    목록의 절반을 먹으면 **아무도 그 목록을 안 본다.** 좁히는 쪽이 맞다.
 *    놓치는 것이 있어도 괜찮다 — 이건 **빈칸을 메우는 보조 창구**지 유일한 창구가 아니다.
 */
const 축제말 = /축제|페스티벌|페스타|문화제|야행|한마당|불꽃|퍼레이드|등축제|빛축제|가을밤|야시장/;
/**
 * 🚫 같은 칸에 **행정 글과 곁다리 글**이 섞여 온다.
 *    · 입찰·공고 — 「입찰공고」 제목에도 「축제」가 들어 있다
 *    · 모집·공모전·수상자 — 축제 **자체**가 아니라 그 곁가지다. 날짜가 안 적혀 있다
 *    · 성료 — **이미 끝났다**는 글이다
 */
const 행정말 =
  /입찰|공고|고시|채용|용역|낙찰|계약|심사|심의|결과\s*발표|선정\s*결과|대관|수의계약|제안서|견적|정산|보조금|조례|의회|감사\s*결과|모집|공모전|수상자|당첨자|성료|셀러|자원봉사|이벤트\s*적립|설문/;

interface Item { 구: string; 자리: string; 제목: string; link: string; 날짜?: string }

function 글뽑기(xml: string): { title: string; link: string; date?: string }[] {
  const out: { title: string; link: string; date?: string }[] = [];
  // 🧷 자리 이름(class·구조)에 기대지 않는다 — RSS 는 <item> 과 <entry> 두 꼴이 있다.
  const blocks = [...xml.matchAll(/<(item|entry)\b[\s\S]*?<\/\1>/gi)].map((m) => m[0]);
  for (const b of blocks) {
    const t = b.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "";
    const title = t
      .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
      .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&").replace(/&quot;/g, '"')
      .replace(/\s+/g, " ")
      .trim();
    if (!title) continue;
    const link =
      b.match(/<link[^>]*>([\s\S]*?)<\/link>/i)?.[1]?.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").trim() ||
      b.match(/<link[^>]*href=["']([^"']+)["']/i)?.[1] || "";
    const raw = b.match(/<(pubDate|dc:date|updated|published)[^>]*>([\s\S]*?)<\/\1>/i)?.[2]?.trim();
    const d = raw ? new Date(raw) : undefined;
    out.push({ title, link: link.trim(), date: d && !isNaN(+d) ? d.toISOString().slice(0, 10) : undefined });
  }
  return out;
}

/** 우리 축제 이름이 제목에 들어 있나 — 띄어쓰기를 지우고 본다. */
const 우리것 = ALL_FESTIVALS.map((f) => ({
  id: f.id,
  name: f.name,
  key: f.name.normalize("NFC").replace(/[^0-9A-Za-z가-힣]/g, ""),
}));
function 아는축제(title: string): { id: string; name: string } | undefined {
  const t = title.normalize("NFC").replace(/[^0-9A-Za-z가-힣]/g, "");
  return 우리것.find((f) => f.key.length >= 4 && t.includes(f.key));
}

const 오래된 = new Date(Date.now() - 며칠 * 86400000).toISOString().slice(0, 10);
const 새것: Item[] = [];
const 있음: Item[] = [];
const 못읽음: string[] = [];

const 구목록 = (feeds as { 구: Record<string, { feeds: { 이름: string; url: string }[] }> })["구"];
for (const [구, v] of Object.entries(구목록)) {
  for (const f of v.feeds) {
    try {
      // 🐞 **10건만 돌려주는 칸이 있다** (2026-10-10에 잡았다).
      //    강남구청 보도자료 주소에 `recordCountPerPage=10` 이 박혀 있어서,
      //    9/16 에 올라온 **「2026 강남페스티벌」 보도자료를 이미 밀려나 못 봤다.**
      //    바로 그 글에서 10.3–5 라는 날짜를 찾았는데, 이 창구로는 못 찾을 뻔했다.
      //    → 쪽수 칸이 보이면 **넉넉히 올려** 부른다. 안 받는 서버는 그냥 무시한다.
      const url = f.url
        .replace(/recordCountPerPage=\d+/i, "recordCountPerPage=100")
        .replace(/listcount=\d+/i, "listcount=100");
      const r = await fetchHtml(url, { timeoutMs: 20000 });
      if (r.status !== 200) { 못읽음.push(`${구} — HTTP ${r.status} (${f.이름})`); continue; }
      const items = 글뽑기(r.html);
      if (!items.length) { 못읽음.push(`${구} — 글이 하나도 없다 (${f.이름})`); continue; }
      for (const it of items) {
        if (!축제말.test(it.title) || 행정말.test(it.title)) continue;
        // ⏳ 날짜를 모르는 글은 **버리지 않는다** — 날짜 칸이 없는 RSS 가 있다.
        //    「없는 것」과 「오래된 것」은 다르다.
        if (it.date && it.date < 오래된) continue;
        // 🐞 **그런데 날짜 칸이 없으면 2023년 글도 그대로 올라온다** (첫 실행에서 봤다 —
        //    「2023 정동야행 자원봉사자 모집」이 목록 맨 위에 있었다).
        //    → 날짜 칸이 없을 때는 **제목에 박힌 해**로 가른다. 지난해 것이면 버린다.
        //    해가 아예 없으면 가를 길이 없으므로 남긴다 — 지어내지 않는다.
        if (!it.date) {
          const 해들 = [...it.title.matchAll(/20\d{2}/g)].map((m) => Number(m[0]));
          if (해들.length && Math.max(...해들) < new Date().getFullYear()) continue;
        }
        const row: Item = { 구, 자리: f.이름, 제목: it.title, link: it.link, ...(it.date ? { 날짜: it.date } : {}) };
        (아는축제(it.title) ? 있음 : 새것).push(row);
      }
    } catch (e) {
      못읽음.push(`${구} — ${(e as Error)?.message ?? "알 수 없는 오류"} (${f.이름})`);
    }
  }
}

새것.sort((a, b) => (b.날짜 ?? "").localeCompare(a.날짜 ?? "") || a.구.localeCompare(b.구));
있음.sort((a, b) => (b.날짜 ?? "").localeCompare(a.날짜 ?? ""));

console.log(`📡 구청 RSS ${Object.values(구목록).reduce((n, v) => n + v.feeds.length, 0)}개를 읽었다 (최근 ${며칠}일)`);
console.log(`   🆕 우리가 모르는 축제 글 ${새것.length}건 · ✅ 아는 축제 ${있음.length}건 · 🧱 못 읽은 곳 ${못읽음.length}곳`);
for (const r of 새것.slice(0, 30)) console.log(`   ${(r.날짜 ?? "날짜없음").padEnd(10)} ${r.구.padEnd(4)} ${r.제목}`);

mkdirSync(dirname(OUT_MD), { recursive: true });
const 표 = (rows: Item[]) =>
  rows.length
    ? `| 올린 날 | 구 | 제목 | 글 |\n|---|---|---|---|\n` +
      rows
        .map((r) => `| ${r.날짜 ?? ""} | ${r.구} | ${r.제목.replace(/\|/g, "/")} | ${r.link ? `[열기](${r.link})` : ""} |`)
        .join("\n")
    : "_없다._";

writeFileSync(
  OUT_MD,
  [
    "# 📡 구청이 알리는데 우리는 모르는 축제",
    "",
    `**${TODAY} 기준 · 기계가 적는다** (scripts/collect-gu-news.ts — 손으로 고치지 말 것).`,
    "",
    "구청 보도자료·새소식 RSS 를 읽어 **제목에 축제말이 있는 최근 글**만 추렸다.",
    "우리 축제 이름이 제목에 들어 있으면 「이미 아는 것」으로 갈라 둔다.",
    "",
    "🚫 **여기 있는 것을 그대로 앱에 넣지 않는다.** 제목 한 줄로는 며칟날인지 모른다 —",
    "글을 열어 보고, 요일이 올해 달력과 맞는지 보고, `festival-dates-manual.json` 에 적는다.",
    "",
    `## 🆕 우리가 모르는 축제 글 (${새것.length}건)`,
    "",
    표(새것),
    "",
    `## ✅ 이미 아는 축제 (${있음.length}건)`,
    "",
    "우리 자료에 있는 축제다. **날짜가 비어 있다면 이 글을 열어 보면 된다.**",
    "",
    표(있음),
    "",
    `## 🧱 못 읽은 곳 (${못읽음.length})`,
    "",
    못읽음.length ? "```\n" + 못읽음.join("\n") + "\n```" : "_없다._",
    "",
    "🚫 인증서가 끊긴 구(성동)는 **검증을 끄지 않는다.** 못 읽는 것이 맞다.",
    "",
  ].join("\n"),
  "utf8",
);

writeFileSync(
  OUT_JSON,
  JSON.stringify(
    {
      _읽어보세요: [
        "📡 구청 RSS 에서 추린 축제 글. 기계가 덮어쓴다 — 손으로 고치지 말 것.",
        "사람이 글을 열어 확인한 뒤 festival-dates-manual.json 에 적는다.",
        "이 파일은 화면이 읽지 않는다. 사람이 볼 목록이다.",
      ],
      받은날: TODAY,
      센것: { 모르는것: 새것.length, 아는것: 있음.length, 못읽음: 못읽음.length },
      모르는것: 새것,
      아는것: 있음,
    },
    null,
    2,
  ) + "\n",
  "utf8",
);
console.log(`\n📝 ${OUT_MD.replace(ROOT + "/", "")}`);
