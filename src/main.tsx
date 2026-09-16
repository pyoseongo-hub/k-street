import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/tokens.css'
import './index.css'
import App from './App.tsx'
import { LanguageProvider } from './lib/useLanguage.tsx'
import { CityProvider } from './lib/useCity.tsx'

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
