#!/usr/bin/env node
// 🎪 **전국 축제를 받아 온다** — 한국문화정보원 「한눈에보는문화정보」.
//
// 왜 이 창구인가 (2026-10-11, 사장님: "경주같은데는 축제가 없나")
//   세어 보니 경주 축제가 **0곳**이었다. 범인은 우리가 아니라 **쓰던 창구**였다 —
//   관광공사 searchFestival2 는 경북 전체에 **3곳**(전부 작년 것)뿐이고, 경주는 0이다.
//   경주 시군구 번호가 틀린 게 아니다. 번호표를 받아 **경주시 = 2** 임을 확인했다.
//
// 열쇠 (여기서 두 번 데였다)
//   · 주소 뿌리는 `/B553457/cultureinfo` 다. `/nopenapi/rest/publicperformancedisplays`
//     는 **없는 길**이다(원인코드 12). 설명서를 긁어서 알았다 — scripts/probe-culture-endpoint.mjs
//   · **열쇠를 감싸지 않는다.** encodeURIComponent 로 한 번 더 감싸면 %2B 가 %252B 가 되어
//     「등록되지 않은 서비스키」(원인코드 30)로 돌아온다. 관광공사 쪽과 잣대를 맞춘다.
//   · 요청변수는 **numOfrows**(rows 의 r 이 소문자) · **PageNo**(P 가 대문자) 다.
//
// 🚫 이 파일은 **받아 적기만** 한다. 화면에 붙이는 판정은 따로 한다 —
//    "빈 칸이 틀린 정보보다 낫다".
//
//   TOUR_API_KEY=... node scripts/fetch-culture-festivals.mjs --dry
//   TOUR_API_KEY=... node scripts/fetch-culture-festivals.mjs --apply

import { writeFileSync } from "node:fs";

const KEY = process.env.TOUR_API_KEY;
if (!KEY) { console.error("TOUR_API_KEY 가 없다"); process.exit(1); }

const 인자 = new Set(process.argv.slice(2));
const 맛보기 = !인자.has("--apply");
const 날수 = Number(process.argv.find((a) => a.startsWith("--days="))?.slice(7)) || 120;
// 📅 **시작일을 뒤로 물릴 수 있게 한다** (2026-10-11에 필요해졌다).
//    「오늘부터」만 받으면 **이미 끝난 축제가 안 보인다.** 경주가 0곳이었는데,
//    없는 것인지 끝난 것인지 가르려면 올해 1월부터 받아 봐야 한다.
//    끝난 축제도 지울 게 아니다 — 회색으로 「내년에 또 열립니다」로 보여 준다(사장님 지시).
const 시작글 = process.argv.find((a) => a.startsWith("--from="))?.slice(7);

const 뿌리 = "https://apis.data.go.kr/B553457/cultureinfo";
const ymd = (d) => `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
const 오늘 = 시작글 && /^\d{8}$/.test(시작글)
  ? new Date(Number(시작글.slice(0, 4)), Number(시작글.slice(4, 6)) - 1, Number(시작글.slice(6)))
  : new Date();
const 끝날 = new Date(오늘.getTime() + 날수 * 86400000);

// 🔁 끊겨도 한 번에 포기하지 않는다. 다만 무한정 두드리지도 않는다 — **두드리면 더 막힌다.**
//    2026-10-11 에 25분 동안 여덟 번 돌렸더니 포털이 연결 자체를 끊었다(UND_ERR_CONNECT_TIMEOUT).
//    그때 로그에 남은 건 「fetch failed」 한 줄뿐이라 **원인을 몰랐다.** 그래서 속을 꺼내 적는다.
async function 받기(url, 횟수 = 3) {
  let 마지막;
  for (let i = 0; i < 횟수; i++) {
    if (i > 0) {
      const 쉼 = 10000 * i;
      console.log(`      ⏳ ${쉼 / 1000}초 쉬고 다시 (${i + 1}/${횟수})`);
      await new Promise((r) => setTimeout(r, 쉼));
    }
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(40000) });
      const t = await r.text();
      const 막힘 = t.match(/<returnReasonCode>(\d+)<\/returnReasonCode>/);
      if (막힘) throw new Error(`포털 원인코드 ${막힘[1]} — ${t.match(/<returnAuthMsg>([^<]*)/)?.[1] ?? ""}`);
      return t;
    } catch (e) { 마지막 = e; }
  }
  throw 마지막;
}

// 🧾 **왜 끊겼는지를 글로 남긴다.** fetch 는 겉을 「fetch failed」로만 말하고
//    진짜 이유를 cause 안에 숨긴다. 그걸 안 꺼내면 포털이 막은 것인지, 주소가 틀린 것인지,
//    우리 쪽이 느린 것인지 **가를 수가 없다.**
function 왜(e) {
  const 속 = e?.cause;
  const 코드 = 속?.code ?? e?.code;
  const 뜻 = {
    UND_ERR_CONNECT_TIMEOUT: "포털이 연결을 안 받아 준다 — 너무 자주 두드렸을 때 이렇게 된다. 쉬었다 다시",
    ETIMEDOUT: "응답이 안 온다 — 위와 같다",
    ECONNRESET: "포털이 연결을 끊었다",
    ENOTFOUND: "주소(호스트)를 못 찾는다",
    UND_ERR_HEADERS_TIMEOUT: "연결은 됐는데 대답이 안 온다",
  }[코드];
  return [e?.message, 코드 && `(${코드})`, 뜻 && `→ ${뜻}`].filter(Boolean).join(" ");
}

// 📦 XML 한 덩이를 칸 이름 그대로 뜬다. **칸 이름을 짐작하지 않는다** —
//    들어 있는 것을 그대로 담아, 쓸 때 고른다.
function 항목들(xml) {
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((m) => {
    const 칸 = {};
    for (const t of m[1].matchAll(/<([A-Za-z0-9_]+)>([\s\S]*?)<\/\1>/g)) {
      칸[t[1]] = t[2].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").trim();
    }
    return 칸;
  });
}
const 총건수 = (xml) => Number(xml.match(/<totalCount>(\d+)<\/totalCount>/)?.[1] ?? 0);

async function 한장(길, 칸, 쪽, 수 = 100) {
  const q = new URLSearchParams({ PageNo: String(쪽), numOfrows: String(수), ...칸 });
  // ⚠️ 열쇠는 **감싸지 않고** 그대로 붙인다. URLSearchParams 에 넣으면 또 감싼다.
  return await 받기(`${뿌리}/${길}?serviceKey=${KEY}&${q}`);
}

if (맛보기) {
  console.log(`🧪 맛보기 — 아무것도 저장하지 않는다. ${ymd(오늘)} ~ ${ymd(끝날)}\n`);
  // 🚪 **창구를 적게 두드린다.** 포털은 한 번 돌 때마다 10분쯤 쉬어 줘야 한다 —
  //    안 쉬면 연결 자체를 안 받는다(UND_ERR_CONNECT_TIMEOUT). 그래서 확인용 호출을 없앴다.
  //    지역별로 몇 건인지는 **받아 적은 파일의 area 칸을 세면 된다** — 호출이 필요 없다.
  //    (area2 로 「경상북도」를 물으면 0건이 온다. 자료의 area 는 「경북」처럼 짧은 이름이다.
  //     0 을 보고 "축제가 없네" 하면 경주를 또 비워 둔 채 끝난다. 그 함정은 여기 적어만 둔다.)
  for (const [길, 칸] of [
    ["realm2", { from: ymd(오늘), to: ymd(끝날), realmCode: "F000", sortStdr: "1" }],
  ]) {
    const 이름 = `${길} ${Object.entries(칸).filter(([k]) => k !== "from" && k !== "to").map(([k, v]) => `${k}=${v}`).join(" ")}`;
    try {
      const xml = await 한장(길, 칸, 1, 5);
      const 것들 = 항목들(xml);
      console.log(`── ${이름}\n   ✅ 총 ${총건수(xml)}건 · 이 장 ${것들.length}개`);
      if (것들[0]) {
        console.log(`   📋 첫 항목의 칸 이름과 값:`);
        for (const [k, v] of Object.entries(것들[0])) console.log(`      ${k} = ${String(v).slice(0, 70)}`);
      }
    } catch (e) {
      console.log(`── ${이름}\n   ❌ ${왜(e)}`);
    }
    console.log("");
  }
  console.log("🧭 칸 이름을 확인한 뒤에 --apply 로 저장한다. 그 전에는 아무것도 안 바꾼다.");
  process.exit(0);
}

// ─────────────────────────────────────────────────────────────────────────
// 💾 저장 — **받아 적기만 한다.** 화면에 붙일지 말지는 여기서 정하지 않는다.
// ─────────────────────────────────────────────────────────────────────────
console.log(`💾 받는다 — ${ymd(오늘)} ~ ${ymd(끝날)} · 행사/축제(F000)\n`);

const 모음 = new Map();   // seq → 한 건

// 🔀 **두 길을 합친다.** 같은 포털인데 거르는 기준이 다르다 —
//    realm2 는 분류코드(F000=행사/축제), period2 는 분야구분(B=행사/축제).
//    한쪽에만 올라온 것이 있어서, 합치면 빠지는 게 줄어든다. seq 로 겹치는 것은 하나로 센다.
for (const [길, 거르개] of [
  ["realm2", { realmCode: "F000", sortStdr: "1" }],
  ["period2", { serviceTp: "B" }],
]) {
  let 쪽 = 1, 총 = null, 이길 = 0;
  while (true) {
    const xml = await 한장(길, { from: ymd(오늘), to: ymd(끝날), ...거르개 }, 쪽, 100);
    if (총 === null) { 총 = 총건수(xml); console.log(`── ${길}: 포털이 말하는 전체 ${총}건`); }
    const 것들 = 항목들(xml);
    이길 += 것들.length;
    for (const it of 것들) if (it.seq) 모음.set(it.seq, it);
    console.log(`   ${쪽}쪽 — ${것들.length}개 (이 길 ${이길} · 합쳐서 ${모음.size})`);
    // 🛑 **끝을 두 가지로 본다.** 빈 장이 오거나, 포털이 말한 전체 수를 넘겼을 때.
    //    한 가지만 보면 포털이 totalCount 를 틀리게 줄 때 영원히 돈다.
    if (것들.length === 0 || 이길 >= 총 || 쪽 > 60) break;
    쪽++;
    await new Promise((r) => setTimeout(r, 600));   // 포털을 몰아치지 않는다
  }
  await new Promise((r) => setTimeout(r, 1500));
}

// 🔤 포털이 글자를 **두 번 싸서** 준다 — `&amp;lt;` 는 `&lt;` 가 아니라 `<` 다.
//    한 번만 풀면 화면에 `&lt;` 가 그대로 뜬다. 두 번까지 푼다.
function 글자풀기(t) {
  // 🚨 **이름을 다 적어 두면 빠진 것이 화면에 그대로 뜬다** (2026-10-11에 당했다).
  //    `&laquo;`·`&raquo;` 를 안 적어 둬서 「축구와 그 이야기 &laquo;Metegol&raquo;」이
  //    그 글자 그대로 올라갔다. 그래서 **숫자 꼴(&#171;)까지 통째로** 푼다.
  const 이름표 = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ",
    laquo: "«", raquo: "»", lsquo: "‘", rsquo: "’", ldquo: "“", rdquo: "”",
    middot: "·", hellip: "…", ndash: "–", mdash: "—" };
  let v = String(t ?? "");
  // 세 번까지 — 포털이 두 번 싸서 주는데, 두 번만 풀면 세 겹일 때 한 겹이 남는다.
  for (let i = 0; i < 3; i++) {
    const 전 = v;
    v = v.replace(/&([a-zA-Z]+|#\d{1,6}|#[xX][0-9a-fA-F]{1,5});/g, (whole, k) => {
      if (k[0] === "#") {
        const n = k[1] === "x" || k[1] === "X" ? parseInt(k.slice(2), 16) : Number(k.slice(1));
        return Number.isFinite(n) && n > 0 && n < 0x110000 ? String.fromCodePoint(n) : whole;
      }
      return 이름표[k] ?? whole;   // 모르는 이름은 **건드리지 않는다**
    });
    if (v === 전) break;
  }
  return v.replace(/\s+/g, " ").trim();
}
const 날풀기 = (d) => (/^\d{8}$/.test(String(d ?? "")) ? `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6)}` : undefined);
const 수풀기 = (v) => { const n = Number(v); return Number.isFinite(n) && n !== 0 ? n : undefined; };

const 적을것 = [...모음.values()].map((it) => ({
  seq: it.seq,
  title: 글자풀기(it.title),
  start: 날풀기(it.startDate),
  end: 날풀기(it.endDate),
  place: 글자풀기(it.place) || undefined,
  area: 글자풀기(it.area) || undefined,          // 「경기」·「서울」 — 짧은 이름이다
  sigungu: 글자풀기(it.sigungu) || undefined,
  realm: 글자풀기(it.realmName) || undefined,
  thumb: it.thumbnail || undefined,
  lat: 수풀기(it.gpsY),                           // ⚠️ gpsY 가 **위도**다. 뒤집으면 바다로 보낸다
  lng: 수풀기(it.gpsX),
  // 🔗 근거를 늘 같이 둔다 — 우리가 틀렸을 때 손님이 확인할 길이 있어야 한다
  page: it.seq ? `https://www.culture.go.kr/wday/detailView.do?seq=${it.seq}` : undefined,
})).filter((x) => x.title && x.start)
  .sort((a, b) => (a.start < b.start ? -1 : a.start > b.start ? 1 : a.title.localeCompare(b.title, "ko")));

const 날짜별 = {};
for (const x of 적을것) 날짜별[x.area ?? "(지역없음)"] = (날짜별[x.area ?? "(지역없음)"] ?? 0) + 1;
console.log(`\n📊 지역별: ${Object.entries(날짜별).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(" · ")}`);
console.log(`   좌표 있는 것 ${적을것.filter((x) => x.lat && x.lng).length}건 · 사진 있는 것 ${적을것.filter((x) => x.thumb).length}건`);

const 나올곳 = "src/data/culture-festivals.json";
writeFileSync(나올곳, JSON.stringify({
  받은날: new Date().toISOString().slice(0, 10),
  기간: { 부터: 날풀기(ymd(오늘)), 까지: 날풀기(ymd(끝날)) },
  출처: "한국문화정보원_한눈에보는문화정보조회서비스 (공공데이터포털)",
  곳: 적을것,
}, null, 2) + "\n", "utf8");
const 오늘글 = new Date().toISOString().slice(0, 10);
const 끝난것 = 적을것.filter((x) => (x.end ?? x.start) < 오늘글);
console.log(`   이미 끝난 것 ${끝난것.length}건 — 지우지 않는다. 회색으로 「내년에 또」로 보여 줄 것들이다`);

const 경북 = 적을것.filter((x) => x.area === "경북");
console.log(`🏯 경북 ${경북.length}건 · 그중 경주 ${경북.filter((x) => x.sigungu === "경주시").length}건` +
  (경북.length ? ` — ${경북.slice(0, 5).map((x) => `${x.sigungu ?? ""} ${x.title}`).join(" · ")}` : ""));

console.log(`\n✅ ${나올곳} 에 ${적을것.length}건을 적었다.`);
console.log("🧭 적기만 했다. 화면에 붙이는 일은 따로 한다 — 상호·지역을 대조한 뒤에.");
