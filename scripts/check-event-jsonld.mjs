// 🎪 **행사 구조화 자료가 구글 기준에 맞나** — 빌드 뒤에 돌린다.
//
// 왜 있나 (2026-09-11):
//   구글 서치 콘솔이 **메일로** 짚어 줬다 —
//     「이벤트 구조화된 데이터 문제 9개 · 심각한 문제: startDate 누락 · location 누락」
//   **심각한 문제가 있으면 그 페이지는 검색 결과에 아예 안 나온다.**
//   즉 축제 80곳에 Festival 표시를 해 두고도 값이 0이었다. 1년 가까이 그랬다.
//
//   🚨 **사람이 메일을 열어 봐야 알 수 있는 구조였다.** 그게 이 저장소가 반복해 데인
//      자리라(축제 신선도·새 축제도 같았다), 이번엔 기계가 먼저 잡게 한다.
//
// 무엇을 재나 — Festival 로 낸 페이지는 아래를 **반드시** 갖고 있어야 한다:
//   · startDate   (없으면 검색 결과에서 빠진다)
//   · location    (행사는 주소를 location 안에 넣는다. 장소와 규칙이 다르다)
// 그리고 **지난 날짜로 Festival 을 내지 않았는지**도 본다 — 오류를 없애려고 작년
// 날짜를 적어 넣는 것이 가장 나쁜 선택이기 때문이다(손님이 헛걸음한다).
//
// 돌리는 법:
//   npm run build && npm run place-pages
//   node scripts/check-event-jsonld.mjs
//
// ⚠️ 이 검사는 **진짜로 실패하는 것을 보고** 채택했다. 고치기 전 코드로 돌렸더니
//    Festival 307곳 중 축제 전부를 startDate·location 없음으로 잡았다.

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PLACES = join(ROOT, "dist", "place");

if (!existsSync(PLACES)) {
  console.error("❌ dist/place 가 없다. 먼저 `npm run build && npm run place-pages` 를 돌릴 것.");
  process.exit(2);
}

const TODAY = new Date().toISOString().slice(0, 10);
let festivals = 0;
const bad = [];

for (const slug of readdirSync(PLACES)) {
  const file = join(PLACES, slug, "index.html");
  if (!existsSync(file)) continue;
  const html = readFileSync(file, "utf-8");
  const m = html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s);
  if (!m) continue;

  let blocks;
  try {
    const parsed = JSON.parse(m[1]);
    blocks = Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    bad.push([slug, "구조화 자료가 JSON 으로 안 읽힌다"]);
    continue;
  }

  for (const d of blocks) {
    // Festival 은 Event 의 한 갈래다. 다른 Event 갈래를 나중에 쓰더라도 같이 잡히게 둔다.
    if (!/Festival|Event/.test(String(d["@type"] ?? ""))) continue;
    festivals++;
    if (!d.startDate) bad.push([slug, "startDate 없음 (검색 결과에서 빠진다)"]);
    if (!d.location) bad.push([slug, "location 없음 (검색 결과에서 빠진다)"]);
    else if (!d.location.address) bad.push([slug, "location 안에 address 가 없다"]);
    // 🚨 지난 날짜로 행사를 내면 손님이 헛걸음한다 — 빈 칸이 틀린 값보다 낫다.
    if (d.startDate && d.startDate < TODAY)
      bad.push([slug, `지난 날짜로 행사를 냈다 (${d.startDate})`]);
  }
}

console.log(`🎪 행사로 낸 페이지: ${festivals}곳 (오늘 ${TODAY} 기준)`);
if (festivals === 0) {
  console.log("   ⏳ 아직 0곳이다 — 관광공사에 올해 회차가 안 올라왔다는 뜻이고, 정상이다.");
  console.log("      올라오면 fetch-festival-dates 의 「🆕 새 축제」 알림이 울린다.");
}

if (bad.length) {
  console.log("");
  for (const [slug, why] of bad.slice(0, 20)) console.log(`   ❌ ${slug} — ${why}`);
  if (bad.length > 20) console.log(`   … 그 밖에 ${bad.length - 20}건`);
  console.log(`\n❌ 행사 구조화 자료 문제 ${bad.length}건 — 이대로면 구글이 그 페이지를 안 띄운다`);
  process.exit(1);
}

console.log("\n✅ 심각한 문제 없음 (startDate · location 다 갖췄거나, 행사로 내지 않았다)");
