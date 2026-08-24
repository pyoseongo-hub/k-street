import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// base: GitHub Pages가 https://<계정>.github.io/k-street/ 하위 경로로 서빙하므로 필요하다.
// 커스텀 도메인을 연결하면 '/'로 되돌려야 한다.
export default defineConfig({
  base: '/k-street/',
  plugins: [react()],
})
