import MonthlyFestivalPanel from "./components/MonthlyFestivalPanel";
import DistrictExplorer from "./components/DistrictExplorer";

function App() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <span className="app-eyebrow">K-Street · 뼈대 미리보기</span>
        <h1>서울 동네 축제 · 시장 · 꽃길</h1>
      </header>

      <main className="app-main">
        <MonthlyFestivalPanel />
        <DistrictExplorer />
      </main>

      <nav className="tab-bar">
        <button className="tab active">홈</button>
        <button className="tab" disabled>
          캘린더 전체보기
        </button>
        <button className="tab" disabled>
          저장한 곳
        </button>
        <button className="tab" disabled>
          설정
        </button>
      </nav>
    </div>
  );
}

export default App;
