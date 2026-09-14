#!/usr/bin/env node
// 🛣️ **서울시 「관광거리」 — 홍대·명동·가로수길 같은 동네를 받아 온다.**
//
// 사장님이 찾아 주셨다 (2026-09-14, 서울 열린데이터광장 화면을 캡처해 보내심).
//
// ── 왜 이게 필요했나 ────────────────────────────────────────────────────
// 앱에 **경복궁·창덕궁·종묘·홍대·명동·가로수길이 통째로 없었다.** 외국 손님이
// 서울에서 제일 먼저 찾는 이름들이다. 관광공사(KorService2)에서 받으려 했는데,
// 하나씩 물어보니 답이 이랬다:
//   · 「경복궁」 → **한복남 경복궁점** 하나 (한복 대여점)
//   · 「홍대」   → 호텔 5곳 · 폰케이스 가게 · AK플라자 · 상상마당
// 관광공사 장소 자료는 **개별 업소 목록**이라, 「홍대」 같은 **동네 자체**는
// 애초에 그런 이름으로 들어 있지 않다. 받아 올 데가 아니었던 것이다.
//
// 서울시 「관광거리」(OA-12929)가 바로 그 빈칸을 메운다 —
// visit seoul 공식 표기명 · 지번 주소 · **법정동** · 중심 좌표.
// 법정동이 있다는 게 특히 크다. 이 앱은 법정동을 뼈대로 쓴다(REGION_TREE).
//
// ── ⚠️ 2015년 자료다 ───────────────────────────────────────────────────
// 갱신주기가 「1회성」이고 2016-02-19 이후 갱신이 없다.
// **홍대·명동·가로수길은 10년 새 자리가 안 바뀌므로 이름·좌표는 쓸 만하다.**
// 다만 전화·영업 정보 같은 게 섞여 있으면 그건 쓰지 않는다 — 확인 못 한 것은 안 넣는다.
//
// ── 저작권 ──────────────────────────────────────────────────────────────
// 공공누리 **제1유형**(출처표시 · 상업적 이용 및 변경 가능). 저작권자 서울특별시.
// 지금 앱이 쓰는 관광공사 사진과 같은 등급이다.
//
// ── 돌리는 법 ───────────────────────────────────────────────────────────
//   SEOUL_OPEN_API_KEY=키 node scripts/fetch-tour-streets.mjs          # 맛보기
//   SEOUL_OPEN_API_KEY=키 node scripts/fetch-tour-streets.mjs --apply  # 저장
//
// ⚠️ 작업 세션(샌드박스)은 data.seoul.go.kr 이 막혀 있어 직접 못 돌린다.
//    .github/workflows/fetch-tour-streets.yml 로 Actions 에서 돌린다.

import { writeFileSync } from "node:fs";

const KEY = process.env.SEOUL_OPEN_API_KEY ?? "";
if (!KEY) {
  console.error("❌ SEOUL_OPEN_API_KEY 가 없다 — 워크플로에 시크릿을 넘겼는지 볼 것.");
  process.exit(1);
}
const APPLY = process.argv.includes("--apply");
const OUT = "src/data/tour-streets.json";

// 🕵️ UA 를 안 보내면 /json/ 을 달라고 해도 **XML 이 온다**
//    (2026-09-12 지하철 자료에서 80번 헛돌았다. 같은 함정을 두 번 밟지 않는다).
const UA =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36";
const API = "http://openapi.seoul.go.kr:8088";

/** 한국어판 · 영어판. 영어 표기는 12개 언어 화면에 그대로 쓸 수 있다. */
const SERVICES = [
  { name: "SebcTourStreetKor", label: "한국어" },
  { name: "SebcTourStreetEng", label: "영어" },
];

async function page(service, start, end) {
  const url = `${API}/${KEY}/json/${service}/${start}/${end}/`;
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "application/json" },
    signal: AbortSignal.timeout(25000),
  });
  const text = await res.text();
  if (!text.trim().startsWith("{")) {
    return { why: `JSON 이 아니다 — ${text.replace(/\s+/g, " ").slice(0, 220)}` };
  }
  return { json: JSON.parse(text) };
}

/** 응답 봉투는 서비스 이름을 열쇠로 쓴다. 못 찾으면 그대로 보여 준다. */
function unwrap(json, service) {
  const body = json?.[service];
  if (!body) {
    const head = json?.RESULT ?? Object.keys(json ?? {});
    return { why: `봉투 안에 ${service} 가 없다 — ${JSON.stringify(head).slice(0, 220)}` };
  }
  const code = body?.RESULT?.CODE;
  if (code && code !== "INFO-000") {
    return { why: `${code} ${body?.RESULT?.MESSAGE ?? ""}`.trim() };
  }
  return { total: Number(body.list_total_count ?? 0), rows: body.row ?? [] };
}

const out = {};
for (const svc of SERVICES) {
  console.log("\n" + "═".repeat(64));
  console.log(`🛣️ ${svc.name} (${svc.label})`);
  console.log("═".repeat(64));

  const first = await page(svc.name, 1, 5);
  if (first.why) {
    console.log(`   ⬜ 못 물어봤다 — ${first.why}`);
    console.log(`   ⚠️ 이건 "자료가 없다"는 뜻이 아니다. 둘을 뭉개지 않는다.`);
    continue;
  }
  const head = unwrap(first.json, svc.name);
  if (head.why) {
    console.log(`   ⬜ ${head.why}`);
    continue;
  }
  console.log(`   전체 ${head.total}줄`);

  // 🔎 **어떤 칸이 오는지 첫 줄을 통째로 찍는다.** 골라 찍으면 정작 필요한 칸을 놓친다
  //    (갤러리에서 공공누리 유형 칸을 찾을 때 쓴 방법 그대로).
  console.log("\n   ── 첫 줄 원문 " + "─".repeat(44));
  console.log(
    JSON.stringify(head.rows[0], null, 2)
      .split("\n")
      .map((l) => "   " + l)
      .join("\n")
  );
  console.log("   " + "─".repeat(58) + "\n");

  // 전부 받는다. 1,000줄씩이 이 창구의 한 번 한도다.
  const rows = [];
  for (let s = 1; s <= head.total; s += 1000) {
    const r = await page(svc.name, s, Math.min(s + 999, head.total));
    if (r.why) {
      console.log(`   ⚠️ ${s}번째부터 못 받았다 — ${r.why}`);
      break;
    }
    const u = unwrap(r.json, svc.name);
    if (u.why) {
      console.log(`   ⚠️ ${s}번째부터 — ${u.why}`);
      break;
    }
    rows.push(...u.rows);
    await new Promise((x) => setTimeout(x, 300)); // 연달아 두드리지 않는다
  }
  console.log(`   받은 것 ${rows.length}줄 / ${head.total}줄`);
  out[svc.name] = rows;

  // 이름만 훑어본다 — 우리가 찾던 것이 실제로 들어 있나
  const names = rows
    .map((r) => r.TITLE ?? r.NAME ?? r.FNAME ?? Object.values(r)[3])
    .filter(Boolean);
  console.log(`\n   이름 30개만: ${names.slice(0, 30).join(" · ")}`);
  const want = ["홍대", "명동", "가로수길", "이태원", "인사동", "북촌", "성수", "익선"];
  const hit = want.filter((w) => names.some((n) => String(n).normalize("NFC").includes(w)));
  console.log(`   찾던 이름 중 들어 있는 것: ${hit.length ? hit.join(" · ") : "(없음)"}`);
}

if (APPLY) {
  writeFileSync(OUT, JSON.stringify(out, null, 2) + "\n", "utf8");
  console.log(`\n💾 ${OUT} 에 저장했다.`);
} else {
  console.log(`\n👀 **맛보기다 — 아무것도 저장하지 않았다.** 넣으려면 --apply.`);
}

console.log(`
🚨 **이 목록을 그대로 seed.ts 에 넣지 않는다.**
   2015년 자료다. 이름·법정동·좌표는 쓸 만하지만, 바뀌는 정보(전화·영업)는
   확인 못 한 채로 넣지 않는다 — 빈 칸이 틀린 것보다 낫다.
   출처는 「서울특별시」로 밝힌다(공공누리 제1유형).`);
