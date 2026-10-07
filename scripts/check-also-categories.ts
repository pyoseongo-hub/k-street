// 🌗 **두 칸에 걸치는 곳 표가 살아 있는지 본다** — src/data/also-categories.json.
//
// 사장님 지시 (2026-10-07): "둘다 넣을순 없나 / 밤 낮 둘다 틀린게 아니면"
//
// 🚨 왜 검사가 필요한가 — **이 표는 틀려도 아무 일이 안 일어난다.**
//    없는 id 를 적어 두면 그냥 조용히 무시된다. 오류도 없고 화면도 멀쩡하다.
//    그래서 「적어 뒀으니 됐다」고 믿고 지나간다 — 이 저장소가 id 밀림으로
//    여러 번 데인 자리와 같은 꼴이다(사진·좌표가 남의 것이 됐던 일).
//
//    특히 관광공사 contentId 를 열쇠로 쓰는 넷은 **자료를 다시 받으면 사라질 수**
//    있다. 그때 조용히 효력을 잃는 대신 **여기서 빨갛게 멈춘다.**
//
//   npm run check-also-categories
import { ALL_PLACES, HIDDEN_NO_PHOTO, CATEGORY_META, type Place } from "../src/data/seed";
import table from "../src/data/also-categories.json";

const 곳 = (table as { 곳?: Record<string, { 더?: string[]; 왜?: string }> })["곳"] ?? {};
const 아는갈래 = new Set(Object.keys(CATEGORY_META));
// 사진 게이트에 가려진 곳도 **있는 곳**이다 — 가려졌다고 표가 틀린 건 아니다.
const 모든곳 = new Map<string, Place>(
  [...ALL_PLACES, ...HIDDEN_NO_PHOTO].map((p) => [p.id, p]),
);
/** 🙈 사진이 없어 화면에서 가려진 곳. **붙었다고 보이는 건 아니다** — 그걸 따로 말해 준다. */
const 가려진것 = new Set(HIDDEN_NO_PHOTO.map((p) => p.id));

const 탈: string[] = [];
let 산것 = 0;

for (const [id, row] of Object.entries(곳)) {
  const p = 모든곳.get(id);
  if (!p) {
    탈.push(`❌ ${id} — 그런 곳이 없다. 자료를 다시 받으면서 id 가 바뀌었을 수 있다 (왜: ${row.왜 ?? "-"})`);
    continue;
  }
  const 더 = row.더 ?? [];
  if (!더.length) { 탈.push(`❌ ${id} (${p.name}) — 「더」가 비었다`); continue; }
  for (const c of 더) {
    if (!아는갈래.has(c)) 탈.push(`❌ ${id} (${p.name}) — 「${c}」는 없는 갈래다`);
    else if (c === p.category)
      탈.push(`❌ ${id} (${p.name}) — 「${c}」는 이미 대표 갈래라 아무 일도 안 한다`);
  }
  // 실제로 붙었나 — 덧입히는 자리(withAlsoCategories)가 빠지면 여기서 드러난다.
  const 붙은것 = (p as { alsoCategories?: string[] }).alsoCategories ?? [];
  const 빠진것 = 더.filter((c) => 아는갈래.has(c) && c !== p.category && !붙은것.includes(c));
  if (빠진것.length)
    탈.push(`❌ ${id} (${p.name}) — 표에는 「${빠진것.join("·")}」가 있는데 곳에는 안 붙었다`);
  if (!탈.length || 붙은것.length) 산것++;
}

console.log(`🌗 두 칸에 걸치는 곳 ${Object.keys(곳).length}개 적혀 있고, 실제로 붙은 것 ${산것}개\n`);
for (const [id, row] of Object.entries(곳)) {
  const p = 모든곳.get(id);
  if (!p) continue;
  const 붙은것 = (p as { alsoCategories?: string[] }).alsoCategories ?? [];
  console.log(
    `   ${붙은것.length ? "✅" : "⬜"} ${p.gu.padEnd(5)} ${p.name.padEnd(16)} ` +
      `대표 ${CATEGORY_META[p.category].label} + ${붙은것.map((c) => CATEGORY_META[c as keyof typeof CATEGORY_META].label).join("·") || "(없음)"}` +
      (가려진것.has(id) ? "   🙈 사진이 없어 화면에는 아직 안 나온다" : ""),
  );
}

if (탈.length) {
  console.log(`\n${탈.join("\n")}`);
  console.log("\n   고치는 곳: src/data/also-categories.json");
  process.exit(1);
}
console.log("\n✅ 이상 없음");
