#!/usr/bin/env node
// 📬 **25개 구청이 메일로 소식지를 보내 주나 — 러너가 직접 열어서 확인한다.**
//
// 사장님 지시 (2026-10-08): "구청도 소식지나 자료 메일 발송 하는지 알아봐"
//
// 왜 이 스크립트인가 —
//   서울시는 「내손안에 서울」을 메일로 보내 준다. 그 메일에서 서울디자인위크를
//   찾았다(docs/서울시-소식지-매일-확인.md). **구청도 그렇게 보내 준다면**
//   구 축제를 문화포털보다 먼저 알 수 있다.
//   그런데 검색 요약으로는 못 가린다 — "메뉴에 이메일 구독이 있다"까지만 나오고
//   **그게 소식지인지, 민원 답변 알림인지, 아예 없어진 메뉴인지** 알 수 없다.
//   그래서 **페이지를 직접 열어 본다.** 이 세션(샌드박스)은 *.go.kr 이 막혀 있어
//   GitHub Actions 러너에서 돈다.
//
// 🚨 **도메인을 짐작하지 않는다.** 구청 주소는 규칙이 없다 —
//    강남은 gangnam.go.kr, 중구는 junggu.seoul.kr, 노원은 nowon.kr 이다.
//    그래서 구마다 **후보를 여러 개 넣고, 실제로 답한 것만** 쓴다.
//    짐작으로 적어 두면 "없다"와 "주소를 틀렸다"를 구분할 수 없다.
//
//   node scripts/probe-gu-newsletter.mjs            # 25개 구 전부
//   node scripts/probe-gu-newsletter.mjs --gu 강남구  # 한 곳만
//
// 결과는 화면과 docs/구청-메일-소식지.md 에 표로 남는다.

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { fetchHtml } from "./lib/html-text.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_MD = join(__dirname, "..", "docs", "구청-메일-소식지.md");

// 🚨 `--gu` 를 안 줬을 때 argv[-1+1] = argv[0](node 경로)를 구 이름으로 읽는
//    버그가 있었다 (2026-10-08 첫 실행이 그래서 바로 죽었다). 문법 검사로는
//    안 잡힌다 — **돌려 봐야 잡힌다.**
function 구이름() {
  const eq = process.argv.find((a) => a.startsWith("--gu="));
  if (eq) return eq.split("=")[1] || "";
  const i = process.argv.indexOf("--gu");
  if (i >= 0) return process.argv[i + 1] ?? "";
  return "";
}
const ONLY = 구이름();

// 구마다 후보 주소. 첫 번째가 답하면 거기서 멈춘다.
const GU = [
  ["종로구", ["www.jongno.go.kr"]],
  ["중구", ["www.junggu.seoul.kr", "www.junggu.go.kr"]],
  ["용산구", ["www.yongsan.go.kr"]],
  ["성동구", ["www.sd.go.kr", "www.seongdong.go.kr"]],
  ["광진구", ["www.gwangjin.go.kr"]],
  ["동대문구", ["www.ddm.go.kr", "www.dongdaemun.go.kr"]],
  ["중랑구", ["www.jungnang.go.kr", "www.jnfc.or.kr"]],
  ["성북구", ["www.seongbuk.go.kr", "www.sb.go.kr"]],
  ["강북구", ["www.gangbuk.go.kr"]],
  ["도봉구", ["www.dobong.go.kr"]],
  ["노원구", ["www.nowon.kr", "www.nowon.go.kr"]],
  ["은평구", ["www.ep.go.kr", "www.eunpyeong.go.kr"]],
  ["서대문구", ["www.sdm.go.kr", "www.seodaemun.go.kr"]],
  ["마포구", ["www.mapo.go.kr"]],
  ["양천구", ["www.yangcheon.go.kr"]],
  ["강서구", ["www.gangseo.seoul.kr", "www.gangseo.go.kr"]],
  ["구로구", ["www.guro.go.kr"]],
  ["금천구", ["www.geumcheon.go.kr"]],
  ["영등포구", ["www.ydp.go.kr", "www.yeongdeungpo.go.kr"]],
  ["동작구", ["www.dongjak.go.kr"]],
  ["관악구", ["www.gwanak.go.kr"]],
  ["서초구", ["www.seocho.go.kr"]],
  ["강남구", ["www.gangnam.go.kr"]],
  ["송파구", ["www.songpa.go.kr"]],
  ["강동구", ["www.gangdong.go.kr"]],
];

// 「메일로 보내 주나」를 가르는 말. 소식지·뉴스레터 쪽만 본다 —
// 「민원 처리 알림」·「채용 공고 알림」은 우리에게 쓸모가 없다.
const 소식지말 = /뉴스레터|전자소식지|웹진|e-?소식|구소식|소식지|newsletter/i;
const 메일말 = /메일링|이메일\s*구독|메일\s*구독|이메일\s*수신|구독\s*신청|메일링리스트|mailing/i;

// 📡 **메일보다 RSS 가 우리에게 낫다.** 메일은 사람이 읽어야 하고 구독 신청이
//    필요하지만, RSS 는 기계가 매일 받아 올 수 있다(지금 축제 날짜를 받는 방식과 같다).
//    그래서 같은 걸음에 RSS 도 같이 본다 — 있으면 메일이 없어도 길이 열린다.
function rss찾기(html, base) {
  const out = new Set();
  const link = /<link\b[^>]*type\s*=\s*["']application\/(rss|atom)\+xml["'][^>]*>/gi;
  let m;
  while ((m = link.exec(html))) {
    const href = m[0].match(/href\s*=\s*["']([^"']+)["']/i)?.[1];
    if (href) {
      try {
        out.add(new URL(href, base).toString());
      } catch { /* 주소가 깨진 것은 버린다 */ }
    }
  }
  // 🚨 **「rss」라는 글자만 보고 세면 안 된다** (2026-10-08 첫 표가 그랬다).
  //    `?eprssAt=Y` 와 네이버 블로그 글 주소의 `?trackingCode=rss` 가 걸려 들어와,
  //    **RSS 가 아닌 것 5개**를 RSS 라고 적어 뒀다. 주소에 글자가 있는 것과
  //    **진짜 받아 읽을 수 있는 자리**는 다르다.
  //    → 길에 `/rss` 가 있거나 `.xml` 로 끝나는 것만 센다.
  const a = /<a\b[^>]*href\s*=\s*["']([^"']+)["']/g;
  while ((m = a.exec(html))) {
    if (/^(javascript|#)/i.test(m[1])) continue;
    let u;
    try {
      u = new URL(m[1], base);
    } catch {
      continue;
    }
    if (!(/(^|\/)rss(\/|$|\.)/i.test(u.pathname) || /\.xml$/i.test(u.pathname))) continue;
    out.add(u.toString());
  }
  return [...out].slice(0, 3);
}

function 링크뽑기(html, base) {
  const out = [];
  const re = /<a\b[^>]*href\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = re.exec(html))) {
    const href = m[1];
    const text = m[2].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    if (!text && !소식지말.test(href)) continue;
    const 합 = `${text} ${href}`;
    if (!소식지말.test(합) && !메일말.test(합)) continue;
    if (/^(javascript|#|tel:|mailto:)/i.test(href)) {
      // 자바스크립트로 여는 메뉴는 주소가 없다 — 글만 남겨 사람이 찾게 둔다
      out.push({ text, url: null });
      continue;
    }
    let url;
    try {
      url = new URL(href, base).toString();
    } catch {
      continue;
    }
    out.push({ text, url });
  }
  // 같은 주소는 한 번만
  const seen = new Set();
  return out.filter((l) => {
    const k = l.url ?? `t:${l.text}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

// 🚨 **「구독」을 「메일」로 세면 안 된다** (2026-10-08 첫 표가 그렇게 틀렸다).
//
//    처음엔 「구독·수신 안내글」이 보이면 메일 받는 자리로 셌다. 그랬더니
//    **우편 구독 신청서가 메일로 집계됐다** — 용산·광진·은평·마포의 「○○구소식
//    우편구독」이 「메일로 받을 수 있는 곳」 표에 들어가 있었다. 마포의 「문자알림」도
//    그랬다. 구독은 구독인데 **종이로 오거나 문자로 온다.**
//
//    사장님이 물은 것은 **메일**이다. 우편은 집으로 오고 문자는 폰으로 온다 —
//    우리가 매일 기계로 읽을 수 있는 것은 **메일뿐**이다. 그래서 셋을 가른다.
//
//    잣대: **무엇을 적는 칸이 있나**를 본다. 안내글이 아니라 입력칸이다.
const 우편말 = /우편|배송지|받으실\s*주소|우편번호|주소를\s*적|택배/;
const 문자말 = /문자|알림톡|SMS|휴대전화|휴대폰/i;

function 어떻게받나(html) {
  const 이메일 = [];
  const 다른길 = [];
  // ── 메일: 적는 칸이 있어야 한다
  if (/type\s*=\s*["']email["']/i.test(html)) 이메일.push("이메일 입력칸(type=email)");
  else if (/<(input|textarea)\b[^>]*name\s*=\s*["'][^"']*(email|mail)[^"']*["']/i.test(html))
    이메일.push("메일 입력칸(name)");
  // 「이메일로 보내 드립니다」처럼 **이메일이라고 못박은 글**만 센다.
  // 「구독 신청」만 있는 것은 우편일 수 있으므로 안 센다.
  if (/이메일\s*(로|으로)?\s*(구독|수신|발송|보내)|e-?mail\s*(구독|수신)/i.test(html))
    이메일.push("이메일이라고 적힌 안내글");
  // ── 다른 길: 있으면 적어 둔다. 「없다」가 아니라 「메일이 아니다」라고 말하려고.
  if (우편말.test(html)) 다른길.push("우편");
  if (문자말.test(html)) 다른길.push("문자·알림톡");
  return { 이메일, 다른길 };
}

// 🙋 **첫 화면에 없어도 깊은 곳에 있는 곳이 있다.**
//    강남구가 그랬다 — 첫 화면에는 링크가 없는데 「종합민원 > 이메일 구독 신청
//    서비스」가 실제로 있다. 메뉴를 자바스크립트로 띄우기 때문에 링크로는 안 보인다.
//    그래서 **사람이 찾아 둔 주소**를 여기 적고, 기계가 같은 잣대(메일받나)로 확인한다.
//    · 찾는 법: 구청 누리집에서 「구독」·「알림서비스」·「메일링」으로 검색
//    · ⚠️ 여기 적는 것은 **주소뿐이다.** 「메일을 보내 준다」는 판정은 기계가 한다 —
//      사람이 적어 두면 페이지가 바뀌어도 아무도 모른다.
const 손으로찾은주소 = {
  강남구: ["https://www.gangnam.go.kr/apply/email_notice_service/newest/view.do?mid=ID03_030610"],
  서대문구: ["https://www.sdm.go.kr/news/path/service.do"],
};

const 결과 = [];
const 목록 = ONLY ? GU.filter(([g]) => g === ONLY) : GU;
if (ONLY && !목록.length) {
  console.error(`--gu ${ONLY} 는 25개 구에 없다.`);
  process.exit(1);
}

for (const [gu, hosts] of 목록) {
  let 열린곳 = null;
  const 못연곳 = [];
  for (const h of hosts) {
    const url = `https://${h}/`;
    // 🚨 **「못 열었다」를 한 덩어리로 적으면 안 된다** (2026-10-08 첫 결과가 그랬다).
    //    다섯 구가 "fetch failed" 였는데 그 한 줄로는 **주소를 틀린 것**과
    //    **거기서 우리를 막는 것**을 가릴 수 없다. 둘은 할 일이 정반대다 —
    //    앞은 주소를 고치면 되고, 뒤는 고쳐도 안 된다.
    //    그래서 이유 코드(ENOTFOUND·ETIMEDOUT·인증서…)를 그대로 남기고,
    //    한 번만 다시 해 본다(한 번 튄 것과 늘 막힌 것을 가르려고).
    let 마지막 = null;
    for (const 차례 of [1, 2]) {
      try {
        const r = await fetchHtml(url, { timeoutMs: 25000 });
        if (r.status >= 400) {
          마지막 = `HTTP ${r.status}`;
          break;
        }
        열린곳 = { host: h, ...r };
        break;
      } catch (e) {
        마지막 = e.cause?.code ?? e.code ?? e.message?.slice(0, 40);
        if (차례 === 1) await new Promise((r) => setTimeout(r, 3000));
      }
    }
    if (열린곳) break;
    못연곳.push(`${h} → ${마지막}`);
  }

  if (!열린곳) {
    결과.push({ gu, host: null, 못연곳, 후보: [], 메일: [], 다른길로: [], rss: [] });
    console.log(`❌ ${gu} — 누리집을 못 열었다: ${못연곳.join(" · ")}`);
    continue;
  }

  const rss = rss찾기(열린곳.html, 열린곳.final);
  const 후보 = [
    ...링크뽑기(열린곳.html, 열린곳.final).slice(0, 6),
    ...(손으로찾은주소[gu] ?? []).map((u) => ({ text: "(사람이 찾아 둔 주소)", url: u })),
  ];
  const 메일 = [];
  const 다른길로 = [];
  for (const l of 후보) {
    if (!l.url) continue;
    try {
      const r = await fetchHtml(l.url, { timeoutMs: 25000 });
      if (r.status >= 400) continue;
      const { 이메일, 다른길 } = 어떻게받나(r.html);
      if (이메일.length) 메일.push({ ...l, 근거: 이메일, 다른길 });
      else if (다른길.length) 다른길로.push({ ...l, 다른길 });
    } catch {
      /* 못 열면 넘어간다 — 「못 열었다」와 「없다」를 섞지 않으려고 아래에서 후보로 남긴다 */
    }
  }
  결과.push({ gu, host: 열린곳.host, 못연곳, 후보, 메일, 다른길로, rss });
  const 표시 = 메일.length
    ? `📬 메일 ${메일.length}곳`
    : 다른길로.length
      ? `📭 메일은 아니다 — ${[...new Set(다른길로.flatMap((d) => d.다른길))].join("·")} ${다른길로.length}곳`
      : 후보.length
        ? `🔎 소식지 링크 ${후보.length}곳 (받는 길은 못 찾음)`
        : "— 소식지 링크 자체가 첫 화면에 없다";
  console.log(`${메일.length ? "✅" : "·"} ${gu} (${열린곳.host}) — ${표시}${rss.length ? ` · 📡 RSS ${rss.length}개` : ""}`);
}

// ── 표로 남긴다
const 보냄 = 결과.filter((r) => r.메일.length);
const 딴길 = 결과.filter((r) => !r.메일.length && r.다른길로.length);
const 흔적 = 결과.filter((r) => !r.메일.length && !r.다른길로.length && r.후보.length);
const 없음 = 결과.filter((r) => !r.메일.length && !r.다른길로.length && !r.후보.length && r.host);
const 못염 = 결과.filter((r) => !r.host);

const md = [];
md.push("# 📬 구청도 소식지를 메일로 보내 주나");
md.push("");
md.push("> 사장님 지시 (2026-10-08): **\"구청도 소식지나 자료 메일 발송 하는지 알아봐\"**");
md.push("");
md.push("🤖 **이 표는 손으로 적은 것이 아니다.** `scripts/probe-gu-newsletter.mjs` 가");
md.push("러너에서 25개 구청 누리집을 **직접 열어** 만든다. 다시 보려면 Actions →");
md.push("**Probe gu newsletter**. 메뉴가 바뀌면 숫자도 바뀐다.");
md.push("");
md.push(`받은 날: **${new Date().toISOString().slice(0, 10)}**`);
md.push("");
md.push("| | 구 수 |");
md.push("|---|---:|");
md.push(`| 📬 **메일로 받을 수 있다** | ${보냄.length} |`);
md.push(`| 📭 구독은 되는데 **메일이 아니다**(우편·문자) | ${딴길.length} |`);
md.push(`| 🔎 소식지는 있는데 받는 길은 못 찾았다 | ${흔적.length} |`);
md.push(`| · 첫 화면에 소식지 링크가 없다 | ${없음.length} |`);
md.push(`| ❌ 누리집을 못 열었다 | ${못염.length} |`);
md.push("");
md.push("🚨 **「구독」과 「메일」은 다르다.** 구청의 구독 서비스는 **종이로 집에 오거나(우편)**");
md.push("**문자·알림톡으로** 오는 것이 많다. 우리가 매일 기계로 읽을 수 있는 것은 **메일뿐**이라");
md.push("셋을 갈라 세었다. 잣대는 **무엇을 적는 칸이 있나**다 — 안내글이 아니라 입력칸.");
md.push("(첫 표에서는 이걸 안 갈라서 우편구독 네 곳이 「메일」에 들어가 있었다.)");
md.push("");
md.push("⚠️ **「못 찾았다」는 「없다」가 아니다.** 이 스크립트는 **첫 화면의 링크**만 본다.");
md.push("구청 누리집은 메뉴를 자바스크립트로 띄우는 곳이 많아, 깊은 곳에 있으면 안 보인다.");
md.push("빈 칸이 틀린 정보보다 낫다 — 못 본 것을 「없다」고 적지 않는다.");
md.push("");

if (보냄.length) {
  md.push("## 📬 메일로 받을 수 있는 곳");
  md.push("");
  md.push("| 구 | 누리집 | 어디서 | 근거 | 같은 쪽에 우편·문자도 |");
  md.push("|---|---|---|---|---|");
  for (const r of 보냄)
    for (const m of r.메일)
      md.push(
        `| ${r.gu} | ${r.host} | [${m.text || "(이름 없음)"}](${m.url}) | ${m.근거.join(" · ")} | ${m.다른길?.join(" · ") || "—"} |`,
      );
  md.push("");
}
if (딴길.length) {
  md.push("## 📭 구독은 되는데 메일이 아닌 곳 — 우편·문자");
  md.push("");
  md.push("신청해도 **받은편지함에는 안 온다.** 기계가 읽을 수 없으니 우리 쓸모는 없다.");
  md.push("");
  md.push("| 구 | 어떻게 오나 | 어디서 |");
  md.push("|---|---|---|");
  for (const r of 딴길)
    for (const d of r.다른길로)
      md.push(`| ${r.gu} | ${d.다른길.join(" · ")} | [${d.text || "(이름 없음)"}](${d.url}) |`);
  md.push("");
}
if (흔적.length) {
  md.push("## 🔎 소식지는 보이는데 받는 길은 못 찾은 곳");
  md.push("");
  md.push("| 구 | 누리집 | 보인 링크 |");
  md.push("|---|---|---|");
  for (const r of 흔적)
    md.push(
      `| ${r.gu} | ${r.host} | ${r.후보.map((l) => (l.url ? `[${l.text || "(이름 없음)"}](${l.url})` : `${l.text} (주소 없음·메뉴)`)).join("<br>")} |`,
    );
  md.push("");
}
const rss있음 = 결과.filter((r) => r.rss.length);
md.push("## 📡 RSS — 메일보다 이게 낫다");
md.push("");
md.push("메일은 **사람이 읽어야** 하고 구독 신청이 필요하다. RSS 는 **기계가 매일 받아 온다** —");
md.push("지금 축제 날짜를 받는 방식과 같다. 그래서 같은 걸음에 같이 봤다.");
md.push("");
if (rss있음.length) {
  md.push("| 구 | RSS 주소 |");
  md.push("|---|---|");
  for (const r of rss있음) md.push(`| ${r.gu} | ${r.rss.join("<br>")} |`);
} else {
  md.push("첫 화면에서 RSS 를 찾은 구가 없다.");
}
md.push("");

if (없음.length) {
  md.push("## · 첫 화면에 소식지 링크가 없던 곳");
  md.push("");
  md.push(없음.map((r) => `${r.gu}(${r.host})`).join(" · "));
  md.push("");
}
if (못염.length) {
  md.push("## ❌ 누리집을 못 열었다 — 주소부터 고쳐야 한다");
  md.push("");
  md.push("| 구 | 해 본 주소 |");
  md.push("|---|---|");
  for (const r of 못염) md.push(`| ${r.gu} | ${r.못연곳.join(" · ")} |`);
  md.push("");
  md.push("🚨 **「메일을 안 보낸다」가 아니라 「우리가 주소를 모른다」는 뜻이다.**");
  md.push("스크립트 위쪽 `GU` 표에 맞는 주소를 넣고 다시 돌린다.");
  md.push("");
}

writeFileSync(OUT_MD, md.join("\n") + "\n");
console.log("");
console.log(`📬 메일 ${보냄.length}곳 · 📭 우편·문자만 ${딴길.length}곳 · 🔎 흔적만 ${흔적.length}곳 · 없음 ${없음.length}곳 · ❌ 못 연 곳 ${못염.length}곳 · 📡 RSS ${rss있음.length}곳`);
console.log(`💾 docs/구청-메일-소식지.md 에 표로 남겼다.`);
