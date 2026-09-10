import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
// base: 사이트가 주소의 **최상단**에 있으므로 '/' 다.
//
// 2026-09-04에 korea-street.com 을 붙이면서 '/k-street/' 에서 '/' 로 바꿨다.
// 예전에는 https://pyoseongo-hub.github.io/**k-street/** 처럼 하위 경로였는데,
// 도메인을 붙이면 https://korea-street.com/ 이 곧 최상단이 된다.
// 🚨 이걸 안 바꾸면 파일을 /k-street/assets/… 에서 찾다가 전부 404가 나서
//    **화면이 통째로 빈다.** 도메인을 떼면 다시 '/k-street/' 로 되돌려야 한다.
export default defineConfig({
  base: '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/apple-touch-icon.png'],
      manifest: {
        name: 'K-Street',
        short_name: 'K-Street',
        // ⚠️ 이 글은 **손님에게 그대로 보인다** — 설치할 때 뜨고, 스토어에 올리면
        //    스토어 페이지에도 실린다. 2026-09-10까지 끝에 「(가제)」가 붙어 있었다.
        //    영어로 적는다: 이 앱을 쓰는 사람은 대부분 한국어를 못 읽는다.
        description:
          "Seoul neighbourhood festivals, traditional markets, flower walks, trails and museums — in 12 languages. Free, no sign-up.",
        // Kfood와 같은 계열임을 암시하지 않도록 독립 색·아이콘을 쓴다.
        // 2026-08-25: 다크 엘레강스 테마로 바꾸면서 여기도 같이 맞췄다(src/styles/tokens.css의
        // --bg/--accent와 동일) — 안 맞으면 설치 시 스플래시 화면·주소창 색이 따로 논다.
        theme_color: '#121B19',
        background_color: '#121B19',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        // 손님이 한국어를 읽는다는 뜻이 아니라 **위 description 이 무슨 말인가**를
        // 브라우저에게 알려 주는 칸이다. 영어로 적었으니 en 이다.
        lang: 'en',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        // 📸 설치 창에서 미리 보여 주는 화면. 이게 있으면 안드로이드 크롬이
        //    설치 창을 **더 크게, 사진과 함께** 띄운다 — 그냥 "설치하시겠습니까?"보다
        //    훨씬 설득력이 있다. 스토어에 올릴 때도 같은 사진을 쓴다.
        //    만드는 법: node scripts/make-screenshots.mjs (진짜 브라우저로 찍는다)
        screenshots: [
          { src: 'screenshots/phone-1-home.png', sizes: '1080x1920', type: 'image/png', form_factor: 'narrow' },
          { src: 'screenshots/phone-2-district.png', sizes: '1080x1920', type: 'image/png', form_factor: 'narrow' },
          { src: 'screenshots/phone-3-place.png', sizes: '1080x1920', type: 'image/png', form_factor: 'narrow' },
        ],
      },
      workbox: {
        // 정적 자산만 캐시한다 — 실제 콘텐츠(seed.ts 데이터)는 매 빌드마다 파일 자체가
        // 바뀌므로 별도 캐시 무효화 로직 없이도 최신판이 자연히 받아진다.
        //
        // 🚨 곳 페이지(dist/place/**)는 **미리 받아 두지 않는다.** 307장이라 설치할 때
        //    통째로 내려받게 되고 첫 방문이 그만큼 무거워진다. 이 페이지들은 검색으로
        //    들어온 손님이 **한 장만** 보는 자리다.
        globPatterns: ['*.{js,css,html,svg,png,ico}', 'assets/**', 'icons/**'],

        // 🐞 **여기가 곳 페이지 307장을 통째로 죽일 뻔한 자리다** (2026-09-05에 찾음).
        //
        //    서비스워커는 기본으로 **모든 화면 이동을 가로채 index.html 을 준다.**
        //    SPA 라면 그게 맞다 — 주소가 뭐든 앱 한 장으로 처리해야 하니까.
        //    그런데 우리는 /place/… 에 **진짜 HTML 파일**을 따로 만들어 뒀다.
        //
        //    그대로 두면 이렇게 갈린다:
        //      · 처음 오는 손님·크롤러 → 서비스워커가 없으니 진짜 페이지가 뜬다 ✅
        //      · 앱에 한 번이라도 들어온 적 있는 사람 → **앱 첫 화면**이 뜬다 ❌
        //
        //    즉 검색은 멀쩡한데 **사람이 링크를 나눠 주면 엉뚱한 화면**이 뜬다.
        //    받은 사람은 "광장시장 보라더니 왜 홈이 뜨지?" 하고 닫는다.
        //    오류도 안 나서 티가 안 난다 — 안 찾았으면 몰랐을 사고다.
        //
        // 🔎 `google…​.html` 은 **구글 소유권 확인 파일**이다(2026-09-05에 추가).
        //    이것도 화면 이동으로 잡히면 앱 첫 화면이 대신 나가고, 구글은
        //    "확인 실패"라고 답한다. 확인하러 오는 구글 로봇은 서비스워커가
        //    없으니 사실 상관없지만, **사장님이 브라우저로 직접 열어 볼 때**
        //    앱이 뜨면 "파일이 안 올라갔나?" 하고 헛다리를 짚게 된다.
        //
        // 🐞 **또 났다** (2026-09-08). 묶음 페이지 44장(`/seoul/…`)을 만들면서
        //    여기에 넣는 것을 잊었다. 바로 위에 이렇게 길게 적어 두고도 놓쳤다 —
        //    **진짜 HTML 을 새 폴더에 만들 때마다 여기도 같이 고쳐야 한다.**
        //    손으로 열어 보면 멀쩡하다(앱을 한 번도 안 연 창에서는 진짜 페이지가 뜬다).
        //    브라우저 검사가 잡았다 — 첫 화면을 먼저 열고(서비스워커 설치) 나서
        //    묶음 페이지로 이동하니 앱 첫 화면이 대신 떴다.
        //
        // 🌏 **언어 폴더 11개** (2026-09-09) — 곳 페이지를 12개 언어로 만들면서
        //    `/ja/place/…` 같은 새 폴더가 생겼다. 여기 안 넣으면 위와 똑같은 사고가
        //    **11배로** 난다(앱을 한 번이라도 연 사람에게 일본어 페이지 대신 앱이 뜬다).
        //    한국어(ko)도 넣는다 — 한국에 사는 외국인이 한국어로 검색한다.
        navigateFallbackDenylist: [
          /^\/place\//,
          /^\/seoul$/,
          /^\/seoul\//,
          /^\/(ko|ja|zh|zh-TW|vi|es|fr|de|ru|id|th)\//,
          /^\/sitemap\.xml$/,
          /^\/robots\.txt$/,
          /^\/google[0-9a-f]+\.html$/,
          // 개인정보처리방침 — 구글 플레이가 **주소를 요구한다.** 서비스워커가
          // 앱 껍데기로 바꿔치기하면 심사원이 빈 화면을 본다.
          /^\/privacy\//,
        ],
      },
    }),
  ],
})
