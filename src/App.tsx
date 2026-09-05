import { useState } from "react";
import { useTheme } from "./lib/useTheme";
import { useLanguage } from "./lib/useLanguage";
import SavedPanel from "./components/SavedPanel";
import InstallHint from "./components/InstallHint";
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
            {/* 💚 「평생 무료 · 가입 없음」은 **여기 있다가 아래로 내렸다**
                (2026-09-05 사장님: "대표 이름 있는데 평생 무료 이런 것도 별로야 /
                설명에 넣어").

                왜 맞는 지적인가 — 이름 바로 아래는 **이 앱이 무엇인지** 한 줄로
                말하는 자리다(「서울의 길을 걷다」). 거기에 값 이야기를 포개면
                이름 덩어리가 세 줄이 되어 대표 이름이 묻힌다. 게다가 로마자·
                태국어는 한글보다 길어 좁은 폰에서 잘려 나가고 있었다.

                말 자체는 그대로 지킨다 — 여행 앱은 대부분 열자마자 가입을
                요구하므로 "무료 · 가입 없음"은 기능 자랑이 아니라 **안심 신호**다
                (CLAUDE.md 맨 위 항목). 다만 **간판이 아니라 설명으로** 읽히면
                되므로 화면 맨 아래 소개 줄로 옮겼다(아래 .app-note). */}
            </span>
          </div>
          <div className="app-header-center">
            <LanguageSelector />
          </div>
          <div className="app-header-actions">
            <button className="icon-btn" onClick={toggleTheme} aria-label={t.themeSwitchLabel}>
              {getIcon()}
            </button>
            {/* 🔍 검색 · 🔔 알림은 **감췄다** (2026-09-05 사장님 결정: "죽은 단추만
                감추기"). 홍보를 시작하면 처음 오는 손님이 늘어나는데, 눌리지 않는
                단추가 둘이나 보이면 **앱 전체가 미완성으로 읽힌다.**
                아래 탭바에서 캘린더·설정을 뺀 것과 같은 판단이다
                (2026-09-04 "홈 하고 저장한 곳만 살릴까") — 단추는 없애든 되게
                하든 둘 중 하나여야 한다.

                🗓️ 진짜로 만들 때 여기에 되돌린다. 문구(t.searchLabel ·
                   t.notificationLabel)는 12개 언어에 그대로 남겨 뒀다 —
                   지우면 그때 12개를 다시 번역해야 한다. */}
          </div>
        </div>
      </header>

      <main className="app-main">
        {/* 📲 홈 화면에 추가하면 앱처럼 열리고 인터넷 없이도 열린다 — 손님은
            그걸 모른다. 설치할 수 있는 브라우저에서만, 한 번만 뜬다. */}
        <InstallHint />
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
            {/* 💚 소개 한 줄 — 이름 아래에 있던 「평생 무료 · 가입 없음」이 여기로
                내려왔다(위 헤더 주석 참고). 목록을 다 본 뒤 마지막으로 읽는 자리라
                간판처럼 튀지 않고, 자리가 넉넉해 로마자·태국어도 안 잘린다.
                두 탭 밖에 두어 홈에서든 저장한 곳에서든 늘 끝에 붙는다. */}
            <p className="app-note">{t.freeNoSignup}</p>
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
