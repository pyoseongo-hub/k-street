// 📍 출시 전 좌표 검사 — 「이 카드의 길찾기를 누르면 정말 그 동네로 가는가」.
//
// 지금까지의 검사는 좌표가 **있는지**만 봤다. 값이 실제로 어디를 가리키는지는
// 아무도 안 봤다. 좌표는 숫자라 틀려도 눈에 안 띈다 — 손님이 40분 걸려 도착한
// 뒤에야 알게 된다. 그래서 좌표를 **거꾸로 주소로 바꿔** 우리가 적어 둔 구와
// 맞는지 대조한다(카카오 coord2regioncode).
//
// 이건 정확도 원칙의 연장이다: 틀린 좌표 < 빈 칸. 안 맞는 것이 나오면 그 값을
// 지우고 빈 칸으로 두는 편이 낫다.
//
// 실행 (GitHub Actions):  node scripts/check-coords.mjs links.json
// 샌드박스에서는 dapi.kakao.com을 못 불러서 못 돈다.

import fs from "node:fs";

const KEY = process.env.KAKAO_REST_API_KEY;
if (!KEY) {
  console.error("KAKAO_REST_API_KEY가 없다 — Actions 시크릿을 확인할 것.");
  process.exit(1);
}

const D = JSON.parse(fs.readFileSync(process.argv[2] ?? "links.json", "utf8"));
const byId = new Map();
for (const r of [...D.rows, ...D.festivals, ...D.hidden]) if (!byId.has(r.id)) byId.set(r.id, r);
const places = [...byId.values()].filter((p) => typeof p.lat === "number" && typeof p.lng === "number");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function regionOf(lat, lng) {
  const url = `https://dapi.kakao.com/v2/local/geo/coord2regioncode.json?x=${lng}&y=${lat}`;
  for (let i = 0; i < 3; i++) {
    try {
      const res = await fetch(url, { headers: { Authorization: `KakaoAK ${KEY}` } });
      if (res.status === 429) {
        await sleep(2000 * (i + 1));
        continue;
      }
      if (!res.ok) return { err: `HTTP ${res.status}` };
      const j = await res.json();
      // 법정동(B) 쪽을 본다 — 행정동(H)은 이름이 달라서 대조가 흐려진다.
      const d = j.documents?.find((x) => x.region_type === "B") ?? j.documents?.[0];
      if (!d) return { err: "결과 없음(바다·경계 밖일 수 있다)" };
      return { sido: d.region_1depth_name, gu: d.region_2depth_name, dong: d.region_3depth_name };
    } catch (e) {
      if (i === 2) return { err: String(e?.cause?.code ?? e?.message).slice(0, 40) };
      await sleep(1500 * (i + 1));
    }
  }
  return { err: "재시도 실패" };
}

console.log(`좌표가 있는 ${places.length}곳을 거꾸로 주소로 바꿔 대조한다.\n`);

const mismatch = [];
const outOfSeoul = [];
const failed = [];
let ok = 0;

for (const p of places) {
  const r = await regionOf(p.lat, p.lng);
  if (r.err) {
    failed.push([p, r.err]);
  } else if (r.sido !== "서울특별시") {
    outOfSeoul.push([p, r]);
  } else if (r.gu !== p.gu) {
    mismatch.push([p, r]);
  } else {
    ok++;
  }
  await sleep(40); // 카카오 쪽에 부담 주지 않게 천천히
}

console.log(`✅ 적어 둔 구와 일치 : ${ok}곳`);
console.log(`❌ 구가 다름        : ${mismatch.length}곳`);
console.log(`❌ 서울이 아님      : ${outOfSeoul.length}곳`);
console.log(`⚠️ 확인 못 함       : ${failed.length}곳`);

if (mismatch.length) {
  console.log(`\n── 구가 다른 곳 (좌표가 가리키는 곳이 다르다) ──`);
  for (const [p, r] of mismatch) {
    console.log(`  ${p.gu} ${p.name}`);
    console.log(`      우리 자료: ${p.gu}${p.dong ? " " + p.dong : ""}`);
    console.log(`      좌표 위치: ${r.gu} ${r.dong}   (${p.lat}, ${p.lng})`);
  }
}
if (outOfSeoul.length) {
  console.log(`\n── 서울 밖을 가리키는 곳 ──`);
  for (const [p, r] of outOfSeoul) console.log(`  ${p.gu} ${p.name} → ${r.sido} ${r.gu} ${r.dong}`);
}
if (failed.length) {
  console.log(`\n── 확인 못 한 곳 ──`);
  for (const [p, why] of failed) console.log(`  ${p.gu} ${p.name} — ${why}`);
}

console.log(
  `\n${mismatch.length + outOfSeoul.length ? "❌ 손봐야 할 좌표가 있다" : "✅ 좌표가 전부 적어 둔 구 안에 있다"}`
);
