// 📊 홍보 글·영상 대본에 쓸 숫자를 **앱과 같은 자료로** 세어 준다.
//
// 왜 따로 만드나 (2026-09-05) — 홍보에 들어가는 숫자는 손으로 세거나 기억으로
// 적으면 안 된다. 이 저장소의 정확도 원칙 그대로다: **확인 못 한 것은 안 넣는다.**
// 특히 곳 수는 자료를 채울 때마다 바뀌므로, 대본을 쓰거나 고칠 때마다 다시 돌린다.
//
// 앱이 쓰는 seed 를 그대로 읽는다 — 잣대가 둘이면 화면과 홍보가 어긋난다.
//
//   npx vite build --ssr scripts/count-for-promo.ts --outDir dist-ssr
//   node dist-ssr/count-for-promo.js
import { ALL_PLACES, ALL_FESTIVALS } from "../src/data/seed";
import { SEOUL_HEX_ROWS } from "../src/data/seoulHexMap";

const ALL_GUS = SEOUL_HEX_ROWS.flatMap((r) => r.gus);
const withData = new Set(ALL_PLACES.map((p) => p.gu));
const empty = ALL_GUS.filter((g) => !withData.has(g));

const byCat: Record<string, number> = {};
for (const p of ALL_PLACES) byCat[p.category] = (byCat[p.category] ?? 0) + 1;

const photo = ALL_PLACES.filter((p) => p.image ?? p.thumb).length;
const fPhoto = ALL_FESTIVALS.filter((f) => f.image ?? f.thumb).length;

const months: Record<number, number> = {};
for (const f of ALL_FESTIVALS) if (f.startMonth) months[f.startMonth] = (months[f.startMonth] ?? 0) + 1;

console.log(`장소            ${ALL_PLACES.length}곳`);
console.log(`축제            ${ALL_FESTIVALS.length}곳`);
console.log(`합계            ${ALL_PLACES.length + ALL_FESTIVALS.length}곳`);
console.log(`자료 있는 구     ${withData.size} / ${ALL_GUS.length}개`);
console.log(`빈 구           ${empty.length}개${empty.length ? ` — ${empty.join(" · ")}` : ""}`);
console.log(`사진 있는 장소   ${photo}곳 (${((100 * photo) / ALL_PLACES.length).toFixed(0)}%)`);
console.log(`사진 있는 축제   ${fPhoto}곳 (${((100 * fPhoto) / ALL_FESTIVALS.length).toFixed(0)}%)`);
console.log(
  `갈래별          ${Object.entries(byCat)
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => `${k} ${v}`)
    .join(" · ")}`
);
console.log(
  `달별 축제        ${Object.entries(months)
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .map(([m, n]) => `${m}월 ${n}`)
    .join(" · ")}`
);
console.log(
  `\n⚠️ 달별 축제 수는 **해마다 바뀐다.** 대본에 숫자로 못 박지 말 것 —` +
    `\n   화면은 그날 자료로 다시 세지만 영상은 안 그렇다.`
);

// 🚨 겹치는지 본다 — ALL_PLACES 안에 이미 category:"festival" 이 들어 있어서,
//    두 목록을 그냥 더하면 같은 곳을 두 번 셀 수 있다. 홍보 숫자에 그런 게
//    섞이면 "부풀렸다"는 말을 듣는다. id 로 대조한다.
const placeIds = new Set(ALL_PLACES.map((p) => p.id));
const dup = ALL_FESTIVALS.filter((f) => placeIds.has(f.id));
const uniq = new Set([...ALL_PLACES.map((p) => p.id), ...ALL_FESTIVALS.map((f) => f.id)]);
console.log(`\n두 목록에 다 있는 곳  ${dup.length}곳`);
console.log(`id 로 센 진짜 합계     ${uniq.size}곳`);
console.log(dup.length ? "→ 285+80=365 는 겹쳐 센 값이다. 대본에는 위 숫자를 쓴다." : "→ 안 겹친다. 365 를 그대로 써도 된다.");

// ── 진짜 합계로 다시 센다 ────────────────────────────────────────────────
// 위 285/80 을 더하면 안 된다. 아래 숫자만 홍보에 쓴다.
const ALL = [...new Map([...ALL_PLACES, ...ALL_FESTIVALS].map((x) => [x.id, x])).values()];
const withAddr = ALL.filter((x) => x.addr).length;
const anyPhoto = ALL.filter((x) => x.image ?? x.thumb).length;
console.log(`\n── 홍보에 쓸 숫자 (겹침 뺀 값) ──`);
console.log(`전체            ${ALL.length}곳`);
console.log(`주소 있는 곳     ${withAddr}곳 (${((100 * withAddr) / ALL.length).toFixed(0)}%)`);
console.log(`사진 있는 곳     ${anyPhoto}곳 (${((100 * anyPhoto) / ALL.length).toFixed(0)}%)`);
console.log(`구              ${new Set(ALL.map((x) => x.gu)).size}개`);
