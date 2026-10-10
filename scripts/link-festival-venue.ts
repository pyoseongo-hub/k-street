// 📍 **축제를 「열리는 장소」와 잇는다** — 그 장소 사진을 빌려 쓰기 위해서다.
//
// 사장님: **"축제 장소 이어서 사진 붙여"** (2026-10-11).
//
// ── 🚨 왜 필요한가 — 어제 숫자로 드러났다 ──────────────────────────────
//   관광사진 갤러리를 한도까지 훑어 **33곳**이 사진을 얻었는데 **축제는 0곳**이었다.
//   갤러리에는 「장소」 사진이 올라오지 「축제」 사진은 거의 안 올라온다 —
//   서울억새축제·월드컵공원은 「갤러리에 없음」이고, **하늘공원은 5장**이 있다.
//   억새축제는 바로 그 하늘공원에서 열린다. 사진이 없는 게 아니라 **못 잇고 있었다.**
//
// ── ✋ 빌려 쓰되 **속이지 않는다** ──────────────────────────────────────
//   🚫 이건 **축제 사진이 아니다.** 축제가 열리는 **장소** 사진이다.
//      그대로 축제 사진인 양 띄우면, 이 저장소가 가장 크게 데인 자리
//      (「남의 가게 사진이 떴다」)와 같은 꼴이 된다.
//   → 그래서 **화면에 「📍 하늘공원 사진」이라고 적는다.** 자료에도 왜 이었는지 남긴다.
//
// ── 🔎 잇는 법 — 지어내지 않는다 ────────────────────────────────────────
//   ① 장소는 **주최 측이 적은 것**만 쓴다 — 확정 일정의 `place`, 없으면 seed 의 `addr`.
//      ⚠️ 축제 이름에서 장소를 짐작하지 않는다(「한강」이 들어갔다고 한강공원이 아니다).
//   ② 그 글에 **우리 장소 이름이 통째로 들어 있어야** 한다. 비슷한 것은 안 잇는다.
//   ③ **같은 구**여야 한다 — 「남산(중구)」과 「남산(용산구)」이 뒤섞인 적이 있다.
//   ④ 두 글자 이름은 거른다 — 너무 흔해 엉뚱한 데 걸린다.
//
//   npm run festival-venue
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { ALL_FESTIVALS, ALL_PLACES } from "../src/data/seed";
import { guFestivalDate } from "../src/lib/guFestival";
import { galleryShotsFor } from "../src/lib/photoGallery";

const ROOT = process.cwd();
const OUT = join(ROOT, "src", "data", "festival-venue.json");
const TODAY = new Date().toISOString().slice(0, 10);
const N = (s: string) => s.normalize("NFC");

/**
 * 사진을 한 장이라도 가진 곳인가 — 빌려 올 것이 있어야 잇는 뜻이 있다.
 *
 * 🐞 **갤러리만 보다가 0곳이 나왔다** (2026-10-11 첫 실행). 서울숲·올림픽공원·
 *    남산골한옥마을·노들섬이 모두 「사진 없음」으로 걸러졌는데, 갤러리에 없을 뿐
 *    **대표 이미지는 갖고 있었다.** 사진 창구가 둘인데 하나만 본 것이다.
 */
const 사진있나 = (p: { gu: string; name: string; image?: string; thumb?: string }) =>
  Boolean(p.image || p.thumb) || galleryShotsFor(p.name, p.gu).length > 0;

/** 그 축제가 자기 사진을 갖고 있나. 있으면 빌릴 이유가 없다. */
const 제사진 = (f: { id: string; gu: string; name: string; image?: string; thumb?: string }) =>
  사진있나(f);

/**
 * 이름이 장소글에 **통째로** 들어 있나. 그것만 건다.
 *
 * 🧪 **느슨하게 해 봤다가 되돌렸다** (2026-10-11). 「이름의 첫 마디가 들어 있으면」으로
 *    넓히니 8곳 → 16곳이 됐는데, 늘어난 쪽에 틀린 것이 섞였다 —
 *      · 별빛축제(서울시립**과학관**) → 「서울시립 **북서울미술관**」
 *      · 책읽는 한강공원(**여의도한강공원**) → 「**여의도** 둘레길」
 *      · 서초뮤직앤아트페스티벌 → 「서울고속버스터미널 의류도매상가」
 *    「여의도」·「서울시립」 같은 세 네 글자는 너무 흔하다.
 *    **틀린 사진을 붙이는 것이 빈 칸보다 나쁘다** — 이 저장소가 가장 크게 데인 자리다.
 */
function 이름이걸리나(이름: string, 장소글: string): boolean {
  return 장소글.includes(이름);
}

const 이은것: Record<string, { gu: string; place: string; 왜: string; 사진수: number }> = {};
const 못이음: { id: string; name: string; gu: string; 장소글: string }[] = [];

for (const f of ALL_FESTIVALS) {
  if ((f.city ?? "seoul") !== "seoul") continue;
  if (제사진(f)) continue;

  // ① 주최 측이 적은 장소 → 없으면 우리 주소
  const 확정 = guFestivalDate(f.id);
  // 🚨 **주최 측이 적은 장소와 우리 주소만 쓴다.**
  //    메모(note)도 넣어 봤다 — 16곳까지 늘었지만 **틀린 것이 섞였다**:
  //    서초뮤직앤아트페스티벌 → 「서울고속버스터미널 의류도매상가」.
  //    빈 칸이 틀린 사진보다 낫다. 되돌렸다.
  const 장소글 = N([확정?.place, f.addr].filter(Boolean).join(" "));
  if (!장소글.trim()) {
    못이음.push({ id: f.id, name: f.name, gu: f.gu, 장소글: "(장소가 적혀 있지 않다)" });
    continue;
  }

  // ②③④ 같은 구 · 이름이 통째로 들어 있음 · 세 글자 이상 · 사진이 있는 곳
  const 후보 = ALL_PLACES.filter(
    (p) =>
      (p.city ?? "seoul") === "seoul" &&
      p.gu === f.gu &&
      p.category !== "festival" &&
      N(p.name).length >= 3 &&
      이름이걸리나(N(p.name), 장소글) &&
      사진있나(p),
  );
  if (!후보.length) {
    못이음.push({ id: f.id, name: f.name, gu: f.gu, 장소글: 장소글.slice(0, 60) });
    continue;
  }
  // 🚨 여럿이면 **가장 긴 이름**을 고른다 — 「한강공원」보다 「여의도한강공원」이 좁다.
  const 고름 = 후보.reduce((a, b) => (N(b.name).length > N(a.name).length ? b : a));
  이은것[f.id] = {
    gu: 고름.gu,
    place: 고름.name,
    왜: `주최 측이 적은 장소에 「${고름.name}」이 들어 있다 — ${장소글.slice(0, 50)}`,
    사진수: galleryShotsFor(고름.name, 고름.gu).length + (고름.image || 고름.thumb ? 1 : 0),
  };
}

const n = Object.keys(이은것).length;
console.log(`📍 사진 없는 서울 축제 ${n + 못이음.length}곳 중 **${n}곳**을 장소와 이었다`);
for (const [id, v] of Object.entries(이은것))
  console.log(`   ${id.padEnd(14)} → ${v.place} (${v.gu}) · 사진 ${v.사진수}장`);
if (못이음.length) {
  console.log(`\n❓ 못 이은 것 ${못이음.length}곳 — 그 구에 사진 있는 장소가 없거나, 장소가 안 적혀 있다`);
  for (const r of 못이음.slice(0, 40)) console.log(`   ${r.gu.padEnd(5)} ${r.name} — ${r.장소글}`);
}

writeFileSync(
  OUT,
  JSON.stringify(
    {
      _읽어보세요: [
        "📍 **축제 ↔ 열리는 장소.** 기계가 덮어쓴다 — 손으로 고치지 말 것.",
        "",
        "무엇에 쓰나 — 축제가 제 사진이 없을 때 **그 장소 사진을 빌려** 카드에 띄운다.",
        "관광사진 갤러리에는 「장소」 사진만 올라오고 「축제」 사진은 거의 없기 때문이다.",
        "",
        "🚫 **축제 사진인 척하지 않는다.** 화면에 「📍 <장소> 사진」이라고 적는다.",
        "✋ 장소는 **주최 측이 적은 것**(확정 일정의 place)이나 우리 주소에서만 읽는다.",
        "   축제 이름에서 짐작하지 않는다 — 「한강」이 들어갔다고 한강공원이 아니다.",
      ],
      받은날: TODAY,
      센것: { 이음: n, 못이음: 못이음.length },
      곳: 이은것,
    },
    null,
    2,
  ) + "\n",
  "utf8",
);
console.log(`\n📝 ${OUT.replace(ROOT + "/", "")}`);
