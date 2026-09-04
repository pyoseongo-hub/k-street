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
        description:
          '서울 동네 축제·전통시장·꽃길·산책로·둘레길·박물관 안내 — 외국인 관광객을 위한 서비스(가제)',
        // Kfood와 같은 계열임을 암시하지 않도록 독립 색·아이콘을 쓴다.
        // 2026-08-25: 다크 엘레강스 테마로 바꾸면서 여기도 같이 맞췄다(src/styles/tokens.css의
        // --bg/--accent와 동일) — 안 맞으면 설치 시 스플래시 화면·주소창 색이 따로 논다.
        theme_color: '#121B19',
        background_color: '#121B19',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        lang: 'ko',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // 정적 자산만 캐시한다 — 실제 콘텐츠(seed.ts 데이터)는 매 빌드마다 파일 자체가
        // 바뀌므로 별도 캐시 무효화 로직 없이도 최신판이 자연히 받아진다.
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
      },
    }),
  ],
})
