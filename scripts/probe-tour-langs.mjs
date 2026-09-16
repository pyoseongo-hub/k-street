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

console.log("\n② 같은 곳의 이름이 언어마다 어떻게 오나 (공식 표기인지 보는 자리)\n");
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
