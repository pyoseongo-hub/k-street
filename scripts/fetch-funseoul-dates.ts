// 🎪 **펀서울(서울시 축제 누리집)에서 축제 확정 날짜를 받아온다.**
//
// 사장님 지시 (2026-10-06): "최대한 서치해봐 서울시 행자부 등 /
// 행사는 하는데 날짜가 없다는건 기본적 말이 안되 / 어딘가 공지가 있을거야"
//
// ─────────────────────────────────────────────────────────────────────────
// 🚨 왜 또 하나 만드나 — 문화포털만으로는 안 찼다
// ─────────────────────────────────────────────────────────────────────────
//   fetch-gu-festival-dates.ts 는 서울시 문화포털(culturalEventInfo)을 본다.
//   그 자리는 **구청이 올려 줘야** 생긴다. 2026-10-06에 재 보니 10월 축제
//   39곳 중 확정 날짜가 붙은 것이 8곳뿐이었다 — 나머지는 구청이 안 올린 것이다.
//
//   그런데 **펀서울에는 있었다.** 손으로 여덟 곳을 찾다가 알았다:
//     festival.seoul.go.kr/festival/main/festivalView.do?festacode=683
//       → 「기간  2026-10-17 ~ 2026-10-23」 이 글로 그대로 박혀 있다.
//   자바스크립트로 그리는 화면이 아니라 **받아 온 HTML 에 날짜가 있다.**
//   (자치구브랜드축제 목록·문화달력은 자바스크립트라 안 된다. 낱장만 된다.)
//
//   그래서 낱장을 festacode 1번부터 끝까지 두드린다. 목록이 필요 없다.
//
// ─────────────────────────────────────────────────────────────────────────
// ✋ 지어내지 않는 자리들
// ─────────────────────────────────────────────────────────────────────────
//   ① **이름이 꼭 맞은 것만 받는다.** fetch-gu-festival-dates.ts 와 **같은**
//      다듬기(key)를 쓴다 — 잣대가 둘이면 반쪽 적용이 생긴다.
//   ② **지난 회차는 안 받는다.** 펀서울에는 작년 회차 페이지가 그대로 남아 있다
//      (festacode=578 이 「2025 서울숲재즈페스티벌」이다). 끝난 것은 버린다.
//   ③ **한 쪽에 기간이 여러 개면 안 받는다.** 「축제 히스토리」에 예전 회차가
//      같이 실린 쪽이 있다. 어느 것이 올해 것인지 기계가 못 가르면 사람에게 넘긴다.
//   ④ 받은 것은 **구가 다르면 적어서 사람이 보게 한다.** 깨는 패로는 쓰지 않는다
//      (한강 축제는 해마다 구가 바뀐다 — guFestival.ts 주석 참고).
//
//   npm run funseoul-dates            # 맛보기 (저장 안 함)
//   npm run funseoul-dates -- --apply # 저장
import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { htmlToText, fetchHtml } from "./lib/html-text.mjs";
import { ALL_FESTIVALS } from "../src/data/seed";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "src", "data", "funseoul-dates.json");
const APPLY = process.argv.includes("--apply");
const TODAY = new Date().toISOString().slice(0, 10);

const arg = (name: string, fallback: number) => {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? Number(hit.split("=")[1]) : fallback;
};
/** 지금까지 본 가장 큰 festacode 는 753 이다. 넉넉히 둔다. */
const MAX = arg("max", 900);
/** 한 번에 몇 쪽을 받나. 서울시 서버를 때리지 않게 적게 둔다. */
const LANES = arg("lanes", 5);

const URL_OF = (code: number) =>
  `https://festival.seoul.go.kr/festival/main/festivalView.do?festacode=${code}`;

/**
 * 이름을 **대조용으로** 다듬는다.
 * 🚨 fetch-gu-festival-dates.ts 의 key() 와 **글자 하나까지 같아야 한다.**
 *    둘이 갈라지면 한쪽에서만 붙는 축제가 생기고, 그건 아무도 모른다.
 */
function key(name: string): string {
  return name
    .normalize("NFC")
    .replace(/\[[^\]]*\]/g, " ")
    .replace(/\([^)]*\)/g, " ")
    .replace(/\b(19|20)\d{2}\b/g, " ")
    .replace(/제\s*\d+\s*회/g, " ")
    .replace(/[^0-9A-Za-z가-힣]/g, "")
    .toLowerCase();
}

interface Found {
  code: number;
  title: string;
  start: string;
  end?: string;
  gu?: string;
  place?: string;
}

const DATE_LINE = /^(\d{4}-\d{2}-\d{2})(?:\s*~\s*(\d{4}-\d{2}-\d{2}))?$/;

/**
 * 한 쪽에서 「이름 · 기간 · 구 · 장소」를 캐낸다.
 *
 * 글로 바꾸면 이런 꼴이 된다 —
 *   문화/예술
 *   종로구
 *   제19회 K-Ballet World (서울국제발레축제)
 *   기간
 *   2026-08-25 ~ 2026-10-01
 *   장소 아르코예술극장, 서울아트센터 도암홀
 *
 * 그래서 「기간」이라고만 적힌 줄을 찾아 **그 다음 줄**에서 날짜를, **그 앞 줄**에서
 * 이름을 읽는다. 자리 이름(class)에 기대지 않는다 — 그건 서울시가 화면을 고치면 깨진다.
 */
function parse(code: number, html: string): { ok?: Found; why?: string } {
  const lines = htmlToText(html).split("\n").map((l) => l.trim());
  const blocks: Found[] = [];
  for (let i = 0; i < lines.length; i++) {
    if (lines[i] !== "기간") continue;
    const m = DATE_LINE.exec(lines[i + 1] ?? "");
    if (!m) continue;
    const title = (lines[i - 1] ?? "").trim();
    if (!title || title.length > 80) continue;
    const before = (lines[i - 2] ?? "").trim();
    const gu = /^[가-힣]{1,4}[구군]$/.test(before) ? before : undefined;
    const placeLine = lines.slice(i + 2, i + 5).find((l) => l.startsWith("장소"));
    blocks.push({
      code,
      title,
      start: m[1],
      ...(m[2] && m[2] !== m[1] ? { end: m[2] } : {}),
      ...(gu ? { gu } : {}),
      ...(placeLine ? { place: placeLine.replace(/^장소\s*/, "").trim().slice(0, 120) } : {}),
    });
  }
  if (!blocks.length) return { why: "기간이 없다" };
  // ⏳ 끝난 회차는 버린다 — 작년 페이지가 그대로 남아 있다.
  const live = blocks.filter((b) => (b.end ?? b.start) >= TODAY);
  if (!live.length) return { why: `지난 회차 (${blocks[0].start})` };
  // 🚨 올해 것이 여럿이면 기계가 못 가른다 → 사람에게 넘긴다.
  const uniq = new Map(live.map((b) => [`${b.title}|${b.start}|${b.end ?? ""}`, b]));
  if (uniq.size > 1) return { why: `기간이 ${uniq.size}개라 못 가른다` };
  return { ok: [...uniq.values()][0] };
}

// ── 받아 온다 ────────────────────────────────────────────────────────────
const found: Found[] = [];
let got = 0;
let empty = 0;
const broke: string[] = [];

async function one(code: number) {
  try {
    const r = await fetchHtml(URL_OF(code), { timeoutMs: 20000 });
    if (r.status !== 200) { broke.push(`${code} → HTTP ${r.status}`); return; }
    got++;
    const { ok, why } = parse(code, r.html);
    if (ok) found.push(ok);
    else if (why === "기간이 없다") empty++;
    else if (why?.startsWith("기간이")) broke.push(`${code} → ${why}`);
  } catch (e) {
    // 🚨 왜 멈추지 않나 — 900쪽 중 한 쪽이 느린 것으로 전체를 버릴 이유가 없다.
    //    다만 **몇 개가 깨졌는지는 끝에 적는다.** 조용히 넘기지 않는다.
    broke.push(`${code} → ${(e as Error)?.message ?? "알 수 없는 오류"}`);
  }
}

console.log(`🎪 펀서울 낱장을 1..${MAX} 까지 두드린다 (한 번에 ${LANES}쪽)\n`);
for (let start = 1; start <= MAX; start += LANES) {
  const batch = [];
  for (let c = start; c < start + LANES && c <= MAX; c++) batch.push(one(c));
  await Promise.all(batch);
}
console.log(
  `📄 열린 쪽 ${got}개 · 기간이 적힌 올해 축제 ${found.length}곳 · 기간 없는 쪽 ${empty}개`,
);
if (broke.length) {
  console.log(`\n⚠️ 못 읽은 쪽 ${broke.length}개 — 조용히 넘기지 않는다:`);
  for (const b of broke.slice(0, 15)) console.log(`   ${b}`);
  if (broke.length > 15) console.log(`   … 그 밖 ${broke.length - 15}개`);
}

// ── 우리 축제와 맞춰 본다 ───────────────────────────────────────────────
const byKey = new Map<string, Found[]>();
for (const f of found) {
  const k = key(f.title);
  if (!k) continue;
  (byKey.get(k) ?? byKey.set(k, []).get(k)!).push(f);
}

interface Hit {
  start: string;
  end?: string;
  title: string;
  gu: string;
  place?: string;
  org: string;
  orgLink: string;
  page: string;
  source: "funseoul";
  fetchedAt: string;
}

const hits: Record<string, Hit> = {};
const guDiff: string[] = [];
const near: string[] = [];

for (const f of ALL_FESTIVALS) {
  if (!f.gu) continue;
  const k = key(f.name);
  const cands = byKey.get(k) ?? [];
  const exact =
    cands.length === 1
      ? cands[0]
      : cands.filter((c) => c.gu === f.gu).length === 1
        ? cands.find((c) => c.gu === f.gu)
        : undefined;
  if (!exact) {
    // 비슷한 것은 **저장하지 않는다.** 사람이 볼 후보로만 낸다.
    for (const [kk, arr] of byKey) {
      if (Math.min(kk.length, k.length) < 5) continue;
      if (kk.includes(k) || k.includes(kk)) {
        near.push(`   「${f.name}」(${f.gu})  ≈  「${arr[0].title}」(${arr[0].gu ?? "?"})  ${arr[0].start}`);
        break;
      }
    }
    continue;
  }
  if (exact.gu && exact.gu !== f.gu)
    guDiff.push(`   「${f.name}」 — 우리는 ${f.gu}, 펀서울은 ${exact.gu}`);
  hits[f.id] = {
    start: exact.start,
    ...(exact.end ? { end: exact.end } : {}),
    title: exact.title,
    gu: exact.gu ?? f.gu,
    ...(exact.place ? { place: exact.place } : {}),
    org: "서울시청 (펀서울)",
    orgLink: URL_OF(exact.code),
    page: URL_OF(exact.code),
    source: "funseoul",
    fetchedAt: TODAY,
  };
}

console.log(`\n✅ 우리 축제와 꼭 맞은 것 ${Object.keys(hits).length}곳`);
for (const [id, h] of Object.entries(hits))
  console.log(`   ${h.gu.padEnd(5)} ${h.start}${h.end ? `~${h.end}` : ""}  ${h.title}  [id ${id}]`);

if (guDiff.length) {
  console.log(`\n⚠️ 이름은 같은데 **구가 다른** 것 ${guDiff.length}건 — 받긴 받았다:`);
  for (const l of guDiff) console.log(l);
}
if (near.length) {
  console.log(`\n🔎 **사람이 봐야 할 후보** ${near.length}건 — 저장하지 않았다:`);
  for (const l of near.slice(0, 25)) console.log(l);
  console.log("   같은 축제가 맞으면 src/data/name-aliases.json 에 적어 둔다.");
}

// 📝 **표로 남긴다 — 맛보기로 돌린 날도.**
//
// 🐞 왜 이게 필요한가 (2026-10-06에 겪었다): 이 작업의 요약은 로그 한가운데에
//    찍히는데, 뒤에 붙은 audit-seed·build 가 수백 줄이라 **정작 볼 목록이 묻힌다.**
//    깃허브 로그는 끝에서부터 읽게 되므로 사실상 못 본다.
//    축제 신선도(audit-festival-freshness)가 하는 것과 같게 **파일로 남긴다.**
//    맛보기로 돌린 날도 남기는 이유 — 「저장하기 전에 먼저 보기」가 이 저장소의
//    순서인데, 볼 자리가 없으면 그 순서를 지킬 수 없다.
const REPORT = join(ROOT, "docs", "펀서울-축제-기간.md");
{
  const row = (h: Hit, id: string) =>
    `| ${h.start}${h.end ? ` ~ ${h.end}` : ""} | ${h.gu} | ${h.title.replace(/\|/g, "/")} | ${h.place?.replace(/\|/g, "/") ?? ""} | [펀서울](${h.page}) | \`${id}\` |`;
  const sorted = Object.entries(hits).sort((a, b) => a[1].start.localeCompare(b[1].start));
  writeFileSync(
    REPORT,
    `# 🎪 펀서울에 올라온 축제 기간\n\n` +
      `_${TODAY} 에 \`scripts/fetch-funseoul-dates.ts\` 가 받아 적었다. 손으로 고치지 말 것 — 다시 돌리면 덮어쓴다._\n\n` +
      `펀서울(festival.seoul.go.kr) 낱장 ${MAX}개를 두드려, **열린 쪽 ${got}개 · 기간이 적힌 올해 축제 ${found.length}곳**을 봤다.\n` +
      `그중 우리 축제와 **이름이 꼭 맞은 것이 ${sorted.length}곳**이다.\n\n` +
      `## ✅ 우리 축제에 붙은 것\n\n` +
      (sorted.length
        ? `| 기간 | 구 | 펀서울에 적힌 이름 | 장소 | 근거 | id |\n|---|---|---|---|---|---|\n` +
          sorted.map(([id, h]) => row(h, id)).join("\n")
        : "_없다._") +
      `\n\n## 🔎 사람이 봐야 할 후보 (저장하지 않았다)\n\n` +
      `이름이 비슷하지만 **꼭 맞지는 않아** 안 받은 것이다. 같은 축제가 맞으면\n` +
      `\`src/data/name-aliases.json\` 에 적으면 다음 실행부터 붙는다.\n\n` +
      (near.length ? "```\n" + near.join("\n") + "\n```" : "_없다._") +
      `\n\n## ⚠️ 구가 다른 것\n\n` +
      (guDiff.length
        ? "```\n" + guDiff.join("\n") + "\n```\n\n한강 축제처럼 여러 구에 걸친 행사라 그렇다. 엉뚱한 축제면 여기서 보인다."
        : "_없다._") +
      `\n\n## 🧱 못 읽은 쪽\n\n` +
      (broke.length ? "```\n" + broke.slice(0, 40).join("\n") + "\n```" : "_없다._") +
      `\n`,
  );
  console.log(`\n💾 docs/펀서울-축제-기간.md 에 표로 남겼다.`);
}

if (!APPLY) {
  console.log(`\n🔍 맛보기라 **날짜는 저장하지 않았다**(표만 남겼다). 저장하려면: npm run funseoul-dates -- --apply`);
  process.exit(0);
}

// 🔀 **덮어쓰지 않고 합친다.** 오늘 못 받은 축제의 날짜를 지우면, 한 번 실패한
//    날에 화면에서 날짜가 통째로 사라진다. 다만 **지난 것은 버린다.**
const prev: Record<string, Hit> = existsSync(OUT)
  ? (JSON.parse(readFileSync(OUT, "utf-8")).곳 ?? {})
  : {};
const merged: Record<string, Hit> = {};
for (const [id, h] of Object.entries(prev)) if ((h.end ?? h.start) >= TODAY) merged[id] = h;
Object.assign(merged, hits);

writeFileSync(
  OUT,
  JSON.stringify(
    {
      설명:
        "펀서울(festival.seoul.go.kr)에 서울시가 올려 둔 축제 기간. " +
        "scripts/fetch-funseoul-dates.ts 가 받는다. 손으로 고치지 말 것 — " +
        "손으로 적을 것은 src/data/festival-dates-manual.json 에 적는다.",
      받은날: TODAY,
      곳: merged,
    },
    null,
    1,
  ) + "\n",
);
console.log(`\n💾 ${Object.keys(merged).length}곳을 src/data/funseoul-dates.json 에 저장했다.`);
