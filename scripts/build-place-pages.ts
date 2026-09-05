// 🔎 **곳마다 진짜 HTML 페이지를 만든다.** 검색엔진과 AI 가 읽을 수 있는 문.
//
// 왜 (2026-09-05, docs/홍보-작전.md) — 홍보를 시작하기 전에 재 봤더니
// 구글이 받아 가는 index.html 의 본문이 **0자**였다. 이 앱은 화면을 전부
// 자바스크립트로 그려서, 사람에게는 멀쩡한데 **기계에게는 빈 종이**다.
//
//   · 구글은 자바스크립트를 돌려 주지만 몇 주씩 밀린다
//   · AI 크롤러(GPTBot·ClaudeBot·PerplexityBot)는 아예 못 돌린다
//   · 주소가 하나뿐이라 「광장시장」 검색에 뜰 방법이 구조적으로 없다
//
// 그래서 곳마다 자기 주소를 준다. 검색에 걸릴 문이 1개 → 300개가 넘는다.
//
// 🚨 **얇은 껍데기 페이지(doorway page)를 만들면 안 된다.** 같은 틀에 이름만
//    바꿔 넣은 페이지는 구글이 벌점을 준다. 그리고 그전에 **손님한테 못할 짓**이다 —
//    검색으로 들어온 사람이 아무 내용도 없는 페이지를 만나면 그냥 닫는다.
//    그래서 이 페이지는 **그 자체로 쓸모가 있어야 한다**: 이름(한국어·영어),
//    어디인지, 무엇인지, 사진, 길찾기, 공식 안내, 같은 동네의 다른 곳까지.
//
// 🖼️ 사진은 공공누리 제1유형(한국관광공사)이다 — **출처를 반드시 띄운다.**
//    앱 화면에서 지키는 규칙을 여기서만 안 지킬 수 없다.
//
// 실행 (dist 가 만들어진 **뒤에** 돌린다 — vite build 는 dist 를 지우고 다시 만든다):
//   npm run build
//   npx vite build --ssr scripts/build-place-pages.ts --outDir dist-ssr
//   node dist-ssr/build-place-pages.js
import { mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { ALL_PLACES, ALL_FESTIVALS, CATEGORY_META, type Place } from "../src/data/seed";
import { translateText } from "../src/lib/placeText";
import { getMapLinks } from "../src/lib/mapLinks";
import { galleryShotsFor } from "../src/lib/photoGallery";
// 🚨 구·동 이름은 **여기서 온다.** place-translations.json 에는 장소 이름만 있고
//    행정구역 이름은 없어서, translateText 로는 「종로구」가 그대로 나온다.
//    영어 페이지에 「종로구」가 박혀 있으면 `Jongno` 로 검색하는 사람에게 영영 안 뜬다
//    (앱 화면은 이미 이 표를 쓰고 있었다 — 여기만 안 쓰면 반쪽 적용이다).
import { districtFullName, dongName } from "../src/data/districtNamesEn";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(ROOT, "dist");
const SITE = "https://korea-street.com";

/** 두 목록은 겹친다(축제가 양쪽에 있다) — id 로 한 번만 센다. */
const ALL: Place[] = [
  ...new Map([...ALL_PLACES, ...ALL_FESTIVALS].map((p) => [p.id, p])).values(),
];

// ── 주소(slug) ────────────────────────────────────────────────────────────
//
// 🔒 **한번 정한 주소는 절대 안 바꾼다.** 주소가 바뀌면 그동안 검색이 쌓아 둔 것이
//    통째로 날아가고, 남이 걸어 둔 링크도 다 깨진다. 그래서 id → slug 표를
//    파일로 남겨 두고 **다음 실행은 그 표를 그대로 따른다.**
//    (이 저장소가 id 재사용으로 데어 본 것과 같은 이야기다 — 열쇠는 고정이어야 한다.)
const SLUG_FILE = join(ROOT, "src", "data", "place-slugs.json");
const savedSlugs: Record<string, string> = existsSync(SLUG_FILE)
  ? JSON.parse(readFileSync(SLUG_FILE, "utf-8"))
  : {};

/** 영어 이름을 주소로 쓸 수 있는 모양으로. 한글만 있는 곳은 빈 문자열이 된다. */
function slugify(s: string): string {
  return s
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

const used = new Set(Object.values(savedSlugs));
let newSlugs = 0;
for (const p of ALL) {
  if (savedSlugs[p.id]) continue;
  const en = translateText(p.name, "en");
  // 영어 이름이 없거나 한글뿐이면 id 를 쓴다 — 못생겼지만 **없는 것보다 낫고**,
  // 나중에 번역이 채워져도 주소는 안 바꾼다(위 🔒).
  let base = slugify(en) || slugify(p.id);
  let slug = base;
  for (let i = 2; used.has(slug); i++) slug = `${base}-${i}`;
  savedSlugs[p.id] = slug;
  used.add(slug);
  newSlugs++;
}
writeFileSync(SLUG_FILE, JSON.stringify(savedSlugs, null, 2) + "\n");

// ── HTML 만들기 ───────────────────────────────────────────────────────────
const esc = (s: unknown) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const CATEGORY_EN: Record<string, string> = {
  festival: "Festival",
  market: "Traditional market",
  flower: "Flower walk",
  walk: "Walking path",
  hike: "Hiking trail",
  museum: "Museum",
  street: "Street & alley",
};

const MONTHS = ["", "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"];

/** 「종로구」 → 「Jongno-gu」. 앱 화면과 **같은 표**를 쓴다(위 import 주석). */
const guEn = (gu: string) => districtFullName(gu, "en");
/** 「창신동」 → 「Changsin-dong」. 표에 없으면 한국어 그대로 — 지어내지 않는다. */
const dongEn = (d: string) => dongName(d, "en");

function pageFor(p: Place, sameGu: Place[]): string {
  const slug = savedSlugs[p.id];
  const nameEn = translateText(p.name, "en");
  const noteEn = p.note ? translateText(p.note, "en") : "";
  const kind = CATEGORY_EN[p.category] ?? "Place";
  const photo = p.image ?? p.thumb ?? galleryShotsFor(p.name, p.gu)[0]?.url;
  const [kakao, naver] = getMapLinks(p);
  const url = `${SITE}/place/${slug}/`;
  const showKo = nameEn !== p.name;

  // 설명 한 줄 — 검색 결과에 그대로 뜬다. **지어내지 않고 아는 것만 잇는다.**
  //
  // 🚨 **이름을 반드시 넣는다** (2026-09-05, check-place-pages.mjs 가 잡아 줬다).
  //    처음에는 「{갈래} in {구}, Seoul. {주소}」로만 썼는데, 같은 건물에서 열리는
  //    축제들이 note 가 없다 보니 **설명이 글자 하나까지 똑같아졌다** — 13묶음,
  //    많게는 한 주소에 4장. 구글은 그런 걸 "같은 페이지를 여러 장 만든 것"으로 읽고,
  //    검색 결과에도 똑같은 줄이 나란히 떠서 손님이 뭘 눌러야 할지 모른다.
  //    이름은 곳마다 다르므로 그것만 앞에 세우면 겹침이 사라진다.
  const raw =
    `${nameEn}${showKo ? ` (${p.name})` : ""} — ` +
    (noteEn ? `${noteEn} ` : "") +
    `${kind} in ${guEn(p.gu)}, Seoul.` +
    (p.addr ? ` ${p.addr}` : "");
  // 검색 결과는 160자쯤에서 자른다. 우리가 먼저 **낱말 경계에서** 자르는 편이
  // 말 중간에 잘려 나가는 것보다 낫다.
  const desc =
    raw.length <= 160 ? raw : raw.slice(0, 160).replace(/\s+\S*$/, "") + "…";

  const when =
    p.startMonth != null
      ? p.endMonth != null && p.endMonth !== p.startMonth
        ? `${MONTHS[p.startMonth]}–${MONTHS[p.endMonth]}`
        : MONTHS[p.startMonth]
      : "";

  // 🔗 같은 구의 다른 곳으로 이어 준다. 크롤러는 링크를 타고 다니므로,
  //    페이지들이 서로 이어져 있어야 **다 발견된다.** 섬처럼 떨어져 있으면
  //    사이트맵에 적어도 잘 안 온다. 손님에게도 다음에 갈 곳이 된다.
  const nearby = sameGu
    .filter((q) => q.id !== p.id)
    .slice(0, 8)
    .map(
      (q) =>
        `<li><a href="/place/${savedSlugs[q.id]}/">${esc(translateText(q.name, "en"))}` +
        `<span class="ko"> ${esc(q.name)}</span></a></li>`
    )
    .join("");

  // 📇 구조화 자료 — 구글과 AI 가 "이게 무엇인지" 기계로 읽는 부분이다.
  //    아는 칸만 넣는다. 없는 값을 넣으면 그게 곧 틀린 정보가 된다.
  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": p.category === "festival" ? "Festival" : "TouristAttraction",
    name: nameEn,
    alternateName: p.name,
    url,
    ...(noteEn ? { description: noteEn } : {}),
    ...(photo ? { image: photo } : {}),
    address: {
      "@type": "PostalAddress",
      addressCountry: "KR",
      addressLocality: "Seoul",
      addressRegion: guEn(p.gu),
      ...(p.addr ? { streetAddress: p.addr } : {}),
    },
    ...(p.lat != null && p.lng != null
      ? { geo: { "@type": "GeoCoordinates", latitude: p.lat, longitude: p.lng } }
      : {}),
    ...(p.officialUrl ? { sameAs: p.officialUrl } : {}),
  };

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(nameEn)}${showKo ? ` (${esc(p.name)})` : ""} — ${esc(guEn(p.gu))}, Seoul | K-Street</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="K-Street">
<meta property="og:title" content="${esc(nameEn)}${showKo ? ` · ${esc(p.name)}` : ""}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${esc(photo ?? `${SITE}/share-card.png`)}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/icons/icon-192.png">
<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
<style>
:root{--bg:#faf9f7;--card:#fff;--ink:#17150f;--muted:#6b6559;--line:#e4dfd4;--accent:#c1502e}
@media(prefers-color-scheme:dark){:root{--bg:#111311;--card:#1a1c1a;--ink:#eceae4;--muted:#9b968c;--line:#2c2f2c;--accent:#e8815c}}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.7 -apple-system,BlinkMacSystemFont,"Segoe UI","Noto Sans KR",sans-serif;word-break:keep-all}
.wrap{max-width:640px;margin:0 auto;padding:22px 18px 60px}
a{color:var(--accent)}
header a{display:inline-flex;gap:8px;align-items:center;font-weight:700;text-decoration:none;color:var(--ink);font-size:15px}
.mark{display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:7px;background:var(--accent);color:#fff;font-weight:800}
.kind{display:inline-block;margin:22px 0 6px;padding:3px 11px;border-radius:100px;background:var(--card);border:1px solid var(--line);font-size:12.5px;font-weight:600;color:var(--muted)}
h1{margin:0;font-size:clamp(26px,6.4vw,36px);line-height:1.22;letter-spacing:-.02em}
.ko-name{margin:6px 0 0;font-size:18px;font-weight:600;color:var(--muted)}
figure{margin:20px 0 0}
/* 📐 비율을 못으로 박아 둔다. 사진이 늦게 와도 글이 아래위로 안 튄다.
   ⚠️ 관광공사 사진은 크기가 제각각이라 cover 로 채운다 — 늘리면 찌그러진다. */
figure img{width:100%;aspect-ratio:3/2;object-fit:cover;border-radius:14px;display:block;background:var(--card)}
figcaption{margin-top:6px;font-size:12px;color:var(--muted)}
.note{margin:18px 0 0;font-size:16.5px}
dl{margin:20px 0 0;padding:16px 18px;background:var(--card);border:1px solid var(--line);border-radius:14px;display:grid;grid-template-columns:auto 1fr;gap:8px 16px;font-size:15px}
dt{color:var(--muted);white-space:nowrap}
dd{margin:0}
.go{display:flex;flex-wrap:wrap;gap:8px;margin:20px 0 0}
.go a{flex:1 1 auto;text-align:center;padding:12px 16px;border-radius:11px;text-decoration:none;font-weight:700;font-size:14.5px}
.go .k{background:#FEE500;color:#191919}
.go .n{background:#03C75A;color:#fff}
.go .app{background:var(--ink);color:var(--bg)}
h2{margin:36px 0 0;font-size:16px}
ul{margin:10px 0 0;padding:0;list-style:none;display:grid;gap:7px}
ul a{display:block;padding:11px 14px;background:var(--card);border:1px solid var(--line);border-radius:11px;text-decoration:none;color:var(--ink);font-weight:600;font-size:14.5px}
.ko{color:var(--muted);font-weight:400}
footer{margin-top:40px;padding-top:16px;border-top:1px solid var(--line);font-size:13px;color:var(--muted)}
</style>
</head>
<body>
<div class="wrap">
<header><a href="/"><span class="mark">K</span> K-STREET</a></header>

<span class="kind">${esc(kind)} · ${esc(guEn(p.gu))}</span>
<h1>${esc(nameEn)}</h1>
${showKo ? `<p class="ko-name" lang="ko">${esc(p.name)}</p>` : ""}

${
  photo
    ? // 🕳️ 사진이 죽어 있으면 **칸째로 치운다.** 안 그러면 큰 빈 상자와
      //    "Photo: 한국관광공사"라는 출처만 남아서, 있지도 않은 사진의 출처를
      //    적어 둔 꼴이 된다. 관광공사 썸네일 중 실제로 404 인 것이 있다.
      `<figure><img src="${esc(photo)}" alt="${esc(nameEn)}" loading="lazy" width="1200" height="800"
 onerror="this.closest('figure').remove()">
<figcaption>Photo: Korea Tourism Organization</figcaption></figure>`
    : ""
}

${noteEn ? `<p class="note">${esc(noteEn)}</p>` : ""}

<dl>
<dt>What</dt><dd>${esc(kind)}</dd>
<dt>District</dt><dd>${esc(guEn(p.gu))}${p.dong ? ` · ${esc(dongEn(p.dong))}` : ""}</dd>
${p.addr ? `<dt>Address</dt><dd lang="ko">${esc(p.addr)}</dd>` : ""}
${when ? `<dt>When</dt><dd>${esc(when)} — dates shift each year, check the official notice</dd>` : ""}
${p.officialUrl ? `<dt>Official</dt><dd><a href="${esc(p.officialUrl)}" rel="nofollow noopener">${esc(new URL(p.officialUrl).hostname)}</a></dd>` : ""}
</dl>

<div class="go">
<a class="k" href="${esc(kakao.url)}" rel="nofollow noopener">Open in KakaoMap</a>
<a class="n" href="${esc(naver.url)}" rel="nofollow noopener">Open in Naver Map</a>
</div>
<div class="go"><a class="app" href="/">See more places in Seoul →</a></div>

${nearby ? `<h2>More in ${esc(guEn(p.gu))}</h2><ul>${nearby}</ul>` : ""}

<footer>
K-Street — a free, no-sign-up guide to Seoul's neighbourhoods in 12 languages.<br>
Place data from the Korea Tourism Organization. Photos: Korea Tourism Organization (KOGL Type 1).
</footer>
</div>
</body>
</html>
`;
}

// ── 쓰기 ─────────────────────────────────────────────────────────────────
const byGu = new Map<string, Place[]>();
for (const p of ALL) {
  if (!byGu.has(p.gu)) byGu.set(p.gu, []);
  byGu.get(p.gu)!.push(p);
}

let written = 0;
for (const p of ALL) {
  const dir = join(DIST, "place", savedSlugs[p.id]);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "index.html"), pageFor(p, byGu.get(p.gu) ?? []));
  written++;
}

// 사이트맵을 다시 쓴다 — 손으로 300줄을 적지 않는다.
const urls = [
  `  <url><loc>${SITE}/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>`,
  ...ALL.map(
    (p) => `  <url><loc>${SITE}/place/${savedSlugs[p.id]}/</loc><changefreq>weekly</changefreq><priority>0.7</priority></url>`
  ),
];
writeFileSync(
  join(DIST, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<!-- scripts/build-place-pages.ts 가 만든다. 손으로 고치지 말 것. -->\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`
);

console.log(`✅ 곳 페이지 ${written}장 · 사이트맵 주소 ${urls.length}개`);
if (newSlugs) console.log(`   새 주소 ${newSlugs}개를 src/data/place-slugs.json 에 적었다 — 커밋할 것.`);
