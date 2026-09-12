// 🏬 **서울시설공단 지하도상가 25곳**의 주소·좌표를 카카오 지도에서 찾는다.
//
// 사장님 지시 (2026-09-12):
//   "비오는날 쇼핑이나 실내시장 이런쪽 안내가 있으면 아주 좋아할 거야"
//   "틈새시장이라고 생각하고 퀄리티 있게 만들자"
//
// ─────────────────────────────────────────────────────────────────────────
// 🎯 왜 **지하도상가**인가 — 우리 원칙을 안 깨면서 「쇼핑」을 담는 유일한 길
// ─────────────────────────────────────────────────────────────────────────
//   사장님이 짚으셨다: "쇼핑 우리와 관계없지만 관광객 입장에선 쇼핑도 그 일부이니".
//   맞는 말인데, 백화점·브랜드 매장을 넣는 순간 **「왜 이 백화점만?」**이 생기고
//   그게 이 앱의 첫 번째 원칙(**돈 받고 노출을 올려주지 않는다**)이 무너지는 자리다.
//
//   지하도상가는 다르다:
//     · **서울시설공단(공공기관)이 운영한다** — 25곳 전부를 다 넣으면 고를 일이 없다
//     · **100% 지하다** — 비를 한 방울도 안 맞는다. 이 테마의 잣대에 정확히 맞는다
//     · **관광객이 실제로 쇼핑하는 곳이다** — 명동·남대문·동대문·고속터미널
//     · 상가마다 **공식 안내 페이지**가 있다 — 우리 원칙(항상 공식 링크)을 지킨다
//
// ─────────────────────────────────────────────────────────────────────────
// 🚨 왜 카카오에서 찾나 — 공단 사이트가 **해외에서 안 열린다**
// ─────────────────────────────────────────────────────────────────────────
//   sisul.or.kr 을 러너(미국)에서 열어 봤더니 UND_ERR_CONNECT_TIMEOUT 이다.
//   그래서 **이름 목록은 공단 안내에서 가져오고**(아래 MALLS),
//   **주소·좌표는 카카오 지도에서** 찾는다. 둘 다 확인 가능한 출처다.
//
//   ⚠️ 카카오가 돌려준 이름이 우리가 찾던 이름과 **다르면 안 쓴다.**
//      이 저장소가 사진에서 당한 것과 같은 사고다 — 검색 첫 결과를 이름 대조 없이
//      쓰면 **남의 가게 것**이 붙는다. placeNameMatches 와 같은 잣대를 여기도 건다.
//
// 쓰는 법: Actions → **Find underground malls** (맛보기), `apply` 를 켜면 파일로 쓴다.

import { writeFileSync } from "node:fs";

const KEY = process.env.KAKAO_REST_API_KEY ?? "";
const APPLY = process.argv.includes("--apply");
const OUT = "src/data/underground-malls.json";

if (!KEY) {
  console.error("❌ KAKAO_REST_API_KEY 가 없다. 워크플로에 시크릿을 넘겼는지 볼 것.");
  process.exit(1);
}

/**
 * 서울시설공단이 운영하는 지하도상가 — **6개 권역 25곳.**
 *
 * 출처: 서울시설공단 지하도상가 안내(sisul.or.kr/open_content/undershop/).
 *       상가총괄현황에 「25개 지하도상가 2,788개 점포」로 적혀 있다.
 *
 * 🚨 **여기 이름을 늘리지 말 것.** 공단이 운영하지 않는 지하상가(민간·역사 내
 *    상가)를 섞으면 「공공기관이 운영하는 것 전부」라는 이 목록의 성격이 깨지고,
 *    그 순간 「왜 이건 넣고 저건 뺐나」가 생긴다.
 *
 * `q` 는 카카오에 물어볼 말이다. 상가 이름만으로는 안 찾아지는 것이 있어
 * 역 이름을 붙여 둔 것이 있다.
 */
const MALLS = [
  // ① 을지로권
  { zone: "을지로", name: "을지로지하도상가", q: "을지로지하도상가" },
  { zone: "을지로", name: "을지로입구지하도상가", q: "을지로입구지하도상가" },
  { zone: "을지로", name: "시청광장지하도상가", q: "시청광장지하도상가" },
  { zone: "을지로", name: "인현지하도상가", q: "인현지하도상가" },
  { zone: "을지로", name: "신당지하도상가", q: "신당지하도상가" },
  // ② 종로권
  { zone: "종로", name: "종각지하도상가", q: "종각지하도상가" },
  { zone: "종로", name: "종로4가지하도상가", q: "종로4가지하도상가" },
  { zone: "종로", name: "종오지하도상가", q: "종로5가지하도상가" },
  { zone: "종로", name: "청계5가지하도상가", q: "청계5가지하도상가" },
  { zone: "종로", name: "청계6가지하도상가", q: "청계6가지하도상가" },
  { zone: "종로", name: "청량리지하도상가", q: "청량리지하도상가" },
  { zone: "종로", name: "마전교지하도상가", q: "마전교지하도상가" },
  { zone: "종로", name: "동대문지하도상가", q: "동대문지하도상가" },
  // ③ 명동권
  { zone: "명동", name: "소공지하도상가", q: "소공지하도상가" },
  { zone: "명동", name: "명동지하도상가", q: "명동지하도상가" },
  { zone: "명동", name: "명동역지하도상가", q: "명동역지하도상가" },
  { zone: "명동", name: "남대문지하도상가", q: "남대문지하도상가" },
  { zone: "명동", name: "회현지하도상가", q: "회현지하도상가" },
  // ④ 강남권
  { zone: "강남", name: "강남역지하도상가", q: "강남역지하도상가" },
  { zone: "강남", name: "잠실역지하도상가", q: "잠실역지하도상가" },
  { zone: "강남", name: "잠실지하광장", q: "잠실지하광장" },
  // ⑤ 강남터미널
  { zone: "강남터미널", name: "강남터미널지하도상가", q: "고속터미널지하상가 고투몰" },
  // ⑥ 영등포권
  { zone: "영등포", name: "영등포역지하도상가", q: "영등포역지하도상가" },
  { zone: "영등포", name: "영등포시장지하도상가", q: "영등포시장지하도상가" },
  { zone: "영등포", name: "영등포로터리지하도상가", q: "영등포로터리지하도상가" },
];

/**
 * 이름이 **같은 곳을 가리키나.**
 *
 * 카카오가 돌려준 이름과 우리가 찾던 이름을 맞춰 본다. 띄어쓰기·기호를 털고,
 * 「지하도상가/지하상가/지하쇼핑센터」는 같은 말로 본다(간판마다 다르게 쓴다).
 *
 * ⚠️ **NFC 먼저.** 자모가 분해된 글자는 화면에 똑같이 보여도 다른 문자열이다.
 */
function key(s) {
  return s
    .normalize("NFC")
    .replace(/지하도상가|지하쇼핑센터|지하상가/g, "지하상가")
    .replace(/[^0-9A-Za-z가-힣]/g, "")
    .toLowerCase();
}
function sameplace(want, got) {
  const a = key(want);
  const b = key(got);
  return a === b || b.includes(a) || a.includes(b);
}

async function kakao(q) {
  const url = `https://dapi.kakao.com/v2/local/search/keyword.json?${new URLSearchParams({
    query: q,
    size: "5",
    // 서울 안으로 묶는다 — 「영등포시장」 같은 이름은 다른 도시에도 있다.
    rect: "126.76,37.42,127.19,37.70",
  })}`;
  try {
    const r = await fetch(url, {
      headers: { Authorization: `KakaoAK ${KEY}` },
      signal: AbortSignal.timeout(20000),
    });
    const text = await r.text();
    if (!r.ok) return { ok: false, why: `HTTP ${r.status} — ${text.slice(0, 120)}` };
    return { ok: true, docs: JSON.parse(text).documents ?? [] };
  } catch (e) {
    return { ok: false, why: e?.cause?.code || e?.name || e?.message };
  }
}

console.log(`🏬 지하도상가 ${MALLS.length}곳의 주소·좌표를 찾는다\n`);

const found = [];
const missing = [];

for (const m of MALLS) {
  const r = await kakao(m.q);
  if (!r.ok) {
    console.log(`❌ ${m.name.padEnd(20)} — 못 물어봤다: ${r.why}`);
    missing.push({ ...m, why: r.why });
    continue;
  }
  // 🚨 **이름이 맞는 첫 결과**만 쓴다. 그냥 첫 결과를 쓰면 남의 곳이 붙는다.
  const hit = r.docs.find((d) => sameplace(m.name, d.place_name));
  if (!hit) {
    const names = r.docs.map((d) => d.place_name).slice(0, 3).join(" / ") || "(결과 없음)";
    console.log(`⏭️  ${m.name.padEnd(20)} — 이름이 맞는 결과가 없다. 나온 것: ${names}`);
    missing.push({ ...m, why: `이름 안 맞음: ${names}` });
    continue;
  }
  // 지번 주소에서 구·동을 뽑는다 — 도로명은 여러 동을 가로지른다(이 저장소의 규칙).
  const jibun = hit.address_name ?? "";
  const gu = /([가-힣]+구)\s/.exec(jibun)?.[1] ?? "";
  const dong = /[가-힣]+구\s([가-힣0-9]+(?:동|가))\b/.exec(jibun)?.[1] ?? "";
  const row = {
    name: m.name,
    zone: m.zone,
    kakaoName: hit.place_name, // 🔎 나중에 대조할 수 있게 **받은 이름 그대로** 남긴다
    gu,
    dong,
    addr: jibun,
    road: hit.road_address_name || undefined,
    lat: Number(hit.y),
    lng: Number(hit.x),
    kakaoUrl: hit.place_url,
  };
  found.push(row);
  console.log(
    `✅ ${m.name.padEnd(20)} ${gu || "?"} ${dong || ""}  ${row.lat.toFixed(5)}, ${row.lng.toFixed(5)}  ← ${hit.place_name}`,
  );
  await new Promise((r) => setTimeout(r, 120)); // 카카오에 너무 몰아치지 않는다
}

console.log(`\n찾은 곳 ${found.length}곳 · 못 찾은 곳 ${missing.length}곳`);
const noGu = found.filter((f) => !f.gu);
if (noGu.length) console.log(`⚠️  구를 못 뽑은 곳 ${noGu.length}곳: ${noGu.map((f) => f.name).join(", ")}`);

if (!APPLY) {
  console.log("\n📋 맛보기다(apply 를 안 켰다). 위 목록을 보고 켤 것.");
  process.exit(0);
}
writeFileSync(
  OUT,
  JSON.stringify(
    {
      받은날: new Date().toISOString().slice(0, 10),
      출처: "이름: 서울시설공단 지하도상가 안내 / 주소·좌표: 카카오 지도 키워드 검색",
      곳: found,
      못찾음: missing,
    },
    null,
    1,
  ) + "\n",
);
console.log(`\n✅ ${OUT} 에 ${found.length}곳을 적었다`);
