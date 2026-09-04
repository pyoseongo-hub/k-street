#!/usr/bin/env node
// 🗺️ **네이버 지도 열쇠가 우리 도메인에서 먹는지** 직접 물어본다.
//
// 왜 생겼나 (2026-09-04) — 도메인을 korea-street.com 으로 옮긴 뒤 앱의 「내 위치」가
// **「위치를 못 찾았어요」**를 냈다. 그 문구는 (문구를 가른 뒤로는) **네이버 조회가
// 실패했다**는 뜻이고, 폰 권한 문제가 아니라 우리 쪽 문제다.
//
// 그런데 원인 후보가 여럿이다:
//   · Web 서비스 URL 에 새 도메인이 저장 안 됐다
//   · 열쇠 값이 Client ID 인데 지금 창구는 Key ID 를 받는다
//   · geocoder 서브모듈이 안 붙어 naver.maps.Service 가 없다
//
// 감으로 찍지 말고 **SDK 주소를 그대로 불러 본다.** 네이버는 인증이 틀리면
// 자바스크립트 대신 **오류 문구를 담은 응답**을 준다 — 그걸 그대로 옮겨 적으면
// 어느 경우인지 바로 갈린다.
//
// 🔓 여기 쓰는 열쇠(ncpKeyId)는 **원래 브라우저에 그대로 노출되는 값**이다
//    (index.html 의 __CONFIG__ 에 들어 있다). 비밀이 아니므로 로그에 찍어도 된다.
//    도메인으로 막는 방식이라 값 자체를 숨기는 것은 의미가 없다.
//
// ⚠️ 작업 세션(샌드박스)은 바깥이 막혀 있어 직접 못 돌린다 — Actions 에서 돌린다.
//
//   node scripts/check-naver-maps.mjs

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

// index.html 에 박아 둔 값을 그대로 읽는다 — 앱이 실제로 쓰는 그 열쇠여야 한다.
const html = readFileSync(join(__dirname, "..", "index.html"), "utf-8");
const keyId = html.match(/VITE_NAVER_MAPS_CLIENT_ID:\s*"([^"]+)"/)?.[1];
if (!keyId) {
  console.error("index.html 에서 VITE_NAVER_MAPS_CLIENT_ID 를 못 찾았다.");
  process.exit(1);
}
console.log(`앱이 쓰는 열쇠: ${keyId}\n`);

/** 지금 도메인과 옛 도메인을 나란히 대 본다 — 옛 것만 되면 저장이 안 된 것이다. */
const REFERERS = [
  "https://korea-street.com/",
  "https://pyoseongo-hub.github.io/k-street/",
  "http://localhost:5173/",
];

const URL_BASE = "https://oapi.map.naver.com/openapi/v3/maps.js";

/** 인증 실패일 때 네이버가 답에 섞어 보내는 말들.
 *
 * 🐞 2026-09-04 — 여기에 `errorCode`를 넣었다가 **멀쩡한 SDK를 실패로 읽었다.**
 *    334KB짜리 압축된 자바스크립트 안에는 그런 낱말이 당연히 들어 있다.
 *    넓게 잡은 그물이 정답까지 걸러 낸 것이다. **앞부분에서만** 찾는다.
 */
const FAIL_RE = /(Authentication Failed|인증에 실패|잘못된 인증|Unauthorized|허용되지 않은 도메인)/i;

let anyOk = false;

for (const referer of REFERERS) {
  const url = `${URL_BASE}?ncpKeyId=${keyId}&submodules=geocoder`;
  try {
    const res = await fetch(url, {
      headers: { Referer: referer, "User-Agent": "Mozilla/5.0 KStreet-check" },
      signal: AbortSignal.timeout(15000),
    });
    const text = await res.text();
    // 오류문은 앞머리에 온다. 본문 전체를 뒤지면 압축된 코드에 걸린다(위 주석).
    const failed = FAIL_RE.test(text.slice(0, 2000));
    // 제대로 온 응답은 수백 KB 짜리 자바스크립트다. 오류는 짧다.
    const looksLikeSdk = !failed && text.length > 20000;
    if (looksLikeSdk) anyOk = true;

    console.log(`${looksLikeSdk ? "✅" : "❌"} ${referer}`);
    console.log(`     HTTP ${res.status} · ${text.length.toLocaleString()} 바이트`);
    if (!looksLikeSdk) {
      // 🚨 돌아온 말을 **그대로** 옮긴다. 요약하면 원인을 놓친다.
      console.log("     돌아온 답:");
      console.log(
        text
          .replace(/\s+/g, " ")
          .slice(0, 400)
          .split(/(.{100})/)
          .filter(Boolean)
          .map((l) => "       " + l)
          .join("\n")
      );
    } else {
      // geocoder 서브모듈이 실제로 들어왔는지 본다 — 이게 없으면 Service 가 undefined 라
      // reverseGeocode 를 부를 수조차 없다.
      const hasGeocoder = /reverseGeocode|Service/.test(text);
      console.log(`     geocoder 서브모듈: ${hasGeocoder ? "✅ 들어 있다" : "❌ 없다"}`);
    }
  } catch (e) {
    console.log(`⬜ ${referer}\n     못 열었다 (${e?.cause?.code ?? e.name})`);
  }
  console.log("");
  await new Promise((s) => setTimeout(s, 500));
}

console.log("─".repeat(62));
console.log(`🚨 **이 검사가 확인해 주지 못하는 것**
   네이버 v3는 **스크립트를 먼저 내려 주고, 인증은 브라우저에서 확인**한다.
   그래서 여기서 SDK가 왔다고 해서 **그 도메인이 허용됐다는 뜻은 아니다.**
   도메인 인증 결과는 브라우저에서 window.navermap_authFailure 로만 알 수 있다 —
   그 손잡이를 앱에 달아 두었으니, 실패하면 화면이 그렇게 말해 준다.
`);
if (anyOk) {
  console.log(`읽는 법:
 · korea-street.com 만 ❌ 이면 → **Web 서비스 URL 저장이 안 된 것.**
   console.ncloud.com → Maps → Application → k-street → ⋯ → 수정 →
   Web 서비스 URL 에 https://korea-street.com 을 넣고 **「저장」까지** 누른다.
 · 셋 다 ✅ 인데 앱에서 안 되면 → 열쇠·도메인 문제가 아니다.
   폰 브라우저에서 위치 권한이 꺼졌거나, 옛 화면이 저장돼 있는 것이다.`);
} else {
  console.log(`❌ **어느 주소에서도 SDK 를 못 받았다.**
   열쇠 값 자체가 지금 창구와 안 맞을 수 있다 —
   console.ncloud.com → Maps → Application → k-street → **인증 정보**를 열어
   거기 적힌 값과 index.html 의 값이 같은지 본다.
   (예전 Client ID 와 지금 Key ID 는 다른 값일 수 있다.)`);
}
