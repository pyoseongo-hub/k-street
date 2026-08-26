import { useTheme } from "./lib/useTheme";
import { useLanguage } from "./lib/useLanguage";
import MonthlyFestivalPanel from "./components/MonthlyFestivalPanel";
import DistrictExplorer from "./components/DistrictExplorer";
import WeatherStrip from "./components/WeatherStrip";
import LanguageSelector from "./components/LanguageSelector";

function App() {
  const { toggleTheme, getIcon } = useTheme();
  const { t } = useLanguage();

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1 className="sr-only">서울 동네 축제 · 시장 · 꽃길 — 외국인 관광객을 위한 서울 동네 안내</h1>
        <div className="app-header-row">
          <div className="app-wordmark">
            <div>
              <div className="app-name">K-STREET</div>
              <div className="app-tagline">SEOUL FIELD GUIDE</div>
            </div>
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
        <WeatherStrip />
        <MonthlyFestivalPanel />
        <DistrictExplorer />
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
