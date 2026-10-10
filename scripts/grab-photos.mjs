#!/usr/bin/env node
// 📥 **인스타에 올릴 수 있는 사진만 골라 내려받는다.**
//
// 사장님: **"억새축제 사진 쓸 수 있는 거 수집 — 인스타 게시용"** (2026-10-10).
//
// ── 🚦 「쓸 수 있는」이 무슨 뜻인가 ──────────────────────────────────────
//   공공누리는 유형마다 허락하는 범위가 **다르다.**
//     · 제1유형 — 출처만 밝히면 **상업적 이용·변형 다 된다.** 인스타에 올려도 된다.
//     · 제2유형 — 상업적 이용 금지
//     · 제3유형 — 변형 금지
//     · 제4유형 — 상업적 이용 금지 + 변형 금지 (서울시 보도자료가 대개 이쪽이다)
//   👉 **이 스크립트는 제1유형만 받는다.** 나머지는 이름만 적고 건너뛴다 —
//      「받아 두고 나중에 가리자」가 가장 위험하다. 폴더에 있으면 쓰게 된다.
//
// ── ✋ 저작자 표시를 **파일과 함께** 남긴다 ─────────────────────────────
//   출처를 따로 적어 두면 나중에 누가 찍었는지 모른 채 올리게 된다.
//   그래서 사진 옆에 `출처.md` 를 같이 쓴다. 올릴 때 그대로 베껴 쓰면 된다.
//
//   node scripts/grab-photos.mjs --key "마포구|하늘공원"
//
// ⚠️ 작업 세션(샌드박스)은 tong.visitkorea.or.kr 이 막혀 있다(프록시 403).
//    .github/workflows/grab-photos.yml 로 Actions 에서 돌린다.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const GALLERY = join(ROOT, "src", "data", "photo-gallery.json");

const argVal = (name) => {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : undefined;
};
const KEY = argVal("--key");
if (!KEY) {
  console.error('쓰는 법: node scripts/grab-photos.mjs --key "마포구|하늘공원"');
  process.exit(1);
}

// 🐞 이 파일은 **감싸는 칸이 없다** — 맨 위가 바로 「구|이름」 묶음이다
//    (2026-10-10 첫 실행에서 `["곳"]` 로 찾다가 빈손으로 끝났다).
//    다른 자료 파일들과 꼴이 달라서, 둘 다 받아 준다.
const 원본 = JSON.parse(readFileSync(GALLERY, "utf8"));
const 곳들 = 원본["곳"] ?? 원본;
const 곳 = 곳들[KEY];
if (!곳) {
  console.error(`❌ photo-gallery.json 에 「${KEY}」가 없다.`);
  console.error(`   있는 열쇠 몇 개: ${Object.keys(곳들).slice(0, 5).join(" · ")}`);
  process.exit(1);
}

// 🚦 유형을 본다. **제1유형이 아니면 받지 않는다.**
const 유형 = String(곳.license ?? "");
if (!/제1유형/.test(유형)) {
  console.error(`🚫 「${KEY}」는 ${유형 || "유형을 모름"} — 인스타에 올릴 수 없다. 받지 않는다.`);
  process.exit(1);
}

const 폴더이름 = KEY.replace(/[|/\\]/g, "-");
const OUT = join(ROOT, "docs", "인스타-사진", 폴더이름);
mkdirSync(OUT, { recursive: true });

const 받은것 = [];
for (const [i, p] of (곳.photos ?? []).entries()) {
  const 번호 = String(i + 1).padStart(2, "0");
  try {
    const r = await fetch(p.url, { headers: { "User-Agent": "KStreet/1.0" } });
    if (!r.ok) { console.log(`   ⚠️ ${번호} HTTP ${r.status} — ${p.url}`); continue; }
    const buf = Buffer.from(await r.arrayBuffer());
    const 확장 = (p.url.match(/\.(jpe?g|png|webp)(\?|$)/i)?.[1] ?? "jpg").toLowerCase();
    const 파일 = `${번호}-${p.contentId}.${확장}`;
    writeFileSync(join(OUT, 파일), buf);
    받은것.push({ ...p, 파일, 크기: buf.length });
    console.log(`   ✅ ${파일}  ${(buf.length / 1024).toFixed(0)}KB  (${p.photographer ?? "촬영자 모름"})`);
  } catch (e) {
    console.log(`   ⚠️ ${번호} ${e?.message ?? "알 수 없는 오류"}`);
  }
}

writeFileSync(
  join(OUT, "출처.md"),
  [
    `# 📷 ${곳.name} — 올릴 때 쓸 출처`,
    "",
    `**${유형}** — 출처만 밝히면 상업적 이용·변형이 됩니다. 인스타에 올려도 됩니다.`,
    "",
    `받은 곳: ${곳.source ?? "한국관광공사 관광사진갤러리(포토코리아)"}`,
    `받은 날: ${new Date().toISOString().slice(0, 10)}`,
    "",
    "## 게시글에 그대로 붙일 한 줄",
    "",
    ...[...new Set(받은것.map((p) => p.photographer).filter(Boolean))].map(
      (who) => `> 사진: 한국관광공사 — ${who} (${유형})`,
    ),
    "",
    "## 사진마다",
    "",
    "| 파일 | 제목 | 촬영 | 원본 |",
    "|---|---|---|---|",
    ...받은것.map((p) => `| ${p.파일} | ${p.title ?? ""} | ${p.photographer ?? ""} | [열기](${p.url}) |`),
    "",
    "🚫 **다른 유형(2·3·4)은 받지 않았습니다.** 폴더에 있으면 쓰게 되기 때문입니다.",
    "",
  ].join("\n"),
  "utf8",
);

console.log(`\n📥 ${받은것.length}장을 docs/인스타-사진/${폴더이름}/ 에 받았다 (${유형})`);
