import { useEffect, useState } from "react";
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
import ShareApp from "./components/ShareApp";
import ArrivalGuide, { arrivalLabel } from "./components/ArrivalGuide";
import RainyPanel from "./components/RainyPanel";
import WeatherCard from "./components/WeatherCard";
import VideoCard from "./components/VideoCard";
import { useSeoulWeather } from "./lib/weather";

function App() {
  const { toggleTheme, getIcon } = useTheme();
  const { t, language } = useLanguage();
  const [tab, setTab] = useState<"home" | "saved">("home");
  // ✈️ 도착 안내 (2026-09-12 사장님: "여기도 푸드에 있는 가이드가 필요할거같아").
  const [guideOpen, setGuideOpen] = useState(false);
  // ☔ 비 오는 날 (2026-09-12). 단추는 **늘** 있고, 예보가 있으면 **깜박인다** —
  //    사장님: "비는 어쩌다 오는데 두 번째 줄은 너무 과하고 / 예보 뜨면 깜박거리게"
  const [rainyOpen, setRainyOpen] = useState(false);
  const { weather } = useSeoulWeather();
  /**
   * ☔ **화면을 켤 때마다 다시 깜박이게 하는 셈** (2026-09-12 사장님: "화면 키면 이십초 점멸").
   *
   * 🚨 CSS 애니메이션은 **붙을 때 한 번만** 돈다. 그래서 그전에는 앱을 처음 열 때만
   *    깜박이고, 폰을 잠갔다 다시 켜거나 다른 앱 갔다 돌아오면 **다시 안 돌았다** —
   *    손님이 앱을 열어 둔 채 지하철을 타고 나오면 그때는 아무 표시가 없었다.
   *    이 숫자를 올려 단추를 다시 그리게 하면 애니메이션이 처음부터 돈다.
   *
   * ⚠️ `focus` 가 아니라 `visibilitychange` 를 듣는다. focus 는 화면 안에서
   *    여기저기 누를 때도 튀어서 **깜박임이 멈추지 않는다.**
   */
  const [blinkRun, setBlinkRun] = useState(0);
  useEffect(() => {
    const onShow = () => {
      if (document.visibilityState === "visible") setBlinkRun((n) => n + 1);
    };
    document.addEventListener("visibilitychange", onShow);
    return () => document.removeEventListener("visibilitychange", onShow);
  }, []);
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
            {/* ✈️ 갓 내린 손님이 바로 알아보도록 머리줄에 둔다.
                ⚠️ **라벨을 한 단어로 유지할 것.** 머리줄 한 줄에 이름·언어·이 단추·
                   테마가 같이 들어가는데, 길어지면 줄이 갈라져 이름만 위에 남는다
                   (Kfood 에서 실제로 그랬다). 「안내」라는 뜻은 ✈️ 가 이미 전한다. */}
            {/* ☔ **늘 있다.** 날씨는 「있느냐」를 정하지 않고 「눈에 띄느냐」만 정한다.
                예보가 있으면 `blink` 가 붙어 잠깐 깜박이고, 그 뒤에도 테두리가 남는다
                (index.css — 계속 깜박이면 아무도 안 본다).
                🚨 깜박임은 **눈에 보이는 것뿐**이다. 무엇인지는 aria-label 이 말해 준다 —
                   색·움직임만으로 뜻을 전하면 화면을 읽어 주는 손님은 못 받는다. */}
            <button
              /* 🔁 이 열쇠가 바뀌면 단추를 다시 그린다 → 깜박임이 처음부터 돈다.
                 화면을 켤 때마다 20초 깜박이는 것이 이 한 줄로 된다. */
              key={`rainy-${blinkRun}`}
              className={"icon-btn rainy-btn" + (weather?.rainToday ? " blink" : "")}
              onClick={() => setRainyOpen(true)}
              aria-label={`${t.rainyH1}${weather?.rainToday ? ` — ${weather.rainingNow ? t.rainyNow : t.rainyForecast}` : ""}`}
            >
              ☂️
            </button>
            <button
              className="icon-btn arrival-btn"
              onClick={() => setGuideOpen(true)}
              aria-label={arrivalLabel(language)}
            >
              ✈️
            </button>
            <button className="icon-btn" onClick={toggleTheme} aria-label={t.themeSwitchLabel}>
              {getIcon()}
            </button>
            {/* 🔗 앱을 통째로 보내는 단추 — **화면 맨 아래에 있던 것을 여기로 옮겼다**
                (2026-09-12 사장님: "통 공유 다크모드 옆 맨 위 오른쪽 공유 아이콘
                만들어서 옮겨 줘"). 왜 아래가 아니라 여기인지, 낱말을 잃는 대가를
                무엇으로 받쳤는지는 ShareApp.tsx 머리말에 적었다.
                ⚠️ 이 단추로 머리줄 그림이 **넷**이 됐다. 좁은 폰에서 줄이 갈라지지
                   않는지는 **재서 확인했다**(index.css 의 .app-header-actions 주석). */}
            <ShareApp />
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
        {/* 🗂️ **머리줄 아래 한 줄 — 왼쪽 영상 · 오른쪽 날씨, 반반.**
            사장님 (2026-09-13): *"복잡하게 하지 말고 체크 지우고 **날씨 설명이랑
            반반 써서 항시 배치**로"*

            ⏪ 오늘 이 자리가 **세 번** 바뀌었다. 되돌리지 않게 다 적는다:
              ① 비 오는 날에만 뜨는 한 줄 띠 → 비 안 오는 날 칸이 비어 화면이 들썩였다
              ② 영상·날씨를 **위아래 두 줄**로 → 자리를 두 줄이나 먹었다
              ③ **지금: 한 줄에 반반, 늘 있다** — 자리는 고정이고 안에 드는 말만 바뀐다

            🔑 **자리가 고정이면 손님이 다시 안 찾는다.** 있다 없다 하는 칸은
               볼 때마다 화면이 다르게 생겨서, 아래 것들이 위아래로 밀린다.
            📌 한쪽이 없으면(영상 주소가 없는 언어, 날씨를 못 받은 때)
               **남은 하나가 줄 전체를 쓴다** — index.css 의 flex: 1 이 맡는다. */}
        <div className="top-cards">
          {/* ▶️ 유튜브 사용법 영상 — 그 언어의 주소가 있을 때만 뜬다(VideoCard.tsx) */}
          <VideoCard />
          {/* 🌤️ 날씨 — **늘 있다.** 비 오는 날엔 안에 드는 말과 색이 바뀐다.
              누르면 「비 와도 갈 곳」이 열린다(WeatherCard.tsx 머리말). */}
          <WeatherCard onOpen={() => setRainyOpen(true)} />
        </div>
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
            {/* 🔗 앱 공유 단추가 **여기 있었다.** 2026-09-12 에 머리줄 맨 오른쪽으로
                올렸다(위 헤더 참고) — 자료가 늘면서 이 자리를 아무도 못 봤다.
                되돌리지 말 것. 이유는 ShareApp.tsx 머리말에 다 적었다. */}
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

      {/* ✈️ 전체화면. 열렸을 때만 그린다 — 12개 언어 × 9칸짜리 자료라
          안 열어 보는 손님에게까지 그려 둘 이유가 없다. */}
      {guideOpen && <ArrivalGuide onClose={() => setGuideOpen(false)} />}
      {rainyOpen && <RainyPanel onClose={() => setRainyOpen(false)} />}
    </div>
  );
}

export default App;
