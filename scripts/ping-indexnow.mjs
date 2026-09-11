// 🔔 **바뀐 주소를 검색엔진에 먼저 알린다** (IndexNow).
//
// 무엇인가 —
//   보통은 검색엔진이 **제 발로 올 때까지 기다린다.** 며칠에서 몇 주가 걸린다.
//   IndexNow 는 반대로 **우리가 먼저 두드리는** 방법이다. 주소 목록을 한 번 보내면
//   빙(Bing)·야후·네이버·얀덱스가 **그 주소만** 다시 보러 온다.
//   보내는 곳 하나면 참여한 엔진에 같이 퍼진다.
//
// 왜 빙이 중요한가 (2026-09-11 사장님 계획서에서 나온 항목) —
//   **챗GPT·코파일럿의 검색 바탕이 빙이다.** 요즘 손님은 검색창이 아니라
//   대화창에서 여행 계획을 짠다. 구글 하나에만 걸려 있으면 그 자리에 우리가 없다.
//   구글은 IndexNow 를 안 쓴다 — 구글 쪽은 사이트맵과 서치 콘솔이 맡는다.
//
// 열쇠 —
//   `public/8b26e48d77134bf0626ee5f7db89b435.txt` 가 그 자리에 있어야 한다.
//   엔진이 그 파일을 열어 "이 주소의 주인이 맞다"를 확인한다.
//   🚨 **비밀값이 아니다.** 누구나 열어 볼 수 있어야 작동한다 — 그래서 저장소에 그냥 둔다.
//      다만 **지우거나 이름을 바꾸면** 그날부터 모든 알림이 거절당한다.
//
// 🚨 **아무 때나 보내지 않는다.** IndexNow 는 「바뀐 주소」를 알리는 것이다.
//    안 바뀐 주소를 매일 보내면 엔진이 **우리 알림을 무시하기 시작한다.**
//    그래서 이 스크립트는 저절로 돌지 않고, 두 자리에서만 불린다:
//      ① 축제 자료가 실제로 바뀐 날 — fetch-festival-dates 워크플로가 바뀐 주소만 보낸다
//      ② 사람이 큰 변화를 준 뒤 — Actions → "Ping IndexNow" 를 손으로 돌린다
//
// 돌리는 법:
//   node scripts/ping-indexnow.mjs --urls https://korea-street.com/place/foo/ ...
//   node scripts/ping-indexnow.mjs --from-file changed-urls.txt
//   node scripts/ping-indexnow.mjs --all          # dist/sitemap.xml 전체 (첫 등록용)
//   여기에 --dry-run 을 붙이면 **보내지 않고 무엇을 보낼지만** 보여 준다.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const HOST = "korea-street.com";
const KEY = "8b26e48d77134bf0626ee5f7db89b435";
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const ENDPOINT = "https://api.indexnow.org/indexnow";

// 한 번에 보낼 수 있는 최대치는 10,000개다. 그보다 작게 끊어 보내는 이유는
// 한 덩이가 실패했을 때 **어디까지 갔는지** 알기 위해서다.
const CHUNK = 1000;

const argv = process.argv.slice(2);
const has = (f) => argv.includes(f);
const valueOf = (f) => {
  const i = argv.indexOf(f);
  return i >= 0 ? argv[i + 1] : undefined;
};

const DRY = has("--dry-run");

/** dist/sitemap.xml 에 적힌 주소를 전부 읽는다 — 첫 등록 때만 쓴다. */
function fromSitemap() {
  const xml = readFileSync(join(ROOT, "dist", "sitemap.xml"), "utf-8");
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

function collectUrls() {
  if (has("--all")) return fromSitemap();
  const file = valueOf("--from-file");
  if (file) {
    return readFileSync(file, "utf-8")
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  const i = argv.indexOf("--urls");
  if (i >= 0) return argv.slice(i + 1).filter((s) => !s.startsWith("--"));
  return [];
}

// 🚨 **우리 주소가 아닌 것은 보내지 않는다.** IndexNow 는 남의 주소를 섞어 보내면
//    그 알림 전체를 거절한다(당연하다 — 아무나 남의 사이트를 건드리면 안 되니까).
//    그래서 걸러 낸 것이 있으면 **숫자를 적어 보여 준다.** 조용히 버리지 않는다.
const raw = collectUrls();
const mine = raw.filter((u) => u.startsWith(`https://${HOST}/`));
const urls = [...new Set(mine)];
// ⚠️ **두 가지를 갈라 센다.** 예전에 한 숫자로 뭉뚱그렸더니 「남의 주소 2개」라고
//    적혔는데 실은 남의 것 1개 + 중복 1개였다. 틀린 설명은 없는 것보다 나쁘다 —
//    다음 사람이 있지도 않은 문제를 찾으러 간다.
const foreign = raw.length - mine.length;
const dupes = mine.length - urls.length;

if (!urls.length) {
  console.log("보낼 주소가 없다 — 알리지 않고 끝낸다.");
  console.log("  (--urls / --from-file / --all 중 하나를 줘야 한다)");
  process.exit(0);
}

const notes = [
  foreign ? `우리 주소가 아닌 ${foreign}개` : null,
  dupes ? `겹치는 ${dupes}개` : null,
].filter(Boolean);
console.log(`보낼 주소 ${urls.length}개${notes.length ? ` (${notes.join(" · ")}는 뺐다)` : ""}`);
for (const u of urls.slice(0, 5)) console.log(`  · ${u}`);
if (urls.length > 5) console.log(`  … 그 밖에 ${urls.length - 5}개`);

if (DRY) {
  console.log("\n🧪 맛보기(--dry-run) — 실제로는 아무것도 안 보냈다.");
  process.exit(0);
}

let sent = 0;
let failed = 0;
for (let i = 0; i < urls.length; i += CHUNK) {
  const urlList = urls.slice(i, i + CHUNK);
  const body = { host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList };
  let res;
  try {
    res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(body),
    });
  } catch (e) {
    failed += urlList.length;
    console.log(`❌ ${i + 1}~${i + urlList.length}번째를 못 보냈다: ${e.message}`);
    continue;
  }
  // 200·202 가 받았다는 뜻이다. 202 는 "받았고 열쇠는 곧 확인하겠다".
  if (res.status === 200 || res.status === 202) {
    sent += urlList.length;
    console.log(`✅ ${i + 1}~${i + urlList.length}번째 보냄 (HTTP ${res.status})`);
  } else {
    failed += urlList.length;
    // 몸통에 이유가 적혀 온다 — 삼키지 말고 그대로 보여 준다.
    const text = await res.text().catch(() => "");
    console.log(`❌ ${i + 1}~${i + urlList.length}번째 거절됨 (HTTP ${res.status}) ${text.slice(0, 200)}`);
    // 403 은 열쇠 파일을 못 읽었다는 뜻이다. 뒤도 다 같은 이유로 실패하니 멈춘다.
    if (res.status === 403) {
      console.log(`   ↳ 열쇠 파일을 확인할 것: ${KEY_LOCATION}`);
      console.log("     (배포가 끝나기 전에 보내면 이 오류가 난다 — 배포 뒤에 보낼 것)");
      break;
    }
  }
  // 잇달아 때리지 않는다.
  if (i + CHUNK < urls.length) await new Promise((r) => setTimeout(r, 500));
}

console.log(`\n보낸 주소 ${sent}개 · 실패 ${failed}개`);
// 🚨 일부라도 실패하면 **실패로 끝낸다.** 초록불인데 아무것도 안 간 적이 이 저장소에 있었다.
process.exit(failed ? 1 : 0);
