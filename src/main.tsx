import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/tokens.css'
import './index.css'
import App from './App.tsx'
import { LanguageProvider } from './lib/useLanguage.tsx'
import { CityProvider } from './lib/useCity.tsx'
// 🔄 새 판이 올라갔는데 앱이 어제 화면을 보여 주던 문제. 왜·어떻게는 그 파일 머리말에.
import { watchForNewVersion } from './lib/swUpdate'

watchForNewVersion()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider>
      {/* 🏙️ 「지금 보고 있는 도시」. 지금은 서울뿐이라 값이 안 바뀐다 —
          미리 둔 이유는 useCity.tsx 머리말에 있다. */}
      <CityProvider>
        <App />
      </CityProvider>
    </LanguageProvider>
  </StrictMode>,
)
