import MonthlyFestivalPanel from "./components/MonthlyFestivalPanel";
import DistrictExplorer from "./components/DistrictExplorer";

function App() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-wordmark">
          <span className="app-logo">🌸</span>
          <span className="app-name">K-Street</span>
        </div>
        <h1>서울 동네 축제 · 시장 · 꽃길</h1>
        <p className="app-tagline">외국인 관광객을 위한 서울 동네 안내</p>
      </header>

      <main className="app-main">
        <MonthlyFestivalPanel />
        <DistrictExplorer />
      </main>

      <nav className="tab-bar">
        <button className="tab active">
          <span className="tab-icon">🏠</span>
          <span>홈</span>
        </button>
        <button className="tab" disabled>
          <span className="tab-icon">🗓️</span>
          <span>캘린더</span>
        </button>
        <button className="tab" disabled>
          <span className="tab-icon">🤍</span>
          <span>저장한 곳</span>
        </button>
        <button className="tab" disabled>
          <span className="tab-icon">⚙️</span>
          <span>설정</span>
        </button>
      </nav>
    </div>
  );
}

export default App;
