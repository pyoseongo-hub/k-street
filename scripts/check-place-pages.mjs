#!/usr/bin/env node
// 🔍 만든 곳 페이지 307장을 **기계가 훑는다.**
//
// 왜 (2026-09-05) — 곳마다 페이지를 만드는 것은 잘못하면 **역효과**다.
// 같은 틀에 이름만 바꿔 넣은 얇은 페이지(doorway page)를 잔뜩 만들면 구글이
// 벌점을 주고, 그전에 **검색으로 들어온 손님이 아무 내용도 없는 페이지를 만난다.**
//
// 그래서 만들어 놓고 끝내지 않고 **세 가지를 센다:**
//   ① 얇은 페이지 — 본문 글자가 너무 적은 것
//   ② 겹치는 설명 — 검색 결과에 똑같은 줄이 여러 개 뜨는 것
//   ③ 빠진 칸    — 제목·설명·canonical·구조화 자료가 없는 것
//
//   node scripts/check-place-pages.mjs        (dist 가 만들어진 뒤에)
import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";

const DIR = join(process.cwd(), "dist", "place");
if (!existsSync(DIR)) {
  console.error("❌ dist/place 가 없다 — npm run build 뒤에 곳 페이지를 먼저 만들 것.");
  process.exit(1);
}

// 🗂️ 묶음 페이지(/seoul/…)도 **같은 잣대로** 잰다 (2026-09-08).
//    곳 페이지만 검사하고 묶음은 안 하면, 벌점을 받는 쪽이 검사 밖에 남는다 —
//    묶음 페이지야말로 얇아지기 쉬운 자리다(목록만 있고 내용이 없기 쉽다).
// 🏙️ **도시마다 대문이 하나씩 있다** (2026-09-24, 부산을 열면서).
//    서울만 재면 부산 묶음 300장이 **검사 밖에** 남는다 — 얇은 페이지를 300장
//    올리는 것이야말로 이 검사가 막으려던 일이다.
const HUB_CITIES = ["seoul", "busan"];

/** 태그·스크립트·스타일을 걷어 낸 **사람이 읽는 글**만 남긴다. */
const textOf = (html) =>
  html
    .slice(html.indexOf("<body"))
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<style[\s\S]*?<\/style>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const pick = (html, re) => html.match(re)?.[1] ?? "";

// 🌏 **12개 언어를 다 훑는다** (2026-09-09).
//    폴더가 `place/…`(영어)와 `ja/place/…`(나머지 11개), `seoul/…`(묶음)으로
//    늘어났다. 이름을 하나씩 적으면 언어를 더할 때마다 여기를 또 고쳐야 하므로
//    **dist 를 훑어 index.html 을 다 찾는다** — 새 언어·새 묶음이 저절로 걸린다.
//    첫 화면(dist/index.html)은 앱이라 제외한다.
const SKIP = new Set(["assets", "icons", "images", "screenshots"]);
const files = [];
const walk = (dir, rel) => {
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name)) continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, rel ? `${rel}/${name}` : name);
    else if (name === "index.html" && rel) files.push({ slug: rel, f: full });
  }
};
walk(join(process.cwd(), "dist"), "");

// 🌏 **언어와 묶음/곳 갈래를 페이지 자신에게 물어본다** (2026-09-10).
//
// 🐞 두 번 틀렸다:
//    ① `rel.includes("seoul")` — 곳 슬러그에도 seoul 이 들어간다
//       (seoul-museum-of-history 등 36곳 × 12언어 = 432장이 묶음으로 잘못 세어졌다).
//    ② `rel.startsWith("seoul/")` 로 고쳤더니, 이번엔 묶음을 언어별로 만들면서
//       `ja/seoul/…` 를 못 알아봤다(일본어 곳 페이지가 307 → 351로 부풀었다).
//
// 두 번 다 **경로 글자를 눈으로 짐작한 것**이 원인이다. 그래서 이제
// 언어는 페이지의 `<html lang>` 에서 읽고, 그 접두어를 떼고 남은 자리로 갈래를 가른다.
// 이러면 **언어를 더해도 이 파일을 고칠 일이 없다** — 언어 목록을 여기 안 적으니까.
const rows = [];
for (const { slug, f } of files) {
  if (!existsSync(f)) continue;
  const html = readFileSync(f, "utf-8");
  const lang = html.match(/<html[^>]*\slang="([^"]+)"/i)?.[1] ?? "en";
  const rest = slug.startsWith(`${lang}/`) ? slug.slice(lang.length + 1) : slug;
  const hub = HUB_CITIES.some((c) => rest === c || rest.startsWith(`${c}/`));
  rows.push({
    slug,
    lang,
    hub,
    text: textOf(html).length,
    title: pick(html, /<title>([\s\S]*?)<\/title>/),
    desc: pick(html, /name="description" content="([^"]*)"/),
    canonical: pick(html, /rel="canonical" href="([^"]*)"/),
    ld: html.includes('type="application/ld+json"'),
    photo: html.includes("<figure>"),
    h1: pick(html, /<h1>([\s\S]*?)<\/h1>/),
  });
}

const fail = [];
const warn = [];

// ── ① 얇은 페이지 ────────────────────────────────────────────────────────
// 300자는 넉넉한 문턱이 아니다 — 이름·구·주소·이웃 목록만 있어도 넘는다.
// 여기 걸리는 것은 **이름 말고 아는 게 없는 곳**이라, 페이지를 만들 게 아니라
// 자료를 채워야 하는 곳이다.
const thin = rows.filter((r) => r.text < 300).sort((a, b) => a.text - b.text);
if (thin.length) warn.push([`본문이 300자 미만인 곳 ${thin.length}장`, thin.slice(0, 10).map((r) => `${r.slug} (${r.text}자)`)]);

// ── ② 겹치는 제목·설명 ──────────────────────────────────────────────────
//
// 🌏 **언어를 갈라서 센다** (2026-09-09). 12개 언어로 늘리자마자 "제목이 똑같다"가
//    84묶음 나왔는데, 열어 보니 전부 **영어와 독일어(또는 인도네시아어·베트남어)**였다.
//    그 언어에 번역된 이름이 없으면 영어 이름을 그대로 쓰고, 「Gwangjin-gu, Seoul」은
//    독일어로도 철자가 같아서 제목이 글자까지 똑같아진다. 중국어 간체·번체도 마찬가지다.
//
//    이건 사고가 아니다 — hreflang 이 "같은 페이지의 다른 언어판"이라고 이미 알려 준다.
//    **진짜 위험한 것은 같은 언어 안에서 두 곳이 같은 제목을 갖는 것**이다(그게
//    doorway page 다). 그래서 막는 것(❌)은 같은 언어 안쪽만, 언어끼리 겹치는 것은
//    **번역이 빠졌다는 신호**로 ⚠️ 만 띄운다.
/**
 * 같은 언어 안에서 값이 겹치는 묶음만 모은다.
 *
 * 열쇠에 탭을 쓴다 — 제목·설명 안에 공백이 얼마든지 들어가므로, 나중에
 * 언어와 값을 다시 가를 때 **첫 탭 하나로 정확히** 갈리게 한다.
 */
const dupWithinLang = (key) => {
  const m = new Map();
  for (const r of rows) {
    const v = r[key];
    if (!v) continue;
    const k = `${r.lang}\t${v}`;
    m.set(k, [...(m.get(k) ?? []), r.slug]);
  }
  return [...m.entries()].filter(([, v]) => v.length > 1);
};
/** 위 열쇠에서 값만 꺼낸다. */
const valueOf = (k) => k.slice(k.indexOf("\t") + 1);

const dupDesc = dupWithinLang("desc");
if (dupDesc.length)
  fail.push([
    `같은 언어 안에서 설명이 똑같은 묶음 ${dupDesc.length}개`,
    dupDesc.slice(0, 5).map(([k, v]) => `${v.length}장 — "${valueOf(k).slice(0, 60)}…" (${v.join(", ")})`),
  ]);

const dupTitle = dupWithinLang("title");
if (dupTitle.length)
  fail.push([
    `같은 언어 안에서 제목이 똑같은 묶음 ${dupTitle.length}개`,
    dupTitle.slice(0, 5).map(([k, v]) => `${v.length}장 — ${valueOf(k)} (${v.join(", ")})`),
  ]);

// 언어끼리 겹치는 제목 — 막지는 않지만, **그 언어에 이름 번역이 없다는 뜻**이다.
const byTitleAll = new Map();
for (const r of rows) byTitleAll.set(r.title, [...(byTitleAll.get(r.title) ?? []), r.slug]);
const crossLang = [...byTitleAll.entries()].filter(([, v]) => v.length > 1);
if (crossLang.length) {
  const langs = new Map();
  for (const [, v] of crossLang) {
    const key = [...new Set(v.map((s) => rows.find((r) => r.slug === s).lang))].sort().join("+");
    langs.set(key, (langs.get(key) ?? 0) + 1);
  }
  warn.push([
    `언어끼리 제목이 똑같은 곳 ${crossLang.length}개 — 그 언어에 이름 번역이 없다는 뜻(hreflang 이 묶어 주므로 사고는 아니다)`,
    [...langs.entries()].sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k} — ${n}곳`),
  ]);
}

// ── ③ 빠진 칸 ────────────────────────────────────────────────────────────
for (const [name, bad] of [
  ["제목", rows.filter((r) => !r.title)],
  ["설명", rows.filter((r) => !r.desc)],
  ["canonical", rows.filter((r) => !r.canonical)],
  ["구조화 자료", rows.filter((r) => !r.ld)],
  ["h1", rows.filter((r) => !r.h1)],
]) {
  if (bad.length) fail.push([`${name}이(가) 없는 곳 ${bad.length}장`, bad.slice(0, 5).map((r) => r.slug)]);
}

// ── ④ 서비스워커가 이 페이지들을 삼키지 않나 ────────────────────────────
//
// 🐞 **두 번 난 사고다.** 서비스워커는 기본으로 모든 화면 이동을 가로채
//    앱 첫 화면(index.html)을 준다. SPA 라면 맞지만, 우리는 /place/ 와 /seoul/ 에
//    **진짜 HTML** 을 따로 만들어 뒀다. denylist 에 안 적으면 이렇게 갈린다:
//      · 처음 오는 손님·크롤러 → 진짜 페이지가 뜬다 ✅
//      · 앱에 한 번이라도 들어온 적 있는 사람 → **앱 첫 화면**이 뜬다 ❌
//    오류도 안 나고, 손으로 열어 보면 멀쩡해서 티가 안 난다.
//    2026-09-05에 /place/ 로 한 번, 2026-09-08에 /seoul/ 로 또 났다.
//    그래서 **사람 기억이 아니라 여기서 막는다** — 새 폴더를 만들면 자동으로 걸린다.
//
// 🔬 **글자를 맞춰 보지 않고 규칙을 실제로 돌려 본다** (2026-09-09에 고침).
//    처음에는 sw.js 안에 `/^\/de\//` 라는 **글자가 있나**를 봤다. 그런데 우리는
//    언어 11개를 `/^\/(ko|ja|zh|…|th)\//` 하나로 묶어 뒀다 — 규칙은 멀쩡히
//    막아 주는데 검사만 "빠졌다"고 11개를 외쳤다. **철자를 잰 것이지 동작을 잰 게 아니었다.**
//    그래서 sw.js 에서 규칙을 꺼내 진짜 RegExp 로 만들고, **페이지 주소를 하나씩
//    넣어 본다.** 이러면 규칙을 어떻게 적든(따로 적든 묶어 적든) 옳게 판정한다.
const swFile = join(process.cwd(), "dist", "sw.js");
if (existsSync(swFile)) {
  const sw = readFileSync(swFile, "utf-8");
  const seg = sw.match(/denylist:\[([\s\S]*?)\](?:,|\})/)?.[1];
  // 정규식 낱개(`/…/`)를 뽑는다. 대괄호 안의 `/` 와 역슬래시로 막은 `/` 는 끝이 아니다.
  const lits = seg?.match(/\/(?:\\.|\[(?:\\.|[^\]\\])*\]|[^/\\\n])+\/[a-z]*/g) ?? [];
  const rules = lits.map((s) => {
    const i = s.lastIndexOf("/");
    return new RegExp(s.slice(1, i), s.slice(i + 1));
  });
  if (!rules.length) {
    fail.push(["sw.js 에서 navigateFallbackDenylist 를 못 찾았다 — 검사가 무력해졌다", []]);
  } else {
    const swallowed = rows.filter((r) => !rules.some((re) => re.test(`/${r.slug}/`)));
    const dirs = [...new Set(swallowed.map((r) => r.slug.split("/")[0]))];
    if (dirs.length)
      fail.push([
        `서비스워커가 삼킬 폴더 ${dirs.length}개 (페이지 ${swallowed.length}장) — vite.config.ts 의 navigateFallbackDenylist 에 넣을 것`,
        dirs.map((d) => `/${d}/ — 앱을 한 번이라도 연 사람에게는 첫 화면이 대신 뜬다`),
      ]);
  }
} else {
  warn.push(["dist/sw.js 가 없어 서비스워커 검사를 못 했다", []]);
}

// 설명이 너무 길면 검색 결과에서 잘린다. 잘리는 것 자체는 사고가 아니라 흔한 일이다.
const longDesc = rows.filter((r) => r.desc.length > 160);
if (longDesc.length) warn.push([`설명이 160자를 넘어 검색 결과에서 잘릴 수 있는 곳 ${longDesc.length}장`, []]);

// 사진은 곳 페이지에만 있다 — 묶음 페이지는 목록이라 원래 사진이 없다.
const noPhoto = rows.filter((r) => !r.hub && !r.photo);

// ── 결과 ─────────────────────────────────────────────────────────────────
const lens = rows.map((r) => r.text).sort((a, b) => a - b);
const byLang = new Map();
for (const r of rows.filter((x) => !x.hub)) byLang.set(r.lang, (byLang.get(r.lang) ?? 0) + 1);
console.log(`📄 곳 페이지 ${rows.filter((r) => !r.hub).length}장 · 묶음 페이지 ${rows.filter((r) => r.hub).length}장`);
console.log(`   언어 ${byLang.size}개 — ${[...byLang.entries()].map(([l, n]) => `${l} ${n}`).join(" · ")}`);
console.log(`   본문 글자   가장 적음 ${lens[0]} · 중간 ${lens[Math.floor(lens.length / 2)]} · 가장 많음 ${lens.at(-1)}`);
console.log(`   사진 없는 곳 ${noPhoto.length}장`);
console.log("");

for (const [title, lines] of fail) {
  console.log(`❌ ${title}`);
  lines.forEach((l) => console.log(`     · ${l}`));
}
for (const [title, lines] of warn) {
  console.log(`⚠️  ${title}`);
  lines.forEach((l) => console.log(`     · ${l}`));
}

if (!fail.length) console.log("\n✅ 막아야 할 문제는 없다.");
process.exit(fail.length ? 1 : 0);
