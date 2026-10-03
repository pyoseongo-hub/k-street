#!/usr/bin/env node
// 🛣️ **서울시 「관광거리」를 앱에 넣는다 — 이름과 자리만.**
//
// 사장님 지시 (2026-10-03): *"자료없는거 이름 만 넣고 안내문구 넣어"*
//
// ── 왜 ──────────────────────────────────────────────────────────────────
// 2026-09-14에 사장님이 찾아 주신 서울시 「관광거리」(OA-12929) 134곳을
// `fetch-tour-streets.mjs` 로 받아 `src/data/tour-streets.json` 에 넣어 뒀는데,
// **앱에 넣는 단계를 아무도 안 했다.** 134곳 중 앱에 있는 것은 5곳이고
// **129곳이 받아 놓은 채 잠들어 있었다** — 피맛골 · 명동거리 · 삼청동문화거리 ·
// 무교동음식문화의거리 · 논현동포차골목 · 먹자골목 여섯 군데가 그 안에 있다.
//
// ── 무엇을 넣고 무엇을 안 넣나 ───────────────────────────────────────────
//   ✅ 넣는다 — 이름 · 자치구 · 법정동 · 지번 주소 · 중심 좌표.
//      전부 서울시가 직접 등록한 값이다(공공누리 제1유형, 저작권자 서울특별시).
//   ❌ 안 넣는다 — 사진 · 소개 글 · 영업시간 · 가게 목록.
//      **자료가 없다.** 지어내지 않는다 — 빈 칸이 틀린 정보보다 낫다.
//   📝 대신 카드에 **안내문구**를 띄운다(translations.ts 의 `nameOnlyNote`).
//      "이름과 자리만 있습니다 — 자세한 것은 이름을 눌러 보세요".
//      아무 말 없이 이름만 두면 손님은 "앱이 부실하다"고 읽는다.
//
// ── ⚠️ 2015년 자료다 ────────────────────────────────────────────────────
// 갱신주기가 「1회성」이고 2016-02-19 이후 갱신이 없다. 그래서:
//   · **이름·자리는 쓴다** — 명동·가로수길·피맛골은 10년 새 안 움직였다.
//   · **「30년전통마장동먹자골목」은 KOR_ALIAS(마장동먹자골목)를 쓴다.**
//     2015년에 「30년」이면 지금은 40년이다. 세어 보지 않은 연수는 적지 않는다.
//   · 포장마차촌처럼 **자리가 자주 바뀌는 것은 이 자료에 아예 없다**(0건).
//     없는 것을 넣으려 하지 않는다.
//
// ── 돌리는 법 ───────────────────────────────────────────────────────────
//   node scripts/build-seoul-streets.mjs          # 맛보기 (파일 안 건드림)
//   node scripts/build-seoul-streets.mjs --apply  # src/data/seoul-streets.json 에 쓴다
//
// 🔒 **id 는 고정이다.** `sst_` + 서울시 MAIN_KEY. 서울시 열쇠를 그대로 쓰므로
//    자료를 다시 받아도 같은 id 가 나온다 — 사진·주소(slug)가 안 갈린다.
//    이 저장소가 id 재사용으로 데어 본 것과 같은 이야기다.
import { readFileSync, writeFileSync } from "node:fs";

const APPLY = process.argv.includes("--apply");
const SRC = "src/data/tour-streets.json";
const OUT = "src/data/seoul-streets.json";
const SEOUL = "src/data/seoul-places.json";

const nfc = (s) => String(s ?? "").normalize("NFC").trim();

const SEOUL_GU = new Set(
  ("종로구 중구 용산구 성동구 광진구 동대문구 중랑구 성북구 강북구 도봉구 노원구 은평구 " +
   "서대문구 마포구 양천구 강서구 구로구 금천구 영등포구 동작구 관악구 서초구 강남구 송파구 강동구")
    .split(" "),
);

// ── 🏷️ **이름을 보고 칸을 가른다** (2026-10-03에 128개 이름을 눈으로 훑고 넣었다) ──
//
// 서울시 자료에는 **종류 칸이 없다.** 그래서 전부 「골목·거리」에 넣으려 했는데,
// 이름을 세로로 세워 읽어 보니 섞여 있었다:
//   · **순댓국집 여섯 곳** — 병천토속순대 · 신의주찹쌀순대(+영등포구청역점) ·
//     신촌명물순대 · 당리순대국 · 김가네순대국. 거리가 아니라 **가게 하나**다.
//     「골목·거리」에 넣으면 손님이 골목을 기대하고 가서 식당 문을 본다.
//     개별 맛집은 이 앱의 일이 아니다(Kfood 가 한다) — **빼는 것이 맞다.**
//   · **둘레길·순례길·산책로·자전거도로 여덟 곳** — 걷는 길이다. `walk` 칸이 있다.
//   · **벚꽃길 한 곳**(안양천제방벚꽃길) — `flower` 칸이 있다.
// 칸을 안 가르면 손님은 「골목·거리」를 눌러 산책로와 식당을 보게 된다.
//
// 🚨 **이름 규칙은 마지막 수단이다.** 종류 칸이 있으면 그걸 써야 한다 —
//    이 저장소가 관광공사 분류 코드로 옮겨 간 이유가 그것이다(tour-categories.mjs).
//    여기는 종류 칸이 없어서 어쩔 수 없이 이름을 본다. 그래서 **목록을 박아 둔다** —
//    규칙으로 짐작하면 다음에 비슷한 이름이 들어올 때 조용히 틀린다.
const NOT_A_STREET = new Set([
  "병천토속순대",
  "신의주찹쌀순대",
  "신의주찹쌀순대영등포구청역점",
  "신촌명물순대",
  "당리순대국",
  "김가네순대국",
]);
// ── 🔁 **이미 앱에 다른 칸으로 들어가 있던 여덟 곳** (2026-10-03) ──────────
//
// 처음엔 `seoul-places.json` **하나만** 보고 중복을 걸렀다. 그런데 앱의 곳은
// 거기만 있는 게 아니다 — 단풍길(`autumn-roads.json`) · 관광공사 옛 자료
// (`tourPlaces.ts`) · 손으로 적은 것(`seed.ts`)이 전부 ALL_PLACES 로 합쳐진다.
// 그래서 **가로수길과 능동로가 두 번** 들어갔고, `check-place-pages` 가
// 「같은 언어 안에서 제목이 똑같은 묶음 36개」로 잡아 줬다.
// (중복 검사를 한 자료에만 대 보면 조용히 틀린다 — 이 저장소의 오랜 교훈이다.)
//
// 같은 곳인지 **한 곳씩 눈으로 확인하고** 적었다. 자치구까지 같은 것만 뺀다 —
// 「먹거리촌」은 금천구·금정구·경주시에 각각 있고 서로 다른 곳이다.
const ALREADY_IN_APP = new Map([
  ["능동로", "단풍길 autumn_7 (광진구) — 같은 길"],
  ["삼청동길", "단풍길 autumn_1 (종로구) — 같은 길"],
  ["가로수길", "단풍길 autumn_51 · 관광공사 「신사동 가로수길」(강남구) — 같은 길"],
  ["화랑로낙엽거리", "단풍길 autumn_79 「화랑로」(노원구) — 그 길의 낙엽 구간이다"],
  ["신촌이대거리", "관광공사 「이대거리」 tour_2667611 (서대문구) — 같은 거리"],
  ["신길동홍어거리", "관광공사 「영등포 신길동 홍어거리」 tour_749355 — 같은 거리"],
  ["인현시장먹거리", "관광공사 「인현시장」 tour_2522037 (중구) — 그 시장의 먹거리 칸이다"],
  ["돌담길", "관광공사 「덕수궁 돌담길」 tour_129186 (중구) — 같은 길"],
]);
const WALK_RE = /(산책로|자전거도로|둘레길|순례길)/;
const FLOWER_RE = /(벚꽃길)/;

const rows = JSON.parse(readFileSync(SRC, "utf-8")).SebcTourStreetKor ?? [];
// 이미 앱에 있는 것은 빼야 한다. 이름으로 본다 — 서울시 열쇠와 관광공사 번호는
// 서로 다른 체계라 번호로는 맞춰 볼 수 없다.
//
// 🚨 **파일 전체를 문자열로 뒤지면 안 된다** (처음에 그렇게 썼다가 잡았다).
//    앱 자료의 `addr` 에 도로명이 들어 있어서 **「테헤란로」·「정동길」·「능동로」·
//    「계동길」·「현충로」 다섯 거리가 "이미 있다"고 잘못 걸러졌다.**
//    「서울특별시 강남구 테헤란로 …」라는 주소에 글자가 들어 있을 뿐인데.
//    그래서 **곳 이름만** 모아 놓고 거기서만 본다.
//
// 🚨 **띄어쓰기를 떼고 비교한다** (두 번째로 잡은 것). 서울시는 「우이동먹거리마을」,
//    앱은 「우이령 숲속문화마을(구 우이동 먹거리마을)」 — 같은 곳인데 **공백 하나**
//    때문에 `includes` 가 안 맞아 같은 골목이 두 번 들어갈 뻔했다.
const bare = (s) => nfc(s).replace(/[\s()·.,\-–—"'「」『』]/g, "");
const seoulRows = JSON.parse(readFileSync(SEOUL, "utf-8"));
const existingNames = (Array.isArray(seoulRows) ? seoulRows : [])
  .map((r) => bare(r?.name))
  .filter(Boolean);

const out = [];
const skipped = { 이미있음: [], 구이상: [], 좌표없음: [], 거리아님: [] };
const usedIds = new Set();
const usedNames = new Set();

for (const r of rows) {
  // 「30년전통…」처럼 연수가 박힌 이름만 KOR_ALIAS 로 바꾼다. 나머지는 NAME_KOR —
  // KOR_ALIAS 는 동네 이름을 떼어 버리는 때가 있어서(「가구거리」) 기본으로는 못 쓴다.
  const full = nfc(r.NAME_KOR) || nfc(r.NM_DP).replace(/\//g, "");
  const name = /\d+\s*년/.test(full) ? nfc(r.KOR_ALIAS) || full : full;
  const gu = nfc(r.LAW_SGG);
  const dong = nfc(r.LAW_HEMD);
  const lat = Number(r.WGS84_Y);
  const lng = Number(r.WGS84_X);

  if (!name) continue;
  // 이름이 이미 서울 자료 안에 있으면 건너뛴다.
  // 같은 이름이거나, **있는 이름이 이 이름을 품고 있으면** 같은 곳으로 본다 —
  // 「우이동먹거리마을」은 앱에 「우이령 숲속문화마을(구 우이동 먹거리마을)」로 있다.
  // ⚠️ 반대 방향(이 이름이 있는 이름을 품는 경우)은 **보지 않는다.**
  //    「무교동음식문화의거리」가 「무교동」을 품는다고 같은 곳이 아니다.
  const key = bare(name);
  if (existingNames.some((e) => e === key || e.includes(key))) {
    skipped.이미있음.push(name);
    continue;
  }
  if (NOT_A_STREET.has(name)) { skipped.거리아님.push(name); continue; }
  if (ALREADY_IN_APP.has(name)) { skipped.이미있음.push(`${name} ← ${ALREADY_IN_APP.get(name)}`); continue; }
  if (!SEOUL_GU.has(gu)) { skipped.구이상.push(`${name} (${gu})`); continue; }
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) { skipped.좌표없음.push(name); continue; }

  const id = `sst_${nfc(r.MAIN_KEY)}`;
  if (usedIds.has(id) || usedNames.has(name)) { skipped.이미있음.push(`${name} (같은 파일 안 중복)`); continue; }
  usedIds.add(id); usedNames.add(name);

  out.push({
    id,
    city: "seoul",
    gu,
    dong,
    category: FLOWER_RE.test(name) ? "flower" : WALK_RE.test(name) ? "walk" : "street",
    name,
    addr: nfc(r.ADD_KOR) || undefined,
    lat,
    lng,
    source: "seoul-street",
    // 📝 이 한 칸이 카드에 안내문구를 띄운다. 사진·소개 글이 채워지면 지운다.
    nameOnly: true,
    confirmed: true,
  });
}

// ── 📍 **여러 거리가 나눠 쓰는 좌표는 버린다** (2026-10-03에 세어 보고 알았다) ──
//
// 128곳에 좌표가 **72개뿐**이었다. 한 점을 2~7곳이 나눠 쓴다 —
//   · 양천구 7곳(축제의거리·바람의거리·평화의거리…)이 **모두 같은 점**
//   · 가로수길(신사동) · 압구정카페골목 · 압구정로데오거리가 **모두 같은 점**
// 한 점이 일곱 거리일 수는 없다. 그것은 그 거리의 자리가 아니라
// **등록 묶음의 대표 점**이다. 2015년 자료라 더 확인할 데도 없다.
//
// 좌표를 그대로 두면 길찾기가 손님을 **엉뚱한 골목으로 보낸다.** 이름이 틀린 것보다
// 나쁘다 — 손님이 실제로 그 자리까지 간다. 그래서 **나눠 쓰는 좌표는 비워 둔다.**
//   · 빈 좌표는 `fetch-coords` 가 나중에 **이름으로 다시 찾아** 채운다(그게 제 길이다).
//   · 좌표가 없어도 **지번 주소는 그대로 보여 준다** — 「관악구 서원동 일대」.
//   · 혼자 쓰는 좌표 41개는 **그대로 둔다.** 틀렸다는 근거가 없다.
const coordCount = new Map();
for (const p of out) {
  const k = `${p.lat.toFixed(6)},${p.lng.toFixed(6)}`;
  coordCount.set(k, (coordCount.get(k) ?? 0) + 1);
}
let dropped = 0;
for (const p of out) {
  const k = `${p.lat.toFixed(6)},${p.lng.toFixed(6)}`;
  if (coordCount.get(k) > 1) {
    delete p.lat;
    delete p.lng;
    p.coordShared = true; // 왜 비었는지 자료에 남겨 둔다 — 다음 사람이 또 세어 보지 않게
    dropped++;
  }
}

const byGu = {};
for (const p of out) byGu[p.gu] = (byGu[p.gu] ?? 0) + 1;

console.log(`🛣️  서울시 관광거리 ${rows.length}곳 → 새로 넣을 곳 ${out.length}곳`);
console.log(`   건너뜀 — 이미 있음 ${skipped.이미있음.length} · 구 이상 ${skipped.구이상.length} · 좌표 없음 ${skipped.좌표없음.length}`);
if (skipped.거리아님.length) console.log(`   🍜 거리가 아니라 가게라서 뺀 것 ${skipped.거리아님.length}곳 — ${skipped.거리아님.join(" · ")}`);
const byCat = {};
for (const p of out) byCat[p.category] = (byCat[p.category] ?? 0) + 1;
console.log(`   🏷️ 칸별 — ${Object.entries(byCat).map(([c, n]) => `${c} ${n}`).join(" · ")}`);
console.log(`   📍 좌표 — 혼자 쓰는 것 ${out.length - dropped}곳은 그대로, 나눠 쓰는 것 ${dropped}곳은 비웠다(fetch-coords 가 다시 찾는다)`);
console.log("   자치구별:", Object.entries(byGu).sort((a, b) => b[1] - a[1]).map(([g, n]) => `${g} ${n}`).join(" · "));
if (skipped.구이상.length) console.log("   ⚠️ 구 이름이 서울 25개가 아니다:", skipped.구이상.join(", "));

if (!APPLY) {
  console.log("\n맛보기였다. 저장하려면 --apply 를 붙인다.");
  console.log("보기 5곳:");
  for (const p of out.slice(0, 5)) console.log(`   ${p.name} | ${p.gu} ${p.dong} | ${p.lat},${p.lng}`);
  process.exit(0);
}

writeFileSync(OUT, JSON.stringify(out, null, 2) + "\n");
console.log(`\n✅ ${OUT} 에 ${out.length}곳을 적었다 — 커밋할 것.`);
