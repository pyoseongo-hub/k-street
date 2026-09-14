import { useLanguage } from "../lib/useLanguage";
import { roadsForSeason } from "../data/seasonRoads";
import type { SeasonKey } from "../lib/season";

// 🍁 **이 계절의 테마 한 칸** — 계절 화면 맨 위, 광고 자리처럼.
//
// 사장님 (2026-09-14):
//   *"테마 페이지에는 광고처럼 맨 윗칸에 계절에 맞춰서. 예를 들어 가을이니
//     「걸어서 가을 속으로 — 서울의 단풍」 이런 식으로. 사진 걸고 테마 광고
//     사진 띄우고 클릭하면 동네 섹션 가을단풍으로 넘어가게."*
//
// ── 앞판이 왜 틀렸나 ────────────────────────────────────────────────────
// 처음엔 여기에 **길 107개를 글로 죽 늘어놨다.** 사장님이 바로 짚으셨다:
//   *"저렇게 텍스트로 놔두면 어떻게 찾아가."*
// 맞는 말이다. 목록은 "여기 있다"까지만 하고 "어떻게 가나"를 안 풀어 준다.
// 길찾기·저장·공유는 전부 **동네 화면의 장소 카드**에 이미 붙어 있다.
// 그러니 여기서 할 일은 목록을 또 만드는 게 아니라 **거기로 보내는 것**이다.
//
// 그래서 이 칸은 한 장이다 — 사진 · 한 줄 · 곳 수. 누르면 넘어간다.

/**
 * 📷 이 칸의 사진.
 *
 * 🧨 **표지와 같은 사진을 쓰면 안 된다** (2026-09-14 사장님: *"위 아래 사진이 같아"*).
 *    처음에 가을을 덕수궁(2643911)으로 뒀는데, 그게 **가을 표지와 같은 사진**이었다.
 *    한 화면에 같은 사진이 위아래로 두 번 떴다. 고를 때 cover-photos.json 을
 *    안 봐서 생긴 일이다. 여기 사진을 바꿀 때는 **표지와 겹치는지 먼저 본다.**
 *
 * 🧨 **주소를 손으로 조립하지 않는다.** 봄 사진을 `…/2976749.jpg` 로 적었다가
 *    실제는 **`.JPG` 대문자**였다. 틀려도 회색 상자만 남아 눈으로는 못 잡는다.
 *
 * 🏛️ 관광공사 사진은 공공누리 제1유형이라 **출처 표시가 쓰는 조건**이다.
 *    그래서 credit 을 카드 안에 띄운다 — 지우지 말 것.
 *    다만 **우리 사진에는 그 출처를 붙이면 안 된다.** 틀린 출처를 붙이는 건
 *    출처를 안 붙이는 것보다 나쁘다.
 */
const ART: Record<
  "spring" | "autumn",
  { photo: string; credit?: string; ai?: boolean }
> = {
  autumn: {
    // 🍁 사장님이 직접 만드신 그림 (2026-09-14, "에이아이 제작이야").
    //    세로 사진이라 배너 비율(2.2:1)로 미리 잘라 뒀다 — 브라우저에 맡기면
    //    한가운데를 집어서 해가 잘려 나간다.
    photo: `${import.meta.env.BASE_URL}images/theme-autumn.jpg`,
    ai: true,
  },
  spring: {
    // 덕수궁 벚꽃 — 봄 표지로 이미 쓰고 있는 사진. 확장자가 **대문자 .JPG** 다.
    // ⚠️ 봄 표지와 같은 사진이다. 봄 배너를 손볼 때 다른 것으로 바꿀 것.
    photo: "https://tong.visitkorea.or.kr/cms2/website/49/2976749.JPG",
    credit: "한국관광공사",
  },
};

interface Props {
  season: SeasonKey;
  /** 누르면 동네 화면의 그 갈래로 보낸다. */
  onGo: () => void;
}

export default function SeasonThemeBanner({ season, onGo }: Props) {
  const { t } = useLanguage();

  // 여름·겨울에는 자료가 없다. **없는 걸 지어내지 않는다** — 칸을 통째로 안 그린다.
  const roads = roadsForSeason(season);
  if (roads.length === 0) return null;
  const key = season as "spring" | "autumn";
  const art = ART[key];

  return (
    <button type="button" className={`season-theme season-theme-${key}`} onClick={onGo}>
      <span
        className="season-theme-art"
        style={{ backgroundImage: `url(${art.photo})` }}
        aria-hidden="true"
      />
      <span className="season-theme-body">
        <span className="season-theme-eyebrow">
          {key === "spring" ? t.seasonRoadsSpring : t.seasonRoadsAutumn}
        </span>
        <strong className="season-theme-title">
          {key === "spring" ? t.seasonThemeSpringLine : t.seasonThemeAutumnLine}
        </strong>
        <span className="season-theme-meta">
          {t.seasonRoadsCount(roads.length)} · {t.seasonThemeGo}
        </span>
      </span>
      {/* 🏛️ 관광공사 사진이면 출처를 띄운다 — 공공누리는 그게 쓰는 조건이다.
          🤖 우리가 만든 그림이면 대신 **AI 로 만든 그림임을 밝힌다.**
             이 앱이 파는 것은 "진짜"다. 진짜 장소를 모아 놓고 첫 화면 그림만
             AI 인 채로 말을 안 하면, 나중에 알려졌을 때 나머지까지 의심받는다.
             딱지 하나가 그걸 막는다. */}
      {(art.credit || art.ai) && (
        <span className="season-theme-credit">{art.credit ?? "AI"}</span>
      )}
    </button>
  );
}
