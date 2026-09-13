#!/usr/bin/env node
// 🅺 **홈 화면·탭 아이콘을 마크에서 구워 낸다.**
//
// 사장님 (2026-09-13): *"벚꽃도 바꾸고 앱안 k로고도 바뀌"*
//
// ── 왜 스크립트로 굽나 ──────────────────────────────────────────────────
// 예전 아이콘은 🌸 벚꽃 **이모지**를 PNG 로 만들어 둔 것이었다. 앱을 열면 K 가
// 나오는데 홈 화면에는 벚꽃이 있어 **서로 다른 앱**으로 보였다.
// 이제 마크가 하나(BrandMark.tsx)이므로, 아이콘도 **그 그림에서** 나와야 한다.
// 손으로 그린 PNG 를 따로 두면 다음에 마크를 고칠 때 반드시 한쪽이 남는다.
//
// 🚨 **모양을 고칠 때는 아래 markSvg() 와 BrandMark.tsx 를 같이 본다.**
//    둘이 같은 그림이어야 한다. 다르면 앱 안과 홈 화면이 또 갈라진다.
//    (한 파일에서 둘을 뽑는 쪽이 깔끔하지만, BrandMark 는 TSX 라 Node 가 못 읽고,
//     SVG 파일을 두면 React 에서 인라인으로 못 쓴다. 그래서 **주석으로 묶는다**.)
//
// ── 돌리는 법 ───────────────────────────────────────────────────────────
//   npm i --no-save playwright        # 이 저장소의 의존성이 아니다(배포에 안 쓴다)
//   node scripts/make-icons.mjs
//
// 진짜 브라우저로 그려서 찍는다 — make-screenshots.mjs 와 같은 방법이다.
// 이미지 라이브러리를 새로 들이지 않으려는 것이다(초심: 적은 비용으로 오래).

import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..", "public", "icons");

let chromium;
for (const src of [process.env.PLAYWRIGHT_MODULE, "playwright"]) {
  if (!src) continue;
  try {
    ({ chromium } = await import(src));
    break;
  } catch {
    /* 다음 후보 */
  }
}
if (!chromium) {
  console.error(`playwright 가 없다. 이 저장소의 의존성이 아니다(배포에 안 쓰니까).
  npm i --no-save playwright
  node scripts/make-icons.mjs`);
  process.exit(1);
}

/** 🎨 계절 색 — tokens.css 의 갈래 색 그대로. 새 색을 들이지 않는다. */
const SPRING = "#FF8FBB"; // --flower
const SUMMER = "#4FE3CB"; // --walk
const AUTUMN = "#FFB13C"; // --market
const WINTER = "#7EA6D9"; // --rain

/**
 * 마크 그림. BrandMark.tsx 와 **같은 모양**이어야 한다.
 *
 * @param pad  둥근 네모가 그림 안에서 차지하는 여백(뷰박스 100 기준).
 *             일반 아이콘은 6, 마스커블은 더 크게 준다(아래 참고).
 * @param bg   뒤에 깔 색. 투명하게 두려면 null.
 */
function markSvg({ pad = 6, bg = null } = {}) {
  const s = 100 - pad * 2;
  const h = s / 2;
  const r = Math.round(s * 0.27);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  ${bg ? `<rect x="0" y="0" width="100" height="100" fill="${bg}"/>` : ""}
  <defs>
    <mask id="k">
      <rect x="0" y="0" width="100" height="100" fill="#fff"/>
      <g fill="none" stroke="#000" stroke-width="12" stroke-linecap="round"
         transform="translate(50,50) scale(${(s / 88) * 0.68}) translate(-50,-50)">
        <path d="M31 16 V84"/><path d="M73 17 L36 50"/><path d="M36 50 L75 83"/>
      </g>
    </mask>
    <clipPath id="sq"><rect x="${pad}" y="${pad}" width="${s}" height="${s}" rx="${r}"/></clipPath>
  </defs>
  <g clip-path="url(#sq)" mask="url(#k)">
    <rect x="${pad}"     y="${pad}"     width="${h}" height="${h}" fill="${SPRING}"/>
    <rect x="${pad + h}" y="${pad}"     width="${h}" height="${h}" fill="${SUMMER}"/>
    <rect x="${pad + h}" y="${pad + h}" width="${h}" height="${h}" fill="${AUTUMN}"/>
    <rect x="${pad}"     y="${pad + h}" width="${h}" height="${h}" fill="${WINTER}"/>
  </g>
</svg>`;
}

// 🖼️ 무엇을 굽나.
//
// ⚠️ **maskable 은 여백을 크게 준다.** 안드로이드가 아이콘을 제 마음대로 잘라
//    동그라미·네모·물방울 모양으로 만드는데(적응형 아이콘), 가장자리까지 꽉 채우면
//    **K 의 팔다리가 잘린다.** 규격이 "가운데 80% 안에 중요한 것을 넣으라"고 한다.
//    그래서 pad 를 크게 주고 뒤를 계절색이 아닌 바탕색으로 채운다.
//
// ⚠️ **투명 배경으로 굽지 않는다.** iOS 홈 화면은 투명한 자리를 **검게** 칠해서,
//    라이트 모드 손님 화면에서만 아이콘이 시커멓게 뜬다.
const JOBS = [
  { file: "favicon-64.png", px: 64, svg: markSvg({ pad: 4, bg: "#131316" }) },
  { file: "icon-192.png", px: 192, svg: markSvg({ pad: 6, bg: "#131316" }) },
  { file: "icon-512.png", px: 512, svg: markSvg({ pad: 6, bg: "#131316" }) },
  // 애플은 둥근 모서리를 **자기가** 깎는다. 우리가 또 깎으면 모서리가 두 번 잘린다 →
  // 거의 정사각(rx 가 작아지도록 pad 를 줄이고) 뒤를 꽉 채운다.
  { file: "apple-touch-icon.png", px: 180, svg: markSvg({ pad: 10, bg: "#131316" }) },
  { file: "icon-512-maskable.png", px: 512, svg: markSvg({ pad: 20, bg: "#131316" }) },
];

mkdirSync(OUT, { recursive: true });

// 🧭 크로미움이 어디 있는지 — 이 저장소는 playwright 를 의존성으로 두지 않으므로
//    (`npm i --no-save`) 브라우저가 playwright 가 기대하는 자리에 없을 수 있다.
//    CHROME_PATH 로 알려 줄 수 있게 열어 둔다. 없으면 playwright 가 알아서 찾는다.
const browser = await chromium.launch(
  process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}
);
for (const job of JOBS) {
  const page = await browser.newPage({
    viewport: { width: job.px, height: job.px },
    deviceScaleFactor: 1,
  });
  await page.setContent(
    `<style>html,body{margin:0;padding:0;background:transparent}
     svg{width:${job.px}px;height:${job.px}px;display:block}</style>${job.svg}`
  );
  const buf = await page.screenshot({ omitBackground: true });
  writeFileSync(join(OUT, job.file), buf);
  await page.close();
  console.log(`✅ ${job.file.padEnd(24)} ${job.px}×${job.px} · ${(buf.length / 1024).toFixed(1)}KB`);
}
await browser.close();

console.log(`
🅺 다 구웠다. 이제 **앱 안(BrandMark.tsx)과 홈 화면이 같은 그림**이다.
⚠️ 마크 모양을 고치면 이 스크립트를 다시 돌릴 것. 안 그러면 또 얼굴이 둘이 된다.`);
