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
import { ALL_PLACES, ALL_FESTIVALS, type Place } from "../src/data/seed";
import { translateText } from "../src/lib/placeText";
import { getMapLinks } from "../src/lib/mapLinks";
import { galleryShotsFor } from "../src/lib/photoGallery";
// 🚨 구·동 이름은 **여기서 온다.** place-translations.json 에는 장소 이름만 있고
//    행정구역 이름은 없어서, translateText 로는 「종로구」가 그대로 나온다.
//    영어 페이지에 「종로구」가 박혀 있으면 `Jongno` 로 검색하는 사람에게 영영 안 뜬다
//    (앱 화면은 이미 이 표를 쓰고 있었다 — 여기만 안 쓰면 반쪽 적용이다).
import { districtFullName, dongName } from "../src/data/districtNamesEn";
// 🍚 밥집 쪽으로 잇는 주소는 **표 한 장**에서만 온다(src/lib/partnerLinks.ts).
import { eatNearbyUrl } from "../src/lib/partnerLinks";
// 🗓️ 이름에 지난 연도가 박힌 행사(「2025 서울한옥위크」)를 가려내는 잣대.
//    앱과 이 생성기가 **같은 함수**를 쓴다 — 잣대가 둘이면 한쪽만 고치게 된다.
import { pastEditionYear } from "../src/lib/pastEdition";
// 🧳 짐 보관 안내 (2026-09-10). 글은 luggage-strings, 링크는 luggage-links 에 있다 —
//    링크는 **전부 러너에서 두드려 본 것만** 들어 있다.
import { LUGGAGE_STRINGS } from "./lib/luggage-strings";
import { LUGGAGE_AREAS, type LuggageCandidate } from "./lib/luggage-picks";
import {
  OFFICIAL_BRANCHES,
  OFFICIAL_PRICES,
  OFFICIAL_BASE_HOURS,
  OFFICIAL_EXTRA_PER_HOUR,
  OFFICIAL_OPEN,
  OFFICIAL_CLOSE,
  OFFICIAL_CHECKED,
  OFFICIAL_PAGE,
  BOOKING_SITE,
  BOOKING_SITE_BY_LANG,
  LOCKER_PAGE,
  LOCKER_STATIONS,
  LOCKER_CELLS,
  LOCKER_SIZES,
  LOCKER_BASE_HOURS,
  LOCKER_OPEN,
  LOCKER_CLOSE,
  LOCKER_MAX_DAYS,
  LOCKER_APP_ANDROID,
  LOCKER_APP_IPHONE,
} from "./lib/luggage-official";
import LUGGAGE_CANDIDATES from "../src/data/luggage-candidates.json";
import NEAREST_STATION from "../src/data/nearest-station.json";
import {
  officialLinks,
  AIRPORT_LINKS,
  BOOKED_SERVICES,
  LINKS_CHECKED,
} from "./lib/luggage-links";
// 🌏 12개 언어. 곳 이름·메모는 place-translations.json 에서(translateText),
//    틀에 박히는 낱말은 여기서 온다(scripts/lib/page-strings.ts).
import { getTranslations, type Language } from "../src/lib/translations";
import {
  PAGE_STRINGS,
  PAGE_LANGS,
  langPath,
  HUB_STRINGS,
  HUB_LANGS,
  hubLang,
  type HubStrings,
} from "./lib/page-strings";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(ROOT, "dist");
const SITE = "https://korea-street.com";

/**
 * 🖼️ **검색 결과에 사진을 크게 띄우라고 허락하는 줄** (2026-09-11).
 *
 * 이 줄이 없으면 구글은 사진을 **엄지손톱만 하게** 띄우거나 아예 안 띄운다.
 * 기본값이 그렇다 — 허락한 적이 없으니 조심스럽게 구는 것이다.
 * 4,225장에 사진을 붙여 놓고 **그 사진을 보여 줄 허락을 안 해 둔 상태**였다.
 *
 * · `max-image-preview:large` — 큰 사진을 허락한다. **구글 디스커버**(안드로이드
 *   크롬 첫 화면에 뜨는 추천 글)는 큰 사진이 없으면 아예 후보에 안 넣는다.
 *   손님이 「서울 축제」를 검색하지 않아도 우리 글이 먼저 찾아갈 수 있는 유일한 길이다.
 * · `max-snippet:-1` — 설명 글의 길이 제한을 푼다. 우리 설명은 짧아서 잘릴 일이
 *   없지만, 막아 둘 이유도 없다.
 *
 * ⚠️ `index, follow` 는 기본값과 같다. 그래도 적어 두는 이유는, 다음 사람이
 *    이 줄을 보고 **"여기가 검색 허락을 다루는 자리"**임을 알게 하려는 것이다.
 *    (`noindex` 로 바꾸면 그 페이지가 검색에서 통째로 사라진다 — 404 페이지가
 *     바로 그렇게 해 뒀다. 실수로 여기에 넣지 말 것.)
 */
const ROBOTS = '<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">';

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

/**
 * 갈래 묶음 페이지의 주소와 이름. 없는 갈래는 페이지를 안 만든다.
 *
 * 🚨 **slug 는 언어와 무관하다.** 일본어 페이지도 `/ja/seoul/traditional-markets/` 다.
 *    주소를 언어마다 번역하면(`/ja/seoul/伝統市場/`) 링크가 깨지기 쉽고,
 *    나중에 표기를 다듬을 때마다 주소가 바뀐다 — 저장소 규칙: 한번 정한 주소는 안 바꾼다.
 */
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
/** 「October」/「10月」 — 달 이름 한 개. 앱이 가진 표를 쓴다(잣대를 둘로 만들지 않는다). */
const monthLabel = (m: number, lang: Language): string =>
  lang === "en" ? MONTHS[m] : String((getTranslations(lang).months as Record<number, string>)[m]);

function whenLabel(p: Place, lang: Language = "en"): string {
  if (p.startMonth == null) return "";
  // 달 이름은 앱이 이미 12개 언어를 갖고 있다(T.months) — 여기서 또 만들지 않는다.
  const m = lang === "en" ? MONTHS : getTranslations(lang).months;
  const one = (n: number) => String(lang === "en" ? MONTHS[n] : (m as Record<number, string>)[n]);
  return p.endMonth != null && p.endMonth !== p.startMonth
    ? `${one(p.startMonth)}–${one(p.endMonth)}`
    : one(p.startMonth);
}

// 🎨 곳 페이지와 묶음 페이지가 **같은 스타일을 쓴다.** 두 벌로 나누면 한쪽만
//    고쳐 놓고 다른 쪽이 옛날 모양으로 남는다 — 이 저장소가 여러 번 데인 자리다.
const CSS = `
:root{--bg:#faf9f7;--card:#fff;--ink:#17150f;--muted:#6b6559;--line:#e4dfd4;--accent:#c1502e}
@media(prefers-color-scheme:dark){:root{--bg:#111311;--card:#1a1c1a;--ink:#eceae4;--muted:#9b968c;--line:#2c2f2c;--accent:#e8815c}}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.7 -apple-system,BlinkMacSystemFont,"Segoe UI","Noto Sans KR",sans-serif;word-break:keep-all;overflow-wrap:break-word}
/* ⚠️ keep-all 은 **한국어 전용**이다. 한국어는 띄어쓰기가 있어서 낱말이 안 쪼개지는 게 예쁘지만,
   일본어·중국어는 띄어쓰기가 없어 keep-all 을 걸면 **한 문장이 통째로 한 낱말**이 된다.
   2026-09-10에 일본어 짐 보관 안내가 폰 폭(390px)에서 **215px 가로로 넘쳤다.**
   글자가 화면 밖으로 나가서 손님이 옆으로 밀어야 읽혔다. lang 을 보고 갈라 준다.

   💡 **둘 중 하나만 있어도 안 넘친다** (재 봤다 — scripts/check-phone-width.mjs):
     · word-break:normal        — 제대로 된 고침. 일본어·중국어를 글자 사이에서 접는다
     · overflow-wrap:break-word — 그물. 다른 언어의 긴 주소처럼 접을 자리가
       없는 것이 나와도 화면 밖으로는 안 나간다
   그물만 믿지 않는다. 그물은 "안 넘치게"만 하지 **읽기 좋게** 하지는 않는다. */
html[lang^="ja"] body,html[lang^="zh"] body{word-break:normal}
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
/* 🍚 밥집 링크는 우리 앱 단추보다 조용하게 — 남의 집으로 보내는 문이라 주인공이 아니다. */
.go .eat{background:var(--card);border:1px solid var(--line);color:var(--ink)}
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

/**
 * 🌏 **hreflang** — "같은 내용의 다른 언어판"이라고 구글에게 알려 준다.
 *
 * 🚨 이게 없으면 구글은 12개 언어판을 **같은 페이지를 12번 만든 것**으로 보고
 *    하나만 남기고 나머지를 버린다(중복 콘텐츠). 있으면 나라·언어에 맞는 판을
 *    골라서 보여 준다 — 일본에서 검색하면 일본어판이 뜬다.
 *
 * ⚠️ **모든 언어판이 서로를 다 가리켜야 한다**(자기 자신 포함). 한쪽만 가리키면
 *    구글이 무시한다. x-default 는 어느 언어도 안 맞을 때 보여 줄 판 — 영어다.
 */
function hreflang(rest: string): string {
  return (
    PAGE_LANGS.map(
      (l) => `<link rel="alternate" hreflang="${l}" href="${SITE}/${langPath(l, rest)}">`
    ).join("\n") +
    `\n<link rel="alternate" hreflang="x-default" href="${SITE}/${rest}">`
  );
}

/**
 * 묶음 페이지의 hreflang — **있는 언어만 적는다** (2026-09-10).
 *
 * 🚨 곳 페이지와 목록이 다르다. 곳 페이지는 12개 언어가 다 있지만 묶음은
 *    아직 영어·일어·중국어(간체·번체) 넷뿐이다. 여기에 12개를 적으면
 *    **없는 페이지 8장을 가리킨다** — 구글이 404 를 8번 받고, hreflang 묶음
 *    자체를 못 믿는 것으로 처리한다. 있는 것만 적는 게 안 적는 것보다 낫고,
 *    없는 것을 적는 것보다 훨씬 낫다. HUB_LANGS 에 언어를 더하면 여기도 늘어난다.
 */
function hubHreflang(path: string): string {
  return (
    HUB_LANGS.map(
      (l) => `<link rel="alternate" hreflang="${l}" href="${SITE}/${langPath(l, `${path}/`)}">`
    ).join("\n") +
    `\n<link rel="alternate" hreflang="x-default" href="${SITE}/${path}/">`
  );
}

/**
 * 🚇 **가장 가까운 지하철역 한 줄.** (2026-09-10, 사장님 지시)
 *
 *   "가까운 지하철역 없으면 소비자가 알아야지 거긴 없구나
 *    / 대부분 지하 타니 가까운 지하철"
 *
 * 이 자리라야 손님이 **「지금 역에서 맡기고 갈까, 가서 맡길까」**를 정할 수 있다.
 * 홈 화면에 카드를 두면 아직 목적지를 안 정한 상태라 그 판단이 안 된다.
 *
 * 🚨 **역이 멀면 그것도 적는다.** 빈칸으로 두면 손님은 "이 앱이 모르는구나"로
 *    읽지만, "여긴 역이 없습니다"라고 적으면 **미리 맡기고 오라는 답**이 된다.
 * 🚨 「보관함이 **있습니다**」라고 하지 않는다 — 273역 / 약 340역이다.
 *    「있을 수 있습니다」가 아는 것과 모르는 것의 경계다.
 * ⚠️ 자료가 아직 없는 곳은 **조용히 아무것도 안 그린다** —
 *    「역이 없다」와 「우리가 아직 안 알아봤다」는 다른 말이다.
 */
function stationHtml(id: string, lang: Language): string {
  const rows = (NEAREST_STATION as { 곳: Record<string, { station?: string; dist?: number; none?: boolean }> }).곳;
  const r = rows[id];
  if (!r) return "";
  const S2 = PAGE_STRINGS[lang];
  if (r.none) return `<dt>${esc(S2.stationHeading)}</dt><dd>${esc(S2.stationNone)}</dd>`;
  if (!r.station || r.dist == null) return "";
  // 📱 **여기서 앱을 안내한다** (2026-09-10 사장님: "어플을 안내해").
  //    사장님 말씀이 이 기능의 경계를 정해 줬다 —
  //      "이거는 어플이 우리보다 서비스 질이 좋아 / 우리는 가까운 역까지만 안내하는 게 답이야
  //       / 남은 락커를 우리가 관리할 수 없잖아"
  //    그래서 **우리는 역까지, 빈 칸 수는 앱**이다. 우리가 못 지키는 숫자는 적지 않는다.
  // ⚠️ 앱 이름 글자는 짐 보관 안내(LUGGAGE_STRINGS)에 이미 12개 언어로 있다.
  //    여기에 또 적으면 **둘이 어긋나는 날**이 온다. 하나만 둔다.
  const A = LUGGAGE_STRINGS[lang];
  return (
    `<dt>${esc(S2.stationHeading)}</dt>` +
    `<dd>${esc(S2.stationLine(r.station, r.dist))}` +
    `<br><span class="note">${esc(S2.stationLocker)}</span>` +
    `<br><span class="note">` +
    `<a href="${esc(LOCKER_APP_ANDROID)}" rel="nofollow noopener" target="_blank">${esc(A.appAndroid)} ↗</a>` +
    ` · ` +
    `<a href="${esc(LOCKER_APP_IPHONE)}" rel="nofollow noopener" target="_blank">${esc(A.appIphone)} ↗</a>` +
    `</span></dd>`
  );
}

function pageFor(p: Place, sameGu: Place[], lang: Language = "en"): string {
  const slug = savedSlugs[p.id];
  const S = PAGE_STRINGS[lang];
  const T = getTranslations(lang);
  // 🗂️ 묶음 페이지로 갈 때 쓰는 언어. 그 언어에 묶음이 없으면 영어로 간다.
  //    2026-09-10에 12개 언어가 다 차서 지금은 늘 자기 언어로 가지만, 새 언어를
  //    곳 페이지에만 먼저 넣는 일이 또 생길 수 있으므로 이 갈림은 남겨 둔다.
  const HL = hubLang(lang);
  // 이름에 지난 연도가 박혔나 — 「2025 서울한옥위크」 같은 것.
  const pastYear = pastEditionYear(p.name);
  const HS = HUB_STRINGS[HL] as HubStrings;
  // 구 이름도 앱과 **같은 표**를 쓴다 — 「종로구」/「Jongno-gu」/「鍾路区」.
  const guName = districtFullName(p.gu, lang);
  const title = translateText(p.name, lang);
  const note = p.note ? translateText(p.note, lang) : "";
  // 갈래 이름 — 영어는 곳 페이지에 어울리는 단수형(「Traditional market」)을 쓰고,
  // 나머지 언어는 앱이 이미 가진 딱지를 그대로 쓴다(시장·축제·박물관…).
  const kind =
    (lang === "en" ? CATEGORY_EN[p.category] : T.categoryLabels[p.category]) ??
    CATEGORY_EN[p.category] ??
    "Place";
  const photo = p.image ?? p.thumb ?? galleryShotsFor(p.name, p.gu)[0]?.url;
  const [kakao, naver] = getMapLinks(p);
  // 🍚 밥집 — 손님 언어를 그대로 넘긴다(대만은 zhTW 로 갈아 끼운다).
  const eatHref = eatNearbyUrl(p.gu, lang);
  const url = `${SITE}/${langPath(lang, `place/${slug}/`)}`;
  const showKo = title !== p.name;

  // 설명 한 줄 — 검색 결과에 그대로 뜬다. **지어내지 않고 아는 것만 잇는다.**
  //
  // 🚨 **이름을 반드시 넣는다** (2026-09-05, check-place-pages.mjs 가 잡아 줬다).
  //    처음에는 「{갈래} in {구}, Seoul. {주소}」로만 썼는데, 같은 건물에서 열리는
  //    축제들이 note 가 없다 보니 **설명이 글자 하나까지 똑같아졌다** — 13묶음,
  //    많게는 한 주소에 4장. 구글은 그런 걸 "같은 페이지를 여러 장 만든 것"으로 읽고,
  //    검색 결과에도 똑같은 줄이 나란히 떠서 손님이 뭘 눌러야 할지 모른다.
  //    이름은 곳마다 다르므로 그것만 앞에 세우면 겹침이 사라진다.
  //    🌏 영어는 문장으로 쓰고(「Traditional market in Jongno-gu, Seoul.」),
  //       나머지 언어는 **가운뎃점으로 잇는다.** 언어마다 어순·조사가 달라
  //       문장 틀을 옮기면 어색해지는데, 이름·갈래·동네는 그대로 붙여도 읽힌다.
  const raw =
    lang === "en"
      ? `${title}${showKo ? ` (${p.name})` : ""} — ` +
        (note ? `${note} ` : "") +
        `${kind} in ${guEn(p.gu)}, Seoul.` +
        (p.addr ? ` ${p.addr}` : "")
      : [`${title}${showKo ? ` (${p.name})` : ""}`, note, `${kind} · ${guName}`, p.addr]
          .filter(Boolean)
          .join(" · ");
  // 검색 결과는 160자쯤에서 자른다. 우리가 먼저 **낱말 경계에서** 자르는 편이
  // 말 중간에 잘려 나가는 것보다 낫다.
  const desc =
    raw.length <= 160 ? raw : raw.slice(0, 160).replace(/\s+\S*$/, "") + "…";

  const when = whenLabel(p, lang);

  // 🔗 같은 구의 다른 곳으로 이어 준다. 크롤러는 링크를 타고 다니므로,
  //    페이지들이 서로 이어져 있어야 **다 발견된다.** 섬처럼 떨어져 있으면
  //    사이트맵에 적어도 잘 안 온다. 손님에게도 다음에 갈 곳이 된다.
  const nearby = sameGu
    .filter((q) => q.id !== p.id)
    .slice(0, 8)
    .map(
      (q) =>
        `<li><a href="/${langPath(lang, `place/${savedSlugs[q.id]}/`)}">${esc(translateText(q.name, lang))}` +
        `<span class="ko"> ${esc(q.name)}</span></a></li>`
    )
    .join("");

  // 📇 구조화 자료 — 구글과 AI 가 "이게 무엇인지" 기계로 읽는 부분이다.
  //    아는 칸만 넣는다. 없는 값을 넣으면 그게 곧 틀린 정보가 된다.
  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": p.category === "festival" ? "Festival" : "TouristAttraction",
    name: title,
    alternateName: p.name,
    url,
    ...(note ? { description: note } : {}),
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

  // 🍞 **길 표시**(BreadcrumbList) — 검색 결과에서 주소 대신
  //    「K-Street › Seoul › Jongno-gu › Gwangjang Market」로 뜬다.
  //    긴 주소보다 읽기 쉬워 눌릴 확률이 올라가고, 구별 페이지가 이 곳의
  //    **윗자리**라는 것도 구글에게 알려 준다(묶음 페이지가 그만큼 세진다).
  const crumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "K-Street", item: `${SITE}/` },
      { "@type": "ListItem", position: 2, name: S.seoul, item: `${SITE}/${langPath(HL, "seoul/")}` },
      // 묶음 페이지는 아직 영어만 있다 — 길 표시는 그 영어 페이지를 가리킨다.
      { "@type": "ListItem", position: 3, name: guName, item: `${SITE}/${langPath(HL, `${hubPathGu(p.gu)}/`)}` },
      { "@type": "ListItem", position: 4, name: title, item: url },
    ],
  };

  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}${showKo ? ` (${esc(p.name)})` : ""} — ${esc(guName)}, ${esc(S.seoul)} | K-Street</title>
<meta name="description" content="${esc(desc)}">
${ROBOTS}
<link rel="canonical" href="${url}">
${hreflang(`place/${slug}/`)}
<meta property="og:type" content="website">
<meta property="og:site_name" content="K-Street">
<meta property="og:title" content="${esc(title)}${showKo ? ` · ${esc(p.name)}` : ""}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${esc(photo ?? `${SITE}/share-card.png`)}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/icons/icon-192.png">
<script type="application/ld+json">${JSON.stringify([jsonLd, crumbs])}</script>
<style>${CSS}</style>
</head>
<body>
<div class="wrap">
<header><a href="/"><span class="mark">K</span> K-STREET</a></header>

<span class="kind">${esc(kind)} · ${esc(guName)}</span>
<h1>${esc(title)}</h1>
${showKo ? `<p class="ko-name" lang="ko">${esc(p.name)}</p>` : ""}

${
  photo
    ? // 🕳️ 사진이 죽어 있으면 **칸째로 치운다.** 안 그러면 큰 빈 상자와
      //    "Photo: 한국관광공사"라는 출처만 남아서, 있지도 않은 사진의 출처를
      //    적어 둔 꼴이 된다. 관광공사 썸네일 중 실제로 404 인 것이 있다.
      `<figure><img src="${esc(photo)}" alt="${esc(title)}" loading="lazy" width="1200" height="800"
 onerror="this.closest('figure').remove()">
<figcaption>${esc(T.photoCredit)}</figcaption></figure>`
    : ""
}

${note ? `<p class="note">${esc(note)}</p>` : ""}

<dl>
<dt>${esc(S.what)}</dt><dd>${esc(kind)}</dd>
<dt>${esc(S.district)}</dt><dd>${esc(guName)}${p.dong ? ` · ${esc(dongName(p.dong, lang))}` : ""}</dd>
${p.addr ? `<dt>${esc(S.address)}</dt><dd lang="ko">${esc(p.addr)}</dd>` : ""}
${when ? `<dt>${esc(S.when)}</dt><dd>${esc(when)} — ${esc(S.datesShift)}</dd>` : ""}
${
  // 🗓️ 이름에 지난 연도가 박힌 행사 — **아는 것만 말한다.**
  //    「2025년에 열렸다」는 아는 사실이고, 「2026년에도 열린다」는 모르는 일이다.
  //    지우지도 않고 올해 것처럼 보여 주지도 않는다.
  pastYear
    ? `<dt>${esc(S.when)}</dt><dd><strong>${esc(S.pastEdition(pastYear))}</strong></dd>`
    : ""
}
${p.officialUrl ? `<dt>${esc(S.official)}</dt><dd><a href="${esc(p.officialUrl)}" rel="nofollow noopener">${esc(new URL(p.officialUrl).hostname)}</a></dd>` : ""}
${
  // 🚇 **가장 가까운 지하철역** (2026-09-10, 사장님 지시).
  //    "가까운 지하철역 없으면 소비자가 알아야지 거긴 없구나 / 대부분 지하 타니 가까운 지하철"
  //
  //    이 자리라야 손님이 **「지금 역에서 맡기고 갈까, 가서 맡길까」**를 정할 수 있다.
  //    홈 화면에 카드를 두면 아직 목적지를 안 정한 상태라 그 판단이 안 된다.
  //
  //    🚨 **역이 멀면 그것도 적는다.** 빈칸으로 두면 손님은 "이 앱이 모르는구나"로
  //       읽지만, "여긴 역이 없습니다"라고 적으면 **미리 맡기고 오라는 답**이 된다.
  //    🚨 「보관함이 **있습니다**」라고 하지 않는다 — 273역 / 약 340역이다.
  stationHtml(p.id, lang)
}
</dl>

<div class="go">
<a class="k" href="${esc(kakao.url)}" rel="nofollow noopener">${esc(T.kakaoMapLabel)}</a>
<a class="n" href="${esc(naver.url)}" rel="nofollow noopener">${esc(T.naverMapLabel)}</a>
</div>
${
  // 🍚 밥 먹을 곳 — **지도 버튼 바로 아래**다. 이 곳을 어떻게 가는지 다음에 오는
  //    물음이 「그럼 밥은?」이기 때문이다. 동네를 알면 동네로(홍대·광장시장…),
  //    모르면 그 구로 보낸다. 아직 안 켰으면 null 이라 아무것도 안 그린다.
  eatHref
    ? `<div class="go"><a class="eat" href="${esc(eatHref)}" rel="noopener">${esc(S.eatIn(guName))}</a></div>`
    : ""
}
<div class="go"><a class="app" href="/">${esc(S.openApp)}</a></div>

${nearby ? `<h2>${esc(S.moreIn(guName))}</h2><ul>${nearby}</ul>` : ""}

<h2>${esc(S.browse)}</h2>
<ul class="chips">
<li><a href="/${langPath(HL, `${hubPathGu(p.gu)}/`)}">${esc(S.everythingIn(guName))}</a></li>
${
  // 🌏 **묶음 페이지가 있는 언어로 보낸다** (2026-09-10).
  //    전에는 「영어 페이지에만 딱지를 건다」였다 — 묶음이 영어뿐이라
  //    일본어 손님을 영어 목록으로 보내면 거기서 끊기기 때문이었다.
  //    이제 일어·중국어 묶음이 있으니 그 언어로 보내고, 아직 없는 언어(ko·vi·es…)는
  //    **딱지를 아예 안 건다** — 영어로 떨어뜨리는 것보다 안 보여 주는 게 낫다.
  HUB_LANGS.includes(lang)
    ? (p.startMonth != null
        ? `<li><a href="/${langPath(HL, `${hubPathMonth(p.startMonth)}/`)}">${esc(HS.monthH1(monthLabel(p.startMonth, lang)))}</a></li>`
        : "") +
      (CATEGORY_HUB[p.category]
        ? `<li><a href="/${langPath(HL, `${hubPathCategory(p.category)}/`)}">${esc(HS.catH1(kindLabel(p.category, lang)))}</a></li>`
        : "")
    : ""
}
</ul>

<footer>
${esc(S.footerAbout)}<br>
${esc(S.footerData)}
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

// 🌏 **곳마다 12개 언어.** 307곳 × 12 = 3,684장.
//    영어는 지금 주소 그대로(`/place/…/`), 나머지는 앞에 언어를 붙인다
//    (`/ja/place/…/`) — 이미 낸 주소는 안 바꾼다(page-strings.ts 주석).
let written = 0;
for (const lang of PAGE_LANGS) {
  for (const p of ALL) {
    const dir = join(DIST, ...langPath(lang, `place/${savedSlugs[p.id]}`).split("/"));
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "index.html"), pageFor(p, byGu.get(p.gu) ?? [], lang));
    written++;
  }
}

// ── 🗂️ 묶음 페이지 ───────────────────────────────────────────────────────
//
// 곳 페이지가 「이름을 아는 사람」을 위한 문이라면, 이쪽은 **이름을 모르는
// 사람**을 위한 문이다. 위 hubPathGu/hubPathMonth 주석에 이유를 적어 뒀다.

/**
 * 갈래 이름 — 언어별. 영어는 CATEGORY_HUB 의 복수형, 나머지는 앱의 표를 쓴다.
 *
 * 🐞 **`const` 화살표 함수로 쓰면 안 된다** (2026-09-10에 당했다). 이 함수는
 *    파일에서 pageFor 보다 **아래**에 있는데, pageFor 는 위에서 곧바로 불린다.
 *    `const` 는 끌어올려지지 않아 「kindLabel is not a function」으로 죽는다.
 *    타입 검사도 이건 안 잡아 준다 — 그래서 `function` 선언으로 둔다.
 */
function kindLabel(cat: string, lang: Language): string {
  return lang === "en"
    ? CATEGORY_HUB[cat]?.plural ?? CATEGORY_EN[cat] ?? "Places"
    : getTranslations(lang).categoryLabels[cat] ?? CATEGORY_EN[cat] ?? "Places";
}

/**
 * 목록 한 줄. 이름 + 한글 이름 + 한 줄 설명(갈래·구·달·메모).
 *
 * 🌏 링크도 **같은 언어의 곳 페이지**로 보낸다 (2026-09-10). 일본어 묶음에서
 *    누르면 일본어 곳 페이지가 떠야 한다 — 영어로 떨어뜨리면 손님이 거기서 끊긴다.
 */
function hubItem(p: Place, showGu = true, lang: Language = "en"): string {
  const name = translateText(p.name, lang);
  const showKo = name !== p.name;
  const note = p.note ? translateText(p.note, lang) : "";
  const facts = [
    lang === "en" ? CATEGORY_EN[p.category] ?? "Place" : getTranslations(lang).categoryLabels[p.category] ?? "",
    showGu
      ? districtFullName(p.gu, lang) + (p.dong ? ` · ${dongName(p.dong, lang)}` : "")
      : p.dong
        ? dongName(p.dong, lang)
        : "",
    whenLabel(p, lang),
  ].filter(Boolean);
  // 메모가 있으면 앞에 세운다 — 곳마다 다른 유일한 문장이라 목록이 안 똑같아진다.
  const meta = [note, facts.join(" · ")].filter(Boolean).join(" — ");
  return (
    `<li><a href="/${langPath(lang, `place/${savedSlugs[p.id]}/`)}">${esc(name)}` +
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
  /** 🍚 밥집 쪽으로 잇는 한 줄. 주소가 없으면(아직 안 켰거나 빈 동네) 안 그린다. */
  eat?: { href: string; label: string } | null;
  lang?: Language;
  /**
   * 🧳 목록이 아닌 **글**이 들어가는 자리 (짐 보관 안내가 쓴다).
   *    틀(머리·꼬리·hreflang·빵가루)을 두 벌로 만들지 않으려고 여기로 받는다 —
   *    두 벌이 되면 한쪽만 고쳐 놓고 다른 쪽이 옛 모습으로 남는다.
   */
  extraHtml?: string;
}): string {
  const lang = o.lang ?? "en";
  const S = HUB_STRINGS[lang] as HubStrings;
  const url = `${SITE}/${langPath(lang, `${o.path}/`)}`;
  const items = o.groups.flatMap((g) => g.items);

  const ld: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "K-Street", item: `${SITE}/` },
        {
          "@type": "ListItem",
          position: 2,
          name: PAGE_STRINGS[lang].seoul,
          item: `${SITE}/${langPath(lang, "seoul/")}`,
        },
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
        name: translateText(p.name, lang),
        url: `${SITE}/${langPath(lang, `place/${savedSlugs[p.id]}/`)}`,
      })),
    });

  const body = o.groups
    .filter((g) => g.items.length)
    .map(
      (g) =>
        `<h2>${esc(g.heading)}</h2><ul>${g.items.map((p) => hubItem(p, g.showGu ?? true, lang)).join("")}</ul>`
    )
    .join("\n");

  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(o.title)}</title>
<meta name="description" content="${esc(o.desc)}">
${ROBOTS}
<link rel="canonical" href="${url}">
${hubHreflang(o.path)}
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
<p class="crumbs"><a href="/${langPath(lang, "seoul/")}">${esc(S.allOfSeoul)}</a> · <a href="/">${esc(S.openTheApp)}</a></p>

${o.extraHtml ?? ""}

${body}

${
  o.chips?.length
    ? `<h2>${esc(o.chipsTitle ?? PAGE_STRINGS[lang].browse)}</h2><ul class="chips">${o.chips
        .map((c) => `<li><a href="${esc(c.href)}">${esc(c.label)}</a></li>`)
        .join("")}</ul>`
    : ""
}

${
  o.eat
    ? // 🍚 손님이 시장을 구경하고 산책하면 배가 고프다 — 그때 갈 곳을 이어 준다.
      //    rel="noopener" 만 붙인다. nofollow 는 안 붙인다: 손님에게 쓸모가 있어서
      //    거는 링크라 숨길 이유가 없다(밀어주기가 아니다 — docs/홍보-작전.md).
      `<div class="go"><a class="eat" href="${esc(o.eat.href)}" rel="noopener">${esc(o.eat.label)}</a></div>`
    : ""
}
<div class="go"><a class="app" href="/">${esc(PAGE_STRINGS[lang].openApp)}</a></div>

<footer>
${esc(PAGE_STRINGS[lang].footerAbout)}<br>
${esc(PAGE_STRINGS[lang].footerData)}
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

/**
 * 「4 traditional markets, 3 festivals, 1 hiking trail」 — 있는 갈래만 센다.
 *
 * ⚠️ 영어 복수형을 **뒤에 s 를 붙여서 만들지 않는다.** 그렇게 했더니
 *    "3 street & alleys" 가 나왔다(맞는 말은 "streets & alleys"). 갈래마다
 *    올바른 복수형을 CATEGORY_HUB 에 적어 두고 그걸 쓴다.
 *
 * 🌏 일어·중국어는 **복수형이 없다** — 「市場4件・フェスティバル3件」처럼
 *    갈래 이름 뒤에 수를 붙인다. 언어마다 다른 그 규칙은 HUB_STRINGS 에 있다.
 */
function countByKind(items: Place[], max = 0, lang: Language = "en"): string {
  const S = HUB_STRINGS[lang] as HubStrings;
  const n = new Map<string, number>();
  for (const p of items) n.set(p.category, (n.get(p.category) ?? 0) + 1);
  // 🧹 **영어만 따로 처리하던 갈래를 없앴다** (2026-09-10). 예전에는 여기서 영어의
  //    단수·복수를 직접 갈랐는데, 그 규칙이 HUB_STRINGS 의 kindCount 에도 생기면서
  //    **잣대가 둘**이 됐다. 실제로 갈라졌다 — catLead 는 kindCount 를 쓰는데
  //    영어 kindCount 에 단수 처리가 없어서 「1 traditional markets」가 나왔다.
  //    지금은 12개 언어가 전부 kindCount 한 군데를 지난다.
  const parts = [...n.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([c, k]) => S.kindCount(c, kindLabel(c, lang), k));
  // 검색 결과 한 줄에 넣을 때는 앞의 몇 개만 — 다 적으면 잘려서 문장이 끊긴다.
  if (max && parts.length > max) return parts.slice(0, max).join(S.join) + S.andMore;
  return parts.join(S.join);
}

/**
 * 검색 결과에 뜨는 한 줄은 160자쯤에서 잘린다. **낱말 경계에서 우리가 먼저** 자른다
 * (곳 페이지가 이미 같은 규칙을 쓴다 — 잣대를 둘로 만들지 않는다).
 */
const clip = (s: string) => (s.length <= 160 ? s : s.slice(0, 160).replace(/\s+\S*$/, "") + "…");

const GU_LIST = [...byGu.keys()].sort((a, b) => guEn(a).localeCompare(guEn(b)));

// 달별 — 축제가 있는 달만. 걸쳐 있는 축제는 두 달 모두에 나온다(앱 화면과 같은 규칙).
// 🚨 **지난 회차는 달별 묶음에서 뺀다** (2026-09-10).
//    이 페이지 제목은 「Seoul Festivals in October **2026**」 인데 목록에
//    「**2025** Seoul Hanok Week」 가 올라와 있었다 — 한 화면에서 연도가 부딪힌다.
//    달별 묶음은 「올해 그 달에 열린다」고 **약속하는 자리**라, 우리가 확인 못 한
//    것을 여기 올리면 손님이 헛걸음한다. 곳 페이지에는 그대로 남기되(아는 사실이니까)
//    거기서는 「2025년 회차 기록」이라고 밝힌다.
const festivalsIn = (m: number) =>
  ALL.filter(
    (p) =>
      p.startMonth != null &&
      m >= p.startMonth &&
      m <= (p.endMonth ?? p.startMonth) &&
      !pastEditionYear(p.name)
  ).sort(
    (a, b) => guEn(a.gu).localeCompare(guEn(b.gu)) || translateText(a.name, "en").localeCompare(translateText(b.name, "en"))
  );
const MONTHS_WITH = [...Array(12).keys()].map((i) => i + 1).filter((m) => festivalsIn(m).length);

const hubs: { path: string; lang: Language; html: string }[] = [];

// 🌏 **묶음 페이지를 언어별로 만든다** (2026-09-10, 사장님 지시: 영어·일어·중국어부터).
//
// 늘어놓는 순서는 **어느 언어에서나 같게** 둔다(영어 이름 기준 정렬).
// 언어마다 다시 정렬하면 같은 페이지의 언어판끼리 항목 순서가 어긋나는데,
// 그러면 구글이 hreflang 으로 묶어 놓고도 "다른 페이지"처럼 읽을 여지가 생긴다.
// 사람에게도 이쪽이 낫다 — 언어를 바꿔도 찾던 자리가 그 자리에 있다.
for (const lang of HUB_LANGS) {
const S = HUB_STRINGS[lang] as HubStrings;
const P = PAGE_STRINGS[lang];
const guName = (gu: string) => districtFullName(gu, lang);
const monthName = (m: number) => monthLabel(m, lang);
// 🔤 **딱지는 딱지에 쓰인 글자 순으로 늘어놓는다** (2026-09-10, 사장님이 폰 화면을 보내 주셔서 찾았다).
//    여태 12개 언어가 전부 **영어 알파벳순**을 그대로 썼다. GU_LIST 를 한 번만
//    guEn() 으로 줄 세우고 모든 언어가 그걸 물려받았기 때문이다.
//    그래서 한국어 화면에서 「강남구」가 일곱 번째에 있었다 —
//    도봉·동대문·동작·은평·강북·강동·강남… 한국 사람이 못 찾는 차례다.
//    (Dobong·Dongdaemun·Dongjak… 로마자로 읽으면 맞는 차례라 영어로만 보면 안 보인다.)
//
//    Intl.Collator 가 말마다 제 차례를 안다 — 재 보고 넣었다:
//      ko  가나다순   강남구 · 강동구 · 강북구 · 강서구 · 관악구…
//      ja  오십음순   永登浦区(エイ) · 恩平区(オン) · 冠岳区(カン) · 衿川区(キン)…
//      zh  병음순     城北区(Chéng) · 道峰区(Dào) · 東大門区(Dōng) · 恩平区(Ēn)…
//    나머지 언어는 이름표가 로마자라 지금까지와 같은 차례가 나온다.
const guCollator = new Intl.Collator(lang);
const guChips = GU_LIST.map((gu) => ({
  href: `/${langPath(lang, `${hubPathGu(gu)}/`)}`,
  label: guName(gu),
})).sort((a, b) => guCollator.compare(a.label, b.label));
const monthChips = MONTHS_WITH.map((m) => ({
  href: `/${langPath(lang, `${hubPathMonth(m)}/`)}`,
  label: monthName(m),
}));

for (const m of MONTHS_WITH) {
  const items = festivalsIn(m);
  const gus = new Set(items.map((p) => p.gu));
  const year = yearForMonth(m);
  hubs.push({
    path: hubPathMonth(m),
    lang,
    html: hubPage({
      lang,
      path: hubPathMonth(m),
      kind: S.byMonth,
      h1: S.monthH1(monthName(m)),
      title: S.monthTitle(monthName(m), year, items.length),
      // 🚨 "그 달에 열린다"까지만 말한다. 날짜를 말하는 순간 틀린 정보가 된다.
      lead: S.monthLead(items.length, gus.size, monthName(m)),
      desc: clip(S.monthDesc(items.length, gus.size, monthName(m))),
      groups: [...new Set(items.map((p) => p.gu))]
        .sort((a, b) => guEn(a).localeCompare(guEn(b)))
        .map((gu) => ({ heading: guName(gu), items: items.filter((p) => p.gu === gu), showGu: false })),
      chipsTitle: S.otherMonths,
      chips: monthChips.filter((c) => c.label !== monthName(m)),
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
    lang,
    html: hubPage({
      lang,
      path: hubPathGu(gu),
      kind: S.byDistrict,
      h1: S.guH1(guName(gu)),
      title: S.guTitle(guName(gu), items.length),
      // ⚠️ "주소도 다 있다"고 쓰지 않는다 — 주소는 관광공사에서 받은 곳에만 있다.
      //    한 곳이라도 없으면 그 문장은 거짓말이 된다.
      lead: S.guLead(guName(gu), gu, items.length, countByKind(items, 0, lang)),
      desc: clip(S.guDesc(guName(gu), countByKind(items, 3, lang))),
      groups: [...new Set(items.map((p) => p.category))].map((c) => ({
        heading: S.kindInGu(kindLabel(c, lang), guName(gu)),
        items: items.filter((p) => p.category === c),
        showGu: false,
      })),
      chipsTitle: S.otherDistricts,
      chips: guChips.filter((c) => c.label !== guName(gu)),
      // 🍚 밥집 — 구 단위로만 건다(저쪽 구 안에 빈 동네가 있다고 알려 왔다).
      //    손님 언어를 그대로 넘긴다(대만은 partnerLinks 가 zhTW 로 갈아 끼운다).
      eat: (() => {
        const href = eatNearbyUrl(gu, lang);
        return href ? { href, label: P.eatIn(guName(gu)) } : null;
      })(),
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
    lang,
    html: hubPage({
      lang,
      path: hubPathCategory(cat),
      kind: S.byKind,
      h1: S.catH1(kindLabel(cat, lang)),
      title: S.catTitle(kindLabel(cat, lang), items.length, gus.length),
      // 🚨 「수+갈래」는 **kindCount 한 군데서만** 만든다 — 스페인어·프랑스어·독일어는
      //    1개일 때 단수형으로 갈라야 하고, 그 규칙이 두 곳에 있으면 한쪽만 고치게 된다.
      lead: S.catLead(
        S.kindCount(cat, kindLabel(cat, lang), items.length),
        gus.length,
        cat === "festival"
      ),
      desc: clip(S.catDesc(kindLabel(cat, lang), items.length, gus.length)),
      groups: gus.map((gu) => ({ heading: guName(gu), items: items.filter((p) => p.gu === gu), showGu: false })),
      chipsTitle: S.otherKinds,
      chips: Object.entries(CATEGORY_HUB)
        .filter(([c]) => c !== cat && ALL.some((p) => p.category === c))
        .map(([c]) => ({ href: `/${langPath(lang, `${hubPathCategory(c)}/`)}`, label: kindLabel(c, lang) })),
    }),
  });
}

// 묶음 페이지의 대문 — 크롤러가 여기 한 장만 봐도 나머지를 다 찾아간다.
hubs.push({
  path: "seoul",
  lang,
  html: hubPage({
    lang,
    path: "seoul",
    kind: S.index,
    h1: S.indexH1,
    title: S.indexTitle(ALL.length),
    lead: S.indexLead(ALL.length, GU_LIST.length, countByKind(ALL, 0, lang)),
    desc: clip(S.indexDesc(countByKind(ALL, 3, lang), GU_LIST.length)),
    groups: [],
    chipsTitle: S.byDistrictChips,
    chips: [
      ...guChips,
      ...monthChips.map((c) => ({ href: c.href, label: S.festivalsInMonth(c.label) })),
      ...Object.entries(CATEGORY_HUB)
        .filter(([c]) => ALL.some((p) => p.category === c))
        .map(([c]) => ({ href: `/${langPath(lang, `${hubPathCategory(c)}/`)}`, label: kindLabel(c, lang) })),
    ],
  }),
});

// ── 🧳 짐 보관 안내 ──────────────────────────────────────────────────────
//
// 사장님 지시가 세 번에 걸쳐 좁혀졌다(2026-09-10):
//   ① "간단한 안내만으로도 좋을거 같아"           → 목록·가격표·필터를 안 만든다
//   ② "결제나 그런거에 우리가 관여하여서는 안되"   → 예약·결제에 끼지 않는다
//   ③ "사설 안내까지는 하고 안내문 넣어"           → 사설도 적되 안내문을 붙인다
//
// 🚨 **가격과 운영시간은 한 글자도 안 적는다.** 값이 틀린 식당은 다른 데 가면 되지만,
//    닫힌 보관소 앞에 선 사람은 **캐리어를 끌고 오도 가도 못한다.**
//    대신 「맡기기 전에 물어볼 것」을 준다 — 우리가 모르는 사실을 지어내지 않으면서
//    외국인에게 실제로 쓸모 있는 유일한 방식이다.
{
  const L = LUGGAGE_STRINGS[lang];
  const item = (name: string, desc: string) =>
    `<li><strong>${esc(name)}</strong><span class="meta">${esc(desc)}</span></li>`;
  // 후보 파일에서 이름으로 찾는다. **못 찾으면 던진다** — 조용히 빈 줄을 내면
  // 그 가게만 화면에서 사라져도 아무도 모른다. 오타는 시끄럽게 터져야 한다.
  const findPlace = (areaKey: string, name: string) => {
    const hit = (LUGGAGE_CANDIDATES.곳 as LuggageCandidate[]).find(
      (c) => c.area === areaKey && c.name === name,
    );
    if (!hit) throw new Error(`짐 보관: 「${areaKey} / ${name}」를 luggage-candidates.json 에서 못 찾았다 — 이름이 바뀌었는지 볼 것`);
    return hit;
  };

  // 🔒 **또타라커 — 273개 역의 무인 보관함.** 맨 위에 둔다.
  //    또타러기지는 6개 역뿐이지만 이건 **273개 역**에 있다 —
  //    손님이 어느 역에 있든 쓸 수 있으니 가장 먼저 보여 준다.
  //    ⚠️ 운영시간이 또타러기지와 다르다(05~24시 vs 09~22시). 섞으면 안 된다.
  const lockerHtml = () =>
    [
      `<h2>${esc(L.tlockerName)}</h2>`,
      `<p class="note">${esc(L.lockerWhat(LOCKER_STATIONS, LOCKER_CELLS))}</p>`,
      `<p class="note">${esc(L.priceBase(LOCKER_BASE_HOURS))}</p>`,
      `<ul>`,
      LOCKER_SIZES.map(
        (z) =>
          `<li><strong>${esc(z.code)} · ${esc(L.lockerSize(z.w, z.d, z.h))}</strong>` +
          `<span class="meta">${esc(L.lockerRow(L.priceWeekday, z.weekday, L.priceWeekend, z.weekend, z.extra))}</span></li>`,
      ).join(""),
      `</ul>`,
      `<p class="note">${esc(L.lockerHours(LOCKER_OPEN, LOCKER_CLOSE))}</p>`,
      // 🚨 한 달 지나면 짐이 없어진다. 손님이 꼭 알아야 한다.
      `<p class="note"><strong>${esc(L.lockerMaxDays(LOCKER_MAX_DAYS))}</strong></p>`,
      `<p class="note">${esc(L.priceMayChange)}</p>`,
      // 📱 **빈 칸 수는 앱에서 본다.** 우리가 숫자를 옮겨 적지 않는 이유는
      //    실시간 값이기 때문이다 — 옮기는 순간 틀린다(사장님이 앱 지도를 보고 짚어 주셨다).
      `<p class="note">${esc(L.lockerLive)}</p>`,
      `<ul class="chips">` +
        `<li><a href="${esc(LOCKER_APP_ANDROID)}" rel="nofollow noopener" target="_blank">${esc(L.appAndroid)} ↗</a></li>` +
        `<li><a href="${esc(LOCKER_APP_IPHONE)}" rel="nofollow noopener" target="_blank">${esc(L.appIphone)} ↗</a></li>` +
        `<li><a href="${esc(LOCKER_PAGE)}" rel="nofollow noopener" target="_blank">${esc(L.lockerFindIt)} ↗</a></li>` +
      `</ul>`,
      // ⚠️ 여기는 카카오가 아니라 **서울교통공사**에서 온 자료다. 출처를 섞지 않는다.
      `<p class="note">${esc(L.checkedOn)}: ${esc(OFFICIAL_CHECKED)}</p>`,
    ].join("\n");

  // 🚇 **또타러기지 — 서울교통공사 공식.** 사설 목록보다 **위에** 놓고 눈에 띄게 가른다.
  //    여기만 값과 운영시간을 적는다(사장님 결정 2026-09-10 "공공 서비스만 적는다").
  //    근거는 서울교통공사가 스스로 공개한 공식 페이지다 — 가장 높은 등급이다.
  //    📍 「몇 번 출구」가 여기 있다. 사장님이 처음 말씀하신 바로 그것이다.
  const officialHtml = () =>
    [
      `<h2>${esc(L.officialName)}</h2>`,
      `<p class="note">${esc(L.officialWhat)}</p>`,
      `<ul>`,
      OFFICIAL_BRANCHES.map((b) => {
        // ⚠️ 김포공항역은 출구 번호가 아니라 **「I-센터」**다.
        //    무조건 「번 출구」를 붙였다가 「I-센터번 출구 방면」이 나왔다.
        const towards = /^[\d,]+$/.test(b.exit) ? L.exitLabel(b.exit) : b.exit;
        return (
          `<li><strong>${esc(b.station)}</strong>` +
          `<span class="meta">${esc(L.branchLine(b.line, b.floor, towards))}</span></li>`
        );
      }).join(""),
      `</ul>`,
      `<h3>${esc(L.priceHeading)}</h3>`,
      `<p class="note">${esc(L.priceBase(OFFICIAL_BASE_HOURS))}</p>`,
      `<ul>`,
      OFFICIAL_PRICES.map(
        (r) =>
          `<li><strong>${esc(r.size)}</strong>` +
          `<span class="meta">${esc(L.priceWeekday)} ₩${r.weekday.toLocaleString()} · ` +
          `${esc(L.priceWeekend)} ₩${r.weekend.toLocaleString()}</span></li>`,
      ).join(""),
      `</ul>`,
      `<p class="note">${esc(L.priceExtra(OFFICIAL_EXTRA_PER_HOUR))}</p>`,
      `<p class="note">${esc(L.openHours(OFFICIAL_OPEN, OFFICIAL_CLOSE))}</p>`,
      // ⚠️ 값을 적은 이상 **바뀔 수 있다는 말과 공식 링크를 반드시 같이** 띄운다.
      `<p class="note"><strong>${esc(L.priceMayChange)}</strong></p>`,
      `<ul class="chips">` +
        `<li><a href="${esc(OFFICIAL_PAGE)}" rel="nofollow noopener" target="_blank">${esc(L.officialSource)} ↗</a></li>` +
        `<li><a href="${esc(BOOKING_SITE_BY_LANG[lang] ?? BOOKING_SITE)}" rel="nofollow noopener" target="_blank">${esc(L.bookOnline)} ↗</a></li>` +
        `</ul>`,
      `<p class="note">${esc(L.checkedOn)}: ${esc(OFFICIAL_CHECKED)}</p>`,
    ].join("\n");

  const placesHtml = () =>
    [
      // 🧱 **사설은 여기서부터.** 사장님 지시(2026-09-10): "사설은 사설 따로 빼고 안내문".
      //    머리말에 「참고용」을 박고, **안내문을 목록 앞에** 놓는다 —
      //    뒤에 두면 손님이 상호를 다 읽고 난 뒤에야 "우리가 확인 안 했다"를 만난다.
      //    그때는 이미 믿은 뒤다.
      `<h2>${esc(L.privateHeading)}</h2>`,
      `<p class="note"><strong>${esc(L.placesNotice)}</strong></p>`,
      `<p class="note">${esc(L.placesLead)}</p>`,
      ...LUGGAGE_AREAS.map((area) => {
        // 한국어 화면은 한국어 이름만. 나머지 말은 읽을 수 있는 이름 뒤에
        // **한국어를 괄호로** 붙인다 — 택시 기사에게 그대로 보여 줄 수 있어야 한다.
        const heading = lang === "ko" ? area.ko : `${area.en} (${area.ko})`;
        const rows = area.names
          .map((n) => findPlace(area.areaKey, n))
          .map((c) => {
            // 📱 **낯선 주소 대신 지도 앱을 연다** (2026-09-10 사장님 지시:
            //    "링크 주면 요즘은 꺼리게 되는데 / 어플로 해야 안정감 신뢰가").
            //    place.map.kakao.com/26419247 같은 주소는 눌러도 되는 건지 알 수 없다.
            //    카카오맵·네이버지도는 손님이 이름을 아는 앱이고, 폰에 깔려 있으면
            //    앱이 열린다. 좌표는 후보 파일에 이미 있다.
            const q = encodeURIComponent(c.name);
            const kakao = `https://map.kakao.com/link/map/${q},${c.y},${c.x}`;
            const naver = `https://map.naver.com/p/search/${q}`;
            return (
              `<li><strong>${esc(c.name)}</strong>` +
              `<span class="meta">${esc(L.walkFrom(c.distance))} · ${esc(c.road || c.jibun)}` +
              (c.phone ? ` · ☎ ${esc(c.phone)}` : "") +
              `</span>` +
              `<span class="meta">` +
              `<a href="${esc(kakao)}" rel="nofollow noopener" target="_blank">${esc(L.openKakao)} ↗</a>` +
              ` · <a href="${esc(naver)}" rel="nofollow noopener" target="_blank">${esc(L.openNaver)} ↗</a>` +
              `</span></li>`
            );
          })
          .join("");
        return `<h3>${esc(heading)}</h3><ul>${rows}</ul>`;
      }),
      `<p class="note">${esc(L.mapAppNote)}</p>`,
      `<p class="note">${esc(L.listedOn)}: ${esc(LUGGAGE_CANDIDATES.받은날)}</p>`,
    ].join("\n");

  const linkList = (links: { label: string; url: string }[]) =>
    `<ul class="chips">${links
      .map((l) => `<li><a href="${esc(l.url)}" rel="nofollow noopener" target="_blank">${esc(l.label)} ↗</a></li>`)
      .join("")}</ul>`;

  const extraHtml = [
    `<h2>${esc(L.kindsHeading)}</h2>`,
    `<ul>`,
    item(L.lockerName, L.lockerDesc),
    item(L.centreName, L.centreDesc),
    item(L.bookedName, L.bookedDesc),
    `</ul>`,
    // 📍 **동네별 실제 보관소.** 사장님 지적(2026-09-10): "특정 관광지 명동 강남
    //    홍대 이런데 창고 길안내 … 설명 있을 줄 알았지 / 이 정도면 그냥 가이드
    //    한 페이지로 만들고 말지". 맞는 말이었다 — 위치가 한 곳도 없었다.
    //
    //    상호·주소·전화는 **손으로 안 적었다.** 러너가 카카오에서 받아 커밋한
    //    luggage-candidates.json 에서 이름으로 찾아 쓴다. 이름이 안 맞으면
    //    아래에서 **페이지 만들기가 멈춘다** — 그게 오타를 잡는 장치다.
    // 차례: 공공(또타라커·또타러기지) → 물어볼 것 → 공식 안내 → **사설은 맨 아래.**
    //       사설을 위에 두면 손님이 그걸 먼저 만난다. 공공이 먼저다.
    lockerHtml(),
    officialHtml(),
    `<h2>${esc(L.checkHeading)}</h2>`,
    `<ul>`,
    [L.check1, L.check2, L.check3, L.check4].map((c) => `<li>${esc(c)}</li>`).join(""),
    `</ul>`,
    // ⚠️ 값을 안 적는 이유를 손님에게도 말해 준다. 안 적은 것이 게으름이 아니라
    //    **일부러 그런 것**임을 알아야 손님이 우리를 믿는다.
    `<p class="note"><strong>${esc(L.noPrices)}</strong></p>`,
    `<h2>${esc(L.officialHeading)}</h2>`,
    linkList([...officialLinks(lang), ...AIRPORT_LINKS]),
    `<p class="note">${esc(L.lastChecked)}: ${esc(LINKS_CHECKED)}</p>`,
    // ────────────────────────────────────────────────────────────────
    // 🚫 **사설 업체는 뺐다** (2026-09-10 사장님 결정: "사설은 빼자").
    //
    //    한때 여기에 20곳(홍대·서울역·명동·성수·잠실·안국·김포공항)과
    //    Bounce·Radical Storage 가 있었다. 뺀 이유는 그날 하루가 다 말해 준다:
    //
    //    · 업종으로 **여행자용과 월세 창고가 안 갈렸다** — 카카오에서 「짐프리」와
    //      「박스풀 공유창고」가 똑같이 「서비스,산업 > 보관,저장」이다.
    //      결국 상호를 보고 사람이 고를 수밖에 없었다
    //    · 골라도 **가 본 곳이 아니다.** 영업시간·요금·외국어가 되는지 모른다.
    //      그래서 목록 앞에 "저희가 확인 안 했습니다"를 크게 붙여야 했는데,
    //      그 말을 붙여야 하는 목록이면 애초에 안 싣는 게 맞다
    //    · 사장님 말씀대로 **낯선 곳 링크는 요즘 아무도 안 누른다**
    //
    //    지금 남은 것은 서울교통공사가 직접 하는 둘뿐이다 —
    //    또타라커(273개 역)와 또타러기지(6개 역). 요금·운영시간·몇 번 출구가
    //    **공식 페이지에 공개**돼 있어 근거 등급이 가장 높다.
    //
    //    ⚠️ 글(luggage-strings 의 privateHeading·placesNotice 등)과
    //       자료(luggage-picks·luggage-candidates)는 **지우지 않고 남겨 뒀다.**
    //       나중에 확인이 되면 그때 다시 켜면 된다.
    // ────────────────────────────────────────────────────────────────
    `<h2>${esc(L.afterHeading)}</h2>`,
    `<p class="note">${esc(L.afterLead)}</p>`,
  ].join("\n");

  hubs.push({
    path: "seoul/luggage",
    lang,
    html: hubPage({
      lang,
      path: "seoul/luggage",
      // 🏷️ 「一覧 / Index / 전체」가 아니라 「案内 / Guide / 안내」다
      //    (2026-09-10, 사장님 폰 화면에서 찾았다). 이 페이지는 곳을 늘어놓은
      //    목록이 아니라 **읽는 글**이다. 딱지가 목록이라고 하면 손님이
      //    "여기 목록이 있겠거니" 하고 열었다가 글을 만난다.
      kind: S.guide,
      h1: L.h1,
      title: L.title,
      lead: L.lead,
      desc: clip(L.desc),
      groups: [],
      extraHtml,
      // 짐을 맡겼으면 걸으러 간다 — 이미 있는 구 페이지로 보낸다.
      chipsTitle: S.byDistrictChips,
      chips: guChips,
    }),
  });
}

} // ← 언어 되돌이 끝

for (const h of hubs) {
  const dir = join(DIST, ...langPath(h.lang, h.path).split("/"));
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "index.html"), h.html);
}

// 사이트맵을 다시 쓴다 — 손으로 300줄을 적지 않는다.
const urls = [
  `  <url><loc>${SITE}/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>`,
  // 묶음 페이지를 곳 페이지보다 **위에** 둔다. 크롤러가 먼저 보는 순서이기도 하고,
  // 이 페이지들이 나머지 307장으로 가는 길이라 먼저 발견될수록 좋다.
  ...hubs.map(
    (h) =>
      `  <url><loc>${SITE}/${langPath(h.lang, `${h.path}/`)}</loc>` +
      `<changefreq>weekly</changefreq><priority>${h.lang === "en" ? "0.8" : "0.7"}</priority></url>`
  ),
  // 🌏 12개 언어판을 다 적는다. 언어판끼리는 hreflang 으로 묶여 있으므로
  //    구글이 「같은 페이지 12장」이 아니라 「한 페이지의 12개 언어」로 읽는다.
  ...PAGE_LANGS.flatMap((lang) =>
    ALL.map(
      (p) =>
        `  <url><loc>${SITE}/${langPath(lang, `place/${savedSlugs[p.id]}/`)}</loc>` +
        `<changefreq>weekly</changefreq><priority>${lang === "en" ? "0.7" : "0.6"}</priority></url>`
    )
  ),
];
writeFileSync(
  join(DIST, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<!-- scripts/build-place-pages.ts 가 만든다. 손으로 고치지 말 것. -->\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`
);

console.log(
  `✅ 곳 페이지 ${written}장(${PAGE_LANGS.length}개 언어 × ${ALL.length}곳) · ` +
    `묶음 페이지 ${hubs.length}장(${HUB_LANGS.length}개 언어 × ${hubs.length / HUB_LANGS.length}장) · ` +
    `사이트맵 주소 ${urls.length}개`
);
console.log(`   묶음 언어 — ${HUB_LANGS.join(" · ")} (나머지 ${PAGE_LANGS.length - HUB_LANGS.length}개 언어는 영어 묶음으로 보낸다)`);
if (newSlugs) console.log(`   새 주소 ${newSlugs}개를 src/data/place-slugs.json 에 적었다 — 커밋할 것.`);
