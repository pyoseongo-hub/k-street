// 🌐 **장소 이름 번역을 언어별 파일로 나눠 둔 곳을 읽고 쓴다.**
//
// ── 왜 나눴나 (2026-09-17) ────────────────────────────────────────────────
//   예전에는 `src/data/place-translations.json` 한 장에 11개 언어가 다 들어 있었고,
//   그 파일이 **본체 js 안으로 통째로 들어갔다** — 869KB, 번들의 38%다.
//   그런데 손님 한 사람이 쓰는 말은 **하나**다. 나머지 열 개는 받기만 하고 안 쓴다.
//   글꼴은 이미 그렇게 하고 있었다(src/lib/langFont.ts — "고른 순간에 그 하나만 받는다").
//   같은 원칙을 자료에도 적용한 것이다.
//
// ── 🚨 두 벌로 두지 않는다 ────────────────────────────────────────────────
//   합쳐 둔 파일을 남기고 나눈 것을 따로 만들면 **언젠가 둘이 어긋난다.**
//   그래서 **나눈 것만 저장한다.** 합친 모양이 필요한 쪽(스크립트·감사)은
//   여기서 읽어 합친다 — 읽는 자리가 한 군데면 어긋날 자리가 없다.
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from "node:fs";
import { join } from "node:path";

export const DIR = "src/data/place-translations";

/** 언어 열쇠는 파일 이름 그대로다. `zh-TW` 의 붙임표까지 같아야 한다. */
export function langsOnDisk(dir = DIR) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((f) => f.endsWith(".json")).map((f) => f.slice(0, -5)).sort();
}

/** 합쳐진 모양으로 읽는다 — 예전 place-translations.json 과 **똑같은 모양**이다. */
export function readTranslations(dir = DIR) {
  const out = {};
  for (const lang of langsOnDisk(dir)) out[lang] = JSON.parse(readFileSync(join(dir, `${lang}.json`), "utf8"));
  return out;
}

/** 합쳐진 모양을 받아 언어별로 나눠 저장한다. 없어진 언어의 파일은 지운다. */
export function writeTranslations(store, dir = DIR) {
  mkdirSync(dir, { recursive: true });
  const keep = new Set();
  for (const [lang, map] of Object.entries(store)) {
    keep.add(`${lang}.json`);
    const sorted = Object.fromEntries(Object.entries(map).sort(([a], [b]) => a.localeCompare(b, "ko")));
    writeFileSync(join(dir, `${lang}.json`), JSON.stringify(sorted, null, 2) + "\n");
  }
  for (const f of readdirSync(dir)) if (f.endsWith(".json") && !keep.has(f)) rmSync(join(dir, f));
  return Object.keys(store).length;
}
