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
function parse(code: number, html: string): { ok?: Found; ended?: Found; why?: string } {
  const lines = htmlToText(html).split("\n").map((l) => l.trim());
  const blocks: Found[] = [];
  for (let i = 0; i < lines.length; i++) {
    if (lines[i] !== "기간") continue;
    const m = DATE_LINE.exec(lines[i + 1] ?? "");
    if (!m) continue;
    // 🐞 **「기간」 바로 앞 줄이 이름이 아닐 때가 있다** (2026-10-09에 잡았다).
    //    사장님이 festacode=542 를 보여 줘서 알았다. 그 쪽의 글 순서는 이렇다 —
    //      도봉구 / 제15회 도봉한글잔치 / 2026-10-09 ~ 2026-10-09 / 방학동 원당샘공원 /
    //      홈페이지 / 관심 있어요 / 축제 안내 / **세부정보** / 기간 / 2026-10-09 ~ …
    //    즉 「기간」 앞 줄이 **「세부정보」**다. 이름을 「세부정보」로 읽어 버렸고,
    //    그래서 우리 「도봉한글잔치」와 영영 안 맞았다 — **조용히.**
    //    → 자리 이름 같은 줄은 넘기고 **이름처럼 생긴 줄**까지 거슬러 올라간다.
    const 자리말 = new Set([
      "세부정보", "축제 안내", "기간", "시간", "장소", "대상", "요금", "문의",
      "홈페이지", "관심 있어요", "축제 검색", "상세정보", "첨부파일", "주최", "주관",
    ]);
    let t = i - 1;
    while (t >= 0 && (!lines[t] || 자리말.has(lines[t]) || DATE_LINE.test(lines[t]))) t--;
    if (i - t > 8) continue; // 너무 멀면 엉뚱한 줄이다 — 지어내지 않는다
    const title = (lines[t] ?? "").trim();
    if (!title || title.length > 80) continue;
    const before = (lines[t - 1] ?? "").trim();
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
  // ⏳ 끝난 회차는 **날짜로는** 안 쓴다 — 작년 페이지가 그대로 남아 있다.
  //    🚨 다만 **버리지는 않는다** (2026-10-09에 고쳤다). 사장님이 festacode=542 를
  //       보여 줬다 — 「제15회 도봉한글잔치 2026-10-09 하루」. **어제 끝난 축제**다.
  //       그런데 우리 앱은 그 축제를 아직 「10월 축제」로 띄우면서 날짜는 비워 뒀다.
  //       끝난 것을 **알고 있었는데 버렸기 때문**이다. 손님이 헛걸음하는 쪽이 더 나쁘다.
  const live = blocks.filter((b) => (b.end ?? b.start) >= TODAY);
  if (!live.length) return { ended: blocks[blocks.length - 1], why: `지난 회차 (${blocks[0].start})` };
  // 🚨 올해 것이 여럿이면 기계가 못 가른다 → 사람에게 넘긴다.
  const uniq = new Map(live.map((b) => [`${b.title}|${b.start}|${b.end ?? ""}`, b]));
  if (uniq.size > 1) return { why: `기간이 ${uniq.size}개라 못 가른다` };
  return { ok: [...uniq.values()][0] };
}

// ── 받아 온다 ────────────────────────────────────────────────────────────
const found: Found[] = [];
/** ⏳ 펀서울에 올라와 있지만 **이미 끝난** 회차. 날짜로는 안 쓰고, 「끝났다」는 사실로 쓴다. */
const endedList: Found[] = [];
let got = 0;
let empty = 0;
/**
 * 🐞 **「기간이 없다」는 쪽이 정말 없는 것인지, 서버가 지친 것인지 가른다** (2026-10-09).
 *
 * 사장님이 festacode=542 를 보여 줬다 — 「제15회 도봉한글잔치 2026-10-09」.
 * 혼자 열어 보면 기간이 **똑똑히 적혀 있다.** 그런데 900쪽을 한 번에 두드린
 * 실행에서는 그 쪽이 **「기간이 없다」로 버려져** 있었다. 다섯 쪽씩 몰아치니
 * 서울시 서버가 더러 빈 쪽을 돌려준 것이다.
 *
 * → **한 번 더, 한 쪽씩 천천히** 두드린다. 그래도 없으면 정말 없는 것이다.
 *    「없는 것」과 「못 받은 것」을 가르는 이 저장소의 잣대 그대로다.
 */
const emptyCodes: number[] = [];
const broke: string[] = [];

async function one(code: number) {
  try {
    const r = await fetchHtml(URL_OF(code), { timeoutMs: 20000 });
    if (r.status !== 200) { broke.push(`${code} → HTTP ${r.status}`); return; }
    got++;
    const { ok, ended, why } = parse(code, r.html);
    if (ok) found.push(ok);
    else if (ended) endedList.push(ended);
    else if (why === "기간이 없다") { empty++; emptyCodes.push(code); }
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

// ── 🔁 **기간 없던 쪽을 한 쪽씩 천천히 다시 본다** ─────────────────────────
let 되살림 = 0;
if (emptyCodes.length) {
  console.log(`\n🔁 기간 없던 쪽 ${emptyCodes.length}개를 한 쪽씩 다시 두드린다 (0.8초 간격)`);
  for (const code of emptyCodes) {
    await new Promise((r) => setTimeout(r, 800));
    try {
      const r = await fetchHtml(URL_OF(code), { timeoutMs: 20000 });
      if (r.status !== 200) continue;
      const { ok, ended } = parse(code, r.html);
      if (ok) { found.push(ok); 되살림++; }
      else if (ended) { endedList.push(ended); 되살림++; }
    } catch {
      // 두 번째도 안 되면 정말 못 받는 쪽이다 — 조용히 넘기되 숫자로 남는다
    }
  }
  empty -= 되살림;
  console.log(`   ↳ 다시 받아 ${되살림}곳을 되살렸다 · 정말 기간 없는 쪽 ${empty}개`);
}
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
  // 🔀 **같은 축제가 펀서울에 여러 쪽으로 올라와 있다** (2026-10-06에 잡았다).
  //
  // 🐞 첫 실행에서 꼭 맞은 것이 6곳뿐이었다. 그런데 후보 목록을 보니
  //    「관악강감찬축제 ≈ 2026 관악강감찬축제」처럼 **다듬은 이름이 글자까지 같은 것**이
  //    열 줄 있었다. key() 를 따로 돌려 보니 둘이 정말 같았다 — 즉 이름 문제가 아니라
  //    **후보가 둘이어서** 「하나뿐이면 받는다」에 걸려 버린 것이었다.
  //    펀서울은 회차마다 쪽을 새로 내고 옛 쪽도 남겨 둔다.
  //
  // → **날짜·구가 같은 쪽은 같은 것으로 센다.** 쪽이 둘이라고 못 맞출 이유가 없다.
  //   날짜가 **다른** 것이 둘 이상 남으면 그때는 받지 않는다(상·하반기처럼 정말
  //   다른 회차일 수 있다). 애매하면 비워 두는 잣대는 그대로다.
  const cands = [
    ...new Map(
      (byKey.get(k) ?? []).map((c) => [`${c.start}|${c.end ?? ""}|${c.gu ?? ""}`, c]),
    ).values(),
  ];
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

// ── ⏳ **끝난 회차도 우리 축제에 맞춰 본다** (2026-10-09) ───────────────────
//    날짜로 쓰지는 않는다. 「올해 것은 이미 끝났다」는 사실로 쓴다 —
//    그걸 모르면 앱이 끝난 축제를 「이번 달 축제」로 계속 띄운다(도봉한글잔치가 그랬다).
const endedByKey = new Map<string, Found[]>();
for (const f of endedList) {
  const k = key(f.title);
  if (!k) continue;
  (endedByKey.get(k) ?? endedByKey.set(k, []).get(k)!).push(f);
}
const endedHits: Record<string, { start: string; end?: string; title: string; page: string }> = {};
for (const f of ALL_FESTIVALS) {
  if (hits[f.id]) continue; // 올해 날짜가 있으면 그게 이긴다
  const cands = endedByKey.get(key(f.name)) ?? [];
  if (!cands.length) continue;
  // 가장 **최근에 끝난** 회차를 쓴다
  const last = cands.reduce((a, b) => ((b.end ?? b.start) > (a.end ?? a.start) ? b : a));
  endedHits[f.id] = {
    start: last.start,
    ...(last.end && last.end !== last.start ? { end: last.end } : {}),
    title: last.title,
    page: URL_OF(last.code),
  };
}

// ── 📦 **펀서울에서 본 것을 전부 남긴다** ───────────────────────────────────
//    🚨 왜 (2026-10-09, 사장님: *"네이버 안보는거야"*) — 펀서울 낱장에서 **기간이
//    적힌 올해 축제 147곳**을 보고도 우리 자료에 붙은 것은 **15곳**이었다.
//    남은 132곳은 **보고도 안 되고 저장도 안 되고 조용히 사라졌다.** 사장님이 짚어 준
//    festacode=542(도봉한글잔치)가 그 안에 있었다. 「봤다」와 「썼다」를 가려 적는다.
const ALLOUT = join(ROOT, "src", "data", "funseoul-all.json");
const 쓴코드 = new Set(Object.values(hits).map((h) => Number(h.page.split("=").pop())));
const 안붙은것 = found.filter((f) => !쓴코드.has(f.code));
const slim = (f: Found) => ({
  code: f.code,
  title: f.title,
  ...(f.gu ? { gu: f.gu } : {}),
  start: f.start,
  ...(f.end ? { end: f.end } : {}),
  ...(f.place ? { place: f.place } : {}),
});
if (APPLY) {
  writeFileSync(
    ALLOUT,
    JSON.stringify(
      {
        _읽어보세요: [
          "🎪 펀서울(festival.seoul.go.kr) 낱장에서 **기간이 적힌 축제를 전부** 적어 둔 것.",
          "기계가 덮어쓴다 — 손으로 고치지 말 것.",
          "",
          "왜 전부 적나 (2026-10-09, 사장님: \"네이버 안보는거야\") —",
          "예전에는 **우리 이름과 꼭 맞은 것만** 남기고 나머지는 그냥 버렸다.",
          "그래서 「펀서울에 날짜가 있는데 우리 화면은 비어 있는 축제」가 보이지 않았다.",
          "이제 본 것을 다 적는다. `올해`는 아직 안 끝난 회차, `끝남`은 이미 지난 회차다.",
          "",
          "✋ 이 파일은 **화면이 바로 읽는 자리가 아니다.** 사람이 짝을 확인한 뒤",
          "   `festival-dates-manual.json` 에 적는다 — 이름이 다른 축제를 기계가",
          "   맞췄다고 믿으면 남의 축제 날짜가 붙는다(이 저장소에서 여러 번 당했다).",
        ],
        받은날: TODAY,
        센것: { 올해: found.length, 끝남: endedList.length, 우리것에붙음: Object.keys(hits).length },
        올해: found.map(slim).sort((a, b) => a.start.localeCompare(b.start)),
        끝남: endedList.map(slim).sort((a, b) => b.start.localeCompare(a.start)),
      },
      null,
      2,
    ) + "\n",
    "utf8",
  );
  console.log(`\n📦 ${ALLOUT.replace(ROOT + "/", "")} — 올해 ${found.length}곳 · 끝남 ${endedList.length}곳`);
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
  console.log("   같은 축제가 맞으면 src/data/festival-dates-manual.json 에 손으로 적는다.");
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
      `\`src/data/festival-dates-manual.json\` 에 손으로 적는다 — 이 스크립트는\n` +
      `\`name-aliases.json\` 을 읽지 않는다(그 표는 관광공사 이름을 잇는 자리다).\n\n` +
      (near.length ? "```\n" + near.join("\n") + "\n```" : "_없다._") +
      `\n\n## 📦 펀서울엔 날짜가 있는데 우리 축제엔 안 붙은 것 (${안붙은것.length}곳)\n\n` +
      `이름이 우리 것과 꼭 맞지 않아 그냥 지나간 것이다. **우리 자료에 아예 없는 축제**도 섞여 있다.\n` +
      `전체 목록은 \`src/data/funseoul-all.json\` 에 있다.\n\n` +
      (안붙은것.length
        ? `| 기간 | 구 | 펀서울에 적힌 이름 | 쪽 |\n|---|---|---|---|\n` +
          안붙은것
            .slice()
            .sort((a, b) => a.start.localeCompare(b.start))
            .slice(0, 80)
            .map((f) => `| ${f.start}${f.end ? ` ~ ${f.end}` : ""} | ${f.gu ?? ""} | ${f.title.replace(/\|/g, "/")} | [${f.code}](${URL_OF(f.code)}) |`)
            .join("\n")
        : "_없다._") +
      `\n\n## ⏳ 우리 축제인데 **올해 회차가 이미 끝난 것** (${Object.keys(endedHits).length}곳)\n\n` +
      `🚨 이게 제일 급하다 — 끝난 축제를 「이번 달 축제」로 띄우면 손님이 헛걸음한다.\n\n` +
      (Object.keys(endedHits).length
        ? `| 끝난 날 | 펀서울에 적힌 이름 | id | 쪽 |\n|---|---|---|---|\n` +
          Object.entries(endedHits)
            .sort((a, b) => (b[1].end ?? b[1].start).localeCompare(a[1].end ?? a[1].start))
            .map(([id, h]) => `| ${h.end ?? h.start} | ${h.title.replace(/\|/g, "/")} | \`${id}\` | [쪽](${h.page}) |`)
            .join("\n")
        : "_없다._") +
      `\n\n## ⚠️ 구가 다른 것\n\n` +
      (guDiff.length
        ? "```\n" + guDiff.join("\n") + "\n```\n\n한강 축제처럼 여러 구에 걸친 행사라 그렇다. 엉뚱한 축제면 여기서 보인다."
        : "_없다._") +
      `\n\n## 🧱 못 읽은 쪽\n\n` +
      // 🚨 **자르지 않는다** (2026-10-10). 40개만 적어 뒀더니, 사장님이 짚어 준
      //    festacode=542 가 목록 어디에도 없어 **왜 빠졌는지 알 수가 없었다.**
      //    「못 읽었다」는 사실은 짧게라도 전부 남아야 쫓아갈 수 있다.
      (broke.length ? "```\n" + broke.join("\n") + "\n```" : "_없다._") +
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
