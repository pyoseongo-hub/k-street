#!/usr/bin/env node
// 🔎 **낱말로 곳을 찾는다** — 카카오 지역검색을 구별로 훑는다.
//
// 사장님 지시 (2026-09-26): *"체험 중에 동물카페 넣어 보게 찾아봐"*.
//
// ─────────────────────────────────────────────────────────────────────────
// 왜 만들었나
// ─────────────────────────────────────────────────────────────────────────
//   관광공사 자료에는 **사설 가게가 거의 없다.** 동물카페·공방·쿠킹클래스처럼
//   손님이 「해 보는」 것들은 관광지로 등록돼 있지 않다.
//   find-underground-malls.mjs 는 **이름을 이미 아는 25곳**을 찾는 물건이고,
//   이쪽은 반대로 **이름을 모르는 것을 낱말로** 찾는다.
//
// 🚨 **아무것도 seed 에 넣지 않는다. 찾아서 보여 줄 뿐이다.**
//    들일지 말지는 사람이 정한다 — 카카오는 「동물카페」로 찾으면 동물병원도,
//    이름만 비슷한 미용실도 섞어 준다. 업종(category_name)을 같이 찍어 주는 이유다.
//
// ⚠️ **구별로 나눠 부른다.** 한 번에 서울 전체를 부르면 카카오가 45건까지만 준다
//    (한 낱말당 3쪽 × 15건). 구를 나누면 25배가 된다.
//
//   KAKAO_REST_API_KEY=… node scripts/find-by-keyword.mjs --words "고양이카페,강아지카페" --city seoul
import fs from "node:fs";

const KEY = process.env.KAKAO_REST_API_KEY;
if (!KEY) {
  console.error("❌ KAKAO_REST_API_KEY 가 없다.");
  process.exit(1);
}
const arg = (n, d) => {
  const hit = process.argv.find((a) => a.startsWith(`--${n}=`));
  if (hit) return hit.slice(n.length + 3);
  const i = process.argv.indexOf(`--${n}`);
  return i >= 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith("--") ? process.argv[i + 1] : d;
};

const WORDS = (arg("words", "") || "").split(",").map((s) => s.trim()).filter(Boolean);
if (!WORDS.length) {
  console.error("❌ --words 가 비었다 (쉼표로 나눈다)");
  process.exit(1);
}
const CITY = arg("city", "seoul");
const OUT = arg("out", "");

/** 구 이름은 우리 자료에서 가져온다 — 목록을 또 베껴 적지 않는다. */
const GUS = (() => {
  const f = CITY === "busan" ? "src/data/busan-places.json" : "src/data/seoul-places.json";
  const raw = JSON.parse(fs.readFileSync(f, "utf8"));
  const rows = Array.isArray(raw) ? raw : Object.values(raw.곳 ?? raw);
  return [...new Set(rows.map((r) => r.gu).filter(Boolean))].sort();
})();
const SIDO = CITY === "busan" ? "부산" : "서울";

/** 🚫 이름이나 업종에 이것이 있으면 버린다 — 손님이 「해 보는」 곳이 아니다. */
const DROP = /동물병원|병원|약국|미용|호텔|장례|유치원|보호소|분양|용품|쇼핑몰|마트/;

async function kakao(q, page) {
  const url = `https://dapi.kakao.com/v2/local/search/keyword.json?${new URLSearchParams({
    query: q,
    size: "15",
    page: String(page),
  })}`;
  try {
    const r = await fetch(url, {
      headers: { Authorization: `KakaoAK ${KEY}` },
      signal: AbortSignal.timeout(20000),
    });
    const text = await r.text();
    if (!r.ok) return { ok: false, why: `HTTP ${r.status} — ${text.slice(0, 120)}` };
    const j = JSON.parse(text);
    return { ok: true, docs: j.documents ?? [], end: j.meta?.is_end !== false };
  } catch (e) {
    return { ok: false, why: e?.cause?.code || e?.name || e?.message };
  }
}

console.log(`🔎 ${SIDO} ${GUS.length}개 구 × 낱말 ${WORDS.length}개\n   ${WORDS.join(" · ")}\n`);

const hits = new Map(); // 카카오 id → 곳
let calls = 0, dropped = 0;

for (const gu of GUS) {
  for (const w of WORDS) {
    for (let page = 1; page <= 3; page++) {
      const r = await kakao(`${SIDO} ${gu} ${w}`, page);
      calls++;
      if (!r.ok) {
        console.log(`  ⚠️ ${gu} ${w} — ${r.why}`);
        break;
      }
      for (const d of r.docs) {
        // 🚨 **주소로 구를 다시 확인한다.** 카카오는 근처 구의 가게도 끼워 준다.
        if (!d.address_name?.includes(gu)) continue;
        if (DROP.test(d.place_name) || DROP.test(d.category_name ?? "")) {
          dropped++;
          continue;
        }
        hits.set(d.id, {
          name: d.place_name,
          gu,
          addr: d.road_address_name || d.address_name,
          jibun: d.address_name,
          kind: (d.category_name ?? "").split(">").pop()?.trim(),
          phone: d.phone || undefined,
          lat: Number(d.y),
          lng: Number(d.x),
          url: d.place_url,
          word: w,
        });
      }
      if (r.end) break;
      await new Promise((s) => setTimeout(s, 60));
    }
  }
}

const rows = [...hits.values()].sort((a, b) => a.gu.localeCompare(b.gu) || a.name.localeCompare(b.name));
console.log(`\n찾은 곳 ${rows.length} · 부른 횟수 ${calls} · 걸러낸 것 ${dropped}\n`);

const byGu = {};
for (const r of rows) (byGu[r.gu] ??= []).push(r);
for (const [gu, list] of Object.entries(byGu)) {
  console.log(`── ${gu} (${list.length})`);
  for (const r of list) {
    console.log(`   ${r.name}`);
    console.log(`      ${r.kind ?? "?"} · ${r.addr}${r.phone ? " · " + r.phone : ""}`);
    console.log(`      ${r.url}`);
  }
}

console.log(`\n🚨 **아무것도 저장하지 않았다.** 위 목록에서 고르는 것은 사람이다 —`);
console.log(`   카카오는 이름만 비슷한 가게를 섞어 준다. 업종과 주소를 보고 고를 것.`);

if (OUT) {
  fs.mkdirSync(OUT.replace(/\/[^/]+$/, ""), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify({ 낱말: WORDS, 도시: CITY, 찾은날: new Date().toISOString().slice(0, 10), 곳: rows }, null, 2) + "\n");
  console.log(`\n💾 ${OUT} 에 적었다 (자료 파일일 뿐, seed 에는 안 들어간다)`);
}
