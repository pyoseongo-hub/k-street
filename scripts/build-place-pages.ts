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

// ── 🗂️ 묶음 페이지의 주소 ────────────────────────────────────────────────
//
// 왜 묶음 페이지가 필요한가 (2026-09-08) — 곳 페이지 307장은 **이름으로 검색한
// 사람**만 데려온다. 「광장시장」을 아는 사람 말이다. 그런데 처음 오는 손님은
// 이름을 모른다. 실제로 치는 말은 이렇다:
//
//   "Seoul festivals in October"  ·  "traditional markets in Seoul"
//   "what to do in Jongno"        ·  "hiking trails Seoul"
//
// 그 말에 맞는 페이지가 **한 장도 없었다.** 자료는 이미 달·구·갈래로 나뉘어
// 있으니 페이지만 없던 것이다.
//
// 🚨 얇은 껍데기를 만들지 않는다(곳 페이지와 같은 규칙). 묶음 페이지에는
//    목록만이 아니라 **곳마다 한 줄 설명**과 구별 묶음이 들어간다.
const hubSlugGu = (gu: string) => slugify(guEn(gu));
const hubPathGu = (gu: string) => `seoul/${hubSlugGu(gu)}`;
const hubPathMonth = (m: number) => `seoul/festivals-in-${MONTHS[m].toLowerCase()}`;

/** 갈래 묶음 페이지의 주소와 이름. 없는 갈래는 페이지를 안 만든다. */
const CATEGORY_HUB: Record<string, { slug: string; plural: string }> = {
  festival: { slug: "festivals", plural: "Festivals" },
  market: { slug: "traditional-markets", plural: "Traditional markets" },
  flower: { slug: "flower-walks", plural: "Flower walks" },
  walk: { slug: "walking-paths", plural: "Walking paths" },
  hike: { slug: "hiking-trails", plural: "Hiking trails" },
  museum: { slug: "museums", plural: "Museums" },
  street: { slug: "streets-and-alleys", plural: "Streets & alleys" },
};
const hubPathCategory = (c: string) => `seoul/${CATEGORY_HUB[c]?.slug ?? "places"}`;

/**
 * 「October」 · 「September–October」. 축제가 아니면 빈 문자열.
 *
 * 🚨 **날짜는 절대 안 만든다.** 우리가 아는 것은 "어느 달쯤"까지다
 *    (Place.period 주석 참고 — 지난해 날짜를 올해 것처럼 적으면 손님이 헛걸음한다).
 */
function whenLabel(p: Place): string {
  if (p.startMonth == null) return "";
  return p.endMonth != null && p.endMonth !== p.startMonth
    ? `${MONTHS[p.startMonth]}–${MONTHS[p.endMonth]}`
    : MONTHS[p.startMonth];
}

// 🎨 곳 페이지와 묶음 페이지가 **같은 스타일을 쓴다.** 두 벌로 나누면 한쪽만
//    고쳐 놓고 다른 쪽이 옛날 모양으로 남는다 — 이 저장소가 여러 번 데인 자리다.
const CSS = `
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
/* ── 아래는 묶음 페이지(/seoul/…)에서만 쓴다 ───────────────────────────── */
/* 목록 한 줄마다 이름 밑에 한 줄 설명이 붙는다. 이 한 줄이 있고 없고가
   「쓸모 있는 목록」과 「링크만 늘어놓은 껍데기」를 가른다. */
.meta{display:block;margin-top:3px;font-weight:400;font-size:13px;color:var(--muted);line-height:1.5}
.crumbs{margin:18px 0 0;font-size:13px;color:var(--muted)}
.crumbs a{text-decoration:none}
.chips{display:flex;flex-wrap:wrap;gap:7px;margin:12px 0 0;padding:0;list-style:none}
.chips li{margin:0}
.chips a{display:inline-block;padding:7px 12px;background:var(--card);border:1px solid var(--line);border-radius:100px;text-decoration:none;color:var(--ink);font-size:13.5px;font-weight:600}
`;

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

  const when = whenLabel(p);

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
<style>${CSS}</style>
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

<h2>Browse</h2>
<ul class="chips">
<li><a href="/${hubPathGu(p.gu)}/">Everything in ${esc(guEn(p.gu))}</a></li>
${p.startMonth != null ? `<li><a href="/${hubPathMonth(p.startMonth)}/">Seoul festivals in ${esc(MONTHS[p.startMonth])}</a></li>` : ""}
${CATEGORY_HUB[p.category] ? `<li><a href="/${hubPathCategory(p.category)}/">${esc(CATEGORY_HUB[p.category].plural)} in Seoul</a></li>` : ""}
</ul>

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

// ── 🗂️ 묶음 페이지 ───────────────────────────────────────────────────────
//
// 곳 페이지가 「이름을 아는 사람」을 위한 문이라면, 이쪽은 **이름을 모르는
// 사람**을 위한 문이다. 위 hubPathGu/hubPathMonth 주석에 이유를 적어 뒀다.

/** 목록 한 줄. 이름 + 한글 이름 + 한 줄 설명(갈래·구·달·메모). */
function hubItem(p: Place, showGu = true): string {
  const nameEn = translateText(p.name, "en");
  const showKo = nameEn !== p.name;
  const noteEn = p.note ? translateText(p.note, "en") : "";
  const facts = [
    CATEGORY_EN[p.category] ?? "Place",
    showGu ? guEn(p.gu) + (p.dong ? ` · ${dongEn(p.dong)}` : "") : p.dong ? dongEn(p.dong) : "",
    whenLabel(p),
  ].filter(Boolean);
  // 메모가 있으면 앞에 세운다 — 곳마다 다른 유일한 문장이라 목록이 안 똑같아진다.
  const meta = [noteEn, facts.join(" · ")].filter(Boolean).join(" — ");
  return (
    `<li><a href="/place/${savedSlugs[p.id]}/">${esc(nameEn)}` +
    (showKo ? `<span class="ko" lang="ko"> ${esc(p.name)}</span>` : "") +
    `<span class="meta">${esc(meta)}</span></a></li>`
  );
}

type HubGroup = { heading: string; items: Place[]; showGu?: boolean };

function hubPage(o: {
  path: string;
  kind: string;
  h1: string;
  title: string;
  /** 첫 문단. **아는 사실만** 잇는다 — 여기서 지어내면 그게 곧 틀린 정보다. */
  lead: string;
  desc: string;
  groups: HubGroup[];
  chipsTitle?: string;
  chips?: { href: string; label: string }[];
}): string {
  const url = `${SITE}/${o.path}/`;
  const items = o.groups.flatMap((g) => g.items);

  const ld: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "K-Street", item: `${SITE}/` },
        { "@type": "ListItem", position: 2, name: "Seoul", item: `${SITE}/seoul/` },
        { "@type": "ListItem", position: 3, name: o.h1, item: url },
      ],
    },
  ];
  if (items.length)
    ld.push({
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: o.h1,
      numberOfItems: items.length,
      itemListElement: items.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: translateText(p.name, "en"),
        url: `${SITE}/place/${savedSlugs[p.id]}/`,
      })),
    });

  const body = o.groups
    .filter((g) => g.items.length)
    .map(
      (g) =>
        `<h2>${esc(g.heading)}</h2><ul>${g.items.map((p) => hubItem(p, g.showGu ?? true)).join("")}</ul>`
    )
    .join("\n");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(o.title)}</title>
<meta name="description" content="${esc(o.desc)}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="K-Street">
<meta property="og:title" content="${esc(o.h1)}">
<meta property="og:description" content="${esc(o.desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE}/share-card.png">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/icons/icon-192.png">
<script type="application/ld+json">${JSON.stringify(ld.length === 1 ? ld[0] : ld)}</script>
<style>${CSS}</style>
</head>
<body>
<div class="wrap">
<header><a href="/"><span class="mark">K</span> K-STREET</a></header>

<span class="kind">${esc(o.kind)}</span>
<h1>${esc(o.h1)}</h1>
<p class="note">${esc(o.lead)}</p>
<p class="crumbs"><a href="/seoul/">All of Seoul</a> · <a href="/">Open the app</a></p>

${body}

${
  o.chips?.length
    ? `<h2>${esc(o.chipsTitle ?? "Browse")}</h2><ul class="chips">${o.chips
        .map((c) => `<li><a href="${esc(c.href)}">${esc(c.label)}</a></li>`)
        .join("")}</ul>`
    : ""
}

<div class="go"><a class="app" href="/">Open K-Street — free, no sign-up →</a></div>

<footer>
K-Street — a free, no-sign-up guide to Seoul's neighbourhoods in 12 languages.<br>
Place data from the Korea Tourism Organization. Photos: Korea Tourism Organization (KOGL Type 1).
</footer>
</div>
</body>
</html>
`;
}

// 📅 **어느 해를 적나.** 제목에 연도를 넣는 이유는 손님이 실제로
//    "seoul festivals october 2026" 처럼 연도를 붙여 검색하기 때문이다.
//    이미 지나간 달이면 **다음 해**를 적는다 — 11월에 10월 페이지를 여는
//    사람은 내년 10월을 계획하는 사람이다. 배포할 때마다 다시 계산된다.
const NOW = new Date();
const yearForMonth = (m: number) => (m >= NOW.getMonth() + 1 ? NOW.getFullYear() : NOW.getFullYear() + 1);

const list = (n: number, one: string, many = one + "s") => `${n} ${n === 1 ? one : many}`;

/**
 * 「4 traditional markets, 3 festivals, 1 hiking trail」 — 있는 갈래만 센다.
 *
 * ⚠️ 복수형을 **뒤에 s 를 붙여서 만들지 않는다.** 그렇게 했더니
 *    "3 street & alleys" 가 나왔다(맞는 말은 "streets & alleys"). 갈래마다
 *    올바른 복수형을 CATEGORY_HUB 에 적어 두고 그걸 쓴다.
 */
function countByKind(items: Place[], max = 0): string {
  const n = new Map<string, number>();
  for (const p of items) n.set(p.category, (n.get(p.category) ?? 0) + 1);
  const parts = [...n.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([c, k]) => `${k} ${(k === 1 ? CATEGORY_EN[c] ?? "place" : CATEGORY_HUB[c]?.plural ?? "places").toLowerCase()}`);
  // 검색 결과 한 줄에 넣을 때는 앞의 몇 개만 — 다 적으면 잘려서 문장이 끊긴다.
  if (max && parts.length > max) return `${parts.slice(0, max).join(", ")} and more`;
  return parts.join(", ");
}

/**
 * 검색 결과에 뜨는 한 줄은 160자쯤에서 잘린다. **낱말 경계에서 우리가 먼저** 자른다
 * (곳 페이지가 이미 같은 규칙을 쓴다 — 잣대를 둘로 만들지 않는다).
 */
const clip = (s: string) => (s.length <= 160 ? s : s.slice(0, 160).replace(/\s+\S*$/, "") + "…");

const GU_LIST = [...byGu.keys()].sort((a, b) => guEn(a).localeCompare(guEn(b)));
const guChips = GU_LIST.map((gu) => ({ href: `/${hubPathGu(gu)}/`, label: guEn(gu) }));

// 달별 — 축제가 있는 달만. 걸쳐 있는 축제는 두 달 모두에 나온다(앱 화면과 같은 규칙).
const festivalsIn = (m: number) =>
  ALL.filter((p) => p.startMonth != null && m >= p.startMonth && m <= (p.endMonth ?? p.startMonth)).sort(
    (a, b) => guEn(a.gu).localeCompare(guEn(b.gu)) || translateText(a.name, "en").localeCompare(translateText(b.name, "en"))
  );
const MONTHS_WITH = [...Array(12).keys()].map((i) => i + 1).filter((m) => festivalsIn(m).length);
const monthChips = MONTHS_WITH.map((m) => ({ href: `/${hubPathMonth(m)}/`, label: MONTHS[m] }));

const hubs: { path: string; html: string }[] = [];

for (const m of MONTHS_WITH) {
  const items = festivalsIn(m);
  const gus = new Set(items.map((p) => p.gu));
  const year = yearForMonth(m);
  hubs.push({
    path: hubPathMonth(m),
    html: hubPage({
      path: hubPathMonth(m),
      kind: "By month",
      h1: `Seoul festivals in ${MONTHS[m]}`,
      title: `Seoul Festivals in ${MONTHS[m]} ${year} — ${list(items.length, "festival")} | K-Street`,
      // 🚨 "그 달에 열린다"까지만 말한다. 날짜를 말하는 순간 틀린 정보가 된다.
      lead:
        `${list(items.length, "festival")} in ${list(gus.size, "district")} of Seoul are usually held in ${MONTHS[m]}. ` +
        `We list the month, not the exact dates — organisers set those anew each year, so open the official notice before you go. ` +
        `Every entry has KakaoMap and Naver Map directions, and the Korean name to show a taxi driver.`,
      desc: clip(`${list(items.length, "festival")} usually held in ${MONTHS[m]} across ${list(gus.size, "district")} of Seoul — with Korean names, districts and map directions.`),
      groups: [...new Set(items.map((p) => p.gu))]
        .sort((a, b) => guEn(a).localeCompare(guEn(b)))
        .map((gu) => ({ heading: guEn(gu), items: items.filter((p) => p.gu === gu), showGu: false })),
      chipsTitle: "Other months",
      chips: monthChips.filter((c) => c.label !== MONTHS[m]),
    }),
  });
}

// 구별
for (const gu of GU_LIST) {
  const items = (byGu.get(gu) ?? [])
    .slice()
    .sort((a, b) => a.category.localeCompare(b.category) || translateText(a.name, "en").localeCompare(translateText(b.name, "en")));
  hubs.push({
    path: hubPathGu(gu),
    html: hubPage({
      path: hubPathGu(gu),
      kind: "By district",
      h1: `What to see in ${guEn(gu)}, Seoul`,
      title: `${guEn(gu)}, Seoul — ${list(items.length, "place")} to see | K-Street`,
      lead:
        // ⚠️ "주소도 다 있다"고 쓰지 않는다 — 주소는 관광공사에서 받은 곳에만 있다.
        //    한 곳이라도 없으면 그 문장은 거짓말이 된다.
        `${guEn(gu)} (${gu}) has ${list(items.length, "place")} in K-Street: ${countByKind(items)}. ` +
        `Every entry keeps its Korean name to show a taxi driver, and opens straight into KakaoMap or Naver Map directions — ` +
        `Google Maps cannot give walking or driving directions inside Korea.`,
      desc: clip(`${guEn(gu)}, Seoul: ${countByKind(items, 3)}. Korean names and KakaoMap / Naver Map directions for every place.`),
      groups: [...new Set(items.map((p) => p.category))].map((c) => ({
        heading: `${CATEGORY_HUB[c]?.plural ?? CATEGORY_EN[c] ?? "Places"} in ${guEn(gu)}`,
        items: items.filter((p) => p.category === c),
        showGu: false,
      })),
      chipsTitle: "Other districts",
      chips: guChips.filter((c) => c.label !== guEn(gu)),
    }),
  });
}

// 갈래별
for (const [cat, meta] of Object.entries(CATEGORY_HUB)) {
  const items = ALL.filter((p) => p.category === cat).sort(
    (a, b) => guEn(a.gu).localeCompare(guEn(b.gu)) || translateText(a.name, "en").localeCompare(translateText(b.name, "en"))
  );
  if (!items.length) continue;
  const gus = [...new Set(items.map((p) => p.gu))].sort((a, b) => guEn(a).localeCompare(guEn(b)));
  hubs.push({
    path: hubPathCategory(cat),
    html: hubPage({
      path: hubPathCategory(cat),
      kind: "By kind",
      h1: `${meta.plural} in Seoul`,
      title: `${meta.plural} in Seoul — ${items.length} across ${list(gus.length, "district")} | K-Street`,
      lead:
        `${list(items.length, (CATEGORY_EN[cat] ?? "place").toLowerCase(), meta.plural.toLowerCase())} across ${list(gus.length, "district")} of Seoul, ` +
        `listed by district with their Korean names. ` +
        (cat === "festival"
          ? `Dates shift every year, so we list the month and link the official notice.`
          : `Every entry opens straight into KakaoMap or Naver Map directions.`),
      desc: clip(`${meta.plural} in Seoul — ${items.length} places in ${list(gus.length, "district")}, with Korean names and map directions.`),
      groups: gus.map((gu) => ({ heading: guEn(gu), items: items.filter((p) => p.gu === gu), showGu: false })),
      chipsTitle: "Other kinds",
      chips: Object.entries(CATEGORY_HUB)
        .filter(([c]) => c !== cat && ALL.some((p) => p.category === c))
        .map(([c, m]) => ({ href: `/${hubPathCategory(c)}/`, label: m.plural })),
    }),
  });
}

// 묶음 페이지의 대문 — 크롤러가 여기 한 장만 봐도 나머지를 다 찾아간다.
hubs.push({
  path: "seoul",
  html: hubPage({
    path: "seoul",
    kind: "Index",
    h1: "Seoul by district, month and kind",
    title: `Seoul by District, Month and Kind — ${ALL.length} places | K-Street`,
    lead:
      `${list(ALL.length, "place")} in ${list(GU_LIST.length, "district")} of Seoul: ${countByKind(ALL)}. ` +
      `Pick a district, a month, or a kind of place. Everything here is free, needs no sign-up, and comes with Korean names for taxis and shops.`,
    desc: clip(`All of Seoul in K-Street: ${countByKind(ALL, 3)} across ${list(GU_LIST.length, "district")} — browse by district, by month, or by kind.`),
    groups: [],
    chipsTitle: "By district",
    chips: [
      ...guChips,
      ...monthChips.map((c) => ({ href: c.href, label: `Festivals in ${c.label}` })),
      ...Object.entries(CATEGORY_HUB)
        .filter(([c]) => ALL.some((p) => p.category === c))
        .map(([c, m]) => ({ href: `/${hubPathCategory(c)}/`, label: m.plural })),
    ],
  }),
});

for (const h of hubs) {
  const dir = join(DIST, ...h.path.split("/"));
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "index.html"), h.html);
}

// 사이트맵을 다시 쓴다 — 손으로 300줄을 적지 않는다.
const urls = [
  `  <url><loc>${SITE}/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>`,
  // 묶음 페이지를 곳 페이지보다 **위에** 둔다. 크롤러가 먼저 보는 순서이기도 하고,
  // 이 페이지들이 나머지 307장으로 가는 길이라 먼저 발견될수록 좋다.
  ...hubs.map(
    (h) => `  <url><loc>${SITE}/${h.path}/</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>`
  ),
  ...ALL.map(
    (p) => `  <url><loc>${SITE}/place/${savedSlugs[p.id]}/</loc><changefreq>weekly</changefreq><priority>0.7</priority></url>`
  ),
];
writeFileSync(
  join(DIST, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<!-- scripts/build-place-pages.ts 가 만든다. 손으로 고치지 말 것. -->\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`
);

console.log(`✅ 곳 페이지 ${written}장 · 묶음 페이지 ${hubs.length}장 · 사이트맵 주소 ${urls.length}개`);
if (newSlugs) console.log(`   새 주소 ${newSlugs}개를 src/data/place-slugs.json 에 적었다 — 커밋할 것.`);
