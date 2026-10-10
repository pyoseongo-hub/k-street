// ⏳ **올해 회차가 이미 끝난 축제**를 가려 적는다.
//
// 왜 (2026-10-09, 사장님이 festacode=542 를 보여 주며) —
// 「제15회 도봉한글잔치 2026-10-09 하루」. **어제 끝난 축제**다. 그런데 우리 앱은
// 그걸 아직 「10월 축제」로 띄우면서 날짜는 비워 두고 있었다. 끝난 줄 모르니까다.
//
// 🚨 **끝난 줄 몰랐던 게 아니다 — 알고도 버렸다.** 펀서울을 매일 받아 오면서
//    「지난 회차」는 그냥 지나쳤다. 이제 funseoul-all.json 의 `끝남` 에 남는다.
//    이 스크립트가 그걸 **우리 축제 id 에 맞춰** festival-ended.json 으로 적는다.
//
// ✋ 이름이 꼭 맞는 것만 맞춘다(fetch-funseoul-dates.ts 와 **같은** 다듬기).
//    기계가 억지로 맞추면 남의 축제를 끝난 것으로 내려 버린다 — 그게 더 나쁘다.
//
//   npm run festival-ended
import { writeFileSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { ALL_FESTIVALS } from "../src/data/seed";

const ROOT = process.cwd();
const IN = join(ROOT, "src", "data", "funseoul-all.json");
const OUT = join(ROOT, "src", "data", "festival-ended.json");
const TODAY = new Date().toISOString().slice(0, 10);
const 올해 = TODAY.slice(0, 4);

/** 🚨 fetch-funseoul-dates.ts 의 key() 와 **글자 하나까지 같아야 한다.** */
function key(name: string): string {
  return name
    .normalize("NFC")
    .replace(/\[[^\]]*\]/g, " ")
    .replace(/\([^)]*\)/g, " ")
    .replace(/\b(19|20)\d{2}\b/g, " ")
    .replace(/제\s*\d+\s*회/g, " ")
    .replace(/[^0-9A-Za-z가-힣]/g, "")
    .toLowerCase();
}

interface Row { code: number; title: string; gu?: string; start: string; end?: string; place?: string }
const all = JSON.parse(readFileSync(IN, "utf8")) as { 끝남?: Row[] };
const 끝남 = all["끝남"] ?? [];

// 🗓️ **올해 끝난 것만 쓴다.** 펀서울에는 재작년 쪽도 그대로 남아 있다 —
//    작년 회차를 보고 「올해는 끝났다」고 적으면 열리는 축제를 내려 버린다.
const byKey = new Map<string, Row[]>();
for (const r of 끝남) {
  if ((r.end ?? r.start).slice(0, 4) !== 올해) continue;
  const k = key(r.title);
  if (!k) continue;
  (byKey.get(k) ?? byKey.set(k, []).get(k)!).push(r);
}

const 곳: Record<string, { start: string; end?: string; title: string; page: string }> = {};
for (const f of ALL_FESTIVALS) {
  const cands = byKey.get(key(f.name));
  if (!cands?.length) continue;
  const last = cands.reduce((a, b) => ((b.end ?? b.start) > (a.end ?? a.start) ? b : a));
  곳[f.id] = {
    start: last.start,
    ...(last.end && last.end !== last.start ? { end: last.end } : {}),
    title: last.title,
    page: `https://festival.seoul.go.kr/festival/main/festivalView.do?festacode=${last.code}`,
  };
}

const n = Object.keys(곳).length;
console.log(`⏳ 올해 회차가 이미 끝난 축제 ${n}곳`);
for (const [id, v] of Object.entries(곳)) console.log(`   ${(v.end ?? v.start)}  ${v.title}  [${id}]`);

writeFileSync(
  OUT,
  JSON.stringify(
    {
      _읽어보세요: [
        "⏳ **올해 회차가 이미 끝난 축제.** 기계가 덮어쓴다 — 손으로 고치지 말 것.",
        "",
        "근거는 펀서울(festival.seoul.go.kr)이 올려 둔 그 축제의 기간이다.",
        "scripts/build-festival-ended.ts 가 funseoul-all.json 의 `끝남` 을 우리 id 에 맞춰 적는다.",
        "",
        "무엇에 쓰나 — 달·계절 화면에서 **「올해는 끝났어요」로 내린다.**",
        "끝난 축제를 「이번 달 축제」로 띄우면 손님이 헛걸음한다.",
        "",
        "✋ 지우지는 않는다. 그 축제는 **내년에 또 열린다** — 자리는 남기고 상태만 바꾼다.",
      ],
      받은날: TODAY,
      곳,
    },
    null,
    2,
  ) + "\n",
  "utf8",
);
console.log(`📝 ${OUT.replace(ROOT + "/", "")}`);
