import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
// base: GitHub Pages가 https://<계정>.github.io/k-street/ 하위 경로로 서빙하므로 필요하다.
// 커스텀 도메인을 연결하면 '/'로 되돌려야 한다.
export default defineConfig({
  base: '/k-street/',
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
        theme_color: '#2E6F63',
        background_color: '#F3F4EF',
        display: 'standalone',
        start_url: '/k-street/',
        scope: '/k-street/',
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
