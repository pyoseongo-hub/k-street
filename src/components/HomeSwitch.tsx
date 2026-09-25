import { useEffect, useRef, useState, type ReactNode } from "react";
import { useLanguage } from "../lib/useLanguage";
import { overlayOpen } from "../lib/useOverlay";

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
// 🌧️ **비 오는 날은 여기 두지 않는다** (2026-09-12). 한때 세 번째 칸으로 넣었다가
//    실제 화면을 보고 사장님이 뒤집으셨다:
//      *"이게 맞다. **비는 어쩌다 오는데** 두 번째 줄은 너무 과하고"*
//
//    맞는 말이다. 이 줄은 **늘 쓰는 두 가지**를 오가는 자리다(계절·동네).
//    한 달에 며칠 쓰는 것에 그 자리의 3분의 1을 영구히 내주면, 평소에
//    **안 쓰는 칸이 계속 눈에 들어온다.** 그래서 비 오는 날은 머리줄 ☂️ 로 갔고
//    (App.tsx), 예보가 있으면 그 단추가 깜박인다 — 자리를 안 먹으면서 눈에 띈다.
export type HomeView = "season" | "district";

interface Props {
  season: ReactNode;
  district: ReactNode;
  /**
   * 🔗 이 숫자가 올라가면 **동네 화면으로 넘어간다** (2026-09-14).
   *
   * 계절 화면 맨 위의 「걸어서 가을 속으로」 칸을 누르면 동네 화면의 단풍길로
   * 가야 한다. 어느 화면을 보여 줄지 쥐고 있는 건 여기라, 밖에서 신호를 받을
   * 구멍이 하나 필요했다.
   *
   * ⚠️ 참/거짓이 아니라 **숫자**인 이유 — 이미 동네 화면에 있을 때 다시 눌러도
   *    먹혀야 한다. 참/거짓이면 "참 → 참"은 안 바뀐 것으로 보여 아무 일도 안 난다.
   */
  showDistrict?: number;
}

/** 손가락을 이만큼 옆으로 끌어야 화면이 바뀐다. */
const SWIPE_MIN = 60;
/** 옆으로 끈 거리가 위아래보다 이만큼 더 커야 '옆으로 민 것'으로 본다. */
const SWIPE_RATIO = 1.5;

export default function HomeSwitch({ season, district, showDistrict = 0 }: Props) {
  const { t } = useLanguage();
  const [view, setView] = useState<HomeView>("season");
  const start = useRef<{ x: number; y: number; ok: boolean } | null>(null);

  // 🔙 **띠를 눌러 건너왔을 때 폰 뒤로가기로 돌아오게 한다** (2026-09-14).
  //
  // 사장님: *"광고 링크 가서 뒤로가기 누르면 꺼져."*
  //
  // 왜 꺼졌나 — 띠를 눌러도 **주소가 안 바뀐다.** 화면만 갈아 끼우니 안드로이드가
  // 보기에 뒤로 갈 곳은 **앱에 들어오기 전 페이지**뿐이다. 손님은 「방금 그 화면으로」
  // 를 눌렀는데 앱이 통째로 꺼진다. 손님이 잘못 누른 게 아니다.
  //
  // ⚠️ **이 사고는 두 번째다.** 2026-09-12에 전체화면(도착 안내·짐보관)에서 똑같이
  //    겪고 lib/useOverlay.ts 로 고쳤다. 거기 주석에 밟으면 안 되는 자리 셋이
  //    적혀 있다 — 같은 방식을 그대로 쓴다.
  //
  //  ① 효과가 다시 돌면 기록이 쌓인다 → 건너올 때 **한 번만** 남긴다(jumped).
  //  ② 단추·밀기로 돌아가면 우리가 남긴 칸을 **도로 빼야** 한다.
  //     안 빼면 다음 뒤로가기가 아무 일도 안 하는 헛발이 된다.
  //  ③ 뒤로가기로 돌아왔을 때는 back() 을 또 부르면 안 된다 — 한 칸 더 나간다.
  //     그래서 ②에서 jumped 를 먼저 내리고 부른다. 그 back() 이 부른 popstate 는
  //     jumped 가 이미 false 라 아래에서 그냥 지나간다.
  const jumped = useRef(false);

  useEffect(() => {
    // 0 은 "아직 안 눌렀다" — 앱을 열자마자 동네로 튀지 않게 한다.
    if (showDistrict <= 0) return;
    setView("district");
    if (jumped.current) return; // 이미 한 칸 남겨 뒀다 (①)
    try {
      window.history.pushState({ ksHomeView: true }, "");
      jumped.current = true;
    } catch {
      // 아주 드물게 막힌 브라우저. 뒤로가기가 예전처럼 굴 뿐 화면은 안 깨진다.
    }
  }, [showDistrict]);

  useEffect(() => {
    const onPop = () => {
      // 🚨 **전체화면이 떠 있으면 이 뒤로가기는 그 화면 몫이다** (2026-09-25).
      //    사장님: *"짐보관에서 뒤로가기하면 꺼짐"*. 짐보관·비 오는 날 같은
      //    전체화면도 열 때 기록을 한 칸 남기는데, popstate 는 전역이라
      //    여기까지 같이 울렸다 — 짐보관만 닫으려던 한 번이 홈 화면까지
      //    되돌리고, 남은 칸 때문에 그다음 한 번이 앱을 껐다.
      //    (자세한 것은 lib/useOverlay.ts 머리말 ④)
      if (overlayOpen()) return;
      if (!jumped.current) return; // 우리가 남긴 칸이 아니다 — 건드리지 않는다
      jumped.current = false;
      setView("season");
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  /** 화면을 바꾼다. 띠로 건너온 상태였다면 남겨 둔 기록을 도로 뺀다 (②③). */
  const goView = (next: HomeView) => {
    if (next !== "district" && jumped.current) {
      jumped.current = false;
      try {
        window.history.back();
      } catch {
        /* 막힌 브라우저 — 화면은 그대로 바뀐다 */
      }
    }
    setView(next);
  };

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
    // 🔙 goView 를 탄다 — 밀어서 돌아올 때도 남겨 둔 기록을 빼야 한다.
    goView(dx < 0 ? "district" : "season");
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
      onClick={() => goView(key)}
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
      </div>

      {/* 둘 다 그려 두고 하나만 보여 준다 — 오갈 때 보던 자리를 잃지 않게. */}
      <div hidden={view !== "season"}>{season}</div>
      <div hidden={view !== "district"}>{district}</div>
    </div>
  );
}
