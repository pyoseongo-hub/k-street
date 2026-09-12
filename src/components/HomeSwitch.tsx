import { useRef, useState, type ReactNode } from "react";
import { useLanguage } from "../lib/useLanguage";
import { useSeoulWeather } from "../lib/weather";
import { rainyPlaces } from "../lib/rainyPlaces";

// 🔀 화면 두 개를 **위아래로 쌓지 않고 좌우로 나눈다** (사용자 지시 2026-09-02:
// "자료가 많아지면서 이 페이지가 너무 아래인데 맨 위로 가면서 화면 스위치 스왑?
//  할 방법이나 아이디어 없나").
//
// 무엇이 문제였나 — 「계절」 화면과 「동네」 화면이 한 줄로 이어 붙어 있었다.
// 축제가 늘수록 위 화면이 길어져서, 동네 지도를 보려면 손가락으로 한참 내려야
// 했다. 자료를 채울수록 아래 화면이 더 멀어지는 구조라, 잘될수록 나빠진다.
//
// 그래서 둘을 **나란한 두 장**으로 놓고 맨 위 단추로 오간다. 어느 화면이든
// 첫 줄부터 시작한다.
//
// 왜 이 모양인가 (다른 앱 조사, 2026-09-02) — 인스타그램·트위터·에어비앤비가
// 전부 같은 방식이다: **위쪽에 붙어 있는 갈래 줄 + 좌우로 밀기.** 아래쪽 탭바는
// 앱 전체의 큰 갈래(홈·저장 등)에 쓰고, 한 화면 안의 갈래는 위에 둔다.
// 우리 탭바는 이미 홈·캘린더·저장·설정이 차지하고 있으니 규칙이 맞아떨어진다.
//
// ⚠️ 두 화면을 **둘 다 그려 두고 숨긴다**(display:none이 아니라 hidden 속성).
//    갈아 끼우면 스크롤 위치와 고른 갈래·달이 매번 처음으로 돌아가서, 오갈 때마다
//    하던 일이 날아간다. 숨겨 두면 돌아왔을 때 보던 자리에 그대로 있다.
// 🌧️ **세 번째 칸을 들였다** (2026-09-12). 사장님이 화면을 찍어 이 줄에 빨간 줄을
//    그으시며: *"자리는 충분해. **첫 번째 칸 넣고** 비 오면 안내문구 뜨든지,
//    둘째 줄에 넣든지"*
//
//    내가 먼저 낸 안은 ⓐ 비 올 때만 띠에 띄우기 ⓑ 머리줄에 ☂️ 단추 더하기였는데
//    **둘 다 이보다 못하다**:
//      · ⓐ 는 **예보가 틀린 날 기능이 사라진다.** *"날씨는 기상청도 못 맞춰"*
//      · ⓑ 는 머리줄 단추를 넷으로 만든다 — 좁은 폰에서 줄이 갈라진 자리다
//    비 오는 날은 계절·동네와 **같은 급의 보는 방식**이다. 딸린 기능이 아니다.
//
// 🚨 그래서 **날씨는 「있느냐」를 정하지 않는다. 「얼마나 눈에 띄느냐」만 정한다.**
//    칸은 늘 있고, 비 예보가 있을 때만 아래에 안내문구 한 줄이 뜬다.
export type HomeView = "season" | "district" | "rainy";

/** 왼쪽 → 오른쪽 순서. 옆으로 미는 것이 이 순서를 따른다. */
const ORDER: HomeView[] = ["season", "district", "rainy"];

interface Props {
  season: ReactNode;
  district: ReactNode;
  rainy: ReactNode;
}

/** 손가락을 이만큼 옆으로 끌어야 화면이 바뀐다. */
const SWIPE_MIN = 60;
/** 옆으로 끈 거리가 위아래보다 이만큼 더 커야 '옆으로 민 것'으로 본다. */
const SWIPE_RATIO = 1.5;

export default function HomeSwitch({ season, district, rainy }: Props) {
  const { t } = useLanguage();
  const [view, setView] = useState<HomeView>("season");
  const start = useRef<{ x: number; y: number; ok: boolean } | null>(null);
  // ☔ 안내문구를 띄울지만 정한다. 칸 자체는 날씨와 무관하게 늘 있다.
  const { weather } = useSeoulWeather();
  const { total } = rainyPlaces();

  function onTouchStart(e: React.TouchEvent) {
    // 옆으로 스스로 굴러가는 줄(갈래 칩·달 띠·육각 지도) 위에서는 밀기를 잡지 않는다.
    // 안 그러면 칩을 넘기려던 손가락이 화면을 통째로 바꿔 버린다.
    const inScroller = (e.target as HTMLElement).closest(
      ".category-chip-row, .month-strip, .theme-row, .district-hexgrid"
    );
    const p = e.touches[0];
    start.current = { x: p.clientX, y: p.clientY, ok: !inScroller };
  }

  function onTouchEnd(e: React.TouchEvent) {
    const s = start.current;
    start.current = null;
    if (!s || !s.ok) return;
    const p = e.changedTouches[0];
    const dx = p.clientX - s.x;
    const dy = p.clientY - s.y;
    if (Math.abs(dx) < SWIPE_MIN) return;
    if (Math.abs(dx) < Math.abs(dy) * SWIPE_RATIO) return; // 위아래로 읽던 중이다
    // 🐞 예전에는 `dx < 0 ? "district" : "season"` 이었다 — **칸이 둘일 때만 맞는 식**이다.
    //    셋이 된 뒤로는 한 칸씩 옮겨야 한다. 안 고치면 「비 오는 날」에서 왼쪽으로
    //    밀 때 계절로 건너뛰어, 동네 화면을 밀기로는 영원히 못 만난다.
    const i = ORDER.indexOf(view);
    const next = ORDER[Math.min(ORDER.length - 1, Math.max(0, i + (dx < 0 ? 1 : -1)))];
    setView(next);
  }

  // 🚫 **그림 딱지를 뺐다** (2026-09-05 사장님: "아이콘 몬지 모르겠어 /
  //    확실히 알수있게 넣거나 / 가독성 좋게 텍스트 키우거나").
  //
  //    「계절」에 🍂, 「동네」에 🗺️ 를 달아 뒀는데 **사장님이 무슨 뜻인지 못 읽었다.**
  //    만든 사람이 못 읽으면 손님은 더 못 읽는다.
  //
  //    ⚠️ 🍂 는 애초에 틀린 그림이었다 — **가을 잎 하나**로 봄·여름·가을·겨울을 다
  //       담는 탭을 가리키고 있었다. 지금이 9월이라 우연히 맞아 보였을 뿐이다.
  //       🗺️ 도 '지도'지 '동네'가 아니다.
  //
  //    그리고 **12개 언어에 두루 통하는 그림이 애초에 없다.** 계절도 동네도 나라마다
  //    떠올리는 그림이 다르다. 글자는 이미 그 나라 말로 번역돼 있으니, 그림을 더
  //    고민하는 것보다 **글자를 키우는 쪽이 확실하다**(index.css의 .home-tab).
  //    딱지가 먹던 자리도 글자에 돌아가 태국어처럼 긴 이름이 덜 잘린다.
  const tab = (key: HomeView, label: string) => (
    <button
      type="button"
      className={"home-tab" + (view === key ? " active" : "")}
      aria-current={view === key ? "page" : undefined}
      onClick={() => setView(key)}
    >
      {label}
    </button>
  );

  return (
    <div className="home-switch" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      {/* 📌 화면 맨 위에 붙여 둔다 — 어디까지 내려갔든 한 번에 반대쪽으로 갈 수 있다.
          이 줄 하나만 붙이므로 자리를 많이 안 먹는다(예전에 고르는 것 전체를 붙여
          뒀다가 폰 화면 절반을 먹은 적이 있다 — DistrictExplorer 주석 참고). */}
      <div className="home-tabs" role="tablist">
        {tab("season", t.viewSeason)}
        {tab("district", t.viewDistrict)}
        {tab("rainy", t.viewRainy)}
      </div>

      {/* ☔ **비 예보가 있을 때만** 뜨는 한 줄. 사장님: "비 오면 안내문구 뜨든지".
          🚨 지금 오는 비(사실)와 오늘 예보(예보)를 **갈라서** 적는다 —
             안 왔을 때 우리가 틀린 말을 한 것이 되지 않게(weather.ts 주석 참고).
          이미 「비 오는 날」을 보고 있으면 안 띄운다 — 같은 말을 두 번 하는 셈이다. */}
      {weather?.rainToday && view !== "rainy" && (
        <button type="button" className="rain-hint" onClick={() => setView("rainy")}>
          <span aria-hidden="true">☔</span>
          <span className="rain-hint-tx">
            <strong>{weather.rainingNow ? t.rainyNow : t.rainyForecast}</strong>
            <span>{t.rainyCta(total)}</span>
          </span>
          <span className="rain-hint-go" aria-hidden="true">→</span>
        </button>
      )}

      {/* 둘 다 그려 두고 하나만 보여 준다 — 오갈 때 보던 자리를 잃지 않게. */}
      <div hidden={view !== "season"}>{season}</div>
      <div hidden={view !== "district"}>{district}</div>
      <div hidden={view !== "rainy"}>{rainy}</div>
    </div>
  );
}
