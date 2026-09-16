#!/usr/bin/env node
// 🪪 **관광공사의 공식 다국어 이름을 받아 온다.**
//
// 사장님 (2026-09-17): *"지명은 번역 말고 고유의 고유명사로 불리는 거지"*
//
// ── 왜 ────────────────────────────────────────────────────────────────────
//   구글 번역이 한자권에서 고유명사를 망가뜨린다:
//     북한산 → 北朝鮮山 · 잠수교 → ウェットスーツ(잠수복) · 김장 → 金枪鱼(참치)
//   우리가 한자를 지어 넣을 수는 없다. 그런데 관광공사는 **같은 자료를 언어별로**
//   따로 낸다 — 그 이름은 지어낸 게 아니라 **관광공사가 정해 쓰는 표기**다.
//
// ── 🔑 이어 붙이는 열쇠는 「번호」가 아니라 「괄호 안 한국어」다 ─────────────
//   언어 서비스는 contentId 가 **국문과 완전히 다르다**(2026-09-17 확인: 15곳 중 0곳 일치).
//   보통 이러면 이름으로 맞춰야 하는데, 그건 예전에 서울 사진 맞추다
//   **185곳 중 1곳만 맞았던** 방식이라 못 쓴다.
//
//   그런데 이 자료는 이렇게 온다:
//       アホプ山森（아홉산숲）
//       あいはし（手作り箸工芸）（아이하시（수제젓가락공예））
//   **한국어 원문이 이름 안에 그대로 들어 있다.** 그래서 비슷한 걸 찾는 게 아니라
//   **글자가 똑같은지만 본다.** 다르면 안 붙인다 — 그게 이 스크립트의 전부다.
//
// ⚠️ 콘텐츠 종류 번호가 국문과 다르다(75·76·78·79·80 ↔ 12·14·15·25·28·38).
//    우리는 **이름만** 가져오므로 상관없다. 종류는 국문으로 이미 갈라 놨다.
//
//   TOUR_API_KEY=… node scripts/fetch-tour-names.mjs            ← 맛보기
//   TOUR_API_KEY=… node scripts/fetch-tour-names.mjs --apply    ← 저장
import { readFileSync, writeFileSync } from "node:fs";
import { fetchWithRetry } from "./lib/tour-fetch.mjs";

const KEY = process.env.TOUR_API_KEY;
if (!KEY) { console.error("❌ TOUR_API_KEY 가 없다."); process.exit(1); }
const APPLY = process.argv.includes("--apply");
const OUT = "src/data/tour-official-names.json";

/** 언어 열쇠 → 관광공사 서비스. 우리 앱이 쓰는 언어 코드에 맞춘다. */
const SERVICES = [
  ["ja", "JpnService2", "일문"],
  ["zh", "ChsService2", "중문 간체"],
  ["zh-TW", "ChtService2", "중문 번체"],
];

/** 받아 올 지역. 지금 자료가 있는 곳만 — 없는 지역을 훑어 봐야 호출만 쓴다. */
const AREAS = [["1", "서울"], ["6", "부산"]];

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
  const b = data?.response?.body;
  const it = b?.items?.item;
  return { list: !it ? [] : Array.isArray(it) ? it : [it], total: Number(b?.totalCount ?? 0) };
}

/**
 * 「アホプ山森（아홉산숲）」 → { 외국어: "アホプ山森", 한국어: "아홉산숲" }
 *
 * 🚨 **맨 뒤 괄호만 본다. 그리고 괄호 짝을 센다.**
 *    「あいはし（手作り箸工芸）（아이하시（수제젓가락공예））」처럼
 *    괄호가 **둘이고 안쪽에 또 괄호가 있는** 것이 있다. 앞에서부터 찾으면 엉뚱한 데서 끊긴다.
 *    뒤에서 짝을 세어 올라가야 「아이하시（수제젓가락공예）」가 통째로 잡힌다.
 */
export function splitName(title) {
  const s = String(title ?? "").trim();
  if (!s.endsWith("）") && !s.endsWith(")")) return null;
  const close = s[s.length - 1];
  const open = close === "）" ? "（" : "(";
  let depth = 0, start = -1;
  for (let i = s.length - 1; i >= 0; i--) {
    if (s[i] === close) depth++;
    else if (s[i] === open) { depth--; if (depth === 0) { start = i; break; } }
  }
  if (start <= 0) return null;
  const ko = s.slice(start + 1, s.length - 1).trim();
  const foreign = s.slice(0, start).trim();
  // 🚨 괄호 안이 **한글이어야** 한다. 「（釜山）」 같은 건 한국어 원문이 아니다.
  if (!/[가-힣]/.test(ko) || !foreign) return null;
  return { foreign, ko };
}

// ── 우리가 들고 있는 한국어 이름을 모은다 (맞춰 볼 대상) ────────────────────
const ours = new Set();
const seed = readFileSync("src/data/seed.ts", "utf8");
for (const line of seed.split("\n")) {
  if (/^\s{5,}/.test(line)) continue;
  for (const m of line.matchAll(/name: "((?:[^"\\]|\\.)*)"/g)) if (/[가-힣]/.test(m[1])) ours.add(m[1]);
}
for (const v of Object.values(JSON.parse(readFileSync("src/data/tour-places-raw.json", "utf8"))))
  for (const p of v) if (p?.name) ours.add(p.name);
for (const p of JSON.parse(readFileSync("src/data/busan-places.json", "utf8"))) ours.add(p.name);
console.log(`🧾 우리가 들고 있는 한국어 이름 ${ours.size}개\n`);

const store = {};
for (const [lang, svc, label] of SERVICES) {
  console.log(`── ${label}(${svc}) ──`);
  const map = {};
  let 받은것 = 0, 괄호없음 = 0;
  for (const [area, areaName] of AREAS) {
    let page = 1, got = 0, total = 0;
    for (;;) {
      let r;
      try {
        r = await call(svc, "areaBasedList2", { areaCode: area, numOfRows: "500", pageNo: String(page), arrange: "A" });
      } catch (e) {
        console.log(`   ⚠️ ${areaName} ${page}쪽 — 못 받았다 (${String(e.message).slice(0, 70)})`);
        break;
      }
      total = r.total;
      for (const it of r.list) {
        받은것++;
        const parts = splitName(it.title);
        if (!parts) { 괄호없음++; continue; }
        // 🚨 우리 자료에 **똑같은 이름이 있을 때만** 담는다. 비슷한 것은 안 본다.
        if (ours.has(parts.ko)) map[parts.ko] = parts.foreign;
      }
      got += r.list.length;
      if (got >= total || r.list.length < 500 || ++page > 20) break;
      await new Promise((r2) => setTimeout(r2, 200));
    }
    console.log(`   ${areaName} — ${got} / ${total}곳`);
  }
  console.log(`   받은 이름 ${받은것}개 · 괄호 안 한국어가 없던 것 ${괄호없음}개`
    + ` · **우리 것과 맞은 것 ${Object.keys(map).length}개**`);
  const 보기 = Object.entries(map).slice(0, 5);
  for (const [ko, fo] of 보기) console.log(`      ${ko.padEnd(16)} → ${fo}`);
  store[lang] = Object.fromEntries(Object.entries(map).sort(([a], [b]) => a.localeCompare(b, "ko")));
  console.log("");
}

const 합계 = Object.values(store).reduce((n, m) => n + Object.keys(m).length, 0);
console.log(`합계 ${합계}개 (${Object.entries(store).map(([k, v]) => `${k} ${Object.keys(v).length}`).join(" · ")})`);
if (!APPLY) { console.log(`\n(맛보기다. 저장하려면 --apply → ${OUT})`); process.exit(0); }
writeFileSync(OUT, JSON.stringify(store, null, 1) + "\n");
console.log(`\n💾 ${OUT} 에 저장`);
