// 🖼️ 사진 없는 곳을 **그림 갈래로 가를 수 있나** 세어 본다. 못 가르면 그림을 만들어도 못 쓴다.
import { ALL_PLACES, ALL_FESTIVALS } from "../src/data/seed";
const 모두 = [...ALL_PLACES, ...ALL_FESTIVALS].filter((p, i, a) => a.findIndex((x) => x.id === p.id) === i);
const 없 = 모두.filter((p) => !(p as { image?: string }).image && !(p as { thumb?: string }).thumb);

// 이름·설명에 든 낱말로 가른다. 겹치면 **위에 있는 것이 이긴다.**
const 규칙: [string, RegExp][] = [
  ["festival-night", /야시장|야간|밤마실|달밤|야식|밤|나이트|불빛|빛축제|등축제|루미나|야행/],
  ["festival-fireworks", /불꽃|фейер|firework/i],
  ["festival-flower", /꽃|벚꽃|장미|튤립|연꽃|국화|매화|진달래|유채|코스모스|수국|플라워/],
  ["festival-tradition", /문화제|전통|한복|국악|농악|제례|서낭|단오|대보름|종묘|궁|산대|탈춤|읍성|향교/],
  ["festival-day", /./],            // 나머지 축제는 전부 여기로
];
const 통 = new Map<string, number>();
const 담기 = (k: string) => 통.set(k, (통.get(k) ?? 0) + 1);
for (const p of 없) {
  const 글 = `${p.name} ${(p as { note?: string }).note ?? ""}`;
  if (p.category === "autumn") { 담기("autumn-road"); continue; }
  if (p.category === "street") { 담기(/시장|상점가|골목/.test(글) ? "street-market" : "street-tour"); continue; }
  if (p.category === "walk" || p.category === "hike") { 담기("walk-path"); continue; }
  if (p.category === "festival") { 담기(규칙.find(([, re]) => re.test(글))![0]); continue; }
  담기(`(갈래 없음: ${p.category})`);
}
console.log(`🖼️ 사진 없는 곳 ${없.length}곳 → 그림 ${통.size}갈래\n`);
for (const [k, v] of [...통].sort((a, b) => b[1] - a[1]))
  console.log(`   ${k.padEnd(20)} ${String(v).padStart(4)}곳   ${"█".repeat(Math.ceil(v / 8))}`);
