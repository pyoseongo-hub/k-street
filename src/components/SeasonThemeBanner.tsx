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
 * 📷 관광공사 관광사진 갤러리(공공누리 제1유형).
 *    출처 표시가 **쓰는 조건**이라 카드 안에 항상 함께 띄운다 — 지우지 말 것.
 *
 * 🧨 **주소를 손으로 조립하지 않는다.** 봄 사진을 `…/2976749.jpg` 로 적었다가
 *    실제로는 **`.JPG` 대문자**인 걸 뒤늦게 봤다(2026-09-14). 틀려도 회색 상자만
 *    남아서 **눈으로는 못 잡는다** — cover-photos.json 과 대조해서야 알았다.
 *    그래서 아래 둘은 **이미 앱이 쓰고 있어 뜨는 게 확인된 주소**를 그대로 옮겼다.
 */
const ART: Record<"spring" | "autumn", { photo: string; credit: string }> = {
  autumn: {
    // 덕수궁 단풍 — 가을 표지로 이미 쓰고 있는 사진(cover-photos.json).
    photo: "https://tong.visitkorea.or.kr/cms2/website/11/2643911.jpg",
    credit: "한국관광공사",
  },
  spring: {
    // 덕수궁 벚꽃 — 봄 표지로 이미 쓰고 있는 사진. 확장자가 **대문자 .JPG** 다.
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
      {/* 🏛️ 공공누리는 **출처 표시가 쓰는 조건**이다. 지우지 말 것. */}
      <span className="season-theme-credit">{art.credit}</span>
    </button>
  );
}
