#!/usr/bin/env node
// 🔎 **관광공사가 공식 다국어 이름을 주는가?**
//
// 왜 (2026-09-16) — 구글 번역이 일본어·중국어에서 고유명사를 망가뜨린다:
//   · 국청사(절)  → 国庁舎   (= 나라의 관공서 건물)
//   · 명지시장    → 明治市場 (= 메이지 시장. 명지는 鳴旨다)
//   · 잠수교      → ウェットスーツ (= 잠수복)
//   · 뚜벅뚜벅    → トゥクトゥク  (= 태국 삼륜차)
//   영어는 로마자로 잘 옮기는데, 한자권에서는 **없는 한자를 지어낸다.**
//   우리가 손으로 한자를 만들어 넣을 수는 없다 — 그건 확인 못 한 것을 넣는 일이다.
//
// 🪪 그런데 관광공사는 **언어별 서비스**를 따로 낸다고 알려져 있다.
//    사실이면 그 이름은 **공식 표기**라 지어낼 필요가 없다.
//    ⚠️ 그래서 이 스크립트는 **확인만 한다.** 아무것도 저장하지 않는다.
//
//   TOUR_API_KEY=... node scripts/probe-tour-langs.mjs
import { readFileSync } from "node:fs";
import { fetchWithRetry } from "./lib/tour-fetch.mjs";

const KEY = process.env.TOUR_API_KEY;
if (!KEY) { console.error("❌ TOUR_API_KEY 가 없다."); process.exit(1); }

// 🚨 **이름을 외워서 넣는 것이므로 틀릴 수 있다.** 그래서 하나씩 물어보고
//    되는 것만 남긴다 — 안 되는 것은 「없다」가 아니라 「이 이름으로는 안 된다」로 적는다.
const SERVICES = [
  ["KorService2", "국문"], ["EngService2", "영문"], ["JpnService2", "일문"],
  ["ChsService2", "중문 간체"], ["ChtService2", "중문 번체"],
  ["GerService2", "독문"], ["FreService2", "불문"], ["SpnService2", "서문"], ["RusService2", "노문"],
];

// 확인에 쓸 곳 — 구글이 실제로 틀린 것들이다.
const SAMPLES = [
  ["2758562", "잠수교 계열(서울)"],
  ["129156", "부산 표본 1"],
  ["2726843", "부산 표본 2"],
];

async function call(service, path, params) {
  const q = new URLSearchParams({ MobileOS: "ETC", MobileApp: "KStreet", _type: "json", ...params });
  const res = await fetchWithRetry(`https://apis.data.go.kr/B551011/${service}/${path}?serviceKey=${KEY}&${q}`);
  const text = await res.text();
  if (!res.ok) throw new Error(`HTTP ${res.status} — ${text.slice(0, 120).replace(/\s+/g, " ")}`);
  let data;
  try { data = JSON.parse(text); }
  catch { throw new Error(`JSON 이 아니다 — ${text.slice(0, 160).replace(/\s+/g, " ")}`); }
  const h = data?.response?.header;
  if (h?.resultCode && h.resultCode !== "0000") throw new Error(`API ${h.resultCode} ${h.resultMsg}`);
  const it = data?.response?.body?.items?.item;
  return !it ? [] : Array.isArray(it) ? it : [it];
}

console.log("① 어느 언어 서비스가 열려 있나\n");
const alive = [];
for (const [svc, label] of SERVICES) {
  try {
    const list = await call(svc, "areaCode2", { numOfRows: "3", pageNo: "1" });
    console.log(`   ✅ ${svc.padEnd(14)} ${label.padEnd(8)} — 지역 보기: ${list.map((a) => a.name).join(" · ")}`);
    alive.push([svc, label]);
  } catch (e) {
    console.log(`   ❌ ${svc.padEnd(14)} ${label.padEnd(8)} — ${String(e.message).slice(0, 90)}`);
  }
  await new Promise((r) => setTimeout(r, 250));
}

if (!alive.length) {
  console.log("\n다국어 서비스를 하나도 못 열었다. 이름이 틀렸거나 이 열쇠로는 안 되는 것이다.");
  console.log("→ 공공데이터포털에서 그 서비스에 **따로 활용 신청**이 필요한지 확인할 것.");
  process.exit(0);
}

// ── ② 일문 서비스가 **부산 자료를 실제로 갖고 있나** ──────────────────────
//
// 🚨 1차 확인(2026-09-17)에서 일문이 열렸는데도 **이름이 한 건도 안 왔다.**
//    국문에서는 같은 contentId 로 「가덕도 등대」가 오는데 일문은 빈 값이었다.
//    그래서 물어볼 것이 바뀌었다 — 「이름이 뭐냐」가 아니라
//    **「일문 쪽에 그 곳이 아예 있느냐, contentId 가 같으냐」**다.
//    여기서 갈린다:
//      · id 가 같다  → 우리 자료에 일본어 이름을 **그대로 붙일 수 있다**
//      · id 가 다르다 → 이름으로 맞춰야 하는데, 그건 예전에 실패했던 그 방식이다
//        (서울 사진 맞추기 185곳 중 1곳만 맞았다). 그러면 안 쓰는 게 낫다.
for (const [svc, label] of alive) {
  if (svc === "KorService2") continue;
  console.log(`\n② ${label}(${svc}) 이 **부산(지역 6)** 자료를 갖고 있나\n`);
  try {
    // 🚨 **콘텐츠 종류 번호를 안 보낸다** (2026-09-17에 여기서 헛짚었다).
    //    국문 번호(12=관광지)를 그대로 보냈더니 **0건**이 왔다. 외국어 서비스는
    //    번호 체계가 다를 수 있는데, 그걸 모르는 채로 번호를 박아 보낸 것이다.
    //    「자료가 없다」와 「내가 잘못 물었다」는 전혀 다른 말이다 —
    //    종류를 안 정하고 물으면 그 구분이 된다.
    const list = await call(svc, "areaBasedList2", {
      areaCode: "6", numOfRows: "15", pageNo: "1", arrange: "A",
    });
    if (!list.length) { console.log("   ⬜ 한 건도 안 온다 — 이 지역 자료가 없는 것이다."); continue; }
    console.log(`   ${list.length}곳 왔다:`);
    for (const it of list)
      console.log(`      ${String(it.contentid).padEnd(10)} [종류 ${String(it.contenttypeid).padEnd(3)}] ${it.title}`);
    // 이 서비스가 쓰는 **콘텐츠 종류 번호**를 세어 둔다 — 국문(12·14·15·25·28·38)과 다르면
    // 우리 갈래 표(tour-categories.mjs)를 그대로 못 쓴다는 뜻이다.
    const types = [...new Set(list.map((it) => String(it.contenttypeid)))].sort();
    console.log(`      → 이 서비스의 콘텐츠 종류 번호: ${types.join(" · ")}`);

    // 🧾 우리 부산 자료와 **id 가 겹치나** — 이게 진짜 알고 싶은 것이다.
    const mine = JSON.parse(readFileSync("src/data/busan-places.json", "utf8"));
    const ids = new Set(mine.map((p) => String(p.id)));
    const 겹침 = list.filter((it) => ids.has(String(it.contentid)));
    console.log(`\n   🧾 우리 부산 202곳과 id 가 겹치는 것 — ${겹침.length} / ${list.length}`);
    for (const it of 겹침.slice(0, 5)) {
      const k = mine.find((p) => String(p.id) === String(it.contentid));
      console.log(`      ${it.contentid}  한국어 「${k.name}」  →  ${label} 「${it.title}」`);
    }
    if (!겹침.length)
      console.log("      ❌ 하나도 안 겹친다 — 언어별로 **자료가 따로**라는 뜻이다. 이름으로 맞춰야 한다.");
  } catch (e) {
    console.log(`   ⚠️ 못 받았다 — ${String(e.message).slice(0, 110)}`);
  }
  await new Promise((r) => setTimeout(r, 250));
}

console.log("\n③ 같은 contentId 로 물으면 언어마다 뭐가 오나\n");
for (const [id, why] of SAMPLES) {
  console.log(`   ── contentId ${id}  (${why})`);
  for (const [svc, label] of alive) {
    try {
      const [it] = await call(svc, "detailCommon2", { contentId: id, numOfRows: "1", pageNo: "1" });
      console.log(`      ${label.padEnd(8)} ${it?.title ?? "(이름 없음)"}`);
    } catch (e) {
      console.log(`      ${label.padEnd(8)} ⚠️ ${String(e.message).slice(0, 70)}`);
    }
    await new Promise((r) => setTimeout(r, 200));
  }
  console.log("");
}
console.log("🚨 아무것도 저장하지 않았다 — 확인만 한 것이다.");
