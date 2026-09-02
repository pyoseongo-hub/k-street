import { useTheme } from "./lib/useTheme";
import { useLanguage } from "./lib/useLanguage";
import MonthlyFestivalPanel from "./components/MonthlyFestivalPanel";
import DistrictExplorer from "./components/DistrictExplorer";
import LanguageSelector from "./components/LanguageSelector";
import CoverPicker from "./components/CoverPicker";
import HomeSwitch from "./components/HomeSwitch";

function App() {
  const { toggleTheme, getIcon } = useTheme();
  const { t } = useLanguage();

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1 className="sr-only">서울 동네 축제 · 시장 · 꽃길 — 외국인 관광객을 위한 서울 동네 안내</h1>
        <div className="app-header-row">
          <div className="app-wordmark">
            <span className="app-mark" aria-hidden="true">K</span>
            <span className="app-wordmark-text">
              <span className="app-name">K-STREET</span>
              <span className="app-tagline">서울의 길을 걷다</span>
            </span>
          </div>
          <div className="app-header-center">
            <LanguageSelector />
          </div>
          <div className="app-header-actions">
            <button className="icon-btn" onClick={toggleTheme} aria-label={t.themeSwitchLabel}>
              {getIcon()}
            </button>
            <button className="icon-btn" disabled aria-label={t.searchLabel}>
              🔍
            </button>
            <button className="icon-btn" disabled aria-label={t.notificationLabel}>
              🔔
            </button>
          </div>
        </div>
      </header>

      <main className="app-main">
        {/* 🖼️ 표지 사진 고르는 임시 화면 — 주소 끝에 ?pick=cover 를 붙이면 열린다.
            작업 세션에서는 관광공사 사진 서버가 막혀 있어 내가 사진을 못 본다.
            폰에서는 보이므로 여기서 번호로 골라 알려 주는 쪽이 빠르다.
            다 고르고 나면 이 분기와 CoverPicker.tsx를 같이 지운다. */}
        {new URLSearchParams(window.location.search).get("pick") === "cover" ? (
          <CoverPicker />
        ) : (
          // 🔀 두 화면을 위아래로 잇지 않고 맨 위 단추로 오간다 — 자료가 늘수록
          //    아래 화면이 멀어지던 문제(HomeSwitch.tsx 주석 참고).
          <HomeSwitch season={<MonthlyFestivalPanel />} district={<DistrictExplorer />} />
        )}
      </main>

      <nav className="tab-bar">
        <button className="tab active">
          <span className="tab-icon">🏠</span>
          <span>{t.homeTab}</span>
        </button>
        <button className="tab" disabled>
          <span className="tab-icon">🗓️</span>
          <span>{t.calendarTab}</span>
        </button>
        <button className="tab" disabled>
          <span className="tab-icon">🤍</span>
          <span>{t.savedPlacesTab}</span>
        </button>
        <button className="tab" disabled>
          <span className="tab-icon">⚙️</span>
          <span>{t.settingsTab}</span>
        </button>
      </nav>
    </div>
  );
}

export default App;
