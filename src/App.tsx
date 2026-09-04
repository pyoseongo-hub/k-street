import { useState } from "react";
import { useTheme } from "./lib/useTheme";
import { useLanguage } from "./lib/useLanguage";
import SavedPanel from "./components/SavedPanel";
import { useSavedEntries } from "./lib/savedPlaces";
import MonthlyFestivalPanel from "./components/MonthlyFestivalPanel";
import DistrictExplorer from "./components/DistrictExplorer";
import LanguageSelector from "./components/LanguageSelector";
import CoverPicker from "./components/CoverPicker";
import HomeSwitch from "./components/HomeSwitch";

function App() {
  const { toggleTheme, getIcon } = useTheme();
  const { t } = useLanguage();
  const [tab, setTab] = useState<"home" | "saved">("home");
  const savedCount = useSavedEntries().length;

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
          //
          // 🔖 홈과 저장한 곳은 **둘 다 그려 두고 한쪽만 감춘다**(hidden).
          //    갈아 끼우면 홈으로 돌아올 때 고른 계절·달·구가 전부 처음으로
          //    돌아가고 스크롤도 맨 위로 튄다 — HomeSwitch가 같은 이유로
          //    같은 방식을 쓴다.
          <>
            <div hidden={tab !== "home"}>
              <HomeSwitch season={<MonthlyFestivalPanel />} district={<DistrictExplorer />} />
            </div>
            <div hidden={tab !== "saved"}>
              <SavedPanel />
            </div>
          </>
        )}
      </main>

      {/* 🔖 아래 탭은 **되는 것만** 둔다 (사용자 결정 2026-09-04: "홈 하고 저장한
          곳만 살릴까"). 예전에는 네 칸 중 셋(캘린더·저장한 곳·설정)이 흐리게
          죽어 있었다 — 손님 눈에는 "아직 안 만든 앱"으로 보인다.
          캘린더·설정은 뺐고, 저장한 곳은 실제로 되게 만들었다(SavedPanel).
          단추는 없애든 되게 하든 둘 중 하나여야 한다. */}
      <nav className="tab-bar">
        <button
          className={"tab" + (tab === "home" ? " active" : "")}
          onClick={() => setTab("home")}
          aria-current={tab === "home" ? "page" : undefined}
        >
          <span className="tab-icon">🏠</span>
          <span>{t.homeTab}</span>
        </button>
        <button
          className={"tab" + (tab === "saved" ? " active" : "")}
          onClick={() => setTab("saved")}
          aria-current={tab === "saved" ? "page" : undefined}
        >
          {/* 저장한 것이 있으면 하트를 채워 둔다 — 탭을 열지 않아도 뭔가 담겨
              있다는 게 보인다. 개수는 적지 않는다: 숫자가 붙으면 "다 봐야 할
              알림"처럼 보이는데, 여기 담긴 건 손님이 스스로 담은 것이다. */}
          <span className="tab-icon">{savedCount > 0 ? "❤️" : "🤍"}</span>
          <span>{t.savedPlacesTab}</span>
        </button>
      </nav>
    </div>
  );
}

export default App;
