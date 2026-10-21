// 📋 **「오늘 결정할 것」 한 장을 기계가 만든다.**
//
// 사장님 (2026-10-12): *"돌기만 하면 무슨 필요가 있나 / 내용 필요한 거면 서로 전달하거나 /
//                       실행할 수 있게 못해?"*
//
// ── 🐞 무엇이 문제였나 ──────────────────────────────────────────────────
//   루틴(AI 세션)은 돌고 나면 **아무 흔적도 안 남는다.** 그 세션이 끝나면 사라진다.
//   · 메일 루틴은 10/08 에 만든 뒤 나흘을 돌았는데 장부에 한 줄도 안 늘었다.
//   · 사진 채우기 루틴은 41일을 돌았는데 그 파일이 바뀐 건 한 번뿐이다.
//   · 그래서 오늘 **내가 메일을 처음부터 다시 확인했다** — 루틴이 두 시간 전에
//     같은 일을 하고 「성공」으로 끝났는데도.
//   원인은 하나다: **루틴은 말로만 하고, 말은 저장소에 안 남는다.**
//
// ── 🧰 그래서 ───────────────────────────────────────────────────────────
//   이 저장소에서 **잘 돌고 있는 구조가 이미 있다** — 기계(워크플로)가 긁어서
//   파일로 적는 것이다(collect-gu-news 가 오늘자로 후보 30건을 쌓아 뒀다).
//   기계는 쓰기 권한이 있고, 파일은 안 사라진다.
//   → 모아 두기만 하던 것들을 **한 장으로 묶어** 사람이 「고르기만」 하면 되게 한다.
//      루틴은 이 한 장만 읽으면 된다. 같은 일을 두 번 안 하게 된다.
//
// 🚫 **스스로 고치지 않는다.** 이 파일은 「무엇을 정해야 하나」만 적는다 —
//    넣고 빼는 것은 사람이 정한다(이 저장소의 「빈 칸이 틀린 정보보다 낫다」와 같은 줄).
//
//   npm run todo-board

import { readFileSync, writeFileSync } from "node:fs";
import { ALL_FESTIVALS } from "../src/data/seed";
import { CITY_BY_KEY } from "../src/data/cities";

const 오늘 = new Date().toISOString().slice(0, 10);
const 날수 = (ymd?: string) =>
  ymd && /^\d{4}-\d{2}-\d{2}$/.test(ymd)
    ? Math.round((Date.parse(오늘) - Date.parse(ymd)) / 86400000)
    : null;
const 읽기 = (p: string) => { try { return readFileSync(p, "utf8"); } catch { return ""; } };
const 제이슨 = (p: string) => { try { return JSON.parse(readFileSync(p, "utf8")); } catch { return null; } };

const 줄: string[] = [];
줄.push(`# 📋 오늘 전달사항 — K-Street · ${오늘}`);
줄.push("");
줄.push("> 🤖 **기계가 날마다 다시 만든다. 손으로 고치지 말 것** — 다음 판에 덮어쓴다.");
줄.push("> 만드는 곳: `scripts/build-todo-board.ts` · 날마다 `todo-board` 워크플로가 돌린다.");
줄.push(">");
줄.push("> 왜 있나 — 루틴은 돌고 나면 **말만 남기고 사라진다.** 그래서 같은 일을 두 번 했다.");
줄.push("> 이 한 장은 **안 사라지는 자리**다. 루틴도 사람도 여기부터 읽으면 된다.");
  줄.push("> 짝: Kfood 의 `docs/오늘-전달사항.md` — **두 저장소가 같은 이름**을 쓴다.");
줄.push("");

// ── ① 감시: 날마다 채워져야 하는 자리가 조용하지 않나 ────────────────────
// 🚨 **이게 맨 위다.** 자료가 안 들어오고 있으면 아래 목록은 전부 옛것이다.
//    「돌았는데 없었다」와 「안 돌았다」를 가를 수 있어야 한다.
const 지켜볼곳: { 이름: string; 받은날?: string; 한계: number; 누가: string }[] = [
  { 이름: "구청 새소식 (축제 글)", 받은날: 제이슨("src/data/gu-news-festivals.json")?.받은날, 한계: 2, 누가: "기계 · collect-gu-news" },
  { 이름: "구청 확정 날짜 (문화포털)", 받은날: 제이슨("src/data/gu-festival-dates.json")?.받은날, 한계: 2, 누가: "기계 · fetch-gu-festival-dates" },
  { 이름: "전국 축제 (한국문화정보원)", 받은날: 제이슨("src/data/culture-festivals.json")?.받은날, 한계: 2, 누가: "기계 · fetch-culture-festivals" },
];
// 📰 서울시 소식지 장부는 **사람(루틴)이 적는 자리**라 따로 본다 — 조용하면 그게 신호다.
const 장부글 = 읽기("docs/서울시-소식지-매일-확인.md");
const 장부날들 = [...장부글.matchAll(/^\|\s*(\d{4}-\d{2}-\d{2})\s*\|/gm)].map((m) => m[1]).sort();
지켜볼곳.push({
  이름: "서울시 소식지 장부", 받은날: 장부날들.at(-1), 한계: 2, 누가: "루틴 · 매일 08:52",
});

줄.push("## ① 자료가 들어오고 있나");
줄.push("");
줄.push("| 자리 | 마지막 | 며칠째 | 누가 채우나 |");
줄.push("|---|---|---:|---|");
let 조용한곳 = 0;
for (const s of 지켜볼곳) {
  const d = 날수(s.받은날);
  const 탈 = d === null ? "❓ 못 읽음" : d > s.한계 ? `🔴 ${d}일째` : `🟢 ${d}일`;
  if (d === null || d > s.한계) 조용한곳++;
  줄.push(`| ${s.이름} | ${s.받은날 ?? "—"} | ${탈} | ${s.누가} |`);
}
줄.push("");
if (조용한곳) {
  줄.push(`> 🔴 **${조용한곳}군데가 조용하다.** 자료가 안 들어오는 것인지, 들어왔는데 적는 자리가`);
  줄.push("> 막힌 것인지 먼저 가른다. 아래 목록보다 이게 먼저다.");
  줄.push("");
}

// ── ② 구청이 올렸는데 우리에 없는 축제 ──────────────────────────────────
const 구뉴스 = 제이슨("src/data/gu-news-festivals.json");
const 모르는것: { 구: string; 제목: string; link: string; 날짜?: string }[] = 구뉴스?.모르는것 ?? [];
줄.push(`## ② 구청이 올렸는데 우리에 없는 것 — ${모르는것.length}건`);
줄.push("");
if (!모르는것.length) 줄.push("새것 없음.");
else {
  줄.push("고를 때 보는 기준은 `docs/서울시-소식지-매일-확인.md` 와 같다 —");
  줄.push("**공모·모집·강좌·주민 대상은 뺀다. 관광객이 갈 수 있는 것만.**");
  줄.push("");
  줄.push("| 구 | 제목 | 올린 날 | 공지 |");
  줄.push("|---|---|---|---|");
  for (const g of 모르는것.slice(0, 25)) {
    const t = String(g.제목 ?? "").replace(/\|/g, "·").slice(0, 60);
    줄.push(`| ${g.구 ?? ""} | ${t} | ${g.날짜 ?? ""} | [열기](${String(g.link ?? "").replace(/&amp;/g, "&")}) |`);
  }
  if (모르는것.length > 25) 줄.push(`| … | **그 밖 ${모르는것.length - 25}건** — \`src/data/gu-news-festivals.json\` 에 다 있다 | | |`);
}
줄.push("");

// ── ③ 자료에는 있는데 달이 없어 달력에 못 들어가는 축제 ──────────────────
// ⏳ 이건 「없는 것」이 아니라 **있는데 안 보이는 것**이다. 날짜만 찾으면 바로 산다.
const 달없음 = ALL_FESTIVALS.filter((p) => p.startMonth == null);
const 도시별 = new Map<string, number>();
for (const p of 달없음) {
  const k = p.city ?? "seoul";
  도시별.set(k, (도시별.get(k) ?? 0) + 1);
}
줄.push(`## ③ 날짜가 없어 달력에 못 뜨는 축제 — ${달없음.length}곳`);
줄.push("");
줄.push("자료에는 있는데 **달이 비어 있어 어느 달을 눌러도 안 나온다.** 공지에서 올해 날짜를");
줄.push("찾아 `src/data/festival-dates-manual.json` 에 적으면 그날로 달력에 올라온다.");
줄.push("");
줄.push("| 시·도 | 곳 |");
줄.push("|---|---:|");
for (const [k, n] of [...도시별].sort((a, b) => b[1] - a[1]).slice(0, 8)) {
  줄.push(`| ${CITY_BY_KEY.get(k)?.ko ?? k} | ${n} |`);
}
줄.push("");
줄.push("가장 가까운 것 다섯 (이름에 지난 연도가 없는 것만):");
줄.push("");
const 올해 = new Date().getFullYear();
const 쓸만한것 = 달없음.filter((p) => {
  const 해 = [...p.name.matchAll(/20\d{2}/g)].map((m) => Number(m[0]));
  return !해.length || Math.max(...해) >= 올해;
});
for (const p of 쓸만한것.slice(0, 5)) {
  줄.push(`- **${p.name}** · ${CITY_BY_KEY.get(p.city ?? "seoul")?.ko ?? ""} ${p.gu}`);
}
줄.push("");

줄.push("---");
줄.push("");
줄.push("🛑 **이 파일은 정하지 않는다.** 무엇을 정해야 하는지만 적는다 —");
줄.push("넣고 빼는 것은 사람이 한다. 빈 칸이 틀린 정보보다 낫다.");
줄.push("");

const 나올곳 = "docs/오늘-전달사항.md";
writeFileSync(나올곳, 줄.join("\n") + "\n", "utf8");
console.log(`✅ ${나올곳}`);
console.log(`   조용한 자리 ${조용한곳} · 구청 후보 ${모르는것.length}건 · 날짜 없는 축제 ${달없음.length}곳`);
