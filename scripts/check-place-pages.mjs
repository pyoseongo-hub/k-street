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
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const DIR = join(process.cwd(), "dist", "place");
if (!existsSync(DIR)) {
  console.error("❌ dist/place 가 없다 — npm run build 뒤에 곳 페이지를 먼저 만들 것.");
  process.exit(1);
}

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

const slugs = readdirSync(DIR);
const rows = [];
for (const slug of slugs) {
  const f = join(DIR, slug, "index.html");
  if (!existsSync(f)) continue;
  const html = readFileSync(f, "utf-8");
  rows.push({
    slug,
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

// ── ② 겹치는 설명 ────────────────────────────────────────────────────────
const byDesc = new Map();
for (const r of rows) {
  if (!r.desc) continue;
  if (!byDesc.has(r.desc)) byDesc.set(r.desc, []);
  byDesc.get(r.desc).push(r.slug);
}
const dupDesc = [...byDesc.entries()].filter(([, v]) => v.length > 1);
if (dupDesc.length)
  warn.push([
    `설명이 똑같은 묶음 ${dupDesc.length}개`,
    dupDesc.slice(0, 5).map(([d, v]) => `${v.length}장 — "${d.slice(0, 60)}…"`),
  ]);

const byTitle = new Map();
for (const r of rows) byTitle.set(r.title, [...(byTitle.get(r.title) ?? []), r.slug]);
const dupTitle = [...byTitle.entries()].filter(([, v]) => v.length > 1);
if (dupTitle.length) fail.push([`제목이 똑같은 묶음 ${dupTitle.length}개`, dupTitle.slice(0, 5).map(([t, v]) => `${v.length}장 — ${t}`)]);

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

// 설명이 너무 길면 검색 결과에서 잘린다. 잘리는 것 자체는 사고가 아니라 흔한 일이다.
const longDesc = rows.filter((r) => r.desc.length > 160);
if (longDesc.length) warn.push([`설명이 160자를 넘어 검색 결과에서 잘릴 수 있는 곳 ${longDesc.length}장`, []]);

const noPhoto = rows.filter((r) => !r.photo);

// ── 결과 ─────────────────────────────────────────────────────────────────
const lens = rows.map((r) => r.text).sort((a, b) => a - b);
console.log(`📄 곳 페이지 ${rows.length}장`);
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
